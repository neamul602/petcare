---
intent: 001-petcare-v1
phase: inception
status: approved
created: 2026-10-28T18:10:00Z
updated: 2026-10-29T15:00:00Z
---

# Requirements: PetCare v1

Sources: [intent.md](intent.md) (approved), `docs/prd.md` (§4, §6, §8, §9, §10), `docs/ux/EXPERIENCE.md`, `docs/ux/DESIGN.md`, `docs/scenarios/`.
Status: **approved at Checkpoint 2** (`APPROVE REQUIREMENTS`, 2026-10-28). Source conflicts C-1..C-11 are handled as proposed in §9 unless a later decision (Step 7a, Step 24) says otherwise.

## 0. How to read this document

- **PRD identifiers are kept verbatim**: FR-1..FR-52, NFR-1..NFR-26, UJ-1..UJ-4, SM-x, OQ-1..OQ-25, A-1..A-21. Nothing is renumbered. Where the PRD gives no FR number but the software must do something, the requirement carries a **derived ID** (`DR-n`) and is flagged as derived, so it is never mistaken for signed-off PRD text.
- **Training-only dummy behaviour** has IDs `TR-n` and is kept apart from product requirements (§7).
- **Unresolved values** are never silently chosen. Each is referenced as `OQ-n` and resolved by a human in Step 7a as a training decision `TD-n`. Until then the requirement is written with the value as a configuration parameter.
- Priority: **Must** = required for the end-to-end journeys UJ-1..UJ-4; **Should** = important, in scope; **Could** = specified but lowest sequencing. All PRD §6.1 items are in scope; priority only guides Bolt order.
- Sources of UX truth per requirement: page spec (`S x.y`, in `docs/scenarios/`) and mockup (`M nn`, in `docs/ux/mockups/`). Written specs win over mockups.
- "Testable" means each requirement has binary acceptance criteria taken from the PRD "Consequences (testable)" lists, plus derived criteria stated here.

## 1. Business goals

| Goal | Success measure (PRD §7) | Priority |
|---|---|---|
| Completed-and-reviewed bookings | SM-1 (count of `completed` bookings with a verified review) | Must |
| On-platform repeat booking | SM-2; UJ-4 book-again < 4 min (SM-15) | Must |
| Provider retention | SM-3, SM-13 | Must |
| Operable by one admin | SM-16..SM-18; ceiling 1 / 25 / 75 (FR-38) | Must |
| Acute-event readiness | SM-19, SM-20 (launch-blocking runbook) | Must |
| Trust discipline | SM-C1..SM-C5 are **not** optimised; NFR-24..NFR-26 | Must |

Numeric targets for SM-1..SM-20 other than those below are deferred until a pilot (A-21). Targets already fixed by the sources: SM-15 < 4 min; SM-19 post-mortem < 48 h (EXPERIENCE.md); SM-20 first admin timeline entry < 5 min (EXPERIENCE.md).

## 2. Scope coverage: every PRD FR (FR-1..FR-52)

All 52 FRs appear below. **In build** = delivered by software in this project. **Out of build** = documented but not coded (§8).

| FR | Title | Area | Build |
|---|---|---|---|
| FR-1 | Tiered supply structure | 6 | In |
| FR-2 | Admin-gated vetting | 6, 16 | In |
| FR-3 | Minimum vetting bar | 6, 16 | In |
| FR-4 | Vetting bias audit, right of appeal | 16 | In |
| FR-5 | Provider profile completeness, badge | 6 | In |
| FR-6 | Pet profile creation | 2 | In |
| FR-7 | Care history persistence | 3 | In |
| FR-8 | Care history pre-fill | 3, 17 | In |
| FR-9 | Care history visible to provider | 3 | In |
| FR-10 | Record retention | 3 | In |
| FR-11 | Curated search default | 4 | In |
| FR-12 | Date-level capacity | 5 | In |
| FR-13 | Launch neighbourhoods, density | 4 | In |
| FR-14 | Booking state machine | 8 | In |
| FR-15 | Booking request and authorization | 7 | In |
| FR-16 | Provider confirmation | 9 | In |
| FR-17 | Structured decline | 9 | In |
| FR-18 | Stay period, confirmation-to-stay SLA | 8, 9 | In |
| FR-19 | Completion, capture-to-payout | 12 | In |
| FR-20 | Review gating, one per booking | 13 | In |
| FR-21 | Review content, photos | 13 | In |
| FR-22 | Review independent of report | 13, 14 | In |
| FR-23 | Review visibility, moderation | 13, 16 | In |
| FR-24 | Report an issue in dispute window | 14 | In |
| FR-25 | Admin investigation, resolution | 14 | In |
| FR-26 | Acute-event trigger | 15 | In |
| FR-27 | Admin coordination, owner cadence | 15 | In |
| FR-28 | Vet directory in acute event | 11, 15 | In |
| FR-29 | Payout/report implications of acute event | 15 | In |
| FR-30 | Post-mortem loop | 15 | In |
| FR-31 | Admin role and auth | 1, 16 | In |
| FR-32 | Queue dashboard | 16 | In |
| FR-33 | Provider intake and vetting workflow | 16 | In |
| FR-34 | Acute-event coordination surface | 15, 16 | In |
| FR-35 | Report investigation, dispute resolution | 14, 16 | In |
| FR-36 | Defection detection, re-engagement | 16 | In |
| FR-37 | Audit log | 16 | In |
| FR-38 | Operating-ceiling monitoring | 16 | In |
| FR-39 | Capture-on-confirmation | 10 | In |
| FR-40 | MFS-first rails, card secondary | 10 | In (OQ-7) |
| FR-41 | Commission and payout | 12 | In |
| FR-42 | Refund mechanics | 14 | In |
| FR-43 | Daily updates | 11 | In |
| FR-44 | Booking-scoped chat | 11 | In |
| FR-45 | Vet-clinic directory | 11 | In |
| FR-46 | Responsive PWA | 18 | In |
| FR-47 | Bangla/English parity | 18 | In |
| FR-48 | Owner repeat booking | 17 | In |
| FR-49 | Provider repeat tooling | 17 | In |
| FR-50 | Defection signal capture | 16, 17 | In |
| FR-51 | Pre-launch demand validation | n/a | **Out of build** |
| FR-52 | Pre-launch supply assessment | n/a | **Out of build** |

