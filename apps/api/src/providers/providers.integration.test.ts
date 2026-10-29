/** Provider records, lifecycle, tier changes and the public provider page, against real PostgreSQL (SUP-01, SUP-04). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SystemClock } from '@petcare/shared/clock';
import { buildApp } from '../app.ts';
import { createSessionStore } from '../auth/sessions.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { runSeed } from '../seed/run.ts';
import { isProviderBookable } from './provider-records.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_providers';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);

let db: Database;
let pool: pg.Pool;
let app: FastifyInstance;
const cookies = { admin: '', bibi: '', rashid: '' };

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

beforeAll(async () => {
  await runSeed({ databaseUrl: TEST_URL, dummyUrl: null });
  ({ db, pool } = createDatabase(TEST_URL));
  app = await buildApp({
    db,
    otp: { send: async () => undefined } as never,
  });
  const store = createSessionStore(db, new SystemClock());
  cookies.admin = `pc_admin_session=${(await store.create('admin', 'ayaat', 60 * 60_000)).token}`;
  cookies.bibi = `pc_session=${(await store.create('user', 'bibi', 60 * 60_000)).token}`;
  cookies.rashid = `pc_session=${(await store.create('user', 'rashid', 60 * 60_000)).token}`;
});

afterAll(async () => {
  await app?.close();
  await pool?.end();
  const admin = new pg.Client({ connectionString: BASE.replace(/\/[^/]+$/, '/postgres') });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await admin.end();
});

const newProvider = async (tier: 'A' | 'B' = 'B') =>
  (
    await call('POST', '/admin/providers', 'admin', {
      name: { en: 'Test Sitter', bn: 'টেস্ট' },
      tier,
      neighbourhood: 'gulshan',
      species: ['dog'],
    })
  ).json().provider;

describe('SUP-01 provider records, tiers and status', () => {
  it('creates a provider as applied with a tier, only for an admin', async () => {
    expect((await call('POST', '/admin/providers', null, {})).statusCode).toBe(401);
    expect((await call('POST', '/admin/providers', 'bibi', {})).statusCode).toBe(403);
    const created = await call('POST', '/admin/providers', 'admin', {
      name: { en: 'Lina', bn: 'লিনা' },
      tier: 'A',
      neighbourhood: 'banani',
      species: ['cat'],
    });
    expect(created.statusCode).toBe(201);
    expect(created.json().provider).toMatchObject({ tier: 'A', status: 'applied' });
  });

  it('rejects an unknown neighbourhood and a third tier', async () => {
    const base = { name: { en: 'X', bn: 'X' }, species: ['dog'] };
    expect(
      (
        await call('POST', '/admin/providers', 'admin', {
          ...base,
          tier: 'A',
          neighbourhood: 'mars',
        })
      ).statusCode,
    ).toBe(422);
    expect(
      (
        await call('POST', '/admin/providers', 'admin', {
          ...base,
          tier: 'C',
          neighbourhood: 'gulshan',
        })
      ).statusCode,
    ).toBe(400);
  });

  it('moves applied, vetting, approved and refuses to skip a step', async () => {
    const p = await newProvider();
    const move = (to: string, reason = 'checked the home visit') =>
      call('POST', `/admin/providers/${p.id}/status`, 'admin', { to, reason });
    expect((await move('approved')).statusCode).toBe(409);
    expect((await move('vetting')).statusCode).toBe(200);
    expect((await move('approved')).json().error.code).toBe('profile_incomplete');
    await pool.query(
      'UPDATE providers SET price_per_night_poisha = 150000, capacity_small = 2 WHERE id = $1',
      [p.id],
    );
    expect((await move('approved')).json().provider.status).toBe('approved');
    expect((await move('vetting')).statusCode).toBe(409);
    expect((await move('suspended')).json().provider.status).toBe('suspended');
  });

  it('needs a reason for every change', async () => {
    const p = await newProvider();
    expect(
      (
        await call('POST', `/admin/providers/${p.id}/status`, 'admin', {
          to: 'vetting',
          reason: '',
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (await call('POST', `/admin/providers/${p.id}/tier`, 'admin', { tier: 'A' })).statusCode,
    ).toBe(400);
  });

  it('changes tier with a reason, keeps history and writes the audit log', async () => {
    const p = await newProvider('B');
    const response = await call('POST', `/admin/providers/${p.id}/tier`, 'admin', {
      tier: 'A',
      reason: 'Introduced by the admin after a home visit',
    });
    expect(response.json().provider.tier).toBe('A');
    expect(
      (
        await call('POST', `/admin/providers/${p.id}/tier`, 'admin', {
          tier: 'A',
          reason: 'again please',
        })
      ).statusCode,
    ).toBe(409);
    const detail = (await call('GET', `/admin/providers/${p.id}`, 'admin')).json();
    expect(detail.history[0]).toMatchObject({ kind: 'tier', from: 'B', to: 'A' });
    const { rows } = await pool.query(
      "SELECT action, payload FROM event_log WHERE target_id = $1 AND action = 'provider.tier_changed'",
      [p.id],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].payload.reason).toBe('Introduced by the admin after a home visit');
  });

  it('lists providers for the admin by status and refuses owners and providers', async () => {
    const all = (await call('GET', '/admin/providers', 'admin')).json().providers;
    expect(all.length).toBeGreaterThanOrEqual(5);
    const applied = (await call('GET', '/admin/providers?status=applied', 'admin')).json()
      .providers;
    expect(applied.some((p: { id: string }) => p.id === 'sadia')).toBe(true);
    expect((await call('GET', '/admin/providers', 'rashid')).statusCode).toBe(403);
    expect((await call('GET', '/admin/providers', null)).statusCode).toBe(401);
  });

  it('only an approved provider is bookable; suspended and removed are refused', async () => {
    expect(await isProviderBookable(db, 'rashid')).toBe(true);
    expect(await isProviderBookable(db, 'sadia')).toBe(false);
    expect(await isProviderBookable(db, 'missing')).toBe(false);
    const p = await newProvider();
    await pool.query(
      "UPDATE providers SET status = 'approved', price_per_night_poisha = 1, capacity_small = 1 WHERE id = $1",
      [p.id],
    );
    expect(await isProviderBookable(db, p.id)).toBe(true);
    await call('POST', `/admin/providers/${p.id}/status`, 'admin', {
      to: 'suspended',
      reason: 'complaint under review',
    });
    expect(await isProviderBookable(db, p.id)).toBe(false);
    await call('POST', `/admin/providers/${p.id}/status`, 'admin', {
      to: 'removed',
      reason: 'confirmed breach',
    });
    expect(await isProviderBookable(db, p.id)).toBe(false);
    expect(
      (
        await call('POST', `/admin/providers/${p.id}/status`, 'admin', {
          to: 'approved',
          reason: 'try again',
        })
      ).statusCode,
    ).toBe(409);
  });

  it('has no public route that creates a provider', async () => {
    for (const url of ['/providers', '/owner/providers', '/provider/apply']) {
      expect((await call('POST', url, 'bibi', {})).statusCode).toBe(404);
    }
  });
});

describe('SUP-04 public provider page', () => {
  it('shows an approved provider without any private field, to guests too', async () => {
    const response = await call('GET', '/providers/rashid', null);
    expect(response.statusCode).toBe(200);
    const { provider } = response.json();
    expect(provider).toMatchObject({
      slug: 'rashid',
      tier: 'A',
      pricePerNightPoisha: 250000,
      capacity: { smallPets: 2 },
      species: ['dog', 'cat'],
      area: { id: 'gulshan' },
      photos: [],
      reviews: { count: 0 },
    });
    const text = response.body;
    for (const secret of ['+8801712000002', 'userId', 'artifact', 'status', 'phone'])
      expect(text).not.toContain(secret);
  });

  it('Tier-B carries tier B so the screen shows no badge', async () => {
    expect((await call('GET', '/providers/kamrul', null)).json().provider.tier).toBe('B');
  });

  it('is not found for pending, suspended, removed and unknown providers', async () => {
    const p = await newProvider();
    expect((await call('GET', `/providers/${p.slug}`, null)).statusCode).toBe(404);
    expect((await call('GET', '/providers/nobody', null)).statusCode).toBe(404);
    await pool.query("UPDATE providers SET status = 'suspended' WHERE id = 'nusrat'");
    expect((await call('GET', '/providers/nusrat', null)).statusCode).toBe(404);
    await pool.query("UPDATE providers SET status = 'approved' WHERE id = 'nusrat'");
    expect((await call('GET', '/providers/nusrat', null)).statusCode).toBe(200);
  });
});
