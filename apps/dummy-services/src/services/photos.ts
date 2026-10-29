/**
 * Dummy Photo Storage API (training contract). Photos only (TD-15: no video), up to 5 MB.
 *   POST /api/photos      multipart form: file (required), tag? , bookingRef? -> 201 { id, url, size, contentType }
 *   GET  /api/photos/:photoId                                                -> the image bytes
 * The image type is read from the file's own signature (JPEG, PNG or WebP), not from its label.
 */
import type { FastifyInstance } from 'fastify';
import { ApiError } from '../core/errors.ts';
import type { ActionResult, DummyService } from '../core/service.ts';

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

interface Photo {
  id: string;
  contentType: string;
  size: number;
  tag?: string;
  bookingRef?: string;
  uploadedAt: string;
  bytes: Buffer;
}

export function detectImageType(bytes: Buffer): string | undefined {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return 'image/jpeg';
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return 'image/png';
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return 'image/webp';
  return undefined;
}

export function registerPhotos(app: FastifyInstance, svc: DummyService) {
  const photos = new Map<string, Photo>();
  svc.onReset(() => photos.clear());
  svc.describeWith(() => ({
    photos: [...photos.values()].map((photo) => ({
      id: photo.id,
      contentType: photo.contentType,
      size: photo.size,
      tag: photo.tag,
      bookingRef: photo.bookingRef,
      uploadedAt: photo.uploadedAt,
    })),
  }));
  svc.attach(app);

  app.post('/api/photos', async (request, reply) => {
    if (!request.isMultipart())
      throw new ApiError(
        415,
        'multipart_required',
        'Upload the photo as a multipart form with a "file" field',
      );
    const upload = await request.file();
    if (!upload || upload.fieldname !== 'file')
      throw new ApiError(400, 'file_required', 'Send the photo in a form field named "file"');
    const bytes = await upload.toBuffer(); // throws when larger than 5 MB
    const field = (name: string) => {
      const value = upload.fields[name];
      const part = Array.isArray(value) ? value[0] : value;
      return part && 'value' in part && typeof part.value === 'string' ? part.value : undefined;
    };
    if (request.dummyEntry)
      request.dummyEntry.body = {
        filename: upload.filename,
        size: bytes.length,
        claimedType: upload.mimetype,
      };

    return svc.run(request, reply, (): ActionResult => {
      const contentType = detectImageType(bytes);
      if (!contentType)
        throw new ApiError(
          415,
          'unsupported_media_type',
          'Only JPEG, PNG and WebP photos are accepted',
        );
      const id = svc.ids.next('photo');
      photos.set(id, {
        id,
        contentType,
        size: bytes.length,
        tag: field('tag'),
        bookingRef: field('bookingRef'),
        uploadedAt: svc.ctx.now().toISOString(),
        bytes,
      });
      return {
        status: 201,
        body: { id, url: `/api/photos/${id}`, size: bytes.length, contentType },
      };
    });
  });

  app.get('/api/photos/:photoId', async (request, reply) => {
    const { photoId } = request.params as { photoId: string };
    return svc.run(request, reply, (): ActionResult => {
      const photo = photos.get(photoId);
      if (!photo) throw new ApiError(404, 'photo_not_found', `No photo ${photoId}`);
      return {
        status: 200,
        body: photo.bytes,
        headers: { 'content-type': photo.contentType, 'content-length': String(photo.size) },
      };
    });
  });
}
