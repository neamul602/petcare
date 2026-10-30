/** Vetting records, requests for information, appeals and the decisions list (SUP-02, SUP-03). Admin only; never public. */
import { randomUUID } from 'node:crypto';
import { desc, eq, inArray } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { recordAdminAction } from '../auth/audit.ts';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import {
  providers,
  providerStatusEvents,
  vettingAppeals,
  vettingRecords,
} from '../db/schema/index.ts';
import { vettingGaps } from './provider-records.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

const recordSchema = z.strictObject({
  identityDone: z.boolean(),
  addressDone: z.boolean(),
  capabilityDone: z.boolean(),
  referencesNote: z.string().trim().max(500).default(''),
  outreachNote: z.string().trim().max(500).default(''),
  artifacts: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
});

export function registerVettingRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator },
) {
  const { db, authn } = deps;
  const admin = { preHandler: authn.requireRole('admin') };

  async function load(id: string) {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    if (!provider) return null;
    const [record] = await db
      .select()
      .from(vettingRecords)
      .where(eq(vettingRecords.providerId, id));
    return { provider, record };
  }

  app.get('/admin/providers/:id/vetting', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const found = await load(id);
    if (!found) return refuse(reply, 404, 'provider_not_found', 'No such provider');
    const appeals = await db
      .select()
      .from(vettingAppeals)
      .where(eq(vettingAppeals.providerId, id))
      .orderBy(desc(vettingAppeals.createdAt));
    return {
      status: found.provider.status,
      tier: found.provider.tier,
      record: found.record ?? {
        identityDone: false,
        addressDone: false,
        capabilityDone: false,
        referencesNote: '',
        outreachNote: '',
        artifacts: [],
        awaitingInfo: false,
        infoRequest: '',
      },
      missing: await vettingGaps(db, found.provider),
      appeals,
    };
  });

  app.put('/admin/providers/:id/vetting', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = recordSchema.parse(request.body);
    if (!(await load(id))) return refuse(reply, 404, 'provider_not_found', 'No such provider');
    // New information from the provider arrives with a saved record, so the request for information is closed.
    await db
      .insert(vettingRecords)
      .values({ providerId: id, ...input, awaitingInfo: false, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: vettingRecords.providerId,
        set: { ...input, awaitingInfo: false, updatedAt: new Date() },
      });
    await recordAdminAction(db, {
      adminId: request.currentUser!.id,
      action: 'vetting.record_updated',
      targetType: 'provider',
      targetId: id,
      payload: {
        identityDone: input.identityDone,
        addressDone: input.addressDone,
        capabilityDone: input.capabilityDone,
        artifacts: input.artifacts.length,
      },
    });
    return { saved: true };
  });

  app.post('/admin/providers/:id/request-info', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { note } = z
      .strictObject({ note: z.string().trim().min(3).max(500) })
      .parse(request.body);
    if (!(await load(id))) return refuse(reply, 404, 'provider_not_found', 'No such provider');
    await db
      .insert(vettingRecords)
      .values({ providerId: id, awaitingInfo: true, infoRequest: note })
      .onConflictDoUpdate({
        target: vettingRecords.providerId,
        set: { awaitingInfo: true, infoRequest: note, updatedAt: new Date() },
      });
    await recordAdminAction(db, {
      adminId: request.currentUser!.id,
      action: 'vetting.info_requested',
      targetType: 'provider',
      targetId: id,
      payload: { note },
    });
    return { awaitingInfo: true };
  });

  app.post('/admin/providers/:id/appeals', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { note } = z
      .strictObject({ note: z.string().trim().min(3).max(1000) })
      .parse(request.body);
    const found = await load(id);
    if (!found) return refuse(reply, 404, 'provider_not_found', 'No such provider');
    if (found.provider.status !== 'removed')
      return refuse(reply, 409, 'not_declined', 'An appeal is recorded for a declined provider');
    const appealId = `appeal_${randomUUID()}`;
    await db.insert(vettingAppeals).values({
      id: appealId,
      providerId: id,
      note,
      recordedBy: `admin:${request.currentUser!.id}`,
    });
    await recordAdminAction(db, {
      adminId: request.currentUser!.id,
      action: 'vetting.appeal_recorded',
      targetType: 'provider',
      targetId: id,
      payload: { appealId },
    });
    return reply.code(201).send({ appeal: { id: appealId, outcome: 'pending' } });
  });

  app.put('/admin/appeals/:id', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { outcome } = z
      .strictObject({ outcome: z.enum(['upheld', 'overturned']) })
      .parse(request.body);
    const [appeal] = await db
      .update(vettingAppeals)
      .set({ outcome })
      .where(eq(vettingAppeals.id, id))
      .returning();
    if (!appeal) return refuse(reply, 404, 'appeal_not_found', 'No such appeal');
    await recordAdminAction(db, {
      adminId: request.currentUser!.id,
      action: 'vetting.appeal_outcome',
      targetType: 'provider',
      targetId: appeal.providerId,
      payload: { appealId: id, outcome },
    });
    return { appeal: { id, outcome } };
  });

  /** Every approval and decline with its reason, for bias review. */
  app.get('/admin/vetting/decisions', admin, async () => {
    const events = await db
      .select({ e: providerStatusEvents, p: providers })
      .from(providerStatusEvents)
      .innerJoin(providers, eq(providerStatusEvents.providerId, providers.id))
      .where(inArray(providerStatusEvents.toValue, ['approved', 'removed']))
      .orderBy(desc(providerStatusEvents.createdAt));
    return {
      decisions: events
        .filter(
          ({ e }) => e.kind === 'status' && ['applied', 'vetting'].includes(e.fromValue ?? ''),
        )
        .map(({ e, p }) => ({
          providerId: p.id,
          name: p.nameEn,
          tier: p.tier,
          neighbourhood: p.neighbourhoodId,
          decision: e.toValue === 'approved' ? 'approved' : 'declined',
          reason: e.reason,
          adminId: e.adminId,
          at: e.createdAt,
        })),
    };
  });
}
