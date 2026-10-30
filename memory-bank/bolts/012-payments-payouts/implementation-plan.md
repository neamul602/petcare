---
stage: model-design
bolt: 012-payments-payouts
created: 2026-10-31T13:30:00Z
---

## Model, design and decisions: commission, payouts, freeze and refund (bolt 012)

Stories: PAY-04 commission and payout queue, PAY-05 weekly payout batch, PAY-06 freeze, release and refund. API and rules only; the provider earnings and admin payouts screens are PAY-07 and PAY-08 (bolt 020). Approved under the owner's standing instruction.

### Domain model

- **Commission** is a rate in basis points fixed on the booking when the provider confirms (Tier-A 10 %, Tier-A in a peak window 8 %, Tier-B 16 %). A later tier change never touches it. The peak-window flag is a parameter until peak windows exist (bolt 019).
- **Payout** (one per booking): gross, rate, commission, net, status (queued, sent, paid, frozen, cancelled), eligible-from time (completion plus the 72 h dispute window), freeze reason, gateway payout id, batch.
- **Payout batch**: a run key, so a weekly run is recorded once.

### Design

- `PayoutPort` with a Dummy adapter (create batch, freeze, release, status). A down service leaves payouts queued.
- `PayoutService`: `queueForBooking` (called when completion is confirmed, bolt 013), `runBatch` (eligible, not frozen, queued; one batch idempotency key per run so a repeat never double-pays), `runScheduledBatch` (Sunday 10:00 Dhaka, retried each minute until it succeeds), `syncPaid` (marks gateway-settled payouts paid), `freeze`, `releaseFreeze`, `refund`.
- Freeze before sending is local; after sending it also freezes at the gateway; a paid payout cannot be frozen.
- Refund: admin enters an amount up to what was captured and a rationale; the refund goes to the original method through the payment port with its own idempotency key; the payout is recomputed on what remains (same rate) and released; a full refund leaves no payout. The booking moves to refunded. Allowed for bookings in disputed, resolved or no-show.
- Every queue, freeze, release, send and refund is a payment event in the append-only log.
- Admin endpoints for now: list payouts, run batch now (same rules), freeze, release, refund.
