---
id: 004-close-with-a-post-mortem
code: ACU-04
unit: 010-acute-event-response
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-3
created: '2026-10-29T16:00:00Z'
assigned_bolt: 023-acute-event-response
implemented: true
---

# Story ACU-04: Close with a post-mortem

## User Story

**As a** admin
**I want** to close every event with a short post-mortem
**So that** the runbook improves after each event

## Acceptance Criteria

- [ ] **Given** a resolved event, **When** I close it, **Then** a post-mortem (timeline accuracy, roles, owner communication, directory use, gaps, lessons) is required
- [ ] **Given** 48 h after resolution without a post-mortem, **When** the queue loads, **Then** a reminder shows
- [ ] **Given** the Post-mortems tab, **When** opened, **Then** past post-mortems are listed (admin-only)

## Traceability

- **Requirements:** FR-30, FR-34
- **Journeys:** UJ-3

## UI/UX Impact

A2 Acute event (Post-mortems tab); page spec 4.9

## API Dependencies (including Dummy APIs)

Acute API

## Test Expectations

API test

## Dependencies

### Requires
- ACU-03 Runbook coordination (`010-acute-event-response/stories/003-runbook-coordination.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Runbook versioning
- Pattern detection
