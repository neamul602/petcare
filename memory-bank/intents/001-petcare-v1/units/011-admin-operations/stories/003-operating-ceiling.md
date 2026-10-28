---
id: 003-operating-ceiling
code: ADM-03
unit: 011-admin-operations
intent: 001-petcare-v1
status: ready
priority: should
journeys: UJ-3
created: 2026-10-29T16:00:00Z
assigned_bolt: 024-admin-operations
implemented: false
---

# Story ADM-03: Operating ceiling

## User Story

**As a** admin
**I want** to see my load against 25 providers and 75 completed bookings a month
**So that** I know when to ask for help instead of stretching

## Acceptance Criteria

- [ ] **Given** Insights, **When** opened, **Then** active providers and trailing-30-day completed bookings are shown against 25 and 75
- [ ] **Given** 80 % of either, **When** reached, **Then** a near-ceiling banner shows on Insights and the Queue
- [ ] **Given** a breach, **When** reached, **Then** it is shown as a re-platforming signal, not a goal

## Traceability

- **Requirements:** FR-38; UC-2; page spec 4.5
- **Journeys:** UJ-3

## UI/UX Impact

A7 Insights

## API Dependencies (including Dummy APIs)

Insights API

## Test Expectations

API test

## Dependencies

### Requires
- ADM-01 Urgency queue (`011-admin-operations/stories/001-urgency-queue.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Throttle controls
