---
intent: 001-petcare-v1
phase: inception
status: approved
created: 2026-10-29T09:00:00Z
updated: 2026-10-29T15:00:00Z
---

# UI/UX Functional Analysis: PetCare v1

The supplied UI/UX is treated as a **functional specification**. Nothing here is a redesign and no application code was written. Sources: `docs/ux/DESIGN.md`, `docs/ux/EXPERIENCE.md`, 18 mockups plus `index.html` and one component spec, `prototype/index.html`, `demo/index.html`, and the **43 page specs** in `docs/scenarios/`.

## 0. How this was produced and how to read it

- Six analysts each read their sources in full and wrote a detailed working file in [`ui-analysis/`](ui-analysis/): `scenario-01.md` (pages 1.1-1.8), `scenario-02.md` (2.1-2.2), `scenario-03.md` (3.1-3.10), `scenario-04.md` (4.1-4.10), `scenario-05.md` (5.1-5.13), `design-system-and-prototype.md`. Those files hold the per-page 14-field blocks (components, actions, states, data, transitions, validation, integrations, rules, language, assumptions, questions). **This document is the synthesis.** Use the working files for page-level detail.
- **Authority order for this build** (Intent §2, Requirements §0): brief, PRD, **approved Requirements and Training Decisions (TD-1..TD-16)**, then DESIGN/EXPERIENCE, then page specs, then mockups, then prototype. Where a page spec states a value the approved decisions already settle, the decision wins and the spec value is recorded here as a mismatch (section 10).
- **Page specs cite FR numbers from an earlier numbering** that does not match `prd.md` (examples: FR-22, FR-24, FR-26, FR-43, FR-44, FR-49). All traceability in this document uses **PRD IDs**.
- Everything marked *(inferred)* in the working files is an analyst inference, not source text.

---

## 1. Screen inventory (all 43 page specs)

"Mockup" means a supplied HTML mockup exists; "spec-only" means only the written page spec exists (27 of 43). Routes are as written in each page spec; they conflict in places (see UC-17).

### Scenario 1: Owner first booking (UJ-1)
| ID | Page | Role | Route (spec) | Mockup |
|---|---|---|---|---|
| 1.1 | Landing / marketing home | visitor/owner | `/` | `01-home` is a logged-in home, not the landing: effectively spec-only |
| 1.2 | Owner sign-in (phone OTP) | owner | `/sign-in` | spec-only |
| 1.3 | Curated 3-5 shortlist | owner | `/search`, `/search/all` | `13-curated-shortlist` (+ component spec); `02-search-results` superseded |
| 1.4 | Provider profile (public) | owner | `/providers/[slug]` | `03-provider-profile` (content differs) |
| 1.5 | Pet profile management | owner | `/pets/new`, `/pets/[petId]/edit` | `15-pet-profile-management` |
| 1.6 | Booking configuration | owner | `/book/[providerSlug]/configure` | `04-booking-configuration` (content differs) |
| 1.7 | Booking submission + payment authorization | owner | `/book/[providerSlug]/review` | `17-booking-submission-payment` |
| 1.8 | Booking confirmation (waiting on provider) | owner | `/bookings/[bookingId]` | spec-only for waiting state; `05-booking-confirmation` shows the confirmed state |

### Scenario 2: Book again (UJ-4)
| ID | Page | Role | Route | Mockup |
|---|---|---|---|---|
| 2.1 | Pet care-history view | owner | `/pets/:petId/care-history` | `21-care-history-view` |
| 2.2 | Book-again path | owner | `/bookings/book-again?petId=&providerId=` | `22-book-again-path` |

### Scenario 3: Provider (UJ-2)
| ID | Page | Role | Route | Mockup |
|---|---|---|---|---|
| 3.1 | Provider dashboard | provider | `/provider/dashboard` | spec-only (partly in `07`) |
| 3.2 | Date-level capacity calendar | provider | `/provider/calendar` | `07-provider-calendar` |
| 3.3 | Incoming booking request | provider | `/provider/requests/:requestId` | spec-only |
| 3.4 | Confirmation decision (modal) | provider | `.../decision` | spec-only |
| 3.5 | In-stay management | provider | `/provider/bookings/:bookingId/in-stay` | `35-in-stay-management` |
| 3.6 | Daily update composer (modal) | provider | `.../updates/new` | `36-daily-update-composer` |
| 3.7 | Booking completion | provider | `/provider/bookings/:bookingId/complete` | spec-only |
| 3.8 | Provider profile editor | provider | `/provider/profile/edit` | spec-only |
| 3.9 | Care-record / demonstrated-fit history | provider | `/provider/care-record` | spec-only |
| 3.10 | Payouts + earnings | provider | `/provider/payouts` | spec-only |

