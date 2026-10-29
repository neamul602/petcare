/** Provider records, tier and status changes (SUP-01). Later bolts call isProviderBookable before any request or confirmation. */
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import {
  canMoveStatus,
  isBookable,
  type ProviderStatus,
  type Tier,
} from '@petcare/shared/providers';
import { recordAdminAction } from '../auth/audit.ts';
import type { Database } from '../db/client.ts';
import { providers, providerStatusEvents } from '../db/schema/index.ts';

export type ProviderRow = typeof providers.$inferSelect;

export async function findProvider(db: Database, id: string) {
  const [row] = await db.select().from(providers).where(eq(providers.id, id));
  return row ?? null;
}

/** False for suspended, removed, not-yet-approved and unknown providers (SUP-01: refused everywhere). */
export async function isProviderBookable(db: Database, id: string) {
  const row = await findProvider(db, id);
  return !!row && isBookable(row.status);
}

export const slugFor = (name: string, id: string) =>
  `${
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'provider'
  }-${id.slice(-6)}`;

export type MoveResult =
  | { ok: true; provider: ProviderRow }
  | { ok: false; code: 'not_found' | 'invalid_transition' | 'profile_incomplete' | 'same_tier' };

export async function moveStatus(
  db: Database,
  adminId: string,
  id: string,
  to: ProviderStatus,
  reason: string,
): Promise<MoveResult> {
  const row = await findProvider(db, id);
  if (!row) return { ok: false, code: 'not_found' };
  if (!canMoveStatus(row.status, to)) return { ok: false, code: 'invalid_transition' };
  if (to === 'approved' && row.status === 'vetting') {
    const complete = row.pricePerNightPoisha !== null && row.capacitySmall > 0;
    if (!complete) return { ok: false, code: 'profile_incomplete' };
  }
  const [updated] = await db
    .update(providers)
    .set({ status: to, updatedAt: new Date() })
    .where(eq(providers.id, id))
    .returning();
  await db.insert(providerStatusEvents).values({
    id: `pse_${randomUUID()}`,
    providerId: id,
    kind: 'status',
    fromValue: row.status,
    toValue: to,
    reason,
    adminId,
  });
  await recordAdminAction(db, {
    adminId,
    action: 'provider.status_changed',
    targetType: 'provider',
    targetId: id,
    payload: { from: row.status, to, reason },
  });
  return { ok: true, provider: updated! };
}

export async function changeTier(
  db: Database,
  adminId: string,
  id: string,
  tier: Tier,
  reason: string,
): Promise<MoveResult> {
  const row = await findProvider(db, id);
  if (!row) return { ok: false, code: 'not_found' };
  if (row.tier === tier) return { ok: false, code: 'same_tier' };
  const [updated] = await db
    .update(providers)
    .set({ tier, updatedAt: new Date() })
    .where(eq(providers.id, id))
    .returning();
  await db.insert(providerStatusEvents).values({
    id: `pse_${randomUUID()}`,
    providerId: id,
    kind: 'tier',
    fromValue: row.tier,
    toValue: tier,
    reason,
    adminId,
  });
  await recordAdminAction(db, {
    adminId,
    action: 'provider.tier_changed',
    targetType: 'provider',
    targetId: id,
    payload: { from: row.tier, to: tier, reason },
  });
  return { ok: true, provider: updated! };
}
