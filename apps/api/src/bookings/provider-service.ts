/**
 * The provider's decision on a request (BKG-06..09): confirm (capture once), decline with one of six reasons,
 * and the confirmation-window timeout. Every operation runs under the booking's lock, so the first action wins.
 */
import { and, eq, lte } from 'drizzle-orm';
import type { Clock } from '@petcare/shared/clock';
import { trainingDecisions } from '@petcare/shared/config';
import type { CarePlan } from '@petcare/shared/pets';
import { commissionBasisPoints } from '@petcare/shared/payments';
import { isPeakStay } from '../capacity/peak.ts';
import { releaseNights } from '../capacity/nights.ts';
import type { Database } from '../db/client.ts';
import { bookings, providers } from '../db/schema/index.ts';
import { appendLogEntry } from '../log/append.ts';
import type { PaymentService } from '../payments/payment-service.ts';
import { recordCareHistory } from '../pets/care-history.ts';
import { exclusive } from './lock.ts';
import { transitionBooking, type BookingRow } from './transitions.ts';

export type DeclineReason = (typeof trainingDecisions.declineReasons)[number];

export type ConfirmResult =
  | { ok: true; booking: BookingRow; alreadyConfirmed: boolean }
  | { ok: false; reason: 'not_found' | 'not_waiting' | 'expired' | 'capture_failed' };
export type DeclineResult =
  | { ok: true; booking: BookingRow }
  | { ok: false; reason: 'not_found' | 'not_waiting' | 'expired' };

export function createProviderBookingService(deps: {
  db: Database;
  payments: PaymentService;
  clock: Clock;
}) {
  const { db, payments, clock } = deps;

  /** The booking, only if it belongs to the provider account. */
  async function ownBooking(providerUserId: string, bookingId: string) {
    const [row] = await db
      .select({ booking: bookings })
      .from(bookings)
      .innerJoin(providers, eq(bookings.providerId, providers.id))
      .where(and(eq(bookings.id, bookingId), eq(providers.userId, providerUserId)));
    return row?.booking ?? null;
  }
  const pastDeadline = (b: BookingRow) =>
    !!b.confirmationDeadline && b.confirmationDeadline.getTime() <= clock.now().getTime();

  async function confirm(providerUserId: string, bookingId: string): Promise<ConfirmResult> {
    if (!(await ownBooking(providerUserId, bookingId))) return { ok: false, reason: 'not_found' };
    return exclusive(bookingId, async (): Promise<ConfirmResult> => {
      const booking = (await ownBooking(providerUserId, bookingId))!;
      if (booking.state === 'captured') return { ok: true, booking, alreadyConfirmed: true };
      if (booking.state !== 'authorized') return { ok: false, reason: 'not_waiting' };
      if (pastDeadline(booking)) return { ok: false, reason: 'expired' };
      const captured = await payments.capture(bookingId);
      if (!captured.ok) return { ok: false, reason: 'capture_failed' };
      // The commission rate is fixed now and never changes, even if the provider's tier does later (PAY-04).
      const [owner] = await db
        .select({ tier: providers.tier })
        .from(providers)
        .where(eq(providers.id, booking.providerId));
      const rate = commissionBasisPoints(
        owner!.tier,
        await isPeakStay(db, booking.startDate, booking.endDate),
      );
      const moved = await transitionBooking(db, clock, {
        bookingId,
        to: 'captured',
        trigger: 'provider_confirmed',
        actor: `provider:${booking.providerId}`,
        expectedFrom: 'authorized',
        set: { commissionBasisPoints: rate },
      });
      return moved.ok
        ? { ok: true, booking: moved.booking, alreadyConfirmed: false }
        : { ok: false, reason: 'not_waiting' };
    });
  }

  async function decline(
    providerUserId: string,
    bookingId: string,
    reason: DeclineReason,
  ): Promise<DeclineResult> {
    if (!(await ownBooking(providerUserId, bookingId))) return { ok: false, reason: 'not_found' };
    return exclusive(bookingId, async (): Promise<DeclineResult> => {
      const booking = (await ownBooking(providerUserId, bookingId))!;
      if (booking.state !== 'authorized') return { ok: false, reason: 'not_waiting' };
      if (pastDeadline(booking)) return { ok: false, reason: 'expired' };
      const moved = await transitionBooking(db, clock, {
        bookingId,
        to: 'declined',
        trigger: 'provider_declined',
        actor: `provider:${booking.providerId}`,
        expectedFrom: 'authorized',
        set: { declineReason: reason },
      });
      if (!moved.ok) return { ok: false, reason: 'not_waiting' };
      await releaseNights(db, bookingId);
      await payments.release(bookingId, `provider:${booking.providerId}`);
      await recordCareHistory(db, {
        petId: booking.petId,
        bookingId,
        providerId: booking.providerId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        outcome: 'declined',
        declineReason: reason,
        carePlanSnapshot: booking.carePlan as CarePlan,
      });
      return { ok: true, booking: moved.booking };
    });
  }

  /** Close every request whose confirmation window has passed. Safe to run as often as wanted. */
  async function processTimeouts(): Promise<{ closed: string[] }> {
    const due = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(eq(bookings.state, 'authorized'), lte(bookings.confirmationDeadline, clock.now())),
      );
    const closed: string[] = [];
    for (const { id } of due) {
      await exclusive(id, async () => {
        const moved = await transitionBooking(db, clock, {
          bookingId: id,
          to: 'canceled',
          trigger: 'confirmation_timeout',
          actor: 'system',
          expectedFrom: 'authorized',
        });
        if (!moved.ok) return; // the provider or owner acted first
        await releaseNights(db, id);
        await payments.release(id, 'system');
        await appendLogEntry(db, {
          kind: 'audit',
          actor: 'system',
          action: 'booking.timed_out',
          reasonCode: 'confirmation_timeout',
          targetType: 'booking',
          targetId: id,
          at: clock.now(),
          payload: { providerId: moved.booking.providerId },
        });
        closed.push(id);
      });
    }
    return { closed };
  }

  return { confirm, decline, processTimeouts, ownBooking };
}

export type ProviderBookingService = ReturnType<typeof createProviderBookingService>;
