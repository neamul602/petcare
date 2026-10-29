import { bigserial, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Append-only log for admin actions (NFR-21), booking transitions (NFR-22) and payment events (NFR-23).
 * A database trigger rejects UPDATE and DELETE (see drizzle/0001_event_log_append_only.sql).
 */
export const eventLog = pgTable('event_log', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  kind: text('kind', { enum: ['audit', 'booking_transition', 'payment_event'] }).notNull(),
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  reasonCode: text('reason_code'),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
