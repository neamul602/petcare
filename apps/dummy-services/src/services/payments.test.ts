import { describe, expect, it } from 'vitest';
import { inspect, JSON_HEADERS, newApp, setMode, withKey } from '../test-helpers.ts';

type App = ReturnType<typeof newApp>['app'];
const AUTHORIZE = { method: 'bkash', amount: 2_000_000, bookingRef: 'BK-1' };

const authorize = (app: App, key = 'auth-1', payload: Record<string, unknown> = AUTHORIZE) =>
  app.inject({
    method: 'POST',
    url: '/api/payments/authorizations',
    headers: withKey(key),
    payload,
  });
const capture = (app: App, id = 'auth_0001', key = 'cap-1') =>
  app.inject({
    method: 'POST',
    url: `/api/payments/authorizations/${id}/capture`,
    headers: { 'idempotency-key': key },
  });
const release = (app: App, id = 'auth_0001') =>
  app.inject({ method: 'POST', url: `/api/payments/authorizations/${id}/release` });
const refund = (app: App, amount: number, key = 'ref-1', paymentId = 'pay_0001') =>
  app.inject({
    method: 'POST',
    url: `/api/payments/${paymentId}/refunds`,
    headers: withKey(key),
    payload: { amount },
  });
const stored = async (app: App) =>
  (await inspect(app, 'payments')).state.authorizations as Array<Record<string, unknown>>;

describe('DUM-03 authorize', () => {
  it.each(['bkash', 'nagad', 'card'])(
    'authorizes with %s and returns status authorized, nothing captured',
    async (method) => {
      const { app } = newApp();
      const response = await authorize(app, `k-${method}`, { ...AUTHORIZE, method });
      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        id: 'auth_0001',
        paymentId: 'pay_0001',
        method,
        amount: 2_000_000,
        currency: 'BDT',
        status: 'authorized',
        capturedAmount: 0,
        bookingRef: 'BK-1',
      });
      expect(response.json().gatewayRef).toMatch(/^GW-[A-Z]+-\d{6}$/);
    },
  );

  it('rejects an unknown method, a bad amount and unknown fields', async () => {
    const { app } = newApp();
    expect((await authorize(app, 'a', { ...AUTHORIZE, method: 'paypal' })).statusCode).toBe(400);
    expect((await authorize(app, 'b', { ...AUTHORIZE, amount: 0 })).statusCode).toBe(400);
    expect((await authorize(app, 'c', { ...AUTHORIZE, amount: 12.5 })).statusCode).toBe(400);
    expect((await authorize(app, 'd', { ...AUTHORIZE, surprise: 1 })).statusCode).toBe(400);
    expect(await stored(app)).toHaveLength(0);
  });

  it('never accepts card data, only the method name', async () => {
    const { app } = newApp();
    const response = await authorize(app, 'c', {
      method: 'card',
      amount: 100,
      cardNumber: '4111111111111111',
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('card_data_not_accepted');
    const afterwards = await inspect(app, 'payments');
    expect(JSON.stringify(afterwards)).not.toContain('4111111111111111');
    expect(afterwards.received[0]?.body).toMatchObject({
      cardNumber: '[redacted]',
      method: 'card',
    });
  });

  it('requires an idempotency key', async () => {
    const { app } = newApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/payments/authorizations',
      headers: JSON_HEADERS,
      payload: AUTHORIZE,
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('idempotency_key_required');
  });

  it('the same key twice returns the same authorization and creates only one', async () => {
    const { app } = newApp();
    const first = await authorize(app);
    const second = await authorize(app);
    expect(second.statusCode).toBe(201);
    expect(second.json().id).toBe(first.json().id);
    expect(await stored(app)).toHaveLength(1);
    expect((await inspect(app, 'payments')).received.map((r) => r.outcome)).toEqual([
      'ok',
      'replayed',
    ]);
  });

  it('the same key for a different request is a conflict', async () => {
    const { app } = newApp();
    await authorize(app, 'same', AUTHORIZE);
    const response = await authorize(app, 'same', { ...AUTHORIZE, amount: 999 });
    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('idempotency_key_reuse');
  });
});

describe('DUM-03 capture', () => {
  it('captures once', async () => {
    const { app } = newApp();
    await authorize(app);
    const response = await capture(app);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'captured', capturedAmount: 2_000_000 });
  });

  it('capture called twice with the same key yields one capture and the same result', async () => {
    const { app, clock } = newApp();
    await authorize(app);
    const first = await capture(app);
    clock.advanceMinutes(10);
    const second = await capture(app);
    expect(second.statusCode).toBe(200);
    expect(second.json()).toEqual(first.json());
    expect(second.json().capturedAt).toBe(first.json().capturedAt);
  });

  it('a new key on an already captured authorization is refused', async () => {
    const { app } = newApp();
    await authorize(app);
    await capture(app, 'auth_0001', 'cap-1');
    const response = await capture(app, 'auth_0001', 'cap-2');
    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('already_captured');
  });

  it('requires a key and an existing authorization', async () => {
    const { app } = newApp();
    await authorize(app);
    expect(
      (await app.inject({ method: 'POST', url: '/api/payments/authorizations/auth_0001/capture' }))
        .statusCode,
    ).toBe(400);
    expect((await capture(app, 'auth_9999')).statusCode).toBe(404);
  });
});

