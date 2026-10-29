---
id: 004-pet-page-and-care-history
code: PET-04
unit: 004-pet-care-profile
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-4
created: '2026-10-29T16:00:00Z'
assigned_bolt: 005-pet-care-profile
implemented: true
---

# Story PET-04: Pet page and care history

## User Story

**As a** owner
**I want** to see my pet's profile and every past stay in one place
**So that** I have a lasting record of my pet's care

## Acceptance Criteria

- [ ] **Given** a pet with no stays, **When** I open the Care history tab, **Then** it says this will be the first stay, with no invented content
- [ ] **Given** completed or declined bookings, **When** I open the tab, **Then** entries are listed newest first with provider, dates, care plan snapshot, outcome, decline reason or review link
- [ ] **Given** another owner's pet, **When** I request its history, **Then** access is refused

## Traceability

- **Requirements:** FR-7, NFR-10; page spec 2.1
- **Journeys:** UJ-4

## UI/UX Impact

O8 Pets (Profile and Care history tabs); mockup 21-care-history-view

## API Dependencies (including Dummy APIs)

Pets API

## Test Expectations

API authorization tests; Playwright

## Dependencies

### Requires
- PET-01 Create and edit a pet profile (`004-pet-care-profile/stories/001-create-and-edit-a-pet-profile.md`)

### Enables
- PET-05 Care plan pre-fill (`004-pet-care-profile/stories/005-care-plan-pre-fill.md`)
- PET-06 Provider care summary (`004-pet-care-profile/stories/006-provider-care-summary.md`)
- PET-07 Archive and retention (`004-pet-care-profile/stories/007-archive-and-retention.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Many entries | Dense list, paged |

## Out of Scope

- Export of history
