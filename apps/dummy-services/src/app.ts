/**
 * Host for the five Dummy APIs (training contracts only, not real provider interfaces).
 * Bolt 001 provides the health endpoint; the APIs and training controls arrive in bolt 002.
 */
import Fastify from 'fastify';

export function buildDummyApp() {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });
  app.get('/health', async () => ({
    service: 'petcare-dummy-services',
    status: 'ok',
    trainingOnly: true,
  }));
  return app;
}
