import { date, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { bookings } from './bookings.ts';

/** A daily update from the provider. Never edited after posting. */
export const dailyUpdates = pgTable('daily_updates', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id')
    .notNull()
    .references(() => bookings.id),
  day: date('day', { mode: 'string' }).notNull(),
  note: text('note').notNull().default(''),
  careLog: jsonb('care_log').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const updatePhotos = pgTable('update_photos', {
  id: text('id').primaryKey(),
  updateId: text('update_id')
    .notNull()
    .references(() => dailyUpdates.id),
  storageId: text('storage_id').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  position: integer('position').notNull(),
});
