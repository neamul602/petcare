---
stage: plan
bolt: 020-payments-payouts
created: 2026-11-01T15:00:00Z
---

## Implementation Plan: earnings and admin payouts (bolt 020)

Stories: PAY-07 provider earnings, PAY-08 admin payouts and reconciliation. Simplest workable version: two read screens on top of the payout data from bolt 012.

- **Provider Earnings**: payouts grouped by payout week (the Sunday batch they fall into), each with booking, gross, commission rate and amount, net and status (queued, sent, paid, on hold, cancelled), the freeze reason when on hold, a calm empty state.
- **Admin Payouts**: batches with their lines, frozen payouts with reasons, a Run batch now button (same rules as the weekly run), and a reconciliation block that compares our records with what the Dummy payout service holds; any difference is highlighted. The payout port gets a `reconcile` read for this (training inspection endpoint, API only).
