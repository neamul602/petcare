/**
 * Sign-in and role guards against real PostgreSQL and the real Dummy OTP service (in process).
 * Covers ACC-01 (phone OTP) and ACC-02 (admin sign-in, role guards, audit).
 */
import type { FastifyInstance } from 'fastify';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TestClock } from '@petcare/shared/clock';
import { buildDummyApp } from '../../../dummy-services/src/app.ts';
import { buildApp } from '../app.ts';
import { createDatabase, type Database } from '../db/client.ts';
import { appendLogEntry } from '../log/append.ts';
import { runSeed } from '../seed/run.ts';
import { recordAdminAction } from './audit.ts';
import { createDummyOtp } from './dummy-otp.ts';
import { hashPassword } from './passwords.ts';
import { adminUsers } from '../db/schema/index.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_auth';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);
const ADMIN = { email: 'ayaat@petcare.training', password: 'test-only-password' };
const BIBI = '+8801712000001';
const RASHID = '+8801712000002';

const clock = new TestClock('2026-03-28T04:00:00Z');
let db: Database;
let pool: pg.Pool;
let dummy: Awaited<ReturnType<typeof buildDummyApp>>;
let dummyUrl: string;
let app: FastifyInstance;

const post = (url: string, payload: unknown, cookie?: string) =>
  app.inject({
    method: 'POST',
    url,
    payload: payload as object,
    headers: cookie ? { cookie } : {},
  });
const get = (url: string, cookie?: string) =>
  app.inject({ method: 'GET', url, headers: cookie ? { cookie } : {} });
const cookieOf = (response: Awaited<ReturnType<typeof post>>, name: string) => {
  const found = response.cookies.find((c) => c.name === name);
  return found ? `${name}=${found.value}` : undefined;
};
const codeFor = async (phone: string) => {
  const state = (await (await fetch(`${dummyUrl}/_training/otp/inspect`)).json()) as {
    state: { challenges: Array<{ phone: string; code: string }> };
  };
  return state.state.challenges.find((c) => c.phone === phone)!.code;
};
const setOtpMode = (mode: string) =>
  fetch(`${dummyUrl}/_training/otp/failure-mode`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode, timeoutMs: 20 }),
  });

/** Sends a code and verifies it: returns the verify response. */
async function signIn(phone: string, rawPhone = phone) {
  expect((await post('/auth/otp/send', { phone: rawPhone })).statusCode).toBe(202);
  return post('/auth/otp/verify', { phone: rawPhone, code: await codeFor(phone) });
}
const lastLogId = async () =>
  Number((await pool.query('SELECT coalesce(max(id), 0) AS m FROM event_log')).rows[0].m);
// The log is append-only, so tests read only what was added after a starting point.
const auditRows = async (since: number) =>
  (
    await pool.query('SELECT actor, action, target_id FROM event_log WHERE id > $1 ORDER BY id', [
      since,
    ])
  ).rows as Array<{ actor: string; action: string; target_id: string }>;

beforeAll(async () => {
  const admin = new pg.Client({ connectionString: BASE });
  await admin.connect().catch((error: unknown) => {
    throw new Error('PostgreSQL is not reachable; run "npm run db:up" first.', { cause: error });
  });
  await admin.end();
  await runSeed({ databaseUrl: TEST_URL, dummyUrl: null, adminPassword: ADMIN.password });
  ({ db, pool } = createDatabase(TEST_URL));
  dummy = buildDummyApp({ now: () => clock.now(), timeoutMs: 20 });
  await dummy.listen({ port: 0, host: '127.0.0.1' });
  const address = dummy.server.address();
  dummyUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
});

afterAll(async () => {
  await dummy?.close();
  await app?.close();
  await pool?.end();
  const admin = new pg.Client({ connectionString: BASE.replace(/\/[^/]+$/, '/postgres') });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await admin.end();
});

