/** Integration test against real PostgreSQL: the seed recreates a database and loads the labelled data. */
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runSeed } from './run.ts';

const BASE = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_seed';
const TEST_URL = BASE.replace(/\/[^/]+$/, `/${TEST_DB}`);

const count = async (sql: string) => {
  const pool = new pg.Pool({ connectionString: TEST_URL });
  try {
    return (await pool.query<{ n: number }>(sql)).rows[0]!.n;
  } finally {
    await pool.end();
  }
};

beforeAll(async () => {
  const probe = new pg.Client({ connectionString: BASE });
  await probe.connect().catch((error: unknown) => {
    throw new Error(`PostgreSQL is not reachable; run "npm run db:up" first.`, { cause: error });
  });
  await probe.end();
});

afterAll(async () => {
  const admin = new pg.Client({ connectionString: BASE.replace(/\/[^/]+$/, '/postgres') });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await admin.end();
});

describe('npm run seed (FND-07)', () => {
  it('creates the database, loads neighbourhoods and vet clinics, all labelled as training data', async () => {
    const summary = await runSeed({ databaseUrl: TEST_URL, dummyUrl: null });
    expect(summary).toMatchObject({
      database: TEST_DB,
      neighbourhoods: 3,
      vetClinics: 6,
      dummyServices: 'skipped',
    });
    expect(summary.accounts).toEqual({ owners: 1, providerAccounts: 4, admins: 1 });
    expect(summary.validatedForLaterBolts).toEqual({
      pets: 1,
      approvedProviders: 4,
      pendingApplications: 1,
    });
    expect(await count('SELECT count(*)::int AS n FROM users')).toBe(5);
    expect(await count("SELECT count(*)::int AS n FROM users WHERE role = 'provider'")).toBe(4);
    expect(await count('SELECT count(*)::int AS n FROM admin_users')).toBe(1);
    expect(
      await count(
        "SELECT count(*)::int AS n FROM admin_users WHERE password_hash NOT LIKE 'scrypt$%'",
      ),
    ).toBe(0);
    expect(await count('SELECT count(*)::int AS n FROM neighbourhoods')).toBe(3);
    expect(await count('SELECT count(*)::int AS n FROM vet_clinics')).toBe(6);
    expect(await count('SELECT count(*)::int AS n FROM vet_clinics WHERE is_training_data')).toBe(
      6,
    );
    expect(await count('SELECT count(*)::int AS n FROM event_log')).toBe(0);
  });

  it('gives the same state when run twice and removes anything added in between', async () => {
    await runSeed({ databaseUrl: TEST_URL, dummyUrl: null });
    const pool = new pg.Pool({ connectionString: TEST_URL });
    await pool.query(
      "INSERT INTO event_log(kind, actor, action, target_type, target_id) VALUES ('audit','test','x','t','1')",
    );
    await pool.end();
    expect(await count('SELECT count(*)::int AS n FROM event_log')).toBe(1);
    await runSeed({ databaseUrl: TEST_URL, dummyUrl: null });
    expect(await count('SELECT count(*)::int AS n FROM neighbourhoods')).toBe(3);
    expect(await count('SELECT count(*)::int AS n FROM vet_clinics')).toBe(6);
    expect(await count('SELECT count(*)::int AS n FROM event_log')).toBe(0);
  });

  it('refuses to reset a database that is not on this machine', async () => {
    await expect(
      runSeed({ databaseUrl: 'postgres://u:p@db.example.com:5432/petcare', dummyUrl: null }),
    ).rejects.toThrow(/only runs on this machine/);
  });

  it('refuses an unsafe database name', async () => {
    await expect(
      runSeed({ databaseUrl: 'postgres://u:p@localhost:5433/pet%22care', dummyUrl: null }),
    ).rejects.toThrow(/Unsafe database name/);
  });

  it('resets the Dummy services when they are running', async () => {
    const { buildDummyApp } = await import('../../../dummy-services/src/app.ts');
    const dummy = buildDummyApp();
    await dummy.listen({ port: 0, host: '127.0.0.1' });
    const address = dummy.server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    await fetch(`http://127.0.0.1:${port}/_training/payments/failure-mode`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'down' }),
    });
    const summary = await runSeed({ databaseUrl: TEST_URL, dummyUrl: `http://127.0.0.1:${port}` });
    expect(summary.dummyServices).toBe('reset');
    const mode = await (
      await fetch(`http://127.0.0.1:${port}/_training/payments/failure-mode`)
    ).json();
    expect(mode.mode).toBe('none');
    await dummy.close();
  });
});
