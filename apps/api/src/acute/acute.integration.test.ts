/** Report a concern and its effects against real PostgreSQL and the Dummy gateways (ACU-01, ACU-02). */
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
const TEST_DB = 'petcare_test_acute';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');

let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let dummyUrl: string;
let app: FastifyInstance;
const cookies = { bibi: '', rashid: '', farzana: '', admin: '' };
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
const rows = async (sql: string, params: unknown[] = []) => (await pool.query(sql, params)).rows;
const concern = {
  type: 'illness',
  severity: 'serious',
  observation: 'Tito is not eating and is vomiting',
};

async function inStay() {
  clock.set('2026-12-01T06:00:00Z');
  const id = (
    await call('POST', '/owner/bookings', 'bibi', {
      key: `a-${++seq}-abcdefgh`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: '2026-12-10',
      to: '2026-12-13',
      method: 'bkash',
    })
  ).json().booking.id as string;
  await call('POST', `/provider/bookings/${id}/confirm`, 'rashid');
  clock.set('2026-12-10T04:00:00Z');
  await call('POST', `/provider/bookings/${id}/start`, 'rashid');
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
  const store = createSessionStore(db, clock);
  const day = 90 * 24 * 3_600_000;
  for (const [k, id] of [
    ['bibi', 'bibi'],
    ['rashid', 'rashid'],
    ['farzana', 'farzana'],
  ] as const)
    cookies[k] = `pc_session=${(await store.create('user', id, day)).token}`;
  cookies.admin = `pc_admin_session=${(await store.create('admin', 'ayaat', day)).token}`;
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
  await pool.query('TRUNCATE update_photos, daily_updates');
  await pool.query(
    'DELETE FROM acute_events; DELETE FROM reports; DELETE FROM reviews; DELETE FROM payout_batches; DELETE FROM payouts; DELETE FROM booking_flags; DELETE FROM care_history; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
});

describe('ACU-01 report a concern', () => {
  it('creates the event with time and observation for an in-stay booking', async () => {
    const id = await inStay();
    const response = await call('POST', `/provider/bookings/${id}/acute-event`, 'rashid', concern);
    expect(response.statusCode).toBe(201);
    expect(response.json().next).toContain('payout_frozen');
    const [event] = await rows(
      'SELECT type, severity, observation, triggered_at FROM acute_events WHERE booking_id=$1',
      [id],
    );
    expect(event).toMatchObject({
      type: 'illness',
      severity: 'serious',
      observation: 'Tito is not eating and is vomiting',
    });
    expect(event.triggered_at.toISOString()).toBe('2026-12-10T04:00:00.000Z');
  });
  it('is not available outside an in-stay booking, and only to the booking’s provider', async () => {
    clock.set('2026-12-01T06:00:00Z');
    const id = (
      await call('POST', '/owner/bookings', 'bibi', {
        key: `a-${++seq}-abcdefgh`,
        providerSlug: 'rashid',
        petId: 'tito',
        from: '2026-12-10',
        to: '2026-12-12',
        method: 'bkash',
      })
    ).json().booking.id as string;
    expect(
      (await call('POST', `/provider/bookings/${id}/acute-event`, 'rashid', concern)).json().error
        .code,
    ).toBe('not_in_stay');
    const live = await inStay();
    expect(
      (await call('POST', `/provider/bookings/${live}/acute-event`, 'farzana', concern)).statusCode,
    ).toBe(404);
    expect(
      (await call('POST', `/provider/bookings/${live}/acute-event`, 'bibi', concern)).statusCode,
    ).toBe(403);
    expect(
      (await call('GET', `/provider/bookings/${live}`, 'rashid')).json().booking.canReportConcern,
    ).toBe(true);
  });
  it('needs a valid type, severity and observation', async () => {
    const id = await inStay();
    for (const bad of [
      { ...concern, type: 'sneeze' },
      { ...concern, severity: 'huge' },
      { ...concern, observation: '' },
      { type: 'injury' },
    ])
      expect(
        (await call('POST', `/provider/bookings/${id}/acute-event`, 'rashid', bad)).statusCode,
      ).toBe(400);
  });
});

describe('ACU-02 effects and owner notice', () => {
  it('freezes the payout, flags the provider (no suspension) and queues an admin item', async () => {
    const id = await inStay();
    await call('POST', `/provider/bookings/${id}/acute-event`, 'rashid', concern);
    expect(
      (await rows('SELECT status, freeze_reason FROM payouts WHERE booking_id=$1', [id]))[0],
    ).toEqual({ status: 'frozen', freeze_reason: 'acute_event:serious' });
    const audit = await rows(
      "SELECT actor, reason_code FROM event_log WHERE action='provider.flagged_acute_event' AND payload->>'bookingId' = $1",
      [id],
    );
    expect(audit).toEqual([{ actor: 'provider:rashid', reason_code: 'serious' }]);
    expect((await rows("SELECT status FROM providers WHERE id='rashid'"))[0].status).toBe(
      'approved',
    );
    const flags = (await call('GET', '/admin/flags?status=open', 'admin')).json().flags;
    expect(flags).toMatchObject([
      { bookingId: id, kind: 'acute_event', note: 'illness (serious)' },
    ]);
  });
  it('shows the owner a banner, stores both times, and lets the owner report straight away', async () => {
    const id = await inStay();
    expect((await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking).toMatchObject({
      acuteEvent: null,
      canReport: false,
    });
    await call('POST', `/provider/bookings/${id}/acute-event`, 'rashid', concern);
    const owner = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking;
    expect(owner.acuteEvent).toMatchObject({ type: 'illness', severity: 'serious' });
    expect(owner.canReport).toBe(true);
    const report = await call('POST', `/owner/bookings/${id}/report`, 'bibi', {
      category: 'pet-health-concern',
      description: 'I want this looked into',
    });
    expect(report.statusCode).toBe(201);
    expect((await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking.state).toBe(
      'disputed',
    );
  });
  it('the admin list shows open events first with the times and the gap under 5 minutes', async () => {
    const a = await inStay();
    await call('POST', `/provider/bookings/${a}/acute-event`, 'rashid', concern);
    const list = (await call('GET', '/admin/acute-events', 'admin')).json().events;
    expect(list[0]).toMatchObject({
      bookingId: a,
      status: 'open',
      severity: 'serious',
      secondsToOwnerNotice: 0,
    });
    expect(list[0].secondsToOwnerNotice).toBeLessThan(300);
    expect(list[0].triggeredAt).toBeTruthy();
    expect((await call('GET', '/admin/acute-events', 'bibi')).statusCode).toBe(403);
  });
  it('completion is still allowed after an event (UC-8)', async () => {
    const id = await inStay();
    await call('POST', `/provider/bookings/${id}/acute-event`, 'rashid', {
      ...concern,
      severity: 'minor',
    });
    clock.set('2026-12-13T05:00:00Z');
    expect((await call('POST', `/provider/bookings/${id}/complete`, 'rashid')).statusCode).toBe(
      200,
    );
  });
});
