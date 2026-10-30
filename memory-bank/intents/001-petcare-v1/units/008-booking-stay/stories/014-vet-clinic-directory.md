---
id: 014-vet-clinic-directory
code: BKG-14
unit: 008-booking-stay
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1
created: '2026-10-29T16:00:00Z'
assigned_bolt: 011-booking-stay
implemented: true
---

# Story BKG-14: Vet-clinic directory

## User Story

**As a** owner or provider
**I want** to see vet clinics near the booking with tap-to-call
**So that** help is one tap away if needed

## Acceptance Criteria

- [ ] **Given** an active booking, **When** I open Vet clinics, **Then** clinics for the booking's neighbourhood show name, address, phone, hours and species
- [ ] **Given** a phone number, **When** tapped on mobile, **Then** it calls
- [ ] **Given** the directory, **When** shown, **Then** it says it is a lookup, not a recommendation

## Traceability

- **Requirements:** FR-45
- **Journeys:** UJ-1

## UI/UX Impact

O6, P3 (vet section)

## API Dependencies (including Dummy APIs)

Directory API (seeded)

## Test Expectations

Playwright

## Dependencies

### Requires
- FND-07 Training scenario seed (`001-platform-foundation/stories/007-training-scenario-seed.md`)
- BKG-07 Confirm a request (`008-booking-stay/stories/007-confirm-a-request.md`)

### Enables
- BKG-18 Owner booking page during the stay (`008-booking-stay/stories/018-owner-booking-page-during-the-stay.md`)
- ACU-01 Report a concern (`010-acute-event-response/stories/001-report-a-concern.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Offline | Directory available from cache |

## Out of Scope

- Admin editing screen (seeded in training)
