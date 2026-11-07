/** Admin sign-in: separate identity, separate cookie, shorter session, every sign-in audited (FR-31, FR-37). */
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { platformRules } from '@petcare/shared/config';
import { adminUsers } from '../db/schema/index.ts';
import { appendLogEntry } from '../log/append.ts';
import { recordAdminAction } from './audit.ts';
import type { AuthDeps } from './routes.ts';
import { JWT_COOKIE } from './jwt.ts';
import { hashPassword, verifyPassword } from './passwords.ts';
import { ADMIN_COOKIE } from './sessions.ts';

const signInBody = z.strictObject({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export async function registerAdminRoutes(app: FastifyInstance, deps: AuthDeps) {
  const { db, store, limiter, authn } = deps;
  const secure = process.env.NODE_ENV === 'production';
  // Checked against when the email is unknown, so a wrong email and a wrong password take equally long.
  const decoyHash = await hashPassword('not-a-real-password');

  app.post('/admin/auth/sign-in', async (request, reply) => {
    const parsed = signInBody.safeParse(request.body);
    if (!parsed.success)
      return reply.code(401).send({
        error: { code: 'invalid_credentials', message: 'The email or password is not right' },
      });
    const { email, password } = parsed.data;
    if (!limiter.allow(`admin:${email}`)) {
      return reply.code(429).send({
        error: {
          code: 'too_many_requests',
          message: 'Too many attempts; try again in a few minutes',
        },
      });
    }
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    const valid = await verifyPassword(password, admin?.passwordHash ?? decoyHash);
    if (!admin || !valid) {
      await appendLogEntry(db, {
        kind: 'audit',
        actor: 'anonymous',
        action: 'admin.sign_in_failed',
        targetType: 'admin_email',
        targetId: email,
      });
      return reply.code(401).send({
        error: { code: 'invalid_credentials', message: 'The email or password is not right' },
      });
    }
    const { token, expiresAt } = await store.create(
      'admin',
      admin.id,
      platformRules.auth.adminSessionHours * 60 * 60_000,
    );
    reply.setCookie(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure,
      expires: expiresAt,
    });
    await recordAdminAction(db, {
      adminId: admin.id,
      action: 'admin.sign_in',
      targetType: 'admin',
      targetId: admin.id,
    });
    return { status: 'signed_in', name: admin.name, redirect: '/admin' };
  });

  app.post('/admin/auth/sign-out', async (request, reply) => {
    const token = request.cookies[ADMIN_COOKIE];
    const session = await store.find('admin', token);
    if (session)
      await recordAdminAction(db, {
        adminId: session.subjectId,
        action: 'admin.sign_out',
        targetType: 'admin',
        targetId: session.subjectId,
      });
    await store.destroy(token);
    reply.clearCookie(ADMIN_COOKIE, { path: '/' });
    reply.clearCookie(JWT_COOKIE, { path: '/' });
    return { status: 'signed_out' };
  });

  app.get('/admin/auth/me', { preHandler: authn.requireRole('admin') }, async (request) => ({
    user: request.currentUser,
  }));
  app.get('/admin/me', { preHandler: authn.requireRole('admin') }, async (request) => ({
    user: request.currentUser,
  }));
}
