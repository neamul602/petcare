/** Owner booking endpoints: submit a request, see it, cancel it before confirmation. */
import { and, eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { pillFor } from '@petcare/shared/bookings';
import { PAYMENT_METHODS } from '@petcare/shared/payments';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import { bookings, providers } from '../db/schema/index.ts';
import type { PaymentService } from '../payments/payment-service.ts';
import type { BookingService, SubmitResult } from './booking-service.ts';
import { transitionHistory } from './transitions.ts';

const refuse = (
  reply: FastifyReply,
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
) => reply.code(status).send({ error: { code, message, ...extra } });

const submitSchema = z.strictObject({
  key: z.string().min(8).max(64),
  providerSlug: z.string().min(1),
  petId: z.string().min(1),
  from: z.string(),
  to: z.string(),
  method: z.enum(PAYMENT_METHODS),
  instructions: z.string().max(1000).optional(),
  declaredClinical: z.boolean().optional(),
  confirmedNotClinical: z.boolean().optional(),
});

const FAILURES: Record<string, { status: number; message: string }> = {
  pet_not_found: { status: 404, message: 'No such pet' },
  provider_unavailable: { status: 409, message: 'This provider is not taking requests' },
  species_not_hosted: {
    status: 422,
    message: 'This provider does not look after that kind of pet',
  },
  invalid_dates: { status: 422, message: 'Check-out must be after check-in' },
  dates_in_past: { status: 422, message: 'Check-in cannot be in the past' },
  window_too_long: { status: 422, message: 'A stay can be at most 30 nights' },
  clinical_request_rejected: { status: 422, message: 'PetCare cannot take clinical care requests' },
  needs_confirmation: { status: 422, message: 'Please confirm this is not a clinical request' },
  nights_full: { status: 409, message: 'One or more nights are no longer free' },
  payment_declined: { status: 402, message: 'The payment was declined' },
  payment_unavailable: {
    status: 503,
    message: 'The payment service is not available. Nothing was charged.',
  },
};

export function registerBookingRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; service: BookingService; payments: PaymentService },
) {
  const { db, authn, service, payments } = deps;
  const owner = { preHandler: authn.requireRole('owner') };

  app.post('/owner/bookings', owner, async (request, reply) => {
    const input = submitSchema.parse(request.body);
    const result: SubmitResult = await service.submit({
      ownerId: request.currentUser!.id,
      ...input,
    });
    if (result.ok)
      return reply
        .code(result.duplicate ? 200 : 201)
        .send({ booking: { id: result.booking.id, state: result.booking.state } });
    const failure = FAILURES[result.reason]!;
    return refuse(
      reply,
      failure.status,
      result.reason,
      failure.message,
      result.detail ? { detail: result.detail } : {},
    );
  });

  app.get('/owner/bookings/:id', owner, async (request, reply) => {
    const { id } = request.params as { id: string };
    const [row] = await db
      .select({ booking: bookings, provider: providers })
      .from(bookings)
      .innerJoin(providers, eq(bookings.providerId, providers.id))
      .where(and(eq(bookings.id, id), eq(bookings.ownerId, request.currentUser!.id)));
    if (!row) return refuse(reply, 404, 'booking_not_found', 'No such booking');
    const b = row.booking;
    const payment = await payments.find(b.id);
    const history = await transitionHistory(db, b.id);
    return {
      booking: {
        id: b.id,
        state: b.state,
        pill: pillFor(b.state),
        provider: {
          slug: row.provider.slug,
          name: { en: row.provider.nameEn, bn: row.provider.nameBn },
        },
        pet: b.petSnapshot,
        startDate: b.startDate,
        endDate: b.endDate,
        nights: b.nights,
        pricePerNightPoisha: b.pricePerNightPoisha,
        totalPoisha: b.totalPoisha,
        paymentMethod: b.paymentMethod,
        paymentStatus: payment?.status ?? null,
        confirmationDeadline: b.confirmationDeadline,
        declineReason: b.declineReason,
        instructions: b.instructions,
        canCancel: b.state === 'authorized',
        timedOut: history.some((h) => h.trigger === 'confirmation_timeout'),
      },
      history,
    };
  });

  app.post('/owner/bookings/:id/cancel', owner, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.cancelByOwner(request.currentUser!.id, id);
    if (result.ok)
      return {
        booking: { id, state: result.booking.state },
        paymentPending: result.paymentPending,
      };
    if (result.reason === 'not_found')
      return refuse(reply, 404, 'booking_not_found', 'No such booking');
    return refuse(reply, 409, 'not_cancelable', 'This booking can no longer be cancelled here');
  });
}
