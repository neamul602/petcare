---
id: 002-structured-care-plan
code: PET-02
unit: 004-pet-care-profile
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 005-pet-care-profile
implemented: false
---

# Story PET-02: Structured care plan

## User Story

**As a** owner of a special-care pet
**I want** to describe medication, allergies, anxiety, diet and extra attention in structured fields
**So that** nothing important is lost in free text

## Acceptance Criteria

- [ ] **Given** the care plan, **When** I add a medication, **Then** I enter name, dose and schedule (times) as separate fields
- [ ] **Given** Tito, **When** I enter diabetic, insulin twice daily and low-carb kibble only, **Then** all of it is stored in structured fields
- [ ] **Given** allergy, anxiety, special diet, senior and extra attention, **When** ticked, **Then** each opens its structured inputs
- [ ] **Given** free-text instructions, **When** added, **Then** they are stored alongside, not instead of, the structured fields

## Traceability

- **Requirements:** DR-4, FR-6
- **Journeys:** UJ-1

## UI/UX Impact

O8 Pets (care plan section); page spec 1.5; mockup 15

## API Dependencies (including Dummy APIs)

Pets API

## Test Expectations

Unit and API tests

## Dependencies

### Requires
- PET-01 Create and edit a pet profile (`004-pet-care-profile/stories/001-create-and-edit-a-pet-profile.md`)

### Enables
- PET-03 Reject clinical requests at intake (`004-pet-care-profile/stories/003-reject-clinical-requests-at-intake.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Two medications | Both stored with their schedules |

## Out of Scope

- Dosage advice
