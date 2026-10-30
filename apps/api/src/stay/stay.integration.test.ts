/** Start the stay, daily updates, the late-start flag, the reminder state and vet clinics against real PostgreSQL (BKG-10, 12, 14, 18). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TestClock } from '@petcare/shared/clock';
import { buildDummyApp } from '../../../dummy-services/src/app.ts';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { createDummyPayments } from '../payments/dummy-payments.ts';
import { createDummyPhotos } from '../pets/dummy-photos.ts';
import { runSeed } from '../seed/run.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_stay';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');

let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let dummyUrl: string;
let app: FastifyInstance;
const cookies = { bibi: '', rashid: '', farzana: '', other: '' };
let seq = 0;

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from('x'),
]);
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

function form(
  fields: Record<string, string>,
  files: Array<{ name: string; bytes: Buffer; type?: string }> = [],
) {
  const boundary = '----stay-test';
  const chunks: Buffer[] = [];
  for (const [k, v] of Object.entries(fields))
    chunks.push(
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`),
    );
  for (const f of files)
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="${f.name}"\r\nContent-Type: ${f.type ?? 'image/png'}\r\n\r\n`,
      ),
      f.bytes,
      Buffer.from('\r\n'),
    );
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return {
    payload: Buffer.concat(chunks),
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  };
}
const postUpdate = (
  id: string,
  who: keyof typeof cookies,
  fields: Record<string, string>,
  files: Parameters<typeof form>[1] = [],
) => {
  const { payload, headers } = form(fields, files);
  return app.inject({
    method: 'POST',
    url: `/provider/bookings/${id}/updates`,
    payload,
    headers: { ...headers, cookie: cookies[who] },
  });
};
const photo = (n: string) => ({ name: `${n}.png`, bytes: PNG });
const careLog = JSON.stringify({
  medicationsGiven: [{ name: 'insulin', time: '08:05' }],
  food: 'ate_well',
  mood: 'happy',
});

/** A confirmed booking for 2026-12-10 to 2026-12-13; the clock is left at the confirmation time. */
async function confirmed(extra: Record<string, unknown> = {}) {
  clock.set('2026-12-01T06:00:00Z');
  const response = await call('POST', '/owner/bookings', 'bibi', {
    key: `stay-${++seq}-abcdefgh`,
    providerSlug: 'rashid',
    petId: 'tito',
    from: '2026-12-10',
    to: '2026-12-13',
    method: 'bkash',
    ...extra,
  });
  const id = response.json().booking.id as string;
  await call('POST', `/provider/bookings/${id}/confirm`, 'rashid');
  return id;
}
const inStay = async () => {
  const id = await confirmed();
  clock.set('2026-12-10T04:00:00Z'); // 10:00 in Dhaka on the start date
  await call('POST', `/provider/bookings/${id}/start`, 'rashid');
  return id;
};

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
    cookies[k] = `pc_session=${(await store.create('user', id, 90 * 24 * 3_600_000)).token}`;
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
    'DELETE FROM booking_flags; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
});

