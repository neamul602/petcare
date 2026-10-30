/** Completion, admin completion (Q-S1), cancellation requests and no-shows against real PostgreSQL and the Dummy gateways (BKG-11, BKG-15). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TestClock } from '@petcare/shared/clock';
import { buildDummyApp } from '../../../dummy-services/src/app.ts';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { nightsFor } from '../capacity/nights.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { createDummyPayments } from '../payments/dummy-payments.ts';
import { createDummyPayouts } from '../payouts/dummy-payouts.ts';
import { createDummyPhotos } from '../pets/dummy-photos.ts';
import { runSeed } from '../seed/run.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_completion';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');

let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let dummyUrl: string;
let app: FastifyInstance;
const cookies = { bibi: '', other: '', rashid: '', farzana: '', admin: '' };
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
const row = async (sql: string, params: unknown[] = []) => (await pool.query(sql, params)).rows;
const payment = async () =>
  (
    (await (await fetch(`${dummyUrl}/_training/payments/inspect`)).json()) as {
      state: { authorizations: Array<{ status: string; refundedTotal: number }> };
    }
  ).state.authorizations;

/** Confirmed booking 2026-12-10 to 2026-12-13 (3 nights, BDT 7,500); clock left at confirmation time. */
async function confirmed() {
  clock.set('2026-12-01T06:00:00Z');
  const id = (
    await call('POST', '/owner/bookings', 'bibi', {
      key: `c-${++seq}-abcdefgh`,
      providerSlug: 'rashid',
      petId: 'tito',
      from: '2026-12-10',
      to: '2026-12-13',
      method: 'bkash',
    })
  ).json().booking.id as string;
  await call('POST', `/provider/bookings/${id}/confirm`, 'rashid');
  return id;
}
async function inStay() {
  const id = await confirmed();
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
  await pool.query(
    "INSERT INTO users (id, role, phone, name, neighbourhood_id) VALUES ('other-owner','owner','+8801799000777','Other','gulshan')",
  );
  const store = createSessionStore(db, clock);
  const day90 = 90 * 24 * 3_600_000;
  for (const [k, id] of [
    ['bibi', 'bibi'],
    ['other', 'other-owner'],
    ['rashid', 'rashid'],
    ['farzana', 'farzana'],
  ] as const)
    cookies[k] = `pc_session=${(await store.create('user', id, day90)).token}`;
  cookies.admin = `pc_admin_session=${(await store.create('admin', 'ayaat', day90)).token}`;
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
    'DELETE FROM payout_batches; DELETE FROM payouts; DELETE FROM booking_flags; DELETE FROM care_history; DELETE FROM booking_flags; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
});

