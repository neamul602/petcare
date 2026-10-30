---
id: 007-provider-earnings
code: PAY-07
unit: 007-payments-payouts
intent: 001-petcare-v1
status: complete
priority: should
journeys: UJ-2
created: '2026-10-29T16:00:00Z'
assigned_bolt: 020-payments-payouts
implemented: true
---

# Story PAY-07: Provider earnings

## User Story

**As a** provider
**I want** to see my payouts by week with gross, commission, net and status
**So that** I trust what PetCare pays me

## Acceptance Criteria

- [ ] **Given** payouts, **When** I open Earnings, **Then** each shows booking, gross, commission rate and amount, net and status (queued, paid, frozen)
- [ ] **Given** a frozen payout, **When** shown, **Then** the reason is visible
- [ ] **Given** no payouts, **When** opened, **Then** the empty state shows

## Traceability

- **Requirements:** FR-41; page specs 3.10 and 5.6 merged
- **Journeys:** UJ-2

## UI/UX Impact

P5 Earnings

## API Dependencies (including Dummy APIs)

Payouts API

## Test Expectations

Playwright

## Dependencies

### Requires
- PAY-04 Commission and payout queue (`007-payments-payouts/stories/004-commission-and-payout-queue.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| None identified | - |

## Out of Scope

- Provider nudges (UC-6)
- Earnings shown to other providers
