---
id: 004-commission-and-payout-queue
code: PAY-04
unit: 007-payments-payouts
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1, UJ-2
created: 2026-10-29T16:00:00Z
assigned_bolt: 012-payments-payouts
implemented: false
---

# Story PAY-04: Commission and payout queue

## User Story

**As a** provider
**I want** my payout to be captured amount minus a commission fixed at confirmation
**So that** I can predict what I earn

## Acceptance Criteria

- [ ] **Given** confirmation, **When** captured, **Then** the commission rate is fixed on the booking: Tier-A 10 %, Tier-A in a peak window 8 %, Tier-B 16 %
- [ ] **Given** completion, **When** confirmed, **Then** a payout is queued: BDT 20,000 at 10 % gives BDT 18,000 net
- [ ] **Given** the payout, **When** stored, **Then** it is linked to the booking and the rate used

## Traceability

- **Requirements:** FR-41, NFR-25; TD-8
- **Journeys:** UJ-1, UJ-2

## UI/UX Impact

P5 Earnings

## API Dependencies (including Dummy APIs)

Payouts API

## Test Expectations

Unit tests for net amounts

## Dependencies

### Requires
- PAY-02 Capture on confirmation (`007-payments-payouts/stories/002-capture-on-confirmation.md`)

### Enables
- PAY-05 Weekly payout batch (`007-payments-payouts/stories/005-weekly-payout-batch.md`)
- PAY-07 Provider earnings (`007-payments-payouts/stories/007-provider-earnings.md`)
- BKG-15 Mark complete and confirm completion (`008-booking-stay/stories/015-mark-complete-and-confirm-completion.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Tier changes after confirmation | Rate on the booking does not change |

## Out of Scope

- Gateway fees (TD-16)
