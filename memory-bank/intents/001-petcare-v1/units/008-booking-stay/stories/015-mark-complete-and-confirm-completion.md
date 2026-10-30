---
id: 015-mark-complete-and-confirm-completion
code: BKG-15
unit: 008-booking-stay
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1
created: '2026-10-29T16:00:00Z'
assigned_bolt: 013-booking-stay
implemented: true
---

# Story BKG-15: Mark complete and confirm completion

## User Story

**As a** provider and owner
**I want** the provider marks the stay complete and the owner confirms
**So that** the review opens and the payout is queued

## Acceptance Criteria

- [ ] **Given** an in-stay booking at its end, **When** the provider taps Mark complete, **Then** the owner is asked to confirm completion
- [ ] **Given** the owner confirms, **When** done, **Then** the booking is completed, the review opens and the payout is queued (PAY-04)
- [ ] **Given** missed daily updates, **When** marking complete, **Then** it is still allowed
- [ ] **Given** an acute event on the booking, **When** marking complete, **Then** it is still allowed (UC-8)

## Traceability

- **Requirements:** FR-19; UC-1, UC-8; page spec 3.7
- **Journeys:** UJ-1

## UI/UX Impact

P3 Booking; O6 Booking (completed)

## API Dependencies (including Dummy APIs)

Bookings API; PAY-04

## Test Expectations

Playwright (STEP-27)

## Dependencies

### Requires
- BKG-10 Start the stay (`008-booking-stay/stories/010-start-the-stay.md`)
- PAY-04 Commission and payout queue (`007-payments-payouts/stories/004-commission-and-payout-queue.md`)

### Enables
- REV-01 Leave a verified review (`009-reviews-disputes/stories/001-leave-a-verified-review.md`)
- REV-05 Report a problem (`009-reviews-disputes/stories/005-report-a-problem.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Owner never confirms completion | Open question Q-S1: proposed that the admin can complete it after the end date |

## Out of Scope

- Partial stays
