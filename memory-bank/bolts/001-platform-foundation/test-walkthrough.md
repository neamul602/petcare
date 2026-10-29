---
stage: test
bolt: 001-platform-foundation
created: 2026-10-29T21:00:00Z
---

## Test Report: platform-foundation

### Summary

- **Tests**: 127/127 passed (42 Vitest unit and integration tests, 85 Playwright end-to-end tests; 1 Playwright test is skipped by design because it measures the phone profile only)
- **Coverage**: 81% of statements, 84% of branches, 91% of functions (Vitest, API, Dummy host and shared package). Uncovered lines are the two process entry points (`server.ts`, `migrate.ts`), which are exercised by the manual and end-to-end runs rather than unit tests.
- **Other checks**: ESLint clean; Astro type check 54 files, 0 errors; TypeScript strict clean in all workspaces; production build succeeds; the four project checks pass (i18n parity 36 keys, config literals, no Dummy calls from web, contrast 18 pairs).
- **Command**: `npm run verify` (lint, type checks, project checks, Vitest) then `npm run test:e2e` (Playwright, 2 projects: phone 390 px and desktop 1280 px).

### Test Files

- [x] `packages/shared/src/clock.test.ts` - system clock, test clock moving forward only, copies not shared
- [x] `packages/shared/src/i18n/index.test.ts` - Bangla default, parity of a key in both languages, admin English catalog, loud failure on a missing key
- [x] `packages/shared/src/locale/format.test.ts` - ৳ amounts with lakh grouping, refusal of fractional poisha, counts, Bangla and English dates, Dhaka time
- [x] `packages/shared/src/config/training-decisions.test.ts` - pins TD-1 to TD-16 and the platform rules to the approved standard; the config cannot be changed at runtime
- [x] `apps/api/src/config.test.ts` - the API loads the approved rules and refuses to start on a missing or malformed value
- [x] `apps/api/src/app.test.ts` - health endpoint answers with 16 rules loaded
- [x] `apps/api/src/log/append.integration.test.ts` - real PostgreSQL: an audit entry is stored; UPDATE, DELETE and TRUNCATE are rejected; an entry without actor or target is refused; nothing was lost
- [x] `apps/dummy-services/src/app.test.ts` - Dummy host health answers and says it is training-only
- [x] `scripts/checks.test.mjs` - each project check passes on the real project and fails on bad input (missing translation, empty message, hard-coded TD value, Dummy call in web code, the original DESIGN.md amber below AA)
- [x] `tests/e2e/shell.spec.ts` - all 30 blueprint routes open in the right shell; friendly 404; no horizontal scroll at 320 px on all three shells; navigation per role; active tab marked; admin sidebar on desktop and Menu button on phones
- [x] `tests/e2e/language.spec.ts` - Bangla on first visit; toggle switches to English, stays on the page and persists across pages and reloads; English switches back; admin is English with no toggle; the switch never redirects off-site
- [x] `tests/e2e/touch-targets.spec.ts` - visible navigation and header controls are at least 44 px tall on the phone; kit buttons, inputs and the sheet trigger meet 44 px

### Acceptance Criteria Validation

**FND-01 Workspace and app shell**
- ✅ **Dev commands start web, API and Dummy host with health endpoints**: verified manually (`/health` on 3000 and 4100) and by the API and Dummy tests; the web app is exercised by every E2E test
- ✅ **Owner tab bar Home, Bookings, Pets, Inbox**: shell.spec (Bangla labels, tab bar on phones, top navigation on desktop)
- ✅ **Provider tab bar Today, Calendar, Bookings, Earnings, Profile**: shell.spec
- ✅ **Admin sidebar Queue to Audit log, collapsing below 768 px**: shell.spec on both profiles
- ✅ **Every blueprint route resolves to a placeholder in the right shell**: 30 routes x 2 profiles; unknown route gives the friendly 404

**FND-02 Design tokens and UI kit**
- ✅ **Every DESIGN.md token available by name**: tokens.css maps colours, fonts, radii and shadows to Tailwind names; kit gallery renders them (visual check)
- ✅ **Screens use kit components**: all shells and placeholders use Button, Card and the shared layout
- ✅ **Contrast meets WCAG 2.1 AA**: check-contrast covers 18 pairs; three DESIGN.md colours were adjusted (UC-22)
- ✅ **Coral only in acute components**: only `Badge variant="acute"` uses the accent colour (code review of the kit)
- ✅ **Targets at least 44x44 px with 8 px spacing**: touch-targets.spec for heights; the 8 px spacing was reviewed visually in the shells and is not yet an automated check

**FND-03 Bangla and English with parity**
- ✅ **First visit is Bangla; toggle switches and persists**: language.spec
- ✅ **Admin English only, no toggle**: language.spec
- ✅ **Parity check fails the build on a missing key**: checks.test (fails on a missing key and on an empty message)
- ✅ **One locale helper for amounts and dates**: format.test

**FND-05 Configuration, clock and log primitives**
- ✅ **TD-1..TD-16 load from one module and appear nowhere else**: training-decisions.test and the config-literal check (passes on source, fails on a hard-coded value)
- ✅ **Clock can be advanced in tests**: clock.test
- ✅ **Log entries inserted but never updated or deleted**: append.integration.test against real PostgreSQL
- ✅ **No Dummy URL in web code**: check-no-dummy-in-web (passes on source, fails on a bad file)

### Issues Found

- **Fixed:** the provider header overflowed by 15 px at 320 px width (brand, language toggle, Inbox and Settings did not fit). Found by the 320 px E2E test; fixed by tighter padding and gaps on narrow screens.
- **Fixed:** a test selector for the admin Menu button also matched the Astro development toolbar; the test is now scoped to the page header.
- **Fixed:** an unwrapped error in the integration test failed the new lint rule `preserve-caught-error`; it now carries its cause.
- **Noted for bolt 003 (not a defect of this bolt):** the font packages ship every script subset (Cyrillic, Greek and more) as separate files. Browsers only download the subsets a page needs, but bolt 003 must limit imports to Latin and Bengali and measure the real initial payload against the 500 KB budget (FND-06).
- **Noted:** the 8 px spacing between adjacent touch targets has no automated check yet; bolt 003 adds accessibility scanning (axe).
- **Housekeeping:** the append-only development database keeps one earlier "smoke" row; the integration test uses its own throwaway database, so it is unaffected.

### Notes

- Tests need PostgreSQL running (`npm run db:up`); the integration test says so clearly if it is not reachable.
- Playwright reuses a running web server on port 4321 or starts one; the phone project emulates a Pixel 7 at 390 px, the desktop project is 1280 px.
- Evidence for the course: terminal output of `npm run verify` and `npm run test:e2e` (and `playwright-report/index.html`) for STEP-15 onwards; `STEP-32` later reuses the i18n check output.
