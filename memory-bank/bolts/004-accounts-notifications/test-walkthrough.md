---
stage: test
bolt: 004-accounts-notifications
created: 2026-10-30T13:00:00Z
---

## Test Report: accounts-notifications (bolt 004)

### Summary

- **Tests**: 437/437 passed across the project: 188 Vitest tests (18 files) and 249 Playwright tests (14 skipped by design: phone-only checks on the desktop profile and the sign-in flows). New in this bolt: 48 API sign-in and guard tests, 13 browser sign-in tests, plus updated older specs. The full Playwright suite passed three times in a row.
- **Coverage** (Vitest, all packages and apps): 94% statements, 84% branches, 95% functions, 95% lines; the sign-in code is 95% statements.
- **Other checks**: ESLint clean; TypeScript strict clean; Astro type check 0 errors; project checks pass (i18n parity 86 keys, config literals, no Dummy calls from web, contrast); performance still about 216 KB and 1.8 s median under throttled 4G.
- **Commands**: `npm run verify`, then `npm run test:e2e` (needs PostgreSQL; the browser tests start the API and the Dummy service themselves and use a separate seeded database).

### Test Files

- [x] `apps/api/src/auth/auth.integration.test.ts` - real PostgreSQL and the real Dummy OTP service in process: sign-in for an existing owner, number formats, resend time, a new number's profile step, setup token single use and expiry, wrong, expired, reused and locked codes, the send limit, code service down and silent, provider sign-in, no public provider creation, sign-out and token hashing, session expiry, admin sign-in and 12-hour sessions, generic admin errors, admin limit, hashed passwords, audit entries, the audit helper, a second admin, and the full role matrix (5 endpoints x 4 identities)
- [x] `apps/api/src/seed/run.integration.test.ts` - updated: accounts (1 owner, 4 provider accounts, 1 admin with a hashed password) are loaded
- [x] `packages/shared/src/seed/schema.test.ts` - updated for provider phones and the admin email
- [x] `tests/e2e/auth.spec.ts` - guest redirected to sign in and back; Bibi signs in, stays signed in after reload, signs out; the cookie is httpOnly and not readable by page scripts; wrong code explained in Bangla; resend countdown and English switch; new number's name and neighbourhood step; code service down then recovered; provider routing and keeping out of other areas; owner cannot open provider pages; admin sign-in and sign-out in English; owner session cannot open the admin console; accessibility scans of the code and profile steps in both languages
- [x] `tests/e2e/shell.spec.ts`, `language.spec.ts`, `a11y.spec.ts`, `touch-targets.spec.ts` - updated to open each route as the right signed-in role; a guest sees "Sign in" instead of Settings
- [x] `tests/e2e/pwa.spec.ts`, `performance.spec.ts` - moved to public pages; the speed check now uses the median of three cold loads

### Acceptance Criteria Validation

**ACC-01 Sign in with phone OTP**
- ✅ **Code sent through the OTP port, 60 s resend timer**: auth.integration.test (reply carries 60, never the code); auth.spec (button disabled with a countdown)
- ✅ **Right code signs in and starts a session**: both
- ✅ **New owners give a name and a launch neighbourhood**: both (only the three launch areas offered and accepted)
- ✅ **Provider phones reach `/provider`**: both; an unknown number can only become an owner
- ✅ **Wrong, expired or reused codes refused clearly**: API (codes `wrong_code`, `expired`, `already_used`, `too_many_attempts`); browser (Bangla message)
- ✅ **Code service down fails safely and can be retried**: API (503, no session, retry works, also for a silent service); browser (Bangla message, then works)

**ACC-02 Admin sign-in and role guards**
- ✅ **Separate admin sign-in**: separate cookie, table and session length; admin form in English with no language toggle
- ✅ **Owner or provider sessions refused on admin and other-role APIs**: the 5 x 4 role matrix (401 for nobody, 403 for the wrong kind); browser redirects
- ✅ **A second admin needs no schema change**: API test inserts one and signs in
- ✅ **Every admin action can be audit-logged through one helper**: sign-in, failed sign-in and sign-out are logged; the helper is tested with a reason code; the log cannot be changed

### Issues Found

- **Fixed (test race):** the browser tests sometimes clicked "Send code" before the sign-in form had finished loading. The helper now waits for the page to be interactive. After the fix the full suite passed three times in a row.
- **Fixed (real robustness gap):** if the database was recreated while the API ran, the connection pool could crash the process. The pool now logs the error and reconnects.
- **Fixed (real UX detail):** the code step echoed the number as typed; it now shows the cleaned-up form the service used (for example +8801712000001).
- **Fixed (test design):** parallel specs shared the Dummy OTP service, so the sign-in accessibility scans moved into the serial sign-in spec; the per-number send limit became a setting that the browser tests raise.
- **Noted:** `npm audit` shows 7 low and moderate findings in development tooling only; not forced.
- **Noted:** provider accounts are not yet tied to provider status; that is bolt 006.

### Notes

- Evidence for workbook Step 19 (OTP): `STEP-19-otp.png` is the sign-in code step; `STEP-19-network.png` should show the `/api/auth/otp/send` and `/verify` calls in the browser's network tab.
- The notification port, inbox and notification settings remain deferred (see `memory-bank/deferred-scope.md`).
