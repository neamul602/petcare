---
id: 009-confirmation-window-timeout
code: BKG-09
unit: 008-booking-stay
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 010-booking-stay
implemented: false
---

# Story BKG-09: Confirmation-window timeout

## User Story

**As a** owner
**I want** my hold released if the provider does not answer in time
**So that** I am not left waiting with money held

## Acceptance Criteria

- [ ] **Given** no provider action, **When** 24 h pass (12 h in a peak window), **Then** the request is closed as timed out, the hold and nights are released and the owner is notified
- [ ] **Given** the timeout, **When** it happens, **Then** the admin sees a timeout signal
- [ ] **Given** the injectable clock, **When** advanced in a test, **Then** the timeout runs

## Traceability

- **Requirements:** DR-12, FR-16, FR-39; TD-1
- **Journeys:** UJ-1

## UI/UX Impact

O6 Booking; A1 Queue

## API Dependencies (including Dummy APIs)

Scheduler; PAY-03; ACC-03

## Test Expectations

Clock-based integration test (STEP-35)

## Dependencies

### Requires
- BKG-04 Owner booking page: waiting (`008-booking-stay/stories/004-owner-booking-page-waiting.md`)
- PAY-03 Release authorization (`007-payments-payouts/stories/003-release-authorization.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Provider confirms at the last second | First action wins; no double outcome |

## Out of Scope

- Routing to another provider
