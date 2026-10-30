/** Record retention for pets (FR-10): at least 24 months after the last booking. Deleting is an audited admin event. */
import { eq, max } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import type { Clock } from '@petcare/shared/clock';
import { platformRules } from '@petcare/shared/config';
import { recordAdminAction } from '../auth/audit.ts';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import { bookings, careHistory, petPhotos, pets } from '../db/schema/index.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

/** The date plus a number of calendar months (end of month safe). */
export function addMonths(date: string, months: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d.toISOString().slice(0, 10);
}

export function registerRetentionRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; clock: Clock },
) {
  const { db, authn, clock } = deps;
  const admin = { preHandler: authn.requireRole('admin') };
  const today = () => clock.now().toISOString().slice(0, 10);

  async function status(petId: string) {
    const [pet] = await db.select().from(pets).where(eq(pets.id, petId));
    if (!pet) return null;
    const [last] = await db
      .select({ end: max(bookings.endDate) })
      .from(bookings)
      .where(eq(bookings.petId, petId));
    const lastEnd = last?.end ?? null;
    const retainedUntil = lastEnd ? addMonths(lastEnd, platformRules.retentionMonths) : null;
    return {
      pet,
      lastBookingEnd: lastEnd,
      retainedUntil,
      withinWindow: retainedUntil !== null && today() <= retainedUntil,
    };
  }

  app.get('/admin/retention/pets/:id', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const s = await status(id);
    if (!s) return refuse(reply, 404, 'pet_not_found', 'No such pet');
    return {
      petId: id,
      archived: s.pet.archivedAt !== null,
      lastBookingEnd: s.lastBookingEnd,
      retainedUntil: s.retainedUntil,
      withinWindow: s.withinWindow,
      months: platformRules.retentionMonths,
    };
  });

  app.delete('/admin/records/pets/:id', admin, async (request, reply) => {
    const { id } = request.params as { id: string };
    const s = await status(id);
    if (!s) return refuse(reply, 404, 'pet_not_found', 'No such pet');
    if (s.pet.archivedAt === null)
      return refuse(reply, 409, 'not_archived', 'Only an archived pet can be deleted');
    if (s.withinWindow)
      return refuse(
        reply,
        409,
        'within_retention',
        'Records are kept for 24 months after the last booking',
      );
    const used = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.petId, id))
      .limit(1);
    if (used.length > 0)
      return refuse(
        reply,
        409,
        'has_booking_records',
        'This pet has old booking records; purging those is not built yet',
      );
    await db.transaction(async (tx) => {
      await tx.delete(careHistory).where(eq(careHistory.petId, id));
      await tx.delete(petPhotos).where(eq(petPhotos.petId, id));
      await tx.delete(pets).where(eq(pets.id, id));
    });
    await recordAdminAction(db, {
      adminId: request.currentUser!.id,
      action: 'record.pet_deleted',
      targetType: 'pet',
      targetId: id,
      payload: {
        name: s.pet.name,
        lastBookingEnd: s.lastBookingEnd,
        retainedUntil: s.retainedUntil,
      },
    });
    return { deleted: true };
  });
}
