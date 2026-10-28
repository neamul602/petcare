---
id: 001-create-and-edit-a-pet-profile
code: PET-01
unit: 004-pet-care-profile
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 005-pet-care-profile
implemented: false
---

# Story PET-01: Create and edit a pet profile

## User Story

**As a** owner
**I want** to create a profile for my dog or cat with the right fields
**So that** providers know exactly who they are caring for

## Acceptance Criteria

- [ ] **Given** /pets/:id/edit, **When** I choose dog, **Then** walking/exercise and outdoor-access fields appear; When I choose cat, Then litter box, indoor/outdoor and single/multi-cat fields appear
- [ ] **Given** required fields (species, breed, age, weight, sex, vaccination status), **When** missing, **Then** the form shows inline errors and does not save
- [ ] **Given** photos, **When** I add up to 5 images of up to 5 MB, **Then** they upload through the photo port with progress and retry
- [ ] **Given** a species other than dog or cat, **When** offered, **Then** it is not possible to choose

## Traceability

- **Requirements:** FR-6, DR-21; page spec 1.5
- **Journeys:** UJ-1

## UI/UX Impact

O8 Pets (edit); mockup 15-pet-profile-management

## API Dependencies (including Dummy APIs)

Pets API; photo port -> Dummy Photo Storage

## Test Expectations

API validation tests; Playwright

## Dependencies

### Requires
- ACC-01 Sign in with phone OTP (`003-accounts-notifications/stories/001-sign-in-with-phone-otp.md`)
- DUM-05 Dummy notification and photo APIs (`002-dummy-integration-services/stories/005-dummy-notification-and-photo-apis.md`)

### Enables
- PET-02 Structured care plan (`004-pet-care-profile/stories/002-structured-care-plan.md`)
- PET-04 Pet page and care history (`004-pet-care-profile/stories/004-pet-page-and-care-history.md`)
- SRC-04 Curated shortlist (`006-search-capacity/stories/004-curated-shortlist.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Photo upload fails | Queued and retried; profile can still be saved |

## Out of Scope

- Import from vet systems
