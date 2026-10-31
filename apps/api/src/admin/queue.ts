/** The admin urgency queue, the audit log view and the operating ceiling (ADM-01..03). */
import { and, asc, desc, eq, gte, inArray, like, sql } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import type { Clock } from '@petcare/shared/clock';
import { platformRules } from '@petcare/shared/config';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import {
  acuteEvents,
  acutePostMortems,
  bookingFlags,
  bookings,
  eventLog,
  providers,
  reports,
  reviews,
  payments,
  payouts,
} from '../db/schema/index.ts';

const POST_MORTEM_REMINDER_HOURS = 48;
const REVIEW_WINDOW_DAYS = 14;

export async function operatingCeiling(db: Database, clock: Clock) {
  const limits = platformRules.operatingCeiling;
  const [{ n: activeProviders = 0 } = { n: 0 }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(providers)
    .where(eq(providers.status, 'approved'));
  const since = new Date(clock.now().getTime() - 30 * 86_400_000);
  const [{ n: completed = 0 } = { n: 0 }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(bookings)
    .where(gte(bookings.completedAt, since));
  const pct = (value: number, limit: number) => Math.round((value / limit) * 100);
  const providersPercent = pct(activeProviders, limits.activeProviders);
  const bookingsPercent = pct(completed, limits.completedBookingsPer30Days);
  const top = Math.max(providersPercent, bookingsPercent);
  return {
    activeProviders: {
      value: activeProviders,
      limit: limits.activeProviders,
      percent: providersPercent,
    },
    completedBookings30Days: {
      value: completed,
      limit: limits.completedBookingsPer30Days,
      percent: bookingsPercent,
    },
    nearCeiling: top >= limits.nearPercent && top < 100,
    breached: top >= 100,
    message:
      top >= 100
        ? 'A ceiling is reached. This is a signal to move to a fuller platform, not a goal to chase.'
        : top >= limits.nearPercent
          ? 'Near the operating ceiling. Ask for help or plan the next step before stretching.'
          : null,
  };
}

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

export function registerAdminQueueRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; clock: Clock },
) {
  const { db, authn, clock } = deps;
  const admin = { preHandler: authn.requireRole('admin') };

  app.get('/admin/queue', admin, async () => {
    const now = clock.now();
    const items: Array<{
      group: number;
      kind: string;
      id: string;
      title: string;
      detail: string;
      href: string;
      at: Date | null;
      flags: string[];
    }> = [];

    for (const e of await db
      .select()
      .from(acuteEvents)
      .where(eq(acuteEvents.status, 'open'))
      .orderBy(desc(acuteEvents.triggeredAt)))
      items.push({
        group: 0,
        kind: 'acute',
        id: e.id,
        title: `${e.type} (${e.severity})`,
        detail: e.observation,
        href: `/admin/acute/${e.id}`,
        at: e.triggeredAt,
        flags: [],
      });

    for (const r of await db
      .select()
      .from(reports)
      .where(eq(reports.status, 'open'))
      .orderBy(desc(reports.createdAt)))
      items.push({
        group: 1,
        kind: 'report',
        id: r.id,
        title: r.category,
        detail: r.description,
        href: `/admin/reports/${r.id}`,
        at: r.createdAt,
        flags: [],
      });

    for (const f of await db
      .select()
      .from(bookingFlags)
      .where(eq(bookingFlags.status, 'open'))
      .orderBy(desc(bookingFlags.createdAt)))
      if (f.kind !== 'acute_event')
        items.push({
          group: 2,
          kind: f.kind,
          id: f.id,
          title: f.kind,
          detail: f.note,
          href: `/admin/bookings/${f.bookingId}`,
          at: f.createdAt,
          flags: [],
        });

    for (const b of await db
      .select()
      .from(bookings)
      .where(eq(bookings.state, 'authorized'))
      .orderBy(asc(bookings.confirmationDeadline)))
      items.push({
        group: 3,
        kind: 'awaiting_confirmation',
        id: b.id,
        title: (b.petSnapshot as { name?: string }).name ?? 'Booking',
        detail: `${b.startDate} → ${b.endDate}`,
        href: `/admin/bookings/${b.id}`,
        at: b.confirmationDeadline,
        flags: [],
      });

    for (const b of await db
      .select()
      .from(bookings)
      .where(eq(bookings.state, 'in_stay'))
      .orderBy(asc(bookings.endDate)))
      items.push({
        group: 4,
        kind: 'in_stay',
        id: b.id,
        title: (b.petSnapshot as { name?: string }).name ?? 'Booking',
        detail: `${b.startDate} → ${b.endDate}`,
        href: `/admin/bookings/${b.id}`,
        at: null,
        flags: [],
      });

    const [{ n: toVet = 0 } = { n: 0 }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(providers)
      .where(inArray(providers.status, ['applied', 'vetting']));
    const since = new Date(now.getTime() - REVIEW_WINDOW_DAYS * 86_400_000);
    const [{ n: recentReviews = 0 } = { n: 0 }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(reviews)
      .where(and(eq(reviews.status, 'published'), gte(reviews.createdAt, since)));

    const resolved = await db.select().from(acuteEvents).where(eq(acuteEvents.status, 'resolved'));
    const written = new Set(
      (await db.select({ id: acutePostMortems.eventId }).from(acutePostMortems)).map((r) => r.id),
    );
    const cutoff = now.getTime() - POST_MORTEM_REMINDER_HOURS * 3_600_000;
    const reminders = resolved
      .filter((e) => !written.has(e.id) && e.resolvedAt && e.resolvedAt.getTime() <= cutoff)
      .map((e) => ({ eventId: e.id, href: `/admin/acute/${e.id}` }));

    const ceiling = await operatingCeiling(db, clock);
    return {
      items: items.map(({ group, ...item }) => ({ ...item, group })),
      counts: {
        providersToVet: { value: toVet, href: '/admin/providers?status=vetting' },
        reviewsToModerate: { value: recentReviews, href: '/admin/reviews' },
      },
      postMortemReminders: reminders,
      ceilingBanner: ceiling.message
        ? { message: ceiling.message, breached: ceiling.breached }
        : null,
    };
  });

  /** One booking for the admin: record, history, open items and money state. */
  app.get('/admin/bookings/:id', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const [b] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!b) return refuse(reply, 404, 'booking_not_found', 'No such booking');
    const flags = await db
      .select()
      .from(bookingFlags)
      .where(eq(bookingFlags.bookingId, id))
      .orderBy(desc(bookingFlags.createdAt));
    const history = await db
      .select()
      .from(eventLog)
      .where(and(eq(eventLog.kind, 'booking_transition'), eq(eventLog.targetId, id)))
      .orderBy(asc(eventLog.id));
    const [payment] = await db.select().from(payments).where(eq(payments.bookingId, id));
    const [payout] = await db.select().from(payouts).where(eq(payouts.bookingId, id));
    return {
      booking: {
        id: b.id,
        state: b.state,
        providerId: b.providerId,
        ownerId: b.ownerId,
        pet: b.petSnapshot,
        startDate: b.startDate,
        endDate: b.endDate,
        nights: b.nights,
        totalPoisha: b.totalPoisha,
        confirmationDeadline: b.confirmationDeadline,
        instructions: b.instructions,
      },
      flags: flags.map((f) => ({
        id: f.id,
        kind: f.kind,
        status: f.status,
        note: f.note,
        raisedBy: f.raisedBy,
        resolution: f.resolution,
        createdAt: f.createdAt,
      })),
      history: history.map((h) => ({ action: h.action, trigger: h.reasonCode, at: h.createdAt })),
      payment: payment
        ? {
            status: payment.status,
            amountPoisha: payment.amountPoisha,
            refundedPoisha: payment.refundedPoisha,
          }
        : null,
      payout: payout
        ? { status: payout.status, netPoisha: payout.netPoisha, freezeReason: payout.freezeReason }
        : null,
    };
  });

  app.get('/admin/insights/ceiling', admin, async () => operatingCeiling(db, clock));

  /** Newest first; filter by action prefix and by target. Entries can be read, never changed. */
  app.get('/admin/audit', admin, async (request) => {
    const q = request.query as {
      action?: string;
      targetType?: string;
      targetId?: string;
      limit?: string;
    };
    const limit = Math.min(Math.max(Number(q.limit) || 100, 1), 500);
    const where = and(
      eq(eventLog.kind, 'audit'),
      q.action ? like(eventLog.action, `${q.action}%`) : undefined,
      q.targetType ? eq(eventLog.targetType, q.targetType) : undefined,
      q.targetId ? eq(eventLog.targetId, q.targetId) : undefined,
    );
    const rows = await db
      .select()
      .from(eventLog)
      .where(where)
      .orderBy(desc(eventLog.id))
      .limit(limit);
    return {
      entries: rows.map((r) => ({
        id: r.id,
        actor: r.actor,
        action: r.action,
        reasonCode: r.reasonCode,
        targetType: r.targetType,
        targetId: r.targetId,
        payload: r.payload,
        at: r.createdAt,
      })),
    };
  });

  app.route({
    method: ['PUT', 'PATCH', 'DELETE'],
    url: '/admin/audit/:id',
    preHandler: authn.requireRole('admin'),
    handler: async (_request, reply) =>
      refuse(
        reply.header('allow', 'GET'),
        405,
        'audit_immutable',
        'Audit entries can be read but never changed or deleted',
      ),
  });
}
