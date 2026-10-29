/** Sign-in for owners and providers: phone number, one-time code, then (first time only) name and neighbourhood. */
import { eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { platformRules } from '@petcare/shared/config';
import type { Clock } from '@petcare/shared/clock';
import { normalisePhone } from '@petcare/shared/phone';
import type { Database } from '../db/client.ts';
import { signupTokens, users } from '../db/schema/index.ts';
import type { Authenticator } from './guards.ts';
import { OtpUnavailableError, type OtpPort } from './ports.ts';
import type { RateLimiter } from './rate-limit.ts';
import { hashToken, newToken, USER_COOKIE, type SessionStore } from './sessions.ts';

export interface AuthDeps {
  db: Database;
  otp: OtpPort;
  clock: Clock;
  store: SessionStore;
  limiter: RateLimiter;
  authn: Authenticator;
}

const fail = (
  reply: FastifyReply,
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
) => reply.code(status).send({ error: { code, message, ...extra } });

const REASON_MESSAGES: Record<string, string> = {
  wrong_code: 'That code is not right',
  expired: 'That code has expired; ask for a new one',
  already_used: 'That code was already used; ask for a new one',
  too_many_attempts: 'Too many wrong codes; ask for a new one',
  no_challenge: 'Ask for a code first',
};

const sendBody = z.strictObject({ phone: z.string() });
const verifyBody = z.strictObject({ phone: z.string(), code: z.string() });
const profileBody = z.strictObject({
  setupToken: z.string().min(10),
  name: z.string().trim().min(1).max(80),
  neighbourhood: z.enum(platformRules.launchNeighbourhoods as unknown as [string, ...string[]]),
  language: z.enum(['bn', 'en']).optional(),
});

export function registerAuthRoutes(app: FastifyInstance, deps: AuthDeps) {
  const { db, otp, clock, store, limiter, authn } = deps;
  const { auth } = platformRules;
  const secure = process.env.NODE_ENV === 'production';

  async function startSession(reply: FastifyReply, userId: string) {
    const { token, expiresAt } = await store.create(
      'user',
      userId,
      auth.userSessionDays * 24 * 60 * 60_000,
    );
    reply.setCookie(USER_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure,
      expires: expiresAt,
    });
  }

  app.post('/auth/otp/send', async (request, reply) => {
    const { phone: raw } = sendBody.parse(request.body);
    const phone = normalisePhone(raw);
    if (!phone)
      return fail(
        reply,
        400,
        'invalid_phone',
        'Enter a Bangladesh mobile number such as 01712345678',
      );
    if (!limiter.allow(phone)) {
      return fail(
        reply,
        429,
        'too_many_requests',
        'Too many codes requested; try again in a few minutes',
        { retryAfterMinutes: auth.otpSendLimit.windowMinutes },
      );
    }
    try {
      await otp.sendCode(phone);
    } catch (error) {
      if (error instanceof OtpUnavailableError)
        return fail(
          reply,
          503,
          'otp_unavailable',
          'The code service is not available right now; try again',
        );
      throw error;
    }
    return reply.code(202).send({ phone, resendAfterSeconds: auth.resendAfterSeconds });
  });

  app.post('/auth/otp/verify', async (request, reply) => {
    const body = verifyBody.parse(request.body);
    const phone = normalisePhone(body.phone);
    if (!phone)
      return fail(
        reply,
        400,
        'invalid_phone',
        'Enter a Bangladesh mobile number such as 01712345678',
      );
    if (!/^\d{6}$/.test(body.code))
      return fail(reply, 400, 'invalid_code', 'The code has six digits');

    let result;
    try {
      result = await otp.verifyCode(phone, body.code);
    } catch (error) {
      if (error instanceof OtpUnavailableError)
        return fail(
          reply,
          503,
          'otp_unavailable',
          'The code service is not available right now; try again',
        );
      throw error;
    }
    if (!result.verified)
      return fail(
        reply,
        400,
        result.reason,
        REASON_MESSAGES[result.reason] ?? 'That code did not work',
      );

    const [existing] = await db.select().from(users).where(eq(users.phone, phone));
    if (existing) {
      await startSession(reply, existing.id);
      return {
        status: 'signed_in',
        role: existing.role,
        name: existing.name,
        redirect: existing.role === 'provider' ? '/provider' : '/',
      };
    }
    const setupToken = newToken();
    await db.insert(signupTokens).values({
      tokenHash: hashToken(setupToken),
      phone,
      expiresAt: new Date(clock.now().getTime() + auth.signupTokenMinutes * 60_000),
    });
    return { status: 'profile_needed', setupToken };
  });

  app.post('/auth/profile', async (request, reply) => {
    const body = profileBody.parse(request.body); // a role in the body is rejected: sign-in can only create owners
    const [pending] = await db
      .delete(signupTokens)
      .where(eq(signupTokens.tokenHash, hashToken(body.setupToken)))
      .returning();
    if (!pending || pending.expiresAt.getTime() <= clock.now().getTime()) {
      return fail(reply, 400, 'setup_expired', 'That step took too long; ask for a new code');
    }
    const id = `owner_${randomUUID()}`;
    await db.insert(users).values({
      id,
      role: 'owner',
      phone: pending.phone,
      name: body.name,
      neighbourhoodId: body.neighbourhood,
      language: body.language ?? 'bn',
    });
    await startSession(reply, id);
    return { status: 'signed_in', role: 'owner', name: body.name, redirect: '/' };
  });

  app.post('/auth/sign-out', async (request, reply) => {
    await store.destroy(request.cookies[USER_COOKIE]);
    reply.clearCookie(USER_COOKIE, { path: '/' });
    return { status: 'signed_out' };
  });

  app.get('/auth/me', { preHandler: authn.requireRole('owner', 'provider') }, async (request) => ({
    user: request.currentUser,
  }));
  app.get('/owner/me', { preHandler: authn.requireRole('owner') }, async (request) => ({
    user: request.currentUser,
  }));
  app.get('/provider/me', { preHandler: authn.requireRole('provider') }, async (request) => ({
    user: request.currentUser,
  }));
}
