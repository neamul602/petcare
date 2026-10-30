import { date, integer, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import type { BookingState } from '@petcare/shared/bookings';
import type { PaymentMethod } from '@petcare/shared/payments';
import type { CarePlan } from '@petcare/shared/pets';
import { users } from './auth.ts';
import { pets } from './pets.ts';
import { providers } from './providers.ts';

/** A booking. Pet details and the care plan are copied at submission, so later profile edits never change a request already made. */
export const bookings = pgTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id),
    providerId: text('provider_id')
      .notNull()
      .references(() => providers.id),
    petId: text('pet_id')
      .notNull()
      .references(() => pets.id),
    petSnapshot: jsonb('pet_snapshot').$type<Record<string, unknown>>().notNull(),
    startDate: date('start_date', { mode: 'string' }).notNull(),
    endDate: date('end_date', { mode: 'string' }).notNull(),
    nights: integer('nights').notNull(),
    pricePerNightPoisha: integer('price_per_night_poisha').notNull(),
    totalPoisha: integer('total_poisha').notNull(),
    paymentMethod: text('payment_method').$type<PaymentMethod>().notNull(),
    carePlan: jsonb('care_plan').$type<CarePlan>().notNull(),
    instructions: text('instructions').notNull().default(''),
    state: text('state').$type<BookingState>().notNull(),
    confirmationDeadline: timestamp('confirmation_deadline', { withTimezone: true }),
    /** Commission rate fixed when the provider confirms; later tier changes never change it. */
    commissionBasisPoints: integer('commission_basis_points'),
    /** The provider has marked the stay complete and is waiting for the owner to confirm. */
    completionRequestedAt: timestamp('completion_requested_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    declineReason: text('decline_reason'),
    /** The owner's retry key for one checkout: a double tap or a resend is the same booking. */
    submissionKey: text('submission_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('bookings_owner_key').on(t.ownerId, t.submissionKey)],
);

export type FlagKind =
  | 'owner_cancellation_request'
  | 'provider_cancellation'
  | 'owner_no_show'
  | 'missed_start'
  | 'acute_event';

/** An item for the admin queue: something after confirmation that a person must decide (TD-6). */
export const bookingFlags = pgTable('booking_flags', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id')
    .notNull()
    .references(() => bookings.id),
  kind: text('kind').$type<FlagKind>().notNull(),
  status: text('status', { enum: ['open', 'resolved'] })
    .notNull()
    .default('open'),
  note: text('note').notNull().default(''),
  raisedBy: text('raised_by').notNull(),
  resolution: text('resolution'),
  resolvedBy: text('resolved_by'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** The Book again timer (UJ-4): started when the owner taps Book again, closed when the new request is submitted. */
export const bookAgainTimers = pgTable('book_again_timers', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  sourceBookingId: text('source_booking_id')
    .notNull()
    .references(() => bookings.id),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  bookingId: text('booking_id'),
});
