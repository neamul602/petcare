---
stage: test
bolt: 007-search-capacity
created: 2026-10-30T18:15:00Z
---

## Test Report: search and capacity (bolt 007)

### Summary

- **Tests**: 257 Vitest (25 new capacity tests) and 247 Playwright passed (30 skipped by design; 7 new search journeys). ESLint, TypeScript, Astro check, i18n parity (277 keys), config literals, no-Dummy-in-web and contrast all pass. Accessibility scans of home, results (Bangla and English), View all, provider page and calendar show no WCAG 2.1 AA violations.
- Search p95 over 40 requests is far below the 1 s target (asserted in a test).

### Test Files

- [x] `apps/api/src/capacity/capacity.integration.test.ts` - night boundaries and window checks; 0, 1 and 2 booked at capacity 2; only chosen nights change; lowering below booked refused (service and API, 409 with the nights); closed nights; 8 nights reserved together; one full night blocks everything; 6 simultaneous requests for the last slot give exactly one winner; overlapping windows never overbook; release, release twice, reserve twice; non-approved provider refused; shortlist ranking, reasons, density, fewer-than-3 suggestion, empty, non-approved never returned, View all flags, input errors, availability strip, p95
- [x] `tests/e2e/search.spec.ts` - guest home with no invented numbers, owner search from home, shortlist with reasons (English and Bangla), View all, empty and suggestion states, availability and dates carried to Book, bad dates, provider capacity change with note and closed night
- [x] `tests/e2e/language.spec.ts`, `pwa.spec.ts` - updated for the new home and search headings

### Acceptance Criteria Validation

- ✅ **SRC-01**: only chosen nights change; available at 0 or 1 booked, full at 2; lowering below booked refused with explanation; night shows capacity, booked and note
- ✅ **SRC-03**: all nights together; blocked at submission with nothing reserved; last slot race gives one winner; releases on decline/timeout/cancel; release twice no change
- ✅ **SRC-04**: 3-5 approved providers free every night; Tier-A first, only tier, density and capacity; reason visible, no sponsor or distance; View all approved; availability on the provider page; p95 under 1 s
- ✅ **SRC-05**: guest sees promise, how it works and Find care with no statistics; owner picks area, dates and species; the Book again card is built with SRC-05's second half in bolt 017 (needs completed stays)

### Issues Found

- The home and search headings changed, so two older specs were updated.