describe('BKG-15 mark complete and confirm completion', () => {
  it('the provider can mark complete from the end date, even with no updates; the owner then confirms', async () => {
    const id = await inStay();
    clock.set('2026-12-12T05:00:00Z');
    const early = await call('POST', `/provider/bookings/${id}/complete`, 'rashid');
    expect(early.statusCode).toBe(409);
    expect(early.json().error.code).toBe('too_early');
    clock.set('2026-12-13T05:00:00Z');
    expect(
      (await call('POST', `/provider/bookings/${id}/complete`, 'rashid')).json().booking
        .completionRequested,
    ).toBe(true);
    expect((await call('POST', `/provider/bookings/${id}/complete`, 'rashid')).statusCode).toBe(
      200,
    );
    const asked = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking;
    expect(asked).toMatchObject({
      state: 'in_stay',
      completionRequested: true,
      canConfirmCompletion: true,
    });
    const done = await call('POST', `/owner/bookings/${id}/confirm-completion`, 'bibi');
    expect(done.json().booking.state).toBe('completed');
    const owner = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json();
    expect(owner.booking).toMatchObject({ state: 'completed', canConfirmCompletion: false });
    expect(owner.history.map((h: { to: string }) => h.to)).toEqual([
      'authorized',
      'captured',
      'in_stay',
      'completed',
    ]);
  });
  it('queues the payout, records the care history, and confirming twice changes nothing', async () => {
    const id = await inStay();
    clock.set('2026-12-13T05:00:00Z');
    await call('POST', `/provider/bookings/${id}/complete`, 'rashid');
    await call('POST', `/owner/bookings/${id}/confirm-completion`, 'bibi');
    await call('POST', `/owner/bookings/${id}/confirm-completion`, 'bibi');
    const payouts = await row(
      'SELECT gross_poisha, net_poisha, status FROM payouts WHERE booking_id=$1',
      [id],
    );
    expect(payouts).toEqual([{ gross_poisha: 750_000, net_poisha: 675_000, status: 'queued' }]);
    const history = await row('SELECT outcome FROM care_history WHERE booking_id=$1', [id]);
    expect(history).toEqual([{ outcome: 'completed' }]);
  });
  it('the owner cannot confirm before the provider asks; only the booking’s own people can act', async () => {
    const id = await inStay();
    expect(
      (await call('POST', `/owner/bookings/${id}/confirm-completion`, 'bibi')).json().error.code,
    ).toBe('not_requested');
    clock.set('2026-12-13T05:00:00Z');
    expect((await call('POST', `/provider/bookings/${id}/complete`, 'farzana')).statusCode).toBe(
      404,
    );
    await call('POST', `/provider/bookings/${id}/complete`, 'rashid');
    expect(
      (await call('POST', `/owner/bookings/${id}/confirm-completion`, 'other')).statusCode,
    ).toBe(404);
    expect(
      (await call('POST', `/owner/bookings/${id}/confirm-completion`, 'rashid')).statusCode,
    ).toBe(403);
  });
  it('Q-S1: the admin can complete a stay after its end date when the owner never confirms', async () => {
    const id = await inStay();
    clock.set('2026-12-13T05:00:00Z'); // the end date itself
    expect(
      (
        await call('POST', `/admin/bookings/${id}/complete`, 'admin', {
          reason: 'Owner did not answer',
        })
      ).json().error.code,
    ).toBe('too_early');
    clock.set('2026-12-14T05:00:00Z');
    expect((await call('POST', `/admin/bookings/${id}/complete`, 'admin', {})).statusCode).toBe(
      400,
    );
    expect(
      (
        await call('POST', `/admin/bookings/${id}/complete`, 'bibi', {
          reason: 'Owner did not answer',
        })
      ).statusCode,
    ).toBe(403);
    const done = await call('POST', `/admin/bookings/${id}/complete`, 'admin', {
      reason: 'Owner did not answer',
    });
    expect(done.json().booking.state).toBe('completed');
    expect(
      (await row('SELECT count(*)::int AS n FROM payouts WHERE booking_id=$1', [id]))[0].n,
    ).toBe(1);
    const audit = await row(
      "SELECT payload FROM event_log WHERE action='booking.completed_by_admin' AND target_id=$1",
      [id],
    );
    expect(audit[0].payload.reason).toBe('Owner did not answer');
    const trigger = (await call('GET', `/owner/bookings/${id}`, 'bibi'))
      .json()
      .history.at(-1).trigger;
    expect(trigger).toBe('admin_action');
  });
});

