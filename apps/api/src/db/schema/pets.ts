import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import type { CarePlan } from '@petcare/shared/pets';
import { users } from './auth.ts';

export const pets = pgTable('pets', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  species: text('species', { enum: ['dog', 'cat'] }).notNull(),
  breed: text('breed').notNull(),
  ageYears: integer('age_years').notNull(),
  weightKg: doublePrecision('weight_kg').notNull(),
  sex: text('sex', { enum: ['male', 'female', 'unknown'] }).notNull(),
  neutered: boolean('neutered').notNull(),
  vaccination: text('vaccination').notNull(),
  behaviour: jsonb('behaviour').$type<Record<string, unknown>>().notNull(),
  dogDetails: jsonb('dog_details').$type<Record<string, unknown> | null>(),
  catDetails: jsonb('cat_details').$type<Record<string, unknown> | null>(),
  carePlan: jsonb('care_plan').$type<CarePlan>().notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  isTrainingData: boolean('is_training_data').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const petPhotos = pgTable('pet_photos', {
  id: text('id').primaryKey(),
  petId: text('pet_id')
    .notNull()
    .references(() => pets.id),
  storageId: text('storage_id').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** One row per stay or request the pet was part of; written by the booking bolts, read here. */
export const careHistory = pgTable('care_history', {
  id: text('id').primaryKey(),
  petId: text('pet_id')
    .notNull()
    .references(() => pets.id),
  bookingId: text('booking_id'),
  providerId: text('provider_id'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  outcome: text('outcome', { enum: ['completed', 'declined', 'canceled'] }).notNull(),
  declineReason: text('decline_reason'),
  carePlanSnapshot: jsonb('care_plan_snapshot').$type<CarePlan>().notNull(),
  reviewId: text('review_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
