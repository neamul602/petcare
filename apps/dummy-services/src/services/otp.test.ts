import { describe, expect, it } from 'vitest';
import { inspect, JSON_HEADERS, newApp, setMode } from '../test-helpers.ts';

const PHONE = '+8801712345678';

async function send(app: ReturnType<typeof newApp>['app'], phone = PHONE) {
  return app.inject({
    method: 'POST',
    url: '/api/otp/send',
    headers: JSON_HEADERS,
    payload: { phone },
  });
}
async function codeFor(app: ReturnType<typeof newApp>['app'], phone = PHONE) {
  const state = (await inspect(app, 'otp')).state.challenges as Array<{
    phone: string;
    code: string;
  }>;
  return state.find((c) => c.phone === phone)!.code;
}
const verify = (app: ReturnType<typeof newApp>['app'], code: string, phone = PHONE) =>
  app.inject({
    method: 'POST',
    url: '/api/otp/verify',
    headers: JSON_HEADERS,
    payload: { phone, code },
  });

describe('DUM-02 Dummy SMS / OTP API', () => {
  it('send creates a six-digit code that is visible in inspection but not in the reply', async () => {
    const { app } = newApp();
    const response = await send(app);
    expect(response.statusCode).toBe(202);
    expect(response.json()).toMatchObject({ challengeId: 'otp_0001', phone: PHONE });
    const code = await codeFor(app);
    expect(code).toMatch(/^\d{6}$/);
    expect(response.body).not.toContain(code);
  });

  it('the right code verifies before expiry', async () => {
    const { app } = newApp();
    await send(app);
    const response = await verify(app, await codeFor(app));
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ verified: true });
  });

  it('a wrong code does not verify', async () => {
    const { app } = newApp();
    await send(app);
    const wrong = (await codeFor(app)) === '000000' ? '111111' : '000000';
    expect((await verify(app, wrong)).json()).toEqual({ verified: false, reason: 'wrong_code' });
  });

  it('an expired code does not verify (five minutes)', async () => {
    const { app, clock } = newApp();
    await send(app);
    const code = await codeFor(app);
    clock.advanceMinutes(5);
    expect((await verify(app, code)).json().verified).toBe(true); // exactly at the limit still works
    const second = newApp();
    await send(second.app);
    const code2 = await codeFor(second.app);
    second.clock.advanceMinutes(5.1);
    expect((await verify(second.app, code2)).json()).toEqual({
      verified: false,
      reason: 'expired',
    });
  });

  it('a code cannot be used twice', async () => {
    const { app } = newApp();
    await send(app);
    const code = await codeFor(app);
    await verify(app, code);
    expect((await verify(app, code)).json()).toEqual({ verified: false, reason: 'already_used' });
  });

  it('five wrong attempts lock the challenge until a new code is sent', async () => {
    const { app } = newApp();
    await send(app);
    const code = await codeFor(app);
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) await verify(app, wrong);
    expect((await verify(app, code)).json()).toEqual({
      verified: false,
      reason: 'too_many_attempts',
    });
    await send(app);
    expect((await verify(app, await codeFor(app))).json().verified).toBe(true);
  });

  it('resending replaces the old code', async () => {
    const { app } = newApp();
    await send(app);
    const first = await codeFor(app);
    await send(app);
    const second = await codeFor(app);
    if (first !== second) expect((await verify(app, first)).json().verified).toBe(false);
    expect((await verify(app, second)).json().verified).toBe(true);
  });

  it('verify without a challenge says so', async () => {
    const { app } = newApp();
    expect((await verify(app, '123456')).json()).toEqual({
      verified: false,
      reason: 'no_challenge',
    });
  });

  it('only accepts Bangladesh mobile numbers and six-digit codes', async () => {
    const { app } = newApp();
    expect((await send(app, '+15551234567')).statusCode).toBe(400);
    expect((await send(app, '01712345678')).statusCode).toBe(400);
    expect((await verify(app, '12345')).statusCode).toBe(400);
  });

  it('failure mode down: send fails like an unavailable provider and creates nothing', async () => {
    const { app } = newApp();
    await setMode(app, 'otp', 'down');
    const response = await send(app);
    expect(response.statusCode).toBe(503);
    expect(response.json().error.code).toBe('provider_unavailable');
    expect((await inspect(app, 'otp')).state.challenges).toHaveLength(0);
  });

  it('failure mode timeout: the caller sees a timeout and nothing is created', async () => {
    const { app } = newApp({ timeoutMs: 25 });
    await setMode(app, 'otp', 'timeout');
    const started = Date.now();
    const response = await send(app);
    expect(response.statusCode).toBe(504);
    expect(Date.now() - started).toBeGreaterThanOrEqual(20);
    expect((await inspect(app, 'otp')).state.challenges).toHaveLength(0);
  });

  it('failure mode ambiguous: the code is created but the reply is lost', async () => {
    const { app } = newApp();
    await setMode(app, 'otp', 'ambiguous');
    expect((await send(app)).statusCode).toBe(504);
    expect((await inspect(app, 'otp')).state.challenges).toHaveLength(1);
  });

  it('failure mode decline behaves as down for OTP', async () => {
    const { app } = newApp();
    await setMode(app, 'otp', 'decline');
    expect((await send(app)).statusCode).toBe(503);
  });
});
