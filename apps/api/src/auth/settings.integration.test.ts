/** Settings: name and language, read-only phone, admin name (ACC-05). */
import type { FastifyInstance } from 'fastify';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SystemClock } from '@petcare/shared/clock';
import { buildApp } from '../app.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { runSeed } from '../seed/run.ts';
import { createSessionStore } from './sessions.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_settings';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
let db: Database;
let pool: pg.Pool;
let app: FastifyInstance;
const cookies = { bibi: '', rashid: '', admin: '' };

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
  app = await buildApp({ db, otp: { send: async () => undefined } as never });
  const store = createSessionStore(db, new SystemClock());
  cookies.bibi = `pc_session=${(await store.create('user', 'bibi', 3_600_000)).token}`;
  cookies.rashid = `pc_session=${(await store.create('user', 'rashid', 3_600_000)).token}`;
  cookies.admin = `pc_admin_session=${(await store.create('admin', 'ayaat', 3_600_000)).token}`;
});
afterAll(async () => {
  await app?.close();
  await pool?.end();
  const admin = new pg.Client({ connectionString: BASE.replace(/\/[^/]+$/, '/postgres') });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await admin.end();
});

describe('ACC-05 settings', () => {
  it('shows the name, language and the verified phone read-only', async () => {
    const { settings } = (await call('GET', '/me/settings', 'bibi')).json();
    expect(settings).toMatchObject({
      phone: '+8801712000001',
      language: expect.stringMatching(/^(bn|en)$/),
      role: 'owner',
    });
  });
  it('saves a new name and language and uses them everywhere', async () => {
    const saved = await call('PUT', '/me/settings', 'bibi', {
      name: 'Bibi Rahman',
      language: 'en',
    });
    expect(saved.json().settings).toMatchObject({
      name: 'Bibi Rahman',
      language: 'en',
      phone: '+8801712000001',
    });
    expect((await call('GET', '/auth/me', 'bibi')).json().user).toMatchObject({
      name: 'Bibi Rahman',
      language: 'en',
    });
  });
  it('never changes the phone and rejects bad input', async () => {
    expect(
      (
        await call('PUT', '/me/settings', 'bibi', {
          name: 'X',
          language: 'en',
          phone: '+8801700000000',
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (await call('PUT', '/me/settings', 'bibi', { name: '', language: 'en' })).statusCode,
    ).toBe(400);
    expect(
      (await call('PUT', '/me/settings', 'bibi', { name: 'X', language: 'fr' })).statusCode,
    ).toBe(400);
    expect((await call('GET', '/me/settings', 'bibi')).json().settings.phone).toBe(
      '+8801712000001',
    );
  });
  it('works for providers, needs a sign-in, and is not for admins', async () => {
    expect(
      (await call('PUT', '/me/settings', 'rashid', { name: 'Rashid K', language: 'bn' }))
        .statusCode,
    ).toBe(200);
    expect((await call('GET', '/me/settings', null)).statusCode).toBe(401);
    expect((await call('GET', '/me/settings', 'admin')).statusCode).toBe(403);
  });
  it('lets the admin change their own name, audit-logged', async () => {
    expect((await call('PUT', '/admin/me', 'admin', { name: 'Ayaat Karim' })).statusCode).toBe(200);
    expect((await call('GET', '/admin/me', 'admin')).json().user.name).toBe('Ayaat Karim');
    expect(
      (await pool.query("SELECT 1 FROM event_log WHERE action='admin.name_changed'")).rowCount,
    ).toBe(1);
    expect((await call('PUT', '/admin/me', 'bibi', { name: 'X' })).statusCode).toBe(403);
  });
});