---

## 3. Functional requirements by area

Numbering of areas follows the 19 areas requested for this step. For each FR the acceptance criteria are the PRD's testable consequences; the "Build notes" column adds only what the UX sources or the Dummy-API boundary make necessary.

### Area 1. Sign-in: phone OTP (owner, provider) and admin

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **DR-1** (derived from NFR-6, FR-31, UJ-1 entry state) | Owners and providers sign in with a **phone number and one-time code** delivered through the SMS/OTP port (Dummy SMS API in training). | Valid code signs in and starts a server session; wrong, expired or reused code is refused with a clear message; resend is available; no account is created for a provider without admin approval (FR-2); unknown owner phone creates an owner account after first verified sign-in. | NFR-6; S 1.2; M 01 | Must |
| **DR-2** (derived) | OTP failure handling: delivery failure and code failures never leave the user stuck. | OTP service down → safe failure message and retry; rate limit on send/verify attempts (limit value is a config parameter). | S 5.11 | Must |
| **FR-31** | Admin is a distinct identity with separate authentication; the console is English only; the data model allows more admins later; every admin action is logged with a reason code. | Admin sign-in is separate from owner/provider; no Bangla in `/admin`; a second admin record can be created without schema change; admin actions produce audit entries (FR-37). | S 4.1; M 06 | Must |
| **DR-3** (derived from FR-31 "extensibility") | Role separation: owner, provider and admin sessions cannot access each other's surfaces or data. | Cross-role API access returns an authorization error; provider sees only the owner-shared subset (FR-9). | NFR-10 | Must |

### Area 2. Pet profile and care configuration

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-6** | Owner creates, edits and archives pet profiles: species (dog or cat only), breed, age, weight, sex, vaccination status, behavioural notes; species-conditional fields. | Pet profile required before a booking request; dog fields: walking/exercise, outdoor access; cat fields: litter box, indoor/outdoor, single-cat vs multi-cat tolerance; fields appear by selected species; archive keeps historical bookings; other species rejected. | S 1.5; M 15 | Must |
| **DR-4** (derived from FR-8, EXPERIENCE "Care Configuration Field Group", UJ-1) | Care configuration is **structured, not free text**: medication (name, dose, schedule), allergy, anxiety, special diet, senior, extra attention. Free-text instructions are an addition, not a replacement. | Each flag has structured inputs; medication stores name, dose, schedule; Tito's profile (diabetic, insulin BID, low-carb kibble only) can be fully expressed. | S 1.5, 1.6; M 04, 15 | Must |
| **DR-5** (derived from §5 non-goals) | **Clinical or veterinary requests are rejected at intake.** | A request whose primary purpose is diagnosis, treatment, clinical monitoring or veterinary procedure is refused with an explanation; the vet directory is shown as a lookup only; the rejection is logged. How "clinical purpose" is detected at intake (explicit declaration plus keyword guard) is an assumption, see A-D1. | PRD §5; S 1.6 | Must |

### Area 3. Care history: persistence, pre-fill, provider visibility, retention

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-7** | Care history accumulates per pet across bookings: care configurations, confirmed stays, verified reviews, decline reasons; persists across providers. | Queryable per pet; confirmed stay references provider, dates, configuration snapshot, review; declined request records reason; visible to owner and, on a request, to provider. Empty state says "first stay" with no fake content. | S 2.1; M 21 | Must |
| **FR-8** | New booking for a pet with history pre-fills care configuration from the last successful configuration. | Pre-filled fields are visibly marked "from care history"; owner can edit, clear or accept each; applies to food, diet, medication, allergy, anxiety, special attention; no cross-pet pre-fill. | S 2.2; M 22 | Must |
| **FR-9** | Provider sees relevant care history on an incoming request. | Includes prior stays with this provider, prior stays with others, special-care flags, medication and diet, decline patterns; repeat owner-provider pair highlighted; read-only for provider. | S 3.3; M none (spec only) | Must |
| **FR-10** | Pet profile, care history and booking records (including reviews, reports, post-mortems, chat, updates, audit log) are retained at least **24 months** after the last booking, also after account closure. | Closed-account records remain; re-registered owner can recover linked pets subject to identity verification; admin can read within window; deletion outside the window is an audited admin event. Retention longer than 24 months is a legal-review item (OQ-19, out of build). | NFR-10, NFR-17; EXPERIENCE "Care History state" | Should |

