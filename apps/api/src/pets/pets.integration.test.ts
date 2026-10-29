/**
 * Pets, care plan, clinical screening, care history, pre-fill and the provider summary, against real
 * PostgreSQL and the real Dummy photo service (in process). Covers PET-01 to PET-06.
 */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SystemClock } from '@petcare/shared/clock';
import { emptyCarePlan, type CarePlan } from '@petcare/shared/pets';
import { buildDummyApp } from '../../../dummy-services/src/app.ts';
import { buildApp } from '../app.ts';
import { createDummyOtp } from '../auth/dummy-otp.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { runSeed } from '../seed/run.ts';
import { recordCareHistory } from './care-history.ts';
import type { PetAccessPolicy } from './care-summary.ts';
import { createDummyPhotos } from './dummy-photos.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_pets';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from('tito photo'),
]);
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from('second photo')]);

let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let dummyUrl: string;
let app: FastifyInstance;
let allowedPets = new Set<string>();
const policy: PetAccessPolicy = {
  canProviderView: async (_provider, petId) => allowedPets.has(petId),
};
const cookies: Record<'bibi' | 'rashid' | 'other', string> = { bibi: '', rashid: '', other: '' };

const call = (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  who: keyof typeof cookies | null,
  payload?: unknown,
) =>
  app.inject({
    method,
    url,
    payload: payload as object,
    headers: who ? { cookie: cookies[who] } : {},
  });

function multipart(
  content: Buffer | string,
  options: { filename?: string; type?: string; name?: string } = {},
) {
  const boundary = '----pets-test';
  const head = `--${boundary}\r\nContent-Disposition: form-data; name="${options.name ?? 'file'}"; filename="${options.filename ?? 'pet.png'}"\r\nContent-Type: ${options.type ?? 'image/png'}\r\n\r\n`;
  return {
    payload: Buffer.concat([
      Buffer.from(head),
      Buffer.isBuffer(content) ? content : Buffer.from(content),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  };
}
const upload = (
  petId: string,
  who: keyof typeof cookies,
  content: Buffer | string,
  options?: Parameters<typeof multipart>[1],
) => {
  const { payload, headers } = multipart(content, options);
  return app.inject({
    method: 'POST',
    url: `/owner/pets/${petId}/photos`,
    payload,
    headers: { ...headers, cookie: cookies[who] },
  });
};
const setPhotoMode = (mode: string) =>
  fetch(`${dummyUrl}/_training/photos/failure-mode`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode, timeoutMs: 20 }),
  });

const TITO_PLAN = {
  conditions: [{ name: 'diabetic', notes: 'diagnosed about 8 months ago' }],
  medications: [
    { name: 'insulin', dose: '2 units', schedule: ['08:00', '20:00'], notes: 'with food' },
  ],
  allergies: ['chicken'],
  anxiety: { triggers: 'loud noises', comfort: 'a blanket and a quiet room' },
  diet: {
    type: 'low-carb-kibble',
    brand: 'Acana',
    schedule: '08:00 and 20:00',
    treats: 'none',
    restrictions: ['no table food'],
  },
  senior: false,
  extraAttention: true,
  instructions: 'Insulin log is on the white board; text me if he refuses food.',
  vet: { name: 'Dr. Training', clinic: 'Training Vet Clinic Banani One', phone: '+8801700000201' },
};
const dog = (overrides: Record<string, unknown> = {}) => ({
  name: 'Max',
  species: 'dog',
  breed: 'Labrador',
  ageYears: 3,
  weightKg: 24,
  sex: 'male',
  neutered: true,
  vaccination: 'up_to_date',
  behaviour: { energy: 'high', goodWith: ['dogs', 'children'], triggers: '', notes: '' },
  dogDetails: { walksPerDay: 2, outdoorAccess: 'garden' },
  ...overrides,
});
const cat = (overrides: Record<string, unknown> = {}) => ({
  name: 'Luna',
  species: 'cat',
  breed: 'Persian',
  ageYears: 5,
  weightKg: 4.2,
  sex: 'female',
  neutered: true,
  vaccination: 'not_known',
  catDetails: { litterBox: 'covered', indoorOutdoor: 'indoor', company: 'single' },
  ...overrides,
});
const createPet = async (who: keyof typeof cookies, body: unknown = dog()) =>
  (await call('POST', '/owner/pets', who, body)).json().pet as {
    id: string;
    [key: string]: unknown;
  };

