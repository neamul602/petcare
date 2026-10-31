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
import { registerSettingsRoutes } from './auth/settings-routes.ts';
import { registerAuthRoutes } from './auth/routes.ts';
import { createSessionStore } from './auth/sessions.ts';
import { loadBusinessRules } from './config.ts';
import type { Database } from './db/client.ts';
import type { PetAccessPolicy } from './pets/care-summary.ts';
import type { PhotoPort } from './pets/photo-port.ts';
import { createPayoutService } from './payouts/payout-service.ts';
import type { PayoutPort } from './payouts/port.ts';
import { registerEarningsRoutes, registerPayoutRoutes } from './payouts/routes.ts';
import { createPaymentService } from './payments/payment-service.ts';
import type { PaymentPort } from './payments/port.ts';
import { registerPaymentRoutes } from './payments/routes.ts';
import { registerRetentionRoutes } from './pets/retention.ts';
import { registerPetRoutes } from './pets/routes.ts';
import { registerBookAgainRoutes } from './bookings/book-again.ts';
import { createBookingService } from './bookings/booking-service.ts';
import { bookingPetAccess } from './bookings/pet-access.ts';
import { createCompletionService } from './bookings/completion-service.ts';
import { registerCompletionRoutes } from './bookings/completion-routes.ts';
import { registerProviderBookingRoutes } from './bookings/provider-routes.ts';
import { createProviderBookingService } from './bookings/provider-service.ts';
import { registerBookingRoutes } from './bookings/routes.ts';
import { createStayService, type StayService } from './stay/stay-service.ts';
import { registerStayRoutes } from './stay/routes.ts';
import { createAcuteService } from './acute/service.ts';
import { registerRunbookRoutes } from './acute/runbook.ts';
import { registerAdminQueueRoutes } from './admin/queue.ts';
import { registerAcuteRoutes } from './acute/routes.ts';
import { registerReviewAdminRoutes } from './reviews/admin.ts';
import { createReviewService } from './reviews/service.ts';
import { registerReviewRoutes } from './reviews/routes.ts';
import { registerInsightsRoutes } from './bookings/insights.ts';
import { registerPeakRoutes } from './capacity/peak.ts';
import { registerCapacityRoutes } from './capacity/routes.ts';
import { registerProfileRoutes } from './providers/profile.ts';
import { registerVettingRoutes } from './providers/vetting.ts';
import { registerProviderRoutes } from './providers/routes.ts';

declare module 'fastify' {
  interface FastifyInstance {
    /** For other units (completion queues the payout, reports freeze it). */
    acuteService?: import('./acute/service.ts').AcuteService;
    payoutService?: import('./payouts/payout-service.ts').PayoutService;
    /** Closes requests past their confirmation window; the server runs it every minute. */
    processTimeouts?: () => Promise<{ closed: string[] }>;
    /** Flags confirmed stays not started by the deadline (TD-12). */
    flagLateStarts?: () => Promise<{ flagged: string[] }>;
    /** Runs the weekly payout batch when due and marks settled payouts paid. */
    runScheduledPayouts?: () => Promise<unknown>;
  }
}

export interface AppDeps {
  /** Without a database only /health is served (used by the simplest tests). */
  db?: Database;
  otp?: OtpPort;
  photos?: PhotoPort;
  payments?: PaymentPort;
  payouts?: PayoutPort;
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
    registerSettingsRoutes(app, { db: deps.db, authn });
    await registerAdminRoutes(app, authDeps);
    const reviewService = createReviewService({
      db: deps.db,
      clock,
      payouts: () => app.payoutService,
    });
    const acuteService = createAcuteService({
      db: deps.db,
      clock,
      payouts: () => app.payoutService,
    });
    registerAcuteRoutes(app, { authn, service: acuteService });
    registerAdminQueueRoutes(app, { db: deps.db, authn, clock });
    registerRunbookRoutes(app, { db: deps.db, authn, clock });
    app.decorate('acuteService', acuteService);
    registerReviewAdminRoutes(app, {
      db: deps.db,
      authn,
      clock,
      payouts: () => app.payoutService,
    });
    registerReviewRoutes(app, { db: deps.db, authn, service: reviewService, photos: deps.photos });
    registerVettingRoutes(app, { db: deps.db, authn });
    registerProfileRoutes(app, { db: deps.db, authn });
    registerProviderRoutes(app, { db: deps.db, authn, reviews: reviewService });
    registerInsightsRoutes(app, { db: deps.db, authn });
    registerPeakRoutes(app, { db: deps.db, authn, clock });
    registerCapacityRoutes(app, { db: deps.db, authn, clock });
    const stay: StayService | undefined = deps.photos
      ? createStayService({ db: deps.db, photos: deps.photos, clock })
      : undefined;
    if (stay && deps.photos) {
      registerStayRoutes(app, { db: deps.db, authn, service: stay, photos: deps.photos });
      app.decorate('flagLateStarts', stay.flagLateStarts);
    }
    if (deps.payments) {
      const paymentService = createPaymentService({ db: deps.db, port: deps.payments, clock });
      registerPaymentRoutes(app, { authn, service: paymentService });
      registerBookAgainRoutes(app, { db: deps.db, authn, clock });
      registerBookingRoutes(app, {
        db: deps.db,
        authn,
        payments: paymentService,
        stay,
        clock,
        service: createBookingService({ db: deps.db, payments: paymentService, clock }),
      });
      let payoutService: ReturnType<typeof createPayoutService> | undefined;
      if (deps.payouts) {
        const created = createPayoutService({
          db: deps.db,
          port: deps.payouts,
          payments: paymentService,
          clock,
        });
        payoutService = created;
        registerPayoutRoutes(app, { db: deps.db, authn, service: created });
        registerEarningsRoutes(app, { db: deps.db, authn, port: deps.payouts });
        app.decorate('payoutService', created);
        app.decorate('runScheduledPayouts', async () => {
          await created.runScheduledBatch();
          return created.syncPaid();
        });
      }
      registerCompletionRoutes(app, {
        db: deps.db,
        authn,
        clock,
        service: createCompletionService({
          db: deps.db,
          payments: paymentService,
          payouts: payoutService,
          clock,
        }),
      });
      const providerBookings = createProviderBookingService({
        db: deps.db,
        payments: paymentService,
        clock,
      });
      registerProviderBookingRoutes(app, {
        db: deps.db,
        authn,
        service: providerBookings,
        stay,
        clock,
      });
      app.decorate('processTimeouts', providerBookings.processTimeouts);
    }
    registerRetentionRoutes(app, { db: deps.db, authn, clock });
    if (deps.photos)
      registerPetRoutes(app, {
        db: deps.db,
        authn,
        photos: deps.photos,
        petAccess: deps.petAccess ?? bookingPetAccess(deps.db),
      });
  }

  return app;
}
