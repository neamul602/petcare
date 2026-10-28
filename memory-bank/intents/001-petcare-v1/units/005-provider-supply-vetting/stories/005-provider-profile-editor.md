---
id: 005-provider-profile-editor
code: SUP-05
unit: 005-provider-supply-vetting
intent: 001-petcare-v1
status: ready
priority: should
journeys: UJ-2
created: 2026-10-29T16:00:00Z
assigned_bolt: 021-provider-supply-vetting
implemented: false
---

# Story SUP-05: Provider profile editor

## User Story

**As a** provider
**I want** to keep my profile, services, prices and capability flags up to date
**So that** owners see accurate information

## Acceptance Criteria

- [ ] **Given** P6 Profile, **When** I edit and save, **Then** changes appear on my public page
- [ ] **Given** the completeness indicator, **When** fields are missing, **Then** it lists what is missing
- [ ] **Given** capacity per size, **When** offered in the spec, **Then** it is not built (FR-12 out of scope; UC-12)

## Traceability

- **Requirements:** FR-5; page spec 3.8; UC-12
- **Journeys:** UJ-2

## UI/UX Impact

P6 Profile (edit tab); page spec 3.8 (spec-only)

## API Dependencies (including Dummy APIs)

Providers API; photo port

## Test Expectations

Playwright

## Dependencies

### Requires
- SUP-04 Public provider page (`005-provider-supply-vetting/stories/004-public-provider-page.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Tier change | Not editable by the provider |

## Out of Scope

- Per-size capacity