beforeAll(async () => {
  const probe = new pg.Client({ connectionString: BASE });
  await probe.connect().catch((error: unknown) => {
    throw new Error('PostgreSQL is not reachable; run "npm run db:up" first.', { cause: error });
  });
  await probe.end();
  await runSeed({ databaseUrl: TEST_URL, dummyUrl: null });
  ({ db, pool } = createDatabase(TEST_URL));
  dummy = buildDummyApp({ timeoutMs: 20 });
  await dummy.listen({ port: 0, host: '127.0.0.1' });
  const address = dummy.server.address();
  dummyUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
  app = await buildApp({
    db,
    otp: createDummyOtp(dummyUrl),
    photos: createDummyPhotos(dummyUrl, 2000),
    petAccess: policy,
  });
  const store = createSessionStore(db, new SystemClock());
  await pool.query(
    "INSERT INTO users (id, role, phone, name, neighbourhood_id) VALUES ('other-owner', 'owner', '+8801799000777', 'Other Owner', 'gulshan')",
  );
  for (const [key, id] of [
    ['bibi', 'bibi'],
    ['rashid', 'rashid'],
    ['other', 'other-owner'],
  ] as const) {
    cookies[key] = `pc_session=${(await store.create('user', id, 60 * 60_000)).token}`;
  }
});

afterAll(async () => {
  await app?.close();
  await dummy?.close();
  await pool?.end();
  const admin = new pg.Client({ connectionString: BASE.replace(/\/[^/]+$/, '/postgres') });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await admin.end();
});

beforeEach(async () => {
  await fetch(`${dummyUrl}/_training/reset-all`, { method: 'POST' });
  allowedPets = new Set();
  await pool.query(
    "DELETE FROM care_history; DELETE FROM pet_photos; DELETE FROM pets WHERE id <> 'tito'",
  );
});

