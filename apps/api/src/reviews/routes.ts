/** Review, report and public review endpoints. */
import { and, eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { trainingDecisions } from '@petcare/shared/config';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import { dailyUpdates, providers, reports, reviews, updatePhotos } from '../db/schema/index.ts';
import { PhotoUnavailableError, type PhotoPort } from '../pets/photo-port.ts';
import type { ReviewService } from './service.ts';

const refuse = (
  reply: FastifyReply,
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
) => reply.code(status).send({ error: { code, message, ...extra } });

const reviewSchema = z.strictObject({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).default(''),
  photoIds: z.array(z.string()).max(4).default([]),
});
const reportSchema = z.strictObject({
  category: z.string(),
  description: z.string().trim().min(3).max(2000),
  photoIds: z.array(z.string()).max(5).default([]),
});

const REVIEW_FAIL: Record<string, [number, string]> = {
  not_found: [404, 'No such booking'],
  not_completed: [409, 'You can review a stay once it is completed'],
  already_reviewed: [409, 'This stay already has a review'],
  bad_photos: [422, 'Photos must come from this stay'],
  too_many_photos: [422, 'Too many photos'],
};
const REPORT_FAIL: Record<string, [number, string]> = {
  ...REVIEW_FAIL,
  not_completed: [409, 'A problem can be reported on a completed stay'],
  already_reported: [409, 'A report was already made for this stay'],
  window_closed: [409, 'The time to report a problem for this stay has passed'],
  bad_category: [422, 'Choose one of the listed categories'],
};

export function registerReviewRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; service: ReviewService; photos?: PhotoPort },
) {
  const { db, authn, service, photos } = deps;
  const owner = { preHandler: authn.requireRole('owner') };
  const admin = { preHandler: authn.requireRole('admin') };

  app.post('/owner/bookings/:id/review', owner, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = reviewSchema.parse(request.body);
    const result = await service.leaveReview(request.currentUser!.id, id, input);
    if (result.ok) return reply.code(201).send({ review: { id: result.reviewId } });
    const [status, message] = REVIEW_FAIL[result.reason]!;
    return refuse(reply, status, result.reason, message);
  });

  app.post('/owner/bookings/:id/report', owner, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = reportSchema.parse(request.body);
    const result = await service.report(request.currentUser!.id, id, input);
    if (result.ok) return reply.code(201).send({ report: { id: result.reportId } });
    const [status, message] = REPORT_FAIL[result.reason]!;
    return refuse(
      reply,
      status,
      result.reason,
      message,
      result.closedAt ? { closedAt: result.closedAt } : {},
    );
  });

  app.get('/report-categories', async () => ({ categories: trainingDecisions.reportCategories }));

  /** Public: a provider's published reviews and aggregates. */
  app.get('/providers/:slug/reviews', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const [p] = await db.select().from(providers).where(eq(providers.slug, slug));
    if (!p || p.status !== 'approved')
      return refuse(reply, 404, 'provider_not_found', 'No such provider');
    return {
      aggregates: await service.aggregates(p.id),
      reviews: await service.publicReviews(p.id),
    };
  });

  /** Public: a photo, only if it is attached to a published review. */
  app.get('/reviews/photos/:photoId', async (request, reply) => {
    const { photoId } = request.params as { photoId: string };
    if (!photos) return refuse(reply, 404, 'photo_not_found', 'No such photo');
    const [photo] = await db.select().from(updatePhotos).where(eq(updatePhotos.id, photoId));
    const [update] = photo
      ? await db.select().from(dailyUpdates).where(eq(dailyUpdates.id, photo.updateId))
      : [];
    const [review] = update
      ? await db
          .select()
          .from(reviews)
          .where(and(eq(reviews.bookingId, update.bookingId), eq(reviews.status, 'published')))
      : [];
    if (!photo || !review || !review.photoIds.includes(photoId))
      return refuse(reply, 404, 'photo_not_found', 'No such photo');
    try {
      const stored = await photos.fetch(photo.storageId);
      if (!stored) return refuse(reply, 404, 'photo_not_found', 'No such photo');
      return reply
        .header('content-type', stored.contentType)
        .header('cache-control', 'public, max-age=3600')
        .send(stored.bytes);
    } catch (error) {
      if (error instanceof PhotoUnavailableError)
        return refuse(
          reply,
          503,
          'photo_unavailable',
          'Photo storage is not available right now; try again',
        );
      throw error;
    }
  });

  app.get('/admin/reports', admin, async () => ({
    reports: (await db.select().from(reports)).map((r) => ({
      id: r.id,
      bookingId: r.bookingId,
      category: r.category,
      description: r.description,
      photoIds: r.photoIds,
      status: r.status,
      createdAt: r.createdAt,
    })),
  }));
}
