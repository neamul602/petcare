/**
 * Host for the five Dummy APIs. These are TRAINING contracts of our own design, not real
 * bKash, Nagad, SSLCommerz, MFS or SMS interfaces. Each service keeps its state in memory and has
 * health, reset, inspection and failure modes (see core/controls.ts and core/failure-modes.ts).
 */
import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import { registerControls } from './core/controls.ts';
import { registerErrorHandling } from './core/errors.ts';
import { DummyService, type DummyContext } from './core/service.ts';
import { registerNotifications } from './services/notifications.ts';
import { registerOtp } from './services/otp.ts';
import { registerPayments } from './services/payments.ts';
import { MAX_PHOTO_BYTES, registerPhotos } from './services/photos.ts';
import { registerPayouts } from './services/payouts.ts';

export interface DummyOptions {
  /** How long "timeout" mode holds a call (default 30 s; tests use a few milliseconds). */
  timeoutMs?: number;
  /** How long a queued payout waits before it is paid (default one minute). */
  payoutSettleMs?: number;
  /** Time source; tests pass a controllable clock. */
  now?: () => Date;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_PAYOUT_SETTLE_MS = 60_000;

export function buildDummyApp(options: DummyOptions = {}) {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test', bodyLimit: 1024 * 1024 });

  const sleepers = new Set<() => void>();
  const ctx: DummyContext = {
    now: options.now ?? (() => new Date()),
    defaultTimeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    payoutSettleMs: options.payoutSettleMs ?? DEFAULT_PAYOUT_SETTLE_MS,
    sleep: (ms) =>
      new Promise<void>((resolve) => {
        const finish = () => {
          clearTimeout(timer);
          sleepers.delete(finish);
          resolve();
        };
        const timer = setTimeout(finish, ms);
        sleepers.add(finish);
      }),
  };
  app.addHook('onClose', async () => {
    for (const finish of [...sleepers]) finish();
  });

  registerErrorHandling(app);
  app.register(multipart, { limits: { fileSize: MAX_PHOTO_BYTES, files: 1, fields: 10 } });

  const services = {
    payments: new DummyService('payments', ctx),
    payouts: new DummyService('payouts', ctx),
    otp: new DummyService('otp', ctx),
    notifications: new DummyService('notifications', ctx),
    photos: new DummyService('photos', ctx),
  };

  // Each service is registered in its own plugin so its request log only sees its own routes.
  app.register(async (instance) => registerControls(instance, Object.values(services)));
  app.register(async (instance) => registerPayments(instance, services.payments));
  app.register(async (instance) => registerPayouts(instance, services.payouts));
  app.register(async (instance) => registerOtp(instance, services.otp));
  app.register(async (instance) => registerNotifications(instance, services.notifications));
  app.register(async (instance) => registerPhotos(instance, services.photos));

  return app;
}
