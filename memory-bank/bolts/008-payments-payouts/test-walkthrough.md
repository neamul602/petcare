---
stage: test
bolt: 008-payments-payouts
created: 2026-10-30T19:45:00Z
---

## Test Report: payments, thin slice (bolt 008)

### Summary

- **Tests**: 277 Vitest (20 new payment tests) and 247 Playwright passed (30 skipped by design). ESLint, TypeScript, Astro check and all project checks pass. No screens in this bolt.

### Test Files

- [x] `apps/api/src/payments/payments.integration.test.ts` - real PostgreSQL and the real Dummy gateway: BDT 20,000 for 8 nights at BDT 2,500; bKash, Nagad and card; repeat authorize holds once; decline explained and final; gateway down and timeout leave nothing held and retry works; lost reply reconciled with one hold; invalid amounts; log entries with time, gateway reference and booking reference; capture once; capture retried after a lost answer captures once; failed capture leaves the payment authorized; release, release twice, release after capture refused; release at a down gateway is pending, listed for the admin and finished by retry; a hold that was never reported is found and released; admin endpoints need the admin; only the method name reaches the gateway

### Acceptance Criteria Validation

- ✅ **PAY-01**: authorization for the total through the port, nothing captured; gateway down or timeout creates nothing and can be retried; decline explained; every attempt logged; ambiguous result reconciled, never two holds
- ✅ **PAY-02**: captured once with an idempotency key; retried capture captures once; the record holds booking, owner, provider, method, amount, gateway reference and time (booking, pet and nights join in the booking bolts); a failed capture leaves the booking awaiting confirmation
- ✅ **PAY-03**: release on decline, timeout and cancellation logged; repeating changes nothing; a down gateway is retried and shown to the admin as pending

### Issues Found

- One unrelated sign-in browser test failed once while TypeScript was failing elsewhere and passed on the next two runs; it is the known shared-OTP-state flake, not caused by this bolt.
