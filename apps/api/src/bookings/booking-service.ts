/**
 * Submitting a booking request and the owner's cancel-before-confirmation (FR-15, UC; stories BKG-02..04).
 * Order at submission: reserve every night, then place the hold, then create the booking; any failure
 * gives back what was taken, so a failed submit leaves nothing behind. One submission key means one booking.
 */
import { createHash } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import type { Clock } from '@petcare/shared/clock';
import { trainingDecisions } from '@petcare/shared/config';
import type { PaymentMethod } from '@petcare/shared/payments';
import { stayTotalPoisha } from '@petcare/shared/payments';
import type { CarePlan } from '@petcare/shared/pets';
import { checkWindow, dhakaToday, nightsBetween } from '../capacity/dates.ts';
import { isPeakStay } from '../capacity/peak.ts';
import { releaseNights, reserveNights } from '../capacity/nights.ts';
import type { Database } from '../db/client.ts';
import { bookings, pets, providers } from '../db/schema/index.ts';
import type { PaymentService } from '../payments/payment-service.ts';
import { screenForClinicalPurpose } from '../pets/clinical-screen.ts';
import { exclusive } from './lock.ts';
import { logTransition, transitionBooking, type BookingRow } from './transitions.ts';

export interface SubmitInput {
  ownerId: string;
  key: string;
  providerSlug: string;
  petId: string;
  from: string;
  to: string;
  method: PaymentMethod;
  instructions?: string;
  declaredClinical?: boolean;
  confirmedNotClinical?: boolean;
}

export type SubmitResult =
  | { ok: true; booking: BookingRow; duplicate: boolean }
  | {
      ok: false;
      reason:
        | 'pet_not_found'
        | 'provider_unavailable'
        | 'species_not_hosted'
        | 'invalid_dates'
        | 'dates_in_past'
        | 'window_too_long'
        | 'clinical_request_rejected'
        | 'needs_confirmation'
        | 'nights_full'
        | 'payment_declined'
        | 'payment_unavailable';
      detail?: unknown;
    };

export const bookingIdFor = (ownerId: string, key: string) =>
  `bk_${createHash('sha256').update(`${ownerId}:${key}`).digest('hex').slice(0, 24)}`;

export function createBookingService(deps: {
  db: Database;
  payments: PaymentService;
  clock: Clock;
}) {
  const { db, payments, clock } = deps;
  async function submit(input: SubmitInput): Promise<SubmitResult> {
    const bookingId = bookingIdFor(input.ownerId, input.key);
    return exclusive(bookingId, () => submitOnce(input, bookingId));
  }

  async function submitOnce(input: SubmitInput, bookingId: string): Promise<SubmitResult> {
    const [existing] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.ownerId, input.ownerId), eq(bookings.submissionKey, input.key)));
    if (existing) return { ok: true, booking: existing, duplicate: true };

    const [pet] = await db.select().from(pets).where(eq(pets.id, input.petId));
    if (!pet || pet.ownerId !== input.ownerId || pet.archivedAt)
      return { ok: false, reason: 'pet_not_found' };
    const [provider] = await db
      .select()
      .from(providers)
      .where(eq(providers.slug, input.providerSlug));
    if (!provider || provider.status !== 'approved' || provider.pricePerNightPoisha === null)
      return { ok: false, reason: 'provider_unavailable' };
    if (!provider.species.includes(pet.species)) return { ok: false, reason: 'species_not_hosted' };
    const problem = checkWindow(input.from, input.to, dhakaToday(clock));
    if (problem) return { ok: false, reason: problem };

    const screen = screenForClinicalPurpose({
      declaredClinical: input.declaredClinical,
      confirmedNotClinical: input.confirmedNotClinical,
      text: input.instructions,
    });
    if (!screen.allowed) return { ok: false, reason: screen.reason };

    const nights = nightsBetween(input.from, input.to).length;
    const total = stayTotalPoisha(provider.pricePerNightPoisha, nights);

    const reserved = await reserveNights(db, {
      bookingId,
      providerId: provider.id,
      from: input.from,
      to: input.to,
    });
    if (!reserved.ok)
      return reserved.reason === 'nights_full'
        ? { ok: false, reason: 'nights_full', detail: reserved.fullNights }
        : {
            ok: false,
            reason:
              reserved.reason === 'provider_unavailable' ? 'provider_unavailable' : 'invalid_dates',
          };

    const paid = await payments.authorize({
      bookingId,
      ownerId: input.ownerId,
      providerId: provider.id,
      method: input.method,
      amountPoisha: total,
    });
    if (!paid.ok) {
      await releaseNights(db, bookingId);
      if (paid.reason === 'declined') return { ok: false, reason: 'payment_declined' };
      return { ok: false, reason: 'payment_unavailable' };
    }

    const peak = await isPeakStay(db, input.from, input.to);
    try {
      const now = clock.now();
      const [created] = await db
        .insert(bookings)
        .values({
          id: bookingId,
          ownerId: input.ownerId,
          providerId: provider.id,
          petId: pet.id,
          petSnapshot: {
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            ageYears: pet.ageYears,
            weightKg: pet.weightKg,
          },
          startDate: input.from,
          endDate: input.to,
          nights,
          pricePerNightPoisha: provider.pricePerNightPoisha,
          totalPoisha: total,
          paymentMethod: input.method,
          carePlan: pet.carePlan as CarePlan,
          instructions: (input.instructions ?? '').trim(),
          state: 'authorized',
          confirmationDeadline: new Date(
            now.getTime() +
              (peak
                ? trainingDecisions.confirmationWindow.peakMinutes
                : trainingDecisions.confirmationWindow.baseMinutes) *
                60_000,
          ),
          submissionKey: input.key,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      const actor = `owner:${input.ownerId}`;
      await logTransition(
        db,
        clock,
        bookingId,
        'requested',
        'authorized',
        'owner_submitted',
        actor,
      );
      return { ok: true, booking: created!, duplicate: false };
    } catch (error) {
      await releaseNights(db, bookingId);
      await payments.release(bookingId, 'system');
      throw error;
    }
  }

  type CancelResult =
    | { ok: true; booking: BookingRow; paymentPending: boolean }
    | { ok: false; reason: 'not_found' | 'not_cancelable' };

  /** The owner withdraws a request the provider has not yet confirmed: nights and hold are given back in full (TD-6). */
  async function cancelByOwner(ownerId: string, bookingId: string): Promise<CancelResult> {
    const [row] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (!row || row.ownerId !== ownerId) return { ok: false, reason: 'not_found' };
    return exclusive(bookingId, () => cancelLocked(ownerId, bookingId));
  }

  async function cancelLocked(ownerId: string, bookingId: string): Promise<CancelResult> {
    const moved = await transitionBooking(db, clock, {
      bookingId,
      to: 'canceled',
      trigger: 'owner_canceled',
      actor: `owner:${ownerId}`,
      expectedFrom: 'authorized',
    });
    if (!moved.ok) return { ok: false, reason: 'not_cancelable' };
    await releaseNights(db, bookingId);
    const released = await payments.release(bookingId, `owner:${ownerId}`);
    return {
      ok: true,
      booking: moved.booking,
      paymentPending: released.ok && released.pending,
    };
  }

  return { submit, cancelByOwner };
}

export type BookingService = ReturnType<typeof createBookingService>;
