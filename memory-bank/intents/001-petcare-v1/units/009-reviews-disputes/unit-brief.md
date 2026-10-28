---
unit: 009-reviews-disputes
intent: 001-petcare-v1
unit_type: vertical-slice (API + screens)
default_bolt_type: ddd-construction-bolt
phase: inception
status: ready
created: 2026-10-29T14:30:00Z
updated: 2026-10-29T14:30:00Z
---

# Unit Brief: Reviews & Disputes

## Purpose

What happens after the stay: verified reviews with photos and the trust numbers computed from real records, and the report-a-problem path with payout freeze, admin investigation and refund. Reviews and reports stay independent records (FR-22).

**Why a separate unit:** Both are post-stay trust mechanisms reached from the same booking page and worked by the same admin; they share one unit while their records stay independent.

## Scope

### In Scope
- Review: after completion only, one per booking, rating required, optional stay photos
- Public reviews, aggregate and with-photos rate, new-provider empty state; provider care record
- Admin moderation for cause (remove with reason, kept on record); owner sees the result on the booking page
- Report a problem inside the 72 h window (TD-2) with category (TD-13); freezes payout
- Admin report page: booking record, history, updates, chat, reviews; resolve no action, refund (TD-4), or provider action

### Out of Scope
- Money movement (Payments & Payouts executes freeze and refund)
- Ranking by reputation (forbidden in v1)
- Review appeals (not in v1, UC-5)

---

## Assigned Requirements

Each in-scope FR belongs to exactly one unit; stories are created from these. DR items come from the approved requirements.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-20 | Review gating, one per booking | Must |
| FR-21 | Review content, photos | Must |
| FR-22 | Review independent of report | Must |
| FR-23 | Review visibility, moderation | Must |
| FR-24 | Report an issue in dispute window | Must |
| FR-25 | Admin investigation, resolution | Must |
| FR-35 | Report investigation, dispute resolution | Must |
| DR-15 | No fabricated trust signals (derived) | Must |
| DR-21 | Safe failure of the external ports this unit uses (derived) | Must |

Non-functional: NFR-23, NFR-26

**Screens (experience blueprint):** O6 Booking (review and report sections), P6 Profile (care record tab), A3 Report, A5 Reviews

**Page specs used as the content source:** 5.2 Completion + review; 5.3 Issue report; 5.4 Review moderation result; 3.9 Care-record history; 4.6 Dispute investigation; 4.7 Review moderation queue

---

## Domain Concepts

### Key Entities
| Entity | Attributes |
|--------|------------|
| Review | booking, rating, text, photos, status, removal reason |
| Report | booking, category, description, evidence, status, window end |
| Resolution | outcome, refund amount, provider action, rationale |
| Aggregate | average, count, with-photos rate (computed) |

### Key Operations
- Submit review
- Moderate review
- Compute aggregates
- Submit report
- Add investigation note
- Resolve report (3 outcomes)

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-platform-foundation | UI kit, config |
| 003-accounts-notifications | roles, notifications |
| 005-provider-supply-vetting | profile aggregates, provider actions |
| 007-payments-payouts | freeze, refund, release |
| 008-booking-stay | completed bookings, updates and chat for investigation |
| 002-dummy-integration-services | Photo API |

### Depended By
| Unit | Reason |
|------|--------|
| 011-admin-operations | open reports, reviews to moderate |

### External Dependencies
| System | Purpose |
|--------|---------|
| Photo storage (Dummy) | see system-context.md |

---

## Technical Context

Follows `memory-bank/standards/` and the approved training decisions. Business-rule values come only from the configuration module (Platform Foundation). Screens follow [experience-blueprint.md](../../experience-blueprint.md).

---

## Success Criteria

### Functional
- [ ] Review before completion and second review refused
- [ ] Report outside the window refused with reason; one report per booking; report freezes payout
- [ ] Resolving a report never edits a review
- [ ] No seeded rating shown as real

### Non-Functional
- [ ] Meets the NFRs listed above
- [ ] Required transition, payment and admin events are logged

### Quality
- [ ] Unit, API and integration tests pass; this unit's E2E steps pass
- [ ] Acceptance criteria met; code reviewed

---

## Story Summary

- **Total Stories**: 6
- **Must Have**: 5
- **Should Have**: 1
- **Could Have**: 0

| Code | Story | Priority | Journeys | Status |
|------|-------|----------|----------|--------|
| REV-01 | [Leave a verified review](stories/001-leave-a-verified-review.md) | must | UJ-1 | Planned |
| REV-02 | [Public reviews and aggregates](stories/002-public-reviews-and-aggregates.md) | must | UJ-1 | Planned |
| REV-03 | [Moderate reviews for cause](stories/003-moderate-reviews-for-cause.md) | must | UJ-3 | Planned |
| REV-04 | [Provider care record](stories/004-provider-care-record.md) | should | UJ-2 | Planned |
| REV-05 | [Report a problem](stories/005-report-a-problem.md) | must | UJ-1 | Planned |
| REV-06 | [Investigate and resolve a report](stories/006-investigate-and-resolve-a-report.md) | must | UJ-3 | Planned |

## Bolts

| Bolt | Type | Stories | Phase |
|------|------|---------|-------|
| [014-reviews-disputes](../../../../bolts/014-reviews-disputes/bolt.md) | ddd-construction-bolt | REV-01, REV-02, REV-05 | UJ-1 complete |
| [022-reviews-disputes](../../../../bolts/022-reviews-disputes/bolt.md) | ddd-construction-bolt | REV-04, REV-03, REV-06 | UJ-3 |
