/**
 * Ports for the outside world used by sign-in. The real SMS provider (later) is one new adapter
 * behind OtpPort; nothing else changes. The Dummy adapter is the training substitute.
 */
export type VerifyResult =
  | { verified: true }
  | {
      verified: false;
      reason: 'wrong_code' | 'expired' | 'already_used' | 'too_many_attempts' | 'no_challenge';
    };

export interface OtpPort {
  /** Send a one-time code to a normalised phone number. Throws OtpUnavailableError when the provider is down. */
  sendCode(phone: string): Promise<void>;
  verifyCode(phone: string, code: string): Promise<VerifyResult>;
}

export class OtpUnavailableError extends Error {
  constructor(message = 'The code service is unavailable') {
    super(message);
  }
}
