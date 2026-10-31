/** Provider health flags, outreach and defection signals against real PostgreSQL (ADM-04, ADM-05). */
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
const TEST_DB = 'petcare_test_health';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');
let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let app: FastifyInstance;
const cookies = { bibi: '', rashid: '', admin: '' };
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
const flagsOf = async (id: string) =>
  (await call('GET', '/admin/providers-health', 'admin'))
    .json()
    .providers.find((p: { providerId: string }) => p.providerId === id)?.flags as string[];
const approvedOn = (id: string, date: string) =>
  pool.query('UPDATE providers SET created_at = $2 WHERE id = $1', [id, date]);
const bookNights = (n: number) =>
  pool.query(
    `INSERT INTO night_capacity (provider_id, date, booked) SELECT 'rashid', ('2026-11-01'::date + g), 1 FROM generate_series(0, $1 - 1) g ON CONFLICT DO NOTHING`,
    [n],
  );

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
  const long = 400 * 24 * 3_600_000;
  for (const [k, id] of [
    ['bibi', 'bibi'],
    ['rashid', 'rashid'],
  ] as const)
    cookies[k] = `pc_session=${(await store.create('user', id, long)).token}`;
  cookies.admin = `pc_admin_session=${(await store.create('admin', 'ayaat', long)).token}`;
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
    'DELETE FROM defection_signals; DELETE FROM provider_outreach; DELETE FROM reports; DELETE FROM reviews; DELETE FROM payout_batches; DELETE FROM payouts; DELETE FROM booking_flags; DELETE FROM care_history; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
  await pool.query(
    "UPDATE providers SET created_at = '2026-11-25T00:00:00Z' WHERE status = 'approved'",
  );
});

describe('ADM-04 provider health and utilization', () => {
  it('shows no utilization flag in the first 30 days', async () => {
    expect(await flagsOf('rashid')).toEqual([]);
  });
  it('flags utilization below 40 % at day 30, 30 % at day 60 and 20 % at day 90', async () => {
    await approvedOn('rashid', '2026-11-01T00:00:00Z'); // 30 days
    await bookNights(10); // 10 of 60 capacity nights = 17 %
    expect(await flagsOf('rashid')).toContain('low_utilization_30');
    await bookNights(24); // 24 of 60 = 40 %
    expect(await flagsOf('rashid')).not.toContain('low_utilization_30');
    await approvedOn('rashid', '2026-10-01T00:00:00Z'); // 61 days
    expect(await flagsOf('rashid')).not.toContain('low_utilization_60'); // 40 % is not below the 30 % line
  });
  it('uses the day-60 and day-90 thresholds', async () => {
    await bookNights(14); // 14 of 60 = 23 %
    await approvedOn('rashid', '2026-10-01T00:00:00Z');
    expect(await flagsOf('rashid')).toContain('low_utilization_60');
    await approvedOn('rashid', '2026-09-01T00:00:00Z');
    expect(await flagsOf('rashid')).not.toContain('low_utilization_90'); // 23 % is above 20 %
    await pool.query('DELETE FROM night_capacity');
    expect(await flagsOf('rashid')).toContain('low_utilization_90');
  });
  it('flags low confirmation when most recent requests were declined or timed out', async () => {
    const ids: string[] = [];
    for (let i = 0; i < 4; i++)
      ids.push(
        (
          await call('POST', '/owner/bookings', 'bibi', {
            key: `h-${++seq}-abcdefgh`,
            providerSlug: 'rashid',
            petId: 'tito',
            from: `2026-12-1${i}`,
            to: `2026-12-1${i + 1}`,
            method: 'bkash',
          })
        ).json().booking.id,
      );
    for (const id of ids.slice(0, 3))
      await call('POST', `/provider/bookings/${id}/decline`, 'rashid', {
        reason: 'generic-decline',
      });
    expect(await flagsOf('rashid')).toContain('low_confirmation');
  });
  it('Evaluate now recomputes the flags, is audit-logged, and never suspends anyone', async () => {
    await approvedOn('rashid', '2026-09-01T00:00:00Z');
    const result = await call('POST', '/admin/providers-health/evaluate', 'admin');
    expect(
      result.json().providers.find((p: { providerId: string }) => p.providerId === 'rashid').flags,
    ).toContain('low_utilization_90');
    expect(
      (await pool.query("SELECT 1 FROM event_log WHERE action='providers.evaluated'")).rowCount,
    ).toBeGreaterThan(0);
    expect(
      (await pool.query("SELECT status FROM providers WHERE id='rashid'")).rows[0].status,
    ).toBe('approved');
  });
  it('records outreach and its outcome, audit-logged, and shows it on the provider', async () => {
    const saved = await call('POST', '/admin/providers/rashid/outreach', 'admin', {
      flag: 'low_utilization_30',
      outreach: 'Called Rashid',
      outcome: 'He will open more nights',
    });
    expect(saved.statusCode).toBe(201);
    const detail = (await call('GET', '/admin/providers/rashid/health', 'admin')).json();
    expect(detail.outreach).toMatchObject([
      {
        flag: 'low_utilization_30',
        outreach: 'Called Rashid',
        outcome: 'He will open more nights',
      },
    ]);
    expect(
      (
        await pool.query(
          "SELECT 1 FROM event_log WHERE action='provider.outreach_recorded' AND target_id='rashid'",
        )
      ).rowCount,
    ).toBe(1);
    expect(
      (await call('POST', '/admin/providers/rashid/outreach', 'admin', { flag: 'x' })).statusCode,
    ).toBe(400);
    expect((await call('POST', '/admin/providers/rashid/outreach', 'rashid', {})).statusCode).toBe(
      403,
    );
  });
  it('shows provider flags on the queue rows of that provider’s bookings', async () => {
    await approvedOn('rashid', '2026-09-01T00:00:00Z');
    await call('POST', '/owner/bookings', 'bibi', {
      key: `h-${++seq}-abcdefgh`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: '2026-12-20',
      to: '2026-12-22',
      method: 'bkash',
    });
    const row = (await call('GET', '/admin/queue', 'admin'))
      .json()
      .items.find((i: { kind: string }) => i.kind === 'awaiting_confirmation');
    expect(row.flags).toContain('low_utilization_90');
  });
});

