/**
 * Photo storage port. The Dummy Photo Storage API is the training adapter; a real storage service
 * later is one new adapter. The browser never talks to the storage service: photos are served back through the API.
 */
export interface StoredPhoto {
  id: string;
  size: number;
  contentType: string;
}

export interface PhotoPort {
  upload(input: { bytes: Buffer; filename: string; tag?: string }): Promise<StoredPhoto>;
  fetch(id: string): Promise<{ bytes: Buffer; contentType: string } | null>;
}

export class PhotoUnavailableError extends Error {
  constructor(message = 'Photo storage is unavailable') {
    super(message);
  }
}

/** The storage service refused the file (not an image, too large). */
export class PhotoRejectedError extends Error {
  constructor(
    readonly code: 'unsupported_media_type' | 'photo_too_large',
    message: string,
  ) {
    super(message);
  }
}
