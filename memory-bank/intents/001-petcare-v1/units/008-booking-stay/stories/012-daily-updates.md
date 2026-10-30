---
id: 012-daily-updates
code: BKG-12
unit: 008-booking-stay
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1, UJ-2
created: '2026-10-29T16:00:00Z'
assigned_bolt: 011-booking-stay
implemented: true
---

# Story BKG-12: Daily updates

## User Story

**As a** provider
**I want** to post a daily update with a photo and short note
**So that** the owner feels close to their pet

## Acceptance Criteria

- [ ] **Given** an in-stay booking, **When** I tap Post update, **Then** a sheet takes up to 4 photos, a structured care log (for Tito: insulin given and time, food) and a short note
- [ ] **Given** a lost connection, **When** I post, **Then** the update is queued and sent when back online
- [ ] **Given** a posted update, **When** viewed, **Then** it cannot be edited
- [ ] **Given** no update by 18:00, **When** the reminder runs, **Then** I get one reminder; completion is never blocked

## Traceability

- **Requirements:** FR-43, TD-11, TD-15; UC-12; page specs 3.5, 3.6
- **Journeys:** UJ-1, UJ-2

## UI/UX Impact

P3 Booking (Post update sheet); mockups 35-in-stay-management, 36-daily-update-composer

## API Dependencies (including Dummy APIs)

Bookings API; photo port; ACC-03

## Test Expectations

Playwright incl. offline (STEP-26, STEP-35)

## Dependencies

### Requires
- BKG-10 Start the stay (`008-booking-stay/stories/010-start-the-stay.md`)
- DUM-05 Dummy notification and photo APIs (`002-dummy-integration-services/stories/005-dummy-notification-and-photo-apis.md`)

### Enables
- BKG-18 Owner booking page during the stay (`008-booking-stay/stories/018-owner-booking-page-during-the-stay.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Photo optional | Note-only update allowed |

## Out of Scope

- Video
