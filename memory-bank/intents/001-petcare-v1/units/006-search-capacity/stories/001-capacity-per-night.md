---
id: 001-capacity-per-night
code: SRC-01
unit: 006-search-capacity
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-2
created: '2026-10-29T16:00:00Z'
assigned_bolt: 007-search-capacity
implemented: true
---

# Story SRC-01: Capacity per night

## User Story

**As a** provider
**I want** to set how many pets I can take each night, per species
**So that** I only get requests I can actually host

## Acceptance Criteria

- [ ] **Given** P2 Calendar, **When** I set capacity for selected nights, **Then** only those nights change
- [ ] **Given** Rashid at 2 small pets, **When** a night has 0 or 1 booked, **Then** it shows available; at 2 booked, Then full
- [ ] **Given** confirmed bookings on a night, **When** I lower capacity below them, **Then** the change is refused with an explanation
- [ ] **Given** a night, **When** I tap it, **Then** a sheet shows its capacity, booked count and note

## Traceability

- **Requirements:** FR-12, DR-7; page spec 3.2
- **Journeys:** UJ-2

## UI/UX Impact

P2 Calendar; mockup 07-provider-calendar

## API Dependencies (including Dummy APIs)

Capacity API

## Test Expectations

Automated capacity tests (STEP-22)

## Dependencies

### Requires
- SUP-01 Provider records, tiers and status (`005-provider-supply-vetting/stories/001-provider-records-tiers-and-status.md`)

### Enables
- SRC-02 Peak-window capacity (`006-search-capacity/stories/002-peak-window-capacity.md`)
- SRC-03 Reserve and release nights safely (`006-search-capacity/stories/003-reserve-and-release-nights-safely.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Week view on mobile | Horizontal scroll with week snapping |

## Out of Scope

- Per-size capacity