describe('BKG-10 start the stay', () => {
  it('cannot start before the start date, starts on it, and not twice', async () => {
    const id = await confirmed();
    clock.set('2026-12-09T10:00:00Z');
    const early = await call('POST', `/provider/bookings/${id}/start`, 'rashid');
    expect(early.statusCode).toBe(409);
    expect(early.json().error.code).toBe('too_early');
    clock.set('2026-12-10T04:00:00Z');
    const started = await call('POST', `/provider/bookings/${id}/start`, 'rashid');
    expect(started.json().booking.state).toBe('in_stay');
    expect((await call('POST', `/provider/bookings/${id}/start`, 'rashid')).statusCode).toBe(409);
    const owner = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json();
    expect(owner.booking.state).toBe('in_stay');
    expect(owner.history.map((h: { to: string }) => h.to)).toEqual([
      'authorized',
      'captured',
      'in_stay',
    ]);
  });
  it('needs a confirmed booking of your own', async () => {
    const waiting = (
      await call('POST', '/owner/bookings', 'bibi', {
        key: `w-${++seq}-abcdefgh`,
        providerSlug: 'rashid',
        petId: 'tito',
        from: '2026-12-10',
        to: '2026-12-12',
        method: 'bkash',
      })
    ).json().booking.id;
    clock.set('2026-12-10T04:00:00Z');
    expect(
      (await call('POST', `/provider/bookings/${waiting}/start`, 'rashid')).json().error.code,
    ).toBe('not_confirmed');
    const id = await confirmed();
    clock.set('2026-12-10T04:00:00Z');
    expect((await call('POST', `/provider/bookings/${id}/start`, 'farzana')).statusCode).toBe(404);
    expect((await call('POST', `/provider/bookings/${id}/start`, 'bibi')).statusCode).toBe(403);
  });
  it('flags a stay not started by 12:00 on the start date, once, and never a started one', async () => {
    const late = await confirmed();
    clock.set('2026-12-10T05:59:00Z'); // 11:59 in Dhaka
    expect((await app.flagLateStarts!()).flagged).toEqual([]);
    clock.set('2026-12-10T06:00:00Z'); // 12:00
    expect((await app.flagLateStarts!()).flagged).toEqual([late]);
    expect((await app.flagLateStarts!()).flagged).toEqual([]);
    const rows = await pool.query(
      "SELECT actor, reason_code FROM event_log WHERE action = 'booking.start_overdue' AND target_id = $1",
      [late],
    );
    expect(rows.rows).toEqual([{ actor: 'system', reason_code: 'stay_start_deadline' }]);
  });
  it('does not flag a stay that was started', async () => {
    const id = await inStay();
    clock.set('2026-12-10T08:00:00Z');
    expect((await app.flagLateStarts!()).flagged).not.toContain(id);
  });
});

describe('BKG-12 daily updates', () => {
  it('posts a note, care log and photos; the owner and provider see it newest first', async () => {
    const id = await inStay();
    const first = await postUpdate(id, 'rashid', { note: 'Tito ate well', careLog }, [
      photo('a'),
      photo('b'),
    ]);
    expect(first.statusCode).toBe(201);
    expect(first.json().update.photos).toBe(2);
    clock.advanceMinutes(30);
    await postUpdate(id, 'rashid', { note: 'Evening walk', careLog: '{}' });
    const owner = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json();
    expect(owner.updates.map((u: { note: string }) => u.note)).toEqual([
      'Evening walk',
      'Tito ate well',
    ]);
    expect(owner.updates[1].careLog.medicationsGiven[0]).toEqual({
      name: 'insulin',
      time: '08:05',
    });
    expect(owner.updates[1].photos).toHaveLength(2);
    const asProvider = (await call('GET', `/provider/bookings/${id}`, 'rashid')).json();
    expect(asProvider.updates).toHaveLength(2);
  });
  it('a photo is optional and at most 4 photos are allowed', async () => {
    const id = await inStay();
    expect((await postUpdate(id, 'rashid', { note: 'Note only', careLog: '{}' })).statusCode).toBe(
      201,
    );
    const five = await postUpdate(
      id,
      'rashid',
      { note: 'x', careLog: '{}' },
      [1, 2, 3, 4, 5].map((n) => photo(String(n))),
    );
    expect(five.statusCode).toBe(409);
    expect(five.json().error.code).toBe('too_many_photos');
    expect(
      (
        await postUpdate(
          id,
          'rashid',
          { note: 'x', careLog: '{}' },
          [1, 2, 3, 4].map((n) => photo(String(n))),
        )
      ).statusCode,
    ).toBe(201);
  });
  it('serves update photos only to the booking’s owner and provider', async () => {
    const id = await inStay();
    await postUpdate(id, 'rashid', { note: 'pic', careLog: '{}' }, [photo('a')]);
    const url = (await call('GET', `/bookings/${id}/updates`, 'bibi'))
      .json()
      .updates[0].photos[0].replace('/api', '');
    expect((await call('GET', url, 'bibi')).statusCode).toBe(200);
    expect((await call('GET', url, 'rashid')).statusCode).toBe(200);
    expect((await call('GET', url, 'other')).statusCode).toBe(404);
    expect((await call('GET', url, 'farzana')).statusCode).toBe(404);
    expect((await call('GET', url, null)).statusCode).toBe(401);
  });
  it('cannot be edited or deleted after posting', async () => {
    const id = await inStay();
    await postUpdate(id, 'rashid', { note: 'final', careLog: '{}' });
    await expect(pool.query("UPDATE daily_updates SET note = 'changed'")).rejects.toThrow(
      /cannot be changed/,
    );
    await expect(pool.query('DELETE FROM daily_updates')).rejects.toThrow(/cannot be changed/);
    for (const method of ['PUT', 'PATCH', 'DELETE'] as const) {
      const res = await app.inject({
        method,
        url: `/provider/bookings/${id}/updates`,
        headers: { cookie: cookies.rashid },
      });
      expect(res.statusCode).toBe(404);
    }
  });
  it('is only for an in-stay booking of your own, and only for providers', async () => {
    const id = await confirmed();
    expect((await postUpdate(id, 'rashid', { note: 'x', careLog: '{}' })).json().error.code).toBe(
      'not_in_stay',
    );
    const live = await inStay();
    expect((await postUpdate(live, 'farzana', { note: 'x', careLog: '{}' })).statusCode).toBe(404);
    expect((await postUpdate(live, 'bibi', { note: 'x', careLog: '{}' })).statusCode).toBe(403);
  });
  it('rejects a bad care log, a long note and a bad photo; storage down saves nothing', async () => {
    const id = await inStay();
    expect(
      (await postUpdate(id, 'rashid', { note: 'x', careLog: '{"food":"lots"}' })).statusCode,
    ).toBe(400);
    expect((await postUpdate(id, 'rashid', { note: 'x', careLog: '{bad' })).statusCode).toBe(400);
    expect(
      (await postUpdate(id, 'rashid', { note: 'y'.repeat(501), careLog: '{}' })).statusCode,
    ).toBe(400);
    expect(
      (
        await postUpdate(id, 'rashid', { note: 'x', careLog: '{}' }, [
          { name: 'a.txt', bytes: Buffer.from('text'), type: 'text/plain' },
        ])
      ).statusCode,
    ).toBe(415);
    await fetch(`${dummyUrl}/_training/photos/failure-mode`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'down' }),
    });
    expect(
      (await postUpdate(id, 'rashid', { note: 'x', careLog: '{}' }, [photo('a')])).statusCode,
    ).toBe(503);
    await fetch(`${dummyUrl}/_training/photos/failure-mode`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'none' }),
    });
    expect((await pool.query('SELECT count(*)::int AS n FROM daily_updates')).rows[0].n).toBe(0);
  });
  it('shows the reminder state after 18:00 until an update is posted; completion is never blocked', async () => {
    const id = await inStay();
    const due = async () =>
      (await call('GET', `/provider/bookings/${id}`, 'rashid')).json().booking.reminderDue;
    clock.set('2026-12-10T11:59:00Z'); // 17:59
    expect(await due()).toBe(false);
    clock.set('2026-12-10T12:00:00Z'); // 18:00
    expect(await due()).toBe(true);
    expect((await call('GET', '/provider/today', 'rashid')).json().inStay[0].reminderDue).toBe(
      true,
    );
    await postUpdate(id, 'rashid', { note: 'late update', careLog: '{}' });
    expect(await due()).toBe(false);
  });
});

