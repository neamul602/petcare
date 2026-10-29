/** Care history: written by the booking bolts through recordCareHistory, read by owners and (as a summary) providers. */
import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import type { CarePlan } from '@petcare/shared/pets';
import type { Database } from '../db/client.ts';
import { careHistory } from '../db/schema/index.ts';

export interface CareHistoryInput {
  petId: string;
  bookingId?: string;
  providerId?: string;
  startDate: string;
  endDate: string;
  outcome: 'completed' | 'declined' | 'canceled';
  declineReason?: string;
  carePlanSnapshot: CarePlan;
  reviewId?: string;
}

export async function recordCareHistory(db: Database, input: CareHistoryInput) {
  const [row] = await db
    .insert(careHistory)
    .values({ id: `ch_${randomUUID()}`, ...input })
    .returning();
  return row!;
}

/** Newest stay first. */
export async function listCareHistory(db: Database, petId: string) {
  return db
    .select()
    .from(careHistory)
    .where(eq(careHistory.petId, petId))
    .orderBy(desc(careHistory.endDate), desc(careHistory.createdAt));
}

export async function lastCompletedStay(db: Database, petId: string) {
  const [row] = await db
    .select()
    .from(careHistory)
    .where(and(eq(careHistory.petId, petId), eq(careHistory.outcome, 'completed')))
    .orderBy(desc(careHistory.endDate), desc(careHistory.createdAt))
    .limit(1);
  return row ?? null;
}
