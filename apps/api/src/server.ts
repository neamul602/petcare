import { buildApp } from './app.ts';
import { createDummyOtp } from './auth/dummy-otp.ts';
import { loadRuntimeConfig } from './config.ts';
import { createDatabase } from './db/client.ts';
import { createDummyPayments } from './payments/dummy-payments.ts';
import { createDummyPayouts } from './payouts/dummy-payouts.ts';
import { createDummyPhotos } from './pets/dummy-photos.ts';

const { API_PORT, DATABASE_URL, DUMMY_URL, OTP_SEND_LIMIT_MAX } = loadRuntimeConfig();
const { db } = createDatabase(DATABASE_URL);
const app = await buildApp({
  db,
  otp: createDummyOtp(DUMMY_URL),
  photos: createDummyPhotos(DUMMY_URL),
  payments: createDummyPayments(DUMMY_URL),
  payouts: createDummyPayouts(DUMMY_URL),
  otpSendLimitMax: OTP_SEND_LIMIT_MAX,
});
await app.listen({ port: API_PORT, host: '0.0.0.0' });

// Requests the provider did not answer in time are closed and their holds released (TD-1).
setInterval(() => {
  app.processTimeouts?.().catch((error: unknown) => app.log.error(error));
  app.flagLateStarts?.().catch((error: unknown) => app.log.error(error));
  app.runScheduledPayouts?.().catch((error: unknown) => app.log.error(error));
}, 60_000).unref();
