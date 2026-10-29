/** Provider calendar and capacity (SRC-01), public search and availability (SRC-04, SUP-04 availability strip). */
import { eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { Clock } from '@petcare/shared/clock';
import { platformRules } from '@petcare/shared/config';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import { providers } from '../db/schema/index.ts';
import { addDays, checkWindow, dhakaToday, isCalendarDate } from './dates.ts';
import { MAX_CAPACITY, nightsFor, setCapacity } from './nights.ts';
import { searchProviders } from './search.ts';

const refuse = (
  reply: FastifyReply,
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
) => reply.code(status).send({ error: { code, message, ...extra } });

const WINDOW_MESSAGES = {
  invalid_dates: 'Check-out must be after check-in',
  dates_in_past: 'Check-in cannot be in the past',
  window_too_long: 'A stay can be at most 30 nights',
} as const;

const dateField = z.string().refine(isCalendarDate, 'Use a date like 2026-12-05');
const searchSchema = z.object({
  from: dateField,
  to: dateField,
  species: z.enum(['dog', 'cat']),
  area: z.union([z.string(), z.array(z.string())]).optional(),
  all: z.enum(['1', 'true']).optional(),
});
const capacitySchema = z.strictObject({
  dates: z.array(dateField).min(1).max(62),
  capacity: z.number().int().min(0).max(MAX_CAPACITY),
  note: z.string().trim().max(200).optional(),
});

export function registerCapacityRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; clock: Clock },
) {
  const { db, authn, clock } = deps;
  const provider = { preHandler: authn.requireRole('provider') };

  async function myProvider(userId: string) {
    const [row] = await db.select().from(providers).where(eq(providers.userId, userId));
    return row ?? null;
  }

  app.get('/provider/calendar', provider, async (request, reply) => {
    const mine = await myProvider(request.currentUser!.id);
    if (!mine)
      return refuse(reply, 404, 'no_provider_record', 'No provider record for this account');
    const query = request.query as { from?: string; days?: string };
    const from = query.from && isCalendarDate(query.from) ? query.from : dhakaToday(clock);
    const days = Math.min(Math.max(Number(query.days) || 14, 1), 62);
    const nights = await nightsFor(db, mine.id, from, addDays(from, days));
    return {
      from,
      baseline: mine.capacitySmall,
      nights: nights.map((n) => ({
        ...n,
        status: n.capacity === 0 ? 'closed' : n.free === 0 ? 'full' : 'available',
      })),
    };
  });

  app.put('/provider/capacity', provider, async (request, reply) => {
    const mine = await myProvider(request.currentUser!.id);
    if (!mine)
      return refuse(reply, 404, 'no_provider_record', 'No provider record for this account');
    const input = capacitySchema.parse(request.body);
    const result = await setCapacity(db, mine.id, input.dates, input.capacity, input.note);
    if (result.ok) return { nights: result.nights };
    return refuse(
      reply,
      409,
      'capacity_below_booked',
      'Some of these nights already have more pets booked than this',
      { conflicts: result.conflicts },
    );
  });

  app.get('/search', async (request, reply) => {
    const query = searchSchema.parse(request.query);
    const problem = checkWindow(query.from, query.to, dhakaToday(clock));
    if (problem) return refuse(reply, 422, problem, WINDOW_MESSAGES[problem]);
    const launch = platformRules.launchNeighbourhoods as readonly string[];
    const requested = query.area === undefined ? [...launch] : [query.area].flat();
    if (requested.some((a) => !launch.includes(a)))
      return refuse(
        reply,
        422,
        'unknown_neighbourhood',
        'PetCare is only in the launch neighbourhoods',
      );
    return searchProviders(db, {
      from: query.from,
      to: query.to,
      species: query.species,
      areas: requested,
      all: !!query.all,
    });
  });

  app.get('/providers/:slug/availability', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const query = z.object({ from: dateField, to: dateField }).parse(request.query);
    const problem = checkWindow(query.from, query.to, dhakaToday(clock));
    if (problem) return refuse(reply, 422, problem, WINDOW_MESSAGES[problem]);
    const [row] = await db.select().from(providers).where(eq(providers.slug, slug));
    if (!row || row.status !== 'approved')
      return refuse(reply, 404, 'provider_not_found', 'No such provider');
    const nights = await nightsFor(db, row.id, query.from, query.to);
    return {
      nights: nights.map((n) => ({ date: n.date, available: n.free > 0 })),
      allAvailable: nights.every((n) => n.free > 0),
    };
  });
}