### Area 4. Launch neighbourhoods and curated shortlist

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-11** | Default search returns a **3-5 provider** curated shortlist ranked by tier (A above B), neighbourhood density and date-level capacity only. "View all approved providers" is secondary. | Never ordered by paid placement; no "sponsored" marker (NFR-24); filters: neighbourhood, date range, species; pet care requirements attached to the search. | S 1.3; M 02, 13 | Must |
| **FR-13** | Search covers **Gulshan, Banani, Baridhara** only; admin can see bookings per neighbourhood per month; expansion is an admin action. | Providers outside launch neighbourhoods never returned; density view exists; no auto-expansion; thresholds are OQ-13 (not enforced by software). | S 4.4 | Should |
| **DR-6** (derived from NFR-3, NFR-26) | Search API responds p95 < 1 s; ranking uses only tier + density + capacity; care-fit data is captured but not used for ranking. | Ranking test with identical signals is deterministic; ranking never reads reviews, decline patterns or care-fit data. | NFR-3, NFR-26 | Must |

### Area 5. Date-level capacity

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-12** | Provider keeps per-date, per-species capacity; adjusts specific dates (including peak windows) without affecting others; Tier-A sees a peak-participation prompt. | Capacity stored per date and species; shortlist includes a provider only if **every night** of the window has room; request against a full night is **blocked at submission**, not at confirmation; lowering capacity below confirmed bookings is refused (derived); raising capacity makes a provider available again. | S 3.2; M 07 | Must |
| **DR-7** (derived, workbook Step 22 scenario for Rashid) | Capacity boundary behaviour is exact. | Capacity 2: 0 booked available; 1 booked available; 2 booked full; 8-night window all nights at 1 booked → shown and allowed; one night full → not shown and blocked; capacity raised to 4 for Eid → available again; capacity lowered below confirmed → refused. | Workbook Step 22 | Must |
| **DR-8** (derived, race safety) | Two requests for the last slot cannot both succeed. | Concurrent submissions for the last remaining night result in exactly one accepted request (transactional check). | NFR-5 | Must |

### Area 6. Provider profile, tiers and badges

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-1** | Provider tier (A or B) is a first-class attribute changed only by admin workflow; Tier-A ranks above Tier-B at equal signals; tiers have distinct admin queues/outreach. | Tier stored on provider; admin-only change with audit entry; Tier-A shows **Admin-introduced badge**, Tier-B does not. | S 4.3, 3.8; M 03 | Must |
| **FR-5** | Approved providers have a public profile: photos, services, per-species capacity, price per night, location, capability flags, prior-experience statement, verified reviews, completeness indicator. | Visible publicly only when `approved`; verification artifacts never on the public profile; Tier-A badge present. Capability flags include senior pets, medication administration, anxiety, species, size range. | S 1.4, 3.8; M 03 | Must |
| **FR-2** | Providers move `applied → vetting → approved → (suspended \| removed)`; only `approved` appears in search; no public provider sign-up. | Applications invisible to owners; suspended/removed providers cannot receive requests or confirmations; Tier-A requires recorded admin outreach before `approved`. | S 4.3; M none | Must |
| **FR-3** | Same minimum vetting bar for both tiers: identity, address, capability review, references. | Cannot advance to `approved` until identity, address and capability review are each marked complete; artifacts stored separately from the public profile, admin-visible only (NFR-7). Which documents count is OQ-9, see §6. | S 4.3 | Must |

### Area 7. Booking request and payment authorization

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-15** | Owner submits request with pet snapshot, care configuration, dates, payment method; submission places an **authorization, not a capture**. | Missing pet, configuration, dates or method blocks submission; booking goes `requested → authorized`; authorization holds for the confirmation window (OQ-1); owner can cancel before confirmation, releasing the authorization; one payment method per booking. UJ-1: 8 nights x BDT 2,500 = **BDT 20,000** authorized. | S 1.6, 1.7, 1.8; M 04, 05, 17 | Must |
| **DR-9** (derived, payment failure) | Payment failure paths are safe. | Gateway down → no booking created, retry possible; declined → clear message, request not submitted; ambiguous authorization result → resolved by reconciliation before creating the booking, never a duplicate hold. | S 5.11; NFR-23 | Must |
| **DR-10** (derived from EXPERIENCE "Form persistence", "Connectivity state") | Offline-tolerant submit: form input persists locally; if offline, the submit is held and sent on reconnection with an idempotency key; banner "Offline. Bookings will be sent when you're back online." | Reconnect sends exactly one request; duplicate submit does not create two bookings. | EXPERIENCE; NFR-15 | Should |

### Area 8. Booking state machine

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-14** | Booking state drawn from: requested, authorized, captured, declined, in-stay, completed, disputed, resolved, refunded, plus **canceled** and **no-show** paths governed by cancellation and no-show policies. Every transition follows a documented machine. | Request creates `requested`; authorization → `authorized`; confirmation → `captured` then `in-stay`; decline → `declined` with reason; completion → `completed`; report in window → `disputed`; admin resolution → `resolved` or `refunded`; illegal transitions are rejected; **every transition is logged with timestamp and trigger** (NFR-22). | EXPERIENCE "Booking lifecycle states"; S 1.8 | Must |
| **FR-18** | A confirmed booking enters `in-stay` on the start date; failing to reach `in-stay` within the confirmation-to-stay SLA flags it for admin, who may reassign or refund. | Admin-visible flag; provider's confirmation-vs-completion metric updated; SLA value is a parameter (not given in PRD, see Q-D1 in §6). | S 4.4 | Should |
| **DR-11** (derived, OQ-4/OQ-6) | Cancellation and no-show transitions exist with payment effects decided by training decision (Step 24). | Until decided, only owner-cancel before confirmation (releases authorization, FR-15) is specified; other paths are implemented per TD only. | OQ-6 | Must |