### Scenario 4: Admin (UJ-3)
| ID | Page | Role | Route | Mockup |
|---|---|---|---|---|
| 4.1 | Admin queue dashboard | admin | `/admin/queue` | `06-admin-queue` (large divergence from spec) |
| 4.2 | Acute-event runbook | admin | `/admin/runbook/:eventId` | `42-acute-event-runbook` |
| 4.3 | Provider application review | admin | `/admin/applications/:applicationId` | spec-only |
| 4.4 | Provider health | admin | `/admin/providers` | spec-only |
| 4.5 | Operating-ceiling dashboard | admin | `/admin/ceiling` | spec-only (a tile in `06`) |
| 4.6 | Dispute investigation | admin | `/admin/disputes/:disputeId` | spec-only |
| 4.7 | Review moderation queue | admin | `/admin/reviews/moderation` | `47-review-moderation-queue` |
| 4.8 | Payout reconciliation | admin | `/admin/payouts/reconciliation` | spec-only |
| 4.9 | Post-mortem practice log | admin | `/admin/postmortems` | spec-only |
| 4.10 | Off-platform defection dashboard | admin | `/admin/defection` | spec-only |

### Scenario 5: In-stay, completion, issues, cross-cutting
| ID | Page | Role | Route | Mockup |
|---|---|---|---|---|
| 5.1 | In-stay view (owner) | owner | `/owner/stays/:bookingId/in-stay` | spec-only |
| 5.2 | Completion + review | owner | `/owner/stays/:bookingId/complete` | spec-only |
| 5.3 | Issue report | owner | `/owner/stays/:bookingId/report` | spec-only |
| 5.4 | Review moderation result | owner (admin side = `47`) | `/owner/reviews/:reviewId/moderation` | spec-only |
| 5.5 | Notifications inbox (owner) | owner | `/owner/notifications` | spec-only |
| 5.6 | Payouts + earnings view | provider | `/provider/payouts` | spec-only (overlaps 3.10) |
| 5.7 | Acute-event trigger | provider | `/provider/stays/:bookingId/report-event` | `57-acute-event-trigger` (and older `08-acute-event`) |
| 5.8 | Defection detection dashboard | admin | `/admin/defection` | spec-only (overlaps 4.10) |
| 5.9 | Notifications center (cross-role) | all | `/{role}/notifications` | spec-only (overlaps 5.5) |
| 5.10 | Settings / profile | all | `/{role}/settings` | spec-only |
| 5.11 | Error states | all | inline | spec-only (templates in text) |
| 5.12 | Empty states | all | inline | spec-only |
| 5.13 | Loading skeletons | all | inline | spec-only |

**Coverage:** 16 of 43 pages have a mockup (1.1 partial, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8 partial, 2.1, 2.2, 3.2, 3.5, 3.6, 4.1, 4.2, 4.7, 5.7). **27 are spec-only:** 1.2, 3.1, 3.3, 3.4, 3.7-3.10, 4.3-4.6, 4.8-4.10, 5.1-5.6, 5.8-5.13. Mockups 06, 42 and 47 are desktop (1280 px); all others are 390 px mobile.
**Overlapping or duplicated surfaces to merge at build** (all screens are consolidated in [experience-blueprint.md](experience-blueprint.md)): 3.10 and 5.6 (provider payouts), 4.10 and 5.8 (defection dashboard), 5.5 and 5.9 (notifications), and mockups 08/57 (acute trigger), 02/13 (search). The scenarios folder describes 11 pages for scenario 1 but only 8 are specified.

