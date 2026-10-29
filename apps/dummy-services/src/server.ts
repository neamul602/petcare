import { buildDummyApp } from './app.ts';

const number = (value: string | undefined) => (value ? Number(value) : undefined);

const port = Number(process.env.DUMMY_PORT ?? 4100);
const app = buildDummyApp({
  timeoutMs: number(process.env.DUMMY_TIMEOUT_MS),
  payoutSettleMs: number(process.env.DUMMY_PAYOUT_SETTLE_MS),
});
await app.listen({ port, host: '0.0.0.0' });
