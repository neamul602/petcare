---
id: 012-payments-payouts
unit: 007-payments-payouts
intent: 001-petcare-v1
type: ddd-construction-bolt
status: planned
phase: UJ-1 complete
stories:
  - 004-commission-and-payout-queue
  - 005-weekly-payout-batch
  - 006-freeze-release-and-refund
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: [002-dummy-integration-services, 008-payments-payouts]
enables_bolts: [013-booking-stay, 014-reviews-disputes, 015-acute-event-response, 020-payments-payouts]
requires_units: [dummy-integration-services]
blocks: true

complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 2
---

# Bolt: 012-payments-payouts

## Overview

Plan phase **UJ-1 complete**, bolt 12 of 25. Journeys served: UJ-1, UJ-2, UJ-3.

## Objective

Commission fixed at confirmation, payout queue, weekly batch, freeze, release and refund.

## Stories Included

- **004-commission-and-payout-queue** (PAY-04): Commission and payout queue (Must) · [story](../../intents/001-petcare-v1/units/007-payments-payouts/stories/004-commission-and-payout-queue.md)
- **005-weekly-payout-batch** (PAY-05): Weekly payout batch (Must) · [story](../../intents/001-petcare-v1/units/007-payments-payouts/stories/005-weekly-payout-batch.md)
- **006-freeze-release-and-refund** (PAY-06): Freeze, release and refund (Must) · [story](../../intents/001-petcare-v1/units/007-payments-payouts/stories/006-freeze-release-and-refund.md)

## Expected Outcome

A completed BDT 20,000 Tier-A stay queues an 18,000 payout; the batch pays once even if the rail fails first; reports and acute events freeze payouts.

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
- 008-payments-payouts

### Enables
- 013-booking-stay
- 014-reviews-disputes
- 015-acute-event-response
- 020-payments-payouts

## Test Expectations

Unit tests for amounts; integration tests incl. payout outage and double batch.

Workbook evidence produced: Steps 27, 29.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
