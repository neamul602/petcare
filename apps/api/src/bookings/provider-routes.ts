/** Provider booking endpoints: Today, Bookings, the request view, confirm, decline. */
import { and, desc, eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { pillFor } from '@petcare/shared/bookings';
import { trainingDecisions } from '@petcare/shared/config';
import type { Authenticator } from '../auth/guards.ts';
import { dhakaToday } from '../capacity/dates.ts';
import type { Database } from '../db/client.ts';
import { bookings, providers } from '../db/schema/index.ts';
import { buildCareSummary } from '../pets/care-summary.ts';
import type { Clock } from '@petcare/shared/clock';
import type { ProviderBookingService } from './provider-service.ts';
import type { StayService } from '../stay/stay-service.ts';
import { transitionHistory } from './transitions.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

const declineSchema = z.strictObject({ reason: z.enum(trainingDecisions.declineReasons) });

export function registerProviderBookingRoutes(
  app: FastifyInstance,
  deps: {
    db: Database;
    authn: Authenticator;
    service: ProviderBookingService;
    stay?: StayService;
    clock: Clock;
  },
) {
  const { db, authn, service, stay, clock } = deps;
  const provider = { preHandler: authn.requireRole('provider') };

  async function mine(userId: string) {
    const [row] = await db.select().from(providers).where(eq(providers.userId, userId));
    return row ?? null;
  }
  const card = (b: typeof bookings.$inferSelect) => ({
    id: b.id,
    state: b.state,
    pill: pillFor(b.state),
    pet: b.petSnapshot,
    startDate: b.startDate,
    endDate: b.endDate,
    nights: b.nights,
    totalPoisha: b.totalPoisha,
    confirmationDeadline: b.confirmationDeadline,
    minutesLeft:
      b.state === 'authorized' && b.confirmationDeadline
        ? Math.max(
            0,
            Math.floor((b.confirmationDeadline.getTime() - clock.now().getTime()) / 60_000),
          )
        : null,
  });

  async function listFor(userId: string) {
    const p = await mine(userId);
    if (!p) return null;
    const rows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.providerId, p.id))
      .orderBy(desc(bookings.startDate));
    return rows;
  }

  app.get('/provider/today', provider, async (request, reply) => {
    const rows = await listFor(request.currentUser!.id);
    if (!rows)
      return refuse(reply, 404, 'no_provider_record', 'No provider record for this account');
    return {
      requests: rows.filter((b) => b.state === 'authorized').map(card),
      inStay: await Promise.all(
        rows
          .filter((b) => b.state === 'in_stay')
          .map(async (b) => ({
            ...card(b),
            reminderDue: stay ? await stay.reminderDue(b.id) : false,
          })),
      ),
      startToday: rows
        .filter((b) => b.state === 'captured' && b.startDate <= dhakaToday(clock))
        .map(card),
    };
  });

  app.get('/provider/bookings', provider, async (request, reply) => {
    const rows = await listFor(request.currentUser!.id);
    if (!rows)
      return refuse(reply, 404, 'no_provider_record', 'No provider record for this account');
    const today = dhakaToday(clock);
    const past = [
      'completed',
      'declined',
      'canceled',
      'no_show',
      'disputed',
      'resolved',
      'refunded',
    ];
    return {
      requests: rows.filter((b) => b.state === 'authorized').map(card),
      upcoming: rows.filter((b) => b.state === 'captured' && b.endDate >= today).map(card),
      inStay: rows.filter((b) => b.state === 'in_stay').map(card),
      past: rows
        .filter((b) => past.includes(b.state) || (b.state === 'captured' && b.endDate < today))
        .map(card),
    };
  });

  app.get('/provider/bookings/:id', provider, async (request, reply) => {
    const { id } = request.params as { id: string };
    const booking = await service.ownBooking(request.currentUser!.id, id);
    if (!booking) return refuse(reply, 404, 'booking_not_found', 'No such booking');
    const summary = await buildCareSummary(db, request.currentUser!.id, booking.petId);
    const prior = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, booking.providerId),
          eq(bookings.petId, booking.petId),
          eq(bookings.state, 'completed'),
        ),
      );
    return {
      booking: {
        ...card(booking),
        pricePerNightPoisha: booking.pricePerNightPoisha,
        carePlan: booking.carePlan,
        instructions: booking.instructions,
        declineReason: booking.declineReason,
        priorStaysWithYou: prior.length,
        canStart: booking.state === 'captured' && booking.startDate <= dhakaToday(clock),
        reminderDue: stay && booking.state === 'in_stay' ? await stay.reminderDue(id) : false,
        canAct:
          booking.state === 'authorized' &&
          !!booking.confirmationDeadline &&
          booking.confirmationDeadline.getTime() > clock.now().getTime(),
      },
      careSummary: summary,
      history: await transitionHistory(db, id),
      updates: stay
        ? (await stay.listUpdates(id)).map((u) => ({
            ...u,
            photos: u.photos.map((photoId) => `/api/bookings/${id}/photos/${photoId}`),
          }))
        : [],
    };
  });

  app.post('/provider/bookings/:id/confirm', provider, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.confirm(request.currentUser!.id, id);
    if (result.ok)
      return {
        booking: { id, state: result.booking.state },
        alreadyConfirmed: result.alreadyConfirmed,
      };
    if (result.reason === 'not_found')
      return refuse(reply, 404, 'booking_not_found', 'No such booking');
    if (result.reason === 'capture_failed')
      return refuse(
        reply,
        502,
        'capture_failed',
        'The payment could not be taken. The request is still waiting; try again.',
      );
    if (result.reason === 'expired')
      return refuse(reply, 409, 'expired', 'The time to answer this request has passed');
    return refuse(reply, 409, 'not_waiting', 'This request is no longer waiting for an answer');
  });

  app.post('/provider/bookings/:id/decline', provider, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { reason } = declineSchema.parse(request.body);
    const result = await service.decline(request.currentUser!.id, id, reason);
    if (result.ok) return { booking: { id, state: result.booking.state } };
    if (result.reason === 'not_found')
      return refuse(reply, 404, 'booking_not_found', 'No such booking');
    if (result.reason === 'expired')
      return refuse(reply, 409, 'expired', 'The time to answer this request has passed');
    return refuse(reply, 409, 'not_waiting', 'This request is no longer waiting for an answer');
  });
}
