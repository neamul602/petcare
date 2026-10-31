/** Provider health flags, outreach and defection signals (ADM-04, ADM-05). Flags inform the admin; nothing suspends automatically. */
import { randomUUID } from 'node:crypto';
import { and, desc, eq, gte, inArray } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { Clock } from '@petcare/shared/clock';
import { trainingDecisions } from '@petcare/shared/config';
import { recordAdminAction } from '../auth/audit.ts';
import type { Authenticator } from '../auth/guards.ts';
import { addDays, dhakaToday } from '../capacity/dates.ts';
import { nightsFor } from '../capacity/nights.ts';
import type { Database } from '../db/client.ts';
import {
  bookings,
  defectionSignals,
  eventLog,
  providerOutreach,
  providers,
  providerStatusEvents,
  reports,
  reviews,
} from '../db/schema/index.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

export interface ProviderHealth {
  providerId: string;
  name: string;
  tier: string;
  daysSinceApproval: number;
  utilizationPercent: number | null;
  flags: string[];
  signals: number;
}

/** Utilization, confirmation and signal flags for every approved provider (TD-10). */
export async function computeHealth(db: Database, clock: Clock): Promise<ProviderHealth[]> {
  const now = clock.now();
  const today = dhakaToday(clock);
  const { trailingDays, checkpoints } = trainingDecisions.reengagement;
  const approved = await db.select().from(providers).where(eq(providers.status, 'approved'));
  const approvals = await db
    .select()
    .from(providerStatusEvents)
    .where(
      and(eq(providerStatusEvents.toValue, 'approved'), eq(providerStatusEvents.kind, 'status')),
    )
    .orderBy(desc(providerStatusEvents.createdAt));
  const since = new Date(now.getTime() - trailingDays * 86_400_000);
  const recent = await db.select().from(bookings).where(gte(bookings.createdAt, since));
  const timeouts = new Set(
    (
      await db
        .select({ id: eventLog.targetId })
        .from(eventLog)
        .where(
          and(
            eq(eventLog.kind, 'booking_transition'),
            eq(eventLog.reasonCode, 'confirmation_timeout'),
          ),
        )
    ).map((r) => r.id),
  );
  const signals = await db.select().from(defectionSignals);

  const result: ProviderHealth[] = [];
  for (const p of approved) {
    const approvedAt = approvals.find((e) => e.providerId === p.id)?.createdAt ?? p.createdAt;
    const days = Math.floor((now.getTime() - approvedAt.getTime()) / 86_400_000);
    const nights = await nightsFor(db, p.id, addDays(today, -trailingDays), today);
    const capacityNights = nights.reduce((sum, n) => sum + n.capacity, 0);
    const bookedNights = nights.reduce((sum, n) => sum + n.booked, 0);
    const utilization =
      capacityNights > 0 ? Math.round((bookedNights / capacityNights) * 100) : null;

    const flags: string[] = [];
    const reached = [...checkpoints].reverse().find((c) => days >= c.dayAfterApproval);
    if (reached && utilization !== null && utilization < reached.belowPercent)
      flags.push(`low_utilization_${reached.dayAfterApproval}`);
    const mine = recent.filter((b) => b.providerId === p.id);
    const missed = mine.filter((b) => b.state === 'declined' || timeouts.has(b.id)).length;
    if (mine.length >= 3 && missed / mine.length > 0.5) flags.push('low_confirmation');
    const count = signals.filter((s) => s.providerId === p.id).length;
    if (count > 0) flags.push('defection_signal');
    result.push({
      providerId: p.id,
      name: p.nameEn,
      tier: p.tier,
      daysSinceApproval: days,
      utilizationPercent: utilization,
      flags,
      signals: count,
    });
  }
  return result;
}