### Area 9. Provider confirmation, structured decline, confirmation window

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-16** | Provider explicitly accepts or declines within the **confirmation window**; absence of action never auto-confirms and raises an admin-visible timeout. | Request visible in provider queue in `authorized`; confirm triggers capture; no counter-offers; on timeout the authorization is released and the owner told (DR-12). | S 3.1, 3.3, 3.4 | Must |
| **FR-17** | Decline needs exactly one reason from the **decline-reason taxonomy**; releases the authorization; records the reason on the booking and the pet's care history; admin sees distribution per provider and per pet. | Seed taxonomy: cannot administer medication; cannot accommodate high-anxiety pets; cannot support senior/limited-mobility pets; care requirements exceed capacity; facility/environment not suitable; generic decline. No free-text rationale. See conflict C-3 in §9. | S 3.4; EXPERIENCE "Inline confirmation" | Must |
| **DR-12** (derived from FR-16, FR-39) | Confirmation-window timeout releases the authorization and notifies the owner. | After the window (OQ-1 value) with no action: authorization released, booking closed as declined-by-timeout, owner notified through the notification port, admin timeout signal raised. | FR-39 | Must |


### Area 10. Capture on confirmation (MFS first, card secondary)

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-39** | Authorization at request, **capture on provider confirmation**, nothing captured at request. Decline or timeout releases the authorization. | Capture only after confirmation; completion does not create a new payment event; extension beyond the window is OQ-5. | S 1.7, 3.4 | Must |
| **FR-40** | bKash and Nagad are primary; card is secondary and not the default. | bKash/Nagad selectable without redirect to card capture; card offered per OQ-7 decision; card data never handled by PetCare (NFR-9). | S 1.7; M 17 | Must (MFS), Should (card) |
| **DR-13** (derived, NFR-23, workbook Step 25) | Capture is **idempotent**: a repeated or retried capture never charges twice. | Same idempotency key twice yields one capture; "answer lost" ambiguous result is retried safely and captures once; the transaction record stores booking, owner, provider, pet, nights, price, captured amount, method, gateway reference, state transition, timestamp. | NFR-23 | Must |

### Area 11. Daily updates, booking-scoped chat, vet-clinic directory

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-43** | Provider posts at least one daily update per active booking (photo, short video or short note); owner receives it; reminders sent; completion never blocked by missed updates; updates immutable once posted. | Update only against `in-stay`; owner sees it in-app; reminder cadence is OQ-12; photo upload through the photo port with retry when connection is lost. Photo and note only (TD-15). | S 3.5, 3.6, 5.1; M 35, 36 | Must |
| **FR-44** | Owner and provider chat scoped to the booking, from confirmation through completion or resolution; admin can read for cause; retained per FR-10. | No cross-booking threads; no owner-to-owner chat; no voice/video; sent messages survive a dropped connection. | S 5.1; EXPERIENCE "Chat" | Must |
| **FR-45** | Vet-clinic directory per launch neighbourhood: name, address, phone, hours, species handled; accessible to owners and providers during an active booking; freshness owned by admin (OQ-16). | One entry set per neighbourhood; tap-to-call; passive lookup, no endorsement or partnership wording. | S 3.5, 4.2; M 08, 35 | Must |
| **FR-28** | The directory entries for the booking's neighbourhood are surfaced at acute-event trigger, one tap away. | See area 15. | M 08, 57 | Must |

### Area 12. Completion, commission, payout

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-19** | Provider marks the stay complete; completion opens the verified-review window and makes funds payout-eligible. | `completed` state; owner prompted to confirm completion and review; payout released net of commission, conditional on no report in the dispute window (OQ-2). | S 3.7, 5.2 | Must |
| **FR-41** | Payout = captured funds minus platform commission; commission may differ by tier; payout cadence documented; frozen by report (FR-24) or acute event (FR-29). | Payout record linked to the booking and to the commission value used; commission values and cadence come from one configuration place (OQ-3, OQ-8); no dynamic or surge commission (NFR-25); provider earnings are not disclosed to other providers (OQ-14). | S 3.10, 4.8, 5.6 | Must |
| **DR-14** (derived, workbook Step 27 and 35) | Payout service unavailable: payout stays queued; a retry never pays twice. | Idempotent payout batches; failure keeps status `queued`; admin can see queued/frozen/released state (payout state indicator). | NFR-23; DESIGN "Payout State Indicator" | Must |

### Area 13. Verified reviews with photos and moderation

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-20** | Review only after `completed`; exactly one per booking; always references a booking. | Review before completion refused; second review refused; review without booking not possible. | S 5.2; M none | Must |
| **FR-21** | Rating 1-5 required; text and photos optional; photos tagged with the booking and must come from the stay window. | Photos stored via the photo port; photos outside the stay window refused. | S 5.2 | Must |
| **FR-22** | Review and report are independent records. | Owner may submit both on one booking; moderation of a review never alters a report; resolving a report never edits or deletes a review. | S 5.3, 5.4 | Must |
| **FR-23** | Reviews are public on the provider profile once submitted, newest first, with aggregate rating and review-with-photos rate; admin may remove for cause (abuse, off-topic, off-platform contact details); removed reviews are retained. | Removal hidden from public, kept in record; no provider response or dispute surface; SM-C3 protection: do not present average star rating as the reputation signal (see C-4). | S 4.7, 5.4; M 47 | Must |
| **DR-15** (derived, PRODUCT.md, intent §10) | **No fabricated trust signals.** | No review, rating, booking count or testimonial is shown unless produced by a real (training) booking in the app or labelled as a training fixture; seed files are the only place fixtures live. | PRODUCT.md; Rule 7 | Must |

