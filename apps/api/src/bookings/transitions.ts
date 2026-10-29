/** The one place a booking changes state: only allowed transitions, race-safe, always logged with time and trigger (FR-14, NFR-22). */
import { and, asc, eq } from 'drizzle-orm';
import type { Clock } from '@petcare/shared/clock';
import { canTransition, type BookingState, type Trigger } from '@petcare/shared/bookings';
import type { Database } from '../db/client.ts';
import { bookings, eventLog } from '../db/schema/index.ts';
import { appendLogEntry } from '../log/append.ts';

export type BookingRow = typeof bookings.$inferSelect;

export type TransitionResult =
  | { ok: true; booking: BookingRow }
  | { ok: false; reason: 'not_found' | 'illegal_transition' | 'state_changed' };

export async function transitionBooking(
  db: Database,
  clock: Clock,
  input: {
    bookingId: string;
    to: BookingState;
    trigger: Trigger;
    actor: string;
    expectedFrom?: BookingState;
    set?: Partial<typeof bookings.$inferInsert>;
  },
): Promise<TransitionResult> {
  const [current] = await db.select().from(bookings).where(eq(bookings.id, input.bookingId));
  if (!current) return { ok: false, reason: 'not_found' };
  const from = current.state;
  if (input.expectedFrom && input.expectedFrom !== from)
    return { ok: false, reason: 'illegal_transition' };
  if (!canTransition(from, input.to)) return { ok: false, reason: 'illegal_transition' };
  // The WHERE on the old state means two simultaneous changes cannot both win.
  const [updated] = await db
    .update(bookings)
    .set({ ...input.set, state: input.to, updatedAt: clock.now() })
    .where(and(eq(bookings.id, input.bookingId), eq(bookings.state, from)))
    .returning();
  if (!updated) return { ok: false, reason: 'state_changed' };
  await logTransition(db, clock, input.bookingId, from, input.to, input.trigger, input.actor);
  return { ok: true, booking: updated };
}

export const logTransition = (
  db: Database,
  clock: Clock,
  bookingId: string,
  from: BookingState,
  to: BookingState,
  trigger: Trigger,
  actor: string,
) =>
  appendLogEntry(db, {
    kind: 'booking_transition',
    actor,
    action: `${from}->${to}`,
    reasonCode: trigger,
    targetType: 'booking',
    targetId: bookingId,
    at: clock.now(),
    payload: { from, to, trigger },
  });

export async function transitionHistory(db: Database, bookingId: string) {
  const rows = await db
    .select()
    .from(eventLog)
    .where(and(eq(eventLog.kind, 'booking_transition'), eq(eventLog.targetId, bookingId)))
    .orderBy(asc(eventLog.id));
  return rows.map((r) => {
    const p = r.payload as { from: string; to: string; trigger: string };
    return { from: p.from, to: p.to, trigger: p.trigger, at: r.createdAt };
  });
}
