---
stage: test
bolt: 012-payments-payouts
created: 2026-10-31T15:15:00Z
---

## Test Report: commission, payouts, freeze and refund (bolt 012)

### Summary

- **Tests**: 338 Vitest (17 new payout tests) and 241 Playwright passed (41 skipped by design). ESLint, TypeScript, Astro check and all project checks pass. No screens in this bolt.

### Test Files

- [x] `apps/api/src/payouts/payouts.integration.test.ts` - rates (10 %, 8 % peak, 16 %) and BDT 20,000 at 10 % pays BDT 18,000; rate fixed at confirmation and unchanged by a later tier change; payout linked to booking and rate; queued once; not queued without a capture; nothing paid before the 72 h window closes; run twice pays once; payout service down leaves payouts queued and the next run pays once; lost reply no double payout; Sunday 10:00 Dhaka run, once, not other days; settled payouts marked paid; Run batch now same rules and admin only; freeze excludes from the batch and release brings it back; freeze after sending also freezes at the gateway, refused once paid; freeze needs a reason and a captured booking, repeat changes nothing; partial refund to the original method with the remaining payout released net; refund equal to captured leaves no payout; refunds refused for too much, wrong state, no rationale, payout already sent; refund while the payment service is down changes nothing and retries; payment events logged

### Acceptance Criteria Validation

- ✅ **PAY-04**: rate fixed at confirmation; payout queued at completion with BDT 18,000 net for BDT 20,000 at 10 %; linked to booking and rate; unaffected by tier change
- ✅ **PAY-05**: batch pays eligible, unfrozen payouts only; down service keeps them queued; Run batch now uses the same rules; no double payout
- ✅ **PAY-06**: freeze excludes from batches; release frees it; refund up to captured with a rationale to the original method, remaining payout released net; every freeze, release and refund is logged

### Issues Found

- The config-literal check caught the batch time written in a comment; reworded.
