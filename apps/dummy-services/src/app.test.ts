import { describe, expect, it } from 'vitest';
import { buildDummyApp } from './app.ts';

describe('Dummy service host', () => {
  it('answers health and says it is training-only', async () => {
    const app = buildDummyApp();
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok', trainingOnly: true });
    await app.close();
  });
});
