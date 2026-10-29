/**
 * Shared behaviour of the five Dummy services: a request log for inspection, a failure mode,
 * idempotent actions, and reset. Each service owns its own state and registers its routes.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ApiError, errorBody } from './errors.ts';
import type { FailureMode } from './failure-modes.ts';
import { Sequence } from './ids.ts';

export interface DummyContext {
  now: () => Date;
  defaultTimeoutMs: number;
  payoutSettleMs: number;
  /** Waits, but ends early when the app is closing. */
  sleep: (ms: number) => Promise<void>;
}

export interface ReceivedEntry {
  seq: number;
  at: string;
  method: string;
  url: string;
  idempotencyKey?: string;
  body?: unknown;
  status?: number;
  outcome: string;
}

export interface ActionResult {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}

declare module 'fastify' {
  interface FastifyRequest {
    dummyEntry?: ReceivedEntry;
  }
}

interface StoredResult {
  scope: string;
  fingerprint: string;
  result: ActionResult;
}

const MAX_LOG = 500;

/** Field names that look like card data; these are never kept, not even in the request log (NFR-9). */
export const CARD_DATA = /card.?(number|no|cvv|cvc|expiry|exp|holder)|^(pan|cvv|cvc)$/i;

/** Copy of a request body with any card-data fields blanked out. */
export function redactCardData(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactCardData);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [
        key,
        CARD_DATA.test(key) ? '[redacted]' : redactCardData(inner),
      ]),
    );
  }
  return value;
}

export class DummyService {
  mode: FailureMode = 'none';
  timeoutMs: number;
  readonly received: ReceivedEntry[] = [];
  readonly ids = new Sequence();
  private readonly idempotent = new Map<string, StoredResult>();
  private readonly resetHooks: Array<() => void> = [];
  private describe: () => unknown = () => ({});
  private counter = 0;

  constructor(
    readonly name: string,
    readonly ctx: DummyContext,
  ) {
    this.timeoutMs = ctx.defaultTimeoutMs;
  }

  /** Service-specific state to show in inspection. */
  describeWith(fn: () => unknown): void {
    this.describe = fn;
  }

  onReset(fn: () => void): void {
    this.resetHooks.push(fn);
  }

  /** Clears everything the service stored, its request log, its idempotency records and its failure mode. */
  reset(): void {
    this.received.length = 0;
    this.idempotent.clear();
    this.ids.reset();
    this.counter = 0;
    this.mode = 'none';
    this.timeoutMs = this.ctx.defaultTimeoutMs;
    for (const hook of this.resetHooks) hook();
  }

  snapshot() {
    return {
      service: this.name,
      status: 'ok',
      failureMode: this.mode,
      timeoutMs: this.timeoutMs,
      received: this.received.length,
    };
  }

  inspect() {
    return { ...this.snapshot(), state: this.describe(), received: [...this.received] };
  }

  /** Log every request to this service's own routes (training endpoints are not logged). */
  attach(app: FastifyInstance): void {
    app.addHook('onRequest', async (request) => {
      const entry: ReceivedEntry = {
        seq: ++this.counter,
        at: this.ctx.now().toISOString(),
        method: request.method,
        url: request.url,
        idempotencyKey: headerValue(request.headers['idempotency-key']),
        outcome: 'received',
      };
      this.received.push(entry);
      if (this.received.length > MAX_LOG) this.received.shift();
      request.dummyEntry = entry;
    });
    app.addHook('preHandler', async (request) => {
      if (request.dummyEntry && request.body !== undefined)
        request.dummyEntry.body = redactCardData(request.body);
    });
    app.addHook('onResponse', async (request, reply) => {
      const entry = request.dummyEntry;
      if (!entry) return;
      entry.status = reply.statusCode;
      if (entry.outcome === 'received') entry.outcome = reply.statusCode >= 400 ? 'error' : 'ok';
    });
  }

  /**
   * Run an action under the current failure mode.
   * `declinable` lets "decline" mode refuse the call with a payment-style decline.
   * `idempotencyKey` makes a repeated call return the first result instead of acting again.
   */
  async run(
    request: FastifyRequest,
    reply: FastifyReply,
    perform: () => ActionResult | Promise<ActionResult>,
    options: { declinable?: { code: string; message: string }; idempotencyKey?: string } = {},
  ): Promise<FastifyReply> {
    const entry = request.dummyEntry;
    const note = (outcome: string) => {
      if (entry) entry.outcome = outcome;
    };

    if (this.mode === 'decline' && options.declinable) {
      note('decline');
      return reply.code(402).send(errorBody(options.declinable.code, options.declinable.message));
    }
    if (this.mode === 'down' || this.mode === 'decline') {
      note('down');
      return reply
        .code(503)
        .send(errorBody('provider_unavailable', 'The training provider is switched to "down"'));
    }
    if (this.mode === 'timeout') {
      note('timeout');
      await this.ctx.sleep(this.timeoutMs);
      return reply
        .code(504)
        .send(errorBody('provider_timeout', 'The training provider did not answer in time'));
    }

    const result = options.idempotencyKey
      ? await this.performOnce(request, options.idempotencyKey, perform, note)
      : await perform();
    if (!entry || entry.outcome === 'received') note('ok');

    if (this.mode === 'ambiguous') {
      note('lost-reply');
      return reply
        .code(504)
        .send(
          errorBody(
            'reply_lost',
            'The action was performed but the reply was lost; retry with the same idempotency key',
          ),
        );
    }
    if (result.headers) reply.headers(result.headers);
    return reply.code(result.status).send(result.body);
  }

  private async performOnce(
    request: FastifyRequest,
    key: string,
    perform: () => ActionResult | Promise<ActionResult>,
    note: (outcome: string) => void,
  ): Promise<ActionResult> {
    const scope = `${request.method} ${request.url.split('?')[0]}`;
    const fingerprint = JSON.stringify(request.body ?? null);
    const stored = this.idempotent.get(key);
    if (stored) {
      if (stored.scope !== scope || stored.fingerprint !== fingerprint) {
        throw new ApiError(
          409,
          'idempotency_key_reuse',
          'This idempotency key was already used for a different request',
        );
      }
      note('replayed');
      return stored.result;
    }
    const result = await perform();
    this.idempotent.set(key, { scope, fingerprint, result });
    return result;
  }
}

export function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Idempotency-Key is required on authorize, capture, refund and payout batches (approved with bolt 002). */
export function requireIdempotencyKey(request: FastifyRequest): string {
  const key = headerValue(request.headers['idempotency-key'])?.trim();
  if (!key)
    throw new ApiError(
      400,
      'idempotency_key_required',
      'Send an Idempotency-Key header so a retry can never repeat the action',
    );
  if (key.length > 128)
    throw new ApiError(
      400,
      'idempotency_key_invalid',
      'The Idempotency-Key is too long (128 characters at most)',
    );
  return key;
}
