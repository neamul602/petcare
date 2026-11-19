/**
 * Email + password accounts with JWT. Anyone can sign up as an owner or a provider and sign in; the token
 * says who they are. Admins (and the superuser) can list users and promote any user to admin.
 */
import { eq, or } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { platformRules } from '@petcare/shared/config';
import { adminUsers, providers, users, vettingRecords } from '../db/schema/index.ts';
import { appendLogEntry } from '../log/append.ts';
import { recordAdminAction } from './audit.ts';
import type { AuthDeps } from './routes.ts';
import { JWT_COOKIE, JWT_HOURS, signJwt, type JwtPayload } from './jwt.ts';
import { hashPassword, verifyPassword } from './passwords.ts';

const email = z.string().trim().toLowerCase().email();
const signUpBody = z.strictObject({
  name: z.string().trim().min(1).max(80),
  email,
  password: z.string().min(8).max(200),
  role: z.enum(['owner', 'provider']),
  neighbourhood: z.enum(platformRules.launchNeighbourhoods as unknown as [string, ...string[]]),
  language: z.enum(['bn', 'en']).optional(),
});
const signInBody = z.strictObject({ email, password: z.string().min(1).max(200) });

export async function registerAccountRoutes(app: FastifyInstance, deps: AuthDeps) {
  const { db, limiter, authn } = deps;
  const secure = process.env.NODE_ENV === 'production';
  const decoyHash = await hashPassword('not-a-real-password');

  const issue = (reply: FastifyReply, payload: Omit<JwtPayload, 'exp'>) => {
    const token = signJwt(payload);
    reply.setCookie(JWT_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure,
      maxAge: JWT_HOURS * 3600,
    });
    return token;
  };
  const home = (role: string) =>
    role === 'provider' ? '/provider' : role === 'owner' ? '/' : '/admin';

  app.post('/auth/signup', async (request, reply) => {
    const body = signUpBody.parse(request.body);
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.email));
    const [takenAdmin] = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.email, body.email));
    if (taken || takenAdmin)
      return reply
        .code(409)
        .send({ error: { code: 'email_taken', message: 'That email already has an account' } });
    const id = `${body.role}_${randomUUID()}`;
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id,
        role: body.role,
        email: body.email,
        passwordHash: await hashPassword(body.password),
        name: body.name,
        neighbourhoodId: body.neighbourhood,
        language: body.language ?? 'en',
      });
      if (body.role === 'provider') {
        await tx.insert(providers).values({
          id,
          userId: id,
          slug: `${
            body.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '') || 'provider'
          }-${id.slice(-6)}`,
          nameEn: body.name,
          nameBn: body.name,
          tier: 'B',
          status: 'applied',
          neighbourhoodId: body.neighbourhood,
          species: ['dog', 'cat'],
        });
        await tx.insert(vettingRecords).values({ providerId: id });
      }
    });
    const token = issue(reply, { sub: id, kind: 'user', role: body.role });
    return reply.code(201).send({
      status: 'signed_in',
      token,
      role: body.role,
      name: body.name,
      redirect: home(body.role),
    });
  });

  app.post('/auth/signin', async (request, reply) => {
    const parsed = signInBody.safeParse(request.body);
    const bad = () =>
      reply.code(401).send({
        error: { code: 'invalid_credentials', message: 'The email or password is not right' },
      });
    if (!parsed.success) return bad();
    const { email: address, password } = parsed.data;
    if (!limiter.allow(`signin:${address}`))
      return reply.code(429).send({
        error: {
          code: 'too_many_requests',
          message: 'Too many attempts; try again in a few minutes',
        },
      });
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, address));
    const [user] = admin ? [] : await db.select().from(users).where(eq(users.email, address));
    const stored = admin?.passwordHash ?? user?.passwordHash ?? decoyHash;
    if (!(await verifyPassword(password, stored)) || (!admin && !user)) return bad();
    if (admin) {
      const role = admin.isSuperuser ? 'superuser' : 'admin';
      const token = issue(reply, { sub: admin.id, kind: 'admin', role });
      await recordAdminAction(db, {
        adminId: admin.id,
        action: 'admin.sign_in',
        targetType: 'admin',
        targetId: admin.id,
      });
      return { status: 'signed_in', token, role, name: admin.name, redirect: '/admin' };
    }
    const token = issue(reply, { sub: user!.id, kind: 'user', role: user!.role });
    return {
      status: 'signed_in',
      token,
      role: user!.role,
      name: user!.name,
      redirect: home(user!.role),
    };
  });

  const admins = authn.requireRole('admin');

  /** Everyone who can be promoted, newest first, with whether they are already an admin. */
  app.get('/admin/users', { preHandler: admins }, async () => {
    const [people, adminRows] = await Promise.all([
      db.select().from(users),
      db.select().from(adminUsers),
    ]);
    const adminIds = new Map(adminRows.map((a) => [a.id, a]));
    return {
      users: [
        ...adminRows.map((a) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          role: a.isSuperuser ? 'superuser' : 'admin',
          isAdmin: true,
        })),
        ...people
          .filter((u) => !adminIds.has(u.id))
          .map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email ?? null,
            role: u.role,
            isAdmin: false,
          })),
      ],
    };
  });

  /** The superuser or any admin makes a user an admin. The user keeps their account and signs in again to get the admin token. */
  app.post('/admin/users/:id/make-admin', { preHandler: admins }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user)
      return reply.code(404).send({ error: { code: 'not_found', message: 'No such user' } });
    if (!user.email || !user.passwordHash)
      return reply.code(409).send({
        error: {
          code: 'no_password_account',
          message: 'This user has no email account yet, so they cannot sign in as admin',
        },
      });
    const [already] = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(or(eq(adminUsers.id, user.id), eq(adminUsers.email, user.email)));
    if (already) return { status: 'already_admin', id: user.id };
    await db.insert(adminUsers).values({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    });
    await recordAdminAction(db, {
      adminId: request.currentUser!.id,
      action: 'admin.make_admin',
      targetType: 'user',
      targetId: user.id,
    });
    await appendLogEntry(db, {
      kind: 'audit',
      actor: `admin:${request.currentUser!.id}`,
      action: 'user.promoted',
      targetType: 'user',
      targetId: user.id,
    });
    return reply.code(201).send({ status: 'admin_created', id: user.id });
  });
}
