---
stage: test
bolt: 022-reviews-disputes
created: 2026-11-01T21:10:00Z
---

## Test Report: moderation, care record and resolving reports (bolt 022)

### Summary

- **Tests**: 414 Vitest (9 new) and 258 Playwright passed (58 skipped by design; 1 new journey). ESLint, TypeScript, Astro check, i18n parity and project checks pass. Accessibility scans of the care record, the admin Reviews page, the report detail and the owner's moderated booking show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/reviews/moderation.integration.test.ts` - list and remove with reason, hidden publicly and kept stored, audit entry, second removal refused, negative-review reminder flag; owner sees the result read-only with no way to review again; moderation leaves the report alone; listed reasons only and admin only; care record counts by care need only from reviewed stays, empty state, ranking unaffected; report detail with booking, care history, updates, decline patterns and review; no action releases the freeze and resolves the booking, review untouched; refund through payout rules with amount limit; warning, suspension and removal without a refund; audit log and guards
- [x] `tests/e2e/moderation.spec.ts` - care record, removal with the reminder, report resolved with a warning, owner view

### Acceptance Criteria Validation

- ✅ **REV-03**: list, remove with reason, hidden/kept/audit-logged, negative-review reminder, read-only result for the owner, report untouched
- ✅ **REV-04**: counts by care need from completed, reviewed stays; empty state; never used for ranking
- ✅ **REV-06**: full view (chat deferred); no action, refund or provider action with a rationale; refunds and freezes through PAY-06, provider action through SUP-01; booking resolved or refunded; review untouched; audit-logged

### Issues Found

- The provider care summary compared the sign-in id with the provider record id; fixed to use the record id.
