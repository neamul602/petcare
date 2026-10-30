---
id: 006-investigate-and-resolve-a-report
code: REV-06
unit: 009-reviews-disputes
intent: 001-petcare-v1
status: complete
priority: must
journeys: UJ-3
created: '2026-10-29T16:00:00Z'
assigned_bolt: 022-reviews-disputes
implemented: true
---

# Story REV-06: Investigate and resolve a report

## User Story

**As a** admin
**I want** to see everything about the booking and resolve with a rationale
**So that** every dispute is decided fairly and recorded

## Acceptance Criteria

- [ ] **Given** A3 Report, **When** opened, **Then** I see the booking record, care history, updates, chat, decline patterns and reviews
- [ ] **Given** a resolution, **When** I choose No action, Refund (amount up to captured) or Provider action (warning, suspension, removal), **Then** I must write a rationale
- [ ] **Given** the outcome, **When** saved, **Then** refunds and releases go through PAY-06, provider action through SUP-01, the booking becomes resolved or refunded, and the review is untouched
- [ ] **Given** every step, **When** taken, **Then** it is audit-logged

## Traceability

- **Requirements:** FR-25, FR-35, FR-42, FR-22; TD-4; page spec 4.6
- **Journeys:** UJ-3

## UI/UX Impact

A3 Report

## API Dependencies (including Dummy APIs)

Reports API; PAY-06; SUP-01; audit via ACC-02

## Test Expectations

Integration test (STEP-29)

## Dependencies

### Requires
- REV-05 Report a problem (`009-reviews-disputes/stories/005-report-a-problem.md`)
- ACC-02 Admin sign-in and role guards (`003-accounts-notifications/stories/002-admin-sign-in-and-role-guards.md`)

### Enables
- ADM-05 Defection signals (`011-admin-operations/stories/005-defection-signals.md`)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Provider action without refund | Allowed |

## Out of Scope

- Owner appeals
