/** Commission, payout queue, weekly batch, freeze, release and refund against real PostgreSQL and the Dummy gateways (PAY-04..06). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TestClock } from '@petcare/shared/clock';
import { commissionBasisPoints, commissionOn, netPayoutPoisha } from '@petcare/shared/payments';
import { buildDummyApp } from '../../../dummy-services/src/app.ts';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { createDummyPayments } from '../payments/dummy-payments.ts';
import { runSeed } from '../seed/run.ts';
import { createDummyPayouts } from './dummy-payouts.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_payouts';
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
const mode = (service: string, m: string) =>
  fetch(`${dummyUrl}/_training/${service}/failure-mode`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: m, timeoutMs: 20 }),
  });
const service = () => app.payoutService!;
const gateway = async () =>
  (
    (await (await fetch(`${dummyUrl}/_training/payouts/inspect`)).json()) as {
      state: { payouts: Array<{ bookingRef: string; amount: number; status: string }> };
    }
  ).state.payouts;
const actions = async (bookingId: string) =>
  (
    await pool.query(
      "SELECT action FROM event_log WHERE kind='payment_event' AND target_id=$1 ORDER BY id",
      [bookingId],
    )
  ).rows.map((r) => r.action as string);

/** A confirmed booking for 8 nights (Rashid, Tier A, BDT 20,000) that is then completed at `completedAt`. */
async function completed(
  opts: { provider?: string; from?: string; to?: string; completedAt?: string } = {},
) {
  clock.set('2026-12-01T06:00:00Z');
  const from = opts.from ?? '2026-12-10';
  const to = opts.to ?? '2026-12-18';
  const response = await call('POST', '/owner/bookings', 'bibi', {
    key: `po-${++seq}-abcdefgh`,
    providerSlug: opts.provider ?? 'rashid',
    petId: 'tito',
    from,
    to,
    method: 'bkash',
  });
  const id = response.json().booking.id as string;
  if (!opts.provider || opts.provider === 'rashid')
    await call('POST', `/provider/bookings/${id}/confirm`, 'rashid');
  else {
    const store = createSessionStore(db, clock);
    const k = `pc_session=${(await store.create('user', opts.provider, 3_600_000)).token}`;
    await app.inject({
      method: 'POST',
      url: `/provider/bookings/${id}/confirm`,
      headers: { cookie: k },
    });
  }
  await pool.query("UPDATE bookings SET state = 'completed' WHERE id = $1", [id]);
  const at = new Date(opts.completedAt ?? '2026-12-18T06:00:00Z');
  await service().queueForBooking(id, at);
  return { id, at };
}
const setState = (id: string, state: string) =>
  pool.query('UPDATE bookings SET state = $2 WHERE id = $1', [id, state]);

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
    clock,
  });
  const store = createSessionStore(db, clock);
  cookies.bibi = `pc_session=${(await store.create('user', 'bibi', 90 * 24 * 3_600_000)).token}`;
  cookies.rashid = `pc_session=${(await store.create('user', 'rashid', 90 * 24 * 3_600_000)).token}`;
  cookies.admin = `pc_admin_session=${(await store.create('admin', 'ayaat', 90 * 24 * 3_600_000)).token}`;
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
  await mode('payments', 'none');
  await mode('payouts', 'none');
  await fetch(`${dummyUrl}/_training/reset-all`, { method: 'POST' });
  await pool.query(
    'DELETE FROM payout_batches; DELETE FROM payouts; DELETE FROM booking_flags; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
  await pool.query("UPDATE providers SET tier = 'A' WHERE id = 'rashid'");
});

