import { date, integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { providers } from './providers.ts';

/** One row per provider and night once anything is booked or set. No row means the provider's baseline capacity and nothing booked. */
export const nightCapacity = pgTable(
  'night_capacity',
  {
    providerId: text('provider_id')
      .notNull()
      .references(() => providers.id),
    date: date('date', { mode: 'string' }).notNull(),
    capacity: integer('capacity'),
    booked: integer('booked').notNull().default(0),
    note: text('note').notNull().default(''),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.providerId, t.date] })],
);

/** Which nights a booking holds. Makes reserve and release safe to repeat. */
export const nightReservations = pgTable(
  'night_reservations',
  {
    bookingId: text('booking_id').notNull(),
    providerId: text('provider_id')
      .notNull()
      .references(() => providers.id),
    date: date('date', { mode: 'string' }).notNull(),
    releasedAt: timestamp('released_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.bookingId, t.date] })],
);

/** A named peak window (for example Eid), created by the admin. Dates are inclusive. */
export const peakWindows = pgTable('peak_windows', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  startDate: date('start_date', { mode: 'string' }).notNull(),
  endDate: date('end_date', { mode: 'string' }).notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
