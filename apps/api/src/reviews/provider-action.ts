/** Provider action taken while resolving a report (REV-06): a warning is recorded, suspension and removal change the status (SUP-01). */
import { appendLogEntry } from '../log/append.ts';
import type { Database } from '../db/client.ts';
import { moveStatus } from '../providers/provider-records.ts';

export async function changeStatusForAction(
  db: Database,
  adminId: string,
  providerId: string,
  action: 'warning' | 'suspension' | 'removal',
  rationale: string,
): Promise<string> {
  if (action === 'warning') {
    await appendLogEntry(db, {
      kind: 'audit',
      actor: `admin:${adminId}`,
      action: 'provider.warned',
      targetType: 'provider',
      targetId: providerId,
      payload: { rationale },
    });
    return 'warning';
  }
  const result = await moveStatus(
    db,
    adminId,
    providerId,
    action === 'suspension' ? 'suspended' : 'removed',
    rationale,
  );
  return result.ok ? action : `${action}_not_applied`;
}
