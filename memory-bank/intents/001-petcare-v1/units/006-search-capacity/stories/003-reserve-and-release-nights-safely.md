---
id: 003-reserve-and-release-nights-safely
code: SRC-03
unit: 006-search-capacity
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1
created: '2026-10-29T16:00:00Z'
assigned_bolt: 007-search-capacity
implemented: true
---

# Story SRC-03: Reserve and release nights safely

## User Story

**As a** platform
**I want** to reserve nights for a request atomically
**So that** no provider is ever double-booked

## Acceptance Criteria

- [ ] **Given** an 8-night window with every night at 1 of 2, **When** a request is submitted, **Then** all 8 nights are reserved together
- [ ] **Given** one night full, **When** a request is submitted, **Then** it is blocked at submission and nothing is reserved
- [ ] **Given** two requests for the last slot at the same time, **When** processed, **Then** exactly one succeeds
- [ ] **Given** a decline, timeout or cancellation, **When** it happens, **Then** the nights are released

## Traceability

- **Requirements:** FR-12, DR-7, DR-8
- **Journeys:** UJ-1

## UI/UX Impact

None directly (used by O5)

## API Dependencies (including Dummy APIs)

Capacity API (reserve, release)

## Test Expectations

Concurrency test; capacity tests (STEP-22)

## Dependencies

### Requires
- SRC-01 Capacity per night (`006-search-capacity/stories/001-capacity-per-night.md`)

### Enables
- SRC-04 Curated shortlist (`006-search-capacity/stories/004-curated-shortlist.md`)
- BKG-02 Book: pet, dates and care plan (`008-booking-stay/stories/002-book-pet-dates-and-care-plan.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Release twice | No change the second time |

## Out of Scope

- Nothing beyond the unit's out-of-scope list
