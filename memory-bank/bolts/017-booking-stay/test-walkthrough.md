---
stage: test
bolt: 017-booking-stay
created: 2026-11-01T10:15:00Z
---

## Test Report: bookings list and Book again (bolt 017)

### Summary

- **Tests**: 380 Vitest (5 new) and 252 Playwright passed (52 skipped by design; 2 new journeys). ESLint, TypeScript, Astro check, i18n parity and project checks pass. Accessibility scans of the bookings list, the pre-filled flow and the unavailable page show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/bookings/book-again.integration.test.ts` - upcoming and past with pills and Book again only for a completed stay, private to the owner; timer starts and prefill is returned; a new hold on submit and the elapsed time stored (3 minutes in the test); own completed booking only; provider no longer available flagged
- [x] `tests/e2e/book-again.spec.ts` - list, Home card, pre-filled flow to a submitted request; unavailable provider message

### Acceptance Criteria Validation

- ✅ **BKG-17**: upcoming and past with pills; Book again on a past completed stay
- ✅ **BKG-16**: pre-filled flow marked "from Tito's last stay"; works like a first booking with a new hold; elapsed time shown and stored on the server (under 4 minutes in the test); provider unavailable shown with alternatives; the "faster than first booking" claim is not shown
- ✅ **SRC-05 (second half)**: Home shows a Book again card for a past completed stay

### Issues Found

- None open.
