/**
 * Dummy MFS Payout API (training contract, not a real MFS interface).
 *   POST /api/payouts/batches                 { batchRef?, lines: [{ bookingRef, providerRef, amount }] }
 *   POST /api/payouts/:payoutId/freeze
 *   POST /api/payouts/:payoutId/release
 *   GET  /api/payouts/:payoutId
 * A batch creates one queued payout per line. A queued payout becomes paid once the settlement
 * delay has passed (default one minute, standing in for MFS settlement time), unless it is frozen
 * first. Release returns a frozen payout to the queue. Batches need an Idempotency-Key.
 * Training control: POST /_training/payouts/settle-now pays every queued payout immediately.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ApiError } from '../core/errors.ts';
import { requireIdempotencyKey, type ActionResult, type DummyService } from '../core/service.ts';

type Status = 'queued' | 'frozen' | 'paid';

interface Payout {
  id: string;
  batchId: string;
  bookingRef: string;
  providerRef: string;
  amount: number;
  currency: 'BDT';
  status: Status;
  settleAt: string;
  frozenAt?: string;
  paidAt?: string;
}
interface Batch {
  id: string;
  batchRef?: string;
  createdAt: string;
  payoutIds: string[];
}

const batchBody = z.strictObject({
  batchRef: z.string().min(1).max(64).optional(),
  lines: z
    .array(
      z.strictObject({
        bookingRef: z.string().min(1).max(64),
        providerRef: z.string().min(1).max(64),
        amount: z.number().int().positive().max(1_000_000_000),
      }),
    )
    .min(1)
    .max(500),
});

export function registerPayouts(app: FastifyInstance, svc: DummyService) {
  const payouts = new Map<string, Payout>();
  const batches = new Map<string, Batch>();
  svc.onReset(() => {
    payouts.clear();
    batches.clear();
  });

  /** Queued payouts whose settlement time has come are paid; this runs before every read or change. */
  const settleDue = () => {
    const now = svc.ctx.now();
    for (const payout of payouts.values()) {
      if (payout.status === 'queued' && now.getTime() >= Date.parse(payout.settleAt)) {
        payout.status = 'paid';
        payout.paidAt = now.toISOString();
      }
    }
  };
  svc.describeWith(() => {
    settleDue();
    return { batches: [...batches.values()], payouts: [...payouts.values()] };
  });
  svc.attach(app);

  const payoutOr404 = (id: string) => {
    settleDue();
    const found = payouts.get(id);
    if (!found) throw new ApiError(404, 'payout_not_found', `No payout ${id}`);
    return found;
  };
  const batchView = (batch: Batch) => ({
    ...batch,
    payouts: batch.payoutIds.map((id) => payouts.get(id)),
  });

  app.post('/api/payouts/batches', async (request, reply) => {
    const key = requireIdempotencyKey(request);
    const body = batchBody.parse(request.body);
    return svc.run(
      request,
      reply,
      (): ActionResult => {
        const now = svc.ctx.now();
        const batch: Batch = {
          id: svc.ids.next('batch'),
          batchRef: body.batchRef,
          createdAt: now.toISOString(),
          payoutIds: [],
        };
        for (const line of body.lines) {
          const payout: Payout = {
            id: svc.ids.next('po'),
            batchId: batch.id,
            ...line,
            currency: 'BDT',
            status: 'queued',
            settleAt: new Date(now.getTime() + svc.ctx.payoutSettleMs).toISOString(),
          };
          payouts.set(payout.id, payout);
          batch.payoutIds.push(payout.id);
        }
        batches.set(batch.id, batch);
        return { status: 201, body: batchView(batch) };
      },
      { idempotencyKey: key },
    );
  });

  app.post('/api/payouts/:payoutId/freeze', async (request, reply) => {
    const { payoutId } = request.params as { payoutId: string };
    return svc.run(request, reply, (): ActionResult => {
      const payout = payoutOr404(payoutId);
      if (payout.status === 'paid')
        throw new ApiError(409, 'already_paid', 'A paid payout cannot be frozen');
      if (payout.status === 'queued') {
        payout.status = 'frozen';
        payout.frozenAt = svc.ctx.now().toISOString();
      }
      return { status: 200, body: payout };
    });
  });

  app.post('/api/payouts/:payoutId/release', async (request, reply) => {
    const { payoutId } = request.params as { payoutId: string };
    return svc.run(request, reply, (): ActionResult => {
      const payout = payoutOr404(payoutId);
      if (payout.status === 'paid')
        throw new ApiError(409, 'already_paid', 'A paid payout cannot be released');
      if (payout.status === 'frozen') {
        payout.status = 'queued';
        payout.frozenAt = undefined;
        payout.settleAt = new Date(svc.ctx.now().getTime() + svc.ctx.payoutSettleMs).toISOString();
      }
      return { status: 200, body: payout };
    });
  });

  app.get('/api/payouts/:payoutId', async (request, reply) => {
    const { payoutId } = request.params as { payoutId: string };
    return svc.run(request, reply, (): ActionResult => ({
      status: 200,
      body: payoutOr404(payoutId),
    }));
  });

  app.post('/_training/payouts/settle-now', async () => {
    const now = svc.ctx.now();
    let paid = 0;
    for (const payout of payouts.values()) {
      if (payout.status === 'queued') {
        payout.status = 'paid';
        payout.paidAt = now.toISOString();
        paid += 1;
      }
    }
    return { status: 'settled', paid };
  });
}
