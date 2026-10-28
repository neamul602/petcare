---
id: 005-configuration-clock-and-log-primitives
code: FND-05
unit: 001-platform-foundation
intent: 001-petcare-v1
status: ready
priority: must
journeys: all
created: 2026-10-29T16:00:00Z
assigned_bolt: 001-platform-foundation
implemented: false
---

# Story FND-05: Configuration, clock and log primitives

## User Story

**As a** developer
**I want** one configuration module, an injectable clock, migrations and an append-only log helper
**So that** business values live in one place and time-based rules can be tested and demonstrated

## Acceptance Criteria

- [ ] **Given** training-decisions.md, **When** the API starts, **Then** TD-1..TD-16 values are loaded from one module and no other file contains these values (static check)
- [ ] **Given** a test or demo, **When** the clock is advanced, **Then** scheduled rules (timeouts, reminders, batches) run as if that time had passed
- [ ] **Given** the log helper, **When** an entry is written, **Then** it can be inserted but never updated or deleted (database grants)
- [ ] **Given** apps/web, **When** the static check runs, **Then** no Dummy service URL is found in web code (DR-22)

## Traceability

- **Requirements:** DR-22, NFR-21..NFR-23 (primitive), training-decisions.md
- **Journeys:** all

## UI/UX Impact

None

## API Dependencies (including Dummy APIs)

Database; config

## Test Expectations

Unit tests; static checks in CI

## Dependencies

### Requires
- FND-01 Workspace and app shell (`001-platform-foundation/stories/001-workspace-and-app-shell.md`)

### Enables
- FND-07 Training scenario seed (`001-platform-foundation/stories/007-training-scenario-seed.md`)
- ACC-02 Admin sign-in and role guards (`003-accounts-notifications/stories/002-admin-sign-in-and-role-guards.md`)
- ACC-03 Notification port and delivery (`003-accounts-notifications/stories/003-notification-port-and-delivery.md`)
- PAY-01 Authorize payment at request (`007-payments-payouts/stories/001-authorize-payment-at-request.md`)
- BKG-01 Booking state machine (`008-booking-stay/stories/001-booking-state-machine.md`)
- ADM-02 Audit log (`011-admin-operations/stories/002-audit-log.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Missing config value | API refuses to start with a clear error |

## Out of Scope

- Business rules themselves
