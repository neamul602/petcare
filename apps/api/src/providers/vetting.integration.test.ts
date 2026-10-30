/** Vetting, appeals, decisions list and the provider profile editor against real PostgreSQL (SUP-02, SUP-03, SUP-05). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SystemClock } from '@petcare/shared/clock';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { runSeed } from '../seed/run.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_vetting';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
let db: Database;
let pool: pg.Pool;
let app: FastifyInstance;
const cookies = { admin: '', bibi: '', rashid: '', farzana: '' };

const call = (
  method: 'GET' | 'POST' | 'PUT',
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
  app = await buildApp({ db, otp: { send: async () => undefined } as never });
  const store = createSessionStore(db, new SystemClock());
  cookies.admin = `pc_admin_session=${(await store.create('admin', 'ayaat', 3_600_000)).token}`;
  for (const [k, id] of [
    ['bibi', 'bibi'],
    ['rashid', 'rashid'],
    ['farzana', 'farzana'],
  ] as const)
    cookies[k] = `pc_session=${(await store.create('user', id, 3_600_000)).token}`;
});
afterAll(async () => {
  await app?.close();
  await pool?.end();
  const admin = new pg.Client({ connectionString: BASE.replace(/\/[^/]+$/, '/postgres') });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await admin.end();
});

const newProvider = async (tier: 'A' | 'B') =>
  (
    await call('POST', '/admin/providers', 'admin', {
      name: { en: `Vet ${tier}`, bn: `ভেট ${tier}` },
      tier,
      neighbourhood: 'gulshan',
      species: ['dog'],
    })
  ).json().provider as { id: string; slug: string };
const status = (id: string, to: string, reason = 'decision after review') =>
  call('POST', `/admin/providers/${id}/status`, 'admin', { to, reason });
const complete = {
  identityDone: true,
  addressDone: true,
  capabilityDone: true,
  referencesNote: 'Two neighbours',
  artifacts: ['nid-scan-ref-001'],
};
const fillProfile = (id: string) =>
  pool.query(
    'UPDATE providers SET price_per_night_poisha = 100000, capacity_small = 2, experience_en = $2, experience_bn = $2 WHERE id = $1',
    [id, 'Home sitter'],
  );

describe('SUP-02 application review and vetting', () => {
  it('shows the criteria, blocks approval until identity, address and capability are complete', async () => {
    const p = await newProvider('B');
    await status(p.id, 'vetting');
    const before = (await call('GET', `/admin/providers/${p.id}/vetting`, 'admin')).json();
    expect(before.missing).toEqual(['identity', 'address', 'capability']);
    const blocked = await status(p.id, 'approved');
    expect(blocked.statusCode).toBe(409);
    expect(blocked.json().error).toMatchObject({
      code: 'vetting_incomplete',
      missing: ['identity', 'address', 'capability'],
    });
    await call('PUT', `/admin/providers/${p.id}/vetting`, 'admin', {
      ...complete,
      identityDone: false,
    });
    expect((await status(p.id, 'approved')).json().error.missing).toEqual(['identity']);
    await call('PUT', `/admin/providers/${p.id}/vetting`, 'admin', complete);
    await fillProfile(p.id);
    expect(
      (await status(p.id, 'approved', 'All checks done, home visited')).json().provider.status,
    ).toBe('approved');
  });
  it('Tier-A also needs a recorded personal outreach', async () => {
    const p = await newProvider('A');
    await status(p.id, 'vetting');
    await call('PUT', `/admin/providers/${p.id}/vetting`, 'admin', complete);
    await fillProfile(p.id);
    expect((await status(p.id, 'approved')).json().error.missing).toEqual(['outreach']);
    await call('PUT', `/admin/providers/${p.id}/vetting`, 'admin', {
      ...complete,
      outreachNote: 'Introduced by Ayaat at a meetup',
    });
    expect((await status(p.id, 'approved')).statusCode).toBe(200);
  });
  it('requests more information and shows awaiting info until the record is updated', async () => {
    const p = await newProvider('B');
    await call('POST', `/admin/providers/${p.id}/request-info`, 'admin', {
      note: 'Please send a utility bill',
    });
    expect(
      (await call('GET', `/admin/providers/${p.id}/vetting`, 'admin')).json().record,
    ).toMatchObject({ awaitingInfo: true, infoRequest: 'Please send a utility bill' });
    await call('PUT', `/admin/providers/${p.id}/vetting`, 'admin', complete);
    expect(
      (await call('GET', `/admin/providers/${p.id}/vetting`, 'admin')).json().record.awaitingInfo,
    ).toBe(false);
  });
  it('keeps artifacts private: no owner or public response carries them', async () => {
    const p = await newProvider('B');
    await status(p.id, 'vetting');
    await call('PUT', `/admin/providers/${p.id}/vetting`, 'admin', complete);
    await fillProfile(p.id);
    await status(p.id, 'approved');
    for (const [url, who] of [
      [`/providers/${p.slug}`, null],
      [`/providers/${p.slug}/reviews`, null],
      ['/search?from=2099-01-01&to=2099-01-03&species=dog', 'bibi'],
      ['/admin/providers/' + p.id, 'admin'],
    ] as const) {
      const body = (await call('GET', url, who)).body;
      expect(body).not.toContain('nid-scan-ref-001');
      expect(body).not.toContain('Two neighbours');
    }
    expect((await call('GET', `/admin/providers/${p.id}/vetting`, 'bibi')).statusCode).toBe(403);
    expect((await call('GET', `/admin/providers/${p.id}/vetting`, 'rashid')).statusCode).toBe(403);
  });
  it('audit-logs every vetting change', async () => {
    const p = await newProvider('B');
    await call('PUT', `/admin/providers/${p.id}/vetting`, 'admin', complete);
    await call('POST', `/admin/providers/${p.id}/request-info`, 'admin', { note: 'More please' });
    const rows = (
      await pool.query(
        "SELECT action FROM event_log WHERE target_id=$1 AND action LIKE 'vetting.%' ORDER BY id",
        [p.id],
      )
    ).rows.map((r) => r.action);
    expect(rows).toEqual(['vetting.record_updated', 'vetting.info_requested']);
  });
});

describe('SUP-03 appeal and bias-audit data', () => {
  it('records an appeal for a declined provider and its outcome', async () => {
    const p = await newProvider('B');
    expect(
      (
        await call('POST', `/admin/providers/${p.id}/appeals`, 'admin', {
          note: 'Provider disagrees',
        })
      ).statusCode,
    ).toBe(409);
    await status(p.id, 'removed', 'Could not verify address');
    const appeal = await call('POST', `/admin/providers/${p.id}/appeals`, 'admin', {
      note: 'Provider sent a new utility bill',
    });
    expect(appeal.statusCode).toBe(201);
    const id = appeal.json().appeal.id;
    expect(
      (await call('PUT', `/admin/appeals/${id}`, 'admin', { outcome: 'upheld' })).json().appeal
        .outcome,
    ).toBe('upheld');
    expect(
      (await call('GET', `/admin/providers/${p.id}/vetting`, 'admin')).json().appeals,
    ).toMatchObject([{ outcome: 'upheld', note: 'Provider sent a new utility bill' }]);
    expect(
      (await call('PUT', '/admin/appeals/nope', 'admin', { outcome: 'upheld' })).statusCode,
    ).toBe(404);
  });
  it('lists approvals and declines with reasons for bias review', async () => {
    const a = await newProvider('B');
    await status(a.id, 'removed', 'Could not verify address');
    const b = await newProvider('B');
    await status(b.id, 'vetting');
    await call('PUT', `/admin/providers/${b.id}/vetting`, 'admin', complete);
    await fillProfile(b.id);
    await status(b.id, 'approved', 'Home visit went well');
    const { decisions } = (await call('GET', '/admin/vetting/decisions', 'admin')).json();
    expect(decisions.find((d: { providerId: string }) => d.providerId === a.id)).toMatchObject({
      decision: 'declined',
      reason: 'Could not verify address',
      tier: 'B',
      neighbourhood: 'gulshan',
    });
    expect(decisions.find((d: { providerId: string }) => d.providerId === b.id)).toMatchObject({
      decision: 'approved',
      reason: 'Home visit went well',
    });
    expect((await call('GET', '/admin/vetting/decisions', 'bibi')).statusCode).toBe(403);
  });
});

describe('SUP-05 provider profile editor', () => {
  const body = {
    experience: { en: 'Calm home with a garden', bn: 'বাগানসহ শান্ত বাসা' },
    pricePerNightPoisha: 260000,
    species: ['dog', 'cat'],
    capabilities: ['senior-pets', 'large-yard'],
    capacitySmall: 3,
  };
  it('saves the profile and the public page shows the change', async () => {
    const saved = await call('PUT', '/provider/profile', 'rashid', body);
    expect(saved.json().profile).toMatchObject({
      pricePerNightPoisha: 260000,
      capacitySmall: 3,
      missing: [],
      tier: 'A',
      status: 'approved',
    });
    const pub = (await call('GET', '/providers/rashid', null)).json().provider;
    expect(pub).toMatchObject({
      pricePerNightPoisha: 260000,
      capabilities: ['senior-pets', 'large-yard'],
      experience: { en: 'Calm home with a garden' },
      capacity: { smallPets: 3 },
    });
  });
  it('lists what is missing and cannot change tier or status', async () => {
    await pool.query(
      "UPDATE providers SET experience_bn = '', price_per_night_poisha = NULL, capacity_small = 0 WHERE id = 'farzana'",
    );
    expect((await call('GET', '/provider/profile', 'farzana')).json().profile.missing).toEqual([
      'experience_bn',
      'price',
      'capacity',
    ]);
    for (const extra of [{ tier: 'B' }, { status: 'approved' }])
      expect(
        (await call('PUT', '/provider/profile', 'farzana', { ...body, ...extra })).statusCode,
      ).toBe(400);
    expect((await call('GET', '/provider/profile', 'farzana')).json().profile).toMatchObject({
      tier: 'A',
      status: 'approved',
    });
  });
  it('validates input, needs a provider, and capacity per size is not offered', async () => {
    expect(
      (await call('PUT', '/provider/profile', 'rashid', { ...body, pricePerNightPoisha: 5 }))
        .statusCode,
    ).toBe(400);
    expect(
      (await call('PUT', '/provider/profile', 'rashid', { ...body, capabilities: ['jetpack'] }))
        .statusCode,
    ).toBe(400);
    expect(
      (await call('PUT', '/provider/profile', 'rashid', { ...body, capacityPerSize: { large: 1 } }))
        .statusCode,
    ).toBe(400);
    expect((await call('GET', '/provider/profile', 'bibi')).statusCode).toBe(403);
    expect((await call('GET', '/provider/profile', null)).statusCode).toBe(401);
  });
});
