/** Verified reviews, public aggregates and the owner's report of a problem (REV-01, REV-02, REV-05). */
import { randomUUID } from 'node:crypto';
import { and, desc, eq, inArray } from 'drizzle-orm';
import type { Clock } from '@petcare/shared/clock';
import { trainingDecisions } from '@petcare/shared/config';
import type { Database } from '../db/client.ts';
import {
  acuteEvents,
  bookings,
  dailyUpdates,
  reports,
  reviews,
  updatePhotos,
} from '../db/schema/index.ts';
import { exclusive } from '../bookings/lock.ts';
import { transitionBooking } from '../bookings/transitions.ts';
import type { PayoutService } from '../payouts/payout-service.ts';

export const MAX_REVIEW_PHOTOS = 4;
export const MAX_REPORT_PHOTOS = 5;

type ReviewResult =
  | { ok: true; reviewId: string }
  | {
      ok: false;
      reason: 'not_found' | 'not_completed' | 'already_reviewed' | 'bad_photos' | 'too_many_photos';
    };
type ReportResult =
  | { ok: true; reportId: string }
  | {
      ok: false;
      reason:
        | 'not_found'
        | 'not_completed'
        | 'window_closed'
        | 'already_reported'
        | 'bad_photos'
        | 'too_many_photos'
        | 'bad_category';
      closedAt?: Date;
    };

export function createReviewService(deps: {
  db: Database;
  clock: Clock;
  payouts?: () => PayoutService | undefined;
}) {
  const { db, clock, payouts } = deps;

  const ownerBooking = async (ownerId: string, bookingId: string) => {
    const [row] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.ownerId, ownerId)));
    return row ?? null;
  };

  /** Only photos the provider posted during this stay may be attached. */
  async function stayPhotosOk(bookingId: string, ids: string[]) {
    if (ids.length === 0) return true;
    const rows = await db
      .select({ id: updatePhotos.id })
      .from(updatePhotos)
      .innerJoin(dailyUpdates, eq(updatePhotos.updateId, dailyUpdates.id))
      .where(and(eq(dailyUpdates.bookingId, bookingId), inArray(updatePhotos.id, ids)));
    return rows.length === new Set(ids).size;
  }

  async function leaveReview(
    ownerId: string,
    bookingId: string,
    input: { rating: number; text: string; photoIds: string[] },
  ): Promise<ReviewResult> {
    const b = await ownerBooking(ownerId, bookingId);
    if (!b) return { ok: false, reason: 'not_found' };
    // An open report does not block a review (FR-22), so a disputed booking can still be reviewed.
    if (!['completed', 'disputed', 'resolved', 'refunded'].includes(b.state) || !b.completedAt)
      return { ok: false, reason: 'not_completed' };
    if (input.photoIds.length > MAX_REVIEW_PHOTOS) return { ok: false, reason: 'too_many_photos' };
    if (!(await stayPhotosOk(bookingId, input.photoIds)))
      return { ok: false, reason: 'bad_photos' };
    const [existing] = await db.select().from(reviews).where(eq(reviews.bookingId, bookingId));
    if (existing) return { ok: false, reason: 'already_reviewed' };
    const id = `rev_${randomUUID()}`;
    try {
      await db.insert(reviews).values({
        id,
        bookingId,
        providerId: b.providerId,
        ownerId,
        rating: input.rating,
        text: input.text.trim(),
        photoIds: [...new Set(input.photoIds)],
        createdAt: clock.now(),
      });
    } catch {
      return { ok: false, reason: 'already_reviewed' }; // a twin request won
    }
    return { ok: true, reviewId: id };
  }

  /** Report a problem: the booking becomes disputed, the payout waits, the admin sees it. */
  async function report(
    ownerId: string,
    bookingId: string,
    input: { category: string; description: string; photoIds: string[] },
  ): Promise<ReportResult> {
    if (!(trainingDecisions.reportCategories as readonly string[]).includes(input.category))
      return { ok: false, reason: 'bad_category' };
    if (!(await ownerBooking(ownerId, bookingId))) return { ok: false, reason: 'not_found' };
    return exclusive(bookingId, async (): Promise<ReportResult> => {
      const b = (await ownerBooking(ownerId, bookingId))!;
      const [already] = await db.select().from(reports).where(eq(reports.bookingId, bookingId));
      if (already) return { ok: false, reason: 'already_reported' };
      const [acute] = await db
        .select()
        .from(acuteEvents)
        .where(eq(acuteEvents.bookingId, bookingId));
      // After an acute event the dispute window is open straight away, even before the stay ends.
      const early = b.state === 'in_stay' && !!acute;
      if (!early && (b.state !== 'completed' || !b.completedAt))
        return { ok: false, reason: 'not_completed' };
      if (!early) {
        const closesAt = new Date(
          b.completedAt!.getTime() + trainingDecisions.disputeWindowMinutes * 60_000,
        );
        if (clock.now().getTime() > closesAt.getTime())
          return { ok: false, reason: 'window_closed', closedAt: closesAt };
      }
      if (input.photoIds.length > MAX_REPORT_PHOTOS)
        return { ok: false, reason: 'too_many_photos' };
      if (!(await stayPhotosOk(bookingId, input.photoIds)))
        return { ok: false, reason: 'bad_photos' };
      const moved = await transitionBooking(db, clock, {
        bookingId,
        to: 'disputed',
        trigger: 'owner_reported',
        actor: `owner:${ownerId}`,
        expectedFrom: early ? 'in_stay' : 'completed',
      });
      if (!moved.ok) return { ok: false, reason: 'not_completed' };
      const id = `rep_${randomUUID()}`;
      await db.insert(reports).values({
        id,
        bookingId,
        ownerId,
        category: input.category,
        description: input.description.trim(),
        photoIds: [...new Set(input.photoIds)],
        createdAt: clock.now(),
      });
      await payouts?.()?.freeze(bookingId, `report:${input.category}`, `owner:${ownerId}`);
      return { ok: true, reportId: id };
    });
  }

  /** Real reviews only: average to one decimal and the share of reviews that carry photos. */
  async function aggregates(providerId: string) {
    const rows = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.providerId, providerId), eq(reviews.status, 'published')));
    if (rows.length === 0) return { count: 0, average: null, withPhotosPercent: null };
    const average = rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;
    const withPhotos = rows.filter((r) => r.photoIds.length > 0).length;
    return {
      count: rows.length,
      average: Math.round(average * 10) / 10,
      withPhotosPercent: Math.round((withPhotos / rows.length) * 100),
    };
  }

  async function publicReviews(providerId: string) {
    const rows = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.providerId, providerId), eq(reviews.status, 'published')))
      .orderBy(desc(reviews.createdAt));
    return rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      verified: true,
      at: r.createdAt,
      photos: r.photoIds.map((id) => `/api/reviews/photos/${id}`),
    }));
  }

  const reviewOf = async (bookingId: string) =>
    (await db.select().from(reviews).where(eq(reviews.bookingId, bookingId)))[0] ?? null;
  const reportOf = async (bookingId: string) =>
    (await db.select().from(reports).where(eq(reports.bookingId, bookingId)))[0] ?? null;

  return { leaveReview, report, aggregates, publicReviews, reviewOf, reportOf };
}

export type ReviewService = ReturnType<typeof createReviewService>;
