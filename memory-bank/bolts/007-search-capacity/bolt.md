---
id: 007-search-capacity
unit: 006-search-capacity
intent: 001-petcare-v1
type: ddd-construction-bolt
status: planned
phase: Thin slice
stories:
  - 001-capacity-per-night
  - 003-reserve-and-release-nights-safely
  - 004-curated-shortlist
  - 005-home-and-search-entry
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [005-pet-care-profile, 006-provider-supply-vetting]
enables_bolts: [009-booking-stay, 019-search-capacity]
requires_units: [pet-care-profile, provider-supply-vetting]
blocks: true

complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 3
---

# Bolt: 007-search-capacity

## Overview

Plan phase **Thin slice**, bolt 7 of 25. Journeys served: UJ-1, UJ-2, UJ-4.

## Objective

Date-level capacity with safe reservation, the curated shortlist and the home search entry.

## Stories Included

- **001-capacity-per-night** (SRC-01): Capacity per night (Must) · [story](../../intents/001-petcare-v1/units/006-search-capacity/stories/001-capacity-per-night.md)
- **003-reserve-and-release-nights-safely** (SRC-03): Reserve and release nights safely (Must) · [story](../../intents/001-petcare-v1/units/006-search-capacity/stories/003-reserve-and-release-nights-safely.md)
- **004-curated-shortlist** (SRC-04): Curated shortlist (Must) · [story](../../intents/001-petcare-v1/units/006-search-capacity/stories/004-curated-shortlist.md)
- **005-home-and-search-entry** (SRC-05): Home and search entry (Must) · [story](../../intents/001-petcare-v1/units/006-search-capacity/stories/005-home-and-search-entry.md)

## Expected Outcome

Bibi searches the Eid window and sees 3-5 providers that have every night free; full nights block requests; concurrent last-slot requests yield one winner.

## Bolt Type

**Type**: ddd-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [ ] **1. Domain Model**: Pending → ddd-01-domain-model.md
- [ ] **2. Technical Design**: Pending → ddd-02-technical-design.md
- [ ] **3. ADR Analysis (optional)**: Pending → adr-*.md
- [ ] **4. Implement**: Pending → source code
- [ ] **5. Test**: Pending → ddd-03-test-report.md

## Dependencies

### Requires
- 005-pet-care-profile
- 006-provider-supply-vetting

### Enables
- 009-booking-stay
- 019-search-capacity

## Test Expectations

Capacity boundary tests (all DR-7 cases), concurrency test, ranking tests, search p95 test, Playwright shortlist.

Workbook evidence produced: Steps 20, 22.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
