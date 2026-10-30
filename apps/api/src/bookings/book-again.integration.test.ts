/** Owner bookings list and Book again against real PostgreSQL (BKG-16, BKG-17). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TestClock } from '@petcare/shared/clock';
import { buildDummyApp } from '../../../dummy-services/src/app.ts';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { createDummyPayments } from '../payments/dummy-payments.ts';
import { createDummyPayouts } from '../payouts/dummy-payouts.ts';
import { createDummyPhotos } from '../pets/dummy-photos.ts';
import { runSeed } from '../seed/run.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_again';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');
let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let dummyUrl: string;
let app: FastifyInstance;
const cookies = { bibi: '', other: '', rashid: '' };
let seq = 0;

const call = (
  method: 'GET' | 'POST',
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

async function completed() {
  clock.set('2026-12-01T06:00:00Z');
  const id = (
    await call('POST', '/owner/bookings', 'bibi', {
      key: `ag-${++seq}-abcdefgh`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: '2026-12-10',
      to: '2026-12-13',
      method: 'bkash',
      instructions: 'Insulin with food, please',
    })
  ).json().booking.id as string;
  await call('POST', `/provider/bookings/${id}/confirm`, 'rashid');
  clock.set('2026-12-10T04:00:00Z');
  await call('POST', `/provider/bookings/${id}/start`, 'rashid');
  clock.set('2026-12-13T05:00:00Z');
  await call('POST', `/provider/bookings/${id}/complete`, 'rashid');
  await call('POST', `/owner/bookings/${id}/confirm-completion`, 'bibi');
  return id;
}

beforeAll(async () => {
  await runSeed({ databaseUrl: TEST_URL, dummyUrl: null });
  ({ db, pool } = createDatabase(TEST_URL));
  dummy = buildDummyApp({ timeoutMs: 20 });
  await dummy.listen({ port: 0, host: '127.0.0.1' });
  const address = dummy.server.address();
  dummyUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
  app = await buildApp({
    db,
    otp: { send: async () => undefined } as never,
    payments: createDummyPayments(dummyUrl, 2000),
    payouts: createDummyPayouts(dummyUrl, 2000),
    photos: createDummyPhotos(dummyUrl, 2000),
    clock,
  });
  await pool.query(
    "INSERT INTO users (id, role, phone, name, neighbourhood_id) VALUES ('other-owner','owner','+8801799000777','Other','gulshan')",
  );
  const store = createSessionStore(db, clock);
  const day = 90 * 24 * 3_600_000;
  for (const [k, id] of [
    ['bibi', 'bibi'],
    ['other', 'other-owner'],
    ['rashid', 'rashid'],
  ] as const)
    cookies[k] = `pc_session=${(await store.create('user', id, day)).token}`;
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
  await pool.query("UPDATE providers SET status='approved' WHERE id='rashid'");
  await pool.query('TRUNCATE update_photos, daily_updates');
  await pool.query(
    'DELETE FROM book_again_timers; DELETE FROM acute_events; DELETE FROM reports; DELETE FROM reviews; DELETE FROM payout_batches; DELETE FROM payouts; DELETE FROM booking_flags; DELETE FROM care_history; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
});

describe('BKG-17 owner bookings list', () => {
  it('lists upcoming and past bookings with pills; a completed stay offers Book again', async () => {
    const done = await completed();
    clock.set('2026-12-14T06:00:00Z');
    const waiting = (
      await call('POST', '/owner/bookings', 'bibi', {
        key: `ag-${++seq}-abcdefgh`,
        providerSlug: 'rashid',
        petId: 'tito',
        from: '2026-12-20',
        to: '2026-12-22',
        method: 'bkash',
      })
    ).json().booking.id;
    const list = (await call('GET', '/owner/bookings', 'bibi')).json();
    expect(list.upcoming.map((b: { id: string }) => b.id)).toEqual([waiting]);
    expect(list.upcoming[0]).toMatchObject({
      pill: 'authorized',
      canBookAgain: false,
      provider: { slug: 'rashid' },
    });
    expect(list.past.map((b: { id: string }) => b.id)).toEqual([done]);
    expect(list.past[0]).toMatchObject({ pill: 'completed', canBookAgain: true });
    expect((await call('GET', '/owner/bookings', 'other')).json()).toEqual({
      upcoming: [],
      past: [],
    });
    expect((await call('GET', '/owner/bookings', null)).statusCode).toBe(401);
  });
});

describe('BKG-16 Book again', () => {
  it('starts a server timer and says what to pre-fill', async () => {
    const id = await completed();
    clock.set('2026-12-20T06:00:00Z');
    const started = await call('POST', '/owner/book-again', 'bibi', { bookingId: id });
    expect(started.statusCode).toBe(201);
    expect(started.json()).toMatchObject({ providerSlug: 'rashid', providerAvailable: true });
    const timer = (await call('GET', `/owner/book-again/${started.json().timerId}`, 'bibi')).json();
    expect(timer.prefill).toEqual({
      petId: 'tito',
      petName: 'Tito',
      instructions: 'Insulin with food, please',
      nights: 3,
    });
    expect(timer.submittedAt).toBeNull();
  });
  it('works like a first booking (a new hold) and stores the elapsed time on submit', async () => {
    const id = await completed();
    clock.set('2026-12-20T06:00:00Z');
    const timerId = (await call('POST', '/owner/book-again', 'bibi', { bookingId: id })).json()
      .timerId;
    clock.advanceMinutes(3);
    const second = await call('POST', '/owner/bookings', 'bibi', {
      key: `ag-${++seq}-abcdefgh`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: '2026-12-28',
      to: '2026-12-31',
      method: 'nagad',
      bookAgainId: timerId,
    });
    expect(second.statusCode).toBe(201);
    const timer = (await call('GET', `/owner/book-again/${timerId}`, 'bibi')).json();
    expect(timer.elapsedSeconds).toBe(180);
    expect(timer.submittedAt).toBeTruthy();
    expect(timer.elapsedSeconds).toBeLessThan(240);
    expect((await pool.query('SELECT count(*)::int AS n FROM payments')).rows[0].n).toBe(2);
    const stored = (
      await pool.query('SELECT booking_id FROM book_again_timers WHERE id=$1', [timerId])
    ).rows[0];
    expect(stored.booking_id).toBe(second.json().booking.id);
  });
  it('is only for your own completed booking', async () => {
    const id = await completed();
    expect((await call('POST', '/owner/book-again', 'other', { bookingId: id })).statusCode).toBe(
      404,
    );
    const waiting = (
      await call('POST', '/owner/bookings', 'bibi', {
        key: `ag-${++seq}-abcdefgh`,
        providerSlug: 'rashid',
        petId: 'tito',
        from: '2026-12-20',
        to: '2026-12-22',
        method: 'bkash',
      })
    ).json().booking.id;
    expect(
      (await call('POST', '/owner/book-again', 'bibi', { bookingId: waiting })).json().error.code,
    ).toBe('not_completed');
    const timerId = (await call('POST', '/owner/book-again', 'bibi', { bookingId: id })).json()
      .timerId;
    expect((await call('GET', `/owner/book-again/${timerId}`, 'other')).statusCode).toBe(404);
  });
  it('says so when the provider is no longer available', async () => {
    const id = await completed();
    await pool.query("UPDATE providers SET status='suspended' WHERE id='rashid'");
    expect(
      (await call('POST', '/owner/book-again', 'bibi', { bookingId: id })).json().providerAvailable,
    ).toBe(false);
  });
});
