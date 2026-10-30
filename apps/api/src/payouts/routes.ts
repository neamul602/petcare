/** Admin payout endpoints: list, run the batch now (same rules as the weekly run), freeze, release, refund. */
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { recordAdminAction } from '../auth/audit.ts';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import type { PayoutService } from './payout-service.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

const reason = z.string().trim().min(3).max(300);
const freezeSchema = z.strictObject({ reason });
const refundSchema = z.strictObject({
  amountPoisha: z.number().int().positive(),
  rationale: reason,
});

const view = (p: Awaited<ReturnType<PayoutService['find']>>) =>
  p && {
    bookingId: p.bookingId,
    providerId: p.providerId,
    status: p.status,
    grossPoisha: p.grossPoisha,
    commissionBasisPoints: p.commissionBasisPoints,
    commissionPoisha: p.commissionPoisha,
    netPoisha: p.netPoisha,
    refundedPoisha: p.refundedPoisha,
    eligibleAt: p.eligibleAt,
    freezeReason: p.freezeReason,
    paidAt: p.paidAt,
  };

export function registerPayoutRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; service: PayoutService },
) {
  const { db, authn, service } = deps;
  const admin = { preHandler: authn.requireRole('admin') };

  app.get('/admin/payouts', admin, async (request) => {
    const { status } = request.query as { status?: string };
    await service.syncPaid();
    const rows = await service.list(status as never);
    return { payouts: rows.map(view) };
  });

  app.post('/admin/payouts/run-batch', admin, async (request, reply) => {
    const adminId = request.currentUser!.id;
    const result = await service.runBatch(`manual-${Date.now()}`, `admin:${adminId}`);
    await recordAdminAction(db, {
      adminId,
      action: 'payout.batch_run_now',
      targetType: 'payout_batch',
      targetId: 'manual',
      payload: { sent: result.ok ? result.sent : 0, ok: result.ok },
    });
    if (!result.ok)
      return refuse(
        reply,
        503,
        'payout_unavailable',
        'The payout service is not available. Payouts stay queued.',
      );
    return { sent: result.sent };
  });

  app.post('/admin/bookings/:id/freeze', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { reason: why } = freezeSchema.parse(request.body);
    const adminId = request.currentUser!.id;
    const result = await service.freeze(id, why, `admin:${adminId}`);
    if (!result.ok) {
      const map = {
        not_found: [404, 'payout_not_found', 'No payout for this booking'],
        no_captured_payment: [
          409,
          'no_captured_payment',
          'Nothing has been captured for this booking',
        ],
        already_paid: [409, 'already_paid', 'This payout has already been paid'],
        unavailable: [503, 'payout_unavailable', 'The payout service is not available. Try again.'],
      } as const;
      const [status, code, message] = map[result.reason];
      return refuse(reply, status, code, message);
    }
    await recordAdminAction(db, {
      adminId,
      action: 'payout.frozen',
      targetType: 'booking',
      targetId: id,
      payload: { reason: why },
    });
    return { payout: view(result.payout) };
  });

  app.post('/admin/bookings/:id/release-freeze', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const adminId = request.currentUser!.id;
    const result = await service.releaseFreeze(id, `admin:${adminId}`);
    if (!result.ok)
      return result.reason === 'not_found'
        ? refuse(reply, 404, 'payout_not_found', 'No payout for this booking')
        : refuse(
            reply,
            503,
            'payout_unavailable',
            'The payout service is not available. Try again.',
          );
    await recordAdminAction(db, {
      adminId,
      action: 'payout.freeze_released',
      targetType: 'booking',
      targetId: id,
    });
    return { payout: view(result.payout) };
  });

  app.post('/admin/bookings/:id/refund', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = refundSchema.parse(request.body);
    const adminId = request.currentUser!.id;
    const result = await service.refund(id, input.amountPoisha, input.rationale, adminId);
    if (!result.ok) {
      const map = {
        not_found: [404, 'booking_not_found', 'No such booking'],
        wrong_state: [409, 'wrong_state', 'A refund needs a reported, resolved or no-show booking'],
        payout_already_sent: [
          409,
          'payout_already_sent',
          'The payout has already been sent to the provider',
        ],
        not_captured: [409, 'not_captured', 'Only captured money can be refunded'],
        exceeds_captured: [422, 'exceeds_captured', 'The refund is more than the amount captured'],
        invalid_amount: [422, 'invalid_amount', 'Enter a whole amount above zero'],
        declined: [502, 'refund_declined', 'The payment service refused the refund'],
        unavailable: [
          503,
          'payment_unavailable',
          'The payment service is not available. Try again.',
        ],
      } as const;
      const [status, code, message] = map[result.reason];
      return refuse(reply, status, code, message);
    }
    await recordAdminAction(db, {
      adminId,
      action: 'payment.refunded',
      targetType: 'booking',
      targetId: id,
      payload: { amountPoisha: input.amountPoisha, rationale: input.rationale },
    });
    return { refundedTotal: result.refundedTotal, payout: view(result.payout) };
  });
}
