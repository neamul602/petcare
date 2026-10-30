/**
 * The stay itself: start, daily updates, the late-start flag and the update reminder state (BKG-10, BKG-12).
 * Updates are written once and never changed (the database also refuses edits).
 */
import { randomUUID } from 'node:crypto';
import { and, desc, eq, inArray, lt } from 'drizzle-orm';
import type { Clock } from '@petcare/shared/clock';
import { DHAKA_TIME_ZONE, trainingDecisions } from '@petcare/shared/config';
import { z } from 'zod';
import { dhakaToday } from '../capacity/dates.ts';
import type { Database } from '../db/client.ts';
import { bookings, dailyUpdates, eventLog, providers, updatePhotos } from '../db/schema/index.ts';
import { appendLogEntry } from '../log/append.ts';
import { raiseFlag } from '../bookings/flags.ts';
import { exclusive } from '../bookings/lock.ts';
import { transitionBooking, type BookingRow } from '../bookings/transitions.ts';
import { PhotoRejectedError, PhotoUnavailableError, type PhotoPort } from '../pets/photo-port.ts';

export const MAX_UPDATE_PHOTOS = 4;

export const careLogSchema = z.strictObject({
  medicationsGiven: z
    .array(
      z.strictObject({
        name: z.string().trim().min(1).max(80),
        time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      }),
    )
    .max(10)
    .default([]),
  food: z.enum(['ate_well', 'ate_some', 'refused']).optional(),
  mood: z.enum(['happy', 'calm', 'anxious', 'unwell']).optional(),
});
export type CareLog = z.infer<typeof careLogSchema>;

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h! * 60 + m!;
};
/** Minutes since midnight in Dhaka. */
export function dhakaMinutes(clock: Clock): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: DHAKA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(clock.now());
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return get('hour') * 60 + get('minute');
}

export type StartResult =
  | { ok: true; booking: BookingRow }
  | { ok: false; reason: 'not_found' | 'not_confirmed' | 'too_early' };
export type PostResult =
  | { ok: true; updateId: string; photos: number }
  | {
      ok: false;
      reason:
        'not_found' | 'not_in_stay' | 'too_many_photos' | 'photo_rejected' | 'photo_unavailable';
      detail?: string;
    };

