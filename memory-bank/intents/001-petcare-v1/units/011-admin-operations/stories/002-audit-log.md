---
id: 002-audit-log
code: ADM-02
unit: 011-admin-operations
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-3
created: 2026-10-29T16:00:00Z
assigned_bolt: 024-admin-operations
implemented: false
---

# Story ADM-02: Audit log

## User Story

**As a** admin
**I want** every admin action recorded and viewable, never editable
**So that** decisions are accountable

## Acceptance Criteria

- [ ] **Given** admin actions across all units, **When** they happen, **Then** each appears in the audit log with admin, time, action, reason code and target
- [ ] **Given** an entry, **When** anyone tries to edit or delete it, **Then** it is refused at API and database level
- [ ] **Given** A8, **When** opened, **Then** entries are listed newest first with filters by action and target

## Traceability

- **Requirements:** FR-37, NFR-21
- **Journeys:** UJ-3

## UI/UX Impact

A8 Audit log

## API Dependencies (including Dummy APIs)

Audit API; FND-05 log helper

## Test Expectations

Immutability test (STEP-30)

## Dependencies

### Requires
- FND-05 Configuration, clock and log primitives (`001-platform-foundation/stories/005-configuration-clock-and-log-primitives.md`)
- ACC-02 Admin sign-in and role guards (`003-accounts-notifications/stories/002-admin-sign-in-and-role-guards.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Export
