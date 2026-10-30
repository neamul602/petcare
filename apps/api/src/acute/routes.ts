import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { Authenticator } from '../auth/guards.ts';
import { EVENT_TYPES, SEVERITIES, type AcuteService } from './service.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

const schema = z.strictObject({
  type: z.enum(EVENT_TYPES),
  severity: z.enum(SEVERITIES),
  observation: z.string().trim().min(3).max(2000),
});

export function registerAcuteRoutes(
  app: FastifyInstance,
  deps: { authn: Authenticator; service: AcuteService },
) {
  const { authn, service } = deps;

  app.post(
    '/provider/bookings/:id/acute-event',
    { preHandler: authn.requireRole('provider') },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const input = schema.parse(request.body);
      const result = await service.report(request.currentUser!.id, id, input);
      if (result.ok)
        return reply.code(201).send({
          event: { id: result.event.id, triggeredAt: result.event.triggeredAt },
          next: ['payout_frozen', 'admin_alerted', 'owner_can_see_banner', 'vet_clinics_shown'],
        });
      if (result.reason === 'not_found')
        return refuse(reply, 404, 'booking_not_found', 'No such booking');
      return refuse(
        reply,
        409,
        'not_in_stay',
        'A concern can be reported while the stay is in progress',
      );
    },
  );

  app.get('/admin/acute-events', { preHandler: authn.requireRole('admin') }, async () => ({
    events: (await service.list()).map((e) => ({
      id: e.id,
      bookingId: e.bookingId,
      providerId: e.providerId,
      type: e.type,
      severity: e.severity,
      observation: e.observation,
      status: e.status,
      triggeredAt: e.triggeredAt,
      ownerNotifiedAt: e.ownerNotifiedAt,
      secondsToOwnerNotice: Math.round(
        (e.ownerNotifiedAt.getTime() - e.triggeredAt.getTime()) / 1000,
      ),
    })),
  }));
}
