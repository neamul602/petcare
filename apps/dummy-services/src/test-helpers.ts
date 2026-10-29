/** Shared helpers for the Dummy service tests. */
import { TestClock } from '@petcare/shared/clock';
import { buildDummyApp, type DummyOptions } from './app.ts';

export function newApp(options: DummyOptions = {}) {
  const clock = new TestClock('2026-03-28T04:00:00Z');
  const app = buildDummyApp({ timeoutMs: 30, now: () => clock.now(), ...options });
  return { app, clock };
}

export const JSON_HEADERS = { 'content-type': 'application/json' };

export const withKey = (key: string) => ({ ...JSON_HEADERS, 'idempotency-key': key });

export async function setMode(
  app: ReturnType<typeof newApp>['app'],
  service: string,
  mode: string,
) {
  const response = await app.inject({
    method: 'PUT',
    url: `/_training/${service}/failure-mode`,
    payload: { mode },
    headers: JSON_HEADERS,
  });
  if (response.statusCode !== 200)
    throw new Error(`could not set ${mode} on ${service}: ${response.body}`);
}

export async function inspect(app: ReturnType<typeof newApp>['app'], service: string) {
  const response = await app.inject({ method: 'GET', url: `/_training/${service}/inspect` });
  return response.json() as {
    failureMode: string;
    state: Record<string, unknown[]>;
    received: Array<Record<string, unknown>>;
  };
}

/** Builds a multipart/form-data body for photo uploads. */
export function multipartBody(
  parts: Array<{ name: string; filename?: string; type?: string; content: Buffer | string }>,
) {
  const boundary = '----petcare-test-boundary';
  const chunks: Buffer[] = [];
  for (const part of parts) {
    const disposition = `Content-Disposition: form-data; name="${part.name}"${part.filename ? `; filename="${part.filename}"` : ''}`;
    const type = part.type ? `\r\nContent-Type: ${part.type}` : '';
    chunks.push(
      Buffer.from(`--${boundary}\r\n${disposition}${type}\r\n\r\n`),
      Buffer.isBuffer(part.content) ? part.content : Buffer.from(part.content),
      Buffer.from('\r\n'),
    );
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return {
    payload: Buffer.concat(chunks),
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  };
}

export const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from('training image'),
]);
export const JPEG = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.from('training image'),
]);
export const WEBP = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.from([1, 2, 3, 4]),
  Buffer.from('WEBP'),
  Buffer.from('training image'),
]);
