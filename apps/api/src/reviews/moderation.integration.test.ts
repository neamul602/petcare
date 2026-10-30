/** Moderation, care record and resolving reports against real PostgreSQL (REV-03, REV-04, REV-06). */
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
const TEST_DB = 'petcare_test_moderation';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');
let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let dummyUrl: string;
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
const rows = async (sql: string, params: unknown[] = []) => (await pool.query(sql, params)).rows;

async function completed() {
  clock.set('2026-12-01T06:00:00Z');
  const id = (
    await call('POST', '/owner/bookings', 'bibi', {
      key: `m-${++seq}-abcdefgh`,
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
  clock.set('2026-12-13T05:00:00Z');
  await call('POST', `/provider/bookings/${id}/complete`, 'rashid');
  await call('POST', `/owner/bookings/${id}/confirm-completion`, 'bibi');
  return id;
}
const reported = async () => {
  const id = await completed();
  await call('POST', `/owner/bookings/${id}/review`, 'bibi', { rating: 2, text: 'Not happy' });
  const rep = (
    await call('POST', `/owner/bookings/${id}/report`, 'bibi', {
      category: 'care-not-as-agreed',
      description: 'Walks skipped',
    })
  ).json().report.id as string;
  return { id, rep };
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
    payouts: createDummyPayouts(dummyUrl, 2000),
    photos: createDummyPhotos(dummyUrl, 2000),
    clock,
  });
  const store = createSessionStore(db, clock);
  const day = 90 * 24 * 3_600_000;
  for (const [k, id] of [
    ['bibi', 'bibi'],
    ['rashid', 'rashid'],
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
  await pool.query("UPDATE providers SET status='approved', tier='A' WHERE id='rashid'");
  await pool.query('TRUNCATE update_photos, daily_updates');
  await pool.query(
    'DELETE FROM acute_events; DELETE FROM reports; DELETE FROM reviews; DELETE FROM payout_batches; DELETE FROM payouts; DELETE FROM booking_flags; DELETE FROM care_history; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
});

describe('REV-03 moderate reviews for cause', () => {
  it('lists reviews, removes one for a reason, hides it publicly, keeps it stored and audit-logs it', async () => {
    const id = await completed();
    await call('POST', `/owner/bookings/${id}/review`, 'bibi', {
      rating: 1,
      text: 'Call me on 01700000000',
    });
    const list = (await call('GET', '/admin/reviews', 'admin')).json().reviews;
    expect(list[0]).toMatchObject({
      rating: 1,
      status: 'published',
      negativeReminder: true,
      provider: 'Rashid',
    });
    const removed = await call('POST', `/admin/reviews/${list[0].id}/remove`, 'admin', {
      reason: 'contact_details',
      note: 'Phone number in text',
    });
    expect(removed.json().review).toMatchObject({ status: 'removed', reason: 'contact_details' });
    expect((await call('GET', '/providers/rashid/reviews', null)).json().reviews).toEqual([]);
    expect((await rows('SELECT status, removed_reason FROM reviews'))[0]).toEqual({
      status: 'removed',
      removed_reason: 'contact_details',
    });
    const audit = await rows(
      "SELECT reason_code FROM event_log WHERE action='review.removed' AND target_id=$1",
      [list[0].id],
    );
    expect(audit).toEqual([{ reason_code: 'contact_details' }]);
    expect(
      (await call('POST', `/admin/reviews/${list[0].id}/remove`, 'admin', { reason: 'abuse' }))
        .statusCode,
    ).toBe(404);
  });
  it('shows the owner the moderation result read-only, and offers no way to appeal', async () => {
    const id = await completed();
    const rid = (
      await call('POST', `/owner/bookings/${id}/review`, 'bibi', { rating: 4, text: 'Fine' })
    ).json().review.id;
    await call('POST', `/admin/reviews/${rid}/remove`, 'admin', { reason: 'off_topic' });
    const view = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking;
    expect(view.review).toMatchObject({ removed: true, removedReason: 'off_topic' });
    expect(view.canReview).toBe(false);
  });
  it('does not touch a report on the same booking, needs a listed reason, and is admin only', async () => {
    const { id, rep } = await reported();
    const rid = (await rows('SELECT id FROM reviews'))[0].id;
    expect(
      (await call('POST', `/admin/reviews/${rid}/remove`, 'admin', { reason: 'rude' })).statusCode,
    ).toBe(400);
    await call('POST', `/admin/reviews/${rid}/remove`, 'admin', { reason: 'abuse' });
    expect((await rows('SELECT status FROM reports WHERE id=$1', [rep]))[0].status).toBe('open');
    expect((await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking.state).toBe(
      'disputed',
    );
    expect(
      (await call('POST', `/admin/reviews/${rid}/remove`, 'bibi', { reason: 'abuse' })).statusCode,
    ).toBe(403);
  });
});

describe('REV-04 provider care record', () => {
  it('counts completed, reviewed stays by care need; empty when none; never used for ranking', async () => {
    expect((await call('GET', '/provider/care-record', 'rashid')).json()).toEqual({
      stays: 0,
      counts: { diabetic: 0, senior: 0, medication: 0, anxious: 0, extraAttention: 0 },
    });
    const id = await completed();
    expect((await call('GET', '/provider/care-record', 'rashid')).json().stays).toBe(0); // not reviewed yet
    await call('POST', `/owner/bookings/${id}/review`, 'bibi', { rating: 5 });
    const record = (await call('GET', '/provider/care-record', 'rashid')).json();
    expect(record.stays).toBe(1);
    expect(record.counts).toMatchObject({
      diabetic: 1,
      medication: 1,
      extraAttention: 1,
      senior: 0,
    });
    const hits = (await call('GET', '/search?from=2026-12-20&to=2026-12-22&species=dog', null))
      .json()
      .providers.map((p: { slug: string }) => p.slug);
    expect(hits).toEqual(['rashid', 'farzana', 'kamrul']);
    expect((await call('GET', '/provider/care-record', 'bibi')).statusCode).toBe(403);
  });
});

describe('REV-06 investigate and resolve a report', () => {
  it('shows the booking, care history, updates, decline patterns and the review', async () => {
    const { id, rep } = await reported();
    await pool.query(
      "INSERT INTO care_history (id, pet_id, provider_id, start_date, end_date, outcome, decline_reason, care_plan_snapshot) VALUES ('ch-d','tito','rashid','2026-05-01','2026-05-03','declined','cannot-administer-medication','{}')",
    );
    const view = (await call('GET', `/admin/reports/${rep}`, 'admin')).json();
    expect(view.report).toMatchObject({ status: 'open', category: 'care-not-as-agreed' });
    expect(view.booking).toMatchObject({ id, state: 'disputed', totalPoisha: 750000 });
    expect(view.careHistory.length).toBeGreaterThan(0);
    expect(view.declinePatterns).toEqual([{ reason: 'cannot-administer-medication', count: 1 }]);
    expect(view.review).toMatchObject({ rating: 2 });
    expect(view.chat).toBe('deferred');
    expect((await call('GET', '/admin/reports/nope', 'admin')).statusCode).toBe(404);
  });
  it('no action releases the freeze, resolves the booking and leaves the review alone', async () => {
    const { id, rep } = await reported();
    expect((await rows('SELECT status FROM payouts WHERE booking_id=$1', [id]))[0].status).toBe(
      'frozen',
    );
    expect((await call('POST', `/admin/reports/${rep}/resolve`, 'admin', {})).statusCode).toBe(400);
    const done = await call('POST', `/admin/reports/${rep}/resolve`, 'admin', {
      rationale: 'Walks were done, evidence in updates',
    });
    expect(done.json()).toMatchObject({ resolved: true, booking: 'resolved' });
    expect((await rows('SELECT status FROM payouts WHERE booking_id=$1', [id]))[0].status).toBe(
      'queued',
    );
    expect((await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking).toMatchObject({
      state: 'resolved',
      review: { rating: 2, removed: false },
    });
    expect((await rows('SELECT status FROM reports WHERE id=$1', [rep]))[0].status).toBe(
      'resolved',
    );
    expect(
      (await call('POST', `/admin/reports/${rep}/resolve`, 'admin', { rationale: 'again please' }))
        .statusCode,
    ).toBe(409);
  });
  it('a refund goes through the payout rules, up to the captured amount, and the booking becomes refunded', async () => {
    const { id, rep } = await reported();
    expect(
      (
        await call('POST', `/admin/reports/${rep}/resolve`, 'admin', {
          refundPoisha: 900000,
          rationale: 'More than captured',
        })
      ).statusCode,
    ).toBe(422);
    const done = await call('POST', `/admin/reports/${rep}/resolve`, 'admin', {
      refundPoisha: 250000,
      rationale: 'One night not as agreed',
    });
    expect(done.json()).toMatchObject({ resolved: true, booking: 'refunded' });
    expect(
      (
        await rows('SELECT net_poisha, refunded_poisha, status FROM payouts WHERE booking_id=$1', [
          id,
        ])
      )[0],
    ).toEqual({ net_poisha: 450000, refunded_poisha: 250000, status: 'queued' });
    expect((await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking.state).toBe(
      'refunded',
    );
  });
  it('provider action (warning, suspension, removal) can be taken without a refund', async () => {
    const a = await reported();
    const warned = await call('POST', `/admin/reports/${a.rep}/resolve`, 'admin', {
      providerAction: 'warning',
      rationale: 'Verbal warning given',
    });
    expect(warned.json()).toMatchObject({ booking: 'resolved', providerAction: 'warning' });
    expect(
      (await rows("SELECT 1 FROM event_log WHERE action='provider.warned' AND target_id='rashid'"))
        .length,
    ).toBe(1);
    const b = await reported();
    const suspended = await call('POST', `/admin/reports/${b.rep}/resolve`, 'admin', {
      providerAction: 'suspension',
      rationale: 'Second complaint this month',
    });
    expect(suspended.json().providerAction).toBe('suspension');
    expect((await rows("SELECT status FROM providers WHERE id='rashid'"))[0].status).toBe(
      'suspended',
    );
    expect((await call('GET', '/providers/rashid', null)).statusCode).toBe(404);
  });
  it('audit-logs the resolution and is admin only', async () => {
    const { id, rep } = await reported();
    await call('POST', `/admin/reports/${rep}/resolve`, 'admin', {
      rationale: 'Checked all records',
    });
    const audit = await rows(
      "SELECT payload FROM event_log WHERE action='report.resolved' AND target_id=$1",
      [rep],
    );
    expect(audit[0].payload).toMatchObject({
      bookingId: id,
      outcome: 'resolved',
      rationale: 'Checked all records',
    });
    expect(
      (await call('POST', `/admin/reports/${rep}/resolve`, 'bibi', { rationale: 'abc' }))
        .statusCode,
    ).toBe(403);
    expect((await call('GET', `/admin/reports/${rep}`, 'rashid')).statusCode).toBe(403);
  });
});
