import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
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
  removedReason: text('removed_reason'),
  removedBy: text('removed_by'),
  removedAt: timestamp('removed_at', { withTimezone: true }),
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
  resolution: jsonb('resolution').$type<Record<string, unknown>>(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
