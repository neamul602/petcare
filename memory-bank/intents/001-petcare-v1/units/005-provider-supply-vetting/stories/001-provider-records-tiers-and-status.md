---
id: 001-provider-records-tiers-and-status
code: SUP-01
unit: 005-provider-supply-vetting
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-2, UJ-3
created: '2026-10-29T16:00:00Z'
assigned_bolt: 006-provider-supply-vetting
implemented: true
---

# Story SUP-01: Provider records, tiers and status

## User Story

**As a** admin
**I want** providers to have a tier and a status that only I can change
**So that** only vetted providers ever reach owners

## Acceptance Criteria

- [ ] **Given** a provider, **When** created, **Then** it has a tier (A or B) and status applied
- [ ] **Given** the lifecycle, **When** I advance it, **Then** it moves applied, vetting, approved; from approved only to suspended or removed
- [ ] **Given** owner search or profile requests, **When** a provider is not approved, **Then** it is never returned
- [ ] **Given** a suspended or removed provider, **When** a request or confirmation is attempted, **Then** it is refused
- [ ] **Given** a tier change, **When** I make it, **Then** it needs a reason and is audit-logged

## Traceability

- **Requirements:** FR-1, FR-2
- **Journeys:** UJ-2, UJ-3

## UI/UX Impact

A4 Providers (provider page)

## API Dependencies (including Dummy APIs)

Providers API

## Test Expectations

State tests; search filter tests

## Dependencies

### Requires
- ACC-02 Admin sign-in and role guards (`003-accounts-notifications/stories/002-admin-sign-in-and-role-guards.md`)

### Enables
- SUP-02 Application review and vetting (`005-provider-supply-vetting/stories/002-application-review-and-vetting.md`)
- SUP-04 Public provider page (`005-provider-supply-vetting/stories/004-public-provider-page.md`)
- SRC-01 Capacity per night (`006-search-capacity/stories/001-capacity-per-night.md`)
- ADM-04 Provider health and utilization (`011-admin-operations/stories/004-provider-health-and-utilization.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No public sign-up | No route creates a provider without the admin |

## Out of Scope

- Third tier
