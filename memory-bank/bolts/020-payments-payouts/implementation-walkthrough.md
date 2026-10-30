---
stage: implement
bolt: 020-payments-payouts
created: 2026-11-01T16:00:00Z
---

## Implementation Walkthrough: earnings and admin payouts (bolt 020)

### Summary

Providers see their payouts by payout week with gross, commission rate and amount, net, status and the reason when on hold. The admin sees batches with their lines, frozen payouts, a Run batch now button and a reconciliation block that highlights any difference from the payout service.

### Completed Work

- [x] `apps/api/src/payouts/routes.ts` - `GET /provider/earnings`, `GET /admin/payouts/overview`
- [x] `apps/api/src/payouts/{port,dummy-payouts}.ts` - `listAll` for reconciliation
- [x] Web: provider Earnings page, admin Payouts page and its Run batch now endpoint
- [x] 14 new strings (523 keys, parity passes)

### Key Decisions

- Simplest workable version (see the plan). Reconciliation compares amounts per payout and flags missing or unknown lines; totals for both sides are shown.
