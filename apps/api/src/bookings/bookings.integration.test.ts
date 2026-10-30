/** Booking state machine, request submission with payment and the owner's waiting page, against real PostgreSQL and the Dummy gateway (BKG-01..04). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { BOOKING_STATES, canTransition, pillFor } from '@petcare/shared/bookings';
import { TestClock } from '@petcare/shared/clock';
import { buildDummyApp } from '../../../dummy-services/src/app.ts';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { nightsFor } from '../capacity/nights.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { createDummyPayments } from '../payments/dummy-payments.ts';
import { runSeed } from '../seed/run.ts';
import { transitionBooking, transitionHistory } from './transitions.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_bookings';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');

let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let dummyUrl: string;
let app: FastifyInstance;
const cookies = { bibi: '', other: '', rashid: '' };
let seq = 0;
const key = () => `key-${++seq}-abcdefgh`;

const mode = (service: string, m: string) =>
  fetch(`${dummyUrl}/_training/${service}/failure-mode`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: m, timeoutMs: 20 }),
  });
const holds = async () =>
  (
    (await (await fetch(`${dummyUrl}/_training/payments/inspect`)).json()) as {
      state: { authorizations: Array<{ status: string; amount: number }> };
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

const body = (extra: Record<string, unknown> = {}) => ({
  key: key(),
  providerSlug: 'rashid',
  petId: 'tito',
  from: '2026-12-10',
  to: '2026-12-18',
  method: 'bkash',
  ...extra,
});
const submit = (extra: Record<string, unknown> = {}, who: keyof typeof cookies = 'bibi') =>
  call('POST', '/owner/bookings', who, body(extra));

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
    clock,
  });
  await pool.query(
    "INSERT INTO users (id, role, phone, name, neighbourhood_id) VALUES ('other-owner','owner','+8801799000777','Other','gulshan')",
  );
  const store = createSessionStore(db, clock);
  for (const [k, id] of [
    ['bibi', 'bibi'],
    ['other', 'other-owner'],
    ['rashid', 'rashid'],
  ] as const)
    cookies[k] = `pc_session=${(await store.create('user', id, 3_600_000)).token}`;
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
  await pool.query(
    'DELETE FROM booking_flags; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
  await pool.query("UPDATE providers SET status = 'approved' WHERE id IN ('rashid','kamrul')");
  await pool.query("UPDATE pets SET archived_at = NULL WHERE id = 'tito'");
});

describe('BKG-01 state machine', () => {
  it('allows only the documented transitions', () => {
    expect(BOOKING_STATES).toHaveLength(11);
    expect(canTransition('requested', 'authorized')).toBe(true);
    expect(canTransition('authorized', 'captured')).toBe(true);
    expect(canTransition('authorized', 'declined')).toBe(true);
    expect(canTransition('authorized', 'completed')).toBe(false);
    expect(canTransition('declined', 'authorized')).toBe(false);
    expect(canTransition('canceled', 'captured')).toBe(false);
    expect(canTransition('in_stay', 'completed')).toBe(true);
    expect(canTransition('refunded', 'disputed')).toBe(false);
  });
  it('uses one pill name per state', () => {
    expect(pillFor('in_stay')).toBe('in-stay');
    expect(pillFor('no_show')).toBe('no-show');
    expect(pillFor('authorized')).toBe('authorized');
  });
  it('rejects an illegal transition, logs each legal one, and lets only one of two racing changes win', async () => {
    const id = (await submit()).json().booking.id;
    expect(
      await transitionBooking(db, clock, {
        bookingId: id,
        to: 'completed',
        trigger: 'admin_action',
        actor: 'admin:x',
      }),
    ).toEqual({ ok: false, reason: 'illegal_transition' });
    const [a, b] = await Promise.all([
      transitionBooking(db, clock, {
        bookingId: id,
        to: 'captured',
        trigger: 'provider_confirmed',
        actor: 'provider:rashid',
      }),
      transitionBooking(db, clock, {
        bookingId: id,
        to: 'declined',
        trigger: 'provider_declined',
        actor: 'provider:rashid',
      }),
    ]);
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1);
    const history = await transitionHistory(db, id);
    expect(history.map((h) => `${h.from}->${h.to}`)).toHaveLength(2);
    expect(history[0]).toMatchObject({
      from: 'requested',
      to: 'authorized',
      trigger: 'owner_submitted',
    });
    expect(history[0]!.at).toBeInstanceOf(Date);
    expect(
      await transitionBooking(db, clock, {
        bookingId: 'missing',
        to: 'captured',
        trigger: 'admin_action',
        actor: 'x',
      }),
    ).toEqual({ ok: false, reason: 'not_found' });
  });
});

describe('BKG-03 review and submit with payment', () => {
  it('Bibi books Rashid for 8 nights: BDT 20,000 held, nights reserved, booking authorized with a 24 h deadline', async () => {
    const response = await submit();
    expect(response.statusCode).toBe(201);
    const id = response.json().booking.id;
    const { booking, history } = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json();
    expect(booking).toMatchObject({
      state: 'authorized',
      pill: 'authorized',
      nights: 8,
      pricePerNightPoisha: 250000,
      totalPoisha: 2_000_000,
      paymentMethod: 'bkash',
      paymentStatus: 'authorized',
      canCancel: true,
      provider: { slug: 'rashid' },
      pet: { name: 'Tito' },
    });
    expect(booking.confirmationDeadline).toBe('2026-12-02T06:00:00.000Z');
    expect(history).toHaveLength(1);
    expect(await holds()).toMatchObject([{ status: 'authorized', amount: 2_000_000 }]);
    const nights = await nightsFor(db, 'rashid', '2026-12-10', '2026-12-19');
    expect(nights.slice(0, 8).every((n) => n.booked === 1)).toBe(true);
    expect(nights[8]!.booked).toBe(0);
  });

  it('a double tap makes one booking, one hold and one reservation', async () => {
    const same = body();
    const sequential = [
      await call('POST', '/owner/bookings', 'bibi', same),
      await call('POST', '/owner/bookings', 'bibi', same),
    ];
    expect(sequential.map((r) => r.statusCode)).toEqual([201, 200]);
    expect(sequential[0]!.json().booking.id).toBe(sequential[1]!.json().booking.id);
    const racing = body();
    const results = await Promise.all(
      Array.from({ length: 5 }, () => call('POST', '/owner/bookings', 'bibi', racing)),
    );
    expect(new Set(results.map((r) => r.json().booking.id)).size).toBe(1);
    expect((await pool.query('SELECT count(*)::int AS n FROM bookings')).rows[0].n).toBe(2);
    expect(await holds()).toHaveLength(2);
    expect((await nightsFor(db, 'rashid', '2026-12-10', '2026-12-11'))[0]!.booked).toBe(2);
  });

  it('a night that is full blocks the request before any charge and creates nothing', async () => {
    await pool.query(
      "INSERT INTO night_capacity (provider_id, date, booked) VALUES ('rashid','2026-12-12',2)",
    );
    const response = await submit();
    expect(response.statusCode).toBe(409);
    expect(response.json().error).toMatchObject({ code: 'nights_full', detail: ['2026-12-12'] });
    expect(await holds()).toHaveLength(0);
    expect((await pool.query('SELECT count(*)::int AS n FROM bookings')).rows[0].n).toBe(0);
    expect((await nightsFor(db, 'rashid', '2026-12-10', '2026-12-11'))[0]!.booked).toBe(0);
  });

  it('a declined payment is explained, nothing is created and the nights are free again', async () => {
    await mode('payments', 'decline');
    const response = await submit();
    expect(response.statusCode).toBe(402);
    expect(response.json().error.code).toBe('payment_declined');
    expect((await pool.query('SELECT count(*)::int AS n FROM bookings')).rows[0].n).toBe(0);
    expect((await nightsFor(db, 'rashid', '2026-12-10', '2026-12-11'))[0]!.booked).toBe(0);
  });

  it('gateway down: nothing is created and the same submission works after it recovers', async () => {
    await mode('payments', 'down');
    const same = body();
    const failed = await call('POST', '/owner/bookings', 'bibi', same);
    expect(failed.statusCode).toBe(503);
    expect((await nightsFor(db, 'rashid', '2026-12-10', '2026-12-11'))[0]!.booked).toBe(0);
    await mode('payments', 'none');
    expect((await call('POST', '/owner/bookings', 'bibi', same)).statusCode).toBe(201);
    expect(await holds()).toHaveLength(1);
  });

  it('a lost reply from the gateway never leads to two holds', async () => {
    await mode('payments', 'ambiguous');
    const same = body();
    expect((await call('POST', '/owner/bookings', 'bibi', same)).statusCode).toBe(503);
    await mode('payments', 'none');
    expect((await call('POST', '/owner/bookings', 'bibi', same)).statusCode).toBe(201);
    expect(await holds()).toHaveLength(1);
    expect((await nightsFor(db, 'rashid', '2026-12-10', '2026-12-11'))[0]!.booked).toBe(1);
  });

  it('checks the pet, provider, species and dates', async () => {
    expect((await submit({ petId: 'nope' })).json().error.code).toBe('pet_not_found');
    expect((await submit({}, 'other')).json().error.code).toBe('pet_not_found');
    await pool.query("UPDATE pets SET archived_at = now() WHERE id = 'tito'");
    expect((await submit()).json().error.code).toBe('pet_not_found');
    await pool.query("UPDATE pets SET archived_at = NULL WHERE id = 'tito'");
    expect((await submit({ providerSlug: 'sadia' })).json().error.code).toBe(
      'provider_unavailable',
    );
    await pool.query("UPDATE providers SET status = 'suspended' WHERE id = 'rashid'");
    expect((await submit()).json().error.code).toBe('provider_unavailable');
    await pool.query("UPDATE providers SET status = 'approved' WHERE id = 'rashid'");
    await pool.query(
      "INSERT INTO pets (id, owner_id, name, species, breed, age_years, weight_kg, sex, neutered, vaccination, behaviour, care_plan) VALUES ('mimi','bibi','Mimi','cat','Persian',3,4,'female',true,'up_to_date','{}','{}')",
    );
    expect((await submit({ providerSlug: 'kamrul', petId: 'mimi' })).json().error.code).toBe(
      'species_not_hosted',
    );
    expect((await submit({ from: '2026-11-20', to: '2026-11-22' })).json().error.code).toBe(
      'dates_in_past',
    );
    expect((await submit({ from: '2026-12-12', to: '2026-12-10' })).json().error.code).toBe(
      'invalid_dates',
    );
    expect((await submit({ from: '2026-12-02', to: '2027-02-10' })).json().error.code).toBe(
      'window_too_long',
    );
    expect(await holds()).toHaveLength(0);
  });

  it('refuses clinical requests and asks to confirm doubtful wording', async () => {
    expect((await submit({ declaredClinical: true })).json().error.code).toBe(
      'clinical_request_rejected',
    );
    const doubtful = await submit({ instructions: 'Please do wound care twice a day' });
    expect(doubtful.json().error.code).toBe('needs_confirmation');
    const ok = await submit({
      instructions: 'Please do wound care twice a day',
      confirmedNotClinical: true,
    });
    expect(ok.statusCode).toBe(201);
    expect(await holds()).toHaveLength(1);
  });

  it('keeps a copy of the pet, so a later edit does not change the request', async () => {
    const id = (await submit()).json().booking.id;
    await pool.query("UPDATE pets SET weight_kg = 99 WHERE id = 'tito'");
    expect(
      (await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking.pet.weightKg,
    ).not.toBe(99);
  });

  it('needs a signed-in owner', async () => {
    expect((await call('POST', '/owner/bookings', null, body())).statusCode).toBe(401);
    expect((await call('POST', '/owner/bookings', 'rashid', body())).statusCode).toBe(403);
    expect((await call('POST', '/owner/bookings', 'bibi', { key: 'short' })).statusCode).toBe(400);
  });
});

describe('BKG-04 owner booking page and cancel', () => {
  it('another owner cannot see the booking', async () => {
    const id = (await submit()).json().booking.id;
    expect((await call('GET', `/owner/bookings/${id}`, 'other')).statusCode).toBe(404);
    expect((await call('GET', `/owner/bookings/${id}`, null)).statusCode).toBe(401);
  });

  it('cancelling before confirmation frees the nights and releases the hold; a second cancel is refused', async () => {
    const id = (await submit()).json().booking.id;
    const cancel = await call('POST', `/owner/bookings/${id}/cancel`, 'bibi');
    expect(cancel.json()).toMatchObject({ booking: { state: 'canceled' }, paymentPending: false });
    expect(
      (await nightsFor(db, 'rashid', '2026-12-10', '2026-12-18')).every((n) => n.booked === 0),
    ).toBe(true);
    expect((await holds())[0]!.status).toBe('released');
    const view = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json();
    expect(view.booking).toMatchObject({
      state: 'canceled',
      canCancel: false,
      paymentStatus: 'released',
    });
    expect(view.history.map((h: { to: string }) => h.to)).toEqual(['authorized', 'canceled']);
    expect((await call('POST', `/owner/bookings/${id}/cancel`, 'bibi')).statusCode).toBe(409);
    expect((await call('POST', `/owner/bookings/${id}/cancel`, 'other')).statusCode).toBe(404);
  });

  it('cancelling while the gateway is down still cancels and shows the release as pending', async () => {
    const id = (await submit()).json().booking.id;
    await mode('payments', 'down');
    const cancel = await call('POST', `/owner/bookings/${id}/cancel`, 'bibi');
    expect(cancel.json()).toMatchObject({ booking: { state: 'canceled' }, paymentPending: true });
    await mode('payments', 'none');
  });

  it('a booking that has moved on cannot be cancelled here', async () => {
    const id = (await submit()).json().booking.id;
    await transitionBooking(db, clock, {
      bookingId: id,
      to: 'captured',
      trigger: 'provider_confirmed',
      actor: 'provider:rashid',
    });
    expect((await call('POST', `/owner/bookings/${id}/cancel`, 'bibi')).statusCode).toBe(409);
  });
});
