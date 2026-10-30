---
id: 006-provider-request-view
code: BKG-06
unit: 008-booking-stay
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1, UJ-2, UJ-4
created: '2026-10-29T16:00:00Z'
assigned_bolt: 010-booking-stay
implemented: true
---

# Story BKG-06: Provider request view

## User Story

**As a** provider
**I want** to see the full request with the pet's care history before deciding
**So that** I accept only what I can handle

## Acceptance Criteria

- [ ] **Given** a request, **When** I open it, **Then** I see dates, nights, price, the pet profile snapshot, care plan and the care summary (PET-06)
- [ ] **Given** a repeat owner or pet, **When** shown, **Then** prior stays with me are highlighted
- [ ] **Given** the deadline, **When** shown, **Then** the remaining time is visible
- [ ] **Given** Confirm and Decline, **When** shown, **Then** Confirm is the primary action

## Traceability

- **Requirements:** FR-9, FR-49, FR-16; page spec 3.3
- **Journeys:** UJ-1, UJ-2, UJ-4

## UI/UX Impact

P3 Booking (request state)

## API Dependencies (including Dummy APIs)

Bookings API; PET-06

## Test Expectations

Playwright

## Dependencies

### Requires
- BKG-05 Provider Today and Bookings (`008-booking-stay/stories/005-provider-today-and-bookings.md`)
- PET-06 Provider care summary (`004-pet-care-profile/stories/006-provider-care-summary.md`)

### Enables
- BKG-07 Confirm a request (`008-booking-stay/stories/007-confirm-a-request.md`)
- BKG-08 Decline with a reason (`008-booking-stay/stories/008-decline-with-a-reason.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Request expired while open | Actions disabled, state shown |

## Out of Scope

- Nothing beyond the unit's out-of-scope list
