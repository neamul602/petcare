---
id: 003-runbook-coordination
code: ACU-03
unit: 010-acute-event-response
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-3
created: '2026-10-29T16:00:00Z'
assigned_bolt: 023-acute-event-response
implemented: true
---

# Story ACU-03: Runbook coordination

## User Story

**As a** admin
**I want** a runbook that guides me step by step under pressure
**So that** nothing is forgotten and the owner is kept informed

## Acceptance Criteria

- [ ] **Given** A2, **When** opened, **Then** runbook steps show (confirm trigger, provider role, admin role, vet lookup, owner notification, payout, post-mortem) with done/active/pending states
- [ ] **Given** a step, **When** I mark it done or skip it with a note, **Then** the timeline records it
- [ ] **Given** owner notification, **When** I send the Bangla or English template, **Then** it is sent and the time is recorded
- [ ] **Given** timers, **When** shown, **Then** elapsed time since trigger and time to first admin entry are visible

## Traceability

- **Requirements:** FR-27, FR-34, DR-16; page spec 4.2
- **Journeys:** UJ-3

## UI/UX Impact

A2 Acute event; mockup 42-acute-event-runbook

## API Dependencies (including Dummy APIs)

Acute API; ACC-03

## Test Expectations

Playwright (STEP-31)

## Dependencies

### Requires
- ACU-02 Acute-event effects and owner notice (`010-acute-event-response/stories/002-acute-event-effects-and-owner-notice.md`)
- ACC-02 Admin sign-in and role guards (`003-accounts-notifications/stories/002-admin-sign-in-and-role-guards.md`)

### Enables
- ACU-04 Close with a post-mortem (`010-acute-event-response/stories/004-close-with-a-post-mortem.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Template edited | Saved for future events; audit-logged |

## Out of Scope

- Clinical decisions
