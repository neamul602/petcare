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
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  /** When the owner could first see it (the in-app banner). Notifications are deferred, so this equals the trigger time. */
  ownerNotifiedAt: timestamp('owner_notified_at', { withTimezone: true }).notNull(),
});

export const RUNBOOK_STEPS = [
  'confirm_trigger',
  'provider_role',
  'admin_role',
  'vet_lookup',
  'owner_notification',
  'payout',
  'post_mortem',
] as const;
export type RunbookStep = (typeof RUNBOOK_STEPS)[number];

/** One row per step the admin has acted on. Steps with no row are pending. This table is also the timeline. */
export const acuteSteps = pgTable('acute_steps', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .notNull()
    .references(() => acuteEvents.id),
  step: text('step').$type<RunbookStep>().notNull(),
  status: text('status', { enum: ['done', 'skipped'] }).notNull(),
  note: text('note').notNull().default(''),
  by: text('by').notNull(),
  at: timestamp('at', { withTimezone: true }).notNull(),
});

/** A message the admin sent to the owner about an event (shown on the owner's booking page). */
export const acuteMessages = pgTable('acute_messages', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .notNull()
    .references(() => acuteEvents.id),
  language: text('language', { enum: ['bn', 'en'] }).notNull(),
  text: text('text').notNull(),
  sentBy: text('sent_by').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull(),
});

/** Owner message templates; edits apply to future events. */
export const acuteTemplates = pgTable('acute_templates', {
  language: text('language', { enum: ['bn', 'en'] }).primaryKey(),
  text: text('text').notNull(),
  updatedBy: text('updated_by').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const acutePostMortems = pgTable('acute_post_mortems', {
  eventId: text('event_id')
    .primaryKey()
    .references(() => acuteEvents.id),
  timelineAccuracy: text('timeline_accuracy').notNull(),
  roles: text('roles').notNull(),
  ownerCommunication: text('owner_communication').notNull(),
  directoryUse: text('directory_use').notNull(),
  gaps: text('gaps').notNull(),
  lessons: text('lessons').notNull(),
  writtenBy: text('written_by').notNull(),
  writtenAt: timestamp('written_at', { withTimezone: true }).notNull(),
});
