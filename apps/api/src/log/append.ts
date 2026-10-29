/**
 * The only way to write to the event log. Entries can be added and read, never changed
 * (enforced in the database). Used for audit entries, booking transitions and payment events.
 */
import type { Database } from '../db/client.ts';
import { eventLog } from '../db/schema/index.ts';

export type LogKind = 'audit' | 'booking_transition' | 'payment_event';

export interface LogEntryInput {
  kind: LogKind;
  actor: string;
  action: string;
  reasonCode?: string;
  targetType: string;
  targetId: string;
  payload?: Record<string, unknown>;
  at?: Date;
}

export async function appendLogEntry(db: Database, entry: LogEntryInput) {
  if (!entry.actor || !entry.action || !entry.targetType || !entry.targetId) {
    throw new Error('A log entry needs an actor, an action and a target');
  }
  const [row] = await db
    .insert(eventLog)
    .values({
      kind: entry.kind,
      actor: entry.actor,
      action: entry.action,
      reasonCode: entry.reasonCode,
      targetType: entry.targetType,
      targetId: entry.targetId,
      payload: entry.payload ?? {},
      ...(entry.at ? { createdAt: entry.at } : {}),
    })
    .returning();
  return row;
}
