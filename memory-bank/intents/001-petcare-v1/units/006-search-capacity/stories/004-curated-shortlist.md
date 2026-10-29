---
id: 004-curated-shortlist
code: SRC-04
unit: 006-search-capacity
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1
created: '2026-10-29T16:00:00Z'
assigned_bolt: 007-search-capacity
implemented: true
---

# Story SRC-04: Curated shortlist

## User Story

**As a** owner
**I want** to see 3-5 providers who can host my pet for every night, and why they are shown
**So that** I can choose quickly without scrolling a directory

## Acceptance Criteria

- [ ] **Given** neighbourhoods, dates, species and my pet, **When** I search, **Then** 3-5 approved providers are returned, each with capacity for every night
- [ ] **Given** equal other signals, **When** ranked, **Then** Tier-A is above Tier-B; ranking uses only tier, neighbourhood density and capacity
- [ ] **Given** each result, **When** shown, **Then** the reason is visible (tier, area, every night free) and no sponsored marker or distance appears
- [ ] **Given** View all approved, **When** tapped, **Then** all approved providers in the launch neighbourhoods are listed
- [ ] **Given** a provider page opened with chosen dates, **When** shown, **Then** availability for every night of the window is indicated
- [ ] **Given** the search API, **When** measured, **Then** p95 is under 1 s

## Traceability

- **Requirements:** FR-11, DR-6, NFR-3, NFR-24, NFR-26; UC-9, UC-10; page spec 1.3
- **Journeys:** UJ-1

## UI/UX Impact

O3 Results, availability on O4 Provider; mockup 13-curated-shortlist (+component spec)

## API Dependencies (including Dummy APIs)

GET /api/search

## Test Expectations

Ranking tests; latency test; Playwright (STEP-20)

## Dependencies

### Requires
- SRC-03 Reserve and release nights safely (`006-search-capacity/stories/003-reserve-and-release-nights-safely.md`)
- SUP-04 Public provider page (`005-provider-supply-vetting/stories/004-public-provider-page.md`)
- PET-01 Create and edit a pet profile (`004-pet-care-profile/stories/001-create-and-edit-a-pet-profile.md`)

### Enables
- SRC-05 Home and search entry (`006-search-capacity/stories/005-home-and-search-entry.md`)
- SRC-06 Bookings per neighbourhood (`006-search-capacity/stories/006-bookings-per-neighbourhood.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Fewer than 3 match | Show those that match and suggest other dates |
| None match | Empty state with next action |

## Out of Scope

- Fit, distance or rating sort
