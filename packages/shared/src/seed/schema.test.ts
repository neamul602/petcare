import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findTrustSignals, loadSeed } from './schema.ts';

const REAL_SEED = fileURLToPath(new URL('../../seed', import.meta.url));

/** Copy the real seed, change one file, and load it. */
function seedWith(file: string, change: (data: Record<string, unknown>) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'petcare-seed-'));
  cpSync(REAL_SEED, dir, { recursive: true });
  const path = join(dir, file);
  const data = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  change(data);
  writeFileSync(path, JSON.stringify(data));
  return dir;
}

describe('FND-07 training seed', () => {
  const seed = loadSeed(REAL_SEED);

  it('has the three launch neighbourhoods and vet clinics in each', () => {
    expect(seed.neighbourhoods.neighbourhoods.map((n) => n.id)).toEqual([
      'gulshan',
      'banani',
      'baridhara',
    ]);
    for (const id of ['gulshan', 'banani', 'baridhara']) {
      expect(
        seed.vetClinics.clinics.filter((c) => c.neighbourhood === id).length,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('has Bibi in Banani and Tito the diabetic Shih Tzu with insulin twice daily and a low-carb diet', () => {
    expect(seed.people.owners[0]).toMatchObject({ id: 'bibi', neighbourhood: 'banani' });
    expect(seed.pets.pets[0]).toMatchObject({
      id: 'tito',
      owner: 'bibi',
      species: 'dog',
      breed: 'Shih Tzu',
      ageYears: 4,
      weightKg: 6,
      careConditions: ['diabetic'],
      diet: 'low-carb kibble only',
    });
    expect(seed.pets.pets[0]?.medication[0]).toMatchObject({
      name: 'insulin',
      schedule: ['08:00', '20:00'],
    });
  });

  it('has Rashid as a Tier-A Gulshan sitter with room for 2 small pets at BDT 2,500 a night', () => {
    const rashid = seed.providers.providers.find((p) => p.id === 'rashid');
    expect(rashid).toMatchObject({
      tier: 'A',
      neighbourhood: 'gulshan',
      capacityPerNight: { smallPets: 2 },
      pricePerNightPoisha: 250_000,
      status: 'approved',
    });
  });

  it('has the admin Ayaat, further approved providers across both tiers and one pending Tier-B application', () => {
    expect(seed.people.admins[0]?.name).toBe('Ayaat');
    expect(seed.providers.providers.length).toBeGreaterThanOrEqual(4);
    expect(new Set(seed.providers.providers.map((p) => p.tier))).toEqual(new Set(['A', 'B']));
    expect(seed.providers.applications).toHaveLength(1);
    expect(seed.providers.applications[0]).toMatchObject({ tier: 'B', status: 'applied' });
  });

  it('labels every file as training data', () => {
    for (const file of Object.values(seed)) expect(file.label).toBe('TRAINING DATA');
  });

  it('contains no rating, review, testimonial or booking count anywhere', () => {
    expect(findTrustSignals(seed)).toEqual([]);
    expect(JSON.stringify(seed)).not.toMatch(
      /"(rating|reviews?|testimonials?|bookingCount|stars)"/i,
    );
  });
});

describe('the seed validator refuses unsafe data', () => {
  it.each([
    [
      'a rating on a provider',
      'providers.json',
      (d: Record<string, unknown>) =>
        ((d.providers as Array<Record<string, unknown>>)[0]!.rating = 4.9),
    ],
    [
      'a review count',
      'providers.json',
      (d: Record<string, unknown>) =>
        ((d.providers as Array<Record<string, unknown>>)[0]!.reviewCount = 47),
    ],
    [
      'a testimonial',
      'providers.json',
      (d: Record<string, unknown>) =>
        ((d.providers as Array<Record<string, unknown>>)[1]!.testimonial = 'Great!'),
    ],
    [
      'a missing training label',
      'neighbourhoods.json',
      (d: Record<string, unknown>) => delete d.label,
    ],
    [
      'a neighbourhood outside the launch areas',
      'vet-clinics.json',
      (d: Record<string, unknown>) =>
        ((d.clinics as Array<Record<string, unknown>>)[0]!.neighbourhood = 'dhanmondi'),
    ],
    [
      'a species other than dog or cat',
      'pets.json',
      (d: Record<string, unknown>) =>
        ((d.pets as Array<Record<string, unknown>>)[0]!.species = 'bird'),
    ],
    [
      'no pending application',
      'providers.json',
      (d: Record<string, unknown>) => (d.applications = []),
    ],
  ])('rejects %s', (_name, file, change) => {
    expect(() => loadSeed(seedWith(file, change))).toThrow();
  });

  it('rejects a pet whose owner does not exist', () => {
    const dir = seedWith(
      'pets.json',
      (d) => ((d.pets as Array<Record<string, unknown>>)[0]!.owner = 'nobody'),
    );
    expect(() => loadSeed(dir)).toThrow(/unknown owner/);
  });

  it('rejects having fewer than three approved providers for a shortlist', () => {
    const dir = seedWith('providers.json', (d) => ((d.providers as unknown[]).length = 2));
    expect(() => loadSeed(dir)).toThrow();
  });

  it('finds trust signals nested deep inside the data', () => {
    expect(findTrustSignals({ a: [{ b: { avgRating: 4 } }] })).toEqual(['.a[0].b.avgRating']);
  });
});
