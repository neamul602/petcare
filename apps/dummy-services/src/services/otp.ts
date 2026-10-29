/**
 * Dummy SMS / OTP API (training contract, not a real SMS provider interface).
 *   POST /api/otp/send    { phone }        -> 202 { challengeId, expiresAt }
 *   POST /api/otp/verify  { phone, code }  -> 200 { verified, reason? }
 * Codes are six digits, valid for five minutes, with five wrong attempts per challenge.
 * The code is visible in /_training/otp/inspect so tests and demos can read it.
 */
import { randomInt } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { DummyService } from '../core/service.ts';

const CODE_LIFETIME_MS = 5 * 60_000;
const MAX_WRONG_ATTEMPTS = 5;
const BD_MOBILE = /^\+8801[3-9]\d{8}$/;

interface Challenge {
  id: string;
  phone: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  wrongAttempts: number;
  verified: boolean;
}

const sendBody = z.strictObject({
  phone: z.string().regex(BD_MOBILE, 'Use a Bangladesh mobile number such as +8801712345678'),
});
const verifyBody = z.strictObject({
  phone: z.string().regex(BD_MOBILE),
  code: z.string().regex(/^\d{6}$/),
});

export function registerOtp(app: FastifyInstance, svc: DummyService) {
  const challenges = new Map<string, Challenge>();
  svc.onReset(() => challenges.clear());
  svc.describeWith(() => ({ challenges: [...challenges.values()] }));
  svc.attach(app);

  app.post('/api/otp/send', async (request, reply) => {
    const body = sendBody.parse(request.body);
    return svc.run(request, reply, () => {
      const now = svc.ctx.now();
      const challenge: Challenge = {
        id: svc.ids.next('otp'),
        phone: body.phone,
        code: String(randomInt(0, 1_000_000)).padStart(6, '0'),
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + CODE_LIFETIME_MS).toISOString(),
        wrongAttempts: 0,
        verified: false,
      };
      challenges.set(body.phone, challenge);
      return {
        status: 202,
        body: { challengeId: challenge.id, phone: body.phone, expiresAt: challenge.expiresAt },
      };
    });
  });

  app.post('/api/otp/verify', async (request, reply) => {
    const body = verifyBody.parse(request.body);
    return svc.run(request, reply, () => {
      const challenge = challenges.get(body.phone);
      const notVerified = (reason: string) => ({ status: 200, body: { verified: false, reason } });
      if (!challenge) return notVerified('no_challenge');
      if (challenge.verified) return notVerified('already_used');
      if (challenge.wrongAttempts >= MAX_WRONG_ATTEMPTS) return notVerified('too_many_attempts');
      if (svc.ctx.now().getTime() > Date.parse(challenge.expiresAt)) return notVerified('expired');
      if (challenge.code !== body.code) {
        challenge.wrongAttempts += 1;
        return notVerified('wrong_code');
      }
      challenge.verified = true;
      return { status: 200, body: { verified: true, challengeId: challenge.id } };
    });
  });
}
