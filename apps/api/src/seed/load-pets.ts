/** Loads the training pet Tito with his structured care plan (workbook Step 17, UJ-1). */
import type { Seed } from '@petcare/shared/seed';
import { carePlanSchema, type CarePlan } from '@petcare/shared/pets';
import type { Database } from '../db/client.ts';
import { pets } from '../db/schema/index.ts';

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

export async function loadPets(tx: Tx, seed: Seed) {
  const rows = seed.pets.pets.map((pet) => {
    const carePlan: CarePlan = carePlanSchema.parse({
      conditions: pet.careConditions.map((name) => ({ name })),
      medications: pet.medication,
      diet: {
        type: pet.diet.startsWith('low-carb') ? 'low-carb-kibble' : 'other',
        notes: pet.diet,
      },
      extraAttention: pet.medication.length > 0,
    });
    return {
      id: pet.id,
      ownerId: pet.owner,
      name: pet.name.en,
      species: pet.species as 'dog' | 'cat',
      breed: pet.breed,
      ageYears: pet.ageYears,
      weightKg: pet.weightKg,
      sex: pet.sex,
      neutered: pet.neutered,
      vaccination: pet.vaccination,
      behaviour: { energy: 'moderate', goodWith: [], triggers: '', notes: '' },
      carePlan,
      isTrainingData: true,
    };
  });
  await tx.insert(pets).values(rows);
  return { pets: rows.length };
}
