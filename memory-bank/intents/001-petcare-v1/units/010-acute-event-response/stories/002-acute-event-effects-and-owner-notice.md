---
id: 002-acute-event-effects-and-owner-notice
code: ACU-02
unit: 010-acute-event-response
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1, UJ-3
created: '2026-10-29T16:00:00Z'
assigned_bolt: 015-acute-event-response
implemented: true
---

# Story ACU-02: Acute-event effects and owner notice

## User Story

**As a** owner
**I want** to be told quickly and honestly when something happens to my pet
**So that** I trust PetCare in the worst moment

## Acceptance Criteria

- [ ] **Given** a new event, **When** created, **Then** the payout is frozen, the dispute window opens early and the provider is flagged (no auto-suspension)
- [ ] **Given** a new event, **When** created, **Then** the admin queue shows it at the top and the owner gets an in-app banner and a notification (SMS-style fallback via the port)
- [ ] **Given** the times, **When** recorded, **Then** trigger time and owner-notified time are stored and shown; in the demo the gap is under 5 minutes

## Traceability

- **Requirements:** FR-26, FR-29, DR-16; UC-8
- **Journeys:** UJ-1, UJ-3

## UI/UX Impact

O6 Booking (acute banner); A1 Queue

## API Dependencies (including Dummy APIs)

Acute API; PAY-06; ACC-03

## Test Expectations

Integration test; STEP-31 timeline JSON

## Dependencies

### Requires
- ACU-01 Report a concern (`010-acute-event-response/stories/001-report-a-concern.md`)
- PAY-06 Freeze, release and refund (`007-payments-payouts/stories/006-freeze-release-and-refund.md`)

### Enables
- ACU-03 Runbook coordination (`010-acute-event-response/stories/003-runbook-coordination.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Notification service down | Banner still shows; delivery retried |

## Out of Scope

- Nothing beyond the unit's out-of-scope list