describe('BKG-14 vet clinics and BKG-18 owner page', () => {
  it('shows the clinics of the booking’s neighbourhood as a lookup, for owner and provider of an active booking', async () => {
    const id = await confirmed();
    const owner = (await call('GET', `/bookings/${id}/vet-clinics`, 'bibi')).json();
    expect(owner.lookupOnly).toBe(true);
    expect(owner.clinics.length).toBeGreaterThan(0);
    expect(owner.clinics[0]).toMatchObject({
      phone: expect.stringMatching(/^\+8801/),
      species: expect.any(Array),
    });
    expect(owner.clinics[0].name.en).toContain('Gulshan');
    expect((await call('GET', `/bookings/${id}/vet-clinics`, 'rashid')).statusCode).toBe(200);
    expect((await call('GET', `/bookings/${id}/vet-clinics`, 'other')).statusCode).toBe(404);
    expect((await call('GET', `/bookings/${id}/vet-clinics`, 'farzana')).statusCode).toBe(404);
  });
  it('is not shown for a request still waiting', async () => {
    const waiting = (
      await call('POST', '/owner/bookings', 'bibi', {
        key: `v-${++seq}-abcdefgh`,
        providerSlug: 'rashid',
        petId: 'tito',
        from: '2026-12-10',
        to: '2026-12-12',
        method: 'bkash',
      })
    ).json().booking.id;
    expect((await call('GET', `/bookings/${waiting}/vet-clinics`, 'bibi')).statusCode).toBe(409);
  });
});
