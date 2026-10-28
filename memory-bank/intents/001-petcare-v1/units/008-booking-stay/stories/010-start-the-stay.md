---
id: 010-start-the-stay
code: BKG-10
unit: 008-booking-stay
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 011-booking-stay
implemented: false
---

# Story BKG-10: Start the stay

## User Story

**As a** provider
**I want** to start the stay when the pet arrives
**So that** updates and chat open and the owner knows

## Acceptance Criteria

- [ ] **Given** a confirmed booking on its start date, **When** I tap Start stay, **Then** it becomes in-stay
- [ ] **Given** 12:00 on the start date without a start, **When** the scheduler runs, **Then** the admin sees a flag (TD-12)

## Traceability

- **Requirements:** FR-18; TD-12
- **Journeys:** UJ-1

## UI/UX Impact

P3 Booking

## API Dependencies (including Dummy APIs)

Bookings API; scheduler

## Test Expectations

Clock-based test

## Dependencies

### Requires
- BKG-07 Confirm a request (`008-booking-stay/stories/007-confirm-a-request.md`)

### Enables
- BKG-11 Cancellations and no-shows (`008-booking-stay/stories/011-cancellations-and-no-shows.md`)
- BKG-12 Daily updates (`008-booking-stay/stories/012-daily-updates.md`)
- BKG-15 Mark complete and confirm completion (`008-booking-stay/stories/015-mark-complete-and-confirm-completion.md`)
- ACU-01 Report a concern (`010-acute-event-response/stories/001-report-a-concern.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Start before the start date | Not allowed |

## Out of Scope

- Check-in codes
