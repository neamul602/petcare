---
unit: 007-payments-payouts
intent: 001-petcare-v1
unit_type: vertical-slice (API + screens)
default_bolt_type: ddd-construction-bolt
phase: inception
status: ready
created: 2026-10-29T14:30:00Z
updated: 2026-10-29T14:30:00Z
---

# Unit Brief: Payments & Payouts

## Purpose

All money rules: authorize, capture on confirmation, release, refund, commission, weekly payout, freeze and release, reconciliation, with idempotency everywhere.

**Why a separate unit:** Payments are separate from the booking flow but connected through a narrow interface, so money safety is tested on its own.

## Scope

### In Scope
- Payment and payout ports with Dummy adapters
- Authorize, capture, release, refund with idempotency keys and a payment event log
- bKash and Nagad first, card second (TD-7)
- Commission fixed at confirmation (TD-8); payout = captured minus commission; weekly batch (TD-3)
- Freeze and release on report or acute event; refund amounts (TD-4)
- Provider earnings screen and admin payouts screen

### Out of Scope
- Booking state and transitions (Booking & Stay)
- Deciding refund outcomes (Reviews & Disputes)
- Real gateway contracts

---

## Assigned Requirements

Each in-scope FR belongs to exactly one unit; stories are created from these. DR items come from the approved requirements.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-39 | Capture-on-confirmation | Must |
| FR-40 | MFS-first rails, card secondary | Must |
| FR-41 | Commission and payout | Must |
| FR-42 | Refund mechanics | Must |
| DR-9 | Payment failure paths (derived) | Must |
| DR-13 | Idempotent capture (derived) | Must |
| DR-14 | Payout failure safety (derived) | Must |
| DR-17 | Payout reconciliation view (derived) | Must |
| DR-21 | Safe failure of the external ports this unit uses (derived) | Must |

Non-functional: NFR-9, NFR-23, NFR-25

**Screens (experience blueprint):** P5 Earnings, A6 Payouts

**Page specs used as the content source:** 3.10 Payouts + earnings; 5.6 Payouts view; 4.8 Payout reconciliation

---

## Domain Concepts

### Key Entities
| Entity | Attributes |
|--------|------------|
| Payment authorization | booking, method, amount, status, reference, idempotency key |
| Payment event | type, booking, reference, time |
| Payout | booking, provider, gross, commission rate and amount, net, status, freeze reason |
| Payout batch | run time, lines, status |

### Key Operations
- Authorize
- Capture (idempotent)
- Release
- Refund
- Queue payout
- Freeze/release payout
- Run weekly batch
- Reconcile

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-platform-foundation | config, DB, log helper, clock |
| 003-accounts-notifications | roles |
| 002-dummy-integration-services | Payment and Payout APIs |

### Depended By
| Unit | Reason |
|------|--------|
| 008-booking-stay | authorize, capture, release |
| 009-reviews-disputes | freeze, refund, release |
| 010-acute-event-response | payout freeze |
| 011-admin-operations | payout status |

### External Dependencies
| System | Purpose |
|--------|---------|
| Payment gateway (Dummy) | see system-context.md |
| MFS payout rail (Dummy) | see system-context.md |

---

## Technical Context

Follows `memory-bank/standards/` and the approved training decisions. Business-rule values come only from the configuration module (Platform Foundation). Screens follow [experience-blueprint.md](../../experience-blueprint.md).

---

## Success Criteria

### Functional
- [ ] Retried capture charges once
- [ ] Payout service outage leaves payouts queued, never paid twice
- [ ] Every payment event logged with gateway and booking reference
- [ ] Net equals captured minus the rate fixed at confirmation

### Non-Functional
- [ ] Meets the NFRs listed above
- [ ] Required transition, payment and admin events are logged

### Quality
- [ ] Unit, API and integration tests pass; this unit's E2E steps pass
- [ ] Acceptance criteria met; code reviewed

---

## Story Summary

- **Total Stories**: 8
- **Must Have**: 6
- **Should Have**: 2
- **Could Have**: 0

| Code | Story | Priority | Journeys | Status |
|------|-------|----------|----------|--------|
| PAY-01 | [Authorize payment at request](stories/001-authorize-payment-at-request.md) | must | UJ-1, UJ-4 | Planned |
| PAY-02 | [Capture on confirmation](stories/002-capture-on-confirmation.md) | must | UJ-1 | Planned |
| PAY-03 | [Release authorization](stories/003-release-authorization.md) | must | UJ-1 | Planned |
| PAY-04 | [Commission and payout queue](stories/004-commission-and-payout-queue.md) | must | UJ-1, UJ-2 | Planned |
| PAY-05 | [Weekly payout batch](stories/005-weekly-payout-batch.md) | must | UJ-2 | Planned |
| PAY-06 | [Freeze, release and refund](stories/006-freeze-release-and-refund.md) | must | UJ-3 | Planned |
| PAY-07 | [Provider earnings](stories/007-provider-earnings.md) | should | UJ-2 | Planned |
| PAY-08 | [Admin payouts and reconciliation](stories/008-admin-payouts-and-reconciliation.md) | should | UJ-3 | Planned |

## Bolts

| Bolt | Type | Stories | Phase |
|------|------|---------|-------|
| [008-payments-payouts](../../../../bolts/008-payments-payouts/bolt.md) | ddd-construction-bolt | PAY-01, PAY-02, PAY-03 | Thin slice |
| [012-payments-payouts](../../../../bolts/012-payments-payouts/bolt.md) | ddd-construction-bolt | PAY-04, PAY-05, PAY-06 | UJ-1 complete |
| [020-payments-payouts](../../../../bolts/020-payments-payouts/bolt.md) | simple-construction-bolt | PAY-07, PAY-08 | UJ-2 |
