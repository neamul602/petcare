/** Admin view of releases that are still waiting for the gateway (PAY-03 edge case). */
import type { FastifyInstance } from 'fastify';
import type { Authenticator } from '../auth/guards.ts';
import type { PaymentService } from './payment-service.ts';

export function registerPaymentRoutes(
  app: FastifyInstance,
  deps: { authn: Authenticator; service: PaymentService },
) {
  const admin = { preHandler: deps.authn.requireRole('admin') };

  app.get('/admin/payments/pending-releases', admin, async () => ({
    pending: (await deps.service.pendingReleases()).map((p) => ({
      bookingId: p.bookingId,
      method: p.method,
      amountPoisha: p.amountPoisha,
      gatewayRef: p.gatewayRef,
      lastError: p.lastError,
      since: p.updatedAt,
    })),
  }));

  app.post('/admin/payments/retry-releases', admin, async (request) =>
    deps.service.retryPendingReleases(`admin:${request.currentUser!.id}`),
  );
}
