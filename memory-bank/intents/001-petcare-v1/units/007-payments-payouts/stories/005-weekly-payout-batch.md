---
id: 005-weekly-payout-batch
code: PAY-05
unit: 007-payments-payouts
intent: 001-petcare-v1
status: ready
priority: must
journeys: UJ-2
created: 2026-10-29T16:00:00Z
assigned_bolt: 012-payments-payouts
implemented: false
---

# Story PAY-05: Weekly payout batch

## User Story

**As a** provider
**I want** payouts paid weekly through MFS
**So that** I get paid on a predictable day

## Acceptance Criteria

- [ ] **Given** Sunday 10:00 Asia/Dhaka, **When** the batch runs, **Then** it pays queued payouts whose dispute window has closed and that are not frozen
- [ ] **Given** the payout service is down, **When** the batch runs, **Then** payouts stay queued and the next run pays them once
- [ ] **Given** the admin, **When** 'Run batch now' is used, **Then** the same rules apply (for demos)

## Traceability

- **Requirements:** FR-41, DR-14, DR-21; TD-3
- **Journeys:** UJ-2

## UI/UX Impact

A6 Payouts

## API Dependencies (including Dummy APIs)

payout port -> Dummy MFS Payout

## Test Expectations

Integration tests incl. outage (STEP-27, STEP-35)

## Dependencies

### Requires
- PAY-04 Commission and payout queue (`007-payments-payouts/stories/004-commission-and-payout-queue.md`)
- DUM-04 Dummy MFS payout API (`002-dummy-integration-services/stories/004-dummy-mfs-payout-api.md`)

### Enables
- PAY-06 Freeze, release and refund (`007-payments-payouts/stories/006-freeze-release-and-refund.md`)
- PAY-08 Admin payouts and reconciliation (`007-payments-payouts/stories/008-admin-payouts-and-reconciliation.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Batch run twice | No double payout |

## Out of Scope

- On-completion payout
