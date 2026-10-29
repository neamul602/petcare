/**
 * Dummy Notification API (training contract).
 *   POST /api/notifications { recipient, role, language, type, body, link?, bookingRef? } -> 202 { id, status: "sent" }
 * Everything received is stored and visible in /_training/notifications/inspect.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { DummyService } from '../core/service.ts';

interface NotificationRecord {
  id: string;
  recipient: string;
  role: 'owner' | 'provider' | 'admin';
  language: 'bn' | 'en';
  type: string;
  body: string;
  link?: string;
  bookingRef?: string;
  status: 'sent';
  receivedAt: string;
}

const notificationBody = z.strictObject({
  recipient: z.string().min(1).max(128),
  role: z.enum(['owner', 'provider', 'admin']),
  language: z.enum(['bn', 'en']),
  type: z.string().min(1).max(64),
  body: z.string().min(1).max(2000),
  link: z.string().max(512).optional(),
  bookingRef: z.string().max(64).optional(),
});

export function registerNotifications(app: FastifyInstance, svc: DummyService) {
  const stored: NotificationRecord[] = [];
  svc.onReset(() => {
    stored.length = 0;
  });
  svc.describeWith(() => ({ notifications: [...stored] }));
  svc.attach(app);

  app.post('/api/notifications', async (request, reply) => {
    const body = notificationBody.parse(request.body);
    return svc.run(request, reply, () => {
      const record: NotificationRecord = {
        id: svc.ids.next('ntf'),
        ...body,
        status: 'sent',
        receivedAt: svc.ctx.now().toISOString(),
      };
      stored.push(record);
      return { status: 202, body: { id: record.id, status: record.status } };
    });
  });
}
