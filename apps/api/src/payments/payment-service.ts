/**
 * Authorize at request, capture at confirmation, release when the stay does not go ahead (PAY-01..03).
 * Booking bolts call this in process. Every attempt and outcome is written to the append-only log (NFR-23).
 */
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { Clock } from '@petcare/shared/clock';
import type { PaymentMethod } from '@petcare/shared/payments';
import type { Database } from '../db/client.ts';
import { payments } from '../db/schema/index.ts';
import { appendLogEntry } from '../log/append.ts';
import { PaymentDeclinedError, PaymentUnavailableError, type PaymentPort } from './port.ts';

export type PaymentRow = typeof payments.$inferSelect;

export type AuthorizeResult =
  | { ok: true; payment: PaymentRow; alreadyAuthorized: boolean }
  | { ok: false; reason: 'declined' | 'unavailable' | 'invalid_amount' | 'invalid_state' };
export type CaptureResult =
  | { ok: true; payment: PaymentRow; alreadyCaptured: boolean }
  | { ok: false; reason: 'declined' | 'unavailable' | 'not_found' | 'not_authorized' };
export type ReleaseResult =
  { ok: true; released: boolean; pending: boolean } | { ok: false; reason: 'captured' };

export function createPaymentService(deps: { db: Database; port: PaymentPort; clock: Clock }) {
  const { db, port, clock } = deps;

  const find = async (bookingId: string) => {
    const [row] = await db.select().from(payments).where(eq(payments.bookingId, bookingId));
    return row ?? null;
  };
  const update = async (id: string, values: Partial<typeof payments.$inferInsert>) => {
    const [row] = await db
      .update(payments)
      .set({ ...values, updatedAt: clock.now() })
      .where(eq(payments.id, id))
      .returning();
    return row!;
  };
  const log = (
    bookingId: string,
    actor: string,
    action: string,
    row: PaymentRow | null,
    extra: Record<string, unknown> = {},
  ) =>
    appendLogEntry(db, {
      kind: 'payment_event',
      actor,
      action,
      targetType: 'booking',
      targetId: bookingId,
      at: clock.now(),
      payload: {
        paymentId: row?.id ?? null,
        gatewayRef: row?.gatewayRef ?? null,
        method: row?.method ?? null,
        amountPoisha: row?.amountPoisha ?? null,
        ...extra,
      },
    });

  /** Place a hold for the stay total. Safe to call again for the same booking: it never places a second hold. */
  async function authorize(input: {
    bookingId: string;
    ownerId: string;
    providerId: string;
    method: PaymentMethod;
    amountPoisha: number;
  }): Promise<AuthorizeResult> {
    if (!Number.isInteger(input.amountPoisha) || input.amountPoisha <= 0)
      return { ok: false, reason: 'invalid_amount' };
    const actor = `owner:${input.ownerId}`;
    let row: PaymentRow | null | undefined = await find(input.bookingId);
    if (row?.status === 'authorized' || row?.status === 'captured')
      return { ok: true, payment: row, alreadyAuthorized: true };
    if (row?.status === 'declined') return { ok: false, reason: 'declined' };
    if (row && row.status !== 'authorizing') return { ok: false, reason: 'invalid_state' };
    if (!row) {
      [row] = await db
        .insert(payments)
        .values({
          id: `pay_${randomUUID()}`,
          bookingId: input.bookingId,
          ownerId: input.ownerId,
          providerId: input.providerId,
          method: input.method,
          amountPoisha: input.amountPoisha,
          status: 'authorizing',
        })
        .returning();
    }
    await log(input.bookingId, actor, 'authorize_attempt', row!);
    try {
      const gateway = await port.authorize({
        method: row!.method,
        amountPoisha: row!.amountPoisha,
        bookingRef: input.bookingId,
        idempotencyKey: `auth-${input.bookingId}`,
      });
      const saved = await update(row!.id, {
        status: 'authorized',
        authorizationId: gateway.authorizationId,
        gatewayPaymentId: gateway.paymentId,
        gatewayRef: gateway.gatewayRef,
        lastError: null,
      });
      await log(input.bookingId, actor, 'authorized', saved);
      return { ok: true, payment: saved, alreadyAuthorized: false };
    } catch (error) {
      if (error instanceof PaymentDeclinedError) {
        const saved = await update(row!.id, { status: 'declined', lastError: 'declined' });
        await log(input.bookingId, actor, 'authorize_declined', saved);
        return { ok: false, reason: 'declined' };
      }
      if (error instanceof PaymentUnavailableError) {
        // Stays "authorizing": the next attempt asks again with the same key, so a hold made but not
        // reported is found instead of duplicated.
        await update(row!.id, { lastError: 'unavailable' });
        await log(input.bookingId, actor, 'authorize_unavailable', row!);
        return { ok: false, reason: 'unavailable' };
      }
      throw error;
    }
  }

  /** Take the held amount once, when the provider confirms. Retrying never captures twice. */
  async function capture(bookingId: string): Promise<CaptureResult> {
    const row = await find(bookingId);
    if (!row) return { ok: false, reason: 'not_found' };
    if (row.status === 'captured') return { ok: true, payment: row, alreadyCaptured: true };
    if (row.status !== 'authorized' || !row.authorizationId)
      return { ok: false, reason: 'not_authorized' };
    const actor = `provider:${row.providerId}`;
    await log(bookingId, actor, 'capture_attempt', row);
    try {
      await port.capture(row.authorizationId, `cap-${bookingId}`);
      const saved = await update(row.id, {
        status: 'captured',
        capturedAt: clock.now(),
        lastError: null,
      });
      await log(bookingId, actor, 'captured', saved);
      return { ok: true, payment: saved, alreadyCaptured: false };
    } catch (error) {
      const reason = error instanceof PaymentDeclinedError ? 'declined' : 'unavailable';
      if (!(error instanceof PaymentDeclinedError) && !(error instanceof PaymentUnavailableError))
        throw error;
      await update(row.id, { lastError: `capture_${reason}` });
      await log(bookingId, actor, 'capture_failed', row, { reason });
      return { ok: false, reason };
    }
  }

  /** Give back the hold (decline, timeout, cancellation before confirmation). Repeating changes nothing. */
  async function release(bookingId: string, actor = 'system'): Promise<ReleaseResult> {
    const row = await find(bookingId);
    if (!row || row.status === 'released' || row.status === 'declined')
      return { ok: true, released: false, pending: false };
    if (row.status === 'captured') return { ok: false, reason: 'captured' };
    if (row.status === 'authorizing' && !row.authorizationId) {
      // No hold is known. If the hold was made but not reported, it is found again by the same key before releasing.
      const found = await authorize({
        bookingId,
        ownerId: row.ownerId,
        providerId: row.providerId,
        method: row.method,
        amountPoisha: row.amountPoisha,
      });
      if (!found.ok && found.reason === 'declined')
        return { ok: true, released: false, pending: false };
      if (!found.ok) {
        await update(row.id, { status: 'release_pending', lastError: 'release_unavailable' });
        await log(bookingId, actor, 'release_pending', row);
        return { ok: true, released: false, pending: true };
      }
      return release(bookingId, actor);
    }
    await log(bookingId, actor, 'release_requested', row);
    try {
      await port.release(row.authorizationId!);
      const saved = await update(row.id, {
        status: 'released',
        releasedAt: clock.now(),
        lastError: null,
      });
      await log(bookingId, actor, 'released', saved);
      return { ok: true, released: true, pending: false };
    } catch (error) {
      if (!(error instanceof PaymentUnavailableError) && !(error instanceof PaymentDeclinedError))
        throw error;
      await update(row.id, { status: 'release_pending', lastError: 'release_unavailable' });
      await log(bookingId, actor, 'release_failed', row);
      return { ok: true, released: false, pending: true };
    }
  }

  const pendingReleases = () =>
    db.select().from(payments).where(eq(payments.status, 'release_pending'));

  /** Retry every release that could not be finished. Returns how many were completed. */
  async function retryPendingReleases(actor = 'system') {
    let done = 0;
    for (const row of await pendingReleases()) {
      const result = await release(row.bookingId, actor);
      if (result.ok && result.released) done++;
    }
    return { completed: done, stillPending: (await pendingReleases()).length };
  }

  return { find, authorize, capture, release, pendingReleases, retryPendingReleases };
}

export type PaymentService = ReturnType<typeof createPaymentService>;