describe('PET-01 create and edit a pet profile', () => {
  it('creates a dog with dog-only fields and shows it back', async () => {
    const response = await call('POST', '/owner/pets', 'other', dog());
    expect(response.statusCode).toBe(201);
    const { pet } = response.json();
    expect(pet).toMatchObject({
      name: 'Max',
      species: 'dog',
      breed: 'Labrador',
      ageYears: 3,
      weightKg: 24,
      dogDetails: { walksPerDay: 2, outdoorAccess: 'garden' },
      catDetails: null,
      archived: false,
      photos: [],
    });
    expect(pet.carePlan).toEqual(emptyCarePlan());
    expect((await call('GET', `/owner/pets/${pet.id}`, 'other')).json().pet.name).toBe('Max');
  });

  it('creates a cat with cat-only fields', async () => {
    const { pet } = (await call('POST', '/owner/pets', 'other', cat())).json();
    expect(pet).toMatchObject({
      species: 'cat',
      catDetails: { litterBox: 'covered', indoorOutdoor: 'indoor', company: 'single' },
      dogDetails: null,
    });
  });

  it('refuses dog fields on a cat and cat fields on a dog', async () => {
    expect(
      (
        await call(
          'POST',
          '/owner/pets',
          'other',
          cat({ dogDetails: { walksPerDay: 1, outdoorAccess: 'yard' } }),
        )
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await call(
          'POST',
          '/owner/pets',
          'other',
          dog({ catDetails: { litterBox: 'open', indoorOutdoor: 'both', company: 'multi_ok' } }),
        )
      ).statusCode,
    ).toBe(400);
  });

  it('only dogs and cats are accepted', async () => {
    expect((await call('POST', '/owner/pets', 'other', dog({ species: 'bird' }))).statusCode).toBe(
      400,
    );
  });

  it('refuses missing or out-of-range required fields', async () => {
    for (const bad of [
      { name: '' },
      { breed: '' },
      { ageYears: -1 },
      { ageYears: 2.5 },
      { weightKg: 0 },
      { weightKg: 500 },
      { sex: 'robot' },
      { vaccination: 'maybe' },
    ]) {
      expect(
        (await call('POST', '/owner/pets', 'other', dog(bad))).statusCode,
        JSON.stringify(bad),
      ).toBe(400);
    }
    const missing: Record<string, unknown> = dog();
    delete missing.name;
    expect((await call('POST', '/owner/pets', 'other', missing)).json().error.code).toBe(
      'invalid_request',
    );
  });

  it('edits a pet and lists only active pets, newest additions last', async () => {
    const pet = await createPet('other', dog());
    const updated = await call(
      'PUT',
      `/owner/pets/${pet.id}`,
      'other',
      dog({ name: 'Maximus', weightKg: 25.5 }),
    );
    expect(updated.json().pet).toMatchObject({ name: 'Maximus', weightKg: 25.5 });
    await createPet('other', cat());
    expect(
      (await call('GET', '/owner/pets', 'other')).json().pets.map((p: { name: string }) => p.name),
    ).toEqual(['Maximus', 'Luna']);
  });

  it('archiving removes a pet from the list, is repeatable, keeps its history and blocks edits', async () => {
    const pet = await createPet('other');
    await recordCareHistory(db, {
      petId: pet.id,
      startDate: '2026-03-28',
      endDate: '2026-04-02',
      outcome: 'completed',
      carePlanSnapshot: emptyCarePlan(),
    });
    expect((await call('POST', `/owner/pets/${pet.id}/archive`, 'other')).json()).toEqual({
      status: 'archived',
    });
    expect((await call('POST', `/owner/pets/${pet.id}/archive`, 'other')).statusCode).toBe(200);
    expect((await call('GET', '/owner/pets', 'other')).json().pets).toEqual([]);
    expect((await call('GET', `/owner/pets/${pet.id}`, 'other')).json().pet.archived).toBe(true);
    expect(
      (await call('GET', `/owner/pets/${pet.id}/care-history`, 'other')).json().entries,
    ).toHaveLength(1);
    expect((await call('PUT', `/owner/pets/${pet.id}`, 'other', dog())).json().error.code).toBe(
      'pet_archived',
    );
  });

  it("owners cannot see or change each other's pets, providers and guests cannot use owner endpoints", async () => {
    const pet = await createPet('other');
    for (const [method, url] of [
      ['GET', `/owner/pets/${pet.id}`],
      ['PUT', `/owner/pets/${pet.id}`],
      ['POST', `/owner/pets/${pet.id}/archive`],
      ['GET', `/owner/pets/${pet.id}/care-history`],
      ['GET', `/owner/pets/${pet.id}/prefill`],
    ] as const) {
      expect(
        (await call(method, url, 'bibi', method === 'PUT' ? dog() : undefined)).statusCode,
        `${method} ${url}`,
      ).toBe(404);
    }
    expect((await call('GET', '/owner/pets', 'rashid')).statusCode).toBe(403);
    expect((await call('GET', '/owner/pets', null)).statusCode).toBe(401);
    expect(
      (await call('GET', '/owner/pets', 'bibi')).json().pets.map((p: { name: string }) => p.name),
    ).toEqual(['Tito']);
  });
});

