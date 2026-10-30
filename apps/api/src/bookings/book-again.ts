/** The owner's bookings list and Book again (BKG-16, BKG-17). */
import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { Clock } from '@petcare/shared/clock';
import { pillFor } from '@petcare/shared/bookings';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import { bookAgainTimers, bookings, pets, providers } from '../db/schema/index.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

/** Closes the Book again timer when the new request is submitted. */
export async function closeBookAgainTimer(
  db: Database,
  clock: Clock,
  timerId: string,
  ownerId: string,
  bookingId: string,
) {
  await db
    .update(bookAgainTimers)
    .set({ submittedAt: clock.now(), bookingId })
    .where(and(eq(bookAgainTimers.id, timerId), eq(bookAgainTimers.ownerId, ownerId)));
}

export function registerBookAgainRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; clock: Clock },
) {
  const { db, authn, clock } = deps;
  const owner = { preHandler: authn.requireRole('owner') };
  const PAST = ['completed', 'declined', 'canceled', 'no_show', 'disputed', 'resolved', 'refunded'];

  app.get('/owner/bookings', owner, async (request) => {
    const rows = await db
      .select({ b: bookings, p: providers })
      .from(bookings)
      .innerJoin(providers, eq(bookings.providerId, providers.id))
      .where(eq(bookings.ownerId, request.currentUser!.id))
      .orderBy(desc(bookings.startDate));
    const view = (r: (typeof rows)[number]) => ({
      id: r.b.id,
      state: r.b.state,
      pill: pillFor(r.b.state),
      provider: { slug: r.p.slug, name: { en: r.p.nameEn, bn: r.p.nameBn } },
      pet: r.b.petSnapshot,
      startDate: r.b.startDate,
      endDate: r.b.endDate,
      nights: r.b.nights,
      totalPoisha: r.b.totalPoisha,
      canBookAgain: r.b.state === 'completed',
    });
    return {
      upcoming: rows.filter((r) => !PAST.includes(r.b.state)).map(view),
      past: rows.filter((r) => PAST.includes(r.b.state)).map(view),
    };
  });

  /** Tapping Book again starts the timer on the server and says what to pre-fill. */
  const petIsArchived = async (petId: string) => {
    const [p] = await db
      .select({ archivedAt: pets.archivedAt })
      .from(pets)
      .where(eq(pets.id, petId));
    return !p || p.archivedAt !== null;
  };

  app.post('/owner/book-again', owner, async (request, reply) => {
    const { bookingId } = z.strictObject({ bookingId: z.string() }).parse(request.body);
    const [row] = await db
      .select({ b: bookings, p: providers })
      .from(bookings)
      .innerJoin(providers, eq(bookings.providerId, providers.id))
      .where(and(eq(bookings.id, bookingId), eq(bookings.ownerId, request.currentUser!.id)));
    if (!row) return refuse(reply, 404, 'booking_not_found', 'No such booking');
    if (row.b.state !== 'completed')
      return refuse(reply, 409, 'not_completed', 'You can book again after a completed stay');
    const id = `ba_${randomUUID()}`;
    const startedAt = clock.now();
    await db.insert(bookAgainTimers).values({
      id,
      ownerId: request.currentUser!.id,
      sourceBookingId: bookingId,
      startedAt,
    });
    return reply.code(201).send({
      timerId: id,
      startedAt,
      providerSlug: row.p.slug,
      providerAvailable: row.p.status === 'approved',
      petArchived: await petIsArchived(row.b.petId),
    });
  });

  app.get('/owner/book-again/:id', owner, async (request, reply) => {
    const { id } = request.params as { id: string };
    const [row] = await db
      .select({ t: bookAgainTimers, b: bookings, p: providers })
      .from(bookAgainTimers)
      .innerJoin(bookings, eq(bookAgainTimers.sourceBookingId, bookings.id))
      .innerJoin(providers, eq(bookings.providerId, providers.id))
      .where(and(eq(bookAgainTimers.id, id), eq(bookAgainTimers.ownerId, request.currentUser!.id)));
    if (!row) return refuse(reply, 404, 'timer_not_found', 'No such Book again');
    const end = row.t.submittedAt ?? clock.now();
    return {
      startedAt: row.t.startedAt,
      submittedAt: row.t.submittedAt,
      elapsedSeconds: Math.round((end.getTime() - row.t.startedAt.getTime()) / 1000),
      provider: {
        slug: row.p.slug,
        name: { en: row.p.nameEn, bn: row.p.nameBn },
        available: row.p.status === 'approved',
      },
      prefill: {
        petId: (await petIsArchived(row.b.petId)) ? '' : row.b.petId,
        petName: (row.b.petSnapshot as { name?: string }).name ?? '',
        instructions: row.b.instructions,
        nights: row.b.nights,
      },
    };
  });
}
