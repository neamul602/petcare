/**
 * Before the browser tests: recreate the end-to-end database with the labelled training seed, then
 * sign in once as an owner, a provider and the admin through the real API and save each browser
 * session to tests/e2e/.auth/<role>.json so the other specs can open protected pages.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { runSeed } from '../../apps/api/src/seed/run.ts';

const API = 'http://localhost:3000';
const DUMMY = 'http://localhost:4100';
const AUTH_DIR = new URL('./.auth/', import.meta.url);

type SetCookie = { name: string; value: string; expires: number };

function parseCookies(response: Response): SetCookie[] {
  return response.headers.getSetCookie().map((raw) => {
    const [pair = '', ...attributes] = raw.split(';').map((part) => part.trim());
    const [name = '', ...value] = pair.split('=');
    const expires = attributes.find((a) => a.toLowerCase().startsWith('expires='));
    return {
      name,
      value: value.join('='),
      expires: expires ? Date.parse(expires.slice(8)) / 1000 : -1,
    };
  });
}

const json = (body: unknown) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

async function waitFor(url: string) {
  for (let i = 0; i < 60; i++) {
    if (
      await fetch(url)
        .then((r) => r.ok)
        .catch(() => false)
    )
      return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${url} did not start`);
}

async function codeFor(phone: string) {
  const { state } = (await (await fetch(`${DUMMY}/_training/otp/inspect`)).json()) as {
    state: { challenges: Array<{ phone: string; code: string }> };
  };
  return state.challenges.find((c) => c.phone === phone)!.code;
}

async function userCookies(phone: string, profile?: { name: string; neighbourhood: string }) {
  await fetch(`${API}/auth/otp/send`, json({ phone }));
  let verified = await fetch(`${API}/auth/otp/verify`, json({ phone, code: await codeFor(phone) }));
  const body = (await verified.clone().json()) as { status: string; setupToken?: string };
  if (body.status === 'profile_needed')
    verified = await fetch(
      `${API}/auth/profile`,
      json({ setupToken: body.setupToken, ...profile }),
    );
  return parseCookies(verified);
}

function save(role: string, cookies: SetCookie[]) {
  const state = {
    cookies: cookies.map((c) => ({
      ...c,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax' as const,
    })),
    origins: [],
  };
  writeFileSync(new URL(`${role}.json`, AUTH_DIR), JSON.stringify(state));
}

export default async function globalSetup() {
  await runSeed({
    databaseUrl: 'postgres://petcare:petcare@localhost:5433/petcare_e2e',
    dummyUrl: DUMMY,
    adminPassword: process.env.ADMIN_TRAINING_PASSWORD ?? 'training-admin-pass',
  }).catch((error: unknown) => {
    throw new Error(
      'Could not prepare the end-to-end database. Is PostgreSQL running? Try "npm run db:up".',
      { cause: error },
    );
  });
  await Promise.all([waitFor(`${API}/health`), waitFor(`${DUMMY}/health`)]);
  mkdirSync(AUTH_DIR, { recursive: true });

  save(
    'owner',
    await userCookies('+8801799000100', { name: 'E2E Owner', neighbourhood: 'banani' }),
  );
  save('provider', await userCookies('+8801712000002'));
  save('bibi', await userCookies('+8801712000001')); // the training owner with Tito (pet specs)
  const admin = await fetch(
    `${API}/admin/auth/sign-in`,
    json({
      email: 'ayaat@petcare.training',
      password: process.env.ADMIN_TRAINING_PASSWORD ?? 'training-admin-pass',
    }),
  );
  save('admin', parseCookies(admin));
  await fetch(`${DUMMY}/_training/reset-all`, { method: 'POST' });
}
