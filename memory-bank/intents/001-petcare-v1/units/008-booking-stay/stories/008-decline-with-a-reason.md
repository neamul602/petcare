---
id: 008-decline-with-a-reason
code: BKG-08
unit: 008-booking-stay
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-2
created: '2026-10-29T16:00:00Z'
assigned_bolt: 010-booking-stay
implemented: true
---

# Story BKG-08: Decline with a reason

## User Story

**As a** provider
**I want** to decline with one reason from a short list
**So that** the owner understands and PetCare learns what fits

## Acceptance Criteria

- [ ] **Given** Decline, **When** tapped, **Then** a sheet offers exactly the six reasons (TD-9) and requires one
- [ ] **Given** a reason, **When** confirmed, **Then** the authorization and nights are released, the reason is recorded on the booking and the pet's care history, and the owner is notified
- [ ] **Given** the sheet, **When** shown, **Then** there is no free-text field (FR-17, UC-12)

## Traceability

- **Requirements:** FR-17, TD-9; UC-12; page spec 3.4
- **Journeys:** UJ-2

## UI/UX Impact

P3 Booking (decline sheet)

## API Dependencies (including Dummy APIs)

Bookings API; PAY-03

## Test Expectations

API and Playwright (STEP-25)

## Dependencies

### Requires
- BKG-06 Provider request view (`008-booking-stay/stories/006-provider-request-view.md`)
- PAY-03 Release authorization (`007-payments-payouts/stories/003-release-authorization.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Free-text rationale
