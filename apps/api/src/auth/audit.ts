/**
 * The one way every admin action is recorded (FR-37, NFR-21). Every unit that has an admin action
 * calls recordAdminAction; entries go to the append-only log and can never be edited or deleted.
 */
import type { Database } from '../db/client.ts';
import { appendLogEntry } from '../log/append.ts';

export interface AdminActionInput {
  adminId: string;
  action: string;
  reasonCode?: string;
  targetType: string;
  targetId: string;
  payload?: Record<string, unknown>;
}

export function recordAdminAction(db: Database, input: AdminActionInput) {
  return appendLogEntry(db, {
    kind: 'audit',
    actor: `admin:${input.adminId}`,
    action: input.action,
    reasonCode: input.reasonCode,
    targetType: input.targetType,
    targetId: input.targetId,
    payload: input.payload,
  });
}
