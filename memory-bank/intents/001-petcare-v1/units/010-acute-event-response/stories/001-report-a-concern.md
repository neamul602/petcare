---
id: 001-report-a-concern
code: ACU-01
unit: 010-acute-event-response
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 015-acute-event-response
implemented: false
---

# Story ACU-01: Report a concern

## User Story

**As a** provider
**I want** to report an acute event from the booking in seconds
**So that** help starts immediately

## Acceptance Criteria

- [ ] **Given** an in-stay booking, **When** I tap Report a concern, **Then** a sheet asks for type (illness, injury, death), severity (minor, serious, critical) and what I observed
- [ ] **Given** the sheet, **When** it opens, **Then** the vet clinics for the booking's neighbourhood are shown with tap-to-call
- [ ] **Given** a booking not in stay, **When** I look, **Then** the action is not available
- [ ] **Given** submission, **When** done, **Then** the event is created with time and observation and I see what happens next

## Traceability

- **Requirements:** FR-26, FR-28; TD-14; UC-3; page spec 5.7
- **Journeys:** UJ-1

## UI/UX Impact

P3 Booking (Report a concern sheet); mockup 57-acute-event-trigger

## API Dependencies (including Dummy APIs)

Acute API; BKG-14

## Test Expectations

Playwright (STEP-31)

## Dependencies

### Requires
- BKG-10 Start the stay (`008-booking-stay/stories/010-start-the-stay.md`)
- BKG-14 Vet-clinic directory (`008-booking-stay/stories/014-vet-clinic-directory.md`)

### Enables
- ACU-02 Acute-event effects and owner notice (`010-acute-event-response/stories/002-acute-event-effects-and-owner-notice.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Offline | Queued; the sheet shows vet numbers from cache |

## Out of Scope

- Clinical advice
