/** OtpPort adapter for the Dummy SMS / OTP API (training only). */
import { OtpUnavailableError, type OtpPort, type VerifyResult } from './ports.ts';

const REASONS = [
  'wrong_code',
  'expired',
  'already_used',
  'too_many_attempts',
  'no_challenge',
] as const;

export function createDummyOtp(baseUrl: string, timeoutMs = 5000): OtpPort {
  async function call(path: string, body: unknown): Promise<{ status: number; json: unknown }> {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.status >= 500) throw new OtpUnavailableError();
      return { status: response.status, json: await response.json().catch(() => ({})) };
    } catch (error) {
      if (error instanceof OtpUnavailableError) throw error;
      throw new OtpUnavailableError('The code service did not answer');
    }
  }

  return {
    async sendCode(phone) {
      const { status } = await call('/api/otp/send', { phone });
      if (status >= 400) throw new OtpUnavailableError('The code service refused the request');
    },
    async verifyCode(phone, code): Promise<VerifyResult> {
      const { status, json } = await call('/api/otp/verify', { phone, code });
      if (status >= 400) throw new OtpUnavailableError('The code service refused the request');
      const answer = json as { verified?: boolean; reason?: string };
      if (answer.verified) return { verified: true };
      const reason = REASONS.find((candidate) => candidate === answer.reason) ?? 'wrong_code';
      return { verified: false, reason };
    },
  };
}
