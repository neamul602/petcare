/** Public provider page data (SUP-04) and the admin's provider records (SUP-01). */
import { randomUUID } from 'node:crypto';
import { asc, desc, eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PROVIDER_STATUSES, TIERS, nextStatuses } from '@petcare/shared/providers';
import type { Authenticator } from '../auth/guards.ts';
import { recordAdminAction } from '../auth/audit.ts';
import type { Database } from '../db/client.ts';
import { neighbourhoods, providerStatusEvents, providers } from '../db/schema/index.ts';
import type { ReviewService } from '../reviews/service.ts';
import { changeTier, moveStatus, slugFor, type ProviderRow } from './provider-records.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

const reason = z.string().trim().min(3).max(300);
const createSchema = z.strictObject({
  name: z.strictObject({
    en: z.string().trim().min(1).max(80),
    bn: z.string().trim().min(1).max(80),
  }),
  tier: z.enum(TIERS),
  neighbourhood: z.string().min(1),
  species: z.array(z.enum(['dog', 'cat'])).min(1),
});
const statusSchema = z.strictObject({ to: z.enum(PROVIDER_STATUSES), reason });
const tierSchema = z.strictObject({ tier: z.enum(TIERS), reason });

export function registerProviderRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; reviews: ReviewService },
) {
  const { db, authn, reviews } = deps;
  const admin = { preHandler: authn.requireRole('admin') };

  const summary = (row: ProviderRow) => ({
    id: row.id,
    slug: row.slug,
    name: { en: row.nameEn, bn: row.nameBn },
    tier: row.tier,
    status: row.status,
    neighbourhood: row.neighbourhoodId,
    species: row.species,
    nextStatuses: nextStatuses(row.status),
  });

  /** What owners may see. Never includes the phone, the account id or anything from vetting. */
  app.get('/providers/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const [row] = await db
      .select({ provider: providers, area: neighbourhoods })
      .from(providers)
      .innerJoin(neighbourhoods, eq(providers.neighbourhoodId, neighbourhoods.id))
      .where(eq(providers.slug, slug));
    if (!row || row.provider.status !== 'approved')
      return refuse(reply, 404, 'provider_not_found', 'No such provider');
    const p = row.provider;
    return {
      provider: {
        slug: p.slug,
        name: { en: p.nameEn, bn: p.nameBn },
        tier: p.tier,
        area: { id: row.area.id, en: row.area.nameEn, bn: row.area.nameBn },
        species: p.species,
        capacity: { smallPets: p.capacitySmall },
        pricePerNightPoisha: p.pricePerNightPoisha,
        capabilities: p.capabilities,
        experience: { en: p.experienceEn, bn: p.experienceBn },
        photos: [],
        reviews: await reviews.aggregates(p.id),
      },
    };
  });

  app.get('/admin/providers', admin, async (request) => {
    const { status } = request.query as { status?: string };
    const rows = await db.select().from(providers).orderBy(asc(providers.createdAt));
    return { providers: rows.filter((r) => !status || r.status === status).map(summary) };
  });

  app.get('/admin/providers/:id', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const [row] = await db.select().from(providers).where(eq(providers.id, id));
    if (!row) return refuse(reply, 404, 'provider_not_found', 'No such provider');
    const history = await db
      .select()
      .from(providerStatusEvents)
      .where(eq(providerStatusEvents.providerId, id))
      .orderBy(desc(providerStatusEvents.createdAt));
    return {
      provider: {
        ...summary(row),
        pricePerNightPoisha: row.pricePerNightPoisha,
        capacitySmall: row.capacitySmall,
        capabilities: row.capabilities,
        hasAccount: row.userId !== null,
      },
      history: history.map((h) => ({
        kind: h.kind,
        from: h.fromValue,
        to: h.toValue,
        reason: h.reason,
        at: h.createdAt,
      })),
    };
  });

  /** The only way a provider record is created: an admin adds the application or outreach record. */
  app.post('/admin/providers', admin, async (request, reply) => {
    const input = createSchema.parse(request.body);
    const [area] = await db
      .select()
      .from(neighbourhoods)
      .where(eq(neighbourhoods.id, input.neighbourhood));
    if (!area) return refuse(reply, 422, 'unknown_neighbourhood', 'Unknown neighbourhood');
    const id = `prov_${randomUUID()}`;
    const [row] = await db
      .insert(providers)
      .values({
        id,
        slug: slugFor(input.name.en, id),
        nameEn: input.name.en,
        nameBn: input.name.bn,
        tier: input.tier,
        status: 'applied',
        neighbourhoodId: input.neighbourhood,
        species: input.species,
      })
      .returning();
    await recordAdminAction(db, {
      adminId: request.currentUser!.id,
      action: 'provider.created',
      targetType: 'provider',
      targetId: id,
      payload: { tier: input.tier },
    });
    return reply.code(201).send({ provider: summary(row!) });
  });

  app.post('/admin/providers/:id/status', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = statusSchema.parse(request.body);
    const result = await moveStatus(db, request.currentUser!.id, id, input.to, input.reason);
    if (result.ok) return { provider: summary(result.provider) };
    if (result.code === 'not_found')
      return refuse(reply, 404, 'provider_not_found', 'No such provider');
    if (result.code === 'vetting_incomplete')
      return reply.code(409).send({
        error: {
          code: 'vetting_incomplete',
          message: 'Complete the vetting checks first',
          missing: result.missing,
        },
      });
    if (result.code === 'profile_incomplete')
      return refuse(reply, 409, 'profile_incomplete', 'Add a price and capacity before approving');
    return refuse(reply, 409, 'invalid_transition', 'That status change is not allowed');
  });

  app.post('/admin/providers/:id/tier', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = tierSchema.parse(request.body);
    const result = await changeTier(db, request.currentUser!.id, id, input.tier, input.reason);
    if (result.ok) return { provider: summary(result.provider) };
    if (result.code === 'not_found')
      return refuse(reply, 404, 'provider_not_found', 'No such provider');
    return refuse(reply, 409, 'same_tier', 'The provider is already in that tier');
  });
}
