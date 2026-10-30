/** The provider's own profile (SUP-05). Tier and status are never editable here. */
import { eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CAPABILITIES } from '@petcare/shared/providers';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import { providers } from '../db/schema/index.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

const schema = z.strictObject({
  experience: z.strictObject({ en: z.string().trim().max(1000), bn: z.string().trim().max(1000) }),
  pricePerNightPoisha: z.number().int().min(10_000).max(10_000_000),
  species: z.array(z.enum(['dog', 'cat'])).min(1),
  capabilities: z.array(z.enum(CAPABILITIES)),
  capacitySmall: z.number().int().min(0).max(20),
});

/** What is still missing for a complete public profile. */
export function profileGaps(p: typeof providers.$inferSelect): string[] {
  const missing: string[] = [];
  if (!p.experienceEn.trim()) missing.push('experience_en');
  if (!p.experienceBn.trim()) missing.push('experience_bn');
  if (p.pricePerNightPoisha === null) missing.push('price');
  if (p.capacitySmall <= 0) missing.push('capacity');
  if (p.species.length === 0) missing.push('species');
  return missing;
}

export function registerProfileRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator },
) {
  const { db, authn } = deps;
  const provider = { preHandler: authn.requireRole('provider') };

  const view = (p: typeof providers.$inferSelect) => ({
    slug: p.slug,
    name: { en: p.nameEn, bn: p.nameBn },
    tier: p.tier,
    status: p.status,
    experience: { en: p.experienceEn, bn: p.experienceBn },
    pricePerNightPoisha: p.pricePerNightPoisha,
    species: p.species,
    capabilities: p.capabilities,
    capacitySmall: p.capacitySmall,
    missing: profileGaps(p),
  });

  app.get('/provider/profile', provider, async (request, reply) => {
    const [mine] = await db
      .select()
      .from(providers)
      .where(eq(providers.userId, request.currentUser!.id));
    return mine
      ? { profile: view(mine) }
      : refuse(reply, 404, 'no_provider_record', 'No provider record for this account');
  });

  app.put('/provider/profile', provider, async (request, reply) => {
    const input = schema.parse(request.body);
    const [mine] = await db
      .select()
      .from(providers)
      .where(eq(providers.userId, request.currentUser!.id));
    if (!mine)
      return refuse(reply, 404, 'no_provider_record', 'No provider record for this account');
    const [saved] = await db
      .update(providers)
      .set({
        experienceEn: input.experience.en,
        experienceBn: input.experience.bn,
        pricePerNightPoisha: input.pricePerNightPoisha,
        species: input.species,
        capabilities: input.capabilities,
        capacitySmall: input.capacitySmall,
        updatedAt: new Date(),
      })
      .where(eq(providers.id, mine.id))
      .returning();
    return { profile: view(saved!) };
  });
}
