/** Report a concern during a stay and its effects (ACU-01, ACU-02). */
import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import type { Clock } from '@petcare/shared/clock';
import { raiseFlag } from '../bookings/flags.ts';
import { exclusive } from '../bookings/lock.ts';
import type { Database } from '../db/client.ts';
import { acuteEvents, bookings, providers } from '../db/schema/index.ts';
import { appendLogEntry } from '../log/append.ts';
import type { PayoutService } from '../payouts/payout-service.ts';

export const EVENT_TYPES = ['illness', 'injury', 'death'] as const;
export const SEVERITIES = ['minor', 'serious', 'critical'] as const;

export type ReportResult =
  | { ok: true; event: typeof acuteEvents.$inferSelect }
  | { ok: false; reason: 'not_found' | 'not_in_stay' };

export function createAcuteService(deps: {
  db: Database;
  clock: Clock;
  payouts?: () => PayoutService | undefined;
}) {
  const { db, clock, payouts } = deps;

  async function report(
    providerUserId: string,
    bookingId: string,
    input: {
      type: (typeof EVENT_TYPES)[number];
      severity: (typeof SEVERITIES)[number];
      observation: string;
    },
  ): Promise<ReportResult> {
    const [found] = await db
      .select({ booking: bookings, provider: providers })
      .from(bookings)
      .innerJoin(providers, eq(bookings.providerId, providers.id))
      .where(and(eq(bookings.id, bookingId), eq(providers.userId, providerUserId)));
    if (!found) return { ok: false, reason: 'not_found' };
    return exclusive(bookingId, async (): Promise<ReportResult> => {
      const [b] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
      if (!b || b.state !== 'in_stay') return { ok: false, reason: 'not_in_stay' };
      const now = clock.now();
      const [event] = await db
        .insert(acuteEvents)
        .values({
          id: `acute_${randomUUID()}`,
          bookingId,
          providerId: b.providerId,
          type: input.type,
          severity: input.severity,
          observation: input.observation.trim(),
          triggeredAt: now,
          ownerNotifiedAt: now,
        })
        .returning();
      // Effects: the payout waits, the admin is told, the provider is flagged (never suspended automatically).
      await payouts?.()?.freeze(
        bookingId,
        `acute_event:${input.severity}`,
        `provider:${b.providerId}`,
      );
      await raiseFlag(db, clock, {
        bookingId,
        kind: 'acute_event',
        note: `${input.type} (${input.severity})`,
        raisedBy: `provider:${b.providerId}`,
      });
      await appendLogEntry(db, {
        kind: 'audit',
        actor: `provider:${b.providerId}`,
        action: 'provider.flagged_acute_event',
        reasonCode: input.severity,
        targetType: 'provider',
        targetId: b.providerId,
        at: now,
        payload: { bookingId, eventId: event!.id },
      });
      return { ok: true, event: event! };
    });
  }

  const forBooking = async (bookingId: string) =>
    (
      await db
        .select()
        .from(acuteEvents)
        .where(eq(acuteEvents.bookingId, bookingId))
        .orderBy(desc(acuteEvents.triggeredAt))
    )[0] ?? null;

  /** Open events first, newest first; both times so the gap can be shown. */
  async function list() {
    const rows = await db.select().from(acuteEvents).orderBy(desc(acuteEvents.triggeredAt));
    return [...rows].sort(
      (a, b) => Number(a.status === 'resolved') - Number(b.status === 'resolved'),
    );
  }

  return { report, forBooking, list };
}

export type AcuteService = ReturnType<typeof createAcuteService>;
