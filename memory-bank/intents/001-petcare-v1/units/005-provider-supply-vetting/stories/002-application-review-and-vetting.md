---
id: 002-application-review-and-vetting
code: SUP-02
unit: 005-provider-supply-vetting
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-3
created: '2026-10-29T16:00:00Z'
assigned_bolt: 021-provider-supply-vetting
implemented: true
---

# Story SUP-02: Application review and vetting

## User Story

**As a** admin
**I want** to review an application against the minimum bar and decide
**So that** every approved provider has proven identity, address and capability

## Acceptance Criteria

- [ ] **Given** a Tier-B application or a Tier-A outreach record, **When** I open it, **Then** I see the criteria for identity, address, capability and references
- [ ] **Given** artifacts, **When** I record them, **Then** they are stored apart from the public profile and never appear in any owner response
- [ ] **Given** identity, address or capability not marked complete, **When** I try to approve, **Then** approval is blocked
- [ ] **Given** Tier-A, **When** I approve, **Then** a recorded personal outreach is required
- [ ] **Given** a decision, **When** made, **Then** it is audit-logged with a reason

## Traceability

- **Requirements:** FR-3, FR-33, NFR-7; page spec 4.3
- **Journeys:** UJ-3

## UI/UX Impact

A4 Providers (provider page, vetting); page spec 4.3 (spec-only)

## API Dependencies (including Dummy APIs)

Providers API

## Test Expectations

API tests incl. artifact privacy

## Dependencies

### Requires
- SUP-01 Provider records, tiers and status (`005-provider-supply-vetting/stories/001-provider-records-tiers-and-status.md`)

### Enables
- SUP-03 Appeal and bias-audit data (`005-provider-supply-vetting/stories/003-appeal-and-bias-audit-data.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Request more info | Status shows awaiting info |

## Out of Scope

- Background-check vendor
