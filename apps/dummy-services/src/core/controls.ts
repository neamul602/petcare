/** Training controls shared by all five services: health, reset, inspection and failure modes. */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ApiError } from './errors.ts';
import { FAILURE_MODES } from './failure-modes.ts';
import type { DummyService } from './service.ts';

const failureModeBody = z.strictObject({
  mode: z.enum(FAILURE_MODES),
  timeoutMs: z.number().int().min(1).max(120_000).optional(),
});

export function registerControls(app: FastifyInstance, services: DummyService[]) {
  const byName = new Map(services.map((service) => [service.name, service]));
  const find = (name: string) => {
    const service = byName.get(name);
    if (!service) throw new ApiError(404, 'unknown_service', `Unknown Dummy service "${name}"`);
    return service;
  };

  app.get('/health', async () => ({
    service: 'petcare-dummy-services',
    status: 'ok',
    trainingOnly: true,
    services: Object.fromEntries(services.map((service) => [service.name, service.snapshot()])),
  }));

  app.get('/_training/:service/health', async (request) =>
    find((request.params as { service: string }).service).snapshot(),
  );
  app.get('/_training/:service/inspect', async (request) =>
    find((request.params as { service: string }).service).inspect(),
  );
  app.get('/_training/:service/failure-mode', async (request) => {
    const service = find((request.params as { service: string }).service);
    return { service: service.name, mode: service.mode, timeoutMs: service.timeoutMs };
  });

  app.put('/_training/:service/failure-mode', async (request) => {
    const service = find((request.params as { service: string }).service);
    const { mode, timeoutMs } = failureModeBody.parse(request.body);
    service.mode = mode;
    if (timeoutMs !== undefined) service.timeoutMs = timeoutMs;
    return { service: service.name, mode: service.mode, timeoutMs: service.timeoutMs };
  });

  app.post('/_training/:service/reset', async (request) => {
    const service = find((request.params as { service: string }).service);
    service.reset();
    return { service: service.name, status: 'reset' };
  });

  app.post('/_training/reset-all', async () => {
    for (const service of services) service.reset();
    return { status: 'reset', services: services.map((service) => service.name) };
  });
}
