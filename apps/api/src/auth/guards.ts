/**
 * Role guards (DR-3). No session is 401, the wrong role is 403. Owner/provider sessions and admin
 * sessions use separate cookies and tables, so one can never stand in for the other.
 */
import { eq } from 'drizzle-orm';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Database } from '../db/client.ts';
import { adminUsers, users } from '../db/schema/index.ts';
import { tokenFrom, verifyJwt } from './jwt.ts';
import { ADMIN_COOKIE, USER_COOKIE, type SessionStore } from './sessions.ts';

export type Role = 'owner' | 'provider' | 'admin';

export interface CurrentUser {
  role: Role;
  /** True for the first admin, who can also promote users. */
  isSuperuser?: boolean;
  id: string;
  name: string;
  phone?: string;
  email?: string;
  neighbourhood?: string | null;
  language?: 'bn' | 'en';
}

declare module 'fastify' {
  interface FastifyRequest {
    currentUser?: CurrentUser;
  }
}

const refusal = (code: string, message: string) => ({ error: { code, message } });

export function createAuthenticator(db: Database, store: SessionStore) {
  async function loadAdmin(request: FastifyRequest): Promise<CurrentUser | null> {
    const session = await store.find('admin', request.cookies[ADMIN_COOKIE]);
    const jwt = verifyJwt(tokenFrom(request));
    const adminId = session?.subjectId ?? (jwt?.kind === 'admin' ? jwt.sub : null);
    if (!adminId) return null;
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, adminId));
    return admin
      ? {
          role: 'admin',
          id: admin.id,
          name: admin.name,
          email: admin.email,
          isSuperuser: admin.isSuperuser,
        }
      : null;
  }

  async function loadUser(request: FastifyRequest): Promise<CurrentUser | null> {
    const session = await store.find('user', request.cookies[USER_COOKIE]);
    const jwt = verifyJwt(tokenFrom(request));
    const userId = session?.subjectId ?? (jwt?.kind === 'user' ? jwt.sub : null);
    if (!userId) return null;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user
      ? {
          role: user.role,
          id: user.id,
          name: user.name,
          phone: user.phone ?? undefined,
          email: user.email ?? undefined,
          neighbourhood: user.neighbourhoodId,
          language: user.language,
        }
      : null;
  }

  /**
   * Allows only the listed roles. Admin routes accept only an admin session and the others only an
   * owner/provider session; a valid session of the other kind gets 403, no session at all gets 401.
   */
  function requireRole(...roles: Role[]) {
    const wantsAdmin = roles.includes('admin');
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const [admin, user] = await Promise.all([loadAdmin(request), loadUser(request)]);
      const person = wantsAdmin ? admin : user;
      if (!person) {
        return admin || user
          ? reply.code(403).send(refusal('wrong_role', 'This account cannot open this area'))
          : reply.code(401).send(refusal('not_signed_in', 'Sign in to continue'));
      }
      if (!roles.includes(person.role))
        return reply.code(403).send(refusal('wrong_role', 'This account cannot open this area'));
      request.currentUser = person;
    };
  }

  return { requireRole };
}

export type Authenticator = ReturnType<typeof createAuthenticator>;
