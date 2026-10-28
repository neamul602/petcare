---
unit: 008-booking-stay
intent: 001-petcare-v1
unit_type: vertical-slice (API + screens)
default_bolt_type: ddd-construction-bolt
phase: inception
status: ready
created: 2026-10-29T14:30:00Z
updated: 2026-10-29T14:30:00Z
---

# Unit Brief: Booking & Stay

## Purpose

The spine of the product and its two booking pages: the state machine from request to completion, provider confirm or structured decline, cancellations and no-shows, the stay itself (daily updates, chat, vet clinics), and Book again.

**Why a separate unit:** The booking lifecycle is a domain, not a screen; keeping the stay in the same unit matches the one-booking-one-page experience and keeps every booking state in one model.

## Scope

### In Scope
- Book flow (pet & dates, care plan, review & pay) with authorization through Payments & Payouts; Book again pre-filled with the under-4-minute timer
- State machine, transition log, confirmation-window timeout (TD-1), stay-start check (TD-12), cancellation and no-show paths (TD-6)
- Owner booking page and provider booking page, both state-driven (experience blueprint O6, P3)
- Provider Today and Bookings lists; request view with care history; confirm or decline with one reason (TD-9)
- Daily updates (photo + note, immutable, 18:00 reminder via the notification port), booking chat, vet-clinic directory per neighbourhood
- Provider marks complete; owner confirms completion

### Out of Scope
- Money movement (Payments & Payouts)
- Review and report content (Reviews & Disputes; shown as sections of the booking page)
- Acute-event handling (Acute-Event Response; shown as a banner and sheet)

---

## Assigned Requirements

Each in-scope FR belongs to exactly one unit; stories are created from these. DR items come from the approved requirements.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-14 | Booking state machine | Must |
| FR-15 | Booking request and authorization | Must |
| FR-16 | Provider confirmation | Must |
| FR-17 | Structured decline | Must |
| FR-18 | Stay period, confirmation-to-stay SLA | Must |
| FR-19 | Completion, capture-to-payout | Must |
| FR-43 | Daily updates | Must |
| FR-44 | Booking-scoped chat | Must |
| FR-45 | Vet-clinic directory | Must |
| FR-48 | Owner repeat booking (Book again) | Must |
| FR-49 | Provider repeat tooling | Must |
| DR-10 | Offline-tolerant submit (derived) | Must |
| DR-11 | Cancellation and no-show transitions (TD-6) (derived) | Must |
| DR-12 | Confirmation-window timeout (TD-1) (derived) | Must |
| DR-21 | Safe failure of the external ports this unit uses (derived) | Must |

Non-functional: NFR-8, NFR-22, NFR-5 (health checks only)

**Screens (experience blueprint):** O5 Book, O6 Booking, O7 Bookings, P1 Today, P3 Booking, P4 Bookings

**Page specs used as the content source:** 1.6 Booking configuration; 1.7 Submission + payment; 1.8 Booking confirmation; 2.2 Book again; 3.1 Provider dashboard; 3.3 Incoming request; 3.4 Confirmation decision; 3.5 In-stay management; 3.6 Daily update composer; 3.7 Booking completion; 5.1 In-stay view (owner)

---

## Domain Concepts

### Key Entities
| Entity | Attributes |
|--------|------------|
| Booking | owner, provider, pet snapshot, dates, nights, care plan, services, price, state, decline reason, deadlines |
| Booking state log | from, to, trigger, time |
| Daily update | booking, day, photos, care log, note |
| Chat message | booking, sender, text, time |
| Vet clinic | name, address, phone, hours, species, neighbourhood |

### Key Operations
- Create request
- Cancel
- Confirm
- Decline with reason
- Time out
- Start stay
- Post update
- Send message
- List vet clinics
- Mark complete
- Owner confirm completion
- Book again

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-platform-foundation | UI kit, config, clock |
| 003-accounts-notifications | roles, notifications, reminders |
| 004-pet-care-profile | pet and care plan snapshot, history |
| 005-provider-supply-vetting | provider and price |
| 006-search-capacity | reserve and release nights |
| 007-payments-payouts | authorize, capture, release |
| 002-dummy-integration-services | Photo API for updates |