describe('ADM-05 defection signals', () => {
  it('tags feedback, a report or a review against a provider with its source and shows a marker', async () => {
    expect(
      (
        await call('POST', '/admin/providers/rashid/signals', 'admin', {
          sourceType: 'feedback',
          note: 'Owner said Rashid asked to pay directly',
        })
      ).statusCode,
    ).toBe(201);
    const detail = (await call('GET', '/admin/providers/rashid/health', 'admin')).json();
    expect(detail.signals).toMatchObject([
      { sourceType: 'feedback', note: 'Owner said Rashid asked to pay directly' },
    ]);
    expect(await flagsOf('rashid')).toContain('defection_signal');
    expect(
      (await call('GET', '/admin/providers-health', 'admin'))
        .json()
        .providers.find((p: { providerId: string }) => p.providerId === 'rashid').signals,
    ).toBe(1);
    expect(
      (await pool.query("SELECT 1 FROM event_log WHERE action='provider.defection_signal'"))
        .rowCount,
    ).toBeGreaterThan(0);
  });
  it('needs a real source for a report or review, and it must belong to that provider', async () => {
    expect(
      (
        await call('POST', '/admin/providers/rashid/signals', 'admin', { sourceType: 'report' })
      ).json().error.code,
    ).toBe('source_needed');
    expect(
      (
        await call('POST', '/admin/providers/rashid/signals', 'admin', {
          sourceType: 'review',
          sourceId: 'nope',
        })
      ).json().error.code,
    ).toBe('source_not_for_provider');
    expect(
      (await call('POST', '/admin/providers/nobody/signals', 'admin', { sourceType: 'feedback' }))
        .statusCode,
    ).toBe(404);
  });
  it('never suspends automatically and shows context metrics without targets', async () => {
    await call('POST', '/admin/providers/rashid/signals', 'admin', {
      sourceType: 'feedback',
      note: 'x y z',
    });
    expect(
      (await pool.query("SELECT status FROM providers WHERE id='rashid'")).rows[0].status,
    ).toBe('approved');
    const ctx = (await call('GET', '/admin/context-metrics', 'admin')).json();
    expect(ctx.note).toContain('not targets');
    expect((await call('GET', '/admin/context-metrics', 'bibi')).statusCode).toBe(403);
  });
});