export function createStayService(deps: { db: Database; photos: PhotoPort; clock: Clock }) {
  const { db, photos, clock } = deps;

  async function ownBooking(providerUserId: string, bookingId: string) {
    const [row] = await db
      .select({ booking: bookings })
      .from(bookings)
      .innerJoin(providers, eq(bookings.providerId, providers.id))
      .where(and(eq(bookings.id, bookingId), eq(providers.userId, providerUserId)));
    return row?.booking ?? null;
  }

  async function startStay(providerUserId: string, bookingId: string): Promise<StartResult> {
    if (!(await ownBooking(providerUserId, bookingId))) return { ok: false, reason: 'not_found' };
    return exclusive(bookingId, async (): Promise<StartResult> => {
      const booking = (await ownBooking(providerUserId, bookingId))!;
      if (booking.state !== 'captured') return { ok: false, reason: 'not_confirmed' };
      if (dhakaToday(clock) < booking.startDate) return { ok: false, reason: 'too_early' };
      const moved = await transitionBooking(db, clock, {
        bookingId,
        to: 'in_stay',
        trigger: 'stay_started',
        actor: `provider:${booking.providerId}`,
        expectedFrom: 'captured',
      });
      return moved.ok
        ? { ok: true, booking: moved.booking }
        : { ok: false, reason: 'not_confirmed' };
    });
  }

  /** Flag confirmed stays not started by the deadline time on their start date (TD-12), once each. */
  async function flagLateStarts(): Promise<{ flagged: string[] }> {
    const today = dhakaToday(clock);
    const pastDeadlineToday =
      dhakaMinutes(clock) >= minutesOf(trainingDecisions.stayStartDeadline.localTime);
    const candidates = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.state, 'captured'), lt(bookings.startDate, addOne(today))));
    const flagged: string[] = [];
    for (const b of candidates) {
      const overdue = b.startDate < today || (b.startDate === today && pastDeadlineToday);
      if (!overdue) continue;
      const already = await db
        .select({ id: eventLog.id })
        .from(eventLog)
        .where(and(eq(eventLog.action, 'booking.start_overdue'), eq(eventLog.targetId, b.id)));
      if (already.length > 0) continue;
      await appendLogEntry(db, {
        kind: 'audit',
        actor: 'system',
        action: 'booking.start_overdue',
        reasonCode: 'stay_start_deadline',
        targetType: 'booking',
        targetId: b.id,
        at: clock.now(),
        payload: { providerId: b.providerId, startDate: b.startDate },
      });
      await raiseFlag(db, clock, { bookingId: b.id, kind: 'missed_start', raisedBy: 'system' });
      flagged.push(b.id);
    }
    return { flagged };
  }

  async function postUpdate(
    providerUserId: string,
    bookingId: string,
    input: { note: string; careLog: CareLog; files: Array<{ bytes: Buffer; filename: string }> },
  ): Promise<PostResult> {
    const booking = await ownBooking(providerUserId, bookingId);
    if (!booking) return { ok: false, reason: 'not_found' };
    if (booking.state !== 'in_stay') return { ok: false, reason: 'not_in_stay' };
    if (input.files.length > MAX_UPDATE_PHOTOS) return { ok: false, reason: 'too_many_photos' };

    const stored: Array<{ id: string; contentType: string; size: number }> = [];
    try {
      for (const file of input.files)
        stored.push(
          await photos.upload({
            bytes: file.bytes,
            filename: file.filename,
            tag: `booking:${bookingId}`,
          }),
        );
    } catch (error) {
      if (error instanceof PhotoRejectedError)
        return { ok: false, reason: 'photo_rejected', detail: error.code };
      if (error instanceof PhotoUnavailableError) return { ok: false, reason: 'photo_unavailable' };
      throw error;
    }
    const updateId = `upd_${randomUUID()}`;
    await db.transaction(async (tx) => {
      await tx.insert(dailyUpdates).values({
        id: updateId,
        bookingId,
        day: dhakaToday(clock),
        note: input.note.trim(),
        careLog: input.careLog,
        createdAt: clock.now(),
      });
      if (stored.length > 0)
        await tx.insert(updatePhotos).values(
          stored.map((s, position) => ({
            id: `up_${randomUUID()}`,
            updateId,
            storageId: s.id,
            contentType: s.contentType,
            size: s.size,
            position,
          })),
        );
    });
    return { ok: true, updateId, photos: stored.length };
  }

  /** Newest first, with photo ids the API serves back. */
  async function listUpdates(bookingId: string) {
    const rows = await db
      .select()
      .from(dailyUpdates)
      .where(eq(dailyUpdates.bookingId, bookingId))
      .orderBy(desc(dailyUpdates.createdAt));
    const pics = rows.length
      ? await db
          .select()
          .from(updatePhotos)
          .where(
            inArray(
              updatePhotos.updateId,
              rows.map((r) => r.id),
            ),
          )
      : [];
    return rows.map((r) => ({
      id: r.id,
      day: r.day,
      at: r.createdAt,
      note: r.note,
      careLog: r.careLog,
      photos: pics
        .filter((p) => p.updateId === r.id)
        .sort((a, b) => a.position - b.position)
        .map((p) => p.id),
    }));
  }

  /** True after the reminder time when the in-stay booking has no update today (shown instead of a notification). */
  async function reminderDue(bookingId: string): Promise<boolean> {
    if (dhakaMinutes(clock) < minutesOf(trainingDecisions.dailyUpdateReminder.localTime))
      return false;
    const today = dhakaToday(clock);
    const rows = await db
      .select({ id: dailyUpdates.id })
      .from(dailyUpdates)
      .where(and(eq(dailyUpdates.bookingId, bookingId), eq(dailyUpdates.day, today)));
    return rows.length === 0;
  }

  return { ownBooking, startStay, flagLateStarts, postUpdate, listUpdates, reminderDue };
}

const addOne = (date: string) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

export type StayService = ReturnType<typeof createStayService>;
