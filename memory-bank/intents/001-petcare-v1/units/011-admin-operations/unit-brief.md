---
unit: 011-admin-operations
intent: 001-petcare-v1
unit_type: vertical-slice (API + screens)
default_bolt_type: simple-construction-bolt
phase: inception
status: complete
created: '2026-10-29T14:30:00Z'
updated: '2026-10-29T14:30:00Z'
---

# Unit Brief: Admin Operations

## Purpose

The single operator's overview: urgency queue, audit log, operating ceiling, provider health and utilization flags, defection signals. It reads from every unit and owns no workflow.

**Why a separate unit:** Read-model aggregation across all domains, built last so it never owns another unit's rules.

## Scope

### In Scope
- Queue: acute events, reports, awaiting provider confirmation, in stay; counts for applications and reviews to moderate
- Immutable audit log and its viewer
- Insights: ceiling (1 admin, 25 providers, 75 completed bookings a month) and bookings per neighbourhood
- Provider list flags: health, utilization 30/60/90 (TD-10), user-surfaced defection signals (UC-4); re-engagement notes

### Out of Scope
- Owning any workflow it lists (each domain unit owns its own)

---

## Assigned Requirements

Each in-scope FR belongs to exactly one unit; stories are created from these. DR items come from the approved requirements.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-32 | Queue dashboard | Must |
| FR-36 | Defection detection, re-engagement | Must |
| FR-37 | Audit log | Must |
| FR-38 | Operating-ceiling monitoring | Must |
| FR-50 | Defection signal capture | Must |

Non-functional: NFR-4, NFR-21

**Screens (experience blueprint):** A1 Queue, A4 Providers (list and flags), A7 Insights, A8 Audit log

**Page specs used as the content source:** 4.1 Admin queue; 4.4 Provider health; 4.5 Operating ceiling; 4.10 Defection dashboard; 5.8 Defection detection

---

## Domain Concepts

### Key Entities
| Entity | Attributes |
|--------|------------|
| Queue item (derived) | type, priority, subject, age |
| Audit log entry | admin, time, action, reason code, target |
| Ceiling snapshot | providers, completed bookings 30 days |
| Defection signal | provider, type, source |
| Re-engagement note | provider, stage, outreach, outcome |

### Key Operations
- Get queue
- Append audit entry (used by every admin action)
- View audit log
- Get ceiling
- Evaluate utilization
- Record intervention

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-platform-foundation | UI kit, log helper |
| 003-accounts-notifications | admin role |
| 005-provider-supply-vetting | providers, applications |
| 007-payments-payouts | payout status |
| 008-booking-stay | awaiting confirmation, in stay, completed |
| 009-reviews-disputes | open reports, reviews to moderate |
| 010-acute-event-response | open events |

### Depended By
| Unit | Reason |
|------|--------|
| (none) | Nothing depends on this unit |

### External Dependencies
| System | Purpose |
|--------|---------|
| None | see system-context.md |

---

## Technical Context

Follows `memory-bank/standards/` and the approved training decisions. Business-rule values come only from the configuration module (Platform Foundation). Screens follow [experience-blueprint.md](../../experience-blueprint.md).

---

## Success Criteria

### Functional
- [ ] Queue order matches FR-32; loads under 2 s on a throttled profile
- [ ] Audit entries cannot be edited or deleted
- [ ] Ceiling approach and breach shown as a re-platforming signal
- [ ] Defection signals never auto-suspend

### Non-Functional
- [ ] Meets the NFRs listed above
- [ ] Required transition, payment and admin events are logged

### Quality
- [ ] Unit, API and integration tests pass; this unit's E2E steps pass
- [ ] Acceptance criteria met; code reviewed

---

## Story Summary

- **Total Stories**: 5
- **Must Have**: 2
- **Should Have**: 3
- **Could Have**: 0

| Code | Story | Priority | Journeys | Status |
|------|-------|----------|----------|--------|
| ADM-01 | [Urgency queue](stories/001-urgency-queue.md) | must | UJ-3 | Planned |
| ADM-02 | [Audit log](stories/002-audit-log.md) | must | UJ-3 | Planned |
| ADM-03 | [Operating ceiling](stories/003-operating-ceiling.md) | should | UJ-3 | Planned |
| ADM-04 | [Provider health and utilization](stories/004-provider-health-and-utilization.md) | should | UJ-2, UJ-3 | Planned |
| ADM-05 | [Defection signals](stories/005-defection-signals.md) | should | UJ-4, UJ-3 | Planned |

## Bolts

| Bolt | Type | Stories | Phase |
|------|------|---------|-------|
| [024-admin-operations](../../../../bolts/024-admin-operations/bolt.md) | simple-construction-bolt | ADM-01, ADM-02, ADM-03 | UJ-3 |
| [025-admin-operations](../../../../bolts/025-admin-operations/bolt.md) | simple-construction-bolt | ADM-04, ADM-05 | UJ-3 |
