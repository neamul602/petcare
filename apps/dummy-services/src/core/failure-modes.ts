/**
 * Failure modes a tester can switch on for any Dummy service:
 *  - none       normal behaviour
 *  - down       every call returns 503 (provider unavailable); nothing is done
 *  - timeout    the call hangs, then returns 504; nothing is done
 *  - decline    payment authorizations and captures are refused (402); other calls behave as "down"
 *  - ambiguous  the action IS performed but the reply is lost (504), so callers must retry
 *               with the same idempotency key to learn the outcome
 */
export const FAILURE_MODES = ['none', 'down', 'timeout', 'decline', 'ambiguous'] as const;
export type FailureMode = (typeof FAILURE_MODES)[number];
