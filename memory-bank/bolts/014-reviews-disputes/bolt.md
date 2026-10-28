---
id: 014-reviews-disputes
unit: 009-reviews-disputes
intent: 001-petcare-v1
type: ddd-construction-bolt
status: planned
phase: UJ-1 complete
stories:
  - 001-leave-a-verified-review
  - 002-public-reviews-and-aggregates
  - 005-report-a-problem
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [002-dummy-integration-services, 006-provider-supply-vetting, 012-payments-payouts, 013-booking-stay]
enables_bolts: [022-reviews-disputes]
requires_units: [booking-stay, dummy-integration-services, payments-payouts, provider-supply-vetting]
blocks: true

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 3
---

# Bolt: 014-reviews-disputes

## Overview

Plan phase **UJ-1 complete**, bolt 14 of 25. Journeys served: UJ-1.

## Objective

Verified review with photos, public reviews and aggregates, and report a problem with payout freeze.

## Stories Included

- **001-leave-a-verified-review** (REV-01): Leave a verified review (Must) · [story](../../intents/001-petcare-v1/units/009-reviews-disputes/stories/001-leave-a-verified-review.md)
- **002-public-reviews-and-aggregates** (REV-02): Public reviews and aggregates (Must) · [story](../../intents/001-petcare-v1/units/009-reviews-disputes/stories/002-public-reviews-and-aggregates.md)
- **005-report-a-problem** (REV-05): Report a problem (Must) · [story](../../intents/001-petcare-v1/units/009-reviews-disputes/stories/005-report-a-problem.md)

## Expected Outcome

Bibi's verified review with photos appears on Rashid's page; a report inside 72 h freezes the payout; late or second reports and reviews are refused.

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
- 002-dummy-integration-services
- 006-provider-supply-vetting
- 012-payments-payouts
- 013-booking-stay

### Enables
- 022-reviews-disputes

## Test Expectations

API rule tests; Playwright review and report.

Workbook evidence produced: Steps 27, 29, 35.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
