---
id: 002-design-tokens-and-ui-kit
code: FND-02
unit: 001-platform-foundation
intent: 001-petcare-v1
status: ready
priority: must
journeys: all
created: 2026-10-29T16:00:00Z
assigned_bolt: 001-platform-foundation
implemented: false
---

# Story FND-02: Design tokens and UI kit

## User Story

**As a** user
**I want** screens that look and behave the same everywhere
**So that** the product feels calm, trustworthy and easy to learn

## Acceptance Criteria

- [ ] **Given** DESIGN.md tokens, **When** the Tailwind config is built, **Then** every colour, radius, type and elevation token is available by its DESIGN.md name
- [ ] **Given** the shared kit, **When** a screen needs a button, card, input, badge, chip, toggle, sheet, sticky action bar or state pill, **Then** it uses the kit component
- [ ] **Given** any text and background pair used by the kit, **When** contrast is measured, **Then** it meets WCAG 2.1 AA (adjust amber and muted pairs if needed, UC-22)
- [ ] **Given** the kit, **When** coral is used, **Then** it is only in acute-event components (UC-21)
- [ ] **Given** any interactive kit element, **When** measured, **Then** the target is at least 44x44 px with 8 px spacing

## Traceability

- **Requirements:** DR-19, NFR-14; DESIGN.md Colors/Components; UC-21, UC-22
- **Journeys:** all

## UI/UX Impact

All screens; component gallery page for review

## API Dependencies (including Dummy APIs)

None

## Test Expectations

Unit tests for components; automated contrast check; visual review page

## Dependencies

### Requires
- FND-01 Workspace and app shell (`001-platform-foundation/stories/001-workspace-and-app-shell.md`)

### Enables
- FND-04 PWA, offline and shared states (`001-platform-foundation/stories/004-pwa-offline-and-shared-states.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Reduced-motion preference | Transitions become instant |
| Long Bangla label | Wraps without clipping |

## Out of Scope

- Dark theme (not in v1)
