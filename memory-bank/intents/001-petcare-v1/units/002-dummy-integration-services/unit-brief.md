---
unit: 002-dummy-integration-services
intent: 001-petcare-v1
unit_type: vertical-slice (API + screens)
default_bolt_type: simple-construction-bolt
phase: inception
status: ready
created: 2026-10-29T14:30:00Z
updated: 2026-10-29T14:30:00Z
---

# Unit Brief: Dummy Integration Services

## Purpose

The five separately runnable training APIs that stand in for the payment gateway, MFS payout rail, SMS/OTP, notifications and photo storage, each with health, reset, inspection and failure modes.

**Why a separate unit:** Workbook Rule 5: dummies are real development artifacts with their own lifecycle and tests; they must run and be tested before any PetCare unit consumes them.

## Scope

### In Scope
- Dummy Payment Gateway API: authorize, capture, release, refund, get; idempotent capture
- Dummy MFS Payout API: batches, freeze, release, get; idempotent batches
- Dummy SMS/OTP API: send, verify; inspection shows the code
- Dummy Notification API and Dummy Photo Storage API
- Training controls on all five: health, reset, inspect, failure modes (down, timeout, decline, ambiguous)

### Out of Scope
- Ports and adapters inside PetCare (each consuming unit owns its adapter and proves DR-21)
- Any claim about real gateway contracts

---

## Assigned Requirements

Each in-scope FR belongs to exactly one unit; stories are created from these. DR items come from the approved requirements.

| ID | Requirement | Priority |
|----|-------------|----------|
| TR-1..TR-8 | TR-1..TR-8 (training-only behaviour) | Must |

Non-functional: NFR-9 (tokens only), NFR-23 (references returned)

**Screens (experience blueprint):** None

**Page specs used as the content source:** None (API only)

---

## Domain Concepts

### Key Entities
| Entity | Attributes |
|--------|------------|
| Authorization / Payment | id, method, amount, status, reference, idempotency key |
| Payout | id, batch, line, status |
| OtpChallenge | phone, code, expiry, attempts |
| Notification record | recipient, type, body, status |
| Photo | id, bytes, tags |

### Key Operations
- POST /api/payments/authorizations, .../:id/capture, .../:id/release, /api/payments/:paymentId/refunds, GET /api/payments/:paymentId
- POST /api/payouts/batches, .../:payoutId/freeze, .../:payoutId/release, GET /api/payouts/:payoutId
- POST /api/otp/send, /api/otp/verify
- POST /api/notifications
- POST /api/photos, GET /api/photos/:photoId
- Health, reset, inspect, set failure mode (each service)

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| (none) | No unit dependencies |

### Depended By
| Unit | Reason |
|------|--------|
| 003-accounts-notifications | SMS/OTP and Notification APIs |
| 004-pet-care-profile | Photo API |
| 005-provider-supply-vetting | Photo API |
| 007-payments-payouts | Payment and Payout APIs |
| 008-booking-stay | Photo API for updates |
| 009-reviews-disputes | Photo API |

### External Dependencies
| System | Purpose |
|--------|---------|
| None (this unit is the substitute) | see system-context.md |

---

## Technical Context

Follows `memory-bank/standards/` and the approved training decisions. Business-rule values come only from the configuration module (Platform Foundation). Screens follow [experience-blueprint.md](../../experience-blueprint.md).

---

## Success Criteria

### Functional
- [ ] Each failure mode is switchable and observable
- [ ] Repeated capture with the same idempotency key charges once
- [ ] Reset restores a known state
- [ ] Contracts documented as training contracts only

### Non-Functional
- [ ] Meets the NFRs listed above
- [ ] Required transition, payment and admin events are logged

### Quality
- [ ] Unit, API and integration tests pass; this unit's E2E steps pass
- [ ] Acceptance criteria met; code reviewed

---

## Story Summary

- **Total Stories**: 5
- **Must Have**: 5
- **Should Have**: 0
- **Could Have**: 0

| Code | Story | Priority | Journeys | Status |
|------|-------|----------|----------|--------|
| DUM-01 | [Dummy service host and training controls](stories/001-dummy-service-host-and-training-controls.md) | must | all | Planned |
| DUM-02 | [Dummy SMS / OTP API](stories/002-dummy-sms-otp-api.md) | must | UJ-1 | Planned |
| DUM-03 | [Dummy payment gateway API](stories/003-dummy-payment-gateway-api.md) | must | UJ-1, UJ-4 | Planned |
| DUM-04 | [Dummy MFS payout API](stories/004-dummy-mfs-payout-api.md) | must | UJ-2 | Planned |
| DUM-05 | [Dummy notification and photo APIs](stories/005-dummy-notification-and-photo-apis.md) | must | UJ-1 | Planned |

## Bolts

| Bolt | Type | Stories | Phase |
|------|------|---------|-------|
| [002-dummy-integration-services](../../../../bolts/002-dummy-integration-services/bolt.md) | simple-construction-bolt | DUM-01, DUM-02, DUM-03, DUM-04, DUM-05 | Thin slice |
