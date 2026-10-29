/**
 * Date-level capacity and safe reservation (SRC-01, SRC-03; DR-7, DR-8). Booking calls reserveNights and
 * releaseNights in process. Reserve locks every night row of the window in date order, so two requests
 * for the last slot are serialised and exactly one wins; all nights are taken together or none.
 */
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { Database } from '../db/client.ts';
import { nightCapacity, nightReservations, providers } from '../db/schema/index.ts';
import { nightsBetween } from './dates.ts';

export const MAX_CAPACITY = 20;
type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

export interface NightView {
  date: string;
  capacity: number;
  booked: number;
  free: number;
  note: string;
}

/** Make sure a row exists for each night, so it can be locked. */
async function ensureRows(tx: Tx, providerId: string, dates: string[]) {
  await tx
    .insert(nightCapacity)
    .values(dates.map((date) => ({ providerId, date })))
    .onConflictDoNothing();
}

async function lockRows(tx: Tx, providerId: string, dates: string[]) {
  const result = await tx.execute(sql`
    SELECT nc.date::text AS date, COALESCE(nc.capacity, p.capacity_small) AS capacity, nc.booked, nc.note
    FROM night_capacity nc JOIN providers p ON p.id = nc.provider_id
    WHERE nc.provider_id = ${providerId} AND nc.date IN (${sql.join(
      dates.map((d) => sql`${d}::date`),
      sql`, `,
    )})
    ORDER BY nc.date FOR UPDATE OF nc`);
  return result.rows as Array<{ date: string; capacity: number; booked: number; note: string }>;
}

const view = (r: { date: string; capacity: number; booked: number; note: string }): NightView => ({
  date: r.date,
  capacity: Number(r.capacity),
  booked: Number(r.booked),
  free: Math.max(0, Number(r.capacity) - Number(r.booked)),
  note: r.note,
});

/** Capacity, booked and free for each night of [from, to). Nights with no row use the provider's baseline. */
export async function nightsFor(db: Database, providerId: string, from: string, to: string) {
  const dates = nightsBetween(from, to);
  if (dates.length === 0) return [];
  const [provider] = await db
    .select({ baseline: providers.capacitySmall })
    .from(providers)
    .where(eq(providers.id, providerId));
  if (!provider) return [];
  const rows = await db
    .select()
    .from(nightCapacity)
    .where(and(eq(nightCapacity.providerId, providerId), inArray(nightCapacity.date, dates)));
  const byDate = new Map(rows.map((r) => [r.date, r]));
  return dates.map((date) =>
    view({
      date,
      capacity: byDate.get(date)?.capacity ?? provider.baseline,
      booked: byDate.get(date)?.booked ?? 0,
      note: byDate.get(date)?.note ?? '',
    }),
  );
}

export type ReserveResult =
  | { ok: true; nights: string[]; alreadyReserved: boolean }
  | {
      ok: false;
      reason: 'provider_unavailable' | 'nights_full' | 'invalid_window';
      fullNights?: string[];
    };

/** Reserve every night of [from, to) for a booking, or none. Safe to repeat for the same booking. */
export async function reserveNights(
  db: Database,
  input: { bookingId: string; providerId: string; from: string; to: string },
): Promise<ReserveResult> {
  const dates = nightsBetween(input.from, input.to);
  if (dates.length === 0) return { ok: false, reason: 'invalid_window' };
  return db.transaction(async (tx): Promise<ReserveResult> => {
    const [provider] = await tx
      .select({ status: providers.status })
      .from(providers)
      .where(eq(providers.id, input.providerId));
    if (!provider || provider.status !== 'approved')
      return { ok: false, reason: 'provider_unavailable' };

    const heldNow = () =>
      tx
        .select()
        .from(nightReservations)
        .where(
          and(
            eq(nightReservations.bookingId, input.bookingId),
            isNull(nightReservations.releasedAt),
          ),
        );
    const already = (held: Array<{ date: string }>): ReserveResult => ({
      ok: true,
      nights: held.map((h) => h.date).sort(),
      alreadyReserved: true,
    });

    const before = await heldNow();
    if (before.length > 0) return already(before);

    await ensureRows(tx, input.providerId, dates);
    const rows = await lockRows(tx, input.providerId, dates);
    // A twin request for the same booking may have finished while this one waited for the locks.
    const after = await heldNow();
    if (after.length > 0) return already(after);
    const full = rows.filter((r) => Number(r.booked) >= Number(r.capacity)).map((r) => r.date);
    if (full.length > 0) return { ok: false, reason: 'nights_full', fullNights: full };

    await tx
      .update(nightCapacity)
      .set({ booked: sql`${nightCapacity.booked} + 1`, updatedAt: new Date() })
      .where(
        and(eq(nightCapacity.providerId, input.providerId), inArray(nightCapacity.date, dates)),
      );
    await tx
      .insert(nightReservations)
      .values(
        dates.map((date) => ({ bookingId: input.bookingId, providerId: input.providerId, date })),
      )
      .onConflictDoUpdate({
        target: [nightReservations.bookingId, nightReservations.date],
        set: { releasedAt: null },
      });
    return { ok: true, nights: dates, alreadyReserved: false };
  });
}

/** Give back a booking's nights (decline, timeout, cancellation). Releasing twice changes nothing. */
export async function releaseNights(db: Database, bookingId: string) {
  return db.transaction(async (tx) => {
    const held = await tx
      .select()
      .from(nightReservations)
      .where(and(eq(nightReservations.bookingId, bookingId), isNull(nightReservations.releasedAt)))
      .for('update');
    if (held.length === 0) return { released: 0 };
    const providerId = held[0]!.providerId;
    const dates = held.map((h) => h.date).sort();
    await lockRows(tx, providerId, dates);
    await tx
      .update(nightCapacity)
      .set({ booked: sql`GREATEST(${nightCapacity.booked} - 1, 0)`, updatedAt: new Date() })
      .where(and(eq(nightCapacity.providerId, providerId), inArray(nightCapacity.date, dates)));
    await tx
      .update(nightReservations)
      .set({ releasedAt: new Date() })
      .where(and(eq(nightReservations.bookingId, bookingId), isNull(nightReservations.releasedAt)));
    return { released: dates.length };
  });
}

export type SetCapacityResult =
  | { ok: true; nights: NightView[] }
  | { ok: false; reason: 'below_booked'; conflicts: Array<{ date: string; booked: number }> };

/** Set capacity (and an optional note) for the chosen nights only. Refused if any night already has more booked. */
export async function setCapacity(
  db: Database,
  providerId: string,
  dates: string[],
  capacity: number,
  note?: string,
): Promise<SetCapacityResult> {
  const unique = [...new Set(dates)].sort();
  return db.transaction(async (tx): Promise<SetCapacityResult> => {
    await ensureRows(tx, providerId, unique);
    const rows = await lockRows(tx, providerId, unique);
    const conflicts = rows
      .filter((r) => Number(r.booked) > capacity)
      .map((r) => ({ date: r.date, booked: Number(r.booked) }));
    if (conflicts.length > 0) return { ok: false, reason: 'below_booked', conflicts };
    await tx
      .update(nightCapacity)
      .set({ capacity, ...(note === undefined ? {} : { note }), updatedAt: new Date() })
      .where(and(eq(nightCapacity.providerId, providerId), inArray(nightCapacity.date, unique)));
    const updated = await lockRows(tx, providerId, unique);
    return { ok: true, nights: updated.map(view) };
  });
}
