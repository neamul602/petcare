import { describe, expect, it } from 'vitest';
import { buildApp } from './app.ts';

describe('PetCare API', () => {
  it('answers health with the rules loaded', async () => {
    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      service: 'petcare-api',
      status: 'ok',
      rulesLoaded: 16,
    });
    await app.close();
  });
});
