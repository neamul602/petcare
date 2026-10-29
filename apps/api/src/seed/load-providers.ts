/** Loads the labelled training providers and the pending Tier-B application. No ratings or counts exist (PRODUCT.md). */
import type { Seed } from '@petcare/shared/seed';
import type { Database } from '../db/client.ts';
import { providers } from '../db/schema/index.ts';
import { slugFor } from '../providers/provider-records.ts';

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

export async function loadProviders(tx: Tx, seed: Seed) {
  await tx.insert(providers).values([
    ...seed.providers.providers.map((p) => ({
      id: p.id,
      userId: p.id,
      slug: p.id,
      nameEn: p.name.en,
      nameBn: p.name.bn,
      tier: p.tier,
      status: p.status,
      neighbourhoodId: p.neighbourhood,
      species: p.species,
      capacitySmall: p.capacityPerNight.smallPets,
      pricePerNightPoisha: p.pricePerNightPoisha,
      capabilities: p.capabilities,
      experienceEn: p.experience.en,
      experienceBn: p.experience.bn,
      isTrainingData: true,
    })),
    ...seed.providers.applications.map((a) => ({
      id: a.id,
      slug: slugFor(a.name.en, a.id),
      nameEn: a.name.en,
      nameBn: a.name.bn,
      tier: a.tier,
      status: a.status,
      neighbourhoodId: a.neighbourhood,
      species: a.species,
      isTrainingData: true,
    })),
  ]);
  return {
    approvedProviders: seed.providers.providers.length,
    pendingApplications: seed.providers.applications.length,
  };
}
