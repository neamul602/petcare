/** MFS payout port. The Dummy MFS Payout API is the training adapter; a real MFS provider later is one new adapter. */
export interface PayoutLine {
  bookingRef: string;
  providerRef: string;
  amountPoisha: number;
}
export interface SentPayout {
  bookingRef: string;
  gatewayPayoutId: string;
}
export type GatewayPayoutStatus = 'queued' | 'frozen' | 'paid';

export interface PayoutPort {
  /** Send one batch. The key makes a repeated send return the first result and pay nothing twice. */
  createBatch(input: {
    batchRef: string;
    lines: PayoutLine[];
    idempotencyKey: string;
  }): Promise<{ gatewayBatchId: string; payouts: SentPayout[] }>;
  freeze(gatewayPayoutId: string): Promise<void>;
  release(gatewayPayoutId: string): Promise<void>;
  status(gatewayPayoutId: string): Promise<GatewayPayoutStatus>;
}

/** The payout service did not answer or is down. Nothing was sent. */
export class PayoutUnavailableError extends Error {
  constructor(message = 'The payout service is unavailable') {
    super(message);
  }
}

/** The payout service refused the action (for example freezing a payout that is already paid). */
export class PayoutRefusedError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
