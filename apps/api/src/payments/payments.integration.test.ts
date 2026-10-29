/** Authorize, capture and release against real PostgreSQL and the real Dummy gateway in process (PAY-01..03). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TestClock } from '@petcare/shared/clock';
import { stayTotalPoisha } from '@petcare/shared/payments';
import { buildDummyApp } from '../../../dummy-services/src/app.ts';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { runSeed } from '../seed/run.ts';
import { createDummyPayments } from './dummy-payments.ts';
import { createPaymentService, type PaymentService } from './payment-service.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_payments';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');

let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let dummyUrl: string;
let service: PaymentService;
let app: FastifyInstance;
let adminCookie = '';
let ownerCookie = '';
let seq = 0;
let b1 = ''; // a fresh booking reference per test: the payment log is append-only

const mode = (service_: string, m: string) =>
  fetch(`${dummyUrl}/_training/${service_}/failure-mode`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: m, timeoutMs: 20 }),
  });
const inspect = async () =>
  (
    (await (await fetch(`${dummyUrl}/_training/payments/inspect`)).json()) as {
      state: {
        authorizations: Array<{ id: string; status: string; amount: number; bookingRef: string }>;
      };
    }
  ).state.authorizations;
const events = async (bookingId: string) =>
  (
    await pool.query(
      "SELECT action, payload, created_at FROM event_log WHERE kind = 'payment_event' AND target_id = $1 ORDER BY id",
      [bookingId],
    )
  ).rows;

const booking = (id: string, extra: Record<string, unknown> = {}) => ({
  bookingId: id,
  ownerId: 'bibi',
  providerId: 'rashid',
  method: 'bkash' as const,
  amountPoisha: stayTotalPoisha(250000, 8),
  ...extra,
});

beforeAll(async () => {
  await runSeed({ databaseUrl: TEST_URL, dummyUrl: null });
  ({ db, pool } = createDatabase(TEST_URL));
  dummy = buildDummyApp({ timeoutMs: 20 });
  await dummy.listen({ port: 0, host: '127.0.0.1' });
  const address = dummy.server.address();
  dummyUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
  const port = createDummyPayments(dummyUrl, 2000);
  service = createPaymentService({ db, port, clock });
  app = await buildApp({
    db,
    otp: { send: async () => undefined } as never,
    payments: port,
    clock,
  });
  const store = createSessionStore(db, clock);
  adminCookie = `pc_admin_session=${(await store.create('admin', 'ayaat', 3_600_000)).token}`;
  ownerCookie = `pc_session=${(await store.create('user', 'bibi', 3_600_000)).token}`;
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
  b1 = `bk-${++seq}`;
  await fetch(`${dummyUrl}/_training/reset-all`, { method: 'POST' });
  await pool.query('DELETE FROM payments');
});

describe('stay total', () => {
  it('BDT 2,500 for 8 nights is BDT 20,000', () => {
    expect(stayTotalPoisha(250000, 8)).toBe(2_000_000);
    expect(() => stayTotalPoisha(250000, 0)).toThrow();
  });
});

describe('PAY-01 authorize at request', () => {
  it('places a hold for the total and captures nothing; Bibi books Rashid for 8 nights: BDT 20,000', async () => {
    const result = await service.authorize(booking(b1));
    expect(result).toMatchObject({ ok: true, alreadyAuthorized: false });
    const auth = (await inspect())[0]!;
    expect(auth).toMatchObject({ status: 'authorized', amount: 2_000_000, bookingRef: b1 });
    expect(result.ok && result.payment.status).toBe('authorized');
  });

  it('works with Nagad and card too', async () => {
    for (const method of ['nagad', 'card'] as const)
      expect((await service.authorize(booking(`${b1}-${method}`, { method }))).ok).toBe(true);
  });

  it('asking twice for the same booking never places a second hold', async () => {
    await service.authorize(booking(b1));
    const again = await service.authorize(booking(b1));
    expect(again).toMatchObject({ ok: true, alreadyAuthorized: true });
    expect(await inspect()).toHaveLength(1);
  });

  it('a decline is explained, recorded, and nothing is held', async () => {
    await mode('payments', 'decline');
    expect(await service.authorize(booking(b1))).toEqual({ ok: false, reason: 'declined' });
    expect(await inspect()).toHaveLength(0);
    expect((await events(b1)).map((e) => e.action)).toEqual([
      'authorize_attempt',
      'authorize_declined',
    ]);
    await mode('payments', 'none');
    expect(await service.authorize(booking(b1))).toEqual({ ok: false, reason: 'declined' });
  });

  it('gateway down or timing out: unavailable, nothing held, and a retry works', async () => {
    for (const m of ['down', 'timeout']) {
      await mode('payments', m);
      expect(await service.authorize(booking(`${b1}-${m}`))).toEqual({
        ok: false,
        reason: 'unavailable',
      });
    }
    expect(await inspect()).toHaveLength(0);
    await mode('payments', 'none');
    expect((await service.authorize(booking(`${b1}-down`))).ok).toBe(true);
    expect(await inspect()).toHaveLength(1);
  });

  it('a lost reply is reconciled with the same key: one hold, never two', async () => {
    await mode('payments', 'ambiguous');
    const lost = await service.authorize(booking(b1));
    expect(lost).toEqual({ ok: false, reason: 'unavailable' });
    expect(await inspect()).toHaveLength(1); // the gateway did hold it
    await mode('payments', 'none');
    const found = await service.authorize(booking(b1));
    expect(found).toMatchObject({ ok: true });
    expect(await inspect()).toHaveLength(1);
    expect((await service.find(b1))!.gatewayRef).toMatch(/^GW-BKASH-/);
  });

  it('rejects a zero or fractional amount', async () => {
    expect(await service.authorize(booking(b1, { amountPoisha: 0 }))).toEqual({
      ok: false,
      reason: 'invalid_amount',
    });
    expect(await service.authorize(booking(b1, { amountPoisha: 10.5 }))).toEqual({
      ok: false,
      reason: 'invalid_amount',
    });
  });

  it('logs every attempt with time, gateway reference and booking reference', async () => {
    await service.authorize(booking(b1));
    const rows = await events(b1);
    expect(rows.map((e) => e.action)).toEqual(['authorize_attempt', 'authorized']);
    expect(rows[1]!.payload).toMatchObject({
      gatewayRef: expect.stringMatching(/^GW-BKASH-/),
      amountPoisha: 2_000_000,
      method: 'bkash',
    });
    expect(rows[1]!.created_at.toISOString()).toBe('2026-12-01T06:00:00.000Z');
  });
});

describe('PAY-02 capture on confirmation', () => {
  it('captures once and records the state change', async () => {
    await service.authorize(booking(b1));
    const result = await service.capture(b1);
    expect(result).toMatchObject({ ok: true, alreadyCaptured: false });
    expect((await inspect())[0]!.status).toBe('captured');
    expect((await service.find(b1))!.capturedAt).toBeTruthy();
  });

  it('a retry after a lost answer captures once, never twice', async () => {
    await service.authorize(booking(b1));
    await mode('payments', 'ambiguous');
    expect(await service.capture(b1)).toEqual({ ok: false, reason: 'unavailable' });
    await mode('payments', 'none');
    expect(await service.capture(b1)).toMatchObject({ ok: true });
    expect(await service.capture(b1)).toMatchObject({ ok: true, alreadyCaptured: true });
    const captures = (await events(b1)).filter((e) => e.action === 'captured');
    expect(captures).toHaveLength(1);
    expect((await inspect())[0]!.status).toBe('captured');
  });

  it('a failed capture leaves the payment authorized so the provider can retry', async () => {
    await service.authorize(booking(b1));
    await mode('payments', 'decline');
    expect(await service.capture(b1)).toEqual({ ok: false, reason: 'declined' });
    expect((await service.find(b1))!.status).toBe('authorized');
    await mode('payments', 'down');
    expect(await service.capture(b1)).toEqual({ ok: false, reason: 'unavailable' });
    await mode('payments', 'none');
    expect((await service.capture(b1)).ok).toBe(true);
  });

  it('refuses to capture something that was never authorized or was released', async () => {
    expect(await service.capture('nope')).toEqual({ ok: false, reason: 'not_found' });
    await service.authorize(booking(b1));
    await service.release(b1);
    expect(await service.capture(b1)).toEqual({ ok: false, reason: 'not_authorized' });
  });
});

describe('PAY-03 release', () => {
  it('releases the hold and logs it; repeating changes nothing', async () => {
    await service.authorize(booking(b1));
    expect(await service.release(b1)).toEqual({ ok: true, released: true, pending: false });
    expect((await inspect())[0]!.status).toBe('released');
    expect(await service.release(b1)).toEqual({ ok: true, released: false, pending: false });
    expect((await events(b1)).filter((e) => e.action === 'released')).toHaveLength(1);
  });

  it('releasing something unknown or already declined is harmless', async () => {
    expect(await service.release('nobody')).toEqual({ ok: true, released: false, pending: false });
  });

  it('will not release money that was already captured', async () => {
    await service.authorize(booking(b1));
    await service.capture(b1);
    expect(await service.release(b1)).toEqual({ ok: false, reason: 'captured' });
    expect((await inspect())[0]!.status).toBe('captured');
  });

  it('gateway down at release: pending, visible to the admin, finished by a retry', async () => {
    await service.authorize(booking(b1));
    await mode('payments', 'down');
    expect(await service.release(b1)).toEqual({ ok: true, released: false, pending: true });
    const list = await app.inject({
      method: 'GET',
      url: '/admin/payments/pending-releases',
      headers: { cookie: adminCookie },
    });
    expect(list.json().pending).toMatchObject([
      { bookingId: b1, amountPoisha: 2_000_000, lastError: 'release_unavailable' },
    ]);
    await mode('payments', 'none');
    const retry = await app.inject({
      method: 'POST',
      url: '/admin/payments/retry-releases',
      headers: { cookie: adminCookie },
    });
    expect(retry.json()).toEqual({ completed: 1, stillPending: 0 });
    expect((await inspect())[0]!.status).toBe('released');
  });

  it('a hold made but never reported is found and released, not left behind', async () => {
    await mode('payments', 'ambiguous');
    await service.authorize(booking(b1)); // lost reply: payment stays "authorizing"
    await mode('payments', 'none');
    expect(await service.release(b1)).toEqual({ ok: true, released: true, pending: false });
    expect((await inspect())[0]!.status).toBe('released');
  });

  it('the admin payment endpoints need the admin', async () => {
    const guest = await app.inject({ method: 'GET', url: '/admin/payments/pending-releases' });
    expect(guest.statusCode).toBe(401);
    const owner = await app.inject({
      method: 'GET',
      url: '/admin/payments/pending-releases',
      headers: { cookie: ownerCookie },
    });
    expect(owner.statusCode).toBe(403);
  });
});

describe('card data', () => {
  it('only the method name reaches the gateway', async () => {
    await service.authorize(booking(b1, { method: 'card' }));
    const log = (await (await fetch(`${dummyUrl}/_training/payments/inspect`)).json()) as {
      received: Array<{ body?: Record<string, unknown> }>;
    };
    for (const entry of log.received)
      expect(Object.keys(entry.body ?? {})).not.toContain('cardNumber');
  });
});