### Area 14. Report an issue, disputes, payout freeze, refunds

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-24** | Owner reports an issue within the **dispute window** after completion; the report freezes the payout. | Report refused after the window with a reason; payout moves to `frozen`; one report per booking; references a booking; booking becomes `disputed`. Window length is OQ-2. | S 5.3 | Must |
| **FR-25** | Admin resolves with one of three outcomes, with documented rationale: Resolved-No Action (releases payout), Resolved-Refund (full or partial, remaining payout released net), Resolved-Provider Action (warning, suspension or removal, independent of payout). | Booking becomes `resolved` or `refunded`; rationale retained per FR-10. Issue categories per taxonomy "seed" (EXPERIENCE) , see Q-D2 in §6. | S 4.6 | Must |
| **FR-35** | Admin console view for a report shows booking record, care history, updates, chat, prior decline distribution, prior reviews; admin may record a dispute-pattern observation. | All listed data reachable from the report; outcomes selectable. | S 4.6 | Must |
| **FR-42** | Refund (full or partial) issued by admin against a frozen payout, to the original payment method where the gateway supports it. | Refund goes through the payment port; amounts and timing follow OQ-4 values; logged as a payment event (NFR-23). | S 4.6, 4.8 | Must |

### Area 15. Acute-event trigger and runbook

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-26** | Provider raises an acute event from an `in-stay` booking: event type (illness / injury / death), time, initial observation; vet directory entry surfaced immediately; owner notified in-app with SMS fallback if offline. | Trigger only from `in-stay`; transport decision is the provider's; no clinical guidance from the platform. | S 5.7; M 57, 08 | Must |
| **FR-27** | Admin is paged at top priority; sends owner notifications on a documented cadence with templates; documents the timeline; makes no clinical decisions. | Queue shows acute event at P1; templated messages; timeline entries append-only. Cadence values are OQ-20. | S 4.2; M 42 | Must |
| **FR-29** | Acute event freezes the booking's payout, opens the dispute window early, flags the provider for review without auto-suspension. | Freeze applied at trigger; owner may report immediately; reviews unaffected. | S 5.7 | Must |
| **FR-30** | Every acute event closes with a post-mortem (timeline, role execution, owner communication, directory usage, gaps); retained per FR-10; runbook is admin-editable. | Post-mortem within 48 h of closure (EXPERIENCE SM-19 threshold); admin-internal only. | S 4.2, 4.9; M 42 | Must |
| **FR-34** | Admin coordination surface: receive page, notify owner from template, timeline, close with post-mortem; runbook templates editable. | See FR-27, FR-30. | S 4.2, 4.9 | Must |
| **DR-16** (derived, workbook Step 31) | The product **measures** time from trigger to owner notified (target < 5 min) and time to first admin timeline entry (EXPERIENCE SM-20, < 5 min). | Both timestamps recorded and shown on the event; timeline exportable as JSON for evidence. | EXPERIENCE; workbook | Must |

### Area 16. Admin console

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-32** | Queue dashboard ordered: acute events, then reports in progress, then bookings awaiting provider confirmation, then in-stay; provider-quality flags inline; drill-down; loads < 2 s on a low-end phone (NFR-4). | See conflict C-2 about "awaiting vetting" in EXPERIENCE. | S 4.1; M 06 | Must |
| **FR-33** | Admin intake of Tier-A outreach and Tier-B applications; advance status; record verification artifacts, Tier-A outreach artifacts, and appeal outcomes. | Identity documents never reach the public profile. | S 4.3 | Must |
| **FR-4** | Vetting-bias-audit data is surfaced to admin; declined providers have a documented right-of-appeal path; audit cadence is admin-owned, not enforced. | Appeal submission and outcome recorded in the provider record's audit log. | S 4.3 | Should |
| **FR-36** | Defection-signal dashboard by provider and signal type; tier utilization per active provider per month; 30/60/90-day re-engagement flags; outreach recorded; signals never auto-suspend. | Thresholds are OQ-11; message templates are admin-authored. | S 4.4, 4.10, 5.8 | Should |
| **FR-37** | Every admin action logged (identity, timestamp, action type, reason code, target); entries cannot be edited or deleted; retained 24 months. | Append-only table; no update/delete path in API or DB role. | S 4.1; EXPERIENCE `/admin/audit` | Must |
| **FR-38** | Console shows active provider count and trailing-30-day completed bookings against 1 admin / 25 providers / 75 bookings and flags approach or breach as a re-platforming signal, not a stretch goal. | Both thresholds shown; approach and breach states. | S 4.5 | Should |
| **FR-23** (admin side) | Review moderation queue for cause. | See area 13. | S 4.7; M 47 | Must |
| **DR-17** (derived, S 4.8) | Payout reconciliation view for admin: queued, frozen, released, refunded, with drift visible. | Totals reconcile against the Dummy payout and payment inspection views. | PRD §11 risk | Should |
| **FR-50** | Defection signals are captured from documented channels only (reports, reviews, feedback); no scanning of external messaging. | Soft signals only. | S 5.8 | Should |

