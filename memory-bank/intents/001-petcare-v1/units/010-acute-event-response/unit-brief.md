---
unit: 010-acute-event-response
intent: 001-petcare-v1
unit_type: vertical-slice (API + screens)
default_bolt_type: ddd-construction-bolt
phase: inception
status: ready
created: 2026-10-29T14:30:00Z
updated: 2026-10-29T14:30:00Z
---

# Unit Brief: Acute-Event Response

## Purpose

The launch-blocking runbook: provider 'Report a concern', admin coordination, vet clinics, owner notification, payout freeze, timeline, post-mortem.

**Why a separate unit:** A launch-blocking, time-critical flow with its own state and roles, kept apart from disputes.

## Scope

### In Scope
- Provider trigger sheet from the booking page (type, severity TD-14, observation)
- Top of the admin queue; runbook steps, timeline, templated owner message (BN/EN)
- Vet clinics shown at trigger; owner banner; payout freeze; early dispute window; provider flag without auto-suspension
- Measured times: trigger to owner notified, first admin entry
- Post-mortem within 48 h; editable templates

### Out of Scope
- Clinical decisions (never)
- Vet directory data (Booking & Stay)

---

## Assigned Requirements

Each in-scope FR belongs to exactly one unit; stories are created from these. DR items come from the approved requirements.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-26 | Acute-event trigger | Must |
| FR-27 | Admin coordination, owner cadence | Must |
| FR-28 | Vet directory in acute event | Must |
| FR-29 | Payout/report implications of acute event | Must |
| FR-30 | Post-mortem loop | Must |
| FR-34 | Acute-event coordination surface | Must |
| DR-16 | Acute-event timing measured (derived) | Must |

Non-functional: NFR-8, NFR-22

**Screens (experience blueprint):** P3 Booking (Report a concern sheet), O6 Booking (acute banner), A2 Acute event

**Page specs used as the content source:** 5.7 Acute-event trigger; 4.2 Acute-event runbook; 4.9 Post-mortem log

---

## Domain Concepts

### Key Entities
| Entity | Attributes |
|--------|------------|
| Acute event | booking, type, severity, observation, state, times |
| Timeline entry | event, actor, text, time |
| Runbook step | step, status, note |
| Post-mortem | event, summary, findings |

### Key Operations
- Trigger
- Add timeline entry
- Advance or skip step
- Notify owner
- Close with post-mortem

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-platform-foundation | UI kit, config |
| 003-accounts-notifications | roles, notifications |
| 007-payments-payouts | payout freeze |
| 008-booking-stay | in-stay booking, vet clinics |

### Depended By
| Unit | Reason |
|------|--------|
| 011-admin-operations | open events |

### External Dependencies
| System | Purpose |
|--------|---------|
| Notification channel (Dummy) | see system-context.md |

---

## Technical Context

Follows `memory-bank/standards/` and the approved training decisions. Business-rule values come only from the configuration module (Platform Foundation). Screens follow [experience-blueprint.md](../../experience-blueprint.md).

---

## Success Criteria

### Functional
- [ ] Trigger only from an in-stay booking
- [ ] Owner notified in under 5 minutes in the demo, measured
- [ ] Post-mortem required to close
- [ ] Coral used only for this state

### Non-Functional
- [ ] Meets the NFRs listed above
- [ ] Required transition, payment and admin events are logged

### Quality
- [ ] Unit, API and integration tests pass; this unit's E2E steps pass
- [ ] Acceptance criteria met; code reviewed

---

## Story Summary

- **Total Stories**: 4
- **Must Have**: 4
- **Should Have**: 0
- **Could Have**: 0

| Code | Story | Priority | Journeys | Status |
|------|-------|----------|----------|--------|
| ACU-01 | [Report a concern](stories/001-report-a-concern.md) | must | UJ-1 | Planned |
| ACU-02 | [Acute-event effects and owner notice](stories/002-acute-event-effects-and-owner-notice.md) | must | UJ-1, UJ-3 | Planned |
| ACU-03 | [Runbook coordination](stories/003-runbook-coordination.md) | must | UJ-3 | Planned |
| ACU-04 | [Close with a post-mortem](stories/004-close-with-a-post-mortem.md) | must | UJ-3 | Planned |

## Bolts

| Bolt | Type | Stories | Phase |
|------|------|---------|-------|
| [015-acute-event-response](../../../../bolts/015-acute-event-response/bolt.md) | ddd-construction-bolt | ACU-01, ACU-02 | UJ-1 complete |
| [023-acute-event-response](../../../../bolts/023-acute-event-response/bolt.md) | ddd-construction-bolt | ACU-03, ACU-04 | UJ-3 |
