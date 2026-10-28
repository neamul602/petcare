---
id: 002-book-pet-dates-and-care-plan
code: BKG-02
unit: 008-booking-stay
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-1
created: 2026-10-29T16:00:00Z
assigned_bolt: 009-booking-stay
implemented: false
---

# Story BKG-02: Book: pet, dates and care plan

## User Story

**As a** owner
**I want** to choose my pet and dates and confirm the care plan in two short steps
**So that** booking is quick and nothing is missed

## Acceptance Criteria

- [ ] **Given** a provider, **When** I start Book, **Then** step 1 asks for pet and dates; if I have no pet, I can create one inline
- [ ] **Given** dates, **When** any night is full, **Then** I am told before continuing
- [ ] **Given** step 2, **When** it opens, **Then** the care plan is pre-filled from the pet (and last stay) with 'use saved' toggles, services and instructions
- [ ] **Given** a clinical purpose, **When** declared, **Then** I cannot continue (PET-03)
- [ ] **Given** a lost connection, **When** I come back, **Then** my inputs are still there

## Traceability

- **Requirements:** FR-15, FR-8, DR-4, DR-10; page spec 1.6
- **Journeys:** UJ-1

## UI/UX Impact

O5 Book steps 1-2; mockup 04-booking-configuration

## API Dependencies (including Dummy APIs)

Bookings, Pets, Capacity APIs

## Test Expectations

Playwright

## Dependencies

### Requires
- PET-05 Care plan pre-fill (`004-pet-care-profile/stories/005-care-plan-pre-fill.md`)
- SRC-03 Reserve and release nights safely (`006-search-capacity/stories/003-reserve-and-release-nights-safely.md`)

### Enables
- BKG-03 Review and submit with payment (`008-booking-stay/stories/003-review-and-submit-with-payment.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Pet archived | Not offered |

## Out of Scope

- Multiple pets in one booking
