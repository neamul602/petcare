import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { PaymentMethod } from '@petcare/shared/payments';

export type PaymentStatus =
  'authorizing' | 'authorized' | 'captured' | 'released' | 'release_pending' | 'declined';

/** One payment per booking. The booking row itself arrives with the booking bolts, so booking_id is a plain reference. */
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').notNull().unique(),
  ownerId: text('owner_id').notNull(),
  providerId: text('provider_id').notNull(),
  method: text('method').$type<PaymentMethod>().notNull(),
  amountPoisha: integer('amount_poisha').notNull(),
  status: text('status').$type<PaymentStatus>().notNull(),
  authorizationId: text('authorization_id'),
  gatewayPaymentId: text('gateway_payment_id'),
  gatewayRef: text('gateway_ref'),
  lastError: text('last_error'),
  capturedAt: timestamp('captured_at', { withTimezone: true }),
  releasedAt: timestamp('released_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
