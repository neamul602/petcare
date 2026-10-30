---
stage: test
bolt: 014-reviews-disputes
created: 2026-10-31T20:45:00Z
---

## Test Report: reviews and report a problem (bolt 014)

### Summary

- **Tests**: 363 Vitest (12 new review tests) and 247 Playwright passed (47 skipped by design; 2 new journeys). ESLint, TypeScript, Astro check, i18n parity and project checks pass. Accessibility scans of the review form, report sheet and public provider page show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/reviews/reviews.integration.test.ts` - rating 1-5 required, once only, own completed booking only, stay photos only, an open report does not block a review; public page shows nothing for no reviews, newest first, verified, with photos, average and share with photos from real reviews, a removed review hidden but stored, photos public only while published, search ranking unaffected; report disputes the booking, freezes the payout and reaches the admin list, refused after 72 hours and when repeated, category and description and photo checks
- [x] `tests/e2e/reviews.spec.ts` - review with a stay photo appears on the public provider page; report a problem disputes the booking
- [x] `tests/e2e/providers.spec.ts` - now uses Farzana for the "no reviews yet" page

### Acceptance Criteria Validation

- ✅ **REV-01**: rating, optional text and stay photos; completed only; one review; photos from the stay window; not blocked by a report
- ✅ **REV-02**: newest first, verified, photos; real aggregates; new-provider message; ranking ignores reviews; removed reviews hidden but kept
- ✅ **REV-05**: category, description and up to 5 stay photos within 72 h; booking disputed, payout frozen, admin sees it; window closed and repeat refused with reasons; review untouched

### Issues Found

- A photo checkbox had no accessible name (found by the accessibility scan); labelled.
