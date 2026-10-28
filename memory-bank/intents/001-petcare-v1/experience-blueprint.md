---
intent: 001-petcare-v1
phase: inception
status: approved
created: 2026-10-29T14:00:00Z
updated: 2026-10-29T14:00:00Z
---

# Experience Blueprint: PetCare v1

**Goal:** keep the product simple to use and simple to build. The 43 page specs describe the experience in detail; this blueprint folds them into **24 screens** with one navigation model per role. Every function in the page specs stays; what changes is how many places a person has to look. The page specs remain the source for content, states and copy (EN + BN); this blueprint decides **where** each piece lives.

Sources: approved [requirements.md](requirements.md), [ui-analysis.md](ui-analysis.md) (UC-1..UC-25), `docs/ux/EXPERIENCE.md`, `docs/ux/DESIGN.md`.

## 1. Experience principles

1. **One booking, one page.** A booking has a single page for each role that changes with its state (waiting, confirmed, in stay, completed, disputed). Nobody hunts across screens for updates, chat, the vet list, the review or the report.
2. **One primary action per screen**, in the sticky action bar at the bottom. Secondary actions are links, never a second big button.
3. **Always show the next step and its deadline** ("Rashid has until 14:30 to confirm"; "You can report a problem until Sunday 18:00").
4. **Two taps to anything** from a tab: tab, then item.
5. **Book again is the same flow, pre-filled,** not a separate path. Pre-filled values are marked "from Tito's last stay" and stay editable.
6. **Plain, calm language,** Bangla first with English one tap away; admin is English only.
7. **Honest by default:** no invented ratings, counts or promises. A new provider says "New to PetCare. Building a track record."
8. **Never block on optional things:** missed daily updates, missing photos and slow connections never stop a booking.
9. **Works on a weak connection:** forms keep what was typed; a submit made offline is sent once when back online.
10. **Coral means an acute event, nothing else.** Green is the main brand colour; status is always colour plus text.

## 2. Navigation

| Role | Navigation | Tabs or menu |
|---|---|---|
| Owner | Bottom tab bar (mobile), top bar on desktop | **Home** · **Bookings** · **Pets** · **Inbox**; Settings in the header menu; language toggle in the header |
| Provider | Bottom tab bar | **Today** · **Calendar** · **Bookings** · **Earnings** · **Profile**; Inbox and Settings in the header menu |
| Admin | Left sidebar (collapses to a menu on phones) | **Queue** · **Providers** · **Reviews** · **Payouts** · **Insights** · **Audit log** |

Everyone signs in at one place: owners and providers with phone OTP at `/sign-in` (routed by role after sign-in), admin at `/admin/sign-in`.

## 3. Screens

### Owner (10 screens)

| ID | Screen | Route | What it does | Page specs folded in |
|---|---|---|---|---|
| O1 | Home | `/` | Guests: the promise and "Find care". Signed in: search (neighbourhood, dates, species) and a **Book again** card for the last stay | 1.1 |
| O2 | Sign in | `/sign-in` | Phone, code, name, neighbourhood | 1.2 |
| O3 | Results | `/search` | 3-5 curated providers, each with why it is shown (tier, area, every night free); "View all approved" | 1.3 |
| O4 | Provider | `/providers/:slug` | Photos, services, price, capability flags, availability for the chosen dates, verified reviews | 1.4 |
| O5 | Book | `/book/:providerSlug` | One flow, three steps: **Pet & dates**, **Care plan**, **Review & pay** (authorize only). Book again opens it pre-filled with the timer | 1.6, 1.7, 2.2 |
| O6 | Booking | `/bookings/:id` | State-driven page: waiting (countdown, cancel), confirmed, in stay (updates, chat, vet clinics, acute banner), completed (confirm completion, review), report a problem, moderation result | 1.8, 5.1, 5.2, 5.3, 5.4 |
| O7 | Bookings | `/bookings` | Upcoming and past; Book again on past stays | (implied by 1.8, 2.2) |
| O8 | Pets | `/pets`, `/pets/:id`, `/pets/:id/edit` | Pet list; pet page with **Profile** and **Care history** tabs; edit form | 1.5, 2.1 |
| O9 | Inbox | `/inbox` | Notifications, newest first, each linking to its booking | 5.5, 5.9 |
| O10 | Settings | `/settings` | Name, phone, language, notification choices | 5.10 |

### Provider (6 screens + shared Inbox and Settings)

