/** Owner pet endpoints (FR-6..FR-9) and the provider's read-only care summary. */
import { randomUUID } from 'node:crypto';
import { and, asc, eq, isNull } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { MAX_PHOTOS, petInputSchema } from '@petcare/shared/pets';
import type { Authenticator } from '../auth/guards.ts';
import type { Database } from '../db/client.ts';
import { careHistory, petPhotos, pets, providers } from '../db/schema/index.ts';
import { appendLogEntry } from '../log/append.ts';
import { buildCareSummary, type PetAccessPolicy } from './care-summary.ts';
import { lastCompletedStay, listCareHistory } from './care-history.ts';
import { screenForClinicalPurpose } from './clinical-screen.ts';
import { PhotoRejectedError, PhotoUnavailableError, type PhotoPort } from './photo-port.ts';

export interface PetDeps {
  db: Database;
  authn: Authenticator;
  photos: PhotoPort;
  petAccess: PetAccessPolicy;
}

const refuse = (
  reply: FastifyReply,
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
) => reply.code(status).send({ error: { code, message, ...extra } });

const screenBody = z.strictObject({
  declaredClinical: z.boolean().optional(),
  confirmedNotClinical: z.boolean().optional(),
  text: z.string().max(5000).optional(),
  petId: z.string().optional(),
});

