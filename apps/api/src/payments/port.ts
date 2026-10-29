/**
 * Payment gateway port. The Dummy Payment Gateway is the training adapter; a real gateway later is one new adapter.
 * Authorize and capture carry an idempotency key, so a retry after a lost answer never repeats the action.
 */
import type { PaymentMethod } from '@petcare/shared/payments';

export interface GatewayAuthorization {
  authorizationId: string;
  paymentId: string;
  gatewayRef: string;
}

export interface PaymentPort {
  authorize(input: {
    method: PaymentMethod;
    amountPoisha: number;
    bookingRef: string;
    idempotencyKey: string;
  }): Promise<GatewayAuthorization>;
  capture(authorizationId: string, idempotencyKey: string): Promise<void>;
  release(authorizationId: string): Promise<void>;
  refund(
    gatewayPaymentId: string,
    amountPoisha: number,
    idempotencyKey: string,
    reason?: string,
  ): Promise<void>;
}

/** The gateway refused the payment method or amount. Nothing was held or taken. */
export class PaymentDeclinedError extends Error {
  constructor(message = 'The payment was declined') {
    super(message);
  }
}

/** The gateway did not give a usable answer (down, timed out, or the reply was lost and still unresolved). */
export class PaymentUnavailableError extends Error {
  constructor(message = 'The payment service is unavailable') {
    super(message);
  }
}
