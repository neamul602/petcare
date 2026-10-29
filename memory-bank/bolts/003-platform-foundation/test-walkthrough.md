---
stage: test
bolt: 003-platform-foundation
created: 2026-10-30T06:00:00Z
---

## Test Report: platform-foundation (bolt 003)

### Summary

- **Tests**: 375/375 passed across the project: 141 Vitest tests (17 files) and 234 Playwright tests (1 skipped by design: a phone-only measurement). New in this bolt: 21 Vitest tests and 149 Playwright tests.
- **Coverage** (Vitest, all packages and apps): 95% statements, 86% branches, 96% functions, 96% lines.
- **Other checks**: ESLint clean; TypeScript strict clean in every workspace; Astro type check 0 errors; the four project checks pass (i18n parity now 50 keys, config literals 6 distinctive values, no Dummy calls from web, contrast 18 pairs).
- **Commands**: `npm run verify` (needs PostgreSQL: `npm run db:up`), then `npm run test:e2e` (dev server on 4321 running; the production build is built and served on 4322 by the config).
- **Measured on the production build under throttled slow 4G (1.6 Mbps, 150 ms, 4x CPU)**: owner home 215 KB, provider home 216 KB, pets 215 KB; interactive (load plus all islands hydrated) after about 2.2 s. Budgets are 500 KB and 3 s. The measure is a proxy; the full Lighthouse report is workbook Step 32.

### Test Files

- [x] `tests/e2e/pwa.spec.ts` - manifest and icons load; service worker registers and takes control; a visited page opens offline with the Bangla offline banner; a page never opened shows the offline page with a way back; admin pages are never kept; offline page in Bangla and English
- [x] `tests/e2e/performance.spec.ts` - payload under 500 KB and interactive under 3 s on throttled 4G for owner home, provider home and pets
- [x] `tests/e2e/a11y.spec.ts` - axe scan (WCAG 2.1 A and AA) of 33 pages in Bangla and in English on phone and desktop (132 scans); skip link is the first stop; focus is visible; adjacent touch targets are at least 8 px apart on all three shells
- [x] `tests/e2e/persistence.spec.ts` - typed text survives a reload; passwords are never kept; the clear event removes it; loading, empty and four error states render with one clear next action and no "sorry"
- [x] `packages/shared/src/seed/schema.test.ts` - the real seed has the three neighbourhoods and clinics, Bibi and Tito, Rashid, Ayaat, four approved providers across both tiers and one pending Tier-B application; every file is labelled; no rating, review, testimonial or count anywhere; the validator refuses a rating, review count, testimonial, missing label, off-launch neighbourhood, wrong species, missing application, unknown owner, too few providers
- [x] `apps/api/src/seed/run.integration.test.ts` - real PostgreSQL: the seed creates the database and loads 3 neighbourhoods and 6 clinics, all labelled; running twice gives the same state and removes anything added in between; refuses a remote database and an unsafe name; resets running Dummy services
- [x] `tests/e2e/shell.spec.ts`, `language.spec.ts`, `touch-targets.spec.ts` (bolt 001) - still passing unchanged
- [x] `scripts/checks.test.mjs` (bolt 001) - still passing after the config-literal refinement

### Acceptance Criteria Validation

**FND-04 PWA, offline and shared states**
- ✅ **Installable (manifest and service worker)**: pwa.spec (manifest fields, three icons including maskable, service worker controls the page). The browser's own install prompt was not driven; a real-device install is a manual check.
- ✅ **Offline: cached screens work and the banner shows**: pwa.spec (a visited page opens offline; banner text in Bangla)
- ✅ **Typed input kept and restored**: persistence.spec (survives reload; passwords excluded; clear event)
- ✅ **Loading, empty and error patterns with clear next actions**: persistence.spec (all variants, one link each, no apology wording)
- ✅ **No invented content in empty states**: the empty component takes its text from the caller and contains none of its own (code review plus the kit render)

**FND-06 Performance and accessibility checks**
- ✅ **Payload under 500 KB**: performance.spec (about 215 KB)
- ✅ **Interactive under 3 s on throttled 4G**: performance.spec (about 2.2 s, proxy measure)
- ✅ **No WCAG 2.1 AA violations**: a11y.spec (132 scans, zero violations)
- ✅ **Keyboard order, visible focus, skip link**: a11y.spec
- ✅ **8 px spacing between adjacent touch targets**: a11y.spec (this closes the gap left open in bolt 001)

**FND-07 Training scenario seed**
- ✅ **Neighbourhoods and vet clinics exist after the seed**: run.integration.test and the seed run
- ✅ **Bibi, Tito, Rashid, Ayaat, further providers and one pending Tier-B application**: schema.test (validated; loaded into tables by the bolts that create them)
- ✅ **No review, rating, booking count or testimonial**: schema.test (guard plus strict schemas)
- ✅ **Every record labelled as training data**: schema.test (file labels) and run.integration.test (database flag)
- ✅ **Running it twice gives the same state**: run.integration.test

### Issues Found

- **Fixed (real defect): desktop top navigation gaps were 4 px**, below the 8 px spacing rule; found by the new spacing test. Navigation and the admin sidebar now have 8 px gaps. The provider and owner headers also use 8 px gaps on phones.
- **Fixed (test mistake):** the focus test looked only for an outline, but the design system draws focus as a solid ring (box-shadow). The test now accepts either, and requires at least 2 px.
- **Fixed (flaky test, not a product defect):** one axe scan failed once while the cold development server compiled a route mid-scan. The scan now waits for the network to settle; the full phone suite then passed repeatedly.
- **Fixed (false alarm in a project check):** the config-literal check flagged the everyday number 1000 and a clinic opening time written in text; it now watches distinctive minute values and local times in code only.
- **Noted:** in this agent environment Astro starts its development server in the background, so the Playwright configuration cannot start it; it was started beforehand. On a normal terminal the configured command works.

### Notes

- The PWA and performance specs run only in the `production` Playwright project, which builds and serves the app on port 4322.
- Real-device install and a Lighthouse PWA audit are manual or Step 32 evidence; they are not claimed here.
- Evidence files: terminal output of `npm run verify` and `npm run test:e2e`, `playwright-report/index.html`, and the printed payload and timing lines.
