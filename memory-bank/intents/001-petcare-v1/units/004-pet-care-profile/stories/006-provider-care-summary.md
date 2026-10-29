---
id: 006-provider-care-summary
code: PET-06
unit: 004-pet-care-profile
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1, UJ-4
created: '2026-10-29T16:00:00Z'
assigned_bolt: 005-pet-care-profile
implemented: true
---

# Story PET-06: Provider care summary

## User Story

**As a** provider
**I want** to see a read-only summary of the pet's care history on a request
**So that** I can accept confidently

## Acceptance Criteria

- [ ] **Given** a request, **When** I view it, **Then** I see prior stays with me and with others, special-care flags, medication and diet notes, and decline patterns
- [ ] **Given** a repeat owner-provider pair, **When** I view the request, **Then** the prior stay with me is highlighted
- [ ] **Given** the summary, **When** I try to change it, **Then** nothing is editable

## Traceability

- **Requirements:** FR-9, FR-49; A-4
- **Journeys:** UJ-1, UJ-4

## UI/UX Impact

P3 Booking (request state); page spec 3.3

## API Dependencies (including Dummy APIs)

Pets API (provider summary)

## Test Expectations

API tests for content and read-only

## Dependencies

### Requires
- PET-04 Pet page and care history (`004-pet-care-profile/stories/004-pet-page-and-care-history.md`)

### Enables
- BKG-06 Provider request view (`008-booking-stay/stories/006-provider-request-view.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Provider not on this booking | Access refused |

## Out of Scope

- Provider notes on the history
