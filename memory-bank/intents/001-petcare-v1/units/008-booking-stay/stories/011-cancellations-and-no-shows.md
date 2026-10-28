---
id: 011-cancellations-and-no-shows
code: BKG-11
unit: 008-booking-stay
intent: 001-petcare-v1
status: ready
priority: should
journeys: none
created: 2026-10-29T16:00:00Z
assigned_bolt: 013-booking-stay
implemented: false
---

# Story BKG-11: Cancellations and no-shows

## User Story

**As a** owner, provider and admin
**I want** clear paths when plans change after confirmation
**So that** nobody is stuck and money is handled by a person

## Acceptance Criteria

- [ ] **Given** a confirmed booking, **When** the owner cancels, **Then** a cancellation request appears in the admin queue (not a report) and no automatic refund happens
- [ ] **Given** a provider cancels after confirmation, **When** it happens, **Then** the admin reassigns or refunds in full
- [ ] **Given** an owner no-show or a missed stay start, **When** flagged, **Then** the admin decides per TD-6
- [ ] **Given** every such transition, **When** it happens, **Then** it is logged

## Traceability

- **Requirements:** DR-11, FR-18; TD-6
- **Journeys:** none

## UI/UX Impact

O6, P3, A1

## API Dependencies (including Dummy APIs)

Bookings API; PAY-06

## Test Expectations

Lifecycle tests (STEP-24)

## Dependencies

### Requires
- BKG-10 Start the stay (`008-booking-stay/stories/010-start-the-stay.md`)
- PAY-06 Freeze, release and refund (`007-payments-payouts/stories/006-freeze-release-and-refund.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Automatic penalty fees
