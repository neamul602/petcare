/**
 * The training seed (workbook Step 17). Every file is labelled TRAINING DATA, every record is
 * checked, and anything that could pass as a real trust signal (ratings, reviews, testimonials,
 * booking counts) is refused (PRODUCT.md, DR-15, TR-8).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { platformRules } from '../config/training-decisions.ts';

const bilingual = z.strictObject({ en: z.string().min(1), bn: z.string().min(1) });
const label = z.literal('TRAINING DATA');
const neighbourhoodId = z.enum(
  platformRules.launchNeighbourhoods as unknown as [string, ...string[]],
);
const species = z.enum(platformRules.species as unknown as [string, ...string[]]);

export const neighbourhoodsFile = z.strictObject({
  label,
  note: z.string(),
  neighbourhoods: z
    .array(z.strictObject({ id: neighbourhoodId, name: bilingual }))
    .length(platformRules.launchNeighbourhoods.length),
});

export const vetClinicsFile = z.strictObject({
  label,
  note: z.string(),
  clinics: z.array(
    z.strictObject({
      id: z.string().min(1),
      neighbourhood: neighbourhoodId,
      name: bilingual,
      address: bilingual,
      phone: z.string().regex(/^\+8801\d{9}$/),
      hours: bilingual,
      species: z.array(species).min(1),
    }),
  ),
});

export const peopleFile = z.strictObject({
  label,
  note: z.string(),
  owners: z
    .array(
      z.strictObject({
        id: z.string(),
        name: bilingual,
        phone: z.string().regex(/^\+8801\d{9}$/),
        neighbourhood: neighbourhoodId,
        language: z.enum(['bn', 'en']),
      }),
    )
    .min(1),
  admins: z
    .array(
      z.strictObject({
        id: z.string(),
        name: z.string(),
        role: z.literal('admin'),
        email: z.string().email(),
      }),
    )
    .length(1),
});

export const petsFile = z.strictObject({
  label,
  note: z.string(),
  pets: z
    .array(
      z.strictObject({
        id: z.string(),
        owner: z.string(),
        name: bilingual,
        species,
        breed: z.string(),
        ageYears: z.number().int().min(0),
        weightKg: z.number().positive(),
        careConditions: z.array(z.string()),
        medication: z.array(
          z.strictObject({
            name: z.string(),
            dose: z.string(),
            schedule: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
          }),
        ),
        diet: z.string(),
      }),
    )
    .min(1),
});

const providerCommon = {
  id: z.string(),
  name: bilingual,
  tier: z.enum(['A', 'B']),
  neighbourhood: neighbourhoodId,
  species: z.array(species).min(1),
};
export const providersFile = z.strictObject({
  label,
  note: z.string(),
  providers: z
    .array(
      z.strictObject({
        ...providerCommon,
        status: z.literal('approved'),
        phone: z.string().regex(/^\+8801[3-9]\d{8}$/),
        capacityPerNight: z.strictObject({ smallPets: z.number().int().positive() }),
        pricePerNightPoisha: z.number().int().positive(),
        capabilities: z.array(z.string()),
        experience: bilingual,
      }),
    )
    .min(4),
  applications: z
    .array(z.strictObject({ ...providerCommon, status: z.literal('applied'), note: z.string() }))
    .min(1),
});

/** Words that would make a seed record look like a real trust signal. */
export const FORBIDDEN_TRUST_SIGNAL =
  /rating|review|testimonial|stars?\b|booking_?count|completed_?bookings|verified_?stays|years_?hosting|response_?time/i;

/** Returns every key anywhere in the data that looks like a trust signal. */
export function findTrustSignals(value: unknown, path = ''): string[] {
  if (Array.isArray(value))
    return value.flatMap((item, index) => findTrustSignals(item, `${path}[${index}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, inner]) => [
      ...(FORBIDDEN_TRUST_SIGNAL.test(key) ? [`${path}.${key}`] : []),
      ...findTrustSignals(inner, `${path}.${key}`),
    ]);
  }
  return [];
}

export type Seed = {
  neighbourhoods: z.infer<typeof neighbourhoodsFile>;
  vetClinics: z.infer<typeof vetClinicsFile>;
  people: z.infer<typeof peopleFile>;
  pets: z.infer<typeof petsFile>;
  providers: z.infer<typeof providersFile>;
};

const read = (dir: string, name: string): unknown =>
  JSON.parse(readFileSync(join(dir, name), 'utf8'));

/** Reads and validates the seed folder; throws a readable error if anything is wrong. */
export function loadSeed(dir: string): Seed {
  const seed: Seed = {
    neighbourhoods: neighbourhoodsFile.parse(read(dir, 'neighbourhoods.json')),
    vetClinics: vetClinicsFile.parse(read(dir, 'vet-clinics.json')),
    people: peopleFile.parse(read(dir, 'people.json')),
    pets: petsFile.parse(read(dir, 'pets.json')),
    providers: providersFile.parse(read(dir, 'providers.json')),
  };

  const problems: string[] = [];
  const signals = findTrustSignals(seed);
  if (signals.length)
    problems.push(`trust signals are not allowed in seed data: ${signals.join(', ')}`);

  const owners = new Set(seed.people.owners.map((owner) => owner.id));
  for (const pet of seed.pets.pets)
    if (!owners.has(pet.owner)) problems.push(`pet ${pet.id} has unknown owner ${pet.owner}`);

  const covered = new Set(seed.vetClinics.clinics.map((clinic) => clinic.neighbourhood));
  for (const id of platformRules.launchNeighbourhoods)
    if (!covered.has(id)) problems.push(`no vet clinic for ${id}`);

  const tiers = new Set(seed.providers.providers.map((provider) => provider.tier));
  if (!(tiers.has('A') && tiers.has('B')))
    problems.push('approved providers must include both tiers');
  const approved = seed.providers.providers.length;
  if (approved < platformRules.shortlist.min)
    problems.push(
      `need at least ${platformRules.shortlist.min} approved providers for a shortlist`,
    );
  if (!seed.providers.applications.some((application) => application.tier === 'B'))
    problems.push('need one pending Tier-B application');

  if (problems.length) throw new Error(`Invalid training seed:\n- ${problems.join('\n- ')}`);
  return seed;
}
