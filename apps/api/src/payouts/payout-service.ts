/**
 * Provider payouts (PAY-04..06): queue at completion, weekly batch, freeze and release, refund.
 * Money safety: one batch key per run so nothing is paid twice, a down payout service leaves payouts queued,
 * and every step is a payment event in the append-only log.
 */
import { randomUUID } from 'node:crypto';
import { and, desc, eq, lte } from 'drizzle-orm';
import type { Clock } from '@petcare/shared/clock';
import { trainingDecisions } from '@petcare/shared/config';
import { commissionOn, netPayoutPoisha } from '@petcare/shared/payments';
import { exclusive } from '../bookings/lock.ts';
import { transitionBooking } from '../bookings/transitions.ts';
import { dhakaToday } from '../capacity/dates.ts';
import type { Database } from '../db/client.ts';
import { bookings, payoutBatches, payouts } from '../db/schema/index.ts';
import { appendLogEntry } from '../log/append.ts';
import { dhakaMinutes } from '../stay/stay-service.ts';
import type { PaymentService } from '../payments/payment-service.ts';
import { PayoutRefusedError, PayoutUnavailableError, type PayoutPort } from './port.ts';

export type PayoutRow = typeof payouts.$inferSelect;
const LOCK = 'payouts';
const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h! * 60 + m!;
};

export type FreezeResult =
  | { ok: true; payout: PayoutRow; already: boolean }
  | { ok: false; reason: 'not_found' | 'already_paid' | 'unavailable' | 'no_captured_payment' };
export type RefundResult =
  | { ok: true; refundedTotal: number; payout: PayoutRow | null }
  | {
      ok: false;
      reason:
        | 'not_found'
        | 'wrong_state'
        | 'payout_already_sent'
        | 'not_captured'
        | 'exceeds_captured'
        | 'invalid_amount'
        | 'declined'
        | 'unavailable';
    };

