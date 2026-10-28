---
id: 001-booking-state-machine
code: BKG-01
unit: 008-booking-stay
intent: 001-petcare-v1
status: ready
priority: must
journeys: all
created: 2026-10-29T16:00:00Z
assigned_bolt: 009-booking-stay
implemented: false
---

# Story BKG-01: Booking state machine

## User Story

**As a** platform
**I want** every booking to follow one documented state machine
**So that** owners, providers and the admin always see the same truth

## Acceptance Criteria

- [ ] **Given** the states requested, authorized, captured, in-stay, completed, declined, canceled, no-show, disputed, resolved, refunded (final set per the Step 24 decision), **When** a transition is requested, **Then** only allowed transitions succeed
- [ ] **Given** any transition, **When** it happens, **Then** it is logged with time and trigger
- [ ] **Given** a state, **When** shown to any role, **Then** the same pill (colour plus text) is used

## Traceability

- **Requirements:** FR-14, NFR-22, DR-11; UC-7; Step 24
- **Journeys:** all

## UI/UX Impact

State pill on O6, P3, A1-A3

## API Dependencies (including Dummy APIs)

Bookings API

## Test Expectations

Lifecycle tests (STEP-24)

## Dependencies

### Requires
- FND-05 Configuration, clock and log primitives (`001-platform-foundation/stories/005-configuration-clock-and-log-primitives.md`)

### Enables
- BKG-03 Review and submit with payment (`008-booking-stay/stories/003-review-and-submit-with-payment.md`)
- BKG-05 Provider Today and Bookings (`008-booking-stay/stories/005-provider-today-and-bookings.md`)
- ADM-01 Urgency queue (`011-admin-operations/stories/001-urgency-queue.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Illegal transition | Rejected with an error |

## Out of Scope

- Counter-offers
