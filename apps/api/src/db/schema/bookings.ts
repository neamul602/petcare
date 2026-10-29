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
    declineReason: text('decline_reason'),
    /** The owner's retry key for one checkout: a double tap or a resend is the same booking. */
    submissionKey: text('submission_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('bookings_owner_key').on(t.ownerId, t.submissionKey)],
);
