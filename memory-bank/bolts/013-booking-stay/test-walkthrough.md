---
stage: test
bolt: 013-booking-stay
created: 2026-10-31T18:15:00Z
---

## Test Report: completion and cancellations (bolt 013)

### Summary

- **Tests**: 351 Vitest (13 new completion tests) and 245 Playwright passed (45 skipped by design; 4 new journeys). ESLint, TypeScript, Astro check, i18n parity (440 keys) and project checks pass. Accessibility scans of the new provider and owner states show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/bookings/completion.integration.test.ts` - mark complete only from the end date and allowed without updates; owner confirms, payout queued and care history recorded once; owner cannot confirm early; people outside the booking refused; admin completes only after the end date with a reason and an audit entry; owner cancellation request is a queue item with no automatic refund; provider cancellation needs a reason; admin full refund, partial refund and no action; no-show flagged from the start date and resolved by keeping funds or refunding; missed start becomes a queue item; transitions logged
- [x] `tests/e2e/completion.spec.ts` - complete and confirm, cancellation request, provider cancellation, no-show

### Acceptance Criteria Validation

- ✅ **BKG-15**: provider marks complete, owner confirms, booking completed, payout queued; missed updates and acute events do not block; Q-S1 decided (admin completes after the end date). The review opening arrives in bolt 014.
- ✅ **BKG-11**: owner cancellation is a queue item with no automatic refund; provider cancellation goes to the admin; no-show and missed start go to the admin; every transition logged.

### Issues Found

- Test cleanup needed the new queue table, and browser specs competed for Rashid's nights today; his capacity is raised for those dates in the completion spec.