**Implied supporting pages that no spec defines** (gaps, not to be invented without your decision): owner dashboard (drafts, saved searches, active bookings), reviews list/lightbox, full catalog `/search/all` view details, filter modal, cancellation policy page, provider sign-in, provider payout-account setup, provider list of confirmed/completed bookings (nothing links to 3.7), admin sign-in, audit-log page (EXPERIENCE routes `/admin/audit`; no page spec).

---

## 2. UI components

Full inventory (28 components with variants, states, tokens) is in `ui-analysis/design-system-and-prototype.md` §A-B. Summary of what must be built, grouped, with owner roots:

| Group | Components | Used by |
|---|---|---|
| Base | Button (primary, secondary, ghost, destructive; sizes), Card, Input, Badge, Filter Chip + Summary Chip, Toggle (primary-soft), Sticky Action Bar (6-7 variants) | all |
| Trust and supply | Tier-A Provider Badge (Admin-introduced), Tier-B Marker, Provider Card, Demonstrated Fit Card, Verified Review Card, Availability Pill, Date-Level Capacity Cell | owner, provider |
| Booking and money | Booking State Indicator (pill), Payout State Indicator, Care Configuration Field Group | owner, provider, admin |
| Stay | Chat Bubble, Vet-Clinic Directory Entry, Acute-Event Trigger Banner | owner, provider, admin |
| Admin | Queue Dashboard Row, Pattern Detection Card, SM-C3 Protection Banner, Counter-Metric Header Card, Defection Signal Dot | admin |
| System | Error State Illustrations (page 5.11), empty states (5.12), loading skeletons (5.13), offline banner | all |

**Components used by mockups but not defined in DESIGN.md** (must be specified from the page specs): bottom sheet, step indicator, stat tile, segmented control, runbook timeline/step list, moderation action bar with acknowledgement, photo uploader, skeleton, offline banner, language toggle.

**Tokens** (colors with HSL and CSS variable names, typography, spacing, radii, elevation) are in the working file §B and map to a Tailwind config skeleton. Discipline: forest green primary; coral **only** for the acute state; single light theme; Inter / Noto Sans Bengali / Source Serif 4. Note DESIGN.md itself uses green for many meanings (success, Tier-A, verified, captured...) and coral for a few non-acute uses (admin chat bubble, provider defection dot): needs an explicit allowed-uses list (UC-21). Some amber/muted text pairings are probably below WCAG AA and must be measured before build (UC-22).

---

## 3. User actions (by role)

**Owner:** sign in with phone OTP and resend; set display name and default neighborhood; search by neighborhood, dates and species; sort and filter; "View all providers"; open provider profile, open reviews/photos, save provider, save search; create/edit/archive pet profile with structured care fields and photos; configure booking (dates, pet, food and medication "use saved" toggles, services, instructions, emergency contact); review and **authorize payment** (bKash, Nagad, card); cancel a request before confirmation; follow booking state; read daily updates; chat; open vet directory; confirm completion and **review** (rating, text, photos); **report an issue** with evidence; view moderation result and appeal (spec; see UC-5); **Book again**; view care history; read notifications; change settings.
**Provider:** view dashboard; adjust per-date capacity (presets, bulk, peak windows); open incoming request; **confirm or decline with a structured reason**; start/manage stay; post daily update (photos, structured care log) as an immutable record; chat; open vet directory; **report an acute event**; mark stay complete; edit profile and capability flags; view care record; view payouts and earnings.
**Admin:** work the urgency queue; run acute-event runbook steps (advance/skip with note), add timeline entries, send templated owner notification; write post-mortem; review provider applications (7 criteria), request info, approve or decline; view provider health and flag follow-up; view operating ceiling and apply throttle; investigate dispute and resolve; moderate reviews (approve/edit/remove with reason); reconcile payouts and escalate mismatches; start defection interventions; view audit log.
Per-page action tables: working files, field 4 of every page block.

---

## 4. Application states

