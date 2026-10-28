---
unit: 006-search-capacity
intent: 001-petcare-v1
unit_type: vertical-slice (API + screens)
default_bolt_type: ddd-construction-bolt
phase: inception
status: ready
created: 2026-10-29T14:30:00Z
updated: 2026-10-29T14:30:00Z
---

# Unit Brief: Search & Capacity

## Purpose

Per-night capacity and the curated shortlist: a provider is shown only if every night has room, and a request against a full night is blocked at submission.

**Why a separate unit:** Capacity has exact boundary and concurrency rules and a hard p95 target; booking calls it, it does not own it.

## Scope

### In Scope
- Capacity per date and species; peak windows and presets
- Rules: exact boundaries, raise for Eid, refuse lowering below confirmed, last-slot race safety
- Shortlist of 3-5 ranked only by tier, neighbourhood density and capacity, showing why each provider is there; View all approved
- Launch-neighbourhood filter; bookings per neighbourhood
- Home (guest and signed-in search entry) and provider calendar

### Out of Scope
- Ranking by care fit, distance or reviews (forbidden in v1)
- Booking state (Booking & Stay calls this unit)

---

## Assigned Requirements

Each in-scope FR belongs to exactly one unit; stories are created from these. DR items come from the approved requirements.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11 | Curated search default | Must |
| FR-12 | Date-level capacity | Must |
| FR-13 | Launch neighbourhoods, density | Must |
| DR-6 | Search ranking rules, p95 < 1 s (derived) | Must |
| DR-7 | Exact capacity boundaries (derived) | Must |
| DR-8 | Last-slot race safety (derived) | Must |

Non-functional: NFR-3, NFR-24, NFR-26

**Screens (experience blueprint):** O1 Home, O3 Results, P2 Calendar

**Page specs used as the content source:** 1.1 Landing / home; 1.3 Curated shortlist; 3.2 Capacity calendar

---

## Domain Concepts

### Key Entities
| Entity | Attributes |
|--------|------------|
| Date capacity | provider, date, species, total, booked |
| Peak window | name, start, end |
| Shortlist result | provider, tier, density, availability, reason shown |

### Key Operations
- Set capacity
- Expand for peak
- Check availability for a window
- Reserve/release nights (called by Booking & Stay)
- Search shortlist
- Search all approved
- Bookings per neighbourhood

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-platform-foundation | UI kit, DB, clock |
| 003-accounts-notifications | roles |
| 004-pet-care-profile | pet needs attached to search |
| 005-provider-supply-vetting | approved providers |

### Depended By
| Unit | Reason |
|------|--------|
| 008-booking-stay | reserve and release nights |

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
- [ ] All seven capacity cases in DR-7 pass
- [ ] Two concurrent requests for the last night: exactly one wins
- [ ] No paid placement or sponsored marker
- [ ] Search p95 under 1 s

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
| SRC-01 | [Capacity per night](stories/001-capacity-per-night.md) | must | UJ-2 | Planned |
| SRC-02 | [Peak-window capacity](stories/002-peak-window-capacity.md) | must | UJ-2 | Planned |
| SRC-03 | [Reserve and release nights safely](stories/003-reserve-and-release-nights-safely.md) | must | UJ-1 | Planned |
| SRC-04 | [Curated shortlist](stories/004-curated-shortlist.md) | must | UJ-1 | Planned |
| SRC-05 | [Home and search entry](stories/005-home-and-search-entry.md) | must | UJ-1, UJ-4 | Planned |
| SRC-06 | [Bookings per neighbourhood](stories/006-bookings-per-neighbourhood.md) | should | UJ-3 | Planned |

## Bolts

| Bolt | Type | Stories | Phase |
|------|------|---------|-------|
| [007-search-capacity](../../../../bolts/007-search-capacity/bolt.md) | ddd-construction-bolt | SRC-01, SRC-03, SRC-04, SRC-05 | Thin slice |
| [019-search-capacity](../../../../bolts/019-search-capacity/bolt.md) | ddd-construction-bolt | SRC-02, SRC-06 | UJ-2 |
