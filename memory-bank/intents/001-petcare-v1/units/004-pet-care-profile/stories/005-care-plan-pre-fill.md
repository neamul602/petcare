---
id: 005-care-plan-pre-fill
code: PET-05
unit: 004-pet-care-profile
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-4
created: '2026-10-29T16:00:00Z'
assigned_bolt: 005-pet-care-profile
implemented: true
---

# Story PET-05: Care plan pre-fill

## User Story

**As a** returning owner
**I want** my next booking to start from the last successful care plan
**So that** I never re-type my pet's needs

## Acceptance Criteria

- [ ] **Given** a pet with a completed stay, **When** a new booking starts, **Then** food, diet, medication, allergy, anxiety and special-attention fields are pre-filled and marked 'from Tito's last stay'
- [ ] **Given** a pre-filled field, **When** I edit, clear or accept it, **Then** my choice is used for this booking only
- [ ] **Given** two pets, **When** booking for one, **Then** nothing from the other is used

## Traceability

- **Requirements:** FR-8, UJ-4
- **Journeys:** UJ-4

## UI/UX Impact

O5 Book; page spec 2.2; mockup 22-book-again-path

## API Dependencies (including Dummy APIs)

Pets API (pre-fill)

## Test Expectations

API tests; used by BKG-16

## Dependencies

### Requires
- PET-04 Pet page and care history (`004-pet-care-profile/stories/004-pet-page-and-care-history.md`)

### Enables
- BKG-02 Book: pet, dates and care plan (`008-booking-stay/stories/002-book-pet-dates-and-care-plan.md`)
- BKG-16 Book again (`008-booking-stay/stories/016-book-again.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Last stay was declined | Use the last completed stay's plan |

## Out of Scope

- Suggested values
