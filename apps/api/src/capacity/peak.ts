/** Peak windows (SRC-02): admin-defined date ranges. A stay that overlaps one is a peak stay (TD-1, TD-8). */
import { randomUUID } from 'node:crypto';
import { and, asc, eq, gte, lte } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { Clock } from '@petcare/shared/clock';
import { recordAdminAction } from '../auth/audit.ts';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import { peakWindows, providers } from '../db/schema/index.ts';
import { addDays, dhakaToday, isCalendarDate, nightsBetween } from './dates.ts';
import { MAX_CAPACITY, setCapacity } from './nights.ts';

/** True when any night of [from, to) falls inside a peak window. */
export async function isPeakStay(db: Database, from: string, to: string): Promise<boolean> {
  const lastNight = addDays(to, -1);
  const rows = await db
    .select({ id: peakWindows.id })
    .from(peakWindows)
    .where(and(lte(peakWindows.startDate, lastNight), gte(peakWindows.endDate, from)))
    .limit(1);
  return rows.length > 0;
}

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });
const date = z.string().refine(isCalendarDate, 'Use a date like 2026-12-05');

export function registerPeakRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; clock: Clock },
) {
  const { db, authn, clock } = deps;

  /** Everyone can see the windows that have not ended yet. */
  app.get('/peak-windows', async () => ({
    windows: await db
      .select()
      .from(peakWindows)
      .where(gte(peakWindows.endDate, dhakaToday(clock)))
      .orderBy(asc(peakWindows.startDate)),
  }));

  app.post(
    '/admin/peak-windows',
    { preHandler: authn.requireRole('admin') },
    async (request, reply) => {
      const input = z
        .strictObject({ name: z.string().trim().min(2).max(60), startDate: date, endDate: date })
        .parse(request.body);
      if (input.endDate < input.startDate)
        return refuse(reply, 422, 'invalid_dates', 'The end must not be before the start');
      const id = `peak_${randomUUID()}`;
      const adminId = request.currentUser!.id;
      await db.insert(peakWindows).values({
        id,
        name: input.name,
        startDate: input.startDate,
        endDate: input.endDate,
        createdBy: adminId,
      });
      await recordAdminAction(db, {
        adminId,
        action: 'peak_window.created',
        targetType: 'peak_window',
        targetId: id,
        payload: input,
      });
      return reply.code(201).send({ window: { id, ...input } });
    },
  );

  /** One action: every night of the window gets this capacity. Raising is always allowed; lowering below bookings is refused. */
  app.post(
    '/provider/capacity/expand-peak',
    { preHandler: authn.requireRole('provider') },
    async (request, reply) => {
      const input = z
        .strictObject({ windowId: z.string(), capacity: z.number().int().min(0).max(MAX_CAPACITY) })
        .parse(request.body);
      const [mine] = await db
        .select()
        .from(providers)
        .where(eq(providers.userId, request.currentUser!.id));
      if (!mine)
        return refuse(reply, 404, 'no_provider_record', 'No provider record for this account');
      const [window] = await db
        .select()
        .from(peakWindows)
        .where(eq(peakWindows.id, input.windowId));
      if (!window) return refuse(reply, 404, 'window_not_found', 'No such peak window');
      const dates = nightsBetween(window.startDate, addDays(window.endDate, 1));
      const result = await setCapacity(db, mine.id, dates, input.capacity, window.name);
      if (!result.ok)
        return refuse(
          reply,
          409,
          'capacity_below_booked',
          'Some nights already have more pets booked than this',
        );
      return { window: window.name, nights: result.nights.length, capacity: input.capacity };
    },
  );
}
