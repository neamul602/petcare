---
id: 007-training-scenario-seed
code: FND-07
unit: 001-platform-foundation
intent: 001-petcare-v1
status: ready
priority: must
journeys: all
created: 2026-10-29T16:00:00Z
assigned_bolt: 003-platform-foundation
implemented: false
---

# Story FND-07: Training scenario seed

## User Story

**As a** trainer and tester
**I want** one command that resets the database and Dummy services to the labelled training scenario
**So that** every demo and test starts from the same honest data

## Acceptance Criteria

- [ ] **Given** the seed command, **When** it runs, **Then** neighbourhoods Gulshan, Banani, Baridhara and their vet clinics exist
- [ ] **Given** the seed, **When** it completes, **Then** owner Bibi (Banani) with pet Tito (dog, Shih Tzu, 4 years, 6 kg, diabetic, insulin twice daily, low-carb kibble only), provider Rashid (Gulshan, Tier-A, 2 small pets per night, BDT 2,500), admin Ayaat, three or four more approved providers across both tiers and one pending Tier-B application exist
- [ ] **Given** the seed data, **When** any screen shows it, **Then** no review, rating, booking count or testimonial exists unless produced by a completed training booking
- [ ] **Given** the seed files, **When** read, **Then** each record is labelled as training data

## Traceability

- **Requirements:** TR-7, TR-8, DR-15; workbook Step 17
- **Journeys:** all

## UI/UX Impact

All screens (data)

## API Dependencies (including Dummy APIs)

Database; Dummy reset endpoints

## Test Expectations

Seed integration test; STEP-17 evidence export

## Dependencies

### Requires
- FND-05 Configuration, clock and log primitives (`001-platform-foundation/stories/005-configuration-clock-and-log-primitives.md`)

### Enables
- BKG-14 Vet-clinic directory (`008-booking-stay/stories/014-vet-clinic-directory.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Seed run twice | Same end state (idempotent) |

## Out of Scope

- Production data
