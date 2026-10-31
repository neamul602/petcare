---
id: 001-urgency-queue
code: ADM-01
unit: 011-admin-operations
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-3
created: '2026-10-29T16:00:00Z'
assigned_bolt: 024-admin-operations
implemented: true
---

# Story ADM-01: Urgency queue

## User Story

**As a** admin
**I want** one queue sorted by urgency
**So that** I handle the most important thing first

## Acceptance Criteria

- [ ] **Given** open items, **When** I open the Queue, **Then** acute events come first, then reports, then bookings awaiting provider confirmation, then in-stay bookings
- [ ] **Given** applications to vet and reviews to moderate, **When** open, **Then** they show as separate counts linking to their lists
- [ ] **Given** any row, **When** tapped, **Then** the detail opens in one tap
- [ ] **Given** a throttled low-end profile, **When** the queue loads, **Then** it is interactive in under 2 s
- [ ] **Given** provider quality flags, **When** present, **Then** they show on the row

## Traceability

- **Requirements:** FR-32, NFR-4; UC-2; page spec 4.1
- **Journeys:** UJ-3

## UI/UX Impact

A1 Queue; mockup 06-admin-queue (layout only)

## API Dependencies (including Dummy APIs)

Queue API (reads from all units)

## Test Expectations

Ordering test; performance test (STEP-30)

## Dependencies

### Requires
- BKG-01 Booking state machine (`008-booking-stay/stories/001-booking-state-machine.md`)
- ACC-02 Admin sign-in and role guards (`003-accounts-notifications/stories/002-admin-sign-in-and-role-guards.md`)

### Enables
- ADM-03 Operating ceiling (`011-admin-operations/stories/003-operating-ceiling.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty queue | Calm empty state |

## Out of Scope

- Custom layouts
