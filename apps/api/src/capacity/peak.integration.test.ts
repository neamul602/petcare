/** Peak windows, expand for peak, the 12 h window, the 8 % commission and insights (SRC-02, SRC-06). */
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
import { nightsFor } from './nights.ts';
import { isPeakStay } from './peak.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_peak';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');
let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let app: FastifyInstance;
const cookies = { bibi: '', rashid: '', kamrul: '', admin: '' };
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

beforeAll(async () => {
  await runSeed({ databaseUrl: TEST_URL, dummyUrl: null });
  ({ db, pool } = createDatabase(TEST_URL));
  dummy = buildDummyApp({ timeoutMs: 20 });
  await dummy.listen({ port: 0, host: '127.0.0.1' });
  const address = dummy.server.address();
  const url = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
  app = await buildApp({
    db,
    otp: { send: async () => undefined } as never,
    payments: createDummyPayments(url, 2000),
    payouts: createDummyPayouts(url, 2000),
    photos: createDummyPhotos(url, 2000),
    clock,
  });
  const store = createSessionStore(db, clock);
  const day = 90 * 24 * 3_600_000;
  for (const [k, id] of [
    ['bibi', 'bibi'],
    ['rashid', 'rashid'],
    ['kamrul', 'kamrul'],
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
  clock.set('2026-12-01T06:00:00Z');
  await pool.query(
    'DELETE FROM peak_windows; DELETE FROM payout_batches; DELETE FROM payouts; DELETE FROM booking_flags; DELETE FROM care_history; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
});

const eid = () =>
  call('POST', '/admin/peak-windows', 'admin', {
    name: 'Eid (training)',
    startDate: '2026-12-10',
    endDate: '2026-12-14',
  });
const request = (provider: string, from: string, to: string) =>
  call('POST', '/owner/bookings', 'bibi', {
    key: `pk-${++seq}-abcdefgh`,
    providerSlug: provider,
    petId: 'tito',
    from,
    to,
    method: 'bkash',
  });

describe('peak windows', () => {
  it('the admin creates a window, everyone can read upcoming ones, and a stay overlapping it is a peak stay', async () => {
    expect((await call('POST', '/admin/peak-windows', 'bibi', {})).statusCode).toBe(403);
    expect(
      (
        await call('POST', '/admin/peak-windows', 'admin', {
          name: 'Bad',
          startDate: '2026-12-14',
          endDate: '2026-12-10',
        })
      ).statusCode,
    ).toBe(422);
    expect((await eid()).statusCode).toBe(201);
    expect(
      (await call('GET', '/peak-windows', null))
        .json()
        .windows.map((w: { name: string }) => w.name),
    ).toEqual(['Eid (training)']);
    expect(await isPeakStay(db, '2026-12-08', '2026-12-10')).toBe(false); // last night is the 9th
    expect(await isPeakStay(db, '2026-12-08', '2026-12-11')).toBe(true);
    expect(await isPeakStay(db, '2026-12-14', '2026-12-16')).toBe(true);
    expect(await isPeakStay(db, '2026-12-15', '2026-12-17')).toBe(false);
  });
  it('the confirmation window is 12 h for a peak stay and 24 h otherwise', async () => {
    await eid();
    const peak = (await request('rashid', '2026-12-11', '2026-12-13')).json().booking.id;
    const normal = (await request('rashid', '2026-12-20', '2026-12-22')).json().booking.id;
    const deadline = async (id: string) =>
      (await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking.confirmationDeadline;
    expect(await deadline(peak)).toBe('2026-12-01T18:00:00.000Z');
    expect(await deadline(normal)).toBe('2026-12-02T06:00:00.000Z');
  });
  it('Tier-A commission is 8 % in a peak window, 10 % outside; Tier-B stays 16 %', async () => {
    await eid();
    const confirmRate = async (provider: 'rashid' | 'kamrul', from: string, to: string) => {
      const id = (await request(provider, from, to)).json().booking.id;
      await call('POST', `/provider/bookings/${id}/confirm`, provider);
      return (
        await pool.query('SELECT commission_basis_points AS bp FROM bookings WHERE id=$1', [id])
      ).rows[0].bp;
    };
    expect(await confirmRate('rashid', '2026-12-11', '2026-12-13')).toBe(800);
    expect(await confirmRate('rashid', '2026-12-20', '2026-12-22')).toBe(1000);
    expect(await confirmRate('kamrul', '2026-12-11', '2026-12-13')).toBe(1600);
  });
});

describe('SRC-02 expand for peak', () => {
  it('sets every night of the window to the chosen capacity in one action, and full nights open again', async () => {
    const win = (await eid()).json().window;
    await pool.query(
      "INSERT INTO night_capacity (provider_id, date, booked) VALUES ('rashid','2026-12-11',2)",
    );
    expect((await nightsFor(db, 'rashid', '2026-12-11', '2026-12-12'))[0]).toMatchObject({
      free: 0,
    });
    const response = await call('POST', '/provider/capacity/expand-peak', 'rashid', {
      windowId: win.id,
      capacity: 4,
    });
    expect(response.json()).toEqual({ window: 'Eid (training)', nights: 5, capacity: 4 });
    const nights = await nightsFor(db, 'rashid', '2026-12-10', '2026-12-15');
    expect(nights.map((n) => n.capacity)).toEqual([4, 4, 4, 4, 4]);
    expect(nights[1]).toMatchObject({ booked: 2, free: 2 });
    expect((await nightsFor(db, 'rashid', '2026-12-15', '2026-12-16'))[0]!.capacity).toBe(2);
  });
  it('the calendar marks peak nights and offers the window; lowering below bookings is refused', async () => {
    const win = (await eid()).json().window;
    const calendar = (
      await call('GET', '/provider/calendar?from=2026-12-09&days=4', 'rashid')
    ).json();
    expect(calendar.tier).toBe('A');
    expect(calendar.peakWindows).toMatchObject([{ id: win.id, name: 'Eid (training)' }]);
    expect(calendar.nights.map((n: { peak: boolean }) => n.peak)).toEqual([
      false,
      true,
      true,
      true,
    ]);
    await pool.query(
      "INSERT INTO night_capacity (provider_id, date, booked) VALUES ('rashid','2026-12-12',2)",
    );
    const refused = await call('POST', '/provider/capacity/expand-peak', 'rashid', {
      windowId: win.id,
      capacity: 1,
    });
    expect(refused.statusCode).toBe(409);
    expect(
      (
        await call('POST', '/provider/capacity/expand-peak', 'rashid', {
          windowId: 'nope',
          capacity: 4,
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await call('POST', '/provider/capacity/expand-peak', 'bibi', {
          windowId: win.id,
          capacity: 4,
        })
      ).statusCode,
    ).toBe(403);
  });
});

describe('SRC-06 bookings per neighbourhood', () => {
  it('counts completed bookings per launch neighbourhood per month, and nothing else', async () => {
    const mk = async (
      provider: 'rashid' | 'kamrul',
      from: string,
      to: string,
      completedAt: string,
    ) => {
      const id = (await request(provider, from, to)).json().booking.id;
      await pool.query("UPDATE bookings SET state='completed', completed_at=$2 WHERE id=$1", [
        id,
        completedAt,
      ]);
    };
    await mk('rashid', '2026-12-10', '2026-12-12', '2026-12-12T05:00:00Z');
    await mk('rashid', '2026-12-14', '2026-12-16', '2026-12-16T05:00:00Z');
    await mk('kamrul', '2026-12-18', '2026-12-20', '2026-12-31T20:00:00Z'); // 2027-01-01 in Dhaka
    await request('rashid', '2026-12-22', '2026-12-24'); // not completed
    const body = (await call('GET', '/admin/insights/neighbourhoods', 'admin')).json();
    expect(body.neighbourhoods).toEqual(['gulshan', 'banani', 'baridhara']);
    expect(body.months).toEqual([
      { month: '2027-01', counts: { gulshan: 0, banani: 0, baridhara: 1 } },
      { month: '2026-12', counts: { gulshan: 2, banani: 0, baridhara: 0 } },
    ]);
    expect(body.note).toContain('admin decision');
    expect((await call('GET', '/admin/insights/neighbourhoods', 'bibi')).statusCode).toBe(403);
  });
});