| State family | Defined states | Source |
|---|---|---|
| **Booking lifecycle** | requested, authorized, captured, confirmed-to-stay (EXPERIENCE only), in-stay, completed, declined, disputed, refunded; PRD adds resolved, canceled, no-show; pill colour per state | EXPERIENCE, DESIGN, FR-14 (conflict UC-7) |
| **Payout** | released, pending, frozen, hold | DESIGN, 4.8 |
| **Connectivity** | online-fast, online-slow (sync queued), offline (cached read, held submit, banner) | EXPERIENCE, NFR-15, 5.11-5.13 |
| **Care history** | empty ("first stay", no fake content), populated (dense list), retained 24 months | EXPERIENCE, FR-7, FR-10 |
| **Acute event** | trigger form, vet directory shown, owner banner on next visit, payout freeze silent to provider, runbook steps 1-7 (done/active/pending/skipped), active/resolved | EXPERIENCE, 4.2, 5.7, mockup 42 |
| **Disputes** | open, awaiting provider response, resolution ready, closed; outcomes No Action / Refund / Provider Action | EXPERIENCE, 4.6 (intermediate states not named in EXPERIENCE) |
| **Queue priority** | P1 acute (coral), P2 dispute (red), P3 awaiting vetting (amber), P4 in-stay (forest) | EXPERIENCE (conflict UC-2) |
| **Provider status** | applied, vetting, approved, suspended, removed (+ awaiting_info, declined for applications) | FR-2, 4.3 |
| **Review moderation** | pending, approved, edited, removed (+ automated flags: clean, low-effort, profanity, off-topic) | 4.7, 5.4 (conflict UC-9) |
| **Availability / capacity** | available, partial, full; capacity cell empty, partial, full, peak | DESIGN |
| **Counter-metric** | healthy, watch, breached | 5.8 |
| **Search list** | idle, loading, skeleton, cached, error, empty | spec 13 |
| **Per-page variants** | every page spec lists default, loading, empty, error, offline, success; transactional pages 5.2, 5.3, 5.7 lack offline/error/loading definitions (gap) | 5.11-5.13 |

---

## 5. Data displayed

Consolidated entities with the fields the screens show (full lists in the working files, sections B). Fields marked * are **derived** and must be computed from real records.

| Entity | Fields shown |
|---|---|
| Owner / User | name, phone (verified), neighborhood, language, notification preferences |
| Provider | name (EN/BN), tier, Admin-introduced badge, neighborhood, photos, years hosting*, price per night, services (name, unit, price), capability flags, facility details, vet clinic on call, response time*, profile completeness*, review aggregate*, repeat-owner count* |
| DateCapacity | provider, date, species, slots total, slots free*, peak flag, note |
| Pet | name, photos, species, breed, age, weight, sex, neutered, vaccination, energy, good-with, triggers; conditions, medications, diet, special attention, vet contact |
| Booking | id, owner, provider, pet snapshot, dates, nights, care configuration snapshot, services, price breakdown, state, state log, decline reason, confirmation deadline |
| Payment authorization / capture | method, amount, gateway reference, status, timestamps |
| Daily update | day number, timestamp, photos, structured care log (insulin, kibble, behaviour, concerns), note; immutable |
| Chat message | booking, sender, text, time |
| Vet clinic | name, address, phone, hours, species handled, distance |
| Review | rating, text, photos, reviewer first name, stay dates, tags, status |
| Report / dispute | category, description, evidence, status, window end, provider response, resolution, rationale |
| Payout | gross, commission rate and amount, net, status, freeze reason, batch date, MFS settlement status |
| Acute event | type, severity, time, observation, steps, timeline, owner notification time, post-mortem |
| Admin | queue items, ceiling snapshot, application criteria, provider health, defection aggregates, audit log entries |
| Demonstrated fit* | counts such as "diabetic small dogs handled" (needs an admin-verified definition of "successfully", UC-8) |

---

## 6. Data required (inputs captured)