describe('PET-01 photos (1 to 5, up to 5 MB)', () => {
  it('stores a photo through the photo port and serves the same bytes back to the owner only', async () => {
    const pet = await createPet('other');
    const response = await upload(pet.id, 'other', PNG);
    expect(response.statusCode).toBe(201);
    const { photo } = response.json();
    expect(photo.url).toBe(`/api/owner/pets/${pet.id}/photos/${photo.id}`);
    const fetched = await call('GET', `/owner/pets/${pet.id}/photos/${photo.id}`, 'other');
    expect(fetched.statusCode).toBe(200);
    expect(fetched.headers['content-type']).toBe('image/png');
    expect(fetched.rawPayload.equals(PNG)).toBe(true);
    expect((await call('GET', `/owner/pets/${pet.id}/photos/${photo.id}`, 'bibi')).statusCode).toBe(
      404,
    );
    expect((await call('GET', `/owner/pets/${pet.id}`, 'other')).json().pet.photos).toHaveLength(1);
    expect((await call('GET', '/owner/pets', 'other')).json().pets[0].photo).toBe(photo.url);
  });

  it('accepts at most five photos', async () => {
    const pet = await createPet('other');
    for (let i = 0; i < 5; i++)
      expect(
        (await upload(pet.id, 'other', i % 2 ? JPEG : PNG, { filename: `p${i}.png` })).statusCode,
      ).toBe(201);
    const sixth = await upload(pet.id, 'other', PNG);
    expect(sixth.statusCode).toBe(409);
    expect(sixth.json().error.code).toBe('too_many_photos');
  });

  it('refuses a photo above 5 MB, something that is not an image, and a wrong form', async () => {
    const pet = await createPet('other');
    const big = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]);
    expect((await upload(pet.id, 'other', big)).json().error.code).toBe('photo_too_large');
    const fake = await upload(pet.id, 'other', 'not an image at all');
    expect(fake.statusCode).toBe(415);
    expect(fake.json().error.code).toBe('unsupported_media_type');
    expect((await upload(pet.id, 'other', PNG, { name: 'picture' })).statusCode).toBe(400);
    expect(
      (await call('POST', `/owner/pets/${pet.id}/photos`, 'other', { file: 'x' })).statusCode,
    ).toBe(415);
    expect((await call('GET', `/owner/pets/${pet.id}`, 'other')).json().pet.photos).toEqual([]);
  });

  it('when photo storage is down the upload fails safely and no half-saved photo remains', async () => {
    const pet = await createPet('other');
    await setPhotoMode('down');
    const down = await upload(pet.id, 'other', PNG);
    expect(down.statusCode).toBe(503);
    expect(down.json().error.code).toBe('photo_unavailable');
    expect((await call('GET', `/owner/pets/${pet.id}`, 'other')).json().pet.photos).toEqual([]);
    await setPhotoMode('timeout');
    expect((await upload(pet.id, 'other', PNG)).statusCode).toBe(503);
    await setPhotoMode('none');
    expect((await upload(pet.id, 'other', PNG)).statusCode).toBe(201);
  });

  it('removes a photo; another owner cannot upload to this pet', async () => {
    const pet = await createPet('other');
    const { photo } = (await upload(pet.id, 'other', PNG)).json();
    expect((await upload(pet.id, 'bibi', PNG)).statusCode).toBe(404);
    expect(
      (await call('DELETE', `/owner/pets/${pet.id}/photos/${photo.id}`, 'bibi')).statusCode,
    ).toBe(404);
    expect(
      (await call('DELETE', `/owner/pets/${pet.id}/photos/${photo.id}`, 'other')).json(),
    ).toEqual({ status: 'removed' });
    expect((await call('GET', `/owner/pets/${pet.id}`, 'other')).json().pet.photos).toEqual([]);
  });
});

