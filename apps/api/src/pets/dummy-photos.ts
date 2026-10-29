/** PhotoPort adapter for the Dummy Photo Storage API (training only). */
import { PhotoRejectedError, PhotoUnavailableError, type PhotoPort } from './photo-port.ts';

export function createDummyPhotos(baseUrl: string, timeoutMs = 8000): PhotoPort {
  const request = async (path: string, init?: RequestInit) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.status >= 500) throw new PhotoUnavailableError();
      return response;
    } catch (error) {
      if (error instanceof PhotoUnavailableError) throw error;
      throw new PhotoUnavailableError('Photo storage did not answer');
    }
  };

  return {
    async upload({ bytes, filename, tag }) {
      const form = new FormData();
      form.append('file', new Blob([new Uint8Array(bytes)]), filename);
      if (tag) form.append('tag', tag);
      const response = await request('/api/photos', { method: 'POST', body: form });
      const body = (await response.json().catch(() => ({}))) as {
        id?: string;
        size?: number;
        contentType?: string;
        error?: { code?: string; message?: string };
      };
      if (response.status === 413)
        throw new PhotoRejectedError('photo_too_large', 'Photos can be at most 5 MB');
      if (response.status === 415)
        throw new PhotoRejectedError(
          'unsupported_media_type',
          'Only JPEG, PNG and WebP photos are accepted',
        );
      if (!response.ok || !body.id)
        throw new PhotoUnavailableError('Photo storage refused the upload');
      return {
        id: body.id,
        size: body.size ?? bytes.length,
        contentType: body.contentType ?? 'application/octet-stream',
      };
    },
    async fetch(id) {
      const response = await request(`/api/photos/${encodeURIComponent(id)}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new PhotoUnavailableError();
      return {
        bytes: Buffer.from(await response.arrayBuffer()),
        contentType: response.headers.get('content-type') ?? 'application/octet-stream',
      };
    },
  };
}