- **Sign-in:** phone (+880), 6-digit OTP, display name, default neighborhood.
- **Pet profile:** species, breed, age, weight, sex, neutered, vaccination status, energy level, good-with, triggers; species-conditional fields; conditions (name, duration, severity, vet contact, daily care notes <= 500); medications (name+dose, frequency, route, notes); diet (type, brand, schedule, treats, allergies); special attention; photos (1-5, <= 5 MB).
- **Booking configuration:** dates, pet, food source (saved or override), medication source (saved or override), selected services (quantities undefined), special instructions (<= 1000), emergency contact, payment method.
- **Decline:** one reason from taxonomy (TD-9).
- **Capacity:** per-date total, dogs, cats, note (<= 200), peak presets.
- **Daily update:** photos (1-4, <= 5 MB), structured care log, behaviour tags, concerns.
- **Review:** rating 1-5 (required by PRD), text, photos, care-specific checks.
- **Report:** category (TD-13), description (>= 30 chars in spec), evidence (<= 5 files).
- **Acute event:** category/type, severity (TD-14), description (>= 20 chars in spec), immediate action, vet contacted.
- **Admin:** vetting criteria checkboxes, request-more-info, decline reason, dispute resolution (payout decision, amount, rationale), moderation decision and reason, runbook step notes, post-mortem fields, throttle settings.

---

## 7. State transitions (as the sources define them)

1. Owner submits: request is created and authorization placed -> `requested/authorized` (sources disagree whether `authorized` is shown separately).
2. Provider confirms -> payment captured -> `captured` -> `in-stay` on the start date (trigger of "confirmed-to-stay" is undefined).
3. Provider declines with reason, or timeout, or owner cancels before confirmation -> authorization released; `declined` (or canceled).
4. Provider marks complete -> `completed`; review window opens; payout becomes eligible.
5. Owner report within the dispute window -> `disputed`, payout `frozen`; admin resolution -> `resolved` or `refunded`; independent Provider Action.
6. Acute event -> admin P1 queue entry, payout freeze, owner banner on next visit. EXPERIENCE and mockups 08/57 say booking becomes `Disputed`; FR-29 says freeze + early dispute window + provider flag (UC-8).
7. Review: submit -> published, admin removal for cause (FR-23) versus 4.7 pre-moderation (UC-9).
8. Provider application: applied -> vetting -> approved or declined; approved -> suspended or removed.
These resolve into the formal state machine in Step 24.

---

## 8. Validation behaviour (as specified)

OTP: 6 digits, 60 s resend cooldown, delayed-SMS handling (5.11). Pet profile: required fields per species, photo 1-5 and <= 5 MB, text limits. Booking: dates vs capacity re-checked on every change and blocked at submission; pet and configuration required; payment method required. Decline: reason required (spec adds a free-text field, conflicts FR-17). Review: gated on completion, one per booking, spec requires min text 20 and at least one photo (PRD: photo optional). Report: description >= 30 chars, <= 5 evidence files, refused after window. Acute event: description >= 20. Capacity: lowering below confirmed bookings refused. Errors inline with `role="alert"`, never toasts. Form input persists to local storage on blur; submit only on explicit action.

---

## 9. Integration points (mapped to the five Dummy APIs)

| Integration | Where used | What the UI needs |
|---|---|---|
| **SMS/OTP** | 1.2, 5.10, 5.11 | send, resend, verify; delay handling |
| **Payment gateway** | 1.7, 1.8, 3.4, 4.6, 4.8 | authorize (bKash, Nagad, card), release on cancel/decline/timeout, capture on confirm, refund |
| **MFS payout** | 3.10, 5.6, 4.8 | batch, status, freeze/release, settlement status |
| **Notifications** | 1.8, 3.1, 5.1, 5.5, 5.7, 5.9, 4.2 | booking events, daily updates, acute event, re-engagement, reminders; no native push in v1 |
| **Photo storage** | 1.5, 3.6, 5.2, 5.3 | upload with progress and retry, fetch |

API operations the pages imply are listed per scenario in the working files (section C of each); consolidated groups: auth (OTP), search and provider read, pet profile, booking and availability, payment, in-stay (updates, chat, vet directory), completion and review, report and dispute, acute event, provider (capacity, requests, profile, payouts), admin (queue, vetting, ceiling, moderation, reconciliation, post-mortem, defection, audit), notifications and settings. No real gateway contracts are invented; the Dummy contracts are the Step 16 deliverable.

---

## 10. Business rules embedded in the design (and how they relate to approved decisions)

**Consistent with approved decisions or PRD:** capture on confirmation; one review per booking after completion; reviews independent of reports; report freezes payout; structured decline reasons required; capacity blocks at submission; 3-5 shortlist; no paid placement; admin audit log immutable; ceiling 1/25/75; under-4-minute book-again; post-mortem within 48 h; first admin timeline entry within 5 min.

