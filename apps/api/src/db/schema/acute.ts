import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { bookings } from './bookings.ts';

/** A provider's report of an acute event (illness, injury, death) during a stay. */
export const acuteEvents = pgTable('acute_events', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id')
    .notNull()
    .references(() => bookings.id),
  providerId: text('provider_id').notNull(),
  type: text('type', { enum: ['illness', 'injury', 'death'] }).notNull(),
  severity: text('severity', { enum: ['minor', 'serious', 'critical'] }).notNull(),
  observation: text('observation').notNull(),
  status: text('status', { enum: ['open', 'resolved'] })
    .notNull()
    .default('open'),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }).notNull(),
  /** When the owner could first see it (the in-app banner). Notifications are deferred, so this equals the trigger time. */
  ownerNotifiedAt: timestamp('owner_notified_at', { withTimezone: true }).notNull(),
});
