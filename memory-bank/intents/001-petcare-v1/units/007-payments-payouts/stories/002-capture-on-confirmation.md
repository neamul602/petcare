---
id: 002-capture-on-confirmation
code: PAY-02
unit: 007-payments-payouts
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1
created: '2026-10-29T16:00:00Z'
assigned_bolt: 008-payments-payouts
implemented: true
---

# Story PAY-02: Capture on confirmation

## User Story

**As a** provider
**I want** payment to be captured when I confirm
**So that** I know the booking is paid

## Acceptance Criteria

- [ ] **Given** an authorized booking, **When** the provider confirms, **Then** the amount is captured once using an idempotency key
- [ ] **Given** a capture retried after a lost answer, **When** processed, **Then** it captures once, never twice
- [ ] **Given** capture, **When** done, **Then** the record holds booking, owner, provider, pet, nights, price, amount, method, gateway reference, state transition and time

## Traceability

- **Requirements:** FR-39, DR-13, NFR-23
- **Journeys:** UJ-1

## UI/UX Impact

P3 Booking (confirm)

## API Dependencies (including Dummy APIs)

payment port

## Test Expectations

Double-capture test (STEP-25)

## Dependencies

### Requires
- PAY-01 Authorize payment at request (`007-payments-payouts/stories/001-authorize-payment-at-request.md`)

### Enables
- PAY-04 Commission and payout queue (`007-payments-payouts/stories/004-commission-and-payout-queue.md`)
- PAY-06 Freeze, release and refund (`007-payments-payouts/stories/006-freeze-release-and-refund.md`)
- BKG-07 Confirm a request (`008-booking-stay/stories/007-confirm-a-request.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Capture fails | Booking stays awaiting confirmation; provider sees retry |

## Out of Scope

- Nothing beyond the unit's out-of-scope list