### Area 17. Book again and repeat-value tooling

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-48** | Owner sees prior bookings and can **Book again** on a completed booking or previously used provider, care configuration pre-filled (FR-8), no re-explaining of the pet. | UJ-4: intake pre-filled with dates template, pet profile and prior instructions as editable text; confirmation request submitted in **under 4 minutes** from the Book-again tap, measured in-app (SM-15). | S 2.1, 2.2; M 21, 22 | Must |
| **FR-49** | Provider's request view shows prior confirmed stays with that owner or pet and care-history summary, highlighting repeat context. | Provider sees Tito's prior successful stay on the request. | S 3.3, 3.9 | Must |
| **FR-8, FR-9** | See area 3. | | | |
| **FR-50** | See area 16. | | | |

### Area 18. PWA, Bangla/English parity, performance, accessibility

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **FR-46** | Responsive web PWA; "add to home screen" capable; no native apps. | Manifest and service worker valid; installable; surfaces usable at 390x844 first; admin console supports desktop (see C-6). | EXPERIENCE "Foundation" | Must |
| **FR-47** | Bangla (default) and English with **full parity** on owner and provider screens; admin English only; data model stores Bangla and English content for names, descriptions, instructions, profiles. | Language toggle in persistent footer, one tap; every text key present in both languages (automated check, workbook Step 32). See conflict C-1. | S x.y content blocks (EN + BN) | Must |
| **DR-18** (derived from EXPERIENCE "State Patterns", S 5.11-5.13) | Connectivity states, empty states, error states and loading states exist for every list and flow: online fast, online slow (background sync queued), offline (cached read surfaces, held submit). | Explicit loading states (not implied); error state illustrations per DESIGN; no fake content in empty states. | S 5.11, 5.12, 5.13 | Must |
| **DR-19** (derived from EXPERIENCE "Accessibility Floor") | WCAG 2.1 AA: keyboard reachable, visible focus, labelled inputs, live regions for state changes (assertive for acute events in admin), 44x44 px targets with 8 px spacing, color never the only carrier of meaning, reduced-motion honoured. | Automated and manual checks per testing standard. | NFR-12.. DESIGN | Must |
| **DR-20** (derived from EXPERIENCE "Foundation") | Notifications: no native push in v1; owner sees banners/indicators on next visit and booking-scoped message indicators; SMS or email-like fallback goes through the notification port. | Notification inbox (S 5.5, 5.9) lists system notifications; acute event owner banner appears on next visit. | S 5.5, 5.9 | Should |

### Area 19. Failure of payment, payout, SMS, notification, photo storage

| ID | Requirement | Acceptance criteria | Source / UX | Pri |
|---|---|---|---|---|
| **DR-21** (derived, workbook Step 35) | Each external port fails safely and recoverably. | Payment down: no booking, retry. Payment declined: clear message. Capture answer lost: single capture on retry. OTP down: sign-in fails safely, retry. Notification down: event still recorded, delivery retried, admin sees failed deliveries. Photo upload lost connection: queued and retried, no orphan review. Payout down: stays queued, no double payout. | Workbook Step 35 | Must |
| **DR-22** (derived) | Application code reaches externals only through ports/adapters; UI never calls a Dummy API directly. | Static check: no Dummy service URL in `apps/web`. | Workbook Rule 5 | Must |

---

## 4. Non-functional requirements (PRD §8, verbatim IDs)

| ID | Requirement | Verification | Pri |
|---|---|---|---|
| NFR-1 | Initial payload < 500 KB on 4G; images lazy-loaded | Bundle-size check, Lighthouse | Must |
| NFR-2 | TTI < 3 s on 4G for owner/provider primary surfaces | Throttled-4G Playwright/Lighthouse | Must |
| NFR-3 | Curated shortlist p95 < 1 s | API timing test | Must |
| NFR-4 | Admin initial load < 2 s on low-end phone, 4G | Throttled profile test | Must |
| NFR-5 | 99.5% monthly uptime in booking-peak hours | **Out of build**: operational target; health endpoints provided | Could |
| NFR-6 | Owner identity verified at booking (phone OTP minimum) | See DR-1 | Must |
| NFR-7 | Provider identity/address artifacts stored apart from public profile, admin-visible only | API and data tests | Must |
| NFR-8 | Chat and updates auditable by admin for cause | Admin read access test | Must |
| NFR-9 | Payment data via gateway with PCI-style tokenization; PetCare never handles card data | Dummy gateway returns tokens only | Must |
| NFR-10 | Care history/booking records retained with access controls; owners see only their own | Authorization tests | Must |
| NFR-11 | Vetting bias audit data admin-accessible and audit-logged | See FR-4, FR-37 | Should |
| NFR-12 | Bangla default and English parity, owner and provider | i18n parity check | Must |
| NFR-13 | Admin English only | UI check | Must |
| NFR-14 | Mobile-first responsive across all surfaces | Viewport tests | Must |
| NFR-15 | Works on Android 9+, 2 GB RAM, intermittent 4G | Throttled profile; no device lab: **partially verifiable** (emulation only) | Must |
| NFR-16..NFR-20 | Compliance posture (animal welfare act, data protection, commission tax, trade licence, pre-launch legal review) | **Out of build**: documentation, see §8 | n/a |
| NFR-21 | Every admin action logged; log immutable | See FR-37 | Must |
| NFR-22 | Every booking state transition logged (timestamp, trigger) | See FR-14 | Must |
| NFR-23 | Every payment event (authorization, capture, refund, payout freeze, payout release) logged with timestamp, gateway reference, booking reference | Payment event log tests | Must |
| NFR-24 | No paid placement or "sponsored" markers | Search test and UI scan | Must |
| NFR-25 | No surge pricing or dynamic commission | Config is static per booking | Must |
| NFR-26 | Care-fit data captured, not used for v1 ranking | See DR-6 | Must |

