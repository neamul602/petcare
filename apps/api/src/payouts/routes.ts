/** Admin payout endpoints: list, run the batch now (same rules as the weekly run), freeze, release, refund. */
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { recordAdminAction } from '../auth/audit.ts';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import { desc, eq } from 'drizzle-orm';
import { bookings, payoutBatches, payouts, providers } from '../db/schema/index.ts';
import type { PayoutPort } from './port.ts';
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

/** Provider earnings (PAY-07) and the admin payout overview with reconciliation (PAY-08). */
export function registerEarningsRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; port?: PayoutPort },
) {
  const { db, authn, port } = deps;

  /** The Sunday batch a payout falls into: the first Sunday on or after it becomes payable. */
  const payoutWeek = (eligible: Date) => {
    const d = new Date(
      Date.UTC(eligible.getUTCFullYear(), eligible.getUTCMonth(), eligible.getUTCDate()),
    );
    d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7));
    return d.toISOString().slice(0, 10);
  };

  app.get(
    '/provider/earnings',
    { preHandler: authn.requireRole('provider') },
    async (request, reply) => {
      const [mine] = await db
        .select()
        .from(providers)
        .where(eq(providers.userId, request.currentUser!.id));
      if (!mine)
        return refuse(reply, 404, 'no_provider_record', 'No provider record for this account');
      const rows = await db
        .select({ p: payouts, b: bookings })
        .from(payouts)
        .innerJoin(bookings, eq(payouts.bookingId, bookings.id))
        .where(eq(payouts.providerId, mine.id))
        .orderBy(desc(payouts.eligibleAt));
      const weeks = new Map<string, unknown[]>();
      for (const { p, b } of rows) {
        const week = payoutWeek(p.eligibleAt);
        const line = {
          bookingId: p.bookingId,
          pet: (b.petSnapshot as { name?: string }).name ?? '',
          startDate: b.startDate,
          endDate: b.endDate,
          grossPoisha: p.grossPoisha,
          commissionBasisPoints: p.commissionBasisPoints,
          commissionPoisha: p.commissionPoisha,
          netPoisha: p.netPoisha,
          status: p.status,
          freezeReason: p.freezeReason,
        };
        weeks.set(week, [...(weeks.get(week) ?? []), line]);
      }
      return { weeks: [...weeks.entries()].map(([week, lines]) => ({ week, lines })) };
    },
  );

  app.get('/admin/payouts/overview', { preHandler: authn.requireRole('admin') }, async () => {
    const batches = await db.select().from(payoutBatches).orderBy(desc(payoutBatches.createdAt));
    const all = await db.select().from(payouts);
    const batchView = batches.map((b) => ({
      id: b.id,
      runKey: b.runKey,
      createdAt: b.createdAt,
      lineCount: b.lineCount,
      totalPoisha: b.totalPoisha,
      lines: all
        .filter((p) => p.batchId === b.id)
        .map((p) => ({
          bookingId: p.bookingId,
          providerId: p.providerId,
          netPoisha: p.netPoisha,
          status: p.status,
        })),
    }));
    const frozen = all
      .filter((p) => p.status === 'frozen')
      .map((p) => ({
        bookingId: p.bookingId,
        providerId: p.providerId,
        netPoisha: p.netPoisha,
        reason: p.freezeReason,
      }));

    // Reconciliation: what we sent against what the payout rail holds.
    let reconciliation: {
      available: boolean;
      localTotalPoisha: number;
      gatewayTotalPoisha: number;
      matches: boolean;
      mismatches: Array<{
        bookingId: string;
        kind: string;
        localPoisha?: number;
        gatewayPoisha?: number;
      }>;
    };
    const sent = all.filter(
      (p) => ['sent', 'paid', 'frozen'].includes(p.status) && p.gatewayPayoutId,
    );
    const localTotal = sent.reduce((sum, p) => sum + p.netPoisha, 0);
    try {
      const rail = port ? await port.listAll() : [];
      const mismatches: Array<{
        bookingId: string;
        kind: string;
        localPoisha?: number;
        gatewayPoisha?: number;
      }> = [];
      for (const p of sent) {
        const g = rail.find((r) => r.gatewayPayoutId === p.gatewayPayoutId);
        if (!g)
          mismatches.push({
            bookingId: p.bookingId,
            kind: 'missing_at_gateway',
            localPoisha: p.netPoisha,
          });
        else if (g.amountPoisha !== p.netPoisha)
          mismatches.push({
            bookingId: p.bookingId,
            kind: 'amount_differs',
            localPoisha: p.netPoisha,
            gatewayPoisha: g.amountPoisha,
          });
      }
      for (const g of rail)
        if (!sent.some((p) => p.gatewayPayoutId === g.gatewayPayoutId))
          mismatches.push({
            bookingId: g.bookingRef,
            kind: 'unknown_locally',
            gatewayPoisha: g.amountPoisha,
          });
      reconciliation = {
        available: true,
        localTotalPoisha: localTotal,
        gatewayTotalPoisha: rail.reduce((sum, r) => sum + r.amountPoisha, 0),
        matches: mismatches.length === 0,
        mismatches,
      };
    } catch {
      reconciliation = {
        available: false,
        localTotalPoisha: localTotal,
        gatewayTotalPoisha: 0,
        matches: false,
        mismatches: [],
      };
    }
    return { batches: batchView, frozen, reconciliation };
  });
}
