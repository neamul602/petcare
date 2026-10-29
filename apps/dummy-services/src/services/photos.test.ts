import { describe, expect, it } from 'vitest';
import { inspect, JPEG, multipartBody, newApp, PNG, setMode, WEBP } from '../test-helpers.ts';
import { MAX_PHOTO_BYTES } from './photos.ts';

type App = ReturnType<typeof newApp>['app'];
const upload = (
  app: App,
  content: Buffer | string,
  options: {
    type?: string;
    filename?: string;
    fieldName?: string;
    extra?: Array<{ name: string; content: string }>;
  } = {},
) => {
  const { payload, headers } = multipartBody([
    {
      name: options.fieldName ?? 'file',
      filename: options.filename ?? 'stay.png',
      type: options.type ?? 'image/png',
      content,
    },
    ...(options.extra ?? []),
  ]);
  return app.inject({ method: 'POST', url: '/api/photos', payload, headers });
};

describe('DUM-05 Dummy Photo Storage API', () => {
  it('stores an image and returns an id and URL; the same bytes come back', async () => {
    const { app } = newApp();
    const response = await upload(app, PNG, {
      extra: [
        { name: 'bookingRef', content: 'BK-1' },
        { name: 'tag', content: 'daily-update' },
      ],
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      id: 'photo_0001',
      url: '/api/photos/photo_0001',
      size: PNG.length,
      contentType: 'image/png',
    });
    const fetched = await app.inject({ method: 'GET', url: '/api/photos/photo_0001' });
    expect(fetched.statusCode).toBe(200);
    expect(fetched.headers['content-type']).toBe('image/png');
    expect(fetched.rawPayload.equals(PNG)).toBe(true);
    const stored = (await inspect(app, 'photos')).state.photos[0];
    expect(stored).toMatchObject({ bookingRef: 'BK-1', tag: 'daily-update' });
    expect(JSON.stringify(stored)).not.toContain('bytes');
  });

  it.each([
    ['JPEG', JPEG, 'image/jpeg'],
    ['WebP', WEBP, 'image/webp'],
  ])(
    'accepts %s and detects its type from the file itself',
    async (_name, content, contentType) => {
      const { app } = newApp();
      const response = await upload(app, content, {
        type: 'application/octet-stream',
        filename: 'photo.bin',
      });
      expect(response.statusCode).toBe(201);
      expect(response.json().contentType).toBe(contentType);
    },
  );

  it('accepts a photo of exactly 5 MB', async () => {
    const { app } = newApp();
    const exactly = Buffer.concat([PNG, Buffer.alloc(MAX_PHOTO_BYTES - PNG.length)]);
    expect(exactly.length).toBe(MAX_PHOTO_BYTES);
    expect((await upload(app, exactly)).statusCode).toBe(201);
  });

  it('rejects an image above 5 MB', async () => {
    const { app } = newApp();
    const tooBig = Buffer.concat([PNG, Buffer.alloc(MAX_PHOTO_BYTES - PNG.length + 1)]);
    const response = await upload(app, tooBig);
    expect(response.statusCode).toBe(413);
    expect(response.json().error.code).toBe('photo_too_large');
    expect((await inspect(app, 'photos')).state.photos).toHaveLength(0);
  });

  it('rejects something that is not an image even when labelled as one', async () => {
    const { app } = newApp();
    const response = await upload(app, 'definitely not an image', {
      type: 'image/png',
      filename: 'fake.png',
    });
    expect(response.statusCode).toBe(415);
    expect(response.json().error.code).toBe('unsupported_media_type');
    expect((await inspect(app, 'photos')).state.photos).toHaveLength(0);
  });

  it('rejects video and non-multipart requests and a missing file field', async () => {
    const { app } = newApp();
    expect(
      (
        await upload(app, Buffer.from([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70]), {
          type: 'video/mp4',
          filename: 'clip.mp4',
        })
      ).statusCode,
    ).toBe(415);
    const json = await app.inject({ method: 'POST', url: '/api/photos', payload: { file: 'x' } });
    expect(json.statusCode).toBe(415);
    expect(json.json().error.code).toBe('multipart_required');
    expect((await upload(app, PNG, { fieldName: 'picture' })).statusCode).toBe(400);
  });

  it('GET of an unknown photo is a 404', async () => {
    const { app } = newApp();
    expect((await app.inject({ method: 'GET', url: '/api/photos/photo_0099' })).statusCode).toBe(
      404,
    );
  });

  it('inspection records upload metadata, not the image bytes', async () => {
    const { app } = newApp();
    await upload(app, PNG, { filename: 'tito.png' });
    const logged = (await inspect(app, 'photos')).received[0];
    expect(logged?.body).toEqual({
      filename: 'tito.png',
      size: PNG.length,
      claimedType: 'image/png',
    });
  });

  it('failure mode timeout: the caller sees a timeout and nothing is stored', async () => {
    const { app } = newApp({ timeoutMs: 25 });
    await setMode(app, 'photos', 'timeout');
    expect((await upload(app, PNG)).statusCode).toBe(504);
    expect((await inspect(app, 'photos')).state.photos).toHaveLength(0);
  });

  it('failure mode down stops uploads and downloads; ambiguous stores the photo but loses the reply', async () => {
    const { app } = newApp();
    await upload(app, PNG);
    await setMode(app, 'photos', 'down');
    expect((await upload(app, PNG)).statusCode).toBe(503);
    expect((await app.inject({ method: 'GET', url: '/api/photos/photo_0001' })).statusCode).toBe(
      503,
    );
    await setMode(app, 'photos', 'ambiguous');
    expect((await upload(app, JPEG)).statusCode).toBe(504);
    expect((await inspect(app, 'photos')).state.photos).toHaveLength(2);
  });
});
