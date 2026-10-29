/**
 * Integration test against a real PostgreSQL (docker compose): the event log accepts new
 * entries and rejects every attempt to change or remove them (NFR-21..NFR-23).
 * Uses a separate database, recreated for each run.
 */
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDatabase, type Database } from '../db/client.ts';
import { appendLogEntry } from './append.ts';

const ADMIN_URL = process.env.DATABASE_URL ?? 'postgres://petcare:petcare@localhost:5433/petcare';
const TEST_DB = 'petcare_test_event_log';
const TEST_URL = ADMIN_URL.replace(/\/[^/]+$/, `/${TEST_DB}`);

let db: Database;
let pool: pg.Pool;

beforeAll(async () => {
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  try {
    await admin.connect();
  } catch (error) {
    throw new Error(`PostgreSQL is not reachable at ${ADMIN_URL}; run "npm run db:up" first.`, {
      cause: error,
    });
  }
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await admin.query(`CREATE DATABASE ${TEST_DB}`);
  await admin.end();
  ({ db, pool } = createDatabase(TEST_URL));
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)) });
});

afterAll(async () => {
  await pool?.end();
});

describe('append-only event log', () => {
  it('stores an audit entry with actor, action, reason and target', async () => {
    const row = await appendLogEntry(db, {
      kind: 'audit',
      actor: 'admin:ayaat',
      action: 'provider.approve',
      reasonCode: 'vetting-complete',
      targetType: 'provider',
      targetId: 'rashid',
    });
    expect(row).toMatchObject({
      kind: 'audit',
      actor: 'admin:ayaat',
      reasonCode: 'vetting-complete',
    });
    expect(row?.createdAt).toBeInstanceOf(Date);
  });

  it('rejects UPDATE', async () => {
    await expect(pool.query("UPDATE event_log SET action = 'changed'")).rejects.toThrow(
      /append-only: UPDATE/,
    );
  });

  it('rejects DELETE', async () => {
    await expect(pool.query('DELETE FROM event_log')).rejects.toThrow(/append-only: DELETE/);
  });

  it('rejects TRUNCATE', async () => {
    await expect(pool.query('TRUNCATE event_log')).rejects.toThrow(/append-only: TRUNCATE/);
  });

  it('refuses an entry without an actor or target', async () => {
    await expect(
      appendLogEntry(db, {
        kind: 'audit',
        actor: '',
        action: 'x',
        targetType: 'provider',
        targetId: '1',
      }),
    ).rejects.toThrow(/needs an actor/);
  });

  it('kept every entry', async () => {
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM event_log');
    expect(rows[0].n).toBe(1);
  });
});
