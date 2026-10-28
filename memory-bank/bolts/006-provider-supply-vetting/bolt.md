---
id: 006-provider-supply-vetting
unit: 005-provider-supply-vetting
intent: 001-petcare-v1
type: simple-construction-bolt
status: planned
phase: Thin slice
stories:
  - 001-provider-records-tiers-and-status
  - 004-public-provider-page
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [004-accounts-notifications]
enables_bolts: [007-search-capacity, 014-reviews-disputes, 021-provider-supply-vetting, 025-admin-operations]
requires_units: [accounts-notifications]
blocks: true

complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 006-provider-supply-vetting

## Overview

Plan phase **Thin slice**, bolt 6 of 25. Journeys served: UJ-1, UJ-2, UJ-3.

## Objective

Provider records with tier and status, and the public provider page with the Tier-A badge.

## Stories Included

- **001-provider-records-tiers-and-status** (SUP-01): Provider records, tiers and status (Must) · [story](../../intents/001-petcare-v1/units/005-provider-supply-vetting/stories/001-provider-records-tiers-and-status.md)
- **004-public-provider-page** (SUP-04): Public provider page (Must) · [story](../../intents/001-petcare-v1/units/005-provider-supply-vetting/stories/004-public-provider-page.md)

## Expected Outcome

Only approved providers are visible; Rashid's public page shows his offer and badge; no verification artifact leaks.

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → source code
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 004-accounts-notifications

### Enables
- 007-search-capacity
- 014-reviews-disputes
- 021-provider-supply-vetting
- 025-admin-operations

## Test Expectations

State and privacy API tests; Playwright provider page.

Workbook evidence produced: Step 21.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