describe('PAY-04 commission and payout queue', () => {
  it('rates: Tier-A 10 %, Tier-A in a peak window 8 %, Tier-B 16 %; BDT 20,000 at 10 % pays BDT 18,000', () => {
    expect(commissionBasisPoints('A')).toBe(1000);
    expect(commissionBasisPoints('A', true)).toBe(800);
    expect(commissionBasisPoints('B')).toBe(1600);
    expect(netPayoutPoisha(2_000_000, 1000)).toBe(1_800_000);
    expect(commissionOn(2_000_001, 1000)).toBe(200_000);
  });
  it('fixes the rate on the booking when the provider confirms and queues the net payout at completion', async () => {
    const { id } = await completed();
    const booking = (
      await pool.query('SELECT commission_basis_points FROM bookings WHERE id=$1', [id])
    ).rows[0];
    expect(booking.commission_basis_points).toBe(1000);
    const payout = await service().find(id);
    expect(payout).toMatchObject({
      bookingId: id,
      grossPoisha: 2_000_000,
      commissionBasisPoints: 1000,
      commissionPoisha: 200_000,
      netPoisha: 1_800_000,
      status: 'queued',
    });
    expect(payout!.eligibleAt.toISOString()).toBe('2026-12-21T06:00:00.000Z');
    expect(await actions(id)).toContain('payout_queued');
  });
  it('a later tier change does not change the rate', async () => {
    const { id } = await completed();
    await pool.query("UPDATE providers SET tier = 'B' WHERE id = 'rashid'");
    await service().queueForBooking(id);
    expect((await service().find(id))!.commissionBasisPoints).toBe(1000);
  });
  it('queueing twice makes one payout, and nothing is queued for a booking that was never captured', async () => {
    const { id } = await completed();
    await service().queueForBooking(id);
    expect((await pool.query('SELECT count(*)::int AS n FROM payouts')).rows[0].n).toBe(1);
    expect(await service().queueForBooking('no-such-booking')).toBeNull();
  });
});

describe('PAY-05 weekly payout batch', () => {
  it('pays only after the 72 h dispute window and only once', async () => {
    const { id, at } = await completed();
    clock.set(new Date(at.getTime() + 72 * 3_600_000 - 60_000));
    expect(await service().runBatch('t1')).toMatchObject({ ok: true, sent: 0 });
    clock.set(new Date(at.getTime() + 72 * 3_600_000));
    expect(await service().runBatch('t2')).toMatchObject({ ok: true, sent: 1 });
    expect(await service().runBatch('t2')).toMatchObject({ sent: 0, alreadyRun: true });
    expect(await service().runBatch('t3')).toMatchObject({ sent: 0 });
    expect(await gateway()).toMatchObject([{ bookingRef: id, amount: 1_800_000 }]);
    expect((await service().find(id))!.status).toBe('sent');
    expect(await actions(id)).toContain('payout_sent');
  });
  it('a down payout service leaves payouts queued and the next run pays them once', async () => {
    const { id, at } = await completed();
    clock.set(new Date(at.getTime() + 73 * 3_600_000));
    await mode('payouts', 'down');
    expect(await service().runBatch('d1')).toEqual({ ok: false, reason: 'unavailable' });
    expect((await service().find(id))!.status).toBe('queued');
    await mode('payouts', 'none');
    expect(await service().runBatch('d2')).toMatchObject({ ok: true, sent: 1 });
    expect(await gateway()).toHaveLength(1);
  });
  it('a lost reply does not lead to a double payout', async () => {
    const { at } = await completed();
    clock.set(new Date(at.getTime() + 73 * 3_600_000));
    await mode('payouts', 'ambiguous');
    expect((await service().runBatch('a1')).ok).toBe(false);
    await mode('payouts', 'none');
    expect(await service().runBatch('a1')).toMatchObject({ ok: true, sent: 1 });
    expect(await gateway()).toHaveLength(1);
  });
  it('runs on Sunday 10:00 Dhaka, once, and not on other days', async () => {
    const { at } = await completed({ completedAt: '2026-11-20T06:00:00Z' });
    void at;
    clock.set('2026-12-05T10:00:00Z'); // Saturday
    expect(await service().runScheduledBatch()).toBeNull();
    clock.set('2026-12-06T03:59:00Z'); // Sunday 09:59 Dhaka
    expect(await service().runScheduledBatch()).toBeNull();
    clock.set('2026-12-06T04:00:00Z'); // Sunday 10:00 Dhaka
    expect(await service().runScheduledBatch()).toMatchObject({ ok: true, sent: 1 });
    expect(await service().runScheduledBatch()).toMatchObject({ sent: 0, alreadyRun: true });
    clock.set('2026-12-07T05:00:00Z');
    expect(await service().runScheduledBatch()).toBeNull();
  });
  it('marks a settled payout as paid', async () => {
    const { id, at } = await completed();
    clock.set(new Date(at.getTime() + 73 * 3_600_000));
    await service().runBatch('s1');
    await fetch(`${dummyUrl}/_training/payouts/settle-now`, { method: 'POST' });
    expect(await service().syncPaid()).toEqual({ paid: 1 });
    expect((await service().find(id))!.status).toBe('paid');
    expect(await actions(id)).toContain('payout_paid');
  });
  it('Run batch now uses the same rules and needs the admin', async () => {
    const { at } = await completed();
    expect((await call('POST', '/admin/payouts/run-batch', 'bibi')).statusCode).toBe(403);
    expect((await call('POST', '/admin/payouts/run-batch', null)).statusCode).toBe(401);
    expect((await call('POST', '/admin/payouts/run-batch', 'admin')).json()).toEqual({ sent: 0 });
    clock.set(new Date(at.getTime() + 73 * 3_600_000));
    expect((await call('POST', '/admin/payouts/run-batch', 'admin')).json()).toEqual({ sent: 1 });
    await mode('payouts', 'down');
    await completed({ from: '2026-12-20', to: '2026-12-22' });
    clock.set('2026-12-30T06:00:00Z');
    expect((await call('POST', '/admin/payouts/run-batch', 'admin')).statusCode).toBe(503);
    const list = (await call('GET', '/admin/payouts', 'admin')).json().payouts;
    expect(list.map((p: { status: string }) => p.status).sort()).toEqual(['queued', 'sent']);
  });
});

