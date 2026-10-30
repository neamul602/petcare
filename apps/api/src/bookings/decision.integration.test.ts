/** Provider decision: lists, request view, confirm, decline, timeout against real PostgreSQL and the Dummy gateway (BKG-05..09). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TestClock } from '@petcare/shared/clock';
import { trainingDecisions } from '@petcare/shared/config';
import { buildDummyApp } from '../../../dummy-services/src/app.ts';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { nightsFor } from '../capacity/nights.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { createDummyPayments } from '../payments/dummy-payments.ts';
import { createDummyPhotos } from '../pets/dummy-photos.ts';
import { runSeed } from '../seed/run.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_decision';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');

let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let dummyUrl: string;
let app: FastifyInstance;
const cookies = { bibi: '', rashid: '', farzana: '', other: '' };
let seq = 0;

const mode = (m: string) =>
  fetch(`${dummyUrl}/_training/payments/failure-mode`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: m, timeoutMs: 20 }),
  });
const holds = async () =>
  (
    (await (await fetch(`${dummyUrl}/_training/payments/inspect`)).json()) as {
      state: { authorizations: Array<{ status: string }> };
    }
  ).state.authorizations;
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

/** Bibi requests Rashid for 8 nights; returns the booking id. */
async function request(extra: Record<string, unknown> = {}) {
  const response = await call('POST', '/owner/bookings', 'bibi', {
    key: `dec-${++seq}-abcdefgh`,
    providerSlug: 'rashid',
    petId: 'tito',
    from: '2026-12-10',
    to: '2026-12-18',
    method: 'bkash',
    ...extra,
  });
  return response.json().booking.id as string;
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
    photos: createDummyPhotos(dummyUrl, 2000),
    clock,
  });
  await pool.query(
    "INSERT INTO users (id, role, phone, name, neighbourhood_id) VALUES ('other-owner','owner','+8801799000777','Other','gulshan')",
  );
  const store = createSessionStore(db, clock);
  for (const [k, id] of [
    ['bibi', 'bibi'],
    ['rashid', 'rashid'],
    ['farzana', 'farzana'],
    ['other', 'other-owner'],
  ] as const)
    cookies[k] = `pc_session=${(await store.create('user', id, 30 * 24 * 3_600_000)).token}`;
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
  clock.set('2026-12-01T06:00:00Z');
  await mode('none');
  await fetch(`${dummyUrl}/_training/reset-all`, { method: 'POST' });
  await pool.query(
    'DELETE FROM care_history; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
});

describe('BKG-05 Today and Bookings', () => {
  it('shows waiting requests with time left, and groups the bookings', async () => {
    const id = await request();
    const today = (await call('GET', '/provider/today', 'rashid')).json();
    expect(today.requests).toHaveLength(1);
    expect(today.requests[0]).toMatchObject({
      id,
      pill: 'authorized',
      pet: { name: 'Tito' },
      minutesLeft: 1440,
    });
    expect(today.inStay).toEqual([]);
    clock.advanceMinutes(60);
    expect((await call('GET', '/provider/today', 'rashid')).json().requests[0].minutesLeft).toBe(
      1380,
    );
    await call('POST', `/provider/bookings/${id}/confirm`, 'rashid');
    const list = (await call('GET', '/provider/bookings', 'rashid')).json();
    expect(list.requests).toEqual([]);
    expect(list.upcoming).toHaveLength(1);
    expect(list.past).toEqual([]);
  });
  it('is empty and calm with no bookings, and private to the provider', async () => {
    expect((await call('GET', '/provider/today', 'rashid')).json()).toEqual({
      requests: [],
      inStay: [],
      startToday: [],
    });
    await request();
    expect((await call('GET', '/provider/today', 'farzana')).json().requests).toEqual([]);
    expect((await call('GET', '/provider/today', 'bibi')).statusCode).toBe(403);
    expect((await call('GET', '/provider/bookings', null)).statusCode).toBe(401);
  });
});