describe('BKG-11 cancellations and no-shows', () => {
  it('an owner cancellation after confirmation is a queue item; nothing is refunded automatically', async () => {
    const id = await confirmed();
    const asked = await call('POST', `/owner/bookings/${id}/request-cancellation`, 'bibi', {
      note: 'Trip cancelled',
    });
    expect(asked.statusCode).toBe(200);
    await call('POST', `/owner/bookings/${id}/request-cancellation`, 'bibi', {});
    const flags = (await call('GET', '/admin/flags?status=open', 'admin')).json().flags;
    expect(flags).toMatchObject([
      { bookingId: id, kind: 'owner_cancellation_request', note: 'Trip cancelled', status: 'open' },
    ]);
    expect((await payment())[0]).toMatchObject({ status: 'captured', refundedTotal: 0 });
    const view = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking;
    expect(view).toMatchObject({
      state: 'captured',
      cancellationRequested: true,
      canRequestCancellation: false,
    });
  });
  it('a request cancellation is only for a confirmed booking of your own', async () => {
    const waiting = (
      await call('POST', '/owner/bookings', 'bibi', {
        key: `w-${++seq}-abcdefgh`,
        providerSlug: 'rashid',
        petId: 'tito',
        from: '2026-12-20',
        to: '2026-12-22',
        method: 'bkash',
      })
    ).json().booking.id;
    expect(
      (await call('POST', `/owner/bookings/${waiting}/request-cancellation`, 'bibi', {}))
        .statusCode,
    ).toBe(409);
    const id = await confirmed();
    expect(
      (await call('POST', `/owner/bookings/${id}/request-cancellation`, 'other', {})).statusCode,
    ).toBe(404);
  });
  it('a provider cancellation after confirmation needs a reason and goes to the admin', async () => {
    const id = await confirmed();
    expect((await call('POST', `/provider/bookings/${id}/cancel`, 'rashid', {})).statusCode).toBe(
      400,
    );
    expect(
      (await call('POST', `/provider/bookings/${id}/cancel`, 'rashid', { note: 'I am ill' }))
        .statusCode,
    ).toBe(200);
    expect((await call('GET', '/admin/flags', 'admin')).json().flags[0]).toMatchObject({
      kind: 'provider_cancellation',
      raisedBy: 'provider:rashid',
    });
    expect((await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking.state).toBe(
      'captured',
    );
  });
  it('the admin refunds in full: money back, nights free, booking canceled, queue item resolved', async () => {
    const id = await confirmed();
    await call('POST', `/provider/bookings/${id}/cancel`, 'rashid', { note: 'I am ill' });
    const response = await call('POST', `/admin/bookings/${id}/resolve-cancellation`, 'admin', {
      decision: 'refund_full',
      note: 'Provider cancelled',
    });
    expect(response.statusCode).toBe(200);
    expect((await payment())[0]).toMatchObject({ status: 'refunded', refundedTotal: 750_000 });
    expect((await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking.state).toBe(
      'canceled',
    );
    expect(
      (await nightsFor(db, 'rashid', '2026-12-10', '2026-12-13')).every((n) => n.booked === 0),
    ).toBe(true);
    expect((await call('GET', '/admin/flags?status=open', 'admin')).json().flags).toEqual([]);
    expect(
      (await call('GET', '/admin/flags?status=resolved', 'admin')).json().flags[0].resolution,
    ).toContain('refund_full');
    expect(
      (
        await call('POST', `/admin/bookings/${id}/resolve-cancellation`, 'admin', {
          decision: 'refund_full',
          note: 'again',
        })
      ).statusCode,
    ).toBe(409);
  });
  it('a partial refund, or no action, as the admin decides', async () => {
    const a = await confirmed();
    await call('POST', `/owner/bookings/${a}/request-cancellation`, 'bibi', {});
    expect(
      (
        await call('POST', `/admin/bookings/${a}/resolve-cancellation`, 'admin', {
          decision: 'refund_partial',
          note: 'Half back',
        })
      ).statusCode,
    ).toBe(422);
    const part = await call('POST', `/admin/bookings/${a}/resolve-cancellation`, 'admin', {
      decision: 'refund_partial',
      amountPoisha: 300_000,
      note: 'Half back',
    });
    expect(part.statusCode).toBe(200);
    expect((await payment())[0]).toMatchObject({ refundedTotal: 300_000 });
    const b = await confirmed();
    await call('POST', `/owner/bookings/${b}/request-cancellation`, 'bibi', {});
    await call('POST', `/admin/bookings/${b}/resolve-cancellation`, 'admin', {
      decision: 'no_action',
      note: 'Within policy, stays booked',
    });
    expect((await call('GET', `/owner/bookings/${b}`, 'bibi')).json().booking.state).toBe(
      'captured',
    );
    expect((await call('GET', '/admin/flags?status=open', 'admin')).json().flags).toEqual([]);
  });
  it('an owner no-show: the provider flags it from the start date and the admin decides', async () => {
    const id = await confirmed();
    clock.set('2026-12-09T10:00:00Z');
    expect(
      (await call('POST', `/provider/bookings/${id}/no-show`, 'rashid', {})).json().error.code,
    ).toBe('too_early');
    clock.set('2026-12-10T06:00:00Z');
    expect(
      (
        await call('POST', `/provider/bookings/${id}/no-show`, 'rashid', { note: 'Did not arrive' })
      ).json().booking.state,
    ).toBe('no_show');
    expect((await call('GET', '/admin/flags?status=open', 'admin')).json().flags[0]).toMatchObject({
      kind: 'owner_no_show',
      note: 'Did not arrive',
    });
    const kept = await call('POST', `/admin/bookings/${id}/resolve-no-show`, 'admin', {
      decision: 'keep_funds',
      rationale: 'No notice given',
    });
    expect(kept.statusCode).toBe(200);
    expect((await row('SELECT status FROM payouts WHERE booking_id=$1', [id]))[0].status).toBe(
      'queued',
    );
    expect(
      (await nightsFor(db, 'rashid', '2026-12-10', '2026-12-13')).every((n) => n.booked === 0),
    ).toBe(true);
  });
  it('a no-show can be refunded instead, and the booking becomes refunded', async () => {
    const id = await confirmed();
    clock.set('2026-12-10T06:00:00Z');
    await call('POST', `/provider/bookings/${id}/no-show`, 'rashid', {});
    const refund = await call('POST', `/admin/bookings/${id}/resolve-no-show`, 'admin', {
      decision: 'refund',
      rationale: 'Owner had an emergency',
    });
    expect(refund.statusCode).toBe(200);
    expect((await payment())[0]).toMatchObject({ status: 'refunded' });
    expect((await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking.state).toBe(
      'refunded',
    );
    expect(
      (
        await call('POST', `/admin/bookings/${id}/resolve-no-show`, 'admin', {
          decision: 'keep_funds',
          rationale: 'second try',
        })
      ).statusCode,
    ).toBe(409);
  });
  it('a missed stay start becomes an admin queue item', async () => {
    const id = await confirmed();
    clock.set('2026-12-10T06:00:00Z');
    await app.flagLateStarts!();
    const flags = (await call('GET', '/admin/flags?status=open', 'admin')).json().flags;
    expect(flags).toMatchObject([{ bookingId: id, kind: 'missed_start', raisedBy: 'system' }]);
    const resolved = await call('POST', `/admin/flags/${flags[0].id}/resolve`, 'admin', {
      note: 'Provider was running late, started at 13:00',
    });
    expect(resolved.statusCode).toBe(200);
    expect((await call('GET', '/admin/flags?status=open', 'admin')).json().flags).toEqual([]);
    expect((await call('GET', '/admin/flags', 'bibi')).statusCode).toBe(403);
  });
  it('every such transition is logged', async () => {
    const id = await confirmed();
    clock.set('2026-12-10T06:00:00Z');
    await call('POST', `/provider/bookings/${id}/no-show`, 'rashid', {});
    const log = await row(
      "SELECT action, reason_code FROM event_log WHERE kind='booking_transition' AND target_id=$1 ORDER BY id",
      [id],
    );
    expect(log.at(-1)).toEqual({
      action: 'captured->no_show',
      reason_code: 'provider_flagged_no_show',
    });
  });
});
