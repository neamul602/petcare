/** Archive keeps history; 24-month retention; audited deletion (PET-07). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TestClock } from '@petcare/shared/clock';
import { buildDummyApp } from '../../../dummy-services/src/app.ts';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { createDummyPayments } from '../payments/dummy-payments.ts';
import { runSeed } from '../seed/run.ts';
import { createDummyPhotos } from './dummy-photos.ts';
import { addMonths } from './retention.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_retention';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');
let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let app: FastifyInstance;
const cookies = { bibi: '', admin: '' };

const call = (
  method: 'GET' | 'POST' | 'DELETE',
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

beforeAll(async () => {
  await runSeed({ databaseUrl: TEST_URL, dummyUrl: null });
  ({ db, pool } = createDatabase(TEST_URL));
  dummy = buildDummyApp({ timeoutMs: 20 });
  await dummy.listen({ port: 0, host: '127.0.0.1' });
  const address = dummy.server.address();
  const dummyUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
  app = await buildApp({
    db,
    otp: { send: async () => undefined } as never,
    payments: createDummyPayments(dummyUrl, 2000),
    photos: createDummyPhotos(dummyUrl, 2000),
    clock,
  });
  const store = createSessionStore(db, clock);
  cookies.bibi = `pc_session=${(await store.create('user', 'bibi', 9 * 365 * 86_400_000)).token}`;
  cookies.admin = `pc_admin_session=${(await store.create('admin', 'ayaat', 9 * 365 * 86_400_000)).token}`;
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

const newPet = async (name: string) =>
  (
    await call('POST', '/owner/pets', 'bibi', {
      name,
      species: 'cat',
      breed: 'Persian',
      ageYears: 3,
      weightKg: 4,
      sex: 'female',
      neutered: true,
      vaccination: 'up_to_date',
      behaviour: { energy: 'calm', goodWith: [], triggers: '', notes: '' },
      catDetails: { litterBox: 'covered', indoorOutdoor: 'indoor', company: 'single' },
    })
  ).json().pet.id as string;

describe('dates', () => {
  it('adds calendar months, keeping the end of the month safe', () => {
    expect(addMonths('2026-12-13', 24)).toBe('2028-12-13');
    expect(addMonths('2026-02-28', 24)).toBe('2028-02-28');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-02-29', 12)).toBe('2029-02-28');
  });
});

describe('PET-07 archive and retention', () => {
  it('archiving removes the pet from the active list but keeps its bookings and history', async () => {
    const pet = await newPet('Mimi');
    const booking = await call('POST', '/owner/bookings', 'bibi', {
      key: `ret-1-abcdefgh`,
      providerSlug: 'nusrat',
      petId: pet,
      from: '2026-12-10',
      to: '2026-12-12',
      method: 'bkash',
    });
    expect(booking.statusCode).toBe(201);
    await pool.query(
      "INSERT INTO care_history (id, pet_id, start_date, end_date, outcome, care_plan_snapshot) VALUES ('ch-keep', $1, '2026-06-01', '2026-06-03', 'completed', '{}')",
      [pet],
    );
    expect((await call('POST', `/owner/pets/${pet}/archive`, 'bibi')).statusCode).toBe(200);
    expect(
      (await call('GET', '/owner/pets', 'bibi')).json().pets.map((p: { id: string }) => p.id),
    ).not.toContain(pet);
    expect(
      (await call('GET', `/owner/bookings/${booking.json().booking.id}`, 'bibi')).json().booking.pet
        .name,
    ).toBe('Mimi');
    expect(
      (await call('GET', `/owner/pets/${pet}/care-history`, 'bibi')).json().entries,
    ).toHaveLength(1);
    const again = await call('POST', '/owner/bookings', 'bibi', {
      key: `ret-2-abcdefgh`,
      providerSlug: 'nusrat',
      petId: pet,
      from: '2026-12-20',
      to: '2026-12-22',
      method: 'bkash',
    });
    expect(again.json().error.code).toBe('pet_not_found');
  });
  it('reports the retention window: 24 months after the last booking', async () => {
    const pet = await newPet('Lulu');
    await call('POST', '/owner/bookings', 'bibi', {
      key: `ret-3-abcdefgh`,
      providerSlug: 'nusrat',
      petId: pet,
      from: '2026-12-10',
      to: '2026-12-13',
      method: 'bkash',
    });
    const status = (await call('GET', `/admin/retention/pets/${pet}`, 'admin')).json();
    expect(status).toMatchObject({
      lastBookingEnd: '2026-12-13',
      retainedUntil: '2028-12-13',
      withinWindow: true,
      months: 24,
    });
    clock.set('2028-12-14T06:00:00Z');
    expect((await call('GET', `/admin/retention/pets/${pet}`, 'admin')).json().withinWindow).toBe(
      false,
    );
    clock.set('2026-12-01T06:00:00Z');
    expect((await call('GET', '/admin/retention/pets/nope', 'admin')).statusCode).toBe(404);
    expect((await call('GET', `/admin/retention/pets/${pet}`, 'bibi')).statusCode).toBe(403);
  });
  it('refuses deletion while the pet is active, inside the window, or still has booking records', async () => {
    const pet = await newPet('Coco');
    await call('POST', '/owner/bookings', 'bibi', {
      key: `ret-4-abcdefgh`,
      providerSlug: 'nusrat',
      petId: pet,
      from: '2026-12-10',
      to: '2026-12-12',
      method: 'bkash',
    });
    expect((await call('DELETE', `/admin/records/pets/${pet}`, 'admin')).json().error.code).toBe(
      'not_archived',
    );
    await call('POST', `/owner/pets/${pet}/archive`, 'bibi');
    expect((await call('DELETE', `/admin/records/pets/${pet}`, 'admin')).json().error.code).toBe(
      'within_retention',
    );
    clock.set('2029-01-01T06:00:00Z');
    expect((await call('DELETE', `/admin/records/pets/${pet}`, 'admin')).json().error.code).toBe(
      'has_booking_records',
    );
    clock.set('2026-12-01T06:00:00Z');
    expect((await call('DELETE', `/admin/records/pets/${pet}`, 'bibi')).statusCode).toBe(403);
  });
  it('deletes an archived pet with no booking, as an audited admin event', async () => {
    const pet = await newPet('Zuzu');
    await pool.query(
      "INSERT INTO care_history (id, pet_id, start_date, end_date, outcome, care_plan_snapshot) VALUES ('ch-gone', $1, '2020-06-01', '2020-06-03', 'completed', '{}')",
      [pet],
    );
    await call('POST', `/owner/pets/${pet}/archive`, 'bibi');
    const deleted = await call('DELETE', `/admin/records/pets/${pet}`, 'admin');
    expect(deleted.statusCode).toBe(200);
    expect(
      (await pool.query('SELECT count(*)::int AS n FROM pets WHERE id=$1', [pet])).rows[0].n,
    ).toBe(0);
    expect(
      (await pool.query('SELECT count(*)::int AS n FROM care_history WHERE pet_id=$1', [pet]))
        .rows[0].n,
    ).toBe(0);
    const audit = await pool.query(
      "SELECT actor, payload FROM event_log WHERE action='record.pet_deleted' AND target_id=$1",
      [pet],
    );
    expect(audit.rows).toHaveLength(1);
    expect(audit.rows[0].actor).toBe('admin:ayaat');
    expect(audit.rows[0].payload.name).toBe('Zuzu');
  });
});