describe('BKG-06 request view', () => {
  it('shows dates, price, pet copy, care plan, care summary and time left; no owner contact', async () => {
    const id = await request();
    const view = (await call('GET', `/provider/bookings/${id}`, 'rashid')).json();
    expect(view.booking).toMatchObject({
      nights: 8,
      totalPoisha: 2_000_000,
      pricePerNightPoisha: 250000,
      canAct: true,
      priorStaysWithYou: 0,
      minutesLeft: 1440,
      pet: { name: 'Tito' },
    });
    expect(view.careSummary.carePlan.medications[0].name).toBe('insulin');
    expect(JSON.stringify(view)).not.toContain('+88017');
  });
  it('another provider cannot open it, and pet access follows the request', async () => {
    const id = await request();
    expect((await call('GET', `/provider/bookings/${id}`, 'farzana')).statusCode).toBe(404);
    expect((await call('GET', '/provider/pets/tito/care-summary', 'rashid')).statusCode).toBe(200);
    expect((await call('GET', '/provider/pets/tito/care-summary', 'farzana')).statusCode).toBe(403);
  });
  it('after the window the actions are off and the state is shown', async () => {
    const id = await request();
    clock.advanceMinutes(1441);
    const view = (await call('GET', `/provider/bookings/${id}`, 'rashid')).json();
    expect(view.booking).toMatchObject({ canAct: false, state: 'authorized', minutesLeft: 0 });
    expect(
      (await call('POST', `/provider/bookings/${id}/confirm`, 'rashid')).json().error.code,
    ).toBe('expired');
  });
});

