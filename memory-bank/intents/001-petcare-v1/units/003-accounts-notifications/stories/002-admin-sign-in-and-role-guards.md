---
id: 002-admin-sign-in-and-role-guards
code: ACC-02
unit: 003-accounts-notifications
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-3
created: 2026-10-29T16:00:00Z
assigned_bolt: 004-accounts-notifications
implemented: false
---

# Story ACC-02: Admin sign-in and role guards

## User Story

**As a** admin
**I want** a separate admin sign-in and role-protected surfaces
**So that** only the operator can reach the console and nobody can cross into another role

## Acceptance Criteria

- [ ] **Given** /admin/sign-in, **When** the admin enters valid training credentials, **Then** the admin console opens
- [ ] **Given** an owner or provider session, **When** it calls an admin or other-role API, **Then** it gets an authorization error
- [ ] **Given** the data model, **When** a second admin record is created, **Then** no schema change is needed (FR-31 extensibility)
- [ ] **Given** any admin action in any unit, **When** performed, **Then** an audit entry (admin, time, action, reason code, target) is written through the append-only log helper

## Traceability

- **Requirements:** FR-31, DR-3, NFR-13, NFR-21
- **Journeys:** UJ-3

## UI/UX Impact

Admin sign-in; all /admin routes

## API Dependencies (including Dummy APIs)

Auth API

## Test Expectations

Authorization matrix tests

## Dependencies

### Requires
- FND-05 Configuration, clock and log primitives (`001-platform-foundation/stories/005-configuration-clock-and-log-primitives.md`)

### Enables
- PET-07 Archive and retention (`004-pet-care-profile/stories/007-archive-and-retention.md`)
- SUP-01 Provider records, tiers and status (`005-provider-supply-vetting/stories/001-provider-records-tiers-and-status.md`)
- REV-03 Moderate reviews for cause (`009-reviews-disputes/stories/003-moderate-reviews-for-cause.md`)
- REV-06 Investigate and resolve a report (`009-reviews-disputes/stories/006-investigate-and-resolve-a-report.md`)
- ACU-03 Runbook coordination (`010-acute-event-response/stories/003-runbook-coordination.md`)
- ADM-01 Urgency queue (`011-admin-operations/stories/001-urgency-queue.md`)
- ADM-02 Audit log (`011-admin-operations/stories/002-audit-log.md`)
- ADM-04 Provider health and utilization (`011-admin-operations/stories/004-provider-health-and-utilization.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Expired session | Redirect to sign-in, return to the page after |

## Out of Scope

- Multi-admin RBAC
