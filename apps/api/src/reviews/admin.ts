/** Admin moderation (REV-03), report investigation and resolution (REV-06), provider care record (REV-04). */
import { and, desc, eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { Clock } from '@petcare/shared/clock';
import type { CarePlan } from '@petcare/shared/pets';
import { recordAdminAction } from '../auth/audit.ts';
import type { Authenticator } from '../auth/guards.ts';
import { exclusive } from '../bookings/lock.ts';
import { transitionBooking } from '../bookings/transitions.ts';
import type { Database } from '../db/client.ts';
import {
  bookings,
  dailyUpdates,
  providers,
  reports,
  reviews,
  updatePhotos,
} from '../db/schema/index.ts';
import type { PayoutService } from '../payouts/payout-service.ts';
import { listCareHistory } from '../pets/care-history.ts';
import { buildCareSummary } from '../pets/care-summary.ts';
import { changeStatusForAction } from './provider-action.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

export const REMOVAL_REASONS = ['abuse', 'off_topic', 'contact_details'] as const;
const rationale = z.string().trim().min(3).max(1000);

export function registerReviewAdminRoutes(
  app: FastifyInstance,
  deps: {
    db: Database;
    authn: Authenticator;
    clock: Clock;
    payouts: () => PayoutService | undefined;
  },
) {
  const { db, authn, clock, payouts } = deps;
  const admin = { preHandler: authn.requireRole('admin') };
  const provider = { preHandler: authn.requireRole('provider') };

  // ---- moderation
  app.get('/admin/reviews', admin, async () => {
    const rows = await db
      .select({ r: reviews, p: providers })
      .from(reviews)
      .innerJoin(providers, eq(reviews.providerId, providers.id))
      .orderBy(desc(reviews.createdAt))
      .limit(100);
    return {
      reviews: rows.map(({ r, p }) => ({
        id: r.id,
        bookingId: r.bookingId,
        provider: p.nameEn,
        rating: r.rating,
        text: r.text,
        photos: r.photoIds.length,
        status: r.status,
        removedReason: r.removedReason,
        // SM-C3: a critical review is not removed for being negative.
        negativeReminder: r.rating <= 3,
        createdAt: r.createdAt,
      })),
    };
  });

  app.post('/admin/reviews/:id/remove', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = z
      .strictObject({
        reason: z.enum(REMOVAL_REASONS),
        note: z.string().trim().max(500).default(''),
      })
      .parse(request.body);
    const adminId = request.currentUser!.id;
    const [review] = await db
      .update(reviews)
      .set({
        status: 'removed',
        removedReason: input.reason,
        removedBy: `admin:${adminId}`,
        removedAt: clock.now(),
      })
      .where(and(eq(reviews.id, id), eq(reviews.status, 'published')))
      .returning();
    if (!review) return refuse(reply, 404, 'review_not_found', 'No published review with this id');
    await recordAdminAction(db, {
      adminId,
      action: 'review.removed',
      reasonCode: input.reason,
      targetType: 'review',
      targetId: id,
      payload: { bookingId: review.bookingId, rating: review.rating, note: input.note },
    });
    return { review: { id, status: 'removed', reason: input.reason } };
  });

  // ---- care record
  app.get('/provider/care-record', provider, async (request, reply) => {
    const [mine] = await db
      .select()
      .from(providers)
      .where(eq(providers.userId, request.currentUser!.id));
    if (!mine)
      return refuse(reply, 404, 'no_provider_record', 'No provider record for this account');
    const rows = await db
      .select({ b: bookings })
      .from(bookings)
      .innerJoin(reviews, eq(reviews.bookingId, bookings.id))
      .where(and(eq(bookings.providerId, mine.id), eq(reviews.status, 'published')));
    const counts = { diabetic: 0, senior: 0, medication: 0, anxious: 0, extraAttention: 0 };
    for (const { b } of rows) {
      const plan = b.carePlan as CarePlan;
      if (plan.conditions?.some((c) => /diabet/i.test(c.name))) counts.diabetic++;
      if (plan.senior) counts.senior++;
      if (plan.medications?.length > 0) counts.medication++;
      if (plan.anxiety) counts.anxious++;
      if (plan.extraAttention) counts.extraAttention++;
    }
    return { stays: rows.length, counts };
  });

  // ---- reports
  app.get('/admin/reports/:id', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    if (!report) return refuse(reply, 404, 'report_not_found', 'No such report');
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, report.bookingId));
    const [prov] = booking
      ? await db.select().from(providers).where(eq(providers.id, booking.providerId))
      : [];
    const summary = booking && prov ? await buildCareSummary(db, prov.id, booking.petId) : null;
    const updates = await db
      .select()
      .from(dailyUpdates)
      .where(eq(dailyUpdates.bookingId, report.bookingId))
      .orderBy(desc(dailyUpdates.createdAt));
    const photos = updates.length ? await db.select().from(updatePhotos) : [];
    const [review] = await db.select().from(reviews).where(eq(reviews.bookingId, report.bookingId));
    return {
      report: {
        id: report.id,
        status: report.status,
        category: report.category,
        description: report.description,
        photoIds: report.photoIds,
        resolution: report.resolution,
        createdAt: report.createdAt,
      },
      booking: booking && {
        id: booking.id,
        state: booking.state,
        startDate: booking.startDate,
        endDate: booking.endDate,
        nights: booking.nights,
        totalPoisha: booking.totalPoisha,
        pet: booking.petSnapshot,
        carePlan: booking.carePlan,
        instructions: booking.instructions,
        providerId: booking.providerId,
        ownerId: booking.ownerId,
      },
      provider: prov && { id: prov.id, name: prov.nameEn, tier: prov.tier, status: prov.status },
      careHistory: booking ? await listCareHistory(db, booking.petId) : [],
      declinePatterns: summary?.history.declinePatterns ?? [],
      updates: updates.map((u) => ({
        id: u.id,
        at: u.createdAt,
        note: u.note,
        careLog: u.careLog,
        photos: photos.filter((p) => p.updateId === u.id).length,
      })),
      review: review ? { rating: review.rating, text: review.text, status: review.status } : null,
      chat: 'deferred',
    };
  });

  app.post('/admin/reports/:id/resolve', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = z
      .strictObject({
        refundPoisha: z.number().int().positive().optional(),
        providerAction: z.enum(['warning', 'suspension', 'removal']).optional(),
        rationale,
      })
      .parse(request.body);
    const adminId = request.currentUser!.id;
    const actor = `admin:${adminId}`;
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    if (!report) return refuse(reply, 404, 'report_not_found', 'No such report');
    if (report.status === 'resolved')
      return refuse(reply, 409, 'already_resolved', 'This report is already resolved');
    const bookingId = report.bookingId;

    return exclusive(`report:${id}`, async () => {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
      if (!booking || booking.state !== 'disputed')
        return refuse(reply, 409, 'wrong_state', 'The booking is not in dispute');
      const service = payouts();
      let outcome: 'resolved' | 'refunded' = 'resolved';
      if (input.refundPoisha) {
        if (!service) return refuse(reply, 503, 'payouts_unavailable', 'Payouts are not available');
        const refunded = await service.refund(
          bookingId,
          input.refundPoisha,
          input.rationale,
          adminId,
        );
        if (!refunded.ok)
          return refuse(
            reply,
            refunded.reason === 'exceeds_captured' ? 422 : 409,
            refunded.reason,
            'The refund could not be made',
          );
        outcome = 'refunded';
      } else {
        await service?.releaseFreeze(bookingId, actor);
        await transitionBooking(db, clock, {
          bookingId,
          to: 'resolved',
          trigger: 'admin_action',
          actor,
          expectedFrom: 'disputed',
        });
      }
      let action: string | null = null;
      if (input.providerAction) {
        action = await changeStatusForAction(
          db,
          adminId,
          booking.providerId,
          input.providerAction,
          input.rationale,
        );
      }
      await db
        .update(reports)
        .set({
          status: 'resolved',
          resolvedAt: clock.now(),
          resolution: {
            refundPoisha: input.refundPoisha ?? 0,
            providerAction: input.providerAction ?? null,
            rationale: input.rationale,
            resolvedBy: actor,
          },
        })
        .where(eq(reports.id, id));
      await recordAdminAction(db, {
        adminId,
        action: 'report.resolved',
        targetType: 'report',
        targetId: id,
        payload: {
          bookingId,
          outcome,
          refundPoisha: input.refundPoisha ?? 0,
          providerAction: action,
          rationale: input.rationale,
        },
      });
      return { resolved: true, booking: outcome, providerAction: action };
    });
  });
}
