import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { bookings } from './bookings.ts';
import { providers } from './providers.ts';

/** One verified review per completed booking. Removed reviews stay stored but are never shown. */
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id')
    .notNull()
    .unique()
    .references(() => bookings.id),
  providerId: text('provider_id')
    .notNull()
    .references(() => providers.id),
  ownerId: text('owner_id').notNull(),
  rating: integer('rating').notNull(),
  text: text('text').notNull().default(''),
  /** Ids of photos the provider posted during this stay. */
  photoIds: text('photo_ids').array().notNull().default([]),
  status: text('status', { enum: ['published', 'removed'] })
    .notNull()
    .default('published'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** A report of a problem with a stay (one per booking). The admin investigates in a later bolt. */
export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id')
    .notNull()
    .unique()
    .references(() => bookings.id),
  ownerId: text('owner_id').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  photoIds: text('photo_ids').array().notNull().default([]),
  status: text('status', { enum: ['open', 'resolved'] })
    .notNull()
    .default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
