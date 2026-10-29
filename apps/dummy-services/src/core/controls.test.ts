import { describe, expect, it } from 'vitest';
import { inspect, JSON_HEADERS, newApp, setMode } from '../test-helpers.ts';

const SERVICES = ['payments', 'payouts', 'otp', 'notifications', 'photos'];

describe('DUM-01 training controls', () => {
  it('health answers for all five services with their status', async () => {
    const { app } = newApp();
    const body = (await app.inject({ method: 'GET', url: '/health' })).json();
    expect(body).toMatchObject({ status: 'ok', trainingOnly: true });
    expect(Object.keys(body.services).sort()).toEqual([...SERVICES].sort());
    for (const name of SERVICES) {
      expect(body.services[name]).toMatchObject({ status: 'ok', failureMode: 'none' });
      const own = (await app.inject({ method: 'GET', url: `/_training/${name}/health` })).json();
      expect(own).toMatchObject({ service: name, status: 'ok' });
    }
  });

  it('refuses an unknown service', async () => {
    const { app } = newApp();
    const response = await app.inject({ method: 'GET', url: '/_training/email/health' });
    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('unknown_service');
  });

  it('inspect shows every request with time, method, URL, body, status and outcome', async () => {
    const { app } = newApp();
    await app.inject({
      method: 'POST',
      url: '/api/notifications',
      headers: JSON_HEADERS,
      payload: { recipient: 'a', role: 'owner', language: 'en', type: 't', body: 'hello' },
    });
    await app.inject({
      method: 'POST',
      url: '/api/notifications',
      headers: JSON_HEADERS,
      payload: { nonsense: true },
    });
    const { received } = await inspect(app, 'notifications');
    expect(received).toHaveLength(2);
    expect(received[0]).toMatchObject({
      method: 'POST',
      url: '/api/notifications',
      status: 202,
      outcome: 'ok',
      at: '2026-03-28T04:00:00.000Z',
    });
    expect(received[0]?.body).toMatchObject({ body: 'hello' });
    expect(received[1]).toMatchObject({ status: 400, outcome: 'error' });
  });

  it('training endpoints are not logged as service traffic', async () => {
    const { app } = newApp();
    await app.inject({ method: 'GET', url: '/_training/payments/health' });
    await app.inject({ method: 'GET', url: '/health' });
    expect((await inspect(app, 'payments')).received).toHaveLength(0);
  });

  it('reset empties stored state, the request log and the failure mode', async () => {
    const { app } = newApp();
    const note = { recipient: 'a', role: 'owner', language: 'bn', type: 't', body: 'x' };
    await app.inject({
      method: 'POST',
      url: '/api/notifications',
      headers: JSON_HEADERS,
      payload: note,
    });
    await setMode(app, 'notifications', 'timeout');
    const before = await inspect(app, 'notifications');
    expect(before.state.notifications).toHaveLength(1);
    expect(before.failureMode).toBe('timeout');
    const reset = await app.inject({ method: 'POST', url: '/_training/notifications/reset' });
    expect(reset.json()).toEqual({ service: 'notifications', status: 'reset' });
    const after = await inspect(app, 'notifications');
    expect(after).toMatchObject({ failureMode: 'none', received: [] });
    expect(after.state.notifications).toHaveLength(0);
    const again = await app.inject({
      method: 'POST',
      url: '/api/notifications',
      headers: JSON_HEADERS,
      payload: note,
    });
    expect(again.json().id).toBe('ntf_0001'); // ids restart too
  });

  it('reset-all resets every service', async () => {
    const { app } = newApp();
    for (const name of SERVICES) await setMode(app, name, 'down');
    const response = await app.inject({ method: 'POST', url: '/_training/reset-all' });
    expect(response.json().services.sort()).toEqual([...SERVICES].sort());
    const health = (await app.inject({ method: 'GET', url: '/health' })).json();
    for (const name of SERVICES) expect(health.services[name].failureMode).toBe('none');
  });

  it('a failure mode applies to the next calls until it is cleared', async () => {
    const { app } = newApp();
    const call = () =>
      app.inject({
        method: 'POST',
        url: '/api/notifications',
        headers: JSON_HEADERS,
        payload: { recipient: 'a', role: 'admin', language: 'en', type: 't', body: 'x' },
      });
    await setMode(app, 'notifications', 'down');
    expect((await call()).statusCode).toBe(503);
    expect((await call()).statusCode).toBe(503);
    await setMode(app, 'notifications', 'none');
    expect((await call()).statusCode).toBe(202);
  });

  it('a mode on one service does not affect another', async () => {
    const { app } = newApp();
    await setMode(app, 'payments', 'down');
    const ok = await app.inject({
      method: 'POST',
      url: '/api/notifications',
      headers: JSON_HEADERS,
      payload: { recipient: 'a', role: 'owner', language: 'en', type: 't', body: 'x' },
    });
    expect(ok.statusCode).toBe(202);
  });

  it('rejects an unknown mode and a silly timeout, and reads the current mode back', async () => {
    const { app } = newApp();
    const bad = await app.inject({
      method: 'PUT',
      url: '/_training/otp/failure-mode',
      headers: JSON_HEADERS,
      payload: { mode: 'explode' },
    });
    expect(bad.statusCode).toBe(400);
    const silly = await app.inject({
      method: 'PUT',
      url: '/_training/otp/failure-mode',
      headers: JSON_HEADERS,
      payload: { mode: 'timeout', timeoutMs: 999999 },
    });
    expect(silly.statusCode).toBe(400);
    await app.inject({
      method: 'PUT',
      url: '/_training/otp/failure-mode',
      headers: JSON_HEADERS,
      payload: { mode: 'timeout', timeoutMs: 15 },
    });
    const current = await app.inject({ method: 'GET', url: '/_training/otp/failure-mode' });
    expect(current.json()).toEqual({ service: 'otp', mode: 'timeout', timeoutMs: 15 });
  });

  it('unknown routes get the same error shape', async () => {
    const { app } = newApp();
    const response = await app.inject({ method: 'GET', url: '/api/nothing' });
    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('not_found');
  });
});
