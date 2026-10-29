---
stage: plan
bolt: 002-dummy-integration-services
created: 2026-10-29T22:00:00Z
---

## Implementation Plan: dummy-integration-services (bolt 002 of 25)

### Objective

Turn the Dummy service host from a health stub into the five working training APIs the rest of PetCare will depend on: payment gateway, MFS payout, SMS/OTP, notifications and photo storage. Each API has the same training controls (health, reset, inspection, failure modes) so later bolts can prove PetCare behaves safely when an external system misbehaves. These are **training contracts of our own design**; nothing here claims to match the real bKash, Nagad, SSLCommerz, MFS or SMS interfaces.

### Stories and requirements in this bolt

1. **DUM-01 Dummy service host and training controls** (must): TR-6, workbook Step 16
2. **DUM-02 Dummy SMS / OTP API** (must): TR-3, DR-1
3. **DUM-03 Dummy payment gateway API** (must): TR-1, DR-13, NFR-9
4. **DUM-04 Dummy MFS payout API** (must): TR-2, DR-14
5. **DUM-05 Dummy notification and photo APIs** (must): TR-4, TR-5, TD-15

### 1. What will change

`apps/dummy-services` becomes a Fastify service on port 4100 serving five APIs under their `/api/...` paths, plus a shared set of training endpoints. State is **in memory** (reset empties it), so each service is independent and a restart returns it to a clean slate. After this bolt a tester can:

- Call `GET /health` and see all five services with their status and current failure mode.
- Call each API with the workbook's endpoints and get predictable results.
- Switch any service into a failure mode and watch the next calls fail, time out, decline or lose their answer.
- Inspect everything a service received, and reset it.

Nothing in PetCare calls these yet; the ports and adapters that consume them arrive in bolts 004, 005 and 008.

### 2. Files to create or modify

All under `apps/dummy-services/` unless stated.

Shared training controls (DUM-01):
- `src/core/service.ts` - the common service shape (name, state, failure mode, received-request log)
- `src/core/controls.ts` - registers `/health`, and per service `/_training/<service>/{health, reset, inspect, failure-mode}`
- `src/core/failure-modes.ts` - applies the mode to a request: none, down, timeout, decline (where meaningful), ambiguous
- `src/core/ids.ts` - id and gateway-reference generation (deterministic prefix, sequence)
- `src/core/errors.ts` - one error response shape for all five APIs
- `src/app.ts` (modify) - build the app, register the five services

SMS / OTP (DUM-02):
- `src/services/otp.ts` - `POST /api/otp/send`, `POST /api/otp/verify`

Payment gateway (DUM-03):
- `src/services/payments.ts` - `POST /api/payments/authorizations`, `.../:id/capture`, `.../:id/release`, `POST /api/payments/:paymentId/refunds`, `GET /api/payments/:paymentId`

MFS payout (DUM-04):
- `src/services/payouts.ts` - `POST /api/payouts/batches`, `.../:payoutId/freeze`, `.../:payoutId/release`, `GET /api/payouts/:payoutId`

Notifications and photos (DUM-05):
- `src/services/notifications.ts` - `POST /api/notifications`
- `src/services/photos.ts` - `POST /api/photos`, `GET /api/photos/:photoId`

Tests and docs:
- `src/**/*.test.ts` (one test file per service plus controls and failure modes)
- `scripts/dummy-curl-demo.sh` - the curl sequence for workbook Step 18 evidence
- `apps/dummy-services/README.md` - the endpoint list, failure modes and the "training contracts only" notice
- `package.json` (modify) - add the multipart dependency; `memory-bank/.../implementation-walkthrough.md` and `test-walkthrough.md` in later stages

### 3. Which APIs are involved

The five Dummy APIs themselves (below), exposed on port 4100. No external systems and no PetCare API calls.

| Service | Endpoints (training contract) |
|---|---|
| Payment gateway | `POST /api/payments/authorizations` (method `bkash`, `nagad` or `card`, amount in poisha, booking reference); `POST /api/payments/authorizations/:id/capture`, `.../:id/release`; `POST /api/payments/:paymentId/refunds`; `GET /api/payments/:paymentId` |
| MFS payout | `POST /api/payouts/batches`; `POST /api/payouts/:payoutId/freeze`, `.../:payoutId/release`; `GET /api/payouts/:payoutId` |
| SMS / OTP | `POST /api/otp/send`; `POST /api/otp/verify` |
| Notifications | `POST /api/notifications` |
| Photo storage | `POST /api/photos`; `GET /api/photos/:photoId` |
| Training controls (all five) | `GET /health`; `GET /_training/<service>/health`; `POST /_training/<service>/reset`; `GET /_training/<service>/inspect`; `PUT /_training/<service>/failure-mode` |

### 4. Technical approach