| ID | Screen | Route | What it does | Page specs folded in |
|---|---|---|---|---|
| P1 | Today | `/provider` | Requests waiting for a decision (with deadline), stays in progress, today's update reminders | 3.1 |
| P2 | Calendar | `/provider/calendar` | Capacity per night and species; peak presets; can't go below confirmed | 3.2 |
| P3 | Booking | `/provider/bookings/:id` | State-driven page: request with the pet's care history, then **Confirm** or **Decline** (reason sheet); in stay: **Post update** (sheet), chat, vet clinics, **Report a concern** (sheet); **Mark complete** | 3.3, 3.4, 3.5, 3.6, 3.7, 5.7 |
| P4 | Bookings | `/provider/bookings` | Requests, upcoming, in stay, past (fills the missing list noted in UC-18) | (gap) |
| P5 | Earnings | `/provider/earnings` | Payouts by week: gross, commission, net, status (queued, paid, frozen) | 3.10, 5.6 |
| P6 | Profile | `/provider/profile` | Edit profile and capability flags; **Care record** tab (stays completed, by care need) | 3.8, 3.9 |

### Admin (8 screens, English only)

| ID | Screen | Route | What it does | Page specs folded in |
|---|---|---|---|---|
| A1 | Queue | `/admin` | One list by urgency: acute events, reports, awaiting provider confirmation, in stay; separate counts for applications and reviews to moderate; ceiling banner when near | 4.1 |
| A2 | Acute event | `/admin/acute/:id` | Runbook steps, timeline, vet clinics, send owner message (BN/EN template), timers, close with post-mortem; **Post-mortems** list as a tab | 4.2, 4.9 |
| A3 | Report | `/admin/reports/:id` | Booking record, history, updates, chat, reviews; resolve: no action, refund (amount), provider action | 4.6 |
| A4 | Providers | `/admin/providers`, `/admin/providers/:id` | List with health and utilization flags and defection signals; provider page with application review and vetting, tier, status actions, re-engagement notes | 4.3, 4.4, 4.10, 5.8 |
| A5 | Reviews | `/admin/reviews` | Moderation for cause: remove with reason | 4.7 |
| A6 | Payouts | `/admin/payouts` | Weekly batches, frozen payouts, reconciliation; "run batch now" for demos | 4.8 |
| A7 | Insights | `/admin/insights` | Operating ceiling (25 providers, 75 completed bookings a month) and bookings per neighbourhood | 4.5 |
| A8 | Audit log | `/admin/audit` | Read-only list of every admin action | (EXPERIENCE `/admin/audit`) |

**Shared states (not screens):** error, empty, loading and offline patterns from 5.11, 5.12, 5.13 are built once as components and used by every screen.

All 43 page specs are covered: 1.1-1.8, 2.1-2.2, 3.1-3.10, 4.1-4.10 and 5.1-5.13 each appear above.

## 4. Key journeys and their effort

| Journey | Path | Taps to the key action |
|---|---|---|
| **UJ-1** First booking (Bibi) | O1 Home → O3 Results → O4 Provider → O5 Book (3 steps, pet profile created inline if missing) → O6 Booking (waiting) | Search 1, choose 1, book 3 steps |
| **UJ-4** Book again | O1 Book-again card (or O7) → O5 pre-filled → Review & pay → O6 | 3 taps plus any edits; timer target under 4 minutes |
| **UJ-2** Provider confirms (Rashid) | P1 Today → P3 request → Confirm | 2 taps |
| **UJ-2** Eid capacity | P2 Calendar → select nights → set 4 | 3 taps |
| **UJ-2** Daily update | P1 reminder → P3 → Post update sheet | 2 taps, then photo and note |
| **UJ-3** Acute event (Ayaat) | A1 top row → A2 runbook → step through | 1 tap to the runbook |
| Report a problem (owner) | O6 Booking → "Report a problem" | 1 tap, then the form |

## 5. What this removes or defers (with reasons)

| Item from the page specs | Decision | Why |
|---|---|---|
| Separate pages for waiting, in stay, completion, review, report, moderation result (owner) | One state-driven booking page (O6) | Fewer places to look; same functions |
| Separate pages for request, decision, in stay, update composer, completion, acute trigger (provider) | One booking page (P3) with sheets | Same |
| Two notification pages (5.5, 5.9), two payout pages (3.10, 5.6), two defection dashboards (4.10, 5.8) | One each | Duplicates |
| Provider health (4.4) and defection (4.10/5.8) as separate dashboards | Flags on the provider list (A4) | One place to judge a provider |
| Post-mortem log (4.9) as a section | Tab on the acute-event screen (A2) | Context stays with the event |
| Fit sort, distance sort, "proven provider" filter, provider nudges, review appeals, saved searches | Not built | UC-4, UC-5, UC-6, UC-9, UC-10; saved search adds a feature not in the PRD |
| Runbook version history and pattern detection (4.9) | Not built in v1 | Beyond FR-30; plain editable templates are enough (FR-34) |

## 6. Rules for building screens

- Each screen lists its **one primary action**, its **states** (loading, empty, error, offline, plus domain states) and its **BN/EN strings** in the story that builds it.
- Copy comes from the page-spec content blocks; anything that is an invented number, name or promise is replaced by real data or removed.
- Every screen works at 390 px first; admin screens also work at 1280 px.
- Routes are exactly as in section 3 (resolves UC-17).
