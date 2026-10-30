/**
 * Completion and the paths after confirmation (BKG-15, BKG-11). Provider marks complete, owner confirms;
 * if the owner never does, the admin can complete the stay after its end date (Q-S1). Cancellations and
 * no-shows are never automatic: they become admin queue items (TD-6).
 */
import { and, eq } from 'drizzle-orm';
import type { Clock } from '@petcare/shared/clock';
import type { CarePlan } from '@petcare/shared/pets';
import { releaseNights } from '../capacity/nights.ts';
import { dhakaToday } from '../capacity/dates.ts';
import type { Database } from '../db/client.ts';
import { bookings, providers } from '../db/schema/index.ts';
import type { PaymentService } from '../payments/payment-service.ts';
import type { PayoutService } from '../payouts/payout-service.ts';
import { recordCareHistory } from '../pets/care-history.ts';
import { raiseFlag, resolveFlags } from './flags.ts';
import { exclusive } from './lock.ts';
import { transitionBooking, type BookingRow } from './transitions.ts';

type Fail<R extends string> = { ok: false; reason: R };
export type SimpleResult<R extends string> = { ok: true; booking: BookingRow } | Fail<R>;

export function createCompletionService(deps: {
  db: Database;
  payments: PaymentService;
  payouts?: PayoutService;
  clock: Clock;
}) {
  const { db, payments, payouts, clock } = deps;

  const providerBooking = async (providerUserId: string, bookingId: string) => {
    const [row] = await db
      .select({ booking: bookings })
      .from(bookings)
      .innerJoin(providers, eq(bookings.providerId, providers.id))
      .where(and(eq(bookings.id, bookingId), eq(providers.userId, providerUserId)));
    return row?.booking ?? null;
  };
  const ownerBooking = async (ownerId: string, bookingId: string) => {
    const [row] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.ownerId, ownerId)));
    return row ?? null;
  };

  /** Shared by owner confirmation and admin completion. */
  async function finish(
    bookingId: string,
    trigger: 'owner_confirmed' | 'admin_action',
    actor: string,
  ): Promise<SimpleResult<'not_in_stay'>> {
    const completedAt = clock.now();
    const moved = await transitionBooking(db, clock, {
      bookingId,
      to: 'completed',
      trigger,
      actor,
      expectedFrom: 'in_stay',
      set: { completedAt },
    });
    if (!moved.ok) return { ok: false, reason: 'not_in_stay' };
    const b = moved.booking;
    await recordCareHistory(db, {
      petId: b.petId,
      bookingId,
      providerId: b.providerId,
      startDate: b.startDate,
      endDate: b.endDate,
      outcome: 'completed',
      carePlanSnapshot: b.carePlan as CarePlan,
    });
    await payouts?.queueForBooking(bookingId, completedAt);
    return { ok: true, booking: b };
  }

  async function providerMarksComplete(providerUserId: string, bookingId: string) {
    if (!(await providerBooking(providerUserId, bookingId)))
      return { ok: false as const, reason: 'not_found' as const };
    return exclusive(
      bookingId,
      async (): Promise<SimpleResult<'not_found' | 'not_in_stay' | 'too_early'>> => {
        const b = (await providerBooking(providerUserId, bookingId))!;
        if (b.state !== 'in_stay') return { ok: false, reason: 'not_in_stay' };
        if (dhakaToday(clock) < b.endDate) return { ok: false, reason: 'too_early' };
        if (b.completionRequestedAt) return { ok: true, booking: b };
        const [updated] = await db
          .update(bookings)
          .set({ completionRequestedAt: clock.now(), updatedAt: clock.now() })
          .where(eq(bookings.id, bookingId))
          .returning();
        return { ok: true, booking: updated! };
      },
    );
  }

  async function ownerConfirmsCompletion(ownerId: string, bookingId: string) {
    if (!(await ownerBooking(ownerId, bookingId)))
      return { ok: false as const, reason: 'not_found' as const };
    return exclusive(
      bookingId,
      async (): Promise<SimpleResult<'not_found' | 'not_in_stay' | 'not_requested'>> => {
        const b = (await ownerBooking(ownerId, bookingId))!;
        if (b.state === 'completed') return { ok: true, booking: b };
        if (b.state !== 'in_stay') return { ok: false, reason: 'not_in_stay' };
        if (!b.completionRequestedAt) return { ok: false, reason: 'not_requested' };
        return finish(bookingId, 'owner_confirmed', `owner:${ownerId}`);
      },
    );
  }

  /** Q-S1: the owner never confirmed, so the admin completes the stay once its end date has passed. */
  async function adminCompletes(adminId: string, bookingId: string) {
    return exclusive(
      bookingId,
      async (): Promise<SimpleResult<'not_found' | 'not_in_stay' | 'too_early'>> => {
        const [b] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
        if (!b) return { ok: false, reason: 'not_found' };
        if (b.state !== 'in_stay') return { ok: false, reason: 'not_in_stay' };
        if (dhakaToday(clock) <= b.endDate) return { ok: false, reason: 'too_early' };
        return finish(bookingId, 'admin_action', `admin:${adminId}`);
      },
    );
  }

  /** The owner asks to cancel a confirmed booking: a queue item, no automatic refund (TD-6). */
  async function ownerRequestsCancellation(ownerId: string, bookingId: string, note: string) {
    const b = await ownerBooking(ownerId, bookingId);
    if (!b) return { ok: false as const, reason: 'not_found' as const };
    if (b.state !== 'captured') return { ok: false as const, reason: 'not_confirmed' as const };
    const raised = await raiseFlag(db, clock, {
      bookingId,
      kind: 'owner_cancellation_request',
      note,
      raisedBy: `owner:${ownerId}`,
    });
    return { ok: true as const, flag: raised.flag };
  }

  /** The provider cancels after confirming: a queue item; the admin reassigns or refunds in full. */
  async function providerCancels(providerUserId: string, bookingId: string, note: string) {
    const b = await providerBooking(providerUserId, bookingId);
    if (!b) return { ok: false as const, reason: 'not_found' as const };
    if (b.state !== 'captured') return { ok: false as const, reason: 'not_confirmed' as const };
    const raised = await raiseFlag(db, clock, {
      bookingId,
      kind: 'provider_cancellation',
      note,
      raisedBy: `provider:${b.providerId}`,
    });
    return { ok: true as const, flag: raised.flag };
  }

  /** The provider says the owner did not arrive: the booking becomes no-show and waits for the admin. */
  async function providerFlagsNoShow(providerUserId: string, bookingId: string, note: string) {
    if (!(await providerBooking(providerUserId, bookingId)))
      return { ok: false as const, reason: 'not_found' as const };
    return exclusive(
      bookingId,
      async (): Promise<SimpleResult<'not_found' | 'not_confirmed' | 'too_early'>> => {
        const b = (await providerBooking(providerUserId, bookingId))!;
        if (b.state !== 'captured') return { ok: false, reason: 'not_confirmed' };
        if (dhakaToday(clock) < b.startDate) return { ok: false, reason: 'too_early' };
        const moved = await transitionBooking(db, clock, {
          bookingId,
          to: 'no_show',
          trigger: 'provider_flagged_no_show',
          actor: `provider:${b.providerId}`,
          expectedFrom: 'captured',
        });
        if (!moved.ok) return { ok: false, reason: 'not_confirmed' };
        await raiseFlag(db, clock, {
          bookingId,
          kind: 'owner_no_show',
          note,
          raisedBy: `provider:${b.providerId}`,
        });
        return { ok: true, booking: moved.booking };
      },
    );
  }

  type Decision =
    | { ok: true }
    | {
        ok: false;
        reason: 'not_found' | 'wrong_state' | 'refund_failed' | 'invalid_amount';
        detail?: string;
      };

  /** Admin decision on a cancellation (owner request or provider cancellation). */
  async function adminResolvesCancellation(
    adminId: string,
    bookingId: string,
    input: {
      decision: 'refund_full' | 'refund_partial' | 'no_action';
      amountPoisha?: number;
      note: string;
    },
  ): Promise<Decision> {
    const actor = `admin:${adminId}`;
    return exclusive(bookingId, async (): Promise<Decision> => {
      const [b] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
      if (!b) return { ok: false, reason: 'not_found' };
      if (b.state !== 'captured') return { ok: false, reason: 'wrong_state' };
      const kinds = ['owner_cancellation_request', 'provider_cancellation'] as const;
      if (input.decision === 'no_action') {
        await resolveFlags(db, clock, bookingId, [...kinds], `no_action: ${input.note}`, actor);
        return { ok: true };
      }
      const payment = await payments.find(bookingId);
      const amount = input.decision === 'refund_full' ? payment?.amountPoisha : input.amountPoisha;
      if (!amount) return { ok: false, reason: 'invalid_amount' };
      const refunded = await payments.refund(bookingId, amount, actor, input.note);
      if (!refunded.ok) return { ok: false, reason: 'refund_failed', detail: refunded.reason };
      await transitionBooking(db, clock, {
        bookingId,
        to: 'canceled',
        trigger: 'admin_action',
        actor,
        expectedFrom: 'captured',
      });
      await releaseNights(db, bookingId);
      await resolveFlags(
        db,
        clock,
        bookingId,
        [...kinds],
        `${input.decision}: ${input.note}`,
        actor,
      );
      return { ok: true };
    });
  }

  /** Admin decision on a no-show: keep the funds for the provider, or refund. */
  async function adminResolvesNoShow(
    adminId: string,
    bookingId: string,
    input: { decision: 'keep_funds' | 'refund'; amountPoisha?: number; rationale: string },
  ): Promise<Decision> {
    const actor = `admin:${adminId}`;
    const [b] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (!b) return { ok: false, reason: 'not_found' };
    if (b.state !== 'no_show') return { ok: false, reason: 'wrong_state' };
    if (input.decision === 'keep_funds') {
      await payouts?.queueForBooking(bookingId, clock.now());
      await resolveFlags(
        db,
        clock,
        bookingId,
        ['owner_no_show'],
        `keep_funds: ${input.rationale}`,
        actor,
      );
      await releaseNights(db, bookingId);
      return { ok: true };
    }
    const payment = await payments.find(bookingId);
    const amount = input.amountPoisha ?? payment?.amountPoisha;
    if (!amount || !payouts) return { ok: false, reason: 'invalid_amount' };
    const refunded = await payouts.refund(bookingId, amount, input.rationale, adminId);
    if (!refunded.ok) return { ok: false, reason: 'refund_failed', detail: refunded.reason };
    await resolveFlags(
      db,
      clock,
      bookingId,
      ['owner_no_show'],
      `refund: ${input.rationale}`,
      actor,
    );
    await releaseNights(db, bookingId);
    return { ok: true };
  }

  return {
    providerMarksComplete,
    ownerConfirmsCompletion,
    adminCompletes,
    ownerRequestsCancellation,
    providerCancels,
    providerFlagsNoShow,
    adminResolvesCancellation,
    adminResolvesNoShow,
  };
}

export type CompletionService = ReturnType<typeof createCompletionService>;
