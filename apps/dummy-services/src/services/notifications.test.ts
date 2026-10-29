import { describe, expect, it } from 'vitest';
import { inspect, JSON_HEADERS, newApp, setMode } from '../test-helpers.ts';

const MESSAGE = {
  recipient: '+8801712345678',
  role: 'owner',
  language: 'bn',
  type: 'booking.confirmed',
  body: 'রশিদ টিটোর স্টে নিশ্চিত করেছেন',
  bookingRef: 'BK-1',
  link: '/bookings/BK-1',
};
const post = (app: ReturnType<typeof newApp>['app'], payload: unknown = MESSAGE) =>
  app.inject({
    method: 'POST',
    url: '/api/notifications',
    headers: JSON_HEADERS,
    payload: payload as object,
  });

describe('DUM-05 Dummy Notification API', () => {
  it('stores the message and shows it in inspection', async () => {
    const { app } = newApp();
    const response = await post(app);
    expect(response.statusCode).toBe(202);
    expect(response.json()).toEqual({ id: 'ntf_0001', status: 'sent' });
    const { state } = await inspect(app, 'notifications');
    expect(state.notifications[0]).toMatchObject({
      ...MESSAGE,
      id: 'ntf_0001',
      status: 'sent',
      receivedAt: '2026-03-28T04:00:00.000Z',
    });
  });

  it('keeps Bangla text intact and numbers messages in order', async () => {
    const { app } = newApp();
    await post(app);
    await post(app, { ...MESSAGE, language: 'en', body: 'Second' });
    const notifications = (await inspect(app, 'notifications')).state.notifications as Array<{
      id: string;
      body: string;
    }>;
    expect(notifications.map((n) => n.id)).toEqual(['ntf_0001', 'ntf_0002']);
    expect(notifications[0]?.body).toBe(MESSAGE.body);
  });

  it('rejects invalid role, language and empty body', async () => {
    const { app } = newApp();
    expect((await post(app, { ...MESSAGE, role: 'guest' })).statusCode).toBe(400);
    expect((await post(app, { ...MESSAGE, language: 'fr' })).statusCode).toBe(400);
    expect((await post(app, { ...MESSAGE, body: '' })).statusCode).toBe(400);
    expect((await inspect(app, 'notifications')).state.notifications).toHaveLength(0);
  });

  it('failure modes: down and timeout store nothing; ambiguous stores it but loses the reply', async () => {
    const { app } = newApp({ timeoutMs: 20 });
    await setMode(app, 'notifications', 'down');
    expect((await post(app)).statusCode).toBe(503);
    await setMode(app, 'notifications', 'timeout');
    expect((await post(app)).statusCode).toBe(504);
    expect((await inspect(app, 'notifications')).state.notifications).toHaveLength(0);
    await setMode(app, 'notifications', 'ambiguous');
    expect((await post(app)).statusCode).toBe(504);
    expect((await inspect(app, 'notifications')).state.notifications).toHaveLength(1);
  });
});