---

## 5. Assumptions

PRD-tagged assumptions **A-1..A-21** (PRD §10) are carried unchanged; none is hardened by this document. Assumptions added in this document (prefix **A-D**, for "derived"):

| ID | Assumption | Risk if invalid | Mitigation |
|---|---|---|---|
| A-D1 | Clinical-purpose rejection (DR-5) can be implemented as an explicit intake declaration plus keyword guard; the PRD gives the rule but not the mechanism. | Clinical requests slip through, or ordinary special-care requests are rejected. | Review wording with the product owner; log rejections for audit. |
| A-D2 | Training environment runs one API process, one DB and one Dummy-services process on one machine. | Concurrency assumptions differ in production. | Idempotency and transactional checks are built in regardless. |
| A-D3 | PostgreSQL via Docker Compose is available (tech-stack standard). | Setup friction. | Fallback to be agreed if Docker is unavailable. |
| A-D4 | Owner "confirm completion" (workbook Step 27) is a required step after the provider marks complete; the PRD says the provider marks complete and owner is "prompted to confirm". | Order of events differs from intended flow. | Confirm in Story acceptance criteria. Resolved by UI analysis UC-1: provider marks complete, owner then confirms. |
| A-D5 | Admin is on desktop and phone; the PRD says mobile-first for all and EXPERIENCE says desktop-first for admin (C-6). | Layout mismatch. | Build responsive; verify both. |
| A-D6 | 43 page specs and 18 mockup screens are enough to rebuild the UI; screens with a spec but no mockup are built from the spec only. | Visual drift on unmocked screens. | Apply DESIGN.md tokens; verify in Step 33. |

---

## 6. Unresolved questions (PRD §9), with directional defaults

**Software cannot run without a value** (all resolved in Step 7a as TD-1..TD-11, see `memory-bank/standards/training-decisions.md`; each lives in one configuration place):

| OQ | Question | PRD directional default | Needed by |
|---|---|---|---|
| OQ-1 | Confirmation-window duration (base + peak adjustment) | none (UJ-1 narrates "3 hours") | FR-15, FR-16, DR-12 |
| OQ-2 | Dispute-window duration | none | FR-24, FR-19 |
| OQ-3 | Payout cadence | **weekly batched MFS payouts** | FR-41 |
| OQ-4 | Refund values: full vs partial thresholds, timing | none | FR-42 |
| OQ-5 | Authorization extension for repeat bookings | none | FR-39 |
| OQ-6 | Cancellation, no-show and refund path specifics | none | FR-14, DR-11 |
| OQ-7 | Card in v1 or deferred | card is secondary | FR-40 |
| OQ-8 | Commission per tier | Tier-A introductory 8-12%, Tier-B 15-18% (first 90 days; then 12-14% vs 15-18%) | FR-41 |
| OQ-10 | Decline-reason taxonomy extension | six seed reasons (FR-17) | FR-17 |
| OQ-11 | Re-engagement thresholds | <40% day 30; <30% day 60; <20% day 90 | FR-36 |
| OQ-12 | Daily-update reminder cadence; provider-configurable? | none | FR-43 |

**Resolved in the build by a lighter decision** (recorded in stories, no separate gate): OQ-9 vetting-bar documents and review SLA; OQ-13 density thresholds; OQ-14 earnings visibility (brief: likely no); OQ-16 directory freshness cadence; OQ-17 localization specifics (slugs, transliteration); OQ-19 retention beyond 24 months (floor only); OQ-20 cadence values and templates for the acute-event runbook; OQ-23 expat UI (Bangla-first with English parity); OQ-24 v2 triggers (not built); OQ-25 care-fit ranking (v1: no).

**Out of build scope:** OQ-15, OQ-18, OQ-21, OQ-22.

**Additional gaps found while reading the sources** (new questions, not in PRD §9; resolved as TD-12..TD-15, and Q-D5 gateway fees as TD-16):

| ID | Question | Why it matters |
|---|---|---|
| Q-D1 | Confirmation-to-stay SLA value (FR-18) | Needed to flag ghosted bookings |
| Q-D2 | Report issue category taxonomy (FR-25, EXPERIENCE says "taxonomy per FR-25 seed", but FR-25 defines only outcomes) | Report form |
| Q-D3 | Acute-event severity levels (EXPERIENCE form has "severity"; FR-26 lists only event type) | Acute form |
| Q-D4 | Whether short **video** updates are in scope for the dummy photo storage (FR-43 allows video) | Update composer |

---

## 7. Training-only dummy behaviour (separate from product requirements)

