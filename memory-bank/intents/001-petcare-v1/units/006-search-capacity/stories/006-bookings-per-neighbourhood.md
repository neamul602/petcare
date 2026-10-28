---
id: 006-bookings-per-neighbourhood
code: SRC-06
unit: 006-search-capacity
intent: 001-petcare-v1
status: ready
priority: should
journeys: UJ-3
created: 2026-10-29T16:00:00Z
assigned_bolt: 019-search-capacity
implemented: false
---

# Story SRC-06: Bookings per neighbourhood

## User Story

**As a** admin
**I want** to see bookings per launch neighbourhood per month
**So that** I can judge density before expanding

## Acceptance Criteria

- [ ] **Given** completed bookings, **When** I open Insights, **Then** counts per neighbourhood per month are shown
- [ ] **Given** expansion, **When** considered, **Then** it is an admin decision only; nothing auto-expands

## Traceability

- **Requirements:** FR-13
- **Journeys:** UJ-3

## UI/UX Impact

A7 Insights

## API Dependencies (including Dummy APIs)

Search/Insights API

## Test Expectations

API test

## Dependencies

### Requires
- SRC-04 Curated shortlist (`006-search-capacity/stories/004-curated-shortlist.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Density thresholds (OQ-13)
