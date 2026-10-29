/** Apply all migrations in ./drizzle to the configured database. */
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import { loadRuntimeConfig } from '../config.ts';
import { createDatabase } from './client.ts';

const { DATABASE_URL } = loadRuntimeConfig();
const { db, pool } = createDatabase(DATABASE_URL);
try {
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)) });
  console.log('Migrations applied');
} finally {
  await pool.end();
}
