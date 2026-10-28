---
id: 005-provider-today-and-bookings
code: BKG-05
unit: 008-booking-stay
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-2
created: 2026-10-29T16:00:00Z
assigned_bolt: 010-booking-stay
implemented: false
---

# Story BKG-05: Provider Today and Bookings

## User Story

**As a** provider
**I want** to see what needs me today and all my bookings
**So that** I never miss a request or a stay

## Acceptance Criteria

- [ ] **Given** P1 Today, **When** opened, **Then** requests waiting for my decision (with deadlines), stays in progress and update reminders are shown
- [ ] **Given** P4 Bookings, **When** opened, **Then** requests, upcoming, in stay and past are listed
- [ ] **Given** nothing to do, **When** opened, **Then** a calm empty state shows

## Traceability

- **Requirements:** FR-16, FR-43; page spec 3.1; UC-18
- **Journeys:** UJ-2

## UI/UX Impact

P1 Today, P4 Bookings

## API Dependencies (including Dummy APIs)

Bookings API

## Test Expectations

Playwright

## Dependencies

### Requires
- BKG-01 Booking state machine (`008-booking-stay/stories/001-booking-state-machine.md`)
- ACC-01 Sign in with phone OTP (`003-accounts-notifications/stories/001-sign-in-with-phone-otp.md`)

### Enables
- BKG-06 Provider request view (`008-booking-stay/stories/006-provider-request-view.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Earnings summary (P5)
