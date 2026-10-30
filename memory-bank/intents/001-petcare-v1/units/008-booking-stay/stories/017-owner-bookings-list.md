---
id: 017-owner-bookings-list
code: BKG-17
unit: 008-booking-stay
intent: 001-petcare-v1
status: complete
priority: should
journeys: UJ-4
created: '2026-10-29T16:00:00Z'
assigned_bolt: 017-booking-stay
implemented: true
---

# Story BKG-17: Owner bookings list

## User Story

**As a** owner
**I want** to see my upcoming and past bookings
**So that** I can find any booking quickly

## Acceptance Criteria

- [ ] **Given** /bookings, **When** opened, **Then** upcoming and past bookings are listed with state pills
- [ ] **Given** a past completed stay, **When** shown, **Then** Book again is available

## Traceability

- **Requirements:** FR-48
- **Journeys:** UJ-4

## UI/UX Impact

O7 Bookings

## API Dependencies (including Dummy APIs)

Bookings API

## Test Expectations

Playwright

## Dependencies

### Requires
- BKG-04 Owner booking page: waiting (`008-booking-stay/stories/004-owner-booking-page-waiting.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Nothing beyond the unit's out-of-scope list
