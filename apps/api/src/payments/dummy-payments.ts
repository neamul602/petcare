/** PaymentPort adapter for the Dummy Payment Gateway (training only). */
import {
  PaymentDeclinedError,
  PaymentUnavailableError,
  type GatewayAuthorization,
  type PaymentPort,
} from './port.ts';

/** A lost reply (504) is asked again with the same key this many extra times before giving up. */
const EXTRA_TRIES_ON_LOST_REPLY = 2;

export function createDummyPayments(baseUrl: string, timeoutMs = 8000): PaymentPort {
  async function call(path: string, body: unknown, key?: string) {
    for (let attempt = 0; ; attempt++) {
      let response: Response;
      try {
        response = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(key ? { 'idempotency-key': key } : {}),
          },
          body: JSON.stringify(body ?? {}),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch {
        if (key && attempt < EXTRA_TRIES_ON_LOST_REPLY) continue;
        throw new PaymentUnavailableError('The payment service did not answer');
      }
      if (response.status === 402) throw new PaymentDeclinedError();
      if (response.status === 504 && key && attempt < EXTRA_TRIES_ON_LOST_REPLY) continue;
      if (response.status >= 500) throw new PaymentUnavailableError();
      return {
        status: response.status,
        json: (await response.json().catch(() => ({}))) as Record<string, unknown>,
      };
    }
  }

  return {
    async authorize({ method, amountPoisha, bookingRef, idempotencyKey }) {
      const { status, json } = await call(
        '/api/payments/authorizations',
        { method, amount: amountPoisha, bookingRef },
        idempotencyKey,
      );
      if (status >= 400 || typeof json.id !== 'string')
        throw new PaymentDeclinedError('The gateway refused the payment');
      return {
        authorizationId: json.id,
        paymentId: String(json.paymentId),
        gatewayRef: String(json.gatewayRef),
      } satisfies GatewayAuthorization;
    },
    async capture(authorizationId, idempotencyKey) {
      const { status } = await call(
        `/api/payments/authorizations/${encodeURIComponent(authorizationId)}/capture`,
        {},
        idempotencyKey,
      );
      if (status >= 400) throw new PaymentDeclinedError('The capture was refused');
    },
    async release(authorizationId) {
      const { status } = await call(
        `/api/payments/authorizations/${encodeURIComponent(authorizationId)}/release`,
        {},
      );
      if (status >= 400) throw new PaymentDeclinedError('The release was refused');
    },
    async refund(gatewayPaymentId, amountPoisha, idempotencyKey, reason) {
      const { status } = await call(
        `/api/payments/${encodeURIComponent(gatewayPaymentId)}/refunds`,
        { amount: amountPoisha, ...(reason ? { reason } : {}) },
        idempotencyKey,
      );
      if (status >= 400) throw new PaymentDeclinedError('The refund was refused');
    },
  };
}
