---
id: 002-dummy-integration-services
unit: 002-dummy-integration-services
intent: 001-petcare-v1
type: simple-construction-bolt
status: in-progress
phase: Thin slice
stories:
  - 001-dummy-service-host-and-training-controls
  - 002-dummy-sms-otp-api
  - 003-dummy-payment-gateway-api
  - 004-dummy-mfs-payout-api
  - 005-dummy-notification-and-photo-apis
created: 2026-10-29T17:00:00Z
started: 2026-10-29T22:00:00Z
completed: null
current_stage: plan
stages_completed: []

requires_bolts: [001-platform-foundation]
enables_bolts: [004-accounts-notifications, 005-pet-care-profile, 008-payments-payouts, 011-booking-stay, 012-payments-payouts, 014-reviews-disputes]
requires_units: [platform-foundation]
blocks: false

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 002-dummy-integration-services

## Overview

Plan phase **Thin slice**, bolt 2 of 25. Journeys served: UJ-1, UJ-2, UJ-4.

## Objective

The five Dummy APIs with health, reset, inspection and failure modes.

## Stories Included

- **001-dummy-service-host-and-training-controls** (DUM-01): Dummy service host and training controls (Must) · [story](../../intents/001-petcare-v1/units/002-dummy-integration-services/stories/001-dummy-service-host-and-training-controls.md)
- **002-dummy-sms-otp-api** (DUM-02): Dummy SMS / OTP API (Must) · [story](../../intents/001-petcare-v1/units/002-dummy-integration-services/stories/002-dummy-sms-otp-api.md)
- **003-dummy-payment-gateway-api** (DUM-03): Dummy payment gateway API (Must) · [story](../../intents/001-petcare-v1/units/002-dummy-integration-services/stories/003-dummy-payment-gateway-api.md)
- **004-dummy-mfs-payout-api** (DUM-04): Dummy MFS payout API (Must) · [story](../../intents/001-petcare-v1/units/002-dummy-integration-services/stories/004-dummy-mfs-payout-api.md)
- **005-dummy-notification-and-photo-apis** (DUM-05): Dummy notification and photo APIs (Must) · [story](../../intents/001-petcare-v1/units/002-dummy-integration-services/stories/005-dummy-notification-and-photo-apis.md)

## Expected Outcome

Every Dummy endpoint from workbook Step 16 answers; each failure mode is switchable; a repeated capture charges once.

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → implementation-plan.md
- [ ] **2. Implement**: Pending → source code
- [ ] **3. Test**: Pending → test-walkthrough.md

## Dependencies

### Requires
- 001-platform-foundation

### Enables
- 004-accounts-notifications
- 005-pet-care-profile
- 008-payments-payouts
- 011-booking-stay
- 012-payments-payouts
- 014-reviews-disputes

## Test Expectations

API tests per endpoint and per failure mode; curl script for evidence.

Workbook evidence produced: Steps 16, 18.

## Success Criteria

- [ ] All stories implemented
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