describe('DUM-03 release', () => {
  it('releases an authorized hold and then capture is no longer possible', async () => {
    const { app } = newApp();
    await authorize(app);
    const response = await release(app);
    expect(response.json()).toMatchObject({ status: 'released' });
    const late = await capture(app);
    expect(late.statusCode).toBe(409);
    expect(late.json().error.code).toBe('not_capturable');
  });

  it('releasing twice changes nothing', async () => {
    const { app, clock } = newApp();
    await authorize(app);
    const first = await release(app);
    clock.advanceMinutes(5);
    const second = await release(app);
    expect(second.statusCode).toBe(200);
    expect(second.json().releasedAt).toBe(first.json().releasedAt);
  });

  it('a captured payment cannot be released', async () => {
    const { app } = newApp();
    await authorize(app);
    await capture(app);
    expect((await release(app)).statusCode).toBe(409);
  });

  it('release of an unknown authorization is a 404', async () => {
    const { app } = newApp();
    expect((await release(app, 'auth_0042')).statusCode).toBe(404);
  });
});

describe('DUM-03 refunds and lookup', () => {
  it('records a partial refund up to the captured amount, then a final one', async () => {
    const { app } = newApp();
    await authorize(app);
    await capture(app);
    const partial = await refund(app, 500_000, 'r1');
    expect(partial.statusCode).toBe(201);
    expect(partial.json().payment).toMatchObject({
      status: 'partially_refunded',
      refundedTotal: 500_000,
    });
    const rest = await refund(app, 1_500_000, 'r2');
    expect(rest.json().payment).toMatchObject({ status: 'refunded', refundedTotal: 2_000_000 });
  });

  it('refuses a refund above what remains', async () => {
    const { app } = newApp();
    await authorize(app);
    await capture(app);
    await refund(app, 1_900_000, 'r1');
    const response = await refund(app, 200_000, 'r2');
    expect(response.statusCode).toBe(422);
    expect(response.json().error).toMatchObject({
      code: 'refund_exceeds_captured',
      details: { remaining: 100_000 },
    });
  });

  it('refuses a refund before capture, for an unknown payment, or without a key', async () => {
    const { app } = newApp();
    await authorize(app);
    expect((await refund(app, 100)).statusCode).toBe(409);
    expect((await refund(app, 100, 'r', 'pay_0099')).statusCode).toBe(404);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/payments/pay_0001/refunds',
          headers: JSON_HEADERS,
          payload: { amount: 100 },
        })
      ).statusCode,
    ).toBe(400);
  });

  it('a repeated refund key refunds once', async () => {
    const { app } = newApp();
    await authorize(app);
    await capture(app);
    await refund(app, 500_000, 'same');
    await refund(app, 500_000, 'same');
    const payment = (await app.inject({ method: 'GET', url: '/api/payments/pay_0001' })).json();
    expect(payment.refundedTotal).toBe(500_000);
    expect(payment.refunds).toHaveLength(1);
  });

  it('GET returns the payment by payment id (and by authorization id) or 404', async () => {
    const { app } = newApp();
    await authorize(app);
    expect(
      (await app.inject({ method: 'GET', url: '/api/payments/pay_0001' })).json(),
    ).toMatchObject({ id: 'auth_0001', status: 'authorized' });
    expect((await app.inject({ method: 'GET', url: '/api/payments/auth_0001' })).statusCode).toBe(
      200,
    );
    expect((await app.inject({ method: 'GET', url: '/api/payments/pay_0099' })).statusCode).toBe(
      404,
    );
  });
});

describe('DUM-03 failure modes', () => {
  it('down: nothing is created or captured', async () => {
    const { app } = newApp();
    await setMode(app, 'payments', 'down');
    expect((await authorize(app)).statusCode).toBe(503);
    expect(await stored(app)).toHaveLength(0);
  });

  it('decline: authorize and capture are refused with 402, release behaves as down', async () => {
    const { app } = newApp();
    await authorize(app);
    await setMode(app, 'payments', 'decline');
    const declined = await authorize(app, 'a2');
    expect(declined.statusCode).toBe(402);
    expect(declined.json().error.code).toBe('payment_declined');
    expect((await capture(app)).statusCode).toBe(402);
    expect((await release(app)).statusCode).toBe(503);
    expect(await stored(app)).toHaveLength(1);
    expect((await stored(app))[0]).toMatchObject({ status: 'authorized' });
  });

  it('timeout: the caller waits, gets a 504, and nothing is created', async () => {
    const { app } = newApp({ timeoutMs: 25 });
    await setMode(app, 'payments', 'timeout');
    const started = Date.now();
    expect((await authorize(app)).statusCode).toBe(504);
    expect(Date.now() - started).toBeGreaterThanOrEqual(20);
    expect(await stored(app)).toHaveLength(0);
  });

  it('ambiguous authorize: action done, reply lost, retry with the same key returns it once', async () => {
    const { app } = newApp();
    await setMode(app, 'payments', 'ambiguous');
    expect((await authorize(app, 'amb')).statusCode).toBe(504);
    expect(await stored(app)).toHaveLength(1);
    await setMode(app, 'payments', 'none');
    const retry = await authorize(app, 'amb');
    expect(retry.statusCode).toBe(201);
    expect(retry.json().id).toBe('auth_0001');
    expect(await stored(app)).toHaveLength(1);
  });

  it('ambiguous capture: the answer is lost, a retry captures exactly once and returns the capture', async () => {
    const { app } = newApp();
    await authorize(app);
    await setMode(app, 'payments', 'ambiguous');
    expect((await capture(app, 'auth_0001', 'cap-lost')).statusCode).toBe(504);
    expect((await stored(app))[0]).toMatchObject({ status: 'captured' });
    await setMode(app, 'payments', 'none');
    const retry = await capture(app, 'auth_0001', 'cap-lost');
    expect(retry.statusCode).toBe(200);
    expect(retry.json()).toMatchObject({ status: 'captured', capturedAmount: 2_000_000 });
    const outcomes = (await inspect(app, 'payments')).received.map((r) => r.outcome);
    expect(outcomes).toEqual(['ok', 'lost-reply', 'replayed']);
  });
});
