---
id: 022-reviews-disputes
unit: 009-reviews-disputes
intent: 001-petcare-v1
type: ddd-construction-bolt
status: planned
phase: UJ-3
stories:
  - 004-provider-care-record
  - 003-moderate-reviews-for-cause
  - 006-investigate-and-resolve-a-report
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [004-accounts-notifications, 014-reviews-disputes]
enables_bolts: [025-admin-operations]
requires_units: [accounts-notifications]
blocks: true

complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 3
---

# Bolt: 022-reviews-disputes

## Overview

Plan phase **UJ-3**, bolt 22 of 25. Journeys served: UJ-2, UJ-3.

## Objective

Provider care record, review moderation for cause, and report investigation and resolution with refunds.

## Stories Included

- **004-provider-care-record** (REV-04): Provider care record (Should) · [story](../../intents/001-petcare-v1/units/009-reviews-disputes/stories/004-provider-care-record.md)
- **003-moderate-reviews-for-cause** (REV-03): Moderate reviews for cause (Must) · [story](../../intents/001-petcare-v1/units/009-reviews-disputes/stories/003-moderate-reviews-for-cause.md)
- **006-investigate-and-resolve-a-report** (REV-06): Investigate and resolve a report (Must) · [story](../../intents/001-petcare-v1/units/009-reviews-disputes/stories/006-investigate-and-resolve-a-report.md)

## Expected Outcome

Ayaat resolves a report with a partial refund and a rationale; the payout is adjusted; the review stays; moderation is audit-logged.

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
- 004-accounts-notifications
- 014-reviews-disputes

### Enables
- 025-admin-operations

## Test Expectations

Integration test for the dispute flow (STEP-29); Playwright moderation.

Workbook evidence produced: Steps 29, 30.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