export function registerHealthRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; clock: Clock },
) {
  const { db, authn, clock } = deps;
  const admin = { preHandler: authn.requireRole('admin') };

  app.get('/admin/providers-health', admin, async () => ({
    providers: await computeHealth(db, clock),
  }));

  /** "Evaluate now" (for demos): recompute flags straight away. */
  app.post('/admin/providers-health/evaluate', admin, async (request) => {
    const health = await computeHealth(db, clock);
    await recordAdminAction(db, {
      adminId: request.currentUser!.id,
      action: 'providers.evaluated',
      targetType: 'provider',
      targetId: 'all',
      payload: { flagged: health.filter((h) => h.flags.length > 0).length },
    });
    return { providers: health };
  });

  app.get('/admin/providers/:id/health', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    if (!provider) return refuse(reply, 404, 'provider_not_found', 'No such provider');
    const health = (await computeHealth(db, clock)).find((h) => h.providerId === id) ?? null;
    return {
      health,
      outreach: await db
        .select()
        .from(providerOutreach)
        .where(eq(providerOutreach.providerId, id))
        .orderBy(desc(providerOutreach.at)),
      signals: await db
        .select()
        .from(defectionSignals)
        .where(eq(defectionSignals.providerId, id))
        .orderBy(desc(defectionSignals.at)),
    };
  });

  app.post('/admin/providers/:id/outreach', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = z
      .strictObject({
        flag: z.string().min(3).max(60),
        outreach: z.string().trim().min(3).max(500),
        outcome: z.string().trim().min(3).max(500),
      })
      .parse(request.body);
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    if (!provider) return refuse(reply, 404, 'provider_not_found', 'No such provider');
    const adminId = request.currentUser!.id;
    await db.insert(providerOutreach).values({
      id: `out_${randomUUID()}`,
      providerId: id,
      ...input,
      by: `admin:${adminId}`,
      at: clock.now(),
    });
    await recordAdminAction(db, {
      adminId,
      action: 'provider.outreach_recorded',
      targetType: 'provider',
      targetId: id,
      payload: input,
    });
    return reply.code(201).send({ saved: true });
  });

  app.post('/admin/providers/:id/signals', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = z
      .strictObject({
        sourceType: z.enum(['report', 'review', 'feedback']),
        sourceId: z.string().optional(),
        note: z.string().trim().max(500).default(''),
      })
      .parse(request.body);
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    if (!provider) return refuse(reply, 404, 'provider_not_found', 'No such provider');
    if (input.sourceType !== 'feedback') {
      if (!input.sourceId)
        return refuse(reply, 422, 'source_needed', 'Name the report or review this comes from');
      const rows =
        input.sourceType === 'report'
          ? await db
              .select({ providerId: bookings.providerId })
              .from(reports)
              .innerJoin(bookings, eq(reports.bookingId, bookings.id))
              .where(eq(reports.id, input.sourceId))
          : await db
              .select({ providerId: reviews.providerId })
              .from(reviews)
              .where(eq(reviews.id, input.sourceId));
      if (rows[0]?.providerId !== id)
        return refuse(
          reply,
          422,
          'source_not_for_provider',
          'That source does not belong to this provider',
        );
    }
    const adminId = request.currentUser!.id;
    const signalId = `sig_${randomUUID()}`;
    await db.insert(defectionSignals).values({
      id: signalId,
      providerId: id,
      sourceType: input.sourceType,
      sourceId: input.sourceId ?? null,
      note: input.note,
      by: `admin:${adminId}`,
      at: clock.now(),
    });
    await recordAdminAction(db, {
      adminId,
      action: 'provider.defection_signal',
      targetType: 'provider',
      targetId: id,
      payload: { signalId, source: input.sourceType },
    });
    return reply.code(201).send({ signal: { id: signalId } });
  });

  /** Counter-metrics are context only; they are never given targets. */
  app.get('/admin/context-metrics', admin, async () => {
    const [{ n }] = [
      {
        n: (
          await db
            .select({ id: providers.id })
            .from(providers)
            .where(inArray(providers.status, ['approved']))
        ).length,
      },
    ];
    return { activeProviders: n, note: 'Context only. These numbers are not targets.' };
  });
}
