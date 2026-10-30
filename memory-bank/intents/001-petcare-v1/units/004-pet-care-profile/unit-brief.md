---
unit: 004-pet-care-profile
intent: 001-petcare-v1
unit_type: vertical-slice (API + screens)
default_bolt_type: simple-construction-bolt
phase: inception
status: complete
created: '2026-10-29T14:30:00Z'
updated: '2026-10-29T14:30:00Z'
---

# Unit Brief: Pets & Care History

## Purpose

The owner's pets and their growing care history: structured profile and care plan, pre-fill for the next booking, a read-only summary for providers, 24-month retention.

**Why a separate unit:** The care history is the product's moat and has its own visibility and retention rules, independent of any single booking.

## Scope

### In Scope
- Pet list, pet page (Profile and Care history tabs), edit form; dog and cat fields; photos
- Structured care plan (medication name/dose/schedule, allergy, anxiety, diet, senior, extra attention)
- Rejection of clinical or veterinary purposes at intake
- Care history entries per booking; empty state 'first stay'; 24-month retention
- Pre-fill from the last successful care plan; provider read-only summary

### Out of Scope
- Creating bookings (Booking & Stay)
- Reviews

---

## Assigned Requirements

Each in-scope FR belongs to exactly one unit; stories are created from these. DR items come from the approved requirements.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6 | Pet profile creation | Must |
| FR-7 | Care history persistence | Must |
| FR-8 | Care history pre-fill | Must |
| FR-9 | Care history visible to provider | Must |
| FR-10 | Record retention (24 months) | Must |
| DR-4 | Structured care configuration (derived) | Must |
| DR-5 | Clinical requests rejected at intake (derived) | Must |
| DR-21 | Safe failure of the external ports this unit uses (derived) | Must |

Non-functional: NFR-10, NFR-17 (retention floor)

**Screens (experience blueprint):** O8 Pets

**Page specs used as the content source:** 1.5 Pet profile management; 2.1 Pet care-history view

---

## Domain Concepts

### Key Entities
| Entity | Attributes |
|--------|------------|
| Pet | owner, species, breed, age, weight, sex, vaccination, behaviour, archived |
| Care plan | medication, allergy, anxiety, diet, senior, extra attention, instructions |
| Care history entry | booking, provider, dates, plan snapshot, outcome, decline reason, review link |

### Key Operations
- Create/edit/archive pet
- Save care plan
- Get care history
- Pre-fill care plan
- Provider summary (read-only)
- Reject clinical request

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-platform-foundation | UI kit, DB |
| 003-accounts-notifications | owner identity |
| 002-dummy-integration-services | Photo API |

### Depended By
| Unit | Reason |
|------|--------|
| 006-search-capacity | pet needs attached to search |
| 008-booking-stay | pet and care plan snapshot, history |

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
- [ ] Tito's full profile expressible without free text
- [ ] Clinical requests rejected and logged
- [ ] Pre-filled fields marked and editable
- [ ] Provider cannot edit history; owners see only their own

### Non-Functional
- [ ] Meets the NFRs listed above
- [ ] Required transition, payment and admin events are logged

### Quality
- [ ] Unit, API and integration tests pass; this unit's E2E steps pass
- [ ] Acceptance criteria met; code reviewed

---

## Story Summary

- **Total Stories**: 7
- **Must Have**: 6
- **Should Have**: 1
- **Could Have**: 0

| Code | Story | Priority | Journeys | Status |
|------|-------|----------|----------|--------|
| PET-01 | [Create and edit a pet profile](stories/001-create-and-edit-a-pet-profile.md) | must | UJ-1 | Planned |
| PET-02 | [Structured care plan](stories/002-structured-care-plan.md) | must | UJ-1 | Planned |
| PET-03 | [Reject clinical requests at intake](stories/003-reject-clinical-requests-at-intake.md) | must | UJ-1 | Planned |
| PET-04 | [Pet page and care history](stories/004-pet-page-and-care-history.md) | must | UJ-4 | Planned |
| PET-05 | [Care plan pre-fill](stories/005-care-plan-pre-fill.md) | must | UJ-4 | Planned |
| PET-06 | [Provider care summary](stories/006-provider-care-summary.md) | must | UJ-1, UJ-4 | Planned |
| PET-07 | [Archive and retention](stories/007-archive-and-retention.md) | should | none | Planned |

## Bolts

| Bolt | Type | Stories | Phase |
|------|------|---------|-------|
| [005-pet-care-profile](../../../../bolts/005-pet-care-profile/bolt.md) | simple-construction-bolt | PET-01, PET-02, PET-03, PET-04, PET-05, PET-06 | Thin slice |
| [018-pet-care-profile](../../../../bolts/018-pet-care-profile/bolt.md) | simple-construction-bolt | PET-07 | UJ-4 |
