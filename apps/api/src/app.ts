/** Builds the PetCare API. Business endpoints are added by later bolts. */
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import { SystemClock, type Clock } from '@petcare/shared/clock';
import { platformRules } from '@petcare/shared/config';
import { ZodError } from 'zod';
import { registerAdminRoutes } from './auth/admin-routes.ts';
import { createAuthenticator } from './auth/guards.ts';
import type { OtpPort } from './auth/ports.ts';
import { RateLimiter } from './auth/rate-limit.ts';
import { registerAuthRoutes } from './auth/routes.ts';
import { createSessionStore } from './auth/sessions.ts';
import { loadBusinessRules } from './config.ts';
import type { Database } from './db/client.ts';
import { denyAllPetAccess, type PetAccessPolicy } from './pets/care-summary.ts';
import type { PhotoPort } from './pets/photo-port.ts';
import { registerPetRoutes } from './pets/routes.ts';
import { registerProviderRoutes } from './providers/routes.ts';

export interface AppDeps {
  /** Without a database only /health is served (used by the simplest tests). */
  db?: Database;
  otp?: OtpPort;
  photos?: PhotoPort;
  /** Which providers may see which pets (bookings decide, in later bolts). Default: nobody. */
  petAccess?: PetAccessPolicy;
  clock?: Clock;
  /** Overrides how many codes one number may request per window (defaults to the platform rule). */
  otpSendLimitMax?: number;
}

export async function buildApp(deps: AppDeps = {}) {
  const rules = loadBusinessRules();
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });
  await app.register(cookie);
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 5 } });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: {
          code: 'invalid_request',
          message: 'The request is not valid',
          details: error.issues,
        },
      });
    }
    if ((error as { code?: string }).code === 'FST_REQ_FILE_TOO_LARGE') {
      return reply
        .code(413)
        .send({ error: { code: 'photo_too_large', message: 'Photos can be at most 5 MB' } });
    }
    const status = (error as { statusCode?: number }).statusCode;
    if (status && status >= 400 && status < 500) {
      return reply
        .code(status)
        .send({ error: { code: 'bad_request', message: (error as Error).message } });
    }
    app.log.error(error);
    return reply
      .code(500)
      .send({ error: { code: 'internal_error', message: 'Something went wrong on our side' } });
  });

  app.get('/health', async () => ({
    service: 'petcare-api',
    status: 'ok',
    rulesLoaded: Object.keys(rules.trainingDecisions).length,
  }));

  if (deps.db && deps.otp) {
    const clock = deps.clock ?? new SystemClock();
    const store = createSessionStore(deps.db, clock);
    const authn = createAuthenticator(deps.db, store);
    const { max: defaultMax, windowMinutes } = platformRules.auth.otpSendLimit;
    const max = deps.otpSendLimitMax ?? defaultMax;
    const limiter = new RateLimiter(clock, max, windowMinutes * 60_000);
    const authDeps = { db: deps.db, otp: deps.otp, clock, store, limiter, authn };
    registerAuthRoutes(app, authDeps);
    await registerAdminRoutes(app, authDeps);
    registerProviderRoutes(app, { db: deps.db, authn });
    if (deps.photos)
      registerPetRoutes(app, {
        db: deps.db,
        authn,
        photos: deps.photos,
        petAccess: deps.petAccess ?? denyAllPetAccess,
      });
  }

  return app;
}
