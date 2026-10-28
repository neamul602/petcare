---
id: 002-peak-window-capacity
code: SRC-02
unit: 006-search-capacity
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-2
created: 2026-10-29T16:00:00Z
assigned_bolt: 019-search-capacity
implemented: false
---

# Story SRC-02: Peak-window capacity

## User Story

**As a** Tier-A provider
**I want** to raise capacity for Eid in one action
**So that** I can take more bookings in peak weeks

## Acceptance Criteria

- [ ] **Given** a peak window (for example Eid), **When** I open the calendar, **Then** a peak prompt shows; for Tier-A it explains the peak commission (TD-8)
- [ ] **Given** Expand for peak, **When** I set 4 for the window, **Then** all its nights become 4 and nights that were full are available again
- [ ] **Given** peak nights, **When** shown, **Then** they are marked as peak

## Traceability

- **Requirements:** FR-12, TD-8, UJ-2
- **Journeys:** UJ-2

## UI/UX Impact

P2 Calendar

## API Dependencies (including Dummy APIs)

Capacity API; peak windows

## Test Expectations

Capacity tests (raise to 4)

## Dependencies

### Requires
- SRC-01 Capacity per night (`006-search-capacity/stories/001-capacity-per-night.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Peak overlaps confirmed bookings | Raising always allowed |

## Out of Scope

- Surge pricing
