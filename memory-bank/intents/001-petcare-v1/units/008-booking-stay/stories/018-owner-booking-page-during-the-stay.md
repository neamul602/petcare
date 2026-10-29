---
id: 018-owner-booking-page-during-the-stay
code: BKG-18
unit: 008-booking-stay
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 011-booking-stay
implemented: false
---

# Story BKG-18: Owner booking page during the stay

## User Story

**As a** owner
**I want** one booking page that shows the stay as it happens
**So that** I see updates, chat and help in one place

## Acceptance Criteria

- [ ] **Given** a confirmed booking, **When** I open it, **Then** it shows confirmed with dates and the provider
- [ ] **Given** in-stay, **When** open, **Then** updates (newest first), chat and vet clinics are on the page
- [ ] **Given** completed, **When** open, **Then** confirm completion, review and report actions are shown
- [ ] **Given** an acute event, **When** open, **Then** a calm coral banner explains what happened and what PetCare is doing

## Traceability

- **Requirements:** FR-43, FR-44, FR-45; page spec 5.1
- **Journeys:** UJ-1

## UI/UX Impact

O6 Booking; page spec 5.1 (spec-only)

## API Dependencies (including Dummy APIs)

Bookings API

## Test Expectations

Playwright (STEP-26)

## Dependencies

### Requires
- BKG-12 Daily updates (`008-booking-stay/stories/012-daily-updates.md`)
- BKG-14 Vet-clinic directory (`008-booking-stay/stories/014-vet-clinic-directory.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Nothing beyond the unit's out-of-scope list
