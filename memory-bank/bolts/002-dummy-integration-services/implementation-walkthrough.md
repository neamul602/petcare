---
stage: implement
bolt: 002-dummy-integration-services
created: 2026-10-29T23:30:00Z
---

## Implementation Walkthrough: dummy-integration-services

### Summary

The Dummy service host now serves the five training APIs (payment gateway, MFS payout, SMS/OTP, notifications, photo storage) on port 4100. Each has the same training controls: health, reset, inspection and switchable failure modes. Authorize, capture, refund and payout batches are idempotent, so a retried capture never charges twice and a repeated batch never pays twice. These are training contracts of our own design; none claims to match a real provider.

### Structure Overview

- **A small shared core** gives every service the same behaviour: a request log for inspection, one failure-mode switch, idempotent actions, reset, and one error shape. This keeps the five APIs consistent and keeps each service file short.
- **Five thin service files**, each a Fastify plugin owning its own in-memory state, registered separately so each request log only sees its own routes.
- **Training controls** live under `/_training/<service>/...` and are never logged or affected by failure modes, so a tester can always inspect, reset or change the mode.
- **Time and waiting are injectable** (clock, timeout length, payout settlement delay), so tests and demos control them without real waiting.

### Completed Work

- [x] `apps/dummy-services/src/core/errors.ts` - one error response shape; maps validation, size and unknown-route errors to clear responses
- [x] `apps/dummy-services/src/core/failure-modes.ts` - the five modes (none, down, timeout, decline, ambiguous) and what each means
- [x] `apps/dummy-services/src/core/ids.ts` - predictable per-service ids that restart on reset
- [x] `apps/dummy-services/src/core/service.ts` - base service: request log, failure-mode handling, idempotent actions, reset, idempotency-key rules
- [x] `apps/dummy-services/src/core/controls.ts` - health, inspect, failure-mode get and set, reset one and reset all
- [x] `apps/dummy-services/src/services/otp.ts` - send and verify with six-digit codes, five-minute life, five wrong attempts, code visible in inspection
- [x] `apps/dummy-services/src/services/payments.ts` - authorize (bKash, Nagad, card as a name only), capture, release, refund, get; refuses card data
- [x] `apps/dummy-services/src/services/payouts.ts` - batches, freeze, release, get, lazy settlement after a delay, and a settle-now training control
- [x] `apps/dummy-services/src/services/notifications.ts` - stores every notification and shows it in inspection
- [x] `apps/dummy-services/src/services/photos.ts` - multipart upload up to 5 MB, type read from the file signature, fetch by id
- [x] `apps/dummy-services/src/app.ts` - builds the host with options for timeout length, payout delay and clock; registers the core and five services
- [x] `apps/dummy-services/src/server.ts` - starts the host; reads `DUMMY_PORT`, `DUMMY_TIMEOUT_MS`, `DUMMY_PAYOUT_SETTLE_MS`
- [x] `apps/dummy-services/README.md` - endpoints, controls, failure modes and the training-only notice
- [x] `scripts/dummy-curl-demo.sh` - the workbook Step 18 curl sequence for evidence
- [x] `apps/dummy-services/package.json` - adds `@fastify/multipart` and `zod`

### Key Decisions

- **State in memory** (approved): a restart or reset gives a clean slate; the training seed in bolt 003 reloads the scenario.
- **Idempotency key required** (approved) on authorize, capture, refund and payout batches. A repeated key returns the first result without acting again; the same key on a different request, or a new key on an already-captured authorization, is a 409.
- **30 s timeout by default** (approved), changeable per service or by environment variable.
- **Ambiguous mode performs the action first and then loses the reply**, so a retry with the same key returns the original result and no duplicate exists. This models the "answer lost" case from the failure tests.
- **Decline mode** refuses payment authorize and capture with a 402; for every other call it behaves as "down", because only payments can be declined.
- **Release is naturally repeatable** (a second release changes nothing) and so needs no key.
- **Payouts settle lazily**: queued payouts become paid when the settlement delay (one minute by default) has passed, so a freeze before that is possible and meaningful. A training `settle-now` control pays everything immediately for demos. Release returns a frozen payout to the queue with a fresh delay.
- **Reset also clears the failure mode**, so a reset always returns a service to a known clean state.
- **Training controls are never logged and never affected by failure modes**, so a tester cannot lock themselves out.
- **Photo type comes from the file's own signature** (JPEG, PNG, WebP), not from the label the client sends; 5 MB is allowed, anything larger is a 413, and non-images are a 415.

### Deviations from Plan

- Added `POST /_training/payouts/settle-now` and the `DUMMY_PAYOUT_SETTLE_MS` setting, which the plan implied (freeze and release need a queued state) but did not list as endpoints.
- Added `GET /_training/<service>/failure-mode` so a tester can read the current mode.
- OTP verify answers 200 with `verified: false` and a reason (wrong code, expired, already used, too many attempts, no challenge) rather than an error status, so callers can show the right message.
- No other changes.

### Dependencies Added

- [x] `@fastify/multipart` - photo upload parsing with the 5 MB limit
- [x] `zod` - request validation (already used by the API; now also here)

### Developer Notes

- Run the demonstration with the service started: `npm run dev -w @petcare/dummy-services`, then `bash scripts/dummy-curl-demo.sh`. It ran cleanly end to end against the new code (28 calls, every status as expected).
- Hand-checked before writing tests: the same key twice captures once; a new key on a captured authorization is 409; in ambiguous mode the authorization exists after the lost reply and a retry returns it; card numbers are refused; OTP verifies with the code read from inspection; lint, TypeScript strict and the earlier 42 tests still pass.
- Automated tests for each acceptance criterion are written in stage 3.
- When bolts 004, 005 and 008 build the PetCare-side ports, they should use the idempotency key per booking action so retries are safe by construction.
- Killing the service with `pkill -f` can also kill your own shell if the command line matches; stop it by port or process id instead.