export function registerPetRoutes(app: FastifyInstance, deps: PetDeps) {
  const { db, authn, photos, petAccess } = deps;
  const owner = { preHandler: authn.requireRole('owner') };

  const photoUrl = (petId: string, photoId: string) => `/api/owner/pets/${petId}/photos/${photoId}`;

  async function ownedPet(ownerId: string, petId: string) {
    const [row] = await db
      .select()
      .from(pets)
      .where(and(eq(pets.id, petId), eq(pets.ownerId, ownerId)));
    return row ?? null;
  }
  async function photosOf(petId: string) {
    return db
      .select()
      .from(petPhotos)
      .where(eq(petPhotos.petId, petId))
      .orderBy(asc(petPhotos.position));
  }
  async function view(row: typeof pets.$inferSelect) {
    const list = await photosOf(row.id);
    return {
      id: row.id,
      name: row.name,
      species: row.species,
      breed: row.breed,
      ageYears: row.ageYears,
      weightKg: row.weightKg,
      sex: row.sex,
      neutered: row.neutered,
      vaccination: row.vaccination,
      behaviour: row.behaviour,
      dogDetails: row.dogDetails,
      catDetails: row.catDetails,
      carePlan: row.carePlan,
      archived: row.archivedAt !== null,
      photos: list.map((photo) => ({
        id: photo.id,
        url: photoUrl(row.id, photo.id),
        contentType: photo.contentType,
      })),
    };
  }

  app.post('/owner/pets', owner, async (request, reply) => {
    const input = petInputSchema.parse(request.body);
    const [row] = await db
      .insert(pets)
      .values({ id: `pet_${randomUUID()}`, ownerId: request.currentUser!.id, ...input })
      .returning();
    return reply.code(201).send({ pet: await view(row!) });
  });

  app.get('/owner/pets', owner, async (request) => {
    const rows = await db
      .select()
      .from(pets)
      .where(and(eq(pets.ownerId, request.currentUser!.id), isNull(pets.archivedAt)))
      .orderBy(asc(pets.createdAt));
    const out = [];
    for (const row of rows) {
      const first = (await photosOf(row.id))[0];
      out.push({
        id: row.id,
        name: row.name,
        species: row.species,
        breed: row.breed,
        ageYears: row.ageYears,
        photo: first ? photoUrl(row.id, first.id) : null,
      });
    }
    return { pets: out };
  });

  app.get('/owner/pets/:id', owner, async (request, reply) => {
    const pet = await ownedPet(request.currentUser!.id, (request.params as { id: string }).id);
    return pet ? { pet: await view(pet) } : refuse(reply, 404, 'pet_not_found', 'No such pet');
  });

  app.put('/owner/pets/:id', owner, async (request, reply) => {
    const pet = await ownedPet(request.currentUser!.id, (request.params as { id: string }).id);
    if (!pet) return refuse(reply, 404, 'pet_not_found', 'No such pet');
    if (pet.archivedAt) return refuse(reply, 409, 'pet_archived', 'This pet is archived');
    const input = petInputSchema.parse(request.body);
    const [row] = await db
      .update(pets)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(pets.id, pet.id))
      .returning();
    return { pet: await view(row!) };
  });

  app.post('/owner/pets/:id/archive', owner, async (request, reply) => {
    const pet = await ownedPet(request.currentUser!.id, (request.params as { id: string }).id);
    if (!pet) return refuse(reply, 404, 'pet_not_found', 'No such pet');
    if (!pet.archivedAt)
      await db
        .update(pets)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(eq(pets.id, pet.id));
    return { status: 'archived' };
  });

  // ---- photos (1 to 5, up to 5 MB, stored through the photo port)
  app.post('/owner/pets/:id/photos', owner, async (request, reply) => {
    const pet = await ownedPet(request.currentUser!.id, (request.params as { id: string }).id);
    if (!pet) return refuse(reply, 404, 'pet_not_found', 'No such pet');
    if (!request.isMultipart())
      return refuse(
        reply,
        415,
        'multipart_required',
        'Upload the photo as a form with a "file" field',
      );
    const existing = await photosOf(pet.id);
    if (existing.length >= MAX_PHOTOS)
      return refuse(reply, 409, 'too_many_photos', `A pet can have at most ${MAX_PHOTOS} photos`);
    const upload = await request.file();
    if (!upload || upload.fieldname !== 'file')
      return refuse(reply, 400, 'file_required', 'Send the photo in a field named "file"');
    const bytes = await upload.toBuffer(); // throws above 5 MB (handled as photo_too_large)
    try {
      const stored = await photos.upload({
        bytes,
        filename: upload.filename || 'pet.jpg',
        tag: `pet:${pet.id}`,
      });
      const id = `pp_${randomUUID()}`;
      const position =
        existing.length === 0 ? 0 : Math.max(...existing.map((photo) => photo.position)) + 1;
      await db.insert(petPhotos).values({
        id,
        petId: pet.id,
        storageId: stored.id,
        contentType: stored.contentType,
        size: stored.size,
        position,
      });
      return reply
        .code(201)
        .send({ photo: { id, url: photoUrl(pet.id, id), contentType: stored.contentType } });
    } catch (error) {
      if (error instanceof PhotoRejectedError)
        return refuse(
          reply,
          error.code === 'photo_too_large' ? 413 : 415,
          error.code,
          error.message,
        );
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

  app.get('/owner/pets/:id/photos/:photoId', owner, async (request, reply) => {
    const { id, photoId } = request.params as { id: string; photoId: string };
    const pet = await ownedPet(request.currentUser!.id, id);
    if (!pet) return refuse(reply, 404, 'pet_not_found', 'No such pet');
    const [photo] = await db
      .select()
      .from(petPhotos)
      .where(and(eq(petPhotos.id, photoId), eq(petPhotos.petId, pet.id)));
    if (!photo) return refuse(reply, 404, 'photo_not_found', 'No such photo');
    try {
      const stored = await photos.fetch(photo.storageId);
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

  app.delete('/owner/pets/:id/photos/:photoId', owner, async (request, reply) => {
    const { id, photoId } = request.params as { id: string; photoId: string };
    const pet = await ownedPet(request.currentUser!.id, id);
    if (!pet) return refuse(reply, 404, 'pet_not_found', 'No such pet');
    await db.delete(petPhotos).where(and(eq(petPhotos.id, photoId), eq(petPhotos.petId, pet.id)));
    return { status: 'removed' };
  });

  // ---- care history and pre-fill
  app.get('/owner/pets/:id/care-history', owner, async (request, reply) => {
    const pet = await ownedPet(request.currentUser!.id, (request.params as { id: string }).id);
    if (!pet) return refuse(reply, 404, 'pet_not_found', 'No such pet');
    const entries = await listCareHistory(db, pet.id);
    return {
      empty: entries.length === 0,
      entries: entries.map((entry) => ({
        id: entry.id,
        startDate: entry.startDate,
        endDate: entry.endDate,
        outcome: entry.outcome,
        declineReason: entry.declineReason,
        providerId: entry.providerId,
        carePlan: entry.carePlanSnapshot,
        reviewId: entry.reviewId,
      })),
    };
  });

  app.get('/owner/pets/:id/prefill', owner, async (request, reply) => {
    const pet = await ownedPet(request.currentUser!.id, (request.params as { id: string }).id);
    if (!pet) return refuse(reply, 404, 'pet_not_found', 'No such pet');
    const stay = await lastCompletedStay(db, pet.id);
    // Pre-fill uses the last successful stay's plan, or the current profile when there was none (FR-8).
    return stay
      ? {
          source: 'last_stay',
          stay: { id: stay.id, endDate: stay.endDate },
          carePlan: stay.carePlanSnapshot,
        }
      : { source: 'profile', stay: null, carePlan: pet.carePlan };
  });

  // ---- clinical screening at intake
  app.post('/owner/intake/screen', owner, async (request, reply) => {
    const body = screenBody.parse(request.body);
    const result = screenForClinicalPurpose(body);
    if (result.allowed) return { allowed: true };
    await appendLogEntry(db, {
      kind: 'audit',
      actor: `owner:${request.currentUser!.id}`,
      action:
        result.reason === 'clinical_request_rejected'
          ? 'intake.clinical_rejected'
          : 'intake.clinical_confirmation_asked',
      targetType: 'pet',
      targetId: body.petId ?? 'none',
      payload: result.reason === 'needs_confirmation' ? { matched: result.matched } : {},
    });
    return refuse(
      reply,
      422,
      result.reason,
      result.message,
      result.reason === 'needs_confirmation' ? { matched: result.matched } : {},
    );
  });

  // ---- provider: read-only care summary
  app.get(
    '/provider/pets/:petId/care-summary',
    { preHandler: authn.requireRole('provider') },
    async (request, reply) => {
      const petId = (request.params as { petId: string }).petId;
      if (!(await petAccess.canProviderView(request.currentUser!.id, petId))) {
        return refuse(
          reply,
          403,
          'no_access',
          'You can see a pet only when it has a request with you',
        );
      }
      const [mine] = await db
        .select({ id: providers.id })
        .from(providers)
        .where(eq(providers.userId, request.currentUser!.id));
      const summary = await buildCareSummary(db, mine?.id ?? request.currentUser!.id, petId);
      return summary ? { summary } : refuse(reply, 404, 'pet_not_found', 'No such pet');
    },
  );

  // The care history table is also read by later bolts; touching it here keeps the schema import honest.
  void careHistory;
}
