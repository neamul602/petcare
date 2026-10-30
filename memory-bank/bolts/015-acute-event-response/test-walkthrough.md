---
stage: test
bolt: 015-acute-event-response
created: 2026-10-31T22:15:00Z
---

## Test Report: report a concern (bolt 015)

### Summary

- **Tests**: 370 Vitest (7 new acute-event tests) and 248 Playwright passed (48 skipped by design; 1 new journey). ESLint, TypeScript, Astro check, i18n parity and project checks pass. Accessibility scans of the concern sheet and the owner's banner page show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/acute/acute.integration.test.ts` - event stored with type, severity, observation and time; only for an in-stay booking of your own provider; invalid input refused; payout frozen, provider flagged in the audit log and still approved, admin queue item; owner banner data and early report window; admin list with both times and a gap under 5 minutes; completion still allowed
- [x] `tests/e2e/acute.spec.ts` - provider reports with vet clinics shown, owner sees the banner and the vet call links, the report sheet is open, admin list has the event

### Acceptance Criteria Validation

- ✅ **ACU-01**: sheet with type, severity and observation; vet clinics with tap-to-call on the page; not available outside an in-stay booking; event created with time and what happens next. (Offline queue of the concern is not built.)
- ✅ **ACU-02**: payout frozen, dispute window open early, provider flagged without suspension, admin queue item, owner in-app banner, both times stored. (SMS-style notification deferred.)

### Issues Found

- None open.
