---
stage: test
bolt: 025-admin-operations
created: 2026-11-02T15:10:00Z
---

## Test Report: provider health and defection signals (bolt 025)

### Summary

- **Tests**: 439 Vitest (10 new) and 261 Playwright passed (61 skipped by design; 1 new journey). ESLint, TypeScript, Astro check, i18n parity and project checks pass. Accessibility scans of the provider list with flags and the provider health page show no WCAG 2.1 AA violations.
- **Test stability**: the browser suite is now more patient (60 s per test, 10 s per check) because several journeys create bookings and upload photos while everything runs in parallel; two specs were also isolated from shared providers.

### Test Files

- [x] `apps/api/src/admin/health.integration.test.ts` - no flag in the first 30 days; flags below 40 % at day 30, 30 % at day 60 and 20 % at day 90; low confirmation after declines; Evaluate now audit-logged; outreach saved and audit-logged; queue rows show provider flags; defection signals with sources checked against the provider; nothing suspends; context metrics carry no targets
- [x] `tests/e2e/health.spec.ts` - flagged provider, Evaluate now, outreach, signal and the marker on the list

### Acceptance Criteria Validation

- ✅ **ADM-04**: each row shows tier, status and flags; utilization checkpoints; Evaluate now; outreach and outcome saved and audit-logged; nothing auto-suspends
- ✅ **ADM-05**: signals stored against the provider with their source; marker on the list and signals on the provider page; nothing suspended; counter-metrics shown without targets

### Issues Found

- Booking creation time came from the database clock, which hid recent requests from the health check under a test clock; bookings now use the injectable clock.
