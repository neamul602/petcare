---
id: 001-platform-foundation
unit: 001-platform-foundation
intent: 001-petcare-v1
type: simple-construction-bolt
status: planned
phase: Thin slice
stories:
  - 001-workspace-and-app-shell
  - 002-design-tokens-and-ui-kit
  - 003-bangla-and-english-with-parity
  - 005-configuration-clock-and-log-primitives
created: 2026-10-29T17:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: []
enables_bolts: [002-dummy-integration-services, 003-platform-foundation, 004-accounts-notifications, 008-payments-payouts, 009-booking-stay, 024-admin-operations]
requires_units: []
blocks: false

complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 001-platform-foundation

## Overview

Plan phase **Thin slice**, bolt 1 of 25. Journeys served: UJ-1, UJ-2, UJ-4.

## Objective

Workspace, app shell with role navigation, design tokens and UI kit, Bangla/English with the parity check, configuration module, clock and log primitives.

## Stories Included

- **001-workspace-and-app-shell** (FND-01): Workspace and app shell (Must) · [story](../../intents/001-petcare-v1/units/001-platform-foundation/stories/001-workspace-and-app-shell.md)
- **002-design-tokens-and-ui-kit** (FND-02): Design tokens and UI kit (Must) · [story](../../intents/001-petcare-v1/units/001-platform-foundation/stories/002-design-tokens-and-ui-kit.md)
- **003-bangla-and-english-with-parity** (FND-03): Bangla and English with parity (Must) · [story](../../intents/001-petcare-v1/units/001-platform-foundation/stories/003-bangla-and-english-with-parity.md)
- **005-configuration-clock-and-log-primitives** (FND-05): Configuration, clock and log primitives (Must) · [story](../../intents/001-petcare-v1/units/001-platform-foundation/stories/005-configuration-clock-and-log-primitives.md)

## Expected Outcome

All three apps start; owner, provider and admin shells render at 390 px and 1280 px in Bangla and English; TD values load from one module.

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → source code
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- None (first bolt)

### Enables
- 002-dummy-integration-services
- 003-platform-foundation
- 004-accounts-notifications
- 008-payments-payouts
- 009-booking-stay
- 024-admin-operations

## Test Expectations

Component unit tests; i18n parity check; static checks (no TD values outside config, no Dummy URLs in web); Playwright shell smoke.

Workbook evidence produced: Steps 15, 32 (i18n check).

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
