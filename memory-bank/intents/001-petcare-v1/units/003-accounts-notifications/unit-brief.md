---
unit: 003-accounts-notifications
intent: 001-petcare-v1
unit_type: vertical-slice (API + screens)
default_bolt_type: simple-construction-bolt
phase: inception
status: ready
created: 2026-10-29T14:30:00Z
updated: 2026-10-29T14:30:00Z
---

# Unit Brief: Accounts & Notifications

## Purpose

Who the person is and how the platform talks to them: phone-OTP sign-in for owners and providers, separate admin sign-in, roles, settings, the notification port, and one inbox per role. No native push.

**Why a separate unit:** Identity and messaging are used by every other unit; one sign-in, one inbox and one notification port keep the experience consistent and keep delivery failures from blocking business actions.

## Scope

### In Scope
- One /sign-in with phone OTP (routed by role); admin sign-in at /admin/sign-in; sessions
- Role guards for owner, provider and admin
- Settings (name, phone, language, notification choices)
- Notification port with Dummy adapter, delivery retry and failure visibility; scheduled sending for other units
- Inbox per role (merged page specs 5.5 and 5.9)

### Out of Scope
- Provider approval (Provider Supply & Vetting)
- Deciding when a business event happens (each domain unit raises its own)

---

## Assigned Requirements

Each in-scope FR belongs to exactly one unit; stories are created from these. DR items come from the approved requirements.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-31 | Admin role and authentication | Must |
| DR-1 | Phone-OTP sign-in (derived) | Must |
| DR-2 | OTP failure handling (derived) | Must |
| DR-3 | Role separation (derived) | Must |
| DR-20 | Notifications without native push (derived) | Must |
| DR-21 | Safe failure of the external ports this unit uses (derived) | Must |

Non-functional: NFR-6, NFR-13, NFR-15

**Screens (experience blueprint):** O2 Sign in, O9 Inbox, O10 Settings, provider and admin inbox/settings, admin sign-in

**Page specs used as the content source:** 1.2 Owner sign-in; 5.5 Notifications inbox; 5.9 Notifications center; 5.10 Settings

---

## Domain Concepts

### Key Entities
| Entity | Attributes |
|--------|------------|
| User | id, role, phone, name, neighbourhood, language |
| Session | token, role, expiry |
| AdminUser | id, credentials |
| Notification | recipient, type, language, body, link, status, read flag |

### Key Operations
- Request OTP
- Verify OTP and start session
- Admin sign-in
- Sign out
- Check role
- Update settings
- Send or schedule notification
- List inbox, mark read

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-platform-foundation | UI kit, shell, DB, clock |
| 002-dummy-integration-services | SMS/OTP and Notification APIs |

### Depended By
| Unit | Reason |
|------|--------|
| 004-pet-care-profile | owner identity |
| 005-provider-supply-vetting | roles |
| 006-search-capacity | roles |
| 007-payments-payouts | roles |
| 008-booking-stay | roles, notifications, reminders |
| 009-reviews-disputes | roles, notifications |
| 010-acute-event-response | roles, notifications |
| 011-admin-operations | admin role |

### External Dependencies
| System | Purpose |
|--------|---------|
| SMS/OTP provider (Dummy) | see system-context.md |
| Notification channel (Dummy) | see system-context.md |

---

## Technical Context

Follows `memory-bank/standards/` and the approved training decisions. Business-rule values come only from the configuration module (Platform Foundation). Screens follow [experience-blueprint.md](../../experience-blueprint.md).

---

## Success Criteria

### Functional
- [ ] Wrong, expired or reused code refused; OTP service down fails safely with retry
- [ ] Cross-role API access returns an authorization error
- [ ] A notification delivery failure never blocks the triggering action; failures visible to admin
- [ ] No Bangla in admin UI

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
| ACC-01 | [Sign in with phone OTP](stories/001-sign-in-with-phone-otp.md) | must | UJ-1 | Planned |
| ACC-02 | [Admin sign-in and role guards](stories/002-admin-sign-in-and-role-guards.md) | must | UJ-3 | Planned |
| ACC-03 | [Notification port and delivery](stories/003-notification-port-and-delivery.md) | must | all | Planned |
| ACC-04 | [Inbox](stories/004-inbox.md) | should | UJ-1 | Planned |
| ACC-05 | [Settings](stories/005-settings.md) | should | none | Planned |

## Bolts

| Bolt | Type | Stories | Phase |
|------|------|---------|-------|
| [004-accounts-notifications](../../../../bolts/004-accounts-notifications/bolt.md) | simple-construction-bolt | ACC-01, ACC-02, ACC-03 | Thin slice |
| [016-accounts-notifications](../../../../bolts/016-accounts-notifications/bolt.md) | simple-construction-bolt | ACC-04, ACC-05 | UJ-1 complete |
