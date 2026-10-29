/**
 * Sessions: a random token goes to the browser in an httpOnly cookie; only its SHA-256 hash is
 * stored, so a copy of the database cannot be replayed as a login.
 */
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import type { Clock } from '@petcare/shared/clock';
import type { Database } from '../db/client.ts';
import { sessions } from '../db/schema/index.ts';

export const USER_COOKIE = 'pc_session';
export const ADMIN_COOKIE = 'pc_admin_session';

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const newToken = () => randomBytes(32).toString('base64url');

export interface SessionStore {
  create(
    subjectType: 'user' | 'admin',
    subjectId: string,
    lifetimeMs: number,
  ): Promise<{ token: string; expiresAt: Date }>;
  find(
    subjectType: 'user' | 'admin',
    token: string | undefined,
  ): Promise<{ subjectId: string } | null>;
  destroy(token: string | undefined): Promise<void>;
}

export function createSessionStore(db: Database, clock: Clock): SessionStore {
  return {
    async create(subjectType, subjectId, lifetimeMs) {
      const token = newToken();
      const expiresAt = new Date(clock.now().getTime() + lifetimeMs);
      await db
        .insert(sessions)
        .values({ tokenHash: hashToken(token), subjectType, subjectId, expiresAt });
      return { token, expiresAt };
    },
    async find(subjectType, token) {
      if (!token) return null;
      const [row] = await db
        .select({ subjectId: sessions.subjectId })
        .from(sessions)
        .where(
          and(
            eq(sessions.tokenHash, hashToken(token)),
            eq(sessions.subjectType, subjectType),
            gt(sessions.expiresAt, clock.now()),
          ),
        );
      return row ?? null;
    },
    async destroy(token) {
      if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
    },
  };
}