**Spec values that conflict with approved Training Decisions (decision wins):**

| Spec value | Where | Approved value |
|---|---|---|
| Confirmation window 6 h (8-12 h in Eid peak), mockup 17 says 24 h, prototype 6 h response | 1.8, 3.3, mockup 17 | **TD-1: 24 h, 12 h in peak** |
| Dispute window 7 days | 5.3, 4.6, error templates | **TD-2: 72 h** |
| Payout cadence bi-weekly; 24 h payout in prototype | 3.10 | **TD-3: weekly Sunday batch** |
| Commission 15 % labelled Tier-A introductory | 3.7, 3.10, 5.6, 4.8 | **TD-8: Tier-A 10 % (8 % peak), Tier-B 16 %** |
| Free cancellation up to 48 h, then 50 % fee | mockup 17 | **TD-6** (no automatic fee) |
| Admin response SLA 48 h | 5.3 | not decided; treat as a copy promise needing a value (UC-14) |
| Platform service fee BDT 280 / 990 | mockup 05 / prototype | **TD-16**: no owner fee modelled; commission from provider payout only |
| Update reminder timing | scattered | **TD-11: one reminder at 18:00** |
| Acute-event categories and severities differ across 08, 57, 5.7, prototype | multiple | **TD-14** severity minor/serious/critical; event type per FR-26 |

---

## 11. Bangla / English content rules

- Bangla is the default with full parity on owner and provider screens; admin is English only (NFR-12, NFR-13). The page specs carry EN + BN content blocks; the BN block of 1.5 is marked "abbreviated, full strings at build time".
- The **language toggle**: EXPERIENCE says persistent footer; mockup 01 puts it in the header. Needs one position.
- **Numerals and currency are not specified**: pages mix Latin digits ("BDT 19,800", "৳ 5,600") and Bangla numerals (5.5, 5.7). One locale helper must define digits, currency symbol, date format, and Eid-relative labels ("Eid-1 -> Eid+9" has no resolution rule).
- Fonts: Noto Sans Bengali is the fallback; Inter has no Bengali glyphs; line-height and overflow rules for longer Bangla strings are absent from DESIGN.md. Self-host and subset fonts to protect the 500 KB budget.
- Several admin specs carry Bangla columns that conflict with NFR-13; only the **owner-facing notification template in 4.2** legitimately needs Bangla.
- Voice rules: calm, specific, plain, honest about uncertainty; no exclamation marks, no "sorry"; verb-first labels (EXPERIENCE) although many real labels are multi-word. Some internal references (spec section names, "Brief §3", "SM-C3") leaked into UI copy and must be removed.

---

## 12. Assumptions the design makes

Only the ones that affect the build:
1. Phone OTP is the only sign-in method (1.2 shows an email stub that routes to "Coming soon").
2. Authorization holds are possible (specs use "hold"); the PRD says the BD gateway landscape does not natively support card-style pre-auth, so the Dummy gateway models authorize-then-capture as a training contract (A-8).
3. The first search has data to rank (demonstrated fit counts exist at launch).
4. Real-time updates exist (polling intervals 30 s to 6 h are stated; web-push is promised in 1.8 while EXPERIENCE says no native push).
5. Admin works on a desktop at >= 1280 px (mockups) while the PRD says low-end phone (A-D5).
6. "Successfully handled" and "admin-verified" can be computed (no definition exists).
7. A provider can act on the acute event from a provider-side surface (5.7 / mockup 57), although 3.5 and 3.6 link to the admin runbook.
8. Owner can mark a stay complete (5.1 / 5.2) while the PRD says the provider does.

---

## 13. Questions the design cannot answer, and conflicts (decisions needed)

Each item states the sources, the impact, and a **proposed resolution**. The approved Requirements already settled C-1 to C-11; the items below are **new** or refine those. Nothing here changes approved text until you decide.

### Must decide before the Stories (they change scope)

