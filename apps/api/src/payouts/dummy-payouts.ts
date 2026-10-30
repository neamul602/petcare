/** PayoutPort adapter for the Dummy MFS Payout API (training only). */
import {
  PayoutRefusedError,
  PayoutUnavailableError,
  type GatewayPayoutStatus,
  type PayoutPort,
} from './port.ts';

const EXTRA_TRIES_ON_LOST_REPLY = 2;

export function createDummyPayouts(baseUrl: string, timeoutMs = 8000): PayoutPort {
  async function call(method: 'GET' | 'POST', path: string, body?: unknown, key?: string) {
    for (let attempt = 0; ; attempt++) {
      let response: Response;
      try {
        response = await fetch(`${baseUrl}${path}`, {
          method,
          headers: {
            'content-type': 'application/json',
            ...(key ? { 'idempotency-key': key } : {}),
          },
          ...(method === 'POST' ? { body: JSON.stringify(body ?? {}) } : {}),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch {
        if (key && attempt < EXTRA_TRIES_ON_LOST_REPLY) continue;
        throw new PayoutUnavailableError('The payout service did not answer');
      }
      if (response.status === 504 && key && attempt < EXTRA_TRIES_ON_LOST_REPLY) continue;
      if (response.status >= 500) throw new PayoutUnavailableError();
      const json = (await response.json().catch(() => ({}))) as {
        id?: string;
        status?: string;
        payouts?: unknown;
        error?: { code?: string; message?: string };
      };
      if (response.status >= 400)
        throw new PayoutRefusedError(
          json.error?.code ?? 'refused',
          json.error?.message ?? 'Refused',
        );
      return json;
    }
  }

  return {
    async createBatch({ batchRef, lines, idempotencyKey }) {
      const json = await call(
        'POST',
        '/api/payouts/batches',
        {
          batchRef,
          lines: lines.map((l) => ({
            bookingRef: l.bookingRef,
            providerRef: l.providerRef,
            amount: l.amountPoisha,
          })),
        },
        idempotencyKey,
      );
      return {
        gatewayBatchId: String(json.id),
        payouts: (json.payouts as Array<{ id: string; bookingRef: string }>).map((p) => ({
          bookingRef: p.bookingRef,
          gatewayPayoutId: p.id,
        })),
      };
    },
    async freeze(id) {
      await call('POST', `/api/payouts/${encodeURIComponent(id)}/freeze`);
    },
    async release(id) {
      await call('POST', `/api/payouts/${encodeURIComponent(id)}/release`);
    },
    async listAll() {
      let response: Response;
      try {
        response = await fetch(`${baseUrl}/_training/payouts/inspect`, {
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch {
        throw new PayoutUnavailableError('The payout service did not answer');
      }
      if (!response.ok) throw new PayoutUnavailableError();
      const json = (await response.json()) as {
        state: {
          payouts: Array<{
            id: string;
            bookingRef: string;
            amount: number;
            status: GatewayPayoutStatus;
          }>;
        };
      };
      return json.state.payouts.map((p) => ({
        gatewayPayoutId: p.id,
        bookingRef: p.bookingRef,
        amountPoisha: p.amount,
        status: p.status,
      }));
    },
    async status(id) {
      const json = await call('GET', `/api/payouts/${encodeURIComponent(id)}`);
      return json.status as GatewayPayoutStatus;
    },
  };
}
