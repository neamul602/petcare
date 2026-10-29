/**
 * Recreates the training database and loads the labelled seed (workbook Step 17).
 *   npm run seed                 reset the database, load the seed, reset the Dummy services if running
 *   npm run seed -- --no-dummy   leave the Dummy services alone
 * Training use only: it refuses to touch a database that is not on this machine.
 */
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { loadSeed, type Seed } from '@petcare/shared/seed';
import * as schema from '../db/schema/index.ts';
import { DEFAULT_TRAINING_ADMIN_PASSWORD, loadPeople } from './load-people.ts';

const SEED_DIR = fileURLToPath(new URL('../../../../packages/shared/seed', import.meta.url));
const MIGRATIONS_DIR = fileURLToPath(new URL('../../drizzle', import.meta.url));
const DEFAULT_DATABASE_URL = 'postgres://petcare:petcare@localhost:5433/petcare';
const DEFAULT_DUMMY_URL = 'http://localhost:4100';

export interface SeedSummary {
  database: string;
  neighbourhoods: number;
  vetClinics: number;
  accounts: { owners: number; providerAccounts: number; admins: number };
  validatedForLaterBolts: {
    pets: number;
    approvedProviders: number;
    pendingApplications: number;
  };
  dummyServices: 'reset' | 'not running' | 'skipped';
}

export interface SeedOptions {
  databaseUrl?: string;
  dummyUrl?: string | null;
  seedDir?: string;
  /** Training-only admin password (defaults to ADMIN_TRAINING_PASSWORD, then a documented training value). */
  adminPassword?: string;
}

function databaseName(url: URL): string {
  return decodeURIComponent(url.pathname.replace(/^\//, ''));
}

export async function runSeed(options: SeedOptions = {}): Promise<SeedSummary> {
  const databaseUrl = new URL(
    options.databaseUrl ?? process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  );
  if (!['localhost', '127.0.0.1', '::1'].includes(databaseUrl.hostname)) {
    throw new Error(
      `Refusing to reset a database on ${databaseUrl.hostname}: the training seed only runs on this machine`,
    );
  }
  const name = databaseName(databaseUrl);
  if (!/^[a-z0-9_]+$/.test(name)) throw new Error(`Unsafe database name "${name}"`);

  const seed: Seed = loadSeed(options.seedDir ?? SEED_DIR); // validate before touching anything

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';
  const admin = new pg.Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${name}"`);
  } finally {
    await admin.end();
  }

  let accounts: SeedSummary['accounts'] = { owners: 0, providerAccounts: 0, admins: 0 };
  const pool = new pg.Pool({ connectionString: databaseUrl.toString() });
  try {
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
    await db.transaction(async (tx) => {
      await tx.insert(schema.neighbourhoods).values(
        seed.neighbourhoods.neighbourhoods.map((item) => ({
          id: item.id,
          nameEn: item.name.en,
          nameBn: item.name.bn,
        })),
      );
      await tx.insert(schema.vetClinics).values(
        seed.vetClinics.clinics.map((clinic) => ({
          id: clinic.id,
          neighbourhoodId: clinic.neighbourhood,
          nameEn: clinic.name.en,
          nameBn: clinic.name.bn,
          addressEn: clinic.address.en,
          addressBn: clinic.address.bn,
          phone: clinic.phone,
          hoursEn: clinic.hours.en,
          hoursBn: clinic.hours.bn,
          species: clinic.species,
        })),
      );
      accounts = await loadPeople(
        tx,
        seed,
        options.adminPassword ??
          process.env.ADMIN_TRAINING_PASSWORD ??
          DEFAULT_TRAINING_ADMIN_PASSWORD,
      );
    });
  } finally {
    await pool.end();
  }

  let dummyServices: SeedSummary['dummyServices'] = 'skipped';
  if (options.dummyUrl !== null) {
    try {
      const response = await fetch(`${options.dummyUrl ?? DEFAULT_DUMMY_URL}/_training/reset-all`, {
        method: 'POST',
        signal: AbortSignal.timeout(1500),
      });
      dummyServices = response.ok ? 'reset' : 'not running';
    } catch {
      dummyServices = 'not running';
    }
  }

  return {
    database: name,
    neighbourhoods: seed.neighbourhoods.neighbourhoods.length,
    vetClinics: seed.vetClinics.clinics.length,
    accounts,
    validatedForLaterBolts: {
      pets: seed.pets.pets.length,
      approvedProviders: seed.providers.providers.length,
      pendingApplications: seed.providers.applications.length,
    },
    dummyServices,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const summary = await runSeed({
    dummyUrl: process.argv.includes('--no-dummy') ? null : undefined,
  });
  console.log('Training seed loaded (all records are labelled TRAINING DATA):');
  console.log(JSON.stringify(summary, null, 2));
  console.log(
    'Owners, pets, providers and the admin are validated now and are loaded by the bolts that create their tables.',
  );
}