| ID | Issue | Proposed resolution |
|---|---|---|
| **UC-1** | **Owner vs provider marks completion.** FR-19 says provider marks complete; 5.1/5.2 let the owner "Mark complete". Requirements A-D4 assumed owner confirms after provider. | Provider marks complete (3.7), owner confirms completion in 5.2 then reviews. Matches FR-19 plus UJ-1 step 7. |
| **UC-2** | Queue P3 and PRD order (C-2): "awaiting vetting" vs "awaiting provider confirmation"; 4.1 also treats the ceiling as 52/75 **in-stay** while FR-38 counts **completed bookings per month**; near-ceiling 80% (4.5) vs 88% (4.1). | Queue shows PRD order with applications as a separate row; ceiling uses FR-38's completed bookings; "near" = 80 %. |
| **UC-3** | **Provider-side acute surface.** 3.5/3.6 link to the admin runbook (English, admin-only). Page 5.7 / mockup 57 is the provider trigger. | Build 5.7 as the provider surface; admin runbook is 4.2; remove cross-link from 3.5/3.6 to 4.2. |
| **UC-4** | **Defection dashboard scope.** 4.10 and 5.8 use behavioural analytics (history views, zero-result searches, unbookmarked) and aggregate-only views; FR-36 and FR-50 say user-surfaced signals only, organised by provider and signal type, with 30/60/90-day utilization thresholds. SM-C1/C2/C5 are counter-metrics to avoid, yet 5.8 uses them as KPIs. | Build one defection dashboard from **user-surfaced signals + utilization thresholds (TD-10)**. Drop behavioural analytics and use of counter-metrics as targets. |
| **UC-5** | Review appeal and "different admin" (5.4) vs no appeal in v1 and single admin; pre-moderation (4.7) vs publish-then-remove (FR-23). | Publish first, admin removal for cause; no appeal in v1; show the decision and reason read-only. |
| **UC-6** | **Provider-initiated re-engagement nudges** (5.6) and owner nudges (5.5) vs FR-49 (deferred), 5.8 (admin-initiated only), no repeat discount (FR-48). | Remove provider nudges; admin-initiated re-engagement only; no offers. |
| **UC-7** | Booking-state set and names (C-7): EXPERIENCE 9 incl. Confirmed-to-Stay, DESIGN 8 tokens, PRD adds canceled/no-show/resolved; flows skip `authorized`; mockup adds "Counter-offered" in prototype. | Settle in Step 24 (state machine) with a pill token for every state used. |
| **UC-8** | Acute event state: "Disputed" (EXPERIENCE, 08, 57) vs FR-29 freeze + early window + provider flag. Also 3.7 blocks completion during an acute event, which the PRD does not. | Booking keeps its stay state; an acute-event flag plus payout freeze applies (FR-29). Completion is not blocked. |
| **UC-9** | **Demonstrated-fit ranking and "Proven provider" filter** (1.3, 2.2, 3.9 say fit ranks): NFR-26 and DR-6 forbid ranking by fit in v1. "Successfully handled" has no definition or data at launch. | Show fit only as **evidence text computed from completed, reviewed bookings**; no fit sort or filter; empty state "New to PetCare. Building a track record." |
| **UC-10** | **Neighborhoods and distance.** 1.2 offers 7 neighborhoods; 1.3 shows km distances and a "Closest" sort; FR-13 limits to Gulshan, Banani, Baridhara, no distance search. | Three neighborhoods only; remove distance sort; no km display. |
| **UC-11** | **Payment copy.** 1.7 names Stripe for cards and "authorization hold"; 5.5 has a "payment due" reminder after confirmation; 2.2 has no payment-method input although FR-15 requires one. | Provider-neutral wording; no "payment due" after confirmation (FR-39); book-again includes a payment-method step. |
| **UC-12** | **Free text on decline (3.4), editable updates (3.5), per-size capacity (3.8), mandatory update photo (3.6), mandatory review photo and min text (5.2), "auto-release to next provider" (3.3).** Each contradicts FR-17, FR-43, FR-12, FR-43, FR-21, FR-16/FR-39. | Follow the PRD in every case; photo optional but encouraged in 5.2. |

### Decide in the relevant Stories (lower impact)

