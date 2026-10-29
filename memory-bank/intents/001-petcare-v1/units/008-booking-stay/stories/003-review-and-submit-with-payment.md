---
id: 003-review-and-submit-with-payment
code: BKG-03
unit: 008-booking-stay
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1, UJ-4
created: '2026-10-29T16:00:00Z'
assigned_bolt: 009-booking-stay
implemented: true
---

# Story BKG-03: Review and submit with payment

## User Story

**As a** owner
**I want** to see the price breakdown and submit with an authorization
**So that** I know what I will pay and that I am not charged until the provider confirms

## Acceptance Criteria

- [ ] **Given** step 3, **When** it opens, **Then** I see nights x price, services and total, the cancellation rule (TD-6) and 'you are only charged when the provider confirms'
- [ ] **Given** Submit, **When** the authorization succeeds, **Then** nights are reserved, a booking is created (requested to authorized) and I land on the booking page
- [ ] **Given** I am offline, **When** I press Submit, **Then** it is held and sent once when back online
- [ ] **Given** a double tap, **When** submitted, **Then** one booking is created

## Traceability

- **Requirements:** FR-15, FR-39, DR-10, DR-9; page spec 1.7
- **Journeys:** UJ-1, UJ-4

## UI/UX Impact

O5 Book step 3; mockup 17-booking-submission-payment

## API Dependencies (including Dummy APIs)

Bookings API; PAY-01; SRC-03

## Test Expectations

Playwright (STEP-23)

## Dependencies

### Requires
- BKG-02 Book: pet, dates and care plan (`008-booking-stay/stories/002-book-pet-dates-and-care-plan.md`)
- PAY-01 Authorize payment at request (`007-payments-payouts/stories/001-authorize-payment-at-request.md`)
- BKG-01 Booking state machine (`008-booking-stay/stories/001-booking-state-machine.md`)

### Enables
- BKG-04 Owner booking page: waiting (`008-booking-stay/stories/004-owner-booking-page-waiting.md`)
- BKG-16 Book again (`008-booking-stay/stories/016-book-again.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Night becomes full during review | Blocked at submission with explanation |

## Out of Scope

- Promo codes
