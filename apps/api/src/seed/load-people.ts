/**
 * Loads the training people: owner Bibi, the four provider accounts and the admin Ayaat.
 * Provider accounts exist only because the seed (later: the admin) creates them; sign-in never does.
 */
import type { Seed } from '@petcare/shared/seed';
import { hashPassword } from '../auth/passwords.ts';
import type { Database } from '../db/client.ts';
import { adminUsers, users } from '../db/schema/index.ts';

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

export const DEFAULT_TRAINING_ADMIN_PASSWORD = 'training-admin-pass';

export async function loadPeople(tx: Tx, seed: Seed, adminPassword: string) {
  await tx.insert(users).values([
    ...seed.people.owners.map((owner) => ({
      id: owner.id,
      role: 'owner' as const,
      phone: owner.phone,
      name: owner.name.en,
      neighbourhoodId: owner.neighbourhood,
      language: owner.language,
      isTrainingData: true,
    })),
    ...seed.providers.providers.map((provider) => ({
      id: provider.id,
      role: 'provider' as const,
      phone: provider.phone,
      name: provider.name.en,
      neighbourhoodId: provider.neighbourhood,
      language: 'bn' as const,
      isTrainingData: true,
    })),
  ]);
  const passwordHash = await hashPassword(adminPassword);
  await tx.insert(adminUsers).values(
    seed.people.admins.map((admin, index) => ({
      isSuperuser: index === 0,
      id: admin.id,
      name: admin.name,
      email: admin.email,
      passwordHash,
      isTrainingData: true,
    })),
  );
  return {
    owners: seed.people.owners.length,
    providerAccounts: seed.providers.providers.length,
    admins: seed.people.admins.length,
  };
}
