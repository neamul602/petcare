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
  refundedPoisha: integer('refunded_poisha').notNull().default(0),
  capturedAt: timestamp('captured_at', { withTimezone: true }),
  releasedAt: timestamp('released_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type PayoutStatus = 'queued' | 'sent' | 'paid' | 'frozen' | 'cancelled';

/** What a provider is owed for one booking: captured amount minus the commission fixed at confirmation. */
export const payouts = pgTable('payouts', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').notNull().unique(),
  providerId: text('provider_id').notNull(),
  grossPoisha: integer('gross_poisha').notNull(),
  commissionBasisPoints: integer('commission_basis_points').notNull(),
  commissionPoisha: integer('commission_poisha').notNull(),
  netPoisha: integer('net_poisha').notNull(),
  refundedPoisha: integer('refunded_poisha').notNull().default(0),
  status: text('status').$type<PayoutStatus>().notNull(),
  eligibleAt: timestamp('eligible_at', { withTimezone: true }).notNull(),
  freezeReason: text('freeze_reason'),
  frozenAt: timestamp('frozen_at', { withTimezone: true }),
  gatewayPayoutId: text('gateway_payout_id'),
  batchId: text('batch_id'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** One row per payout batch that reached the payout service. The run key stops a weekly run being recorded twice. */
export const payoutBatches = pgTable('payout_batches', {
  id: text('id').primaryKey(),
  runKey: text('run_key').notNull().unique(),
  gatewayBatchId: text('gateway_batch_id'),
  lineCount: integer('line_count').notNull(),
  totalPoisha: integer('total_poisha').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