beforeEach(async () => {
  await app?.close();
  clock.set('2026-03-28T04:00:00Z');
  await fetch(`${dummyUrl}/_training/reset-all`, { method: 'POST' });
  await pool.query('DELETE FROM sessions');
  await pool.query('DELETE FROM signup_tokens');
  await pool.query("DELETE FROM users WHERE id LIKE 'owner_%'");
  await pool.query("DELETE FROM admin_users WHERE id <> 'ayaat'");
  app = await buildApp({ db, otp: createDummyOtp(dummyUrl, 2000), clock });
});

describe('ACC-01 sign in with phone OTP', () => {
  it('an existing owner signs in with a code and gets a safe session cookie', async () => {
    const response = await signIn(BIBI);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'signed_in',
      role: 'owner',
      name: 'Bibi',
      redirect: '/',
    });
    const cookie = response.cookies.find((c) => c.name === 'pc_session')!;
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'Lax', path: '/' });
    expect((await get('/auth/me', `pc_session=${cookie.value}`)).json().user).toMatchObject({
      role: 'owner',
      name: 'Bibi',
      phone: BIBI,
    });
  });

  it('accepts the number the way people type it and stores one form', async () => {
    const response = await signIn(BIBI, '01712-000001');
    expect(response.json().status).toBe('signed_in');
    expect((await post('/auth/otp/send', { phone: '12345' })).json().error.code).toBe(
      'invalid_phone',
    );
    expect((await post('/auth/otp/send', { phone: '+15551234567' })).statusCode).toBe(400);
  });

  it('the send reply tells the page to wait 60 seconds before a resend and never contains the code', async () => {
    const response = await post('/auth/otp/send', { phone: BIBI });
    expect(response.statusCode).toBe(202);
    expect(response.json()).toEqual({ phone: BIBI, resendAfterSeconds: 60 });
    expect(response.body).not.toContain(await codeFor(BIBI));
  });

  it('a new phone number asks for a name and a launch neighbourhood, then creates an owner', async () => {
    const phone = '+8801799000001';
    const verified = await signIn(phone);
    expect(verified.json().status).toBe('profile_needed');
    expect(cookieOf(verified, 'pc_session')).toBeUndefined();
    const { setupToken } = verified.json();
    const created = await post('/auth/profile', {
      setupToken,
      name: '  Nadia  ',
      neighbourhood: 'gulshan',
    });
    expect(created.statusCode).toBe(200);
    expect(created.json()).toMatchObject({ status: 'signed_in', role: 'owner', name: 'Nadia' });
    const me = await get('/auth/me', cookieOf(created, 'pc_session'));
    expect(me.json().user).toMatchObject({
      role: 'owner',
      name: 'Nadia',
      phone,
      neighbourhood: 'gulshan',
      language: 'bn',
    });
    // the setup token works once
    expect(
      (await post('/auth/profile', { setupToken, name: 'Again', neighbourhood: 'banani' })).json()
        .error.code,
    ).toBe('setup_expired');
  });

  it('only launch neighbourhoods are accepted and a role can never be chosen at sign-up', async () => {
    const { setupToken } = (await signIn('+8801799000002')).json();
    expect(
      (await post('/auth/profile', { setupToken, name: 'X', neighbourhood: 'dhanmondi' }))
        .statusCode,
    ).toBe(400);
    expect(
      (
        await post('/auth/profile', {
          setupToken,
          name: 'X',
          neighbourhood: 'banani',
          role: 'provider',
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (await post('/auth/profile', { setupToken, name: '', neighbourhood: 'banani' })).statusCode,
    ).toBe(400);
    const ok = await post('/auth/profile', { setupToken, name: 'Real', neighbourhood: 'banani' });
    expect(ok.json().role).toBe('owner');
  });

  it('a signup step left too long expires', async () => {
    const { setupToken } = (await signIn('+8801799000003')).json();
    clock.advanceMinutes(11);
    const response = await post('/auth/profile', {
      setupToken,
      name: 'Late',
      neighbourhood: 'banani',
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('setup_expired');
  });

  it('a wrong code is refused clearly and no session starts', async () => {
    await post('/auth/otp/send', { phone: BIBI });
    const real = await codeFor(BIBI);
    const wrong = real === '000000' ? '111111' : '000000';
    const response = await post('/auth/otp/verify', { phone: BIBI, code: wrong });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('wrong_code');
    expect(cookieOf(response, 'pc_session')).toBeUndefined();
    expect((await post('/auth/otp/verify', { phone: BIBI, code: '12' })).json().error.code).toBe(
      'invalid_code',
    );
  });

  it('an expired code is refused (five minutes)', async () => {
    await post('/auth/otp/send', { phone: BIBI });
    const code = await codeFor(BIBI);
    clock.advanceMinutes(6);
    const response = await post('/auth/otp/verify', { phone: BIBI, code });
    expect(response.json().error.code).toBe('expired');
  });

  it('a code cannot be used twice', async () => {
    await post('/auth/otp/send', { phone: BIBI });
    const code = await codeFor(BIBI);
    expect((await post('/auth/otp/verify', { phone: BIBI, code })).statusCode).toBe(200);
    expect((await post('/auth/otp/verify', { phone: BIBI, code })).json().error.code).toBe(
      'already_used',
    );
  });

  it('five wrong codes lock the challenge until a new code is requested', async () => {
    await post('/auth/otp/send', { phone: BIBI });
    const code = await codeFor(BIBI);
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) await post('/auth/otp/verify', { phone: BIBI, code: wrong });
    expect((await post('/auth/otp/verify', { phone: BIBI, code })).json().error.code).toBe(
      'too_many_attempts',
    );
    expect((await signIn(BIBI)).statusCode).toBe(200);
  });

  it('limits how many codes one number can ask for, then allows again later', async () => {
    for (let i = 0; i < 5; i++)
      expect((await post('/auth/otp/send', { phone: BIBI })).statusCode).toBe(202);
    const sixth = await post('/auth/otp/send', { phone: BIBI });
    expect(sixth.statusCode).toBe(429);
    expect(sixth.json().error).toMatchObject({ code: 'too_many_requests', retryAfterMinutes: 10 });
    clock.advanceMinutes(10);
    expect((await post('/auth/otp/send', { phone: BIBI })).statusCode).toBe(202);
  });

  it('when the code service is down sign-in fails safely, nothing is created, and a retry works', async () => {
    await setOtpMode('down');
    const down = await post('/auth/otp/send', { phone: BIBI });
    expect(down.statusCode).toBe(503);
    expect(down.json().error.code).toBe('otp_unavailable');
    expect((await post('/auth/otp/verify', { phone: BIBI, code: '123456' })).statusCode).toBe(503);
    expect((await pool.query('SELECT count(*)::int AS n FROM sessions')).rows[0].n).toBe(0);
    await setOtpMode('none');
    expect((await signIn(BIBI)).statusCode).toBe(200);
  });

  it('a code service that does not answer also fails safely', async () => {
    await setOtpMode('timeout');
    expect((await post('/auth/otp/send', { phone: BIBI })).statusCode).toBe(503);
    await setOtpMode('none');
    expect((await post('/auth/otp/send', { phone: BIBI })).statusCode).toBe(202);
  });

  it('a seeded provider phone gets a provider session and the provider home', async () => {
    const response = await signIn(RASHID);
    expect(response.json()).toMatchObject({
      status: 'signed_in',
      role: 'provider',
      name: 'Rashid',
      redirect: '/provider',
    });
    expect((await get('/provider/me', cookieOf(response, 'pc_session'))).json().user).toMatchObject(
      { role: 'provider', neighbourhood: 'gulshan' },
    );
  });

  it('an unknown number can never become a provider', async () => {
    const { setupToken } = (await signIn('+8801799000009')).json();
    const created = await post('/auth/profile', {
      setupToken,
      name: 'Pretender',
      neighbourhood: 'gulshan',
    });
    expect(created.json().role).toBe('owner');
    expect((await get('/provider/me', cookieOf(created, 'pc_session'))).statusCode).toBe(403);
  });

  it('sign-out ends the session and the cookie value is never stored as is', async () => {
    const response = await signIn(BIBI);
    const cookie = cookieOf(response, 'pc_session')!;
    const stored = (await pool.query('SELECT token_hash FROM sessions')).rows[0]
      .token_hash as string;
    expect(stored).toMatch(/^[0-9a-f]{64}$/);
    expect(cookie).not.toContain(stored);
    const out = await post('/auth/sign-out', {}, cookie);
    expect(out.json()).toEqual({ status: 'signed_out' });
    expect((await get('/auth/me', cookie)).statusCode).toBe(401);
    expect((await pool.query('SELECT count(*)::int AS n FROM sessions')).rows[0].n).toBe(0);
  });

  it('a session lasts 14 days and then is gone', async () => {
    const cookie = cookieOf(await signIn(BIBI), 'pc_session')!;
    clock.advanceMinutes(13 * 24 * 60);
    expect((await get('/auth/me', cookie)).statusCode).toBe(200);
    clock.advanceMinutes(2 * 24 * 60);
    expect((await get('/auth/me', cookie)).statusCode).toBe(401);
  });

  it('a made-up cookie is not a session', async () => {
    expect((await get('/auth/me', 'pc_session=not-a-real-token')).statusCode).toBe(401);
  });
});

describe('ACC-02 admin sign-in, role guards and audit', () => {
  const adminSignIn = (email = ADMIN.email, password = ADMIN.password) =>
    post('/admin/auth/sign-in', { email, password });

  it('the admin signs in with a separate cookie and a 12 hour session', async () => {
    const response = await adminSignIn();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'signed_in',
      name: 'Ayaat',
      redirect: '/admin',
    });
    const cookie = response.cookies.find((c) => c.name === 'pc_admin_session')!;
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'Lax', path: '/' });
    expect(response.cookies.find((c) => c.name === 'pc_session')).toBeUndefined();
    const header = `pc_admin_session=${cookie.value}`;
    expect((await get('/admin/auth/me', header)).json().user).toMatchObject({
      role: 'admin',
      name: 'Ayaat',
      email: ADMIN.email,
    });
    clock.advanceMinutes(11 * 60);
    expect((await get('/admin/me', header)).statusCode).toBe(200);
    clock.advanceMinutes(2 * 60);
    expect((await get('/admin/me', header)).statusCode).toBe(401);
  });

  it('a wrong password and an unknown email get the same answer', async () => {
    const wrongPassword = await adminSignIn(ADMIN.email, 'nope');
    const unknownEmail = await adminSignIn('nobody@petcare.training', 'nope');
    expect(wrongPassword.statusCode).toBe(401);
    expect(unknownEmail.statusCode).toBe(401);
    expect(unknownEmail.json()).toEqual(wrongPassword.json());
    expect(wrongPassword.cookies).toHaveLength(0);
    expect((await post('/admin/auth/sign-in', { email: 'not-an-email' })).statusCode).toBe(401);
  });

  it('limits repeated tries on one account', async () => {
    for (let i = 0; i < 5; i++) await adminSignIn(ADMIN.email, 'wrong');
    expect((await adminSignIn()).statusCode).toBe(429);
    clock.advanceMinutes(10);
    expect((await adminSignIn()).statusCode).toBe(200);
  });

  it('stores the password hashed and never returns it', async () => {
    const response = await adminSignIn();
    expect(response.body).not.toContain(ADMIN.password);
    expect(response.body).not.toMatch(/scrypt|password/i);
    const row = (await pool.query("SELECT password_hash FROM admin_users WHERE id = 'ayaat'"))
      .rows[0].password_hash as string;
    expect(row).toMatch(/^scrypt\$/);
    expect(row).not.toContain(ADMIN.password);
  });

  it('writes every sign-in, failed sign-in and sign-out to the append-only audit log', async () => {
    const since = await lastLogId();
    await adminSignIn(ADMIN.email, 'wrong');
    const cookie = cookieOf(await adminSignIn(), 'pc_admin_session')!;
    await post('/admin/auth/sign-out', {}, cookie);
    expect(await auditRows(since)).toEqual([
      { actor: 'anonymous', action: 'admin.sign_in_failed', target_id: ADMIN.email },
      { actor: 'admin:ayaat', action: 'admin.sign_in', target_id: 'ayaat' },
      { actor: 'admin:ayaat', action: 'admin.sign_out', target_id: 'ayaat' },
    ]);
    expect((await get('/admin/me', cookie)).statusCode).toBe(401);
    await expect(pool.query("UPDATE event_log SET action = 'x'")).rejects.toThrow(/append-only/);
  });

  it('the shared helper records any later admin action with the admin identity', async () => {
    await recordAdminAction(db, {
      adminId: 'ayaat',
      action: 'provider.approve',
      reasonCode: 'vetting-complete',
      targetType: 'provider',
      targetId: 'rashid',
    });
    const row = (
      await pool.query(
        "SELECT actor, kind, reason_code FROM event_log WHERE action = 'provider.approve'",
      )
    ).rows[0];
    expect(row).toEqual({ actor: 'admin:ayaat', kind: 'audit', reason_code: 'vetting-complete' });
  });

  it('a second admin needs no schema change (FR-31)', async () => {
    await db.insert(adminUsers).values({
      id: 'second',
      name: 'Second Admin',
      email: 'second@petcare.training',
      passwordHash: await hashPassword('second-pass'),
    });
    const response = await adminSignIn('second@petcare.training', 'second-pass');
    expect(response.json().name).toBe('Second Admin');
    expect((await get('/admin/me', cookieOf(response, 'pc_admin_session'))).json().user.id).toBe(
      'second',
    );
  });
});

