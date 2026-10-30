/** Stay endpoints: start, post and read updates, serve update photos, vet clinics. */
import { and, eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import { bookings, providers, updatePhotos, dailyUpdates, vetClinics } from '../db/schema/index.ts';
import type { PhotoPort } from '../pets/photo-port.ts';
import { PhotoUnavailableError } from '../pets/photo-port.ts';
import { careLogSchema, MAX_UPDATE_PHOTOS, type StayService } from './stay-service.ts';

const refuse = (reply: FastifyReply, status: number, code: string, message: string) =>
  reply.code(status).send({ error: { code, message } });

export function registerStayRoutes(
  app: FastifyInstance,
  deps: { db: Database; authn: Authenticator; service: StayService; photos: PhotoPort },
) {
  const { db, authn, service, photos } = deps;
  const provider = { preHandler: authn.requireRole('provider') };
  const signedIn = { preHandler: [authn.requireRole('owner', 'provider')] };

  /** The booking and the provider record, only for the booking's own owner or provider. */
  async function visibleBooking(user: { id: string; role: string }, bookingId: string) {
    const [row] = await db
      .select({ booking: bookings, provider: providers })
      .from(bookings)
      .innerJoin(providers, eq(bookings.providerId, providers.id))
      .where(eq(bookings.id, bookingId));
    if (!row) return null;
    const mine =
      user.role === 'owner' ? row.booking.ownerId === user.id : row.provider.userId === user.id;
    return mine ? row : null;
  }

  app.post('/provider/bookings/:id/start', provider, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await service.startStay(request.currentUser!.id, id);
    if (result.ok) return { booking: { id, state: result.booking.state } };
    if (result.reason === 'not_found')
      return refuse(reply, 404, 'booking_not_found', 'No such booking');
    if (result.reason === 'too_early')
      return refuse(reply, 409, 'too_early', 'A stay can start on its start date, not before');
    return refuse(reply, 409, 'not_confirmed', 'Only a confirmed booking can start');
  });

  app.post('/provider/bookings/:id/updates', provider, async (request, reply) => {
    const { id } = request.params as { id: string };
    if (!request.isMultipart())
      return refuse(reply, 415, 'multipart_required', 'Send the update as a form');
    let note = '';
    let careLogRaw: unknown = {};
    const files: Array<{ bytes: Buffer; filename: string }> = [];
    for await (const part of request.parts({
      limits: { files: MAX_UPDATE_PHOTOS + 1, fileSize: 5 * 1024 * 1024, fields: 5 },
    })) {
      if (part.type === 'file') {
        const bytes = await part.toBuffer();
        if (bytes.length > 0) files.push({ bytes, filename: part.filename || 'update.jpg' });
      } else if (part.fieldname === 'note') note = String(part.value);
      else if (part.fieldname === 'careLog') {
        try {
          careLogRaw = JSON.parse(String(part.value));
        } catch {
          return refuse(reply, 400, 'invalid_request', 'The care log is not valid');
        }
      }
    }
    const careLog = careLogSchema.parse(careLogRaw);
    if (note.length > 500)
      return refuse(reply, 400, 'invalid_request', 'The note can be at most 500 characters');
    const result = await service.postUpdate(request.currentUser!.id, id, { note, careLog, files });
    if (result.ok)
      return reply.code(201).send({ update: { id: result.updateId, photos: result.photos } });
    if (result.reason === 'not_found')
      return refuse(reply, 404, 'booking_not_found', 'No such booking');
    if (result.reason === 'not_in_stay')
      return refuse(
        reply,
        409,
        'not_in_stay',
        'Updates can be posted while the stay is in progress',
      );
    if (result.reason === 'too_many_photos')
      return refuse(
        reply,
        409,
        'too_many_photos',
        `An update can have at most ${MAX_UPDATE_PHOTOS} photos`,
      );
    if (result.reason === 'photo_rejected')
      return refuse(
        reply,
        result.detail === 'photo_too_large' ? 413 : 415,
        result.detail ?? 'photo_rejected',
        'That photo cannot be used',
      );
    return refuse(
      reply,
      503,
      'photo_unavailable',
      'Photo storage is not available right now; try again',
    );
  });

  app.get('/bookings/:id/updates', signedIn, async (request, reply) => {
    const { id } = request.params as { id: string };
    const found = await visibleBooking(request.currentUser!, id);
    if (!found) return refuse(reply, 404, 'booking_not_found', 'No such booking');
    return {
      updates: (await service.listUpdates(id)).map((u) => ({
        ...u,
        photos: u.photos.map((photoId) => `/api/bookings/${id}/photos/${photoId}`),
      })),
    };
  });

  app.get('/bookings/:id/photos/:photoId', signedIn, async (request, reply) => {
    const { id, photoId } = request.params as { id: string; photoId: string };
    if (!(await visibleBooking(request.currentUser!, id)))
      return refuse(reply, 404, 'booking_not_found', 'No such booking');
    const [photo] = await db
      .select({ p: updatePhotos })
      .from(updatePhotos)
      .innerJoin(dailyUpdates, eq(updatePhotos.updateId, dailyUpdates.id))
      .where(and(eq(updatePhotos.id, photoId), eq(dailyUpdates.bookingId, id)));
    if (!photo) return refuse(reply, 404, 'photo_not_found', 'No such photo');
    try {
      const stored = await photos.fetch(photo.p.storageId);
      if (!stored) return refuse(reply, 404, 'photo_not_found', 'No such photo');
      return reply
        .header('content-type', stored.contentType)
        .header('cache-control', 'private, max-age=3600')
        .send(stored.bytes);
    } catch (error) {
      if (error instanceof PhotoUnavailableError)
        return refuse(
          reply,
          503,
          'photo_unavailable',
          'Photo storage is not available right now; try again',
        );
      throw error;
    }
  });

  /** A lookup of clinics in the booking's neighbourhood, not a recommendation (FR-45). */
  app.get('/bookings/:id/vet-clinics', signedIn, async (request, reply) => {
    const { id } = request.params as { id: string };
    const found = await visibleBooking(request.currentUser!, id);
    if (!found) return refuse(reply, 404, 'booking_not_found', 'No such booking');
    if (!['captured', 'in_stay'].includes(found.booking.state))
      return refuse(
        reply,
        409,
        'booking_not_active',
        'Vet clinics are shown for an active booking',
      );
    const rows = await db
      .select()
      .from(vetClinics)
      .where(eq(vetClinics.neighbourhoodId, found.provider.neighbourhoodId));
    return {
      lookupOnly: true,
      clinics: rows.map((c) => ({
        id: c.id,
        name: { en: c.nameEn, bn: c.nameBn },
        address: { en: c.addressEn, bn: c.addressBn },
        phone: c.phone,
        hours: { en: c.hoursEn, bn: c.hoursBn },
        species: c.species,
      })),
    };
  });
}
