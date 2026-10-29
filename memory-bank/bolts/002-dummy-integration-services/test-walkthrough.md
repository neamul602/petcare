---
stage: test
bolt: 002-dummy-integration-services
created: 2026-10-30T01:00:00Z
---

## Test Report: dummy-integration-services

### Summary

- **Tests**: 120/120 passed in the whole project (79 new Dummy service tests in 7 files, 42 from bolt 001 plus 1 shared; all green). E2E was not rerun because no web code changed.
- **Coverage** of `apps/dummy-services` (Vitest): 97% statements, 89% branches, 98% functions, 97% lines (services folder 100% statements).
- **Other checks**: ESLint clean; TypeScript strict clean; the four project checks pass.
- **Command**: `npm run verify`. Needs PostgreSQL (`npm run db:up`) only for the bolt 001 integration test.
- **Evidence**: `evidence/STEP-18-api-tests.txt` is the output of `scripts/dummy-curl-demo.sh` against the running service (28 calls, no card number anywhere in it).

### Test Files

- [x] `apps/dummy-services/src/core/controls.test.ts` - health for all five services, unknown service, inspection content, training endpoints not logged, reset (state, log, mode, ids), reset-all, failure modes apply until cleared and stay per service, invalid modes, unknown routes
- [x] `apps/dummy-services/src/services/otp.test.ts` - send, code hidden from the reply but visible in inspection, verify right, wrong, expired, already used, five-attempt lock, resend replaces the code, bad numbers, failure modes
- [x] `apps/dummy-services/src/services/payments.test.ts` - authorize with bKash, Nagad and card, validation, card data refused and redacted, idempotency (same key, conflicting key, missing key), capture once and replay, new key conflict, release rules, refunds up to the captured amount, lookup, all four failure modes including ambiguous authorize and ambiguous capture
- [x] `apps/dummy-services/src/services/payouts.test.ts` - batch lines, one batch for a repeated key, conflicts and validation, freeze holds past the settlement time, release continues to paid, settlement delay, repeated freeze and release, paid payouts immutable, settle-now, failure modes
- [x] `apps/dummy-services/src/services/notifications.test.ts` - stored and inspectable, Bangla text intact, validation, failure modes
- [x] `apps/dummy-services/src/services/photos.test.ts` - PNG, JPEG and WebP round trip, type from the file signature, exactly 5 MB accepted, above 5 MB rejected, fake image and video rejected, non-multipart and wrong field rejected, metadata-only logging, timeout, down and ambiguous
- [x] `apps/dummy-services/src/test-helpers.ts` - shared app builder with a controllable clock, request helpers and a multipart body builder

### Acceptance Criteria Validation

**DUM-01 Dummy service host and training controls**
- ✅ **Health for each of the five APIs answers with status**: controls.test (overall and per service)
- ✅ **Reset empties stored state again**: controls.test (state, request log, failure mode and ids)
- ✅ **Inspect shows every request with time and body**: controls.test (at, method, URL, body, status, outcome)
- ✅ **Failure modes down, timeout, decline, ambiguous apply until cleared**: controls.test plus each service's own tests

**DUM-02 Dummy SMS / OTP API**
- ✅ **Send creates a code visible in inspection**: otp.test
- ✅ **Right code verifies before expiry**: otp.test (including exactly at the five-minute limit)
- ✅ **Wrong or expired code does not verify**: otp.test
- ✅ **Failure mode down fails like an unavailable provider**: otp.test (503, nothing created)

**DUM-03 Dummy payment gateway API**
- ✅ **Authorize returns authorized for bKash, Nagad, card**: payments.test
- ✅ **Capture twice with the same key yields one capture and the same result**: payments.test (same result and same capture time)
- ✅ **Release stops capture**: payments.test
- ✅ **Refund up to the captured amount is recorded**: payments.test (partial, final, over-refund refused)
- ✅ **Failure modes behave accordingly**: payments.test (down, decline, timeout, ambiguous authorize and capture)

**DUM-04 Dummy MFS payout API**
- ✅ **Batch sent twice with one key creates one batch**: payouts.test
- ✅ **Freeze holds until released**: payouts.test (still frozen after settlement time)
- ✅ **Release continues to paid**: payouts.test
- ✅ **Down: nothing paid, clear error**: payouts.test

**DUM-05 Dummy notification and photo APIs**
- ✅ **Notification stored and visible in inspection**: notifications.test
- ✅ **Photo up to 5 MB stored and returned by id**: photos.test
- ✅ **Over 5 MB or non-image rejected**: photos.test (also a fake image and video)
- ✅ **Timeout seen by the caller**: photos.test

### Issues Found

- **Fixed (real finding): card data was kept in the request log.** A rejected request containing a card number was shown in plain text by inspection. The Dummy gateway already refused such requests, but the log retained them, against the spirit of NFR-9. The log now blanks any card-data field; the test proves the number appears nowhere.
- **Fixed (found while planning the tests): photos up to 5 MB would have been rejected.** The host's general 1 MB request limit applied to uploads too. The limit is now the photo limit plus 1 MB, and an oversized upload gets a clear "photo too large" answer.
- **Fixed (test mistakes, not product defects):** an OTP test pattern matched the phone number, and a reset test mixed up its steps; both were corrected, the product code was right.

### Notes

- Ambiguous mode is tested for authorize, capture, payout batch, OTP, notification and photo, and for every one the action exists exactly once after a retry (or exactly once without a retry for services that have no key).
- Timeout tests use 20-30 ms instead of the 30 s default.
- Not covered by automated tests: the two process entry points (`server.ts` environment variables) and one rare branch in the base service; both were exercised by the curl demonstration.