### Depended By
| Unit | Reason |
|------|--------|
| 009-reviews-disputes | completed bookings, updates and chat for investigation |
| 010-acute-event-response | in-stay booking, vet clinics |
| 011-admin-operations | awaiting confirmation, in stay, completed |

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
- [ ] Illegal transitions rejected; every transition logged
- [ ] Nothing captured at request; capture only on confirmation
- [ ] Timeout releases authorization and notifies the owner
- [ ] Updates only during in-stay, never editable; completion never blocked by missed updates
- [ ] Book again submitted in under 4 minutes, timed in-app

### Non-Functional
- [ ] Meets the NFRs listed above
- [ ] Required transition, payment and admin events are logged

### Quality
- [ ] Unit, API and integration tests pass; this unit's E2E steps pass
- [ ] Acceptance criteria met; code reviewed

---

## Story Summary

- **Total Stories**: 18
- **Must Have**: 16
- **Should Have**: 2
- **Could Have**: 0

| Code | Story | Priority | Journeys | Status |
|------|-------|----------|----------|--------|
| BKG-01 | [Booking state machine](stories/001-booking-state-machine.md) | must | all | Planned |
| BKG-02 | [Book: pet, dates and care plan](stories/002-book-pet-dates-and-care-plan.md) | must | UJ-1 | Planned |
| BKG-03 | [Review and submit with payment](stories/003-review-and-submit-with-payment.md) | must | UJ-1, UJ-4 | Planned |
| BKG-04 | [Owner booking page: waiting](stories/004-owner-booking-page-waiting.md) | must | UJ-1 | Planned |
| BKG-05 | [Provider Today and Bookings](stories/005-provider-today-and-bookings.md) | must | UJ-2 | Planned |
| BKG-06 | [Provider request view](stories/006-provider-request-view.md) | must | UJ-1, UJ-2, UJ-4 | Planned |
| BKG-07 | [Confirm a request](stories/007-confirm-a-request.md) | must | UJ-1, UJ-2 | Planned |
| BKG-08 | [Decline with a reason](stories/008-decline-with-a-reason.md) | must | UJ-2 | Planned |
| BKG-09 | [Confirmation-window timeout](stories/009-confirmation-window-timeout.md) | must | UJ-1 | Planned |
| BKG-10 | [Start the stay](stories/010-start-the-stay.md) | must | UJ-1 | Planned |
| BKG-11 | [Cancellations and no-shows](stories/011-cancellations-and-no-shows.md) | should | none | Planned |
| BKG-12 | [Daily updates](stories/012-daily-updates.md) | must | UJ-1, UJ-2 | Planned |
| BKG-13 | [Booking chat](stories/013-booking-chat.md) | must | UJ-1 | Planned |
| BKG-14 | [Vet-clinic directory](stories/014-vet-clinic-directory.md) | must | UJ-1 | Planned |
| BKG-15 | [Mark complete and confirm completion](stories/015-mark-complete-and-confirm-completion.md) | must | UJ-1 | Planned |
| BKG-16 | [Book again](stories/016-book-again.md) | must | UJ-4 | Planned |
| BKG-17 | [Owner bookings list](stories/017-owner-bookings-list.md) | should | UJ-4 | Planned |
| BKG-18 | [Owner booking page during the stay](stories/018-owner-booking-page-during-the-stay.md) | must | UJ-1 | Planned |

## Bolts

| Bolt | Type | Stories | Phase |
|------|------|---------|-------|
| [009-booking-stay](../../../../bolts/009-booking-stay/bolt.md) | ddd-construction-bolt | BKG-01, BKG-02, BKG-03, BKG-04 | Thin slice |
| [010-booking-stay](../../../../bolts/010-booking-stay/bolt.md) | ddd-construction-bolt | BKG-05, BKG-06, BKG-07, BKG-08, BKG-09 | Thin slice |
| [011-booking-stay](../../../../bolts/011-booking-stay/bolt.md) | ddd-construction-bolt | BKG-10, BKG-12, BKG-13, BKG-14, BKG-18 | UJ-1 complete |
| [013-booking-stay](../../../../bolts/013-booking-stay/bolt.md) | ddd-construction-bolt | BKG-15, BKG-11 | UJ-1 complete |
| [017-booking-stay](../../../../bolts/017-booking-stay/bolt.md) | simple-construction-bolt | BKG-16, BKG-17 | UJ-4 |
