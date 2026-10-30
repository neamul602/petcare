---
id: 020-payments-payouts
unit: 007-payments-payouts
intent: 001-petcare-v1
type: simple-construction-bolt
status: complete
phase: UJ-2
stories:
  - 007-provider-earnings
  - 008-admin-payouts-and-reconciliation
created: '2026-10-29T17:00:00Z'
started: '2026-11-01T15:00:00Z'
completed: '2026-10-30T14:30:04Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-11-01T15:00:00Z'
    artifact: implementation-plan.md
requires_bolts:
  - 012-payments-payouts
enables_bolts: []
requires_units: []
blocks: true
complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 020-payments-payouts

## Overview

Plan phase **UJ-2**, bolt 20 of 25. Journeys served: UJ-2, UJ-3.

> **Bolt type override:** the unit default differs; this bolt is UI and read-model work, so a simple-construction-bolt fits better.

## Objective

Provider earnings screen and admin payouts with reconciliation.

## Stories Included

- **007-provider-earnings** (PAY-07): Provider earnings (Should) · [story](../../intents/001-petcare-v1/units/007-payments-payouts/stories/007-provider-earnings.md)
- **008-admin-payouts-and-reconciliation** (PAY-08): Admin payouts and reconciliation (Should) · [story](../../intents/001-petcare-v1/units/007-payments-payouts/stories/008-admin-payouts-and-reconciliation.md)

## Expected Outcome

Rashid sees gross, commission, net and status per payout; Ayaat sees batches and a highlighted mismatch.

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → source code
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 012-payments-payouts

### Enables
- None

## Test Expectations

Playwright; reconciliation integration test.

Workbook evidence produced: Step 27.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
