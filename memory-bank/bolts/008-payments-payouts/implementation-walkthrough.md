---
stage: implement
bolt: 008-payments-payouts
created: 2026-10-30T19:30:00Z
---

## Implementation Walkthrough: payments, thin slice (bolt 008)

### Summary

The money core for a booking: place a hold when the owner requests, take it once when the provider confirms, give it back when the stay does not go ahead. Every attempt is logged, and a lost answer can never cause a second hold or a second capture.

### Completed Work

- [x] `packages/shared/src/payments.ts` - method order (bKash, Nagad, card) and `stayTotalPoisha`
- [x] `apps/api/src/db/schema/payments.ts`, `drizzle/0007_payments.sql`
- [x] `apps/api/src/payments/{port,dummy-payments,payment-service,routes}.ts`
- [x] `apps/api/src/app.ts`, `server.ts` - payment port wired to the Dummy gateway; admin endpoints for pending releases

### Key Decisions

- One stable idempotency key per booking and action; lost replies are asked again with the same key (two extra tries), so the gateway returns the first result.
- Unresolved authorization stays `authorizing`; the next attempt, or a release, asks the gateway again with the same key.
- A decline is final for that booking reference.
- Release at a down gateway becomes `release_pending`, visible to the admin and finished by `retryPendingReleases`.
- Refund exists on the port for bolt 020; gateway fees are not modelled.

### Developer Notes

- Booking bolts call `authorize` before creating a booking (no booking if it fails), `capture` on confirmation, and `release` on decline, timeout or owner cancellation. The payment screen for the owner arrives with bolt 009.
