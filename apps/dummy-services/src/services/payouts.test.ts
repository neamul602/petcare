import { describe, expect, it } from 'vitest';
import { inspect, JSON_HEADERS, newApp, setMode, withKey } from '../test-helpers.ts';

type App = ReturnType<typeof newApp>['app'];
const BATCH = {
  batchRef: 'WK-1',
  lines: [
    { bookingRef: 'BK-1', providerRef: 'rashid', amount: 1_800_000 },
    { bookingRef: 'BK-2', providerRef: 'farzana', amount: 900_000 },
  ],
};

const batch = (app: App, key = 'b-1', payload: unknown = BATCH) =>
  app.inject({
    method: 'POST',
    url: '/api/payouts/batches',
    headers: withKey(key),
    payload: payload as object,
  });
const freeze = (app: App, id = 'po_0001') =>
  app.inject({ method: 'POST', url: `/api/payouts/${id}/freeze` });
const release = (app: App, id = 'po_0001') =>
  app.inject({ method: 'POST', url: `/api/payouts/${id}/release` });
const get = (app: App, id = 'po_0001') => app.inject({ method: 'GET', url: `/api/payouts/${id}` });
const stored = async (app: App) =>
  (await inspect(app, 'payouts')).state as {
    batches: unknown[];
    payouts: Array<{ status: string }>;
  };

describe('DUM-04 Dummy MFS Payout API', () => {
  it('a batch creates one queued payout per line', async () => {
    const { app } = newApp();
    const response = await batch(app);
    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body).toMatchObject({ id: 'batch_0001', batchRef: 'WK-1' });
    expect(body.payouts).toHaveLength(2);
    expect(body.payouts[0]).toMatchObject({
      id: 'po_0001',
      bookingRef: 'BK-1',
      providerRef: 'rashid',
      amount: 1_800_000,
      currency: 'BDT',
      status: 'queued',
    });
  });

  it('a batch sent twice with one key creates one batch', async () => {
    const { app } = newApp();
    const first = await batch(app);
    const second = await batch(app);
    expect(second.json()).toEqual(first.json());
    const state = await stored(app);
    expect(state.batches).toHaveLength(1);
    expect(state.payouts).toHaveLength(2);
  });

  it('the same key for a different batch is a conflict; a missing key is refused', async () => {
    const { app } = newApp();
    await batch(app, 'k');
    expect(
      (await batch(app, 'k', { lines: [{ bookingRef: 'X', providerRef: 'y', amount: 5 }] }))
        .statusCode,
    ).toBe(409);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/payouts/batches',
          headers: JSON_HEADERS,
          payload: BATCH,
        })
      ).statusCode,
    ).toBe(400);
  });

  it('validates lines', async () => {
    const { app } = newApp();
    expect((await batch(app, 'a', { lines: [] })).statusCode).toBe(400);
    expect(
      (await batch(app, 'b', { lines: [{ bookingRef: 'X', providerRef: 'y', amount: -5 }] }))
        .statusCode,
    ).toBe(400);
    expect(
      (await batch(app, 'c', { lines: [{ bookingRef: 'X', providerRef: 'y' }] })).statusCode,
    ).toBe(400);
    expect((await stored(app)).payouts).toHaveLength(0);
  });

  it('freeze holds a queued payout until released', async () => {
    const { app, clock } = newApp({ payoutSettleMs: 60_000 });
    await batch(app);
    const frozen = await freeze(app);
    expect(frozen.json()).toMatchObject({ status: 'frozen' });
    clock.advanceMinutes(10); // well past the settlement time
    expect((await get(app)).json().status).toBe('frozen');
    expect((await get(app, 'po_0002')).json().status).toBe('paid'); // the other line was not frozen
  });

  it('release continues the payout to paid', async () => {
    const { app, clock } = newApp({ payoutSettleMs: 60_000 });
    await batch(app);
    await freeze(app);
    const released = await release(app);
    expect(released.json()).toMatchObject({ status: 'queued' });
    expect((await get(app)).json().status).toBe('queued');
    clock.advanceMinutes(2);
    expect((await get(app)).json()).toMatchObject({ status: 'paid' });
  });

  it('queued payouts are paid after the settlement delay', async () => {
    const { app, clock } = newApp({ payoutSettleMs: 60_000 });
    await batch(app);
    expect((await get(app)).json().status).toBe('queued');
    clock.advanceMinutes(1);
    expect((await get(app)).json()).toMatchObject({ status: 'paid' });
  });

  it('freezing or releasing twice changes nothing', async () => {
    const { app } = newApp();
    await batch(app);
    const first = await freeze(app);
    const second = await freeze(app);
    expect(second.json().frozenAt).toBe(first.json().frozenAt);
    await release(app);
    expect((await release(app)).json().status).toBe('queued');
  });

  it('a paid payout cannot be frozen or released', async () => {
    const { app } = newApp();
    await batch(app);
    await app.inject({ method: 'POST', url: '/_training/payouts/settle-now' });
    expect((await get(app)).json().status).toBe('paid');
    const frozen = await freeze(app);
    expect(frozen.statusCode).toBe(409);
    expect(frozen.json().error.code).toBe('already_paid');
    expect((await release(app)).statusCode).toBe(409);
  });

  it('settle-now pays every queued payout at once', async () => {
    const { app } = newApp();
    await batch(app);
    await freeze(app, 'po_0002');
    const response = await app.inject({ method: 'POST', url: '/_training/payouts/settle-now' });
    expect(response.json()).toEqual({ status: 'settled', paid: 1 });
    expect((await stored(app)).payouts.map((p) => p.status)).toEqual(['paid', 'frozen']);
  });

  it('an unknown payout is a 404', async () => {
    const { app } = newApp();
    expect((await get(app, 'po_0099')).statusCode).toBe(404);
    expect((await freeze(app, 'po_0099')).statusCode).toBe(404);
  });

  it('failure mode down: nothing is paid and the error is clear', async () => {
    const { app } = newApp();
    await setMode(app, 'payouts', 'down');
    const response = await batch(app);
    expect(response.statusCode).toBe(503);
    expect(response.json().error).toMatchObject({ code: 'provider_unavailable' });
    expect((await stored(app)).payouts).toHaveLength(0);
  });

  it('failure mode ambiguous: the batch exists, the reply is lost, a retry returns it once', async () => {
    const { app } = newApp();
    await setMode(app, 'payouts', 'ambiguous');
    expect((await batch(app, 'amb')).statusCode).toBe(504);
    expect((await stored(app)).batches).toHaveLength(1);
    await setMode(app, 'payouts', 'none');
    const retry = await batch(app, 'amb');
    expect(retry.statusCode).toBe(201);
    expect(retry.json().id).toBe('batch_0001');
    expect((await stored(app)).payouts).toHaveLength(2);
  });

  it('failure mode timeout: the caller sees a timeout and nothing is created', async () => {
    const { app } = newApp({ timeoutMs: 25 });
    await setMode(app, 'payouts', 'timeout');
    expect((await batch(app)).statusCode).toBe(504);
    expect((await stored(app)).payouts).toHaveLength(0);
  });
});
