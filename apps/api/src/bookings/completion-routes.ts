/** Completion and after-confirmation paths: provider, owner and admin endpoints (BKG-15, BKG-11). */
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { recordAdminAction } from '../auth/audit.ts';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import type { CompletionService } from './completion-service.ts';
import { listFlags, resolveFlags } from './flags.ts';
import type { Clock } from '@petcare/shared/clock';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

const note = z.string().trim().max(300).default('');
const reason = z.string().trim().min(3).max(300);
const MESSAGES: Record<string, [number, string]> = {
  not_found: [404, 'No such booking'],
  not_in_stay: [409, 'The stay is not in progress'],
  too_early: [409, 'That is not possible yet'],
  not_requested: [409, 'The provider has not marked this stay complete yet'],
  not_confirmed: [409, 'The booking is not in the confirmed state'],
  wrong_state: [409, 'The booking is not in a state this decision applies to'],
  invalid_amount: [422, 'Enter a refund amount'],
  refund_failed: [502, 'The refund could not be made'],
};
const fail = (reply: FastifyReply, why: string, detail?: string) => {
  const [status, message] = MESSAGES[why] ?? [409, 'Not possible'];
  return refuse(reply, status, detail ? `${why}_${detail}` : why, message);
};

export function registerCompletionRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; service: CompletionService; clock: Clock },
) {
  const { db, authn, service, clock } = deps;
  const provider = { preHandler: authn.requireRole('provider') };
  const owner = { preHandler: authn.requireRole('owner') };
  const admin = { preHandler: authn.requireRole('admin') };
  const idOf = (r: { params: unknown }) => (r.params as { id: string }).id;

  app.post('/provider/bookings/:id/complete', provider, async (request, reply) => {
    const result = await service.providerMarksComplete(request.currentUser!.id, idOf(request));
    return result.ok
      ? { booking: { id: idOf(request), state: result.booking.state, completionRequested: true } }
      : fail(reply, result.reason);
  });
  app.post('/provider/bookings/:id/cancel', provider, async (request, reply) => {
    const { note: why } = z.strictObject({ note: reason }).parse(request.body);
    const result = await service.providerCancels(request.currentUser!.id, idOf(request), why);
    return result.ok ? { requested: true } : fail(reply, result.reason);
  });
  app.post('/provider/bookings/:id/no-show', provider, async (request, reply) => {
    const { note: why } = z.strictObject({ note }).parse(request.body ?? {});
    const result = await service.providerFlagsNoShow(request.currentUser!.id, idOf(request), why);
    return result.ok
      ? { booking: { id: idOf(request), state: result.booking.state } }
      : fail(reply, result.reason);
  });

  app.post('/owner/bookings/:id/confirm-completion', owner, async (request, reply) => {
    const result = await service.ownerConfirmsCompletion(request.currentUser!.id, idOf(request));
    return result.ok
      ? { booking: { id: idOf(request), state: result.booking.state } }
      : fail(reply, result.reason);
  });
  app.post('/owner/bookings/:id/request-cancellation', owner, async (request, reply) => {
    const { note: why } = z.strictObject({ note }).parse(request.body ?? {});
    const result = await service.ownerRequestsCancellation(
      request.currentUser!.id,
      idOf(request),
      why,
    );
    return result.ok ? { requested: true } : fail(reply, result.reason);
  });

  app.post('/admin/bookings/:id/complete', admin, async (request, reply) => {
    const { reason: why } = z.strictObject({ reason }).parse(request.body);
    const adminId = request.currentUser!.id;
    const result = await service.adminCompletes(adminId, idOf(request));
    if (!result.ok) return fail(reply, result.reason);
    await recordAdminAction(db, {
      adminId,
      action: 'booking.completed_by_admin',
      targetType: 'booking',
      targetId: idOf(request),
      payload: { reason: why },
    });
    return { booking: { id: idOf(request), state: result.booking.state } };
  });

  app.post('/admin/bookings/:id/resolve-cancellation', admin, async (request, reply) => {
    const input = z
      .strictObject({
        decision: z.enum(['refund_full', 'refund_partial', 'no_action']),
        amountPoisha: z.number().int().positive().optional(),
        note: reason,
      })
      .parse(request.body);
    const adminId = request.currentUser!.id;
    const result = await service.adminResolvesCancellation(adminId, idOf(request), input);
    if (!result.ok) return fail(reply, result.reason, result.detail);
    await recordAdminAction(db, {
      adminId,
      action: 'booking.cancellation_resolved',
      targetType: 'booking',
      targetId: idOf(request),
      payload: input,
    });
    return { resolved: true };
  });

  app.post('/admin/bookings/:id/resolve-no-show', admin, async (request, reply) => {
    const input = z
      .strictObject({
        decision: z.enum(['keep_funds', 'refund']),
        amountPoisha: z.number().int().positive().optional(),
        rationale: reason,
      })
      .parse(request.body);
    const adminId = request.currentUser!.id;
    const result = await service.adminResolvesNoShow(adminId, idOf(request), input);
    if (!result.ok) return fail(reply, result.reason, result.detail);
    await recordAdminAction(db, {
      adminId,
      action: 'booking.no_show_resolved',
      targetType: 'booking',
      targetId: idOf(request),
      payload: input,
    });
    return { resolved: true };
  });

  app.get('/admin/flags', admin, async (request) => {
    const { status } = request.query as { status?: 'open' | 'resolved' };
    return { flags: await listFlags(db, status) };
  });
  app.post('/admin/flags/:id/resolve', admin, async (request, reply) => {
    const { note: why } = z.strictObject({ note: reason }).parse(request.body);
    const { id } = request.params as { id: string };
    const rows = await listFlags(db, 'open');
    const flag = rows.find((f) => f.id === id);
    if (!flag) return refuse(reply, 404, 'flag_not_found', 'No such open item');
    await resolveFlags(
      db,
      clock,
      flag.bookingId,
      [flag.kind],
      why,
      `admin:${request.currentUser!.id}`,
    );
    return { resolved: true };
  });
}
