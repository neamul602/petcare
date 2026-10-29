---
stage: model-design
bolt: 008-payments-payouts
created: 2026-10-30T19:00:00Z
---

## Model, design and decisions: payments, thin slice (bolt 008)

Stories: PAY-01 authorize at request, PAY-02 capture on confirmation, PAY-03 release. Approved under the owner's standing instruction. Commission, payout queue, weekly batch, refunds and earnings screens are PAY-04..08 (bolts 012 and 020).

### Domain model

- **Payment** (one per booking): method, amount in poisha, status (authorizing, authorized, captured, released, release_pending, declined), gateway authorization and payment ids, gateway reference, the idempotency keys used.
- **Payment event**: every attempt and outcome, in the append-only event log (kind `payment_event`) with booking reference, gateway reference, amount and time.

### Design

- `PaymentPort` (authorize, capture, release, refund) with a Dummy adapter; the Dummy gateway is the only thing that knows its HTTP contract. Errors: declined, unavailable.
- `PaymentService` in `apps/api/src/payments/`: `authorize`, `capture`, `release`, `retryPendingReleases`. Booking bolts call it in process.
- **Never two holds / never two captures**: one stable idempotency key per booking and action (`auth-<booking>`, `cap-<booking>`). A lost reply is retried with the same key, so the gateway returns the first result. An unresolved authorization stays `authorizing`, and the next attempt re-asks with the same key.
- **Decline** is final for that booking reference: a new attempt uses a new booking reference (booking bolt).
- **Capture fails**: payment stays authorized, an event is logged, the caller can retry.
- **Release**: repeated release changes nothing; capture-then-release is refused; if the gateway is down the payment becomes `release_pending`, and `retryPendingReleases` (admin endpoint) finishes it.
- Card data is never handled; only the method name is sent.

### Decisions

- ADR-1: Gateway fees are not modelled (TD-15). ADR-2: one payment per booking; extra holds are refused as `already_exists`.
