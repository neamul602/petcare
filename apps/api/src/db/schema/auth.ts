import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { neighbourhoods } from './reference-data.ts';

/** Owners and providers. Provider rows are created by the seed or by the admin, never by sign-in. */
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  role: text('role', { enum: ['owner', 'provider'] }).notNull(),
  phone: text('phone').unique(),
  email: text('email').unique(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  neighbourhoodId: text('neighbourhood_id').references(() => neighbourhoods.id),
  language: text('language', { enum: ['bn', 'en'] })
    .notNull()
    .default('bn'),
  isTrainingData: boolean('is_training_data').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** The admin is a separate identity with separate credentials (FR-31); a second admin is just another row. */
export const adminUsers = pgTable('admin_users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  /** The superuser is the first admin; superusers and admins can both promote users to admin. */
  isSuperuser: boolean('is_superuser').notNull().default(false),
  isTrainingData: boolean('is_training_data').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Only a hash of the session token is stored, so a database leak cannot be replayed as a login. */
export const sessions = pgTable('sessions', {
  tokenHash: text('token_hash').primaryKey(),
  subjectType: text('subject_type', { enum: ['user', 'admin'] }).notNull(),
  subjectId: text('subject_id').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Short-lived proof that a new phone number passed the code check, used to finish a first-time profile. */
export const signupTokens = pgTable('signup_tokens', {
  tokenHash: text('token_hash').primaryKey(),
  phone: text('phone').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