describe('PAY-06 freeze, release and refund', () => {
  it('a frozen payout is left out of the batch, and goes out after the freeze is released', async () => {
    const { id, at } = await completed();
    const frozen = await call('POST', `/admin/bookings/${id}/freeze`, 'admin', {
      reason: 'owner reported a problem',
    });
    expect(frozen.json().payout).toMatchObject({
      status: 'frozen',
      freezeReason: 'owner reported a problem',
    });
    clock.set(new Date(at.getTime() + 73 * 3_600_000));
    expect(await service().runBatch('f1')).toMatchObject({ sent: 0 });
    const released = await call('POST', `/admin/bookings/${id}/release-freeze`, 'admin');
    expect(released.json().payout.status).toBe('queued');
    expect(await service().runBatch('f2')).toMatchObject({ sent: 1 });
    expect(await actions(id)).toEqual(
      expect.arrayContaining(['payout_frozen', 'freeze_released', 'payout_sent']),
    );
  });
  it('freezes a payout already sent to the gateway, and refuses once it is paid', async () => {
    const { id, at } = await completed();
    clock.set(new Date(at.getTime() + 73 * 3_600_000));
    await service().runBatch('x1');
    expect(
      (
        await call('POST', `/admin/bookings/${id}/freeze`, 'admin', { reason: 'acute event' })
      ).json().payout.status,
    ).toBe('frozen');
    expect((await gateway())[0]!.status).toBe('frozen');
    await call('POST', `/admin/bookings/${id}/release-freeze`, 'admin');
    expect((await service().find(id))!.status).toBe('sent');
    await fetch(`${dummyUrl}/_training/payouts/settle-now`, { method: 'POST' });
    const late = await call('POST', `/admin/bookings/${id}/freeze`, 'admin', {
      reason: 'too late',
    });
    expect(late.statusCode).toBe(409);
    expect(late.json().error.code).toBe('already_paid');
  });
  it('freezing needs a reason and a captured booking; repeating a freeze changes nothing', async () => {
    const { id } = await completed();
    expect((await call('POST', `/admin/bookings/${id}/freeze`, 'admin', {})).statusCode).toBe(400);
    expect(
      (await call('POST', `/admin/bookings/${id}/freeze`, 'admin', { reason: 'report' }))
        .statusCode,
    ).toBe(200);
    expect(
      (await call('POST', `/admin/bookings/${id}/freeze`, 'admin', { reason: 'report' }))
        .statusCode,
    ).toBe(200);
    expect((await actions(id)).filter((a) => a === 'payout_frozen')).toHaveLength(1);
    expect(
      (await call('POST', '/admin/bookings/nope/freeze', 'admin', { reason: 'report' })).statusCode,
    ).toBe(409);
  });
  it('a partial refund goes to the original method and the remaining payout is released net', async () => {
    const { id } = await completed();
    await setState(id, 'disputed');
    await call('POST', `/admin/bookings/${id}/freeze`, 'admin', {
      reason: 'owner reported a problem',
    });
    const refund = await call('POST', `/admin/bookings/${id}/refund`, 'admin', {
      amountPoisha: 500_000,
      rationale: 'Two nights not as agreed',
    });
    expect(refund.statusCode).toBe(200);
    expect(refund.json()).toMatchObject({
      refundedTotal: 500_000,
      payout: {
        status: 'queued',
        grossPoisha: 1_500_000,
        commissionPoisha: 150_000,
        netPoisha: 1_350_000,
        refundedPoisha: 500_000,
      },
    });
    const auth = (
      (await (await fetch(`${dummyUrl}/_training/payments/inspect`)).json()) as {
        state: { authorizations: Array<{ refundedTotal: number; status: string }> };
      }
    ).state.authorizations[0]!;
    expect(auth).toMatchObject({ refundedTotal: 500_000, status: 'partially_refunded' });
    expect((await pool.query('SELECT state FROM bookings WHERE id=$1', [id])).rows[0].state).toBe(
      'refunded',
    );
    expect(await actions(id)).toEqual(expect.arrayContaining(['refund_issued', 'payout_adjusted']));
  });
  it('a refund equal to the captured amount leaves no payout', async () => {
    const { id } = await completed();
    await setState(id, 'resolved');
    const refund = await call('POST', `/admin/bookings/${id}/refund`, 'admin', {
      amountPoisha: 2_000_000,
      rationale: 'Full refund agreed',
    });
    expect(refund.json().payout).toMatchObject({ status: 'cancelled', netPoisha: 0 });
    const { at } = { at: new Date('2026-12-18T06:00:00Z') };
    clock.set(new Date(at.getTime() + 100 * 3_600_000));
    expect(await service().runBatch('r1')).toMatchObject({ sent: 0 });
  });
  it('refuses more than was captured, a wrong state, a missing rationale, and a payout already sent', async () => {
    const { id, at } = await completed();
    expect(
      (
        await call('POST', `/admin/bookings/${id}/refund`, 'admin', {
          amountPoisha: 100,
          rationale: 'x y z',
        })
      ).json().error.code,
    ).toBe('wrong_state');
    await setState(id, 'disputed');
    expect(
      (
        await call('POST', `/admin/bookings/${id}/refund`, 'admin', {
          amountPoisha: 2_000_001,
          rationale: 'too much',
        })
      ).json().error.code,
    ).toBe('exceeds_captured');
    expect(
      (await call('POST', `/admin/bookings/${id}/refund`, 'admin', { amountPoisha: 100 }))
        .statusCode,
    ).toBe(400);
    expect(
      (
        await call('POST', `/admin/bookings/${id}/refund`, 'admin', {
          amountPoisha: 0,
          rationale: 'zero',
        })
      ).statusCode,
    ).toBe(400);
    clock.set(new Date(at.getTime() + 73 * 3_600_000));
    await service().runBatch('z1');
    expect(
      (
        await call('POST', `/admin/bookings/${id}/refund`, 'admin', {
          amountPoisha: 100,
          rationale: 'late one',
        })
      ).json().error.code,
    ).toBe('payout_already_sent');
    expect((await call('POST', `/admin/bookings/${id}/refund`, 'bibi', {})).statusCode).toBe(403);
  });
  it('a refund while the payment service is down changes nothing and can be retried', async () => {
    const { id } = await completed();
    await setState(id, 'disputed');
    await mode('payments', 'down');
    const failed = await call('POST', `/admin/bookings/${id}/refund`, 'admin', {
      amountPoisha: 300_000,
      rationale: 'Partial refund',
    });
    expect(failed.statusCode).toBe(503);
    expect((await service().find(id))!.netPoisha).toBe(1_800_000);
    await mode('payments', 'none');
    expect(
      (
        await call('POST', `/admin/bookings/${id}/refund`, 'admin', {
          amountPoisha: 300_000,
          rationale: 'Partial refund',
        })
      ).statusCode,
    ).toBe(200);
  });
});
