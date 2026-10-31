/** Urgency queue, audit log and operating ceiling against real PostgreSQL (ADM-01..03). */
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
const TEST_DB = 'petcare_test_queue';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');
let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let app: FastifyInstance;
const cookies = { bibi: '', rashid: '', admin: '' };
let seq = 0;

const call = (
  method: 'GET' | 'PUT' | 'DELETE' | 'PATCH' | 'POST',
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
const request = async (from: string, to: string) =>
  (
    await call('POST', '/owner/bookings', 'bibi', {
      key: `q-${++seq}-abcdefgh`,
      providerSlug: 'rashid',
      petId: 'tito',
      from,
      to,
      method: 'bkash',
    })
  ).json().booking.id as string;

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
    "DELETE FROM providers WHERE id LIKE 'filler-%'; UPDATE providers SET status='approved' WHERE id IN ('rashid','farzana','kamrul','nusrat')",
  );
  await pool.query(
    'DELETE FROM acute_post_mortems; DELETE FROM acute_messages; DELETE FROM acute_steps; DELETE FROM acute_events; DELETE FROM reports; DELETE FROM reviews; DELETE FROM payout_batches; DELETE FROM payouts; DELETE FROM booking_flags; DELETE FROM care_history; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
});

describe('ADM-01 urgency queue', () => {
  it('is empty and calm with nothing open', async () => {
    const queue = (await call('GET', '/admin/queue', 'admin')).json();
    expect(queue.items).toEqual([]);
    expect(queue.ceilingBanner).toBeNull();
  });
  it('sorts acute events first, then reports, other items, bookings awaiting confirmation, then in-stay', async () => {
    const waiting = await request('2026-12-20', '2026-12-22');
    const flagged = await request('2026-12-24', '2026-12-26');
    await call('POST', `/provider/bookings/${flagged}/confirm`, 'rashid');
    await call('POST', `/owner/bookings/${flagged}/request-cancellation`, 'bibi', {
      note: 'Trip cancelled',
    });
    // a stay in progress with an acute event
    clock.set('2026-12-01T06:00:00Z');
    const stay = await request('2026-12-01', '2026-12-04');
    await call('POST', `/provider/bookings/${stay}/confirm`, 'rashid');
    await call('POST', `/provider/bookings/${stay}/start`, 'rashid');
    await call('POST', `/provider/bookings/${stay}/acute-event`, 'rashid', {
      type: 'illness',
      severity: 'minor',
      observation: 'Sneezing',
    });
    // a second in-stay booking and an open report
    const calm = await request('2026-12-02', '2026-12-05');
    await call('POST', `/provider/bookings/${calm}/confirm`, 'rashid');
    clock.set('2026-12-02T06:00:00Z');
    await call('POST', `/provider/bookings/${calm}/start`, 'rashid');
    const done = await request('2026-12-05', '2026-12-07');
    await call('POST', `/provider/bookings/${done}/confirm`, 'rashid');
    await pool.query("UPDATE bookings SET state='completed', completed_at=$2 WHERE id=$1", [
      done,
      clock.now(),
    ]);
    await call('POST', `/owner/bookings/${done}/report`, 'bibi', {
      category: 'communication',
      description: 'Slow replies',
    });
    const queue = (await call('GET', '/admin/queue', 'admin')).json();
    const kinds = queue.items.map((i: { kind: string }) => i.kind);
    expect(kinds[0]).toBe('acute');
    expect(kinds[1]).toBe('report');
    expect(kinds.indexOf('owner_cancellation_request')).toBeGreaterThan(kinds.indexOf('report'));
    expect(kinds.indexOf('awaiting_confirmation')).toBeGreaterThan(
      kinds.indexOf('owner_cancellation_request'),
    );
    expect(kinds.indexOf('in_stay')).toBeGreaterThan(kinds.indexOf('awaiting_confirmation'));
    const groups = queue.items.map((i: { group: number }) => i.group);
    expect([...groups].sort()).toEqual(groups);
    expect(
      queue.items.find(
        (i: { kind: string; id: string }) => i.kind === 'awaiting_confirmation' && i.id === waiting,
      )!.href,
    ).toBe(`/admin/bookings/${waiting}`);
    expect(queue.items[0].href).toMatch(/^\/admin\/acute\//);
  });
  it('shows counts for providers to vet and recent reviews, and post-mortem reminders', async () => {
    const queue = (await call('GET', '/admin/queue', 'admin')).json();
    expect(queue.counts.providersToVet).toEqual({
      value: 1,
      href: '/admin/providers?status=vetting',
    }); // Sadia
    expect(queue.counts.reviewsToModerate.href).toBe('/admin/reviews');
    expect(queue.postMortemReminders).toEqual([]);
    expect((await call('GET', '/admin/queue', 'bibi')).statusCode).toBe(403);
    expect((await call('GET', '/admin/queue', null)).statusCode).toBe(401);
  });
});

describe('admin booking view', () => {
  it('shows the booking, its open items, history and money state to the admin only', async () => {
    const id = await request('2026-12-20', '2026-12-22');
    await call('POST', `/provider/bookings/${id}/confirm`, 'rashid');
    await call('POST', `/owner/bookings/${id}/request-cancellation`, 'bibi', {
      note: 'Trip cancelled',
    });
    const response = await call('GET', `/admin/bookings/${id}`, 'admin');
    expect(response.statusCode).toBe(200);
    const view = response.json();
    expect(view.booking).toMatchObject({ id, state: 'captured', nights: 2 });
    expect(view.flags).toMatchObject([
      { kind: 'owner_cancellation_request', status: 'open', note: 'Trip cancelled' },
    ]);
    expect(view.payment).toMatchObject({ status: 'captured' });
    expect(view.history.map((h: { action: string }) => h.action)).toEqual([
      'requested->authorized',
      'authorized->captured',
    ]);
    expect((await call('GET', '/admin/bookings/nope', 'admin')).statusCode).toBe(404);
    expect((await call('GET', `/admin/bookings/${id}`, 'bibi')).statusCode).toBe(403);
  });
});

describe('ADM-02 audit log', () => {
  it('lists admin actions newest first with admin, time, action, reason and target, and filters', async () => {
    await call('POST', '/admin/providers', 'admin', {
      name: { en: 'Audit A', bn: 'অডিট' },
      tier: 'B',
      neighbourhood: 'gulshan',
      species: ['dog'],
    });
    const p = (await call('GET', '/admin/providers', 'admin'))
      .json()
      .providers.find((x: { name: { en: string } }) => x.name.en === 'Audit A');
    await call('POST', `/admin/providers/${p.id}/status`, 'admin', {
      to: 'vetting',
      reason: 'Documents received',
    });
    const { entries } = (await call('GET', '/admin/audit', 'admin')).json();
    expect(entries[0]).toMatchObject({
      actor: 'admin:ayaat',
      action: 'provider.status_changed',
      targetType: 'provider',
      targetId: p.id,
    });
    expect(entries[0].at).toBeTruthy();
    expect(entries[0].id).toBeGreaterThan(entries[1].id);
    const byAction = (await call('GET', '/admin/audit?action=provider.status', 'admin')).json()
      .entries;
    expect(byAction.length).toBeGreaterThan(0);
    expect(byAction.every((e: { action: string }) => e.action.startsWith('provider.status'))).toBe(
      true,
    );
    const byTarget = (
      await call('GET', `/admin/audit?targetType=provider&targetId=${p.id}`, 'admin')
    ).json().entries;
    expect(byTarget.map((e: { action: string }) => e.action)).toEqual([
      'provider.status_changed',
      'provider.created',
    ]);
    expect((await call('GET', '/admin/audit', 'rashid')).statusCode).toBe(403);
  });
  it('refuses to edit or delete an entry at the API and at the database', async () => {
    const id = (await call('GET', '/admin/audit', 'admin')).json().entries[0].id;
    for (const method of ['PUT', 'PATCH', 'DELETE'] as const) {
      const res = await call(method, `/admin/audit/${id}`, 'admin', {});
      expect(res.statusCode).toBe(405);
      expect(res.json().error.code).toBe('audit_immutable');
    }
    await expect(
      pool.query("UPDATE event_log SET action = 'x' WHERE id = $1", [id]),
    ).rejects.toThrow();
    await expect(pool.query('DELETE FROM event_log WHERE id = $1', [id])).rejects.toThrow();
  });
});

describe('ADM-03 operating ceiling', () => {
  const addProviders = (n: number) =>
    pool.query(
      `INSERT INTO providers (id, slug, name_en, name_bn, tier, status, neighbourhood_id, species)
       SELECT 'filler-' || g, 'filler-' || g, 'Filler ' || g, 'F' || g, 'B', 'approved', 'gulshan', ARRAY['dog'] FROM generate_series(1, $1) g`,
      [n],
    );
  it('shows active providers and trailing-30-day completed bookings against 25 and 75', async () => {
    const c = (await call('GET', '/admin/insights/ceiling', 'admin')).json();
    expect(c.activeProviders).toEqual({ value: 4, limit: 25, percent: 16 });
    expect(c.completedBookings30Days).toEqual({ value: 0, limit: 75, percent: 0 });
    expect(c.nearCeiling).toBe(false);
    expect(c.message).toBeNull();
  });
  it('shows a near-ceiling banner from 80 % on Insights and the Queue, and a breach as a re-platforming signal', async () => {
    await addProviders(16); // 20 of 25 = 80 %
    const near = (await call('GET', '/admin/insights/ceiling', 'admin')).json();
    expect(near).toMatchObject({ nearCeiling: true, breached: false });
    expect((await call('GET', '/admin/queue', 'admin')).json().ceilingBanner).toMatchObject({
      breached: false,
    });
    await pool.query("DELETE FROM providers WHERE id LIKE 'filler-%'");
    await addProviders(21); // 25 of 25
    const breach = (await call('GET', '/admin/insights/ceiling', 'admin')).json();
    expect(breach).toMatchObject({ breached: true, nearCeiling: false });
    expect(breach.message).toContain('not a goal');
    expect((await call('GET', '/admin/queue', 'admin')).json().ceilingBanner).toMatchObject({
      breached: true,
    });
  });
  it('counts only the trailing 30 days of completed bookings', async () => {
    const id = await request('2026-12-10', '2026-12-12');
    await pool.query(
      "UPDATE bookings SET state='completed', completed_at = '2026-11-15T00:00:00Z' WHERE id = $1",
      [id],
    );
    expect(
      (await call('GET', '/admin/insights/ceiling', 'admin')).json().completedBookings30Days.value,
    ).toBe(1);
    clock.set('2026-12-20T06:00:00Z'); // 35 days later
    expect(
      (await call('GET', '/admin/insights/ceiling', 'admin')).json().completedBookings30Days.value,
    ).toBe(0);
  });
});