| ID | Dummy behaviour | Notes |
|---|---|---|
| TR-1 | **Dummy Payment Gateway:** authorize, capture, release, refund, get payment, for bkash / nagad / card; idempotent capture | Training contract, not the real bKash, Nagad or SSLCommerz API |
| TR-2 | **Dummy MFS Payout:** create batch, freeze, release, get payout | Same caveat |
| TR-3 | **Dummy SMS/OTP:** send and verify a code; inspection view shows the code that was "sent" | Same caveat |
| TR-4 | **Dummy Notification:** accepts and records notifications | Same caveat |
| TR-5 | **Dummy Photo Storage:** upload and fetch photos | Same caveat |
| TR-6 | Every Dummy API has **health, reset, inspection** and **failure modes**: down, timeout, decline, ambiguous result (success whose reply was lost) | Required by workbook Step 16 |
| TR-7 | Seed data is training data, clearly labelled, only in seed files: neighbourhoods Gulshan, Banani, Baridhara and vet clinics per neighbourhood; owner Bibi with pet Tito (dog, Shih Tzu, 4 years, 6 kg, diabetic, insulin twice daily, low-carb kibble only); provider Rashid (Gulshan, Tier-A, capacity 2 small pets per night, BDT 2,500 per night); admin Ayaat; three or four more approved providers across both tiers; one pending Tier-B application | Workbook Step 17 |
| TR-8 | No seeded review, rating or testimonial is presented as real | DR-15 |

---

## 8. Out of build scope (documented, not coded)

| Item | Why |
|---|---|
| FR-51 Pre-launch demand validation; OQ-21, OQ-22 | Operational research activity, not software |
| FR-52 Pre-launch supply assessment; OQ-15 | Same |
| NFR-16..NFR-20 Compliance posture documents; OQ-18 | Legal and tax documentation owned by admin |
| NFR-5 Uptime target | Operational; the build supplies health endpoints only |
| PRD §6.2 deferrals and §5 non-goals | Not to be built (pickup/drop-off, home visits, native app, multi-admin, counter-offers, subscriptions, etc.) |
| Real gateway/SMS/payout contracts | Deliberately not invented |

---

## 9. Source conflicts and discrepancies (flagged, not silently resolved)

| ID | Conflict | Handling (decided at Checkpoint 2; refined where noted) |
|---|---|---|
| C-1 | EXPERIENCE.md Foundation says "English-first copy... copy translation is out of scope for v1"; PRD NFR-12/FR-47, the intent and the page specs (EN + BN content) require Bangla default with English parity. | **PRD wins**: build Bangla default and English parity using the page-spec content blocks. |
| C-2 | FR-32 queue order is acute, reports, **awaiting provider confirmation**, in-stay; EXPERIENCE queue-priority lists P3 as "**awaiting vetting**" (provider applications). | Show all four PRD rows in PRD order and show vetting applications as a separate admin work item; confirm. |
| C-3 | FR-17 seed taxonomy (six reasons) differs from EXPERIENCE decline chips ("date conflict, capacity reached, special-care not in scope, other"). | **PRD taxonomy wins** (OQ-10 decides extensions); confirm. |
| C-4 | Provider profile and UJ-1 show "average 4.7 / 4.9" ratings; SM-C3 says average star rating must not be the reputation signal; FR-23 requires aggregate display (average rating, review-with-photos rate). | Display aggregates as FR-23 requires, never as a ranking or headline reputation signal; no seeded ratings (DR-15). |
| C-5 | FR-43 allows short video; the Dummy photo API is photo-only in the workbook. | Decided: photo and note only (TD-15). |
| C-6 | PRD: admin on low-end phone; EXPERIENCE: admin desktop-first at >=1280x800. | Build responsive; verify both (A-D5). |
| C-7 | FR-14 text lists nine states and also `canceled` and `no-show`; PRD A-7 and EXPERIENCE list nine without them. Also EXPERIENCE adds "Confirmed-to-Stay" while FR-14 lists `resolved`. | Resolve in the Step 24 lifecycle decision. |
| C-8 | EXPERIENCE says acute-event submit moves the booking to **Disputed**; FR-29 says payout freeze plus early dispute window and provider flag. | Model as freeze + flag; decide the displayed state in Step 24. |
| C-9 | EXPERIENCE says no native push in v1 and alerts are banners/email; FR-26 mentions "SMS / push fallback". | Use the notification port (Dummy) for SMS-style fallback; no web push. |
| C-10 | UJ-1 shows seeded-looking reviews and counts; Rule 7 forbids fabricated signals. | DR-15. |
| C-11 | Scenarios header lists 46 pages, 43 specified; only 18 mockup screens exist. | Target 43 page specs. |

---

## 10. Journey traceability

| Journey | Requirements |
|---|---|
| **UJ-1** first booking | DR-1, FR-6, DR-4, DR-5, FR-11, FR-12, FR-5, FR-1, FR-15, FR-16, FR-39, FR-40, FR-43, FR-44, FR-26..FR-30, FR-19, FR-20, FR-21, FR-41, FR-7, FR-24, FR-25 |
| **UJ-2** provider Eid capacity | FR-12, DR-7, FR-1, FR-16, FR-17, FR-39, FR-43, FR-44, FR-26, FR-41, FR-36 |
| **UJ-3** admin at the ceiling | FR-31, FR-32, FR-34, FR-27, FR-28, FR-35, FR-25, FR-36, FR-37, FR-38, FR-30 |
| **UJ-4** book again | FR-7, FR-8, FR-9, FR-48, FR-49, FR-50, FR-16, FR-39, SM-15 |

## 11. Quality checklist (self-review)

- [x] Every FR-1..FR-52 present (section 2) or marked out of build (FR-51, FR-52)
- [x] Every NFR-1..NFR-26 present (section 4) or marked out of build
- [x] PRD identifiers kept; derived items marked `DR-n`
- [x] Confirmed requirements, assumptions, unresolved questions, training-only dummy behaviour and out-of-build scope are separate sections
- [x] Real gateway contracts not invented
- [x] Human validation (Checkpoint 2)