| ID | Issue | Proposed resolution |
|---|---|---|
| UC-13 | Language toggle position, numerals, date format (section 11) | One locale helper; toggle in header on mobile and footer; Latin digits with BDT unless you prefer Bangla digits |
| UC-14 | Hard-coded promises with no approved value: admin response 48 h (5.3), 5-minute notification target, "within 2 minutes", 60-day nudge cap, 6-month notification archive | Treat 5-minute owner-notified target as a **measured** value (DR-16), not a guarantee; drop the others unless you set a value |
| UC-15 | SM-15 clock starts at page load (2.2) vs "Book again" tap (FR-48, SM-15); client-side only; payment step excluded? | Start at the tap, stop at request submitted (authorization included), record server-side timestamps too |
| UC-16 | "Faster than your first booking" and "9 min" first-booking figure (2.2) are unverified | Show only when both durations are recorded for that owner |
| UC-17 | **Routes:** owner `/provider/:id` collides with `/provider` root; 1.4 and spec 13 use `/providers/[slug]`; 5.x uses `/owner/...` prefixes; 3.x uses `/provider/dashboard` | One scheme: `/` owner, `/providers/:slug` public profile, `/provider/*` provider-only, `/admin/*`; define at build, not copied from specs |
| UC-18 | Missing flows: provider sign-in, payout account setup, confirmed/completed list, owner dashboard, admin sign-in, audit-log page, owner/admin cancel and no-show UI | Add small stories; policy from TD-6 |
| UC-19 | Notification model: 1.8 promises push, EXPERIENCE says none; 5.5 and 5.9 overlap | Notification port + in-app inbox; no web-push; merge 5.5 and 5.9 |
| UC-20 | Care-specific policy: insulin is called "basic" medication (1.4); how severe conditions are screened vs rejected as clinical (DR-5) | Explicit intake declaration plus provider capability flag; admin reviews rejections |
| UC-21 | Colour discipline: coral also used for admin chat and defection dot; green used for many meanings | Write an allowed-uses list from DESIGN.md; coral for acute state only |
| UC-22 | Contrast: amber-600 text and muted-foreground/50 pairs likely fail AA | Measure and adjust tokens in Foundation bolt |
| UC-23 | Fixtures and counts conflict (Tito 4/6/7 y and 5.2/6/7 kg; insulin 7 am/pm vs 8 am/pm; prices 2,200/2,500; 8 vs 9 nights; AE-2026-0001 active vs resolved; same booking different owners; "Eid-1 to Eid+9 = 9 nights") | Seed data defined once in Step 17 from your brief (Tito 4 y, 6 kg, Rashid BDT 2,500); fixtures are never copied from specs |
| UC-24 | Mockup vs spec divergence (06 vs 4.1; 03/04/05/21/22 vs their specs; 57 vs 5.7) | Spec wins; mockup used only for layout |
| UC-25 | Internal references and prototype defects | Not copied; prototype logic is not used |

### Fabricated trust signals register

Every source (DESIGN/EXPERIENCE examples, 18 mockups, the prototype, and about 40 spec samples) shows ratings (4.4-5.0), review counts (28, 42, 47, 48), "52 vetted providers", "1.4k verified stays", "87% with photos", fit counts ("12 diabetic small dogs handled"), response times, utilization figures, named reviews, KPIs, and money figures. **None may be shipped as data** (DR-15, Rule 7). Per-scenario lists are in the working files (section D). Empty and zero states are designed instead, and trust numbers are computed from real completed training bookings.

---

## 14. Handover to later steps

- **Step 9 (system context)** uses sections 9 and 5.
- **Step 10 (units)** uses section 1, the entity groups in section 5, and the screen map in [experience-blueprint.md](experience-blueprint.md).
- **Step 11 (stories)** takes each page spec as the UI source and the decisions UC-1 to UC-12 as acceptance criteria.
- **Step 24 (lifecycle)** settles UC-7 and UC-8.
- **Step 33 (UI validation)** compares the build against the 16 mockups and the 27 spec-only pages.

Status: **approved** (2026-10-29). Proposed resolutions UC-1..UC-25 accepted by the project owner; they act as acceptance criteria for the Stories. Approved Requirements and TD-1..TD-16 remain unchanged.
