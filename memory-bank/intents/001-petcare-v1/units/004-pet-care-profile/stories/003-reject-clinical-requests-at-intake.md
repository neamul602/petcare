---
id: 003-reject-clinical-requests-at-intake
code: PET-03
unit: 004-pet-care-profile
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-1
created: '2026-10-29T16:00:00Z'
assigned_bolt: 005-pet-care-profile
implemented: true
---

# Story PET-03: Reject clinical requests at intake

## User Story

**As a** platform
**I want** to refuse bookings whose purpose is clinical or veterinary care
**So that** PetCare stays a boarding service and never pretends to be a clinic

## Acceptance Criteria

- [ ] **Given** intake, **When** the owner declares the stay is for diagnosis, treatment, clinical monitoring or a procedure, **Then** the request cannot continue and the reason is explained
- [ ] **Given** free text that matches the clinical keyword guard, **When** submitted, **Then** the owner is asked to confirm the stay is not for clinical care
- [ ] **Given** a rejection, **When** it happens, **Then** it is logged; the vet directory is offered as a lookup only

## Traceability

- **Requirements:** DR-5, PRD §5; UC-20; A-D1
- **Journeys:** UJ-1

## UI/UX Impact

O5 Book (care plan step), O8 Pets

## API Dependencies (including Dummy APIs)

Pets API

## Test Expectations

Unit tests for the guard; API test

## Dependencies

### Requires
- PET-02 Structured care plan (`004-pet-care-profile/stories/002-structured-care-plan.md`)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Insulin administration | Allowed as special care when the provider has the medication capability |

## Out of Scope

- Medical triage