describe('PET-02 structured care plan', () => {
  it("Tito's diabetes, twice-daily insulin and low-carb diet fit in structured fields and round-trip unchanged", async () => {
    const pet = await createPet(
      'other',
      dog({ name: 'Tito', breed: 'Shih Tzu', ageYears: 4, weightKg: 6, carePlan: TITO_PLAN }),
    );
    expect(pet.carePlan).toEqual(TITO_PLAN);
    expect(
      ((await call('GET', `/owner/pets/${pet.id}`, 'other')).json().pet.carePlan as CarePlan)
        .medications[0],
    ).toMatchObject({ name: 'insulin', dose: '2 units', schedule: ['08:00', '20:00'] });
  });

  it('free-text instructions sit beside the structured fields, not instead of them', async () => {
    const pet = await createPet(
      'other',
      dog({ carePlan: { ...TITO_PLAN, instructions: 'Please call before noon.' } }),
    );
    const plan = (await call('GET', `/owner/pets/${pet.id}`, 'other')).json().pet
      .carePlan as CarePlan;
    expect(plan.instructions).toBe('Please call before noon.');
    expect(plan.medications).toHaveLength(1);
    expect(plan.diet?.type).toBe('low-carb-kibble');
  });

  it('allergy, anxiety, special diet, senior and extra attention each have structured inputs', async () => {
    const pet = await createPet(
      'other',
      cat({
        carePlan: {
          ...emptyCarePlan(),
          allergies: ['fish'],
          anxiety: { triggers: 'visitors', comfort: 'a cardboard box' },
          diet: { type: 'wet', restrictions: ['grain-free'] },
          senior: true,
          extraAttention: true,
        },
      }),
    );
    expect(pet.carePlan).toMatchObject({
      allergies: ['fish'],
      anxiety: { triggers: 'visitors' },
      diet: { type: 'wet', restrictions: ['grain-free'] },
      senior: true,
      extraAttention: true,
    });
  });

  it('refuses malformed medication and plan details', async () => {
    const withMed = (medication: unknown) =>
      dog({ carePlan: { ...emptyCarePlan(), medications: [medication] } });
    expect(
      (
        await call(
          'POST',
          '/owner/pets',
          'other',
          withMed({ name: 'insulin', dose: '2 units', schedule: ['8am'] }),
        )
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await call(
          'POST',
          '/owner/pets',
          'other',
          withMed({ name: 'insulin', dose: '', schedule: ['08:00'] }),
        )
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await call(
          'POST',
          '/owner/pets',
          'other',
          withMed({ name: 'insulin', dose: '2 units', schedule: [] }),
        )
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await call(
          'POST',
          '/owner/pets',
          'other',
          dog({
            carePlan: {
              ...emptyCarePlan(),
              medications: Array.from({ length: 11 }, () => ({
                name: 'x',
                dose: 'y',
                schedule: ['08:00'],
              })),
            },
          }),
        )
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await call(
          'POST',
          '/owner/pets',
          'other',
          dog({ carePlan: { ...emptyCarePlan(), diet: { type: 'pizza', restrictions: [] } } }),
        )
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await call(
          'POST',
          '/owner/pets',
          'other',
          dog({ carePlan: { ...emptyCarePlan(), instructions: 'x'.repeat(1001) } }),
        )
      ).statusCode,
    ).toBe(400);
  });

  it('the seeded Tito has his structured plan for Bibi', async () => {
    const { pets } = (await call('GET', '/owner/pets', 'bibi')).json();
    const tito = (await call('GET', `/owner/pets/${pets[0].id}`, 'bibi')).json().pet;
    expect(tito).toMatchObject({
      name: 'Tito',
      species: 'dog',
      breed: 'Shih Tzu',
      ageYears: 4,
      weightKg: 6,
    });
    expect(tito.carePlan.conditions[0].name).toBe('diabetic');
    expect(tito.carePlan.medications[0]).toMatchObject({
      name: 'insulin',
      schedule: ['08:00', '20:00'],
    });
    expect(tito.carePlan.diet.type).toBe('low-carb-kibble');
  });
});

describe('PET-03 clinical requests are rejected at intake', () => {
  const screen = (body: unknown, who: keyof typeof cookies = 'bibi') =>
    call('POST', '/owner/intake/screen', who, body);
  const lastLog = async () =>
    (
      await pool.query(
        "SELECT actor, action, payload FROM event_log WHERE action LIKE 'intake.%' ORDER BY id DESC LIMIT 1",
      )
    ).rows[0];

  it('a declared clinical purpose is refused with a plain explanation and logged', async () => {
    const response = await screen({ declaredClinical: true, petId: 'tito' });
    expect(response.statusCode).toBe(422);
    expect(response.json().error).toMatchObject({ code: 'clinical_request_rejected' });
    expect(response.json().error.message).toMatch(/boarding service/);
    expect(await lastLog()).toMatchObject({
      actor: 'owner:bibi',
      action: 'intake.clinical_rejected',
    });
  });

  it('text that sounds clinical asks the owner to confirm, and passes once confirmed', async () => {
    const asked = await screen({ text: 'He needs wound care and a drip after the surgery' });
    expect(asked.statusCode).toBe(422);
    expect(asked.json().error).toMatchObject({ code: 'needs_confirmation' });
    expect(asked.json().error.matched).toEqual(
      expect.arrayContaining(['wound care', 'iv drip', 'surgery']),
    );
    expect(await lastLog()).toMatchObject({ action: 'intake.clinical_confirmation_asked' });
    expect(
      (
        await screen({ text: 'He needs wound care after the surgery', confirmedNotClinical: true })
      ).json(),
    ).toEqual({ allowed: true });
  });

  it('Bangla clinical words are caught too', async () => {
    expect((await screen({ text: 'অস্ত্রোপচারের পর যত্ন' })).json().error.code).toBe(
      'needs_confirmation',
    );
  });

  it('everyday special care such as insulin for a diabetic dog is allowed', async () => {
    expect(
      (
        await screen({
          text: 'Insulin 2 units at 8am and 8pm with food; text me if he refuses to eat or seems tired.',
        })
      ).json(),
    ).toEqual({ allowed: true });
    expect((await screen({})).json()).toEqual({ allowed: true });
  });

  it('only owners can use the screen and an oversized text is refused', async () => {
    expect((await screen({ declaredClinical: true }, 'rashid')).statusCode).toBe(403);
    expect((await screen({ text: 'x'.repeat(6000) })).statusCode).toBe(400);
  });
});