- **One small framework, five thin services.** Each service is a Fastify plugin with its own state object, receiving requests through a shared hook that (1) records the request for inspection, (2) applies the current failure mode, (3) hands over to the handler. This keeps the five APIs consistent.
- **Failure modes** (set per service, cleared with mode `none`):
  - `down` - every call returns 503 immediately (provider unavailable).
  - `timeout` - the call hangs for a configurable delay (default 30 s, shorter for tests) and then answers 504, so callers with shorter time limits see a timeout.
  - `decline` - payment authorizations and captures are refused with a decline code (402); for other services it behaves as `down`.
  - `ambiguous` - the action **is performed**, but the response is replaced by a 504-style "lost reply", so callers must retry with the same idempotency key to learn the outcome.
- **Idempotency.** Authorize, capture, refund and payout batches require an `Idempotency-Key` header. Replaying the same key returns the original result and does not repeat the action. A different key on an already captured authorization returns 409 (so a duplicate charge is impossible by key mistake alone). This is the foundation of "capture once, never twice" (DR-13) and "no double payout" (DR-14).
- **Payment rules.** Money is whole poisha. Methods are `bkash`, `nagad`, `card`; card data is never accepted, only a method name (NFR-9). States: authorized, captured, released, refunded (partial or full). Capture only from authorized; release only from authorized; refund only from captured, total refunds never above the captured amount.
- **Payout rules.** A batch has lines (booking, provider, net amount); each line becomes a payout with states queued, frozen, paid. Freeze only from queued; release returns a frozen payout to queued and processing continues to paid; a paid payout cannot be frozen or released.
- **OTP rules.** Six-digit code, valid for five minutes, at most five wrong attempts per challenge, resend allowed. The code appears in inspection so tests and demos can read it (it is a training service, not a security boundary).
- **Photos.** Accepts image uploads up to 5 MB (JPEG, PNG, WebP, checked by content signature, not only by label); anything else, or too large, is rejected. Stored in memory with a tag (booking or owner reference); fetched by id.
- **Notifications.** Accepts recipient, role, language, type, body and optional link and booking reference; stores it as `queued` then `sent`; inspection shows everything received.
- **Reset** clears one service's state; a `POST /_training/reset-all` convenience clears all five (used by the training seed in bolt 003).
- **Dependencies.** Fastify (already present); `@fastify/multipart` for photo uploads. Zod (already used by the API) validates request bodies; errors share one shape.

### 5. How it will be tested

- **API tests (Vitest, Fastify `inject`, no network)** per service and per failure mode, mirroring each acceptance criterion:
  - Controls: health lists all five; reset empties state; inspect shows each request with time and body; each failure mode applies and clears.
  - OTP: right code verifies, wrong code and expired code do not, attempt limit, `down` fails send.
  - Payments: authorize (all three methods, bad method rejected), capture once, **same key twice captures once with the same result**, different key conflicts, release then capture refused, refund up to captured amount and no further, all four failure modes (including `ambiguous` capture performed once and recoverable by retry).
  - Payouts: batch sent twice with one key creates one batch, freeze and release, paid payouts cannot change, `down` pays nothing.
  - Notifications and photos: stored and inspectable; photo round trip returns the same bytes; over 5 MB and non-image rejected; `timeout` observed.
- **Curl demonstration** (`scripts/dummy-curl-demo.sh`) runs the workbook Step 18 sequence against the running service: OTP send, authorize BDT 20,000 with bKash, capture twice (one charge), then each failure mode. Its output is saved as evidence (`STEP-18-api-tests.txt`).
- **Regression:** `npm run verify` and the existing 127 tests keep passing; the "no Dummy URL in web code" check stays green because the web app is untouched.

### Acceptance criteria (from the stories)

- [ ] Health for each of the five APIs answers with status; reset empties state; inspect shows every request with time and body; failure modes apply until cleared (DUM-01)
- [ ] OTP send creates a code visible in inspection; right code verifies before expiry; wrong or expired code does not; `down` fails like an unavailable provider (DUM-02)
- [ ] Payment authorize returns `authorized` for bKash, Nagad and card; capture with the same idempotency key twice yields one capture and the same result; release stops capture; refunds up to the captured amount are recorded; all four failure modes behave accordingly (DUM-03)
- [ ] Payout batch sent twice with one key creates one batch; freeze holds a payout until released; release continues to paid; `down` pays nothing with a clear error (DUM-04)
- [ ] Notifications are stored and visible; photos up to 5 MB are stored and returned by id; over 5 MB or non-images are rejected; `timeout` is seen by the caller (DUM-05)

### Decisions needed before implementing

1. **State is in memory only.** A restart or reset clears it, which keeps the Dummy services simple and always resettable. The training seed (bolt 003) will reload the scenario data. **Recommended:** in memory. Alternative: persist to a file or the database (more realistic, more to maintain).
2. **Idempotency key is required** on authorize, capture, refund and payout batches (missing key returns 400). **Recommended:** required, so callers always use it. Alternative: optional (easier to call by hand, but easier to double-charge by mistake).
3. **Timeout length.** `timeout` mode holds a call for 30 s by default (configurable down to milliseconds for tests). **Recommended:** 30 s default. Alternative: a shorter default, such as 10 s.

### Out of scope for this bolt

PetCare-side ports and adapters (bolts 004, 005, 008); OTP wiring into sign-in (bolt 004); the training seed (bolt 003); video uploads (TD-15); real provider contracts; authentication on the Dummy endpoints (it is a local training service).
