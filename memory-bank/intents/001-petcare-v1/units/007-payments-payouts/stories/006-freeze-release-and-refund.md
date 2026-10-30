---
id: 006-freeze-release-and-refund
code: PAY-06
unit: 007-payments-payouts
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-3
created: '2026-10-29T16:00:00Z'
assigned_bolt: 012-payments-payouts
implemented: true
---

# Story PAY-06: Freeze, release and refund

## User Story

**As a** admin
**I want** to freeze payouts on a report or acute event and refund owners when resolved
**So that** disputes are fair to both sides

## Acceptance Criteria

- [ ] **Given** a report or acute event, **When** raised, **Then** the booking's payout is frozen and excluded from batches
- [ ] **Given** a resolution, **When** no action, **Then** the freeze is released
- [ ] **Given** a refund decision, **When** I enter an amount up to the captured amount with a rationale, **Then** the refund goes to the original method and the remaining payout is released net
- [ ] **Given** every freeze, release and refund, **When** it happens, **Then** a payment event is logged

## Traceability

- **Requirements:** FR-24, FR-29, FR-42, NFR-23; TD-4
- **Journeys:** UJ-3

## UI/UX Impact

A3 Report; A6 Payouts

## API Dependencies (including Dummy APIs)

payment and payout ports

## Test Expectations

Integration tests (STEP-29)

## Dependencies

### Requires
- PAY-05 Weekly payout batch (`007-payments-payouts/stories/005-weekly-payout-batch.md`)
- PAY-02 Capture on confirmation (`007-payments-payouts/stories/002-capture-on-confirmation.md`)

### Enables
- BKG-11 Cancellations and no-shows (`008-booking-stay/stories/011-cancellations-and-no-shows.md`)
- REV-05 Report a problem (`009-reviews-disputes/stories/005-report-a-problem.md`)
- ACU-02 Acute-event effects and owner notice (`010-acute-event-response/stories/002-acute-event-effects-and-owner-notice.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Refund equals captured | No payout remains |

## Out of Scope

- Owner-initiated refunds outside the window