export function createPayoutService(deps: {
  db: Database;
  port: PayoutPort;
  payments: PaymentService;
  clock: Clock;
}) {
  const { db, port, payments, clock } = deps;

  const find = async (bookingId: string) => {
    const [row] = await db.select().from(payouts).where(eq(payouts.bookingId, bookingId));
    return row ?? null;
  };
  const update = async (id: string, values: Partial<typeof payouts.$inferInsert>) => {
    const [row] = await db
      .update(payouts)
      .set({ ...values, updatedAt: clock.now() })
      .where(eq(payouts.id, id))
      .returning();
    return row!;
  };
  const log = (
    bookingId: string,
    actor: string,
    action: string,
    extra: Record<string, unknown> = {},
  ) =>
    appendLogEntry(db, {
      kind: 'payment_event',
      actor,
      action,
      targetType: 'booking',
      targetId: bookingId,
      at: clock.now(),
      payload: extra,
    });

  /** Create the payout row from the captured payment and the commission fixed at confirmation. */
  async function ensure(bookingId: string, status: 'queued' | 'frozen', eligibleAt: Date) {
    const existing = await find(bookingId);
    if (existing) return existing;
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    const payment = await payments.find(bookingId);
    if (!booking || booking.commissionBasisPoints === null || payment?.status !== 'captured')
      return null;
    const gross = payment.amountPoisha - payment.refundedPoisha;
    const commission = commissionOn(gross, booking.commissionBasisPoints);
    const [row] = await db
      .insert(payouts)
      .values({
        id: `po_${randomUUID()}`,
        bookingId,
        providerId: booking.providerId,
        grossPoisha: gross,
        commissionBasisPoints: booking.commissionBasisPoints,
        commissionPoisha: commission,
        netPoisha: netPayoutPoisha(gross, booking.commissionBasisPoints),
        status,
        eligibleAt,
      })
      .returning();
    return row!;
  }

  /** Called when completion is confirmed: the payout is queued and becomes payable once the dispute window closes. */
  async function queueForBooking(bookingId: string, completedAt: Date = clock.now()) {
    return exclusive(LOCK, async () => {
      const eligibleAt = new Date(
        completedAt.getTime() + trainingDecisions.disputeWindowMinutes * 60_000,
      );
      const existing = await find(bookingId);
      if (existing) {
        if (existing.status === 'queued' || existing.status === 'frozen')
          return update(existing.id, { eligibleAt });
        return existing;
      }
      const row = await ensure(bookingId, 'queued', eligibleAt);
      if (row)
        await log(bookingId, 'system', 'payout_queued', { netPoisha: row.netPoisha, eligibleAt });
      return row;
    });
  }

  /** Send every queued, unfrozen payout whose dispute window has closed. One batch key per run: a repeat pays nothing twice. */
  async function runBatch(runKey: string, actor = 'system') {
    return exclusive(LOCK, async () => {
      const already = await db.select().from(payoutBatches).where(eq(payoutBatches.runKey, runKey));
      if (already.length > 0) return { ok: true as const, sent: 0, alreadyRun: true };
      const due = await db
        .select()
        .from(payouts)
        .where(and(eq(payouts.status, 'queued'), lte(payouts.eligibleAt, clock.now())));
      if (due.length === 0) return { ok: true as const, sent: 0, alreadyRun: false };
      try {
        const sent = await port.createBatch({
          batchRef: runKey,
          idempotencyKey: `batch-${runKey}`,
          lines: due.map((p) => ({
            bookingRef: p.bookingId,
            providerRef: p.providerId,
            amountPoisha: p.netPoisha,
          })),
        });
        const batchId = `pb_${randomUUID()}`;
        await db.insert(payoutBatches).values({
          id: batchId,
          runKey,
          gatewayBatchId: sent.gatewayBatchId,
          lineCount: due.length,
          totalPoisha: due.reduce((sum, p) => sum + p.netPoisha, 0),
        });
        for (const p of due) {
          const gatewayPayoutId = sent.payouts.find(
            (s) => s.bookingRef === p.bookingId,
          )?.gatewayPayoutId;
          await update(p.id, { status: 'sent', batchId, gatewayPayoutId: gatewayPayoutId ?? null });
          await log(p.bookingId, actor, 'payout_sent', { netPoisha: p.netPoisha, runKey });
        }
        return { ok: true as const, sent: due.length, alreadyRun: false };
      } catch (error) {
        if (!(error instanceof PayoutUnavailableError) && !(error instanceof PayoutRefusedError))
          throw error;
        // Everything stays queued; the next run sends it once.
        await log('batch', actor, 'batch_failed', { runKey, lines: due.length });
        return { ok: false as const, reason: 'unavailable' as const };
      }
    });
  }

  /** The weekly batch time in Dhaka (TD-3): runs the week's batch once it is due, retrying each tick until it succeeds. */
  async function runScheduledBatch() {
    const today = dhakaToday(clock);
    const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
    const { dayOfWeek, localTime } = trainingDecisions.payoutBatch;
    if (weekday !== dayOfWeek || dhakaMinutes(clock) < minutesOf(localTime)) return null;
    return runBatch(`weekly-${today}`);
  }

  /** Mark payouts the gateway has settled as paid. */
  async function syncPaid() {
    let paid = 0;
    const sent = await db.select().from(payouts).where(eq(payouts.status, 'sent'));
    for (const p of sent) {
      try {
        if (p.gatewayPayoutId && (await port.status(p.gatewayPayoutId)) === 'paid') {
          await update(p.id, { status: 'paid', paidAt: clock.now() });
          await log(p.bookingId, 'system', 'payout_paid', { netPoisha: p.netPoisha });
          paid++;
        }
      } catch {
        // The payout service is not answering; try again next time.
      }
    }
    return { paid };
  }

  async function freeze(bookingId: string, reason: string, actor: string): Promise<FreezeResult> {
    return exclusive(LOCK, async (): Promise<FreezeResult> => {
      await syncPaid();
      let row = await find(bookingId);
      if (!row) {
        const eligibleAt = new Date(
          clock.now().getTime() + trainingDecisions.disputeWindowMinutes * 60_000,
        );
        row = await ensure(bookingId, 'frozen', eligibleAt);
        if (!row) return { ok: false, reason: 'no_captured_payment' };
        const saved = await update(row.id, { freezeReason: reason, frozenAt: clock.now() });
        await log(bookingId, actor, 'payout_frozen', { reason });
        return { ok: true, payout: saved, already: false };
      }
      if (row.status === 'paid') return { ok: false, reason: 'already_paid' };
      if (row.status === 'cancelled') return { ok: false, reason: 'not_found' };
      if (row.status === 'frozen') return { ok: true, payout: row, already: true };
      if (row.status === 'sent' && row.gatewayPayoutId) {
        try {
          await port.freeze(row.gatewayPayoutId);
        } catch (error) {
          if (error instanceof PayoutRefusedError) return { ok: false, reason: 'already_paid' };
          if (error instanceof PayoutUnavailableError) return { ok: false, reason: 'unavailable' };
          throw error;
        }
      }
      const saved = await update(row.id, {
        status: 'frozen',
        freezeReason: reason,
        frozenAt: clock.now(),
      });
      await log(bookingId, actor, 'payout_frozen', { reason });
      return { ok: true, payout: saved, already: false };
    });
  }

  async function releaseFreeze(bookingId: string, actor: string): Promise<FreezeResult> {
    return exclusive(LOCK, async (): Promise<FreezeResult> => {
      const row = await find(bookingId);
      if (!row) return { ok: false, reason: 'not_found' };
      if (row.status !== 'frozen') return { ok: true, payout: row, already: true };
      if (row.gatewayPayoutId) {
        try {
          await port.release(row.gatewayPayoutId);
        } catch (error) {
          if (error instanceof PayoutRefusedError) return { ok: false, reason: 'already_paid' };
          if (error instanceof PayoutUnavailableError) return { ok: false, reason: 'unavailable' };
          throw error;
        }
      }
      const saved = await update(row.id, {
        status: row.gatewayPayoutId ? 'sent' : 'queued',
        freezeReason: null,
        frozenAt: null,
      });
      await log(bookingId, actor, 'freeze_released', {});
      return { ok: true, payout: saved, already: false };
    });
  }

  /** Admin refund: up to what was captured, back to the original method; the payout is recomputed on what remains. */
  async function refund(
    bookingId: string,
    amountPoisha: number,
    rationale: string,
    adminId: string,
  ): Promise<RefundResult> {
    const actor = `admin:${adminId}`;
    return exclusive(LOCK, async (): Promise<RefundResult> => {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
      if (!booking) return { ok: false, reason: 'not_found' };
      if (!['disputed', 'resolved', 'no_show'].includes(booking.state))
        return { ok: false, reason: 'wrong_state' };
      await syncPaid();
      const payout = await find(bookingId);
      if (payout && (payout.status === 'sent' || payout.status === 'paid'))
        return { ok: false, reason: 'payout_already_sent' };

      const result = await payments.refund(bookingId, amountPoisha, actor, rationale);
      if (!result.ok)
        return { ok: false, reason: result.reason === 'not_found' ? 'not_found' : result.reason };

      let saved: PayoutRow | null = null;
      if (payout) {
        const captured = result.payment.amountPoisha;
        const remaining = captured - result.refundedTotal;
        const commission = commissionOn(remaining, payout.commissionBasisPoints);
        saved = await update(payout.id, {
          grossPoisha: remaining,
          commissionPoisha: commission,
          netPoisha: remaining - commission,
          refundedPoisha: result.refundedTotal,
          // A full refund leaves nothing to pay; otherwise the remaining payout is released net.
          status: remaining === 0 ? 'cancelled' : 'queued',
          freezeReason: null,
          frozenAt: null,
        });
        await log(bookingId, actor, 'payout_adjusted', {
          remainingGrossPoisha: remaining,
          netPoisha: saved.netPoisha,
          status: saved.status,
        });
      }
      await transitionBooking(db, clock, {
        bookingId,
        to: 'refunded',
        trigger: 'admin_action',
        actor,
      });
      return { ok: true, refundedTotal: result.refundedTotal, payout: saved };
    });
  }

  const list = async (status?: PayoutRow['status']) => {
    const rows = await db.select().from(payouts).orderBy(desc(payouts.createdAt));
    return status ? rows.filter((r) => r.status === status) : rows;
  };

  return {
    find,
    queueForBooking,
    runBatch,
    runScheduledBatch,
    syncPaid,
    freeze,
    releaseFreeze,
    refund,
    list,
  };
}

export type PayoutService = ReturnType<typeof createPayoutService>;
