/** Builds the PetCare API. Business endpoints are added by later bolts. */
import Fastify from 'fastify';
import { loadBusinessRules } from './config.ts';

export function buildApp() {
  const rules = loadBusinessRules();
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

  app.get('/health', async () => ({
    service: 'petcare-api',
    status: 'ok',
    rulesLoaded: Object.keys(rules.trainingDecisions).length,
  }));

  return app;
}
