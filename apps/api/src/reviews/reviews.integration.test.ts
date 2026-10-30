/** Verified reviews, public aggregates and report a problem against real PostgreSQL (REV-01, REV-02, REV-05). */
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
const TEST_DB = 'petcare_test_reviews';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const clock = new TestClock('2026-12-01T06:00:00Z');

let db: Database;
let pool: pg.Pool;
let dummy: ReturnType<typeof buildDummyApp>;
let dummyUrl: string;
let app: FastifyInstance;
const cookies = { bibi: '', other: '', rashid: '', admin: '' };
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
const rows = async (sql: string, params: unknown[] = []) => (await pool.query(sql, params)).rows;

function multipart(fields: Record<string, string>, files: Buffer[]) {
  const b = '----rev';
  const parts: Buffer[] = [];
  for (const [k, v] of Object.entries(fields))
    parts.push(
      Buffer.from(`--${b}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`),
    );
  files.forEach((f, i) =>
    parts.push(
      Buffer.from(
        `--${b}\r\nContent-Disposition: form-data; name="photo"; filename="p${i}.png"\r\nContent-Type: image/png\r\n\r\n`,
      ),
      f,
      Buffer.from('\r\n'),
    ),
  );
  parts.push(Buffer.from(`--${b}--\r\n`));
  return {
    payload: Buffer.concat(parts),
    headers: { 'content-type': `multipart/form-data; boundary=${b}`, cookie: cookies.rashid },
  };
}

