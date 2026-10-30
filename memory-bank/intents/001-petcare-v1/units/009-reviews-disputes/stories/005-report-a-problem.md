---
id: 005-report-a-problem
code: REV-05
unit: 009-reviews-disputes
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1
created: '2026-10-29T16:00:00Z'
assigned_bolt: 014-reviews-disputes
implemented: true
---

# Story REV-05: Report a problem

## User Story

**As a** owner
**I want** to report a problem with a stay within the dispute window
**So that** PetCare looks into it and the payout waits

## Acceptance Criteria

- [ ] **Given** a completed booking within 72 h (or an acute event), **When** I tap Report a problem, **Then** I choose one category (TD-13), describe it and can attach up to 5 photos
- [ ] **Given** submission, **When** done, **Then** the booking becomes disputed, the payout is frozen and the admin queue shows the report
- [ ] **Given** the window has passed, **When** I try, **Then** it is refused with the reason
- [ ] **Given** a second report, **When** submitted, **Then** it is refused
- [ ] **Given** my review, **When** I report, **Then** it is untouched (FR-22)

## Traceability

- **Requirements:** FR-24, FR-22; TD-2, TD-13; page spec 5.3
- **Journeys:** UJ-1

## UI/UX Impact

O6 Booking (report section)

## API Dependencies (including Dummy APIs)

Reports API; PAY-06

## Test Expectations

API tests (STEP-29, STEP-35)

## Dependencies

### Requires
- BKG-15 Mark complete and confirm completion (`008-booking-stay/stories/015-mark-complete-and-confirm-completion.md`)
- PAY-06 Freeze, release and refund (`007-payments-payouts/stories/006-freeze-release-and-refund.md`)

### Enables
- REV-06 Investigate and resolve a report (`009-reviews-disputes/stories/006-investigate-and-resolve-a-report.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Window ends while typing | Server decides; clear message |

## Out of Scope

- Reports on declined requests
