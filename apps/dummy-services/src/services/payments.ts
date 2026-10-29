/**
 * Dummy Payment Gateway API (training contract; NOT the bKash, Nagad or SSLCommerz interface).
 *   POST /api/payments/authorizations              { method, amount, bookingRef? }
 *   POST /api/payments/authorizations/:id/capture
 *   POST /api/payments/authorizations/:id/release
 *   POST /api/payments/:paymentId/refunds          { amount, reason? }
 *   GET  /api/payments/:paymentId
 * Amounts are whole poisha (BDT x 100). Authorize, capture and refund need an Idempotency-Key:
 * repeating a key returns the first result and never repeats the action. Card data is never accepted.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ApiError } from '../core/errors.ts';
import { requireIdempotencyKey, type ActionResult, type DummyService } from '../core/service.ts';

const METHODS = ['bkash', 'nagad', 'card'] as const;
type Method = (typeof METHODS)[number];
type Status = 'authorized' | 'captured' | 'released' | 'partially_refunded' | 'refunded';

interface Refund {
  id: string;
  amount: number;
  reason?: string;
  at: string;
}
interface Authorization {
  id: string;
  paymentId: string;
  method: Method;
  amount: number;
  currency: 'BDT';
  bookingRef?: string;
  gatewayRef: string;
  status: Status;
  authorizedAt: string;
  capturedAt?: string;
  releasedAt?: string;
  refundedTotal: number;
  refunds: Refund[];
}

const MAX_AMOUNT = 1_000_000_000; // BDT 10,000,000 in poisha
const authorizeBody = z.strictObject({
  method: z.enum(METHODS),
  amount: z.number().int().positive().max(MAX_AMOUNT),
  bookingRef: z.string().min(1).max(64).optional(),
});
const refundBody = z.strictObject({
  amount: z.number().int().positive().max(MAX_AMOUNT),
  reason: z.string().max(200).optional(),
});
const CARD_DATA = /card.?(number|no|cvv|cvc|expiry|exp|holder)|^(pan|cvv|cvc)$/i;

const view = (a: Authorization) => ({ ...a, capturedAmount: a.capturedAt ? a.amount : 0 });

export function registerPayments(app: FastifyInstance, svc: DummyService) {
  const byAuthorization = new Map<string, Authorization>();
  const byPayment = new Map<string, Authorization>();
  svc.onReset(() => {
    byAuthorization.clear();
    byPayment.clear();
  });
  svc.describeWith(() => ({ authorizations: [...byAuthorization.values()].map(view) }));
  svc.attach(app);

  const authorizationOr404 = (id: string) => {
    const found = byAuthorization.get(id);
    if (!found) throw new ApiError(404, 'authorization_not_found', `No authorization ${id}`);
    return found;
  };

  app.post('/api/payments/authorizations', async (request, reply) => {
    const raw = (request.body ?? {}) as Record<string, unknown>;
    if (Object.keys(raw).some((key) => CARD_DATA.test(key))) {
      throw new ApiError(
        400,
        'card_data_not_accepted',
        'PetCare never sends card data; only the method name is accepted',
      );
    }
    const key = requireIdempotencyKey(request);
    const body = authorizeBody.parse(raw);
    return svc.run(
      request,
      reply,
      (): ActionResult => {
        const sequence = svc.ids.next('auth');
        const auth: Authorization = {
          id: sequence,
          paymentId: svc.ids.next('pay'),
          method: body.method,
          amount: body.amount,
          currency: 'BDT',
          bookingRef: body.bookingRef,
          gatewayRef: `GW-${body.method.toUpperCase()}-${sequence.slice(5).padStart(6, '0')}`,
          status: 'authorized',
          authorizedAt: svc.ctx.now().toISOString(),
          refundedTotal: 0,
          refunds: [],
        };
        byAuthorization.set(auth.id, auth);
        byPayment.set(auth.paymentId, auth);
        return { status: 201, body: view(auth) };
      },
      {
        idempotencyKey: key,
        declinable: { code: 'payment_declined', message: 'The payment method was declined' },
      },
    );
  });

  app.post('/api/payments/authorizations/:id/capture', async (request, reply) => {
    const key = requireIdempotencyKey(request);
    const { id } = request.params as { id: string };
    return svc.run(
      request,
      reply,
      (): ActionResult => {
        const auth = authorizationOr404(id);
        if (
          auth.status === 'captured' ||
          auth.status === 'partially_refunded' ||
          auth.status === 'refunded'
        ) {
          throw new ApiError(
            409,
            'already_captured',
            'This authorization was already captured with a different idempotency key',
          );
        }
        if (auth.status === 'released')
          throw new ApiError(409, 'not_capturable', 'A released authorization cannot be captured');
        auth.status = 'captured';
        auth.capturedAt = svc.ctx.now().toISOString();
        return { status: 200, body: view(auth) };
      },
      {
        idempotencyKey: key,
        declinable: { code: 'payment_declined', message: 'The capture was declined' },
      },
    );
  });

  app.post('/api/payments/authorizations/:id/release', async (request, reply) => {
    const { id } = request.params as { id: string };
    return svc.run(request, reply, (): ActionResult => {
      const auth = authorizationOr404(id);
      if (auth.status === 'released') return { status: 200, body: view(auth) }; // repeating a release changes nothing
      if (auth.status !== 'authorized')
        throw new ApiError(
          409,
          'not_releasable',
          'Only an authorization that is not yet captured can be released',
        );
      auth.status = 'released';
      auth.releasedAt = svc.ctx.now().toISOString();
      return { status: 200, body: view(auth) };
    });
  });

  app.post('/api/payments/:paymentId/refunds', async (request, reply) => {
    const key = requireIdempotencyKey(request);
    const { paymentId } = request.params as { paymentId: string };
    const body = refundBody.parse(request.body);
    return svc.run(
      request,
      reply,
      (): ActionResult => {
        const auth = byPayment.get(paymentId);
        if (!auth) throw new ApiError(404, 'payment_not_found', `No payment ${paymentId}`);
        if (!auth.capturedAt)
          throw new ApiError(409, 'not_captured', 'Only a captured payment can be refunded');
        const remaining = auth.amount - auth.refundedTotal;
        if (body.amount > remaining) {
          throw new ApiError(
            422,
            'refund_exceeds_captured',
            `At most ${remaining} poisha can still be refunded`,
            { remaining },
          );
        }
        const refund: Refund = {
          id: svc.ids.next('ref'),
          amount: body.amount,
          reason: body.reason,
          at: svc.ctx.now().toISOString(),
        };
        auth.refunds.push(refund);
        auth.refundedTotal += body.amount;
        auth.status = auth.refundedTotal === auth.amount ? 'refunded' : 'partially_refunded';
        return { status: 201, body: { refund, payment: view(auth) } };
      },
      { idempotencyKey: key },
    );
  });

  app.get('/api/payments/:paymentId', async (request, reply) => {
    const { paymentId } = request.params as { paymentId: string };
    return svc.run(request, reply, (): ActionResult => {
      const auth = byPayment.get(paymentId) ?? byAuthorization.get(paymentId);
      if (!auth) throw new ApiError(404, 'payment_not_found', `No payment ${paymentId}`);
      return { status: 200, body: view(auth) };
    });
  });
}