describe('BKG-07 confirm', () => {
  it('captures once and moves to captured; confirming twice is one capture', async () => {
    const id = await request();
    const first = await call('POST', `/provider/bookings/${id}/confirm`, 'rashid');
    expect(first.json()).toMatchObject({ booking: { state: 'captured' }, alreadyConfirmed: false });
    expect(
      (await call('POST', `/provider/bookings/${id}/confirm`, 'rashid')).json().alreadyConfirmed,
    ).toBe(true);
    expect((await holds())[0]!.status).toBe('captured');
    const log = await pool.query(
      "SELECT count(*)::int AS n FROM event_log WHERE kind='payment_event' AND target_id=$1 AND action='captured'",
      [id],
    );
    expect(log.rows[0].n).toBe(1);
    const owner = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json();
    expect(owner.booking).toMatchObject({
      state: 'captured',
      paymentStatus: 'captured',
      canCancel: false,
    });
  });
  it('a failed capture leaves the booking waiting and a retry works', async () => {
    const id = await request();
    await mode('down');
    const failed = await call('POST', `/provider/bookings/${id}/confirm`, 'rashid');
    expect(failed.statusCode).toBe(502);
    expect(failed.json().error.code).toBe('capture_failed');
    expect((await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking.state).toBe(
      'authorized',
    );
    await mode('none');
    expect((await call('POST', `/provider/bookings/${id}/confirm`, 'rashid')).statusCode).toBe(200);
  });
  it('a lost reply during capture still captures once', async () => {
    const id = await request();
    await mode('ambiguous');
    expect((await call('POST', `/provider/bookings/${id}/confirm`, 'rashid')).statusCode).toBe(502);
    await mode('none');
    expect((await call('POST', `/provider/bookings/${id}/confirm`, 'rashid')).statusCode).toBe(200);
    expect((await holds())[0]!.status).toBe('captured');
  });
  it('only the booking’s provider can confirm', async () => {
    const id = await request();
    expect((await call('POST', `/provider/bookings/${id}/confirm`, 'farzana')).statusCode).toBe(
      404,
    );
    expect((await call('POST', `/provider/bookings/${id}/confirm`, 'bibi')).statusCode).toBe(403);
  });
});

describe('BKG-08 decline', () => {
  it('offers exactly the six reasons and accepts no other text', async () => {
    const id = await request();
    expect(trainingDecisions.declineReasons).toHaveLength(6);
    expect(
      (await call('POST', `/provider/bookings/${id}/decline`, 'rashid', { reason: 'too tired' }))
        .statusCode,
    ).toBe(400);
    expect((await call('POST', `/provider/bookings/${id}/decline`, 'rashid', {})).statusCode).toBe(
      400,
    );
    expect(
      (
        await call('POST', `/provider/bookings/${id}/decline`, 'rashid', {
          reason: 'generic-decline',
          note: 'free text',
        })
      ).statusCode,
    ).toBe(400);
  });
  it('releases nights and hold, records the reason on the booking and the care history', async () => {
    const id = await request();
    const response = await call('POST', `/provider/bookings/${id}/decline`, 'rashid', {
      reason: 'cannot-administer-medication',
    });
    expect(response.json().booking.state).toBe('declined');
    expect(
      (await nightsFor(db, 'rashid', '2026-12-10', '2026-12-18')).every((n) => n.booked === 0),
    ).toBe(true);
    expect((await holds())[0]!.status).toBe('released');
    const owner = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json();
    expect(owner.booking).toMatchObject({
      state: 'declined',
      declineReason: 'cannot-administer-medication',
    });
    const history = (
      await pool.query('SELECT outcome, decline_reason FROM care_history WHERE booking_id = $1', [
        id,
      ])
    ).rows;
    expect(history).toEqual([
      { outcome: 'declined', decline_reason: 'cannot-administer-medication' },
    ]);
    expect(
      (
        await call('POST', `/provider/bookings/${id}/decline`, 'rashid', {
          reason: 'generic-decline',
        })
      ).statusCode,
    ).toBe(409);
  });
});

describe('BKG-09 confirmation-window timeout', () => {
  it('closes the request after 24 h, releases nights and hold, and leaves an audit signal', async () => {
    const id = await request();
    expect((await app.processTimeouts!()).closed).toEqual([]);
    clock.advanceMinutes(24 * 60 - 1);
    expect((await app.processTimeouts!()).closed).toEqual([]);
    clock.advanceMinutes(1);
    expect((await app.processTimeouts!()).closed).toEqual([id]);
    expect((await app.processTimeouts!()).closed).toEqual([]);
    const owner = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json();
    expect(owner.booking).toMatchObject({
      state: 'canceled',
      timedOut: true,
      paymentStatus: 'released',
    });
    expect(
      (await nightsFor(db, 'rashid', '2026-12-10', '2026-12-18')).every((n) => n.booked === 0),
    ).toBe(true);
    const signal = await pool.query(
      "SELECT actor, reason_code FROM event_log WHERE action='booking.timed_out' AND target_id=$1",
      [id],
    );
    expect(signal.rows).toEqual([{ actor: 'system', reason_code: 'confirmation_timeout' }]);
  });
  it('first action wins at the last second: no double outcome', async () => {
    const id = await request();
    clock.advanceMinutes(24 * 60 - 1);
    const [confirm, timeouts] = await Promise.all([
      call('POST', `/provider/bookings/${id}/confirm`, 'rashid'),
      app.processTimeouts!(),
    ]);
    const state = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking.state;
    expect(['captured']).toContain(state);
    expect(confirm.statusCode).toBe(200);
    expect(timeouts.closed).toEqual([]);
    expect((await holds())[0]!.status).toBe('captured');
  });
  it('a confirmed booking is never timed out, and a release at a down gateway is kept pending', async () => {
    const confirmed = await request();
    await call('POST', `/provider/bookings/${confirmed}/confirm`, 'rashid');
    const waiting = await request({ from: '2026-12-20', to: '2026-12-22' });
    clock.advanceMinutes(25 * 60);
    await mode('down');
    expect((await app.processTimeouts!()).closed).toEqual([waiting]);
    expect((await call('GET', '/admin/payments/pending-releases', null)).statusCode).toBe(401);
    const state = (await pool.query('SELECT state FROM bookings WHERE id = $1', [confirmed]))
      .rows[0].state;
    expect(state).toBe('captured');
    const pending = await pool.query('SELECT status FROM payments WHERE booking_id = $1', [
      waiting,
    ]);
    expect(pending.rows[0].status).toBe('release_pending');
  });
});
