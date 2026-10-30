---
stage: test
bolt: 020-payments-payouts
created: 2026-11-01T16:10:00Z
---

## Test Report: earnings and admin payouts (bolt 020)

### Summary

- **Tests**: 395 Vitest (4 new) and 255 Playwright passed (55 skipped by design; 1 new journey). ESLint, TypeScript, Astro check, i18n parity and project checks pass. Accessibility scans of Earnings and the admin Payouts page show no WCAG 2.1 AA violations.

### Test Files

- [x] `apps/api/src/payouts/payouts.integration.test.ts` - earnings grouped by payout week with gross, rate, commission, net, status and the freeze reason, empty for a new provider, role guards; admin overview with batches and lines, frozen payouts and matching totals; a changed amount and a payout unknown locally are highlighted; admin only
- [x] `tests/e2e/earnings.spec.ts` - a completed, frozen stay appears on Earnings with commission, net and reason, and on the admin Payouts page with reconciliation; Run batch now

### Acceptance Criteria Validation

- ✅ **PAY-07**: booking, gross, commission rate and amount, net and status; frozen reason visible; empty state
- ✅ **PAY-08**: batches, lines and frozen payouts listed; mismatch with the Dummy payout inspection highlighted

### Issues Found

- None.
