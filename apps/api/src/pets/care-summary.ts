/**
 * What a provider may see about a pet on a request (FR-9, FR-49, assumption A-4): the care-relevant
 * profile and history, read-only, never the owner's contact details.
 */
import { eq } from 'drizzle-orm';
import type { Database } from '../db/client.ts';
import { pets } from '../db/schema/index.ts';
import { listCareHistory } from './care-history.ts';

/** Decides whether a provider may see a pet: only when the pet has a request with that provider. */
export interface PetAccessPolicy {
  canProviderView(providerId: string, petId: string): Promise<boolean>;
}

/** Until bookings exist (later bolts) nobody qualifies. */
export const denyAllPetAccess: PetAccessPolicy = { canProviderView: async () => false };

export async function buildCareSummary(db: Database, providerId: string, petId: string) {
  const [pet] = await db.select().from(pets).where(eq(pets.id, petId));
  if (!pet) return null;
  const history = await listCareHistory(db, petId);

  const withYou = history.filter(
    (entry) => entry.providerId === providerId && entry.outcome === 'completed',
  );
  const withOthers = history.filter(
    (entry) => entry.providerId !== providerId && entry.outcome === 'completed',
  );
  const declines = new Map<string, number>();
  for (const entry of history) {
    if (entry.outcome === 'declined' && entry.declineReason)
      declines.set(entry.declineReason, (declines.get(entry.declineReason) ?? 0) + 1);
  }
  const plan = pet.carePlan;

  return {
    pet: {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      ageYears: pet.ageYears,
      weightKg: pet.weightKg,
      sex: pet.sex,
      neutered: pet.neutered,
      vaccination: pet.vaccination,
    },
    behaviour: pet.behaviour,
    details: pet.species === 'dog' ? pet.dogDetails : pet.catDetails,
    flags: {
      senior: plan.senior,
      extraAttention: plan.extraAttention,
      anxiety: plan.anxiety !== null,
      medication: plan.medications.length > 0,
      allergies: plan.allergies.length > 0,
    },
    carePlan: {
      conditions: plan.conditions,
      medications: plan.medications,
      allergies: plan.allergies,
      anxiety: plan.anxiety,
      diet: plan.diet,
      instructions: plan.instructions,
    },
    history: {
      staysWithYou: withYou.length,
      lastStayWithYou: withYou[0] ? { endDate: withYou[0].endDate } : null,
      staysWithOthers: withOthers.length,
      declinePatterns: [...declines.entries()].map(([reason, count]) => ({ reason, count })),
    },
    repeat: withYou.length > 0,
    readOnly: true,
  };
}
