---
id: 007-archive-and-retention
code: PET-07
unit: 004-pet-care-profile
intent: 001-petcare-v1
status: complete
priority: should
journeys: none
created: '2026-10-29T16:00:00Z'
assigned_bolt: 018-pet-care-profile
implemented: true
---

# Story PET-07: Archive and retention

## User Story

**As a** owner and admin
**I want** to archive pets while history is kept for at least 24 months
**So that** records stay available for repeat bookings and investigations

## Acceptance Criteria

- [ ] **Given** a pet, **When** I archive it, **Then** it leaves my active list and its bookings and history remain
- [ ] **Given** a closed account, **When** within 24 months of the last booking, **Then** records stay available to the admin and to the owner after re-verification by OTP
- [ ] **Given** records older than the window, **When** deleted by the admin, **Then** the deletion is an audited event

## Traceability

- **Requirements:** FR-6, FR-10, NFR-17
- **Journeys:** none

## UI/UX Impact

O8 Pets

## API Dependencies (including Dummy APIs)

Pets API

## Test Expectations

API tests with the injectable clock

## Dependencies

### Requires
- PET-04 Pet page and care history (`004-pet-care-profile/stories/004-pet-page-and-care-history.md`)
- ACC-02 Admin sign-in and role guards (`003-accounts-notifications/stories/002-admin-sign-in-and-role-guards.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Archived pet in Book again | Not offered |

## Out of Scope

- Legal review of longer retention
