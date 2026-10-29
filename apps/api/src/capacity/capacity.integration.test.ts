/** Capacity per night, safe reservation, shortlist and availability against real PostgreSQL (SRC-01, SRC-03, SRC-04). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TestClock } from '@petcare/shared/clock';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { runSeed } from '../seed/run.ts';
import { checkWindow, nightsBetween } from './dates.ts';
import { nightsFor, releaseNights, reserveNights, setCapacity } from './nights.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_capacity';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z'); // 12:00 in Dhaka, 2026-12-01

let db: Database;
let pool: pg.Pool;
let app: FastifyInstance;
const cookies = { rashid: '', bibi: '' };

const call = (
  method: 'GET' | 'PUT',
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
  app = await buildApp({ db, otp: { send: async () => undefined } as never, clock });
  const store = createSessionStore(db, clock);
  cookies.rashid = `pc_session=${(await store.create('user', 'rashid', 60 * 60_000)).token}`;
  cookies.bibi = `pc_session=${(await store.create('user', 'bibi', 60 * 60_000)).token}`;
});

afterAll(async () => {
  await app?.close();
  await pool?.end();
  const admin = new pg.Client({ connectionString: BASE.replace(/\/[^/]+$/, '/postgres') });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await admin.end();
});

beforeEach(async () => {
  await pool.query('DELETE FROM night_reservations; DELETE FROM night_capacity');
  await pool.query(
    "UPDATE providers SET status = 'approved' WHERE id IN ('rashid','farzana','kamrul','nusrat')",
  );
});

const reserve = (bookingId: string, from: string, to: string, providerId = 'rashid') =>
  reserveNights(db, { bookingId, providerId, from, to });

describe('dates', () => {
  it('counts nights from check-in up to the day before check-out', () => {
    expect(nightsBetween('2026-12-05', '2026-12-08')).toEqual([
      '2026-12-05',
      '2026-12-06',
      '2026-12-07',
    ]);
    expect(nightsBetween('2026-12-05', '2026-12-05')).toEqual([]);
    expect(nightsBetween('2026-12-30', '2027-01-02')).toHaveLength(3);
  });
  it('checks the window', () => {
    expect(checkWindow('2026-12-05', '2026-12-05', '2026-12-01')).toBe('invalid_dates');
    expect(checkWindow('2026-02-30', '2026-03-05', '2026-01-01')).toBe('invalid_dates');
    expect(checkWindow('2026-11-30', '2026-12-05', '2026-12-01')).toBe('dates_in_past');
    expect(checkWindow('2026-12-01', '2026-12-02', '2026-12-01')).toBeNull();
    expect(checkWindow('2026-12-01', '2027-01-15', '2026-12-01')).toBe('window_too_long');
  });
});

describe('SRC-01 capacity per night', () => {
  it('Rashid at 2: 0 or 1 booked is available, 2 booked is full', async () => {
    const night = async () => (await nightsFor(db, 'rashid', '2026-12-10', '2026-12-11'))[0]!;
    expect(await night()).toMatchObject({ capacity: 2, booked: 0, free: 2 });
    await reserve('b1', '2026-12-10', '2026-12-11');
    expect(await night()).toMatchObject({ booked: 1, free: 1 });
    await reserve('b2', '2026-12-10', '2026-12-11');
    expect(await night()).toMatchObject({ booked: 2, free: 0 });
  });

  it('changes only the chosen nights and stores a note', async () => {
    const result = await setCapacity(db, 'rashid', ['2026-12-12', '2026-12-14'], 4, 'Eid week');
    expect(result.ok).toBe(true);
    const nights = await nightsFor(db, 'rashid', '2026-12-12', '2026-12-16');
    expect(nights.map((n) => n.capacity)).toEqual([4, 2, 4, 2]);
    expect(nights[0]!.note).toBe('Eid week');
    expect(nights[1]!.note).toBe('');
  });

  it('refuses to lower capacity below what is booked and names the nights', async () => {
    await reserve('b1', '2026-12-10', '2026-12-12');
    await reserve('b2', '2026-12-10', '2026-12-11');
    const result = await setCapacity(db, 'rashid', ['2026-12-10', '2026-12-11'], 1);
    expect(result).toEqual({
      ok: false,
      reason: 'below_booked',
      conflicts: [{ date: '2026-12-10', booked: 2 }],
    });
    expect((await nightsFor(db, 'rashid', '2026-12-10', '2026-12-11'))[0]!.capacity).toBe(2);
  });

  it('a provider sets capacity through the API; owners and guests are refused', async () => {
    const ok = await call('PUT', '/provider/capacity', 'rashid', {
      dates: ['2026-12-20'],
      capacity: 3,
      note: 'extra room',
    });
    expect(ok.statusCode).toBe(200);
    const calendar = (
      await call('GET', '/provider/calendar?from=2026-12-20&days=2', 'rashid')
    ).json();
    expect(calendar.nights[0]).toMatchObject({
      date: '2026-12-20',
      capacity: 3,
      status: 'available',
      note: 'extra room',
    });
    expect(calendar.nights[1]).toMatchObject({ capacity: 2 });
    expect(
      (await call('PUT', '/provider/capacity', 'bibi', { dates: ['2026-12-20'], capacity: 1 }))
        .statusCode,
    ).toBe(403);
    expect((await call('GET', '/provider/calendar', null)).statusCode).toBe(401);
    expect(
      (await call('PUT', '/provider/capacity', 'rashid', { dates: ['2026-12-20'], capacity: 99 }))
        .statusCode,
    ).toBe(400);
  });

  it('refuses a lower capacity over the API with a 409 and the conflicts', async () => {
    await reserve('b1', '2026-12-22', '2026-12-23');
    const response = await call('PUT', '/provider/capacity', 'rashid', {
      dates: ['2026-12-22'],
      capacity: 0,
    });
    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('capacity_below_booked');
    expect(response.json().error.conflicts).toEqual([{ date: '2026-12-22', booked: 1 }]);
  });

  it('shows a closed night (capacity 0) as closed', async () => {
    await call('PUT', '/provider/capacity', 'rashid', { dates: ['2026-12-25'], capacity: 0 });
    const calendar = (
      await call('GET', '/provider/calendar?from=2026-12-25&days=1', 'rashid')
    ).json();
    expect(calendar.nights[0].status).toBe('closed');
  });
});

describe('SRC-03 reserve and release safely', () => {
  it('reserves all 8 nights together and not the check-out night', async () => {
    for (const id of ['a', 'b']) {
      if (id === 'b') break;
      await reserve('pre', '2026-12-10', '2026-12-18');
    }
    const result = await reserve('b1', '2026-12-10', '2026-12-18');
    expect(result).toMatchObject({ ok: true });
    const nights = await nightsFor(db, 'rashid', '2026-12-10', '2026-12-19');
    expect(nights.slice(0, 8).every((n) => n.booked === 2)).toBe(true);
    expect(nights[8]!.booked).toBe(0);
  });

  it('blocks the request when one night is full and reserves nothing', async () => {
    await reserve('b1', '2026-12-12', '2026-12-13');
    await reserve('b2', '2026-12-12', '2026-12-13');
    const result = await reserve('b3', '2026-12-10', '2026-12-15');
    expect(result).toEqual({ ok: false, reason: 'nights_full', fullNights: ['2026-12-12'] });
    const nights = await nightsFor(db, 'rashid', '2026-12-10', '2026-12-15');
    expect(nights.map((n) => n.booked)).toEqual([0, 0, 2, 0, 0]);
  });

  it('lets exactly one of several simultaneous requests take the last slot', async () => {
    await reserve('first', '2026-12-10', '2026-12-13');
    const results = await Promise.all(
      ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].map((id) => reserve(id, '2026-12-10', '2026-12-13')),
    );
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.filter((r) => !r.ok)).toHaveLength(5);
    const nights = await nightsFor(db, 'rashid', '2026-12-10', '2026-12-13');
    expect(nights.map((n) => n.booked)).toEqual([2, 2, 2]);
  });

  it('overlapping windows never overbook any night under concurrency', async () => {
    const windows = [
      ['2026-12-10', '2026-12-14'],
      ['2026-12-12', '2026-12-16'],
      ['2026-12-11', '2026-12-13'],
      ['2026-12-13', '2026-12-17'],
      ['2026-12-10', '2026-12-17'],
      ['2026-12-14', '2026-12-16'],
      ['2026-12-10', '2026-12-12'],
      ['2026-12-15', '2026-12-17'],
    ] as const;
    await Promise.all(windows.map(([from, to], i) => reserve(`c${i}`, from, to)));
    const nights = await nightsFor(db, 'rashid', '2026-12-10', '2026-12-17');
    expect(nights.every((n) => n.booked <= n.capacity)).toBe(true);
  });

  it('releases nights on decline, timeout or cancellation, and releasing twice changes nothing', async () => {
    await reserve('b1', '2026-12-10', '2026-12-13');
    expect(await releaseNights(db, 'b1')).toEqual({ released: 3 });
    expect(
      (await nightsFor(db, 'rashid', '2026-12-10', '2026-12-13')).map((n) => n.booked),
    ).toEqual([0, 0, 0]);
    expect(await releaseNights(db, 'b1')).toEqual({ released: 0 });
    expect(await releaseNights(db, 'never-existed')).toEqual({ released: 0 });
    expect(
      (await nightsFor(db, 'rashid', '2026-12-10', '2026-12-13')).map((n) => n.booked),
    ).toEqual([0, 0, 0]);
  });

  it('reserving the same booking twice holds the nights once; it can be reserved again after release', async () => {
    expect(await reserve('b1', '2026-12-10', '2026-12-12')).toMatchObject({
      ok: true,
      alreadyReserved: false,
    });
    expect(await reserve('b1', '2026-12-10', '2026-12-12')).toMatchObject({
      ok: true,
      alreadyReserved: true,
    });
    expect(
      (await nightsFor(db, 'rashid', '2026-12-10', '2026-12-12')).map((n) => n.booked),
    ).toEqual([1, 1]);
    await releaseNights(db, 'b1');
    expect(await reserve('b1', '2026-12-10', '2026-12-12')).toMatchObject({
      ok: true,
      alreadyReserved: false,
    });
    expect(
      (await nightsFor(db, 'rashid', '2026-12-10', '2026-12-12')).map((n) => n.booked),
    ).toEqual([1, 1]);
  });

  it('refuses to reserve with a provider that is not approved or unknown', async () => {
    await pool.query("UPDATE providers SET status = 'suspended' WHERE id = 'rashid'");
    expect(await reserve('b1', '2026-12-10', '2026-12-12')).toEqual({
      ok: false,
      reason: 'provider_unavailable',
    });
    expect(await reserve('b1', '2026-12-10', '2026-12-12', 'nobody')).toEqual({
      ok: false,
      reason: 'provider_unavailable',
    });
    expect(await reserve('b1', '2026-12-10', '2026-12-10')).toEqual({
      ok: false,
      reason: 'invalid_window',
    });
  });
});

describe('SRC-04 curated shortlist', () => {
  const search = async (query: string) => call('GET', `/search?${query}`, null);

  it('returns approved providers free every night, Tier-A first, with the reason on each', async () => {
    const response = await search('from=2026-12-10&to=2026-12-14&species=dog');
    expect(response.statusCode).toBe(200);
    const { providers, suggestOtherDates } = response.json();
    expect(providers.map((p: { slug: string }) => p.slug)).toEqual(['rashid', 'farzana', 'kamrul']);
    expect(providers[0].reason).toEqual({ tier: 'A', area: 'gulshan', everyNightFree: true });
    expect(suggestOtherDates).toBe(false);
    expect(response.body).not.toMatch(/sponsor|distance|rating|review|phone/i);
  });

  it('ranks Tier-A above Tier-B, then by neighbourhood density (Gulshan has two providers)', async () => {
    const { providers } = (await search('from=2026-12-10&to=2026-12-12&species=cat')).json();
    expect(providers.map((p: { slug: string }) => p.slug)).toEqual(['rashid', 'farzana', 'nusrat']);
  });

  it('leaves out a provider with any full night, and suggests other dates when fewer than 3 match', async () => {
    await reserve('b1', '2026-12-11', '2026-12-12');
    await reserve('b2', '2026-12-11', '2026-12-12');
    const { providers, suggestOtherDates } = (
      await search('from=2026-12-10&to=2026-12-13&species=dog')
    ).json();
    expect(providers.map((p: { slug: string }) => p.slug)).toEqual(['farzana', 'kamrul']);
    expect(suggestOtherDates).toBe(true);
  });

  it('check-out day does not count as a night', async () => {
    await reserve('b1', '2026-12-13', '2026-12-14');
    await reserve('b2', '2026-12-13', '2026-12-14');
    const { providers } = (await search('from=2026-12-10&to=2026-12-13&species=dog')).json();
    expect(providers.map((p: { slug: string }) => p.slug)).toContain('rashid');
  });

  it('returns an empty list when nobody matches', async () => {
    const { providers, suggestOtherDates } = (
      await search('from=2026-12-10&to=2026-12-12&species=dog&area=baridhara&area=banani')
    ).json();
    expect(providers.map((p: { slug: string }) => p.slug)).toEqual(['farzana', 'kamrul']);
    await pool.query("UPDATE providers SET status = 'vetting' WHERE id IN ('farzana','kamrul')");
    const none = (
      await search('from=2026-12-10&to=2026-12-12&species=dog&area=baridhara&area=banani')
    ).json();
    expect(none.providers).toEqual([]);
    expect(none.suggestOtherDates).toBe(true);
    expect(suggestOtherDates).toBe(true);
  });

  it('never returns suspended, removed or pending providers', async () => {
    await pool.query("UPDATE providers SET status = 'suspended' WHERE id = 'rashid'");
    const { providers } = (await search('from=2026-12-10&to=2026-12-12&species=cat')).json();
    expect(providers.map((p: { slug: string }) => p.slug)).not.toContain('rashid');
    const all = (await search('from=2026-12-10&to=2026-12-12&species=cat&all=1')).json().providers;
    expect(all.map((p: { slug: string }) => p.slug)).not.toContain('rashid');
    expect(all.map((p: { slug: string }) => p.slug)).not.toContain('sadia');
  });

  it('View all approved lists every approved provider in the areas and flags the ones that fit', async () => {
    await reserve('b1', '2026-12-10', '2026-12-12', 'kamrul');
    await pool.query("UPDATE night_capacity SET booked = 4 WHERE provider_id = 'kamrul'");
    const { providers } = (await search('from=2026-12-10&to=2026-12-12&species=dog&all=1')).json();
    expect(providers).toHaveLength(4);
    const byslug = Object.fromEntries(
      providers.map((p: { slug: string; availableAllNights: boolean }) => [
        p.slug,
        p.availableAllNights,
      ]),
    );
    expect(byslug).toEqual({ rashid: true, farzana: true, kamrul: false, nusrat: false });
  });

  it('rejects unknown neighbourhoods, past dates, bad windows and a missing species', async () => {
    expect(
      (await search('from=2026-12-10&to=2026-12-12&species=dog&area=mirpur')).json().error.code,
    ).toBe('unknown_neighbourhood');
    expect((await search('from=2026-11-20&to=2026-11-22&species=dog')).json().error.code).toBe(
      'dates_in_past',
    );
    expect((await search('from=2026-12-12&to=2026-12-10&species=dog')).json().error.code).toBe(
      'invalid_dates',
    );
    expect((await search('from=2026-12-02&to=2027-02-10&species=dog')).json().error.code).toBe(
      'window_too_long',
    );
    expect((await search('from=2026-12-10&to=2026-12-12')).statusCode).toBe(400);
  });

  it('shows availability for every night of a chosen window on the provider page', async () => {
    await reserve('b1', '2026-12-11', '2026-12-12');
    await reserve('b2', '2026-12-11', '2026-12-12');
    const response = await call(
      'GET',
      '/providers/rashid/availability?from=2026-12-10&to=2026-12-13',
      null,
    );
    expect(response.json()).toEqual({
      nights: [
        { date: '2026-12-10', available: true },
        { date: '2026-12-11', available: false },
        { date: '2026-12-12', available: true },
      ],
      allAvailable: false,
    });
    expect(
      (await call('GET', '/providers/sadia/availability?from=2026-12-10&to=2026-12-13', null))
        .statusCode,
    ).toBe(404);
  });

  it('answers a search in well under a second (p95 < 1 s)', async () => {
    const times: number[] = [];
    for (let i = 0; i < 40; i++) {
      const start = performance.now();
      await search('from=2026-12-10&to=2026-12-17&species=dog');
      times.push(performance.now() - start);
    }
    times.sort((a, b) => a - b);
    expect(times[Math.floor(times.length * 0.95)]!).toBeLessThan(1000);
  });
});