describe('PET-04 pet page and care history', () => {
  it('a pet with no stays says so, with no invented entries', async () => {
    const pet = await createPet('other');
    expect((await call('GET', `/owner/pets/${pet.id}/care-history`, 'other')).json()).toEqual({
      empty: true,
      entries: [],
    });
  });

  it('lists completed, declined and canceled entries newest first with their details', async () => {
    const pet = await createPet('other');
    const plan = { ...emptyCarePlan(), allergies: ['chicken'] };
    await recordCareHistory(db, {
      petId: pet.id,
      providerId: 'rashid',
      bookingId: 'b1',
      startDate: '2026-01-10',
      endDate: '2026-01-15',
      outcome: 'completed',
      carePlanSnapshot: plan,
      reviewId: 'r1',
    });
    await recordCareHistory(db, {
      petId: pet.id,
      providerId: 'farzana',
      startDate: '2026-02-01',
      endDate: '2026-02-03',
      outcome: 'declined',
      declineReason: 'cannot-administer-medication',
      carePlanSnapshot: plan,
    });
    await recordCareHistory(db, {
      petId: pet.id,
      providerId: 'rashid',
      startDate: '2026-03-01',
      endDate: '2026-03-05',
      outcome: 'completed',
      carePlanSnapshot: plan,
    });
    const body = (await call('GET', `/owner/pets/${pet.id}/care-history`, 'other')).json();
    expect(body.empty).toBe(false);
    expect(body.entries.map((e: { endDate: string }) => e.endDate)).toEqual([
      '2026-03-05',
      '2026-02-03',
      '2026-01-15',
    ]);
    expect(body.entries[1]).toMatchObject({
      outcome: 'declined',
      declineReason: 'cannot-administer-medication',
      providerId: 'farzana',
    });
    expect(body.entries[2]).toMatchObject({ reviewId: 'r1', carePlan: { allergies: ['chicken'] } });
  });

  it("another owner's pet history is refused", async () => {
    const pet = await createPet('other');
    expect((await call('GET', `/owner/pets/${pet.id}/care-history`, 'bibi')).statusCode).toBe(404);
  });
});

describe('PET-05 care plan pre-fill', () => {
  it('uses the current profile when there was no stay yet and says so', async () => {
    const pet = await createPet('other', dog({ carePlan: TITO_PLAN }));
    const prefill = (await call('GET', `/owner/pets/${pet.id}/prefill`, 'other')).json();
    expect(prefill).toMatchObject({ source: 'profile', stay: null });
    expect(prefill.carePlan).toEqual(TITO_PLAN);
  });

  it("uses the last completed stay's plan, marked as coming from that stay", async () => {
    const pet = await createPet('other', dog({ carePlan: TITO_PLAN }));
    const lastPlan = { ...TITO_PLAN, instructions: 'Lower-carb kibble is still in stock.' };
    await recordCareHistory(db, {
      petId: pet.id,
      startDate: '2026-01-01',
      endDate: '2026-01-05',
      outcome: 'completed',
      carePlanSnapshot: { ...TITO_PLAN, instructions: 'older' } as CarePlan,
    });
    const latest = await recordCareHistory(db, {
      petId: pet.id,
      startDate: '2026-03-01',
      endDate: '2026-03-05',
      outcome: 'completed',
      carePlanSnapshot: lastPlan as CarePlan,
    });
    await recordCareHistory(db, {
      petId: pet.id,
      startDate: '2026-04-01',
      endDate: '2026-04-02',
      outcome: 'declined',
      declineReason: 'generic-decline',
      carePlanSnapshot: { ...TITO_PLAN, instructions: 'declined one' } as CarePlan,
    });
    const prefill = (await call('GET', `/owner/pets/${pet.id}/prefill`, 'other')).json();
    expect(prefill).toMatchObject({
      source: 'last_stay',
      stay: { id: latest.id, endDate: '2026-03-05' },
    });
    expect(prefill.carePlan.instructions).toBe('Lower-carb kibble is still in stock.');
  });

  it("never mixes in another pet's history", async () => {
    const a = await createPet('other', dog({ name: 'A' }));
    const b = await createPet('other', dog({ name: 'B' }));
    await recordCareHistory(db, {
      petId: a.id,
      startDate: '2026-01-01',
      endDate: '2026-01-05',
      outcome: 'completed',
      carePlanSnapshot: { ...emptyCarePlan(), instructions: 'only for A' },
    });
    expect((await call('GET', `/owner/pets/${b.id}/prefill`, 'other')).json().source).toBe(
      'profile',
    );
  });
});

