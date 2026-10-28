---
id: 004-owner-booking-page-waiting
code: BKG-04
unit: 008-booking-stay
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 009-booking-stay
implemented: false
---

# Story BKG-04: Owner booking page: waiting

## User Story

**As a** owner
**I want** to see that my request is waiting and until when
**So that** I know what happens next

## Acceptance Criteria

- [ ] **Given** an authorized request, **When** I open the booking, **Then** I see 'Waiting for Rashid', the deadline from the confirmation window (24 h, 12 h in peak) and the hold amount
- [ ] **Given** Cancel request, **When** I confirm, **Then** the booking is canceled, nights and hold released
- [ ] **Given** the provider decides, **When** I refresh or return, **Then** the page shows the new state

## Traceability

- **Requirements:** FR-15, FR-16, TD-1; page spec 1.8
- **Journeys:** UJ-1

## UI/UX Impact

O6 Booking (waiting); page spec 1.8 (spec-only for this state)

## API Dependencies (including Dummy APIs)

Bookings API; PAY-03

## Test Expectations

Playwright

## Dependencies

### Requires
- BKG-03 Review and submit with payment (`008-booking-stay/stories/003-review-and-submit-with-payment.md`)

### Enables
- BKG-09 Confirmation-window timeout (`008-booking-stay/stories/009-confirmation-window-timeout.md`)
- BKG-17 Owner bookings list (`008-booking-stay/stories/017-owner-bookings-list.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Declined | Shows the reason in plain words and a link back to results |

## Out of Scope

- Nothing beyond the unit's out-of-scope list
