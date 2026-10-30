---
unit: 005-provider-supply-vetting
intent: 001-petcare-v1
unit_type: vertical-slice (API + screens)
default_bolt_type: simple-construction-bolt
phase: inception
status: complete
created: '2026-10-29T14:30:00Z'
updated: '2026-10-29T14:30:00Z'
---

# Unit Brief: Provider Supply & Vetting

## Purpose

Curated supply: tiers, admin-gated vetting with private verification artifacts, the public provider page with its badge, and the provider's own profile editor.

**Why a separate unit:** Supply curation is the credibility gate; its lifecycle and privacy rules do not depend on bookings.

## Scope

### In Scope
- Status lifecycle: applied, vetting, approved, suspended, removed
- Tier-A outreach record and Tier-B application; same minimum bar
- Verification artifacts kept apart from the public profile
- Bias-audit data and right-of-appeal outcome
- Public provider page (owner) and profile editor (provider); Admin-introduced badge for Tier-A
- Admin provider page: application review and status actions

### Out of Scope
- Reviews shown on the profile (Reviews & Disputes)
- Capacity (Search & Capacity)
- Provider health and defection flags (Admin Operations)

---

## Assigned Requirements

Each in-scope FR belongs to exactly one unit; stories are created from these. DR items come from the approved requirements.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Tiered supply structure | Must |
| FR-2 | Admin-gated vetting | Must |
| FR-3 | Minimum vetting bar | Must |
| FR-4 | Vetting bias audit, right of appeal | Must |
| FR-5 | Provider profile completeness, badge | Must |
| FR-33 | Provider intake and vetting workflow | Must |
| DR-21 | Safe failure of the external ports this unit uses (derived) | Must |

Non-functional: NFR-7, NFR-11

**Screens (experience blueprint):** O4 Provider, P6 Profile (edit tab), A4 provider page (vetting)

**Page specs used as the content source:** 1.4 Provider profile; 3.8 Provider profile editor; 4.3 Provider application review

---

## Domain Concepts

### Key Entities
| Entity | Attributes |
|--------|------------|
| Provider | tier, status, neighbourhood, services, price, capability flags, photos, experience |
| Verification artifact | type, status, document reference (admin-only) |
| Application | applicant, tier, criteria, decision, appeal |

### Key Operations
- Create application or outreach record
- Advance status
- Record artifact
- Approve/decline/suspend/remove
- Record appeal outcome
- Get public profile
- Edit own profile

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-platform-foundation | UI kit, DB, log helper |
| 003-accounts-notifications | roles |
| 002-dummy-integration-services | Photo API |

### Depended By
| Unit | Reason |
|------|--------|
| 006-search-capacity | approved providers |
| 008-booking-stay | provider and price |
| 009-reviews-disputes | profile aggregates, provider actions |
| 011-admin-operations | providers, applications |

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
- [ ] Only approved providers visible to owners
- [ ] Verification artifacts never in a public response
- [ ] Tier changes only by admin, audit-logged
- [ ] Tier-A shows the badge, Tier-B does not

### Non-Functional
- [ ] Meets the NFRs listed above
- [ ] Required transition, payment and admin events are logged

### Quality
- [ ] Unit, API and integration tests pass; this unit's E2E steps pass
- [ ] Acceptance criteria met; code reviewed

---

## Story Summary

- **Total Stories**: 5
- **Must Have**: 3
- **Should Have**: 2
- **Could Have**: 0

| Code | Story | Priority | Journeys | Status |
|------|-------|----------|----------|--------|
| SUP-01 | [Provider records, tiers and status](stories/001-provider-records-tiers-and-status.md) | must | UJ-2, UJ-3 | Planned |
| SUP-02 | [Application review and vetting](stories/002-application-review-and-vetting.md) | must | UJ-3 | Planned |
| SUP-03 | [Appeal and bias-audit data](stories/003-appeal-and-bias-audit-data.md) | should | UJ-3 | Planned |
| SUP-04 | [Public provider page](stories/004-public-provider-page.md) | must | UJ-1 | Planned |
| SUP-05 | [Provider profile editor](stories/005-provider-profile-editor.md) | should | UJ-2 | Planned |

## Bolts

| Bolt | Type | Stories | Phase |
|------|------|---------|-------|
| [006-provider-supply-vetting](../../../../bolts/006-provider-supply-vetting/bolt.md) | simple-construction-bolt | SUP-01, SUP-04 | Thin slice |
| [021-provider-supply-vetting](../../../../bolts/021-provider-supply-vetting/bolt.md) | simple-construction-bolt | SUP-05, SUP-02, SUP-03 | UJ-2 |
