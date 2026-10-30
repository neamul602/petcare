/** Admin queue items after confirmation (BKG-11). One open flag per booking and kind. */
import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import type { Clock } from '@petcare/shared/clock';
import type { Database } from '../db/client.ts';
import { bookingFlags, type FlagKind } from '../db/schema/bookings.ts';
import { appendLogEntry } from '../log/append.ts';

export async function raiseFlag(
  db: Database,
  clock: Clock,
  input: { bookingId: string; kind: FlagKind; note?: string; raisedBy: string },
) {
  const [open] = await db
    .select()
    .from(bookingFlags)
    .where(
      and(
        eq(bookingFlags.bookingId, input.bookingId),
        eq(bookingFlags.kind, input.kind),
        eq(bookingFlags.status, 'open'),
      ),
    );
  if (open) return { flag: open, created: false };
  const [flag] = await db
    .insert(bookingFlags)
    .values({
      id: `flag_${randomUUID()}`,
      bookingId: input.bookingId,
      kind: input.kind,
      note: (input.note ?? '').trim(),
      raisedBy: input.raisedBy,
      createdAt: clock.now(),
    })
    .returning();
  await appendLogEntry(db, {
    kind: 'audit',
    actor: input.raisedBy,
    action: `booking.flag.${input.kind}`,
    targetType: 'booking',
    targetId: input.bookingId,
    at: clock.now(),
    payload: { flagId: flag!.id },
  });
  return { flag: flag!, created: true };
}

export async function resolveFlags(
  db: Database,
  clock: Clock,
  bookingId: string,
  kinds: FlagKind[],
  resolution: string,
  resolvedBy: string,
) {
  for (const kind of kinds)
    await db
      .update(bookingFlags)
      .set({ status: 'resolved', resolution, resolvedBy, resolvedAt: clock.now() })
      .where(
        and(
          eq(bookingFlags.bookingId, bookingId),
          eq(bookingFlags.kind, kind),
          eq(bookingFlags.status, 'open'),
        ),
      );
}

export const listFlags = (db: Database, status?: 'open' | 'resolved') =>
  db
    .select()
    .from(bookingFlags)
    .where(status ? eq(bookingFlags.status, status) : undefined)
    .orderBy(desc(bookingFlags.createdAt));