describe('PET-06 provider care summary', () => {
  it('is refused unless the pet has a request with this provider', async () => {
    const response = await call('GET', '/provider/pets/tito/care-summary', 'rashid');
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe('no_access');
  });

  it('shows prior stays with this provider and with others, flags, medication, diet and decline patterns', async () => {
    const pet = await createPet('other', dog({ name: 'Tito', carePlan: TITO_PLAN }));
    allowedPets.add(pet.id);
    for (const [provider, end] of [
      ['rashid', '2026-01-05'],
      ['farzana', '2026-02-05'],
      ['rashid', '2026-03-05'],
    ] as const) {
      await recordCareHistory(db, {
        petId: pet.id,
        providerId: provider,
        startDate: '2026-01-01',
        endDate: end,
        outcome: 'completed',
        carePlanSnapshot: TITO_PLAN as CarePlan,
      });
    }
    for (let i = 0; i < 2; i++)
      await recordCareHistory(db, {
        petId: pet.id,
        providerId: 'kamrul',
        startDate: '2026-04-01',
        endDate: '2026-04-02',
        outcome: 'declined',
        declineReason: 'cannot-administer-medication',
        carePlanSnapshot: TITO_PLAN as CarePlan,
      });
    const { summary } = (
      await call('GET', `/provider/pets/${pet.id}/care-summary`, 'rashid')
    ).json();
    expect(summary.pet).toMatchObject({ name: 'Tito', species: 'dog', breed: 'Labrador' });
    expect(summary.flags).toEqual({
      senior: false,
      extraAttention: true,
      anxiety: true,
      medication: true,
      allergies: true,
    });
    expect(summary.carePlan.medications[0]).toMatchObject({
      name: 'insulin',
      schedule: ['08:00', '20:00'],
    });
    expect(summary.carePlan.diet.type).toBe('low-carb-kibble');
    expect(summary.history).toEqual({
      staysWithYou: 2,
      lastStayWithYou: { endDate: '2026-03-05' },
      staysWithOthers: 1,
      declinePatterns: [{ reason: 'cannot-administer-medication', count: 2 }],
    });
    expect(summary.repeat).toBe(true);
  });

  it('is read-only and never reveals the owner', async () => {
    const pet = await createPet('other', dog({ carePlan: TITO_PLAN }));
    allowedPets.add(pet.id);
    const response = await call('GET', `/provider/pets/${pet.id}/care-summary`, 'rashid');
    expect(response.json().summary.readOnly).toBe(true);
    expect(response.body).not.toMatch(/phone|ownerId|owner_id|Other Owner|8801799000777/);
    for (const method of ['PUT', 'POST', 'DELETE'] as const)
      expect(
        (await call(method, `/provider/pets/${pet.id}/care-summary`, 'rashid', {})).statusCode,
      ).toBe(404);
  });

  it('an owner or a guest cannot use it, and an unknown pet is a 404', async () => {
    allowedPets.add('missing');
    expect((await call('GET', '/provider/pets/tito/care-summary', 'bibi')).statusCode).toBe(403);
    expect((await call('GET', '/provider/pets/tito/care-summary', null)).statusCode).toBe(401);
    expect((await call('GET', '/provider/pets/missing/care-summary', 'rashid')).statusCode).toBe(
      404,
    );
  });
});
