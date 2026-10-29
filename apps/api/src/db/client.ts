import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index.ts';

export type Database = ReturnType<typeof createDatabase>['db'];

/** Create a connection pool and a typed Drizzle client for one database URL. */
export function createDatabase(databaseUrl: string) {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  // A dropped connection (database restarted or recreated) must not crash the API; the pool reconnects.
  pool.on('error', (error) => console.error('Database connection error:', error.message));
  const db = drizzle(pool, { schema });
  return { db, pool };
}
