---
unit: 001-platform-foundation
intent: 001-petcare-v1
unit_type: vertical-slice (API + screens)
default_bolt_type: simple-construction-bolt
phase: inception
status: complete
created: '2026-10-29T14:30:00Z'
updated: '2026-10-29T14:30:00Z'
---

# Unit Brief: Platform Foundation

## Purpose

What every screen and service stands on: workspace layout, DESIGN.md tokens and the shared UI kit, the app shell and navigation for each role, i18n (Bangla default, English parity), PWA shell, shared error/empty/loading/offline states, the single configuration module for training decisions, and database and logging primitives.

**Why a separate unit:** Shared kernel: tokens, navigation, i18n and configuration exist once, so no unit hard-codes a TD value, a colour or a string.

## Scope

### In Scope
- npm workspaces (apps/web, apps/api, apps/dummy-services, packages/shared)
- Tailwind config from DESIGN.md tokens; shared components (Button, Card, Input, Badge, chips, Sticky Action Bar, Toggle, state pills, sheet)
- App shell and navigation per role (owner and provider tab bars, admin sidebar) as in the experience blueprint
- i18n catalogs (bn, en), header language toggle, automated missing-key check, locale helper (digits, BDT, dates)
- PWA manifest, Workbox service worker, offline banner, shared error/empty/loading patterns (page specs 5.11-5.13)
- One configuration module holding TD-1..TD-16
- PostgreSQL + Drizzle, migrations, append-only log helper, injectable clock, bundle-size and accessibility checks

### Out of Scope
- Any domain screen or rule
- Sign-in (Accounts & Notifications)
- The Dummy services

---

## Assigned Requirements

Each in-scope FR belongs to exactly one unit; stories are created from these. DR items come from the approved requirements.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-46 | Responsive PWA | Must |
| FR-47 | Bangla/English parity | Must |
| DR-18 | Connectivity, empty, error, loading states (derived) | Must |
| DR-19 | WCAG 2.1 AA (derived) | Must |
| DR-22 | Ports and adapters only (derived) | Must |

Non-functional: NFR-1, NFR-2, NFR-12, NFR-13, NFR-14, NFR-15 (shared budgets and checks)

**Screens (experience blueprint):** App shell and navigation for all roles; shared states

**Page specs used as the content source:** 5.11 Error states; 5.12 Empty states; 5.13 Loading skeletons

---

## Domain Concepts

### Key Entities
| Entity | Attributes |
|--------|------------|
| Config values | TD-1..TD-16, ceiling, thresholds |
| Locale | language, digits, currency, dates |
| Log entry primitive | append-only record used by audit, transition and payment logs |

### Key Operations
- Load configuration
- Translate key
- Check i18n parity
- Check bundle budget
- Append log entry (helper)

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| (none) | No unit dependencies |

### Depended By
| Unit | Reason |
|------|--------|
| 003-accounts-notifications | UI kit, shell, DB, clock |
| 004-pet-care-profile | UI kit, DB |
| 005-provider-supply-vetting | UI kit, DB, log helper |
| 006-search-capacity | UI kit, DB, clock |
| 007-payments-payouts | config, DB, log helper, clock |
| 008-booking-stay | UI kit, config, clock |
| 009-reviews-disputes | UI kit, config |
| 010-acute-event-response | UI kit, config |
| 011-admin-operations | UI kit, log helper |

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
- [ ] i18n parity check fails the build on a missing bn/en key
- [ ] Initial payload under 500 KB, measured in CI
- [ ] Every TD value is read from one module
- [ ] Installable PWA with offline banner and cached read surfaces
- [ ] Tab bars and admin sidebar match the experience blueprint

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
| FND-01 | [Workspace and app shell](stories/001-workspace-and-app-shell.md) | must | all | Planned |
| FND-02 | [Design tokens and UI kit](stories/002-design-tokens-and-ui-kit.md) | must | all | Planned |
| FND-03 | [Bangla and English with parity](stories/003-bangla-and-english-with-parity.md) | must | UJ-1, UJ-2, UJ-4 | Planned |
| FND-04 | [PWA, offline and shared states](stories/004-pwa-offline-and-shared-states.md) | must | all | Planned |
| FND-05 | [Configuration, clock and log primitives](stories/005-configuration-clock-and-log-primitives.md) | must | all | Planned |
| FND-06 | [Performance and accessibility checks](stories/006-performance-and-accessibility-checks.md) | should | all | Planned |
| FND-07 | [Training scenario seed](stories/007-training-scenario-seed.md) | must | all | Planned |

## Bolts

| Bolt | Type | Stories | Phase |
|------|------|---------|-------|
| [001-platform-foundation](../../../../bolts/001-platform-foundation/bolt.md) | simple-construction-bolt | FND-01, FND-02, FND-03, FND-05 | Thin slice |
| [003-platform-foundation](../../../../bolts/003-platform-foundation/bolt.md) | simple-construction-bolt | FND-04, FND-06, FND-07 | Thin slice |