describe('DR-3 role guards (who may open what)', () => {
  type Who = 'guest' | 'owner' | 'provider' | 'admin';
  const cookies: Partial<Record<Who, string>> = {};

  beforeEach(async () => {
    cookies.owner = cookieOf(await signIn(BIBI), 'pc_session');
    await fetch(`${dummyUrl}/_training/reset-all`, { method: 'POST' });
    cookies.provider = cookieOf(await signIn(RASHID), 'pc_session');
    cookies.admin = cookieOf(await post('/admin/auth/sign-in', ADMIN), 'pc_admin_session');
  });

  const expectations: Array<[string, Record<Who, number>]> = [
    ['/auth/me', { guest: 401, owner: 200, provider: 200, admin: 403 }],
    ['/owner/me', { guest: 401, owner: 200, provider: 403, admin: 403 }],
    ['/provider/me', { guest: 401, owner: 403, provider: 200, admin: 403 }],
    ['/admin/me', { guest: 401, owner: 403, provider: 403, admin: 200 }],
    ['/admin/auth/me', { guest: 401, owner: 403, provider: 403, admin: 200 }],
  ];

  for (const [url, byRole] of expectations) {
    for (const who of Object.keys(byRole) as Who[]) {
      it(`${url} as ${who} is ${byRole[who]}`, async () => {
        const response = await get(url, who === 'guest' ? undefined : cookies[who]);
        expect(response.statusCode).toBe(byRole[who]);
        if (byRole[who] === 403) expect(response.json().error.code).toBe('wrong_role');
        if (byRole[who] === 401) expect(response.json().error.code).toBe('not_signed_in');
      });
    }
  }

  it('an owner and an admin session can both be held without one standing in for the other', async () => {
    const both = `${cookies.owner}; ${cookies.admin}`;
    expect((await get('/owner/me', both)).json().user.role).toBe('owner');
    expect((await get('/admin/me', both)).json().user.role).toBe('admin');
  });
});

describe('the append-only log helper used by auditing', () => {
  it('refuses an entry without an actor', async () => {
    await expect(
      appendLogEntry(db, { kind: 'audit', actor: '', action: 'x', targetType: 't', targetId: '1' }),
    ).rejects.toThrow();
    expect((await db.execute(sql`select 1 as ok`)).rows[0]).toEqual({ ok: 1 });
  });
});
