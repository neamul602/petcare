---
id: 007-confirm-a-request
code: BKG-07
unit: 008-booking-stay
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1, UJ-2
created: 2026-10-29T16:00:00Z
assigned_bolt: 010-booking-stay
implemented: false
---

# Story BKG-07: Confirm a request

## User Story

**As a** provider
**I want** to confirm a request in one tap
**So that** the owner knows their pet is booked

## Acceptance Criteria

- [ ] **Given** a request, **When** I confirm, **Then** payment is captured (PAY-02), the booking is captured and the owner is notified
- [ ] **Given** UJ-2, **When** Rashid confirms from Today, **Then** it takes 2 taps
- [ ] **Given** capture fails, **When** I confirm, **Then** the booking stays waiting and I see a retry

## Traceability

- **Requirements:** FR-16, FR-39; page spec 3.4
- **Journeys:** UJ-1, UJ-2

## UI/UX Impact

P3 Booking

## API Dependencies (including Dummy APIs)

Bookings API; PAY-02; ACC-03

## Test Expectations

Integration and Playwright (STEP-25)

## Dependencies

### Requires
- BKG-06 Provider request view (`008-booking-stay/stories/006-provider-request-view.md`)
- PAY-02 Capture on confirmation (`007-payments-payouts/stories/002-capture-on-confirmation.md`)
- ACC-03 Notification port and delivery (`003-accounts-notifications/stories/003-notification-port-and-delivery.md`)

### Enables
- BKG-10 Start the stay (`008-booking-stay/stories/010-start-the-stay.md`)
- BKG-13 Booking chat (`008-booking-stay/stories/013-booking-chat.md`)
- BKG-14 Vet-clinic directory (`008-booking-stay/stories/014-vet-clinic-directory.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Confirm twice | One capture |

## Out of Scope

- Counter-offer