/** A completed stay (2026-12-10 to 12-13) with two provider photos; clock left just after completion. */
async function completed() {
  clock.set('2026-12-01T06:00:00Z');
  const id = (
    await call('POST', '/owner/bookings', 'bibi', {
      key: `r-${++seq}-abcdefgh`,
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
  const upd = multipart({ note: 'photos', careLog: '{}' }, [PNG, PNG]);
  await app.inject({
    method: 'POST',
    url: `/provider/bookings/${id}/updates`,
    payload: upd.payload,
    headers: upd.headers,
  });
  clock.set('2026-12-13T05:00:00Z');
  await call('POST', `/provider/bookings/${id}/complete`, 'rashid');
  await call('POST', `/owner/bookings/${id}/confirm-completion`, 'bibi');
  const photoIds = (await call('GET', `/bookings/${id}/updates`, 'bibi'))
    .json()
    .updates[0].photos.map((u: string) => u.split('/').pop()) as string[];
  return { id, photoIds };
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
  const day = 90 * 24 * 3_600_000;
  for (const [k, id] of [
    ['bibi', 'bibi'],
    ['other', 'other-owner'],
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
  await pool.query('TRUNCATE update_photos, daily_updates');
  await pool.query(
    'DELETE FROM reports; DELETE FROM reviews; DELETE FROM payout_batches; DELETE FROM payouts; DELETE FROM booking_flags; DELETE FROM care_history; DELETE FROM bookings; DELETE FROM payments; DELETE FROM night_reservations; DELETE FROM night_capacity',
  );
});

describe('REV-01 leave a verified review', () => {
  it('rates 1-5 with optional text and stay photos, once, only for a completed booking of your own', async () => {
    const { id, photoIds } = await completed();
    expect(
      (await call('POST', `/owner/bookings/${id}/review`, 'bibi', { rating: 0 })).statusCode,
    ).toBe(400);
    expect(
      (await call('POST', `/owner/bookings/${id}/review`, 'bibi', { rating: 6 })).statusCode,
    ).toBe(400);
    expect((await call('POST', `/owner/bookings/${id}/review`, 'bibi', {})).statusCode).toBe(400);
    expect(
      (await call('POST', `/owner/bookings/${id}/review`, 'other', { rating: 5 })).statusCode,
    ).toBe(404);
    const ok = await call('POST', `/owner/bookings/${id}/review`, 'bibi', {
      rating: 5,
      text: 'Tito was happy',
      photoIds,
    });
    expect(ok.statusCode).toBe(201);
    const again = await call('POST', `/owner/bookings/${id}/review`, 'bibi', { rating: 1 });
    expect(again.statusCode).toBe(409);
    expect(again.json().error.code).toBe('already_reviewed');
    const view = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking;
    expect(view).toMatchObject({ review: { rating: 5 }, canReview: false });
  });
  it('is refused for a booking that is not completed', async () => {
    const waiting = (
      await call('POST', '/owner/bookings', 'bibi', {
        key: `n-${++seq}-abcdefgh`,
        providerSlug: 'rashid',
        petId: 'tito',
        from: '2026-12-20',
        to: '2026-12-22',
        method: 'bkash',
      })
    ).json().booking.id;
    expect(
      (await call('POST', `/owner/bookings/${waiting}/review`, 'bibi', { rating: 5 })).json().error
        .code,
    ).toBe('not_completed');
  });
  it('only photos from this stay can be attached', async () => {
    const { id } = await completed();
    const bad = await call('POST', `/owner/bookings/${id}/review`, 'bibi', {
      rating: 4,
      photoIds: ['up_not-from-this-stay'],
    });
    expect(bad.statusCode).toBe(422);
    expect(bad.json().error.code).toBe('bad_photos');
  });
  it('an open report does not stop a review (FR-22), and a review does not stop a report', async () => {
    const { id } = await completed();
    expect(
      (
        await call('POST', `/owner/bookings/${id}/report`, 'bibi', {
          category: 'communication',
          description: 'Slow to answer',
        })
      ).statusCode,
    ).toBe(201);
    expect(
      (await call('POST', `/owner/bookings/${id}/review`, 'bibi', { rating: 3, text: 'Mixed' }))
        .statusCode,
    ).toBe(201);
    const view = (await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking;
    expect(view).toMatchObject({
      state: 'disputed',
      review: { rating: 3 },
      report: { category: 'communication' },
    });
  });
});

describe('REV-02 public reviews and aggregates', () => {
  it('shows no ratings for a provider with no reviews', async () => {
    const response = (await call('GET', '/providers/rashid/reviews', null)).json();
    expect(response).toEqual({
      aggregates: { count: 0, average: null, withPhotosPercent: null },
      reviews: [],
    });
    expect((await call('GET', '/providers/rashid', null)).json().provider.reviews).toEqual({
      count: 0,
      average: null,
      withPhotosPercent: null,
    });
  });
  it('lists reviews newest first, verified, with photos, and computes aggregates from real reviews only', async () => {
    const a = await completed();
    await call('POST', `/owner/bookings/${a.id}/review`, 'bibi', {
      rating: 5,
      text: 'Great',
      photoIds: a.photoIds,
    });
    clock.advanceMinutes(60);
    const b = await completed();
    clock.advanceMinutes(120);
    await call('POST', `/owner/bookings/${b.id}/review`, 'bibi', { rating: 4, text: 'Good' });
    const body = (await call('GET', '/providers/rashid/reviews', null)).json();
    expect(body.reviews.map((r: { text: string }) => r.text)).toEqual(['Good', 'Great']);
    expect(body.reviews[0]).toMatchObject({ verified: true, rating: 4, photos: [] });
    expect(body.reviews[1].photos).toHaveLength(2);
    expect(body.aggregates).toEqual({ count: 2, average: 4.5, withPhotosPercent: 50 });
    expect((await call('GET', '/providers/rashid', null)).json().provider.reviews.average).toBe(
      4.5,
    );
    expect((await call('GET', '/providers/farzana/reviews', null)).json().aggregates.count).toBe(0);
  });
  it('a review photo is public only while it is on a published review; a removed review is hidden but stored', async () => {
    const { id, photoIds } = await completed();
    expect((await call('GET', `/reviews/photos/${photoIds[0]}`, null)).statusCode).toBe(404);
    await call('POST', `/owner/bookings/${id}/review`, 'bibi', {
      rating: 5,
      text: 'Great',
      photoIds: [photoIds[0]],
    });
    expect((await call('GET', `/reviews/photos/${photoIds[0]}`, null)).statusCode).toBe(200);
    expect((await call('GET', `/reviews/photos/${photoIds[1]}`, null)).statusCode).toBe(404);
    await pool.query("UPDATE reviews SET status = 'removed'");
    expect((await call('GET', '/providers/rashid/reviews', null)).json().reviews).toEqual([]);
    expect((await call('GET', `/reviews/photos/${photoIds[0]}`, null)).statusCode).toBe(404);
    expect((await rows('SELECT count(*)::int AS n FROM reviews'))[0].n).toBe(1);
  });
  it('search ranking never reads reviews', async () => {
    const a = await completed();
    await call('POST', `/owner/bookings/${a.id}/review`, 'bibi', { rating: 1 });
    const hits = (await call('GET', '/search?from=2026-12-20&to=2026-12-22&species=dog', null))
      .json()
      .providers.map((p: { slug: string }) => p.slug);
    expect(hits).toEqual(['rashid', 'farzana', 'kamrul']);
  });
});

describe('REV-05 report a problem', () => {
  it('disputes the booking, freezes the payout and shows the report to the admin', async () => {
    const { id, photoIds } = await completed();
    const response = await call('POST', `/owner/bookings/${id}/report`, 'bibi', {
      category: 'care-not-as-agreed',
      description: 'Walks were skipped',
      photoIds,
    });
    expect(response.statusCode).toBe(201);
    expect((await call('GET', `/owner/bookings/${id}`, 'bibi')).json().booking.state).toBe(
      'disputed',
    );
    expect(
      (await rows('SELECT status, freeze_reason FROM payouts WHERE booking_id=$1', [id]))[0],
    ).toEqual({ status: 'frozen', freeze_reason: 'report:care-not-as-agreed' });
    const list = (await call('GET', '/admin/reports', 'admin')).json().reports;
    expect(list).toMatchObject([
      {
        bookingId: id,
        category: 'care-not-as-agreed',
        description: 'Walks were skipped',
        status: 'open',
      },
    ]);
    expect((await call('GET', '/admin/reports', 'bibi')).statusCode).toBe(403);
  });
  it('is refused after 72 hours with the reason, and a second report is refused', async () => {
    const late = await completed();
    clock.advanceMinutes(72 * 60 + 1);
    const closed = await call('POST', `/owner/bookings/${late.id}/report`, 'bibi', {
      category: 'other',
      description: 'Too late',
    });
    expect(closed.statusCode).toBe(409);
    expect(closed.json().error).toMatchObject({ code: 'window_closed' });
    expect((await call('GET', `/owner/bookings/${late.id}`, 'bibi')).json().booking.canReport).toBe(
      false,
    );
    const fresh = await completed();
    expect(
      (await call('GET', `/owner/bookings/${fresh.id}`, 'bibi')).json().booking.canReport,
    ).toBe(true);
    await call('POST', `/owner/bookings/${fresh.id}/report`, 'bibi', {
      category: 'other',
      description: 'First',
    });
    expect(
      (
        await call('POST', `/owner/bookings/${fresh.id}/report`, 'bibi', {
          category: 'other',
          description: 'Second',
        })
      ).json().error.code,
    ).toBe('already_reported');
  });
  it('needs one of the six categories, a description and at most 5 stay photos', async () => {
    const { id, photoIds } = await completed();
    expect(
      (
        await call('POST', `/owner/bookings/${id}/report`, 'bibi', {
          category: 'rude',
          description: 'x y z',
        })
      ).json().error.code,
    ).toBe('bad_category');
    expect(
      (await call('POST', `/owner/bookings/${id}/report`, 'bibi', { category: 'other' }))
        .statusCode,
    ).toBe(400);
    expect(
      (
        await call('POST', `/owner/bookings/${id}/report`, 'bibi', {
          category: 'other',
          description: 'x y z',
          photoIds: ['a', 'b', 'c', 'd', 'e', 'f'],
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await call('POST', `/owner/bookings/${id}/report`, 'bibi', {
          category: 'other',
          description: 'x y z',
          photoIds: ['up_foreign'],
        })
      ).json().error.code,
    ).toBe('bad_photos');
    expect(
      (
        await call('POST', `/owner/bookings/${id}/report`, 'other', {
          category: 'other',
          description: 'x y z',
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await call('POST', `/owner/bookings/${id}/report`, 'bibi', {
          category: 'other',
          description: 'x y z',
          photoIds,
        })
      ).statusCode,
    ).toBe(201);
  });
  it('lists the six categories', async () => {
    expect((await call('GET', '/report-categories', null)).json().categories).toHaveLength(6);
  });
});
