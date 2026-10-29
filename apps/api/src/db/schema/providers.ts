import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { ProviderStatus, Tier } from '@petcare/shared/providers';
import { users } from './auth.ts';
import { neighbourhoods } from './reference-data.ts';

/** A provider record. `userId` is set once the provider has a sign-in account (applications have none yet). */
export const providers = pgTable('providers', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id)
    .unique(),
  slug: text('slug').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameBn: text('name_bn').notNull(),
  tier: text('tier').$type<Tier>().notNull(),
  status: text('status').$type<ProviderStatus>().notNull().default('applied'),
  neighbourhoodId: text('neighbourhood_id')
    .notNull()
    .references(() => neighbourhoods.id),
  species: text('species').array().notNull(),
  capacitySmall: integer('capacity_small').notNull().default(0),
  pricePerNightPoisha: integer('price_per_night_poisha'),
  capabilities: text('capabilities').array().notNull().default([]),
  experienceEn: text('experience_en').notNull().default(''),
  experienceBn: text('experience_bn').notNull().default(''),
  isTrainingData: boolean('is_training_data').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Every status or tier change: who, when, why. The audit log keeps its own copy; this is the readable history. */
export const providerStatusEvents = pgTable('provider_status_events', {
  id: text('id').primaryKey(),
  providerId: text('provider_id')
    .notNull()
    .references(() => providers.id),
  kind: text('kind', { enum: ['status', 'tier'] }).notNull(),
  fromValue: text('from_value'),
  toValue: text('to_value').notNull(),
  reason: text('reason').notNull(),
  adminId: text('admin_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
