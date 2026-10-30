---
stage: implement
bolt: 012-payments-payouts
created: 2026-10-31T15:00:00Z
---

## Implementation Walkthrough: commission, payouts, freeze and refund (bolt 012)

### Summary

Providers' earnings are now computed and paid by rule: the commission rate is fixed when the provider confirms, a payout is queued at completion, a weekly batch pays what is due and not frozen, and the admin can freeze, release and refund.

### Completed Work

- [x] `packages/shared/src/payments.ts` - `commissionBasisPoints`, `commissionOn`, `netPayoutPoisha`
- [x] `apps/api/src/db/schema/payments.ts`, `bookings.ts`, `drizzle/0010_payouts.sql` - payouts, payout batches, refunded amount on payments, commission rate on bookings
- [x] `apps/api/src/payouts/{port,dummy-payouts,payout-service,routes}.ts`
- [x] `apps/api/src/payments/payment-service.ts` - refund with one idempotency key per refund
- [x] `apps/api/src/bookings/provider-service.ts` - the rate is stored on the booking when the provider confirms
- [x] `apps/api/src/app.ts`, `server.ts` - wiring; the one-minute timer runs the weekly batch when due and marks settled payouts paid
- [x] Admin endpoints: `GET /admin/payouts`, `POST /admin/payouts/run-batch`, `POST /admin/bookings/:id/freeze`, `.../release-freeze`, `.../refund`

### Key Decisions

- See the plan. In short: one batch key per run, a down service leaves payouts queued, refunds recompute the payout at the same rate, full refund cancels it, refunds are blocked once a payout has been sent.
- The peak-window flag is a stub that always says no until bolt 019.
- `queueForBooking` is called by the completion bolt (013); freeze and refund are called by reports and acute events (bolts 015, 022).

### Deviations from Plan

- No screens in this bolt: provider earnings and the admin payouts screen are PAY-07 and PAY-08 (bolt 020).
