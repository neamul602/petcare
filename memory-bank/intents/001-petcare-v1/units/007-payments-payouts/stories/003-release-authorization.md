---
id: 003-release-authorization
code: PAY-03
unit: 007-payments-payouts
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 008-payments-payouts
implemented: false
---

# Story PAY-03: Release authorization

## User Story

**As a** owner
**I want** my hold released when a request is declined, times out or I cancel before confirmation
**So that** I am never charged for a stay that did not happen

## Acceptance Criteria

- [ ] **Given** a decline, timeout or owner cancellation before confirmation, **When** it happens, **Then** the authorization is released and a payment event logged
- [ ] **Given** a release already done, **When** repeated, **Then** nothing changes

## Traceability

- **Requirements:** FR-39, FR-15, FR-17
- **Journeys:** UJ-1

## UI/UX Impact

O6 Booking

## API Dependencies (including Dummy APIs)

payment port

## Test Expectations

Integration tests

## Dependencies

### Requires
- PAY-01 Authorize payment at request (`007-payments-payouts/stories/001-authorize-payment-at-request.md`)

### Enables
- BKG-08 Decline with a reason (`008-booking-stay/stories/008-decline-with-a-reason.md`)
- BKG-09 Confirmation-window timeout (`008-booking-stay/stories/009-confirmation-window-timeout.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Gateway down at release | Retried until done; admin sees pending release |

## Out of Scope

- Nothing beyond the unit's out-of-scope list
