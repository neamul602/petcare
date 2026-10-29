import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index.ts';

export type Database = ReturnType<typeof createDatabase>['db'];

/** Create a connection pool and a typed Drizzle client for one database URL. */
export function createDatabase(databaseUrl: string) {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });
  return { db, pool };
}
