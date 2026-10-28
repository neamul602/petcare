---
title: PetCare — PRD
status: final
created: 2026-08-29
updated: 2026-08-31
prd_revision: 1
confirmed_at_signoff: 2026-08-31 (Alignment & Signoff — PRD content unchanged, re-confirmed against UX rev 3 + DS extraction round 2)
source_brief: _bmad-output/planning-artifacts/briefs/brief-PetCare-2026-08-29/brief.md
---

# PRD: PetCare

## 0. Document Purpose

This PRD is the **product requirements document** for PetCare's v1 — a curated pet boarding and care marketplace for urban Dhaka. It is the input to the downstream BMAD stages: **architecture** (which decides the technical stack, data model, and infrastructure), **create epics and stories** (which decomposes requirements into implementation-ready work), and **build** (which executes). The PRD stops at the capability and acceptance-criteria level; it does not name databases, frameworks, services, deployment topologies, or build sequencing — those belong to architecture.

**Audience and depth.** This PRD is written for a small founding team and early hires. It is medium-depth: enough specificity that engineers and designers can turn features into builds, enough traceability to FRs that an architect can reason about data and service boundaries, and enough grounding in user journeys that a UX designer can build flows without re-deriving intent. It is not stakeholder-deck polished, but every section reads as if a real product team could pick it up tomorrow.

**Anchored vocabulary.** All terms used across this PRD are defined once in §3 Glossary. FRs, UJs, SMs, and NFRs reference Glossary terms verbatim. Introducing a synonym anywhere is a discipline violation.

**Tagged assumptions.** Anything inferred without explicit confirmation is tagged `[ASSUMPTION: ...]` inline. All `[ASSUMPTION]` tags are surfaced in §9 Assumptions Index for explicit confirmation.

**Source documents.** This PRD builds on the **Product Brief** at `_bmad-output/planning-artifacts/briefs/brief-PetCare-2026-08-29/brief.md` (rev 3, status final), which contains the locked strategic decisions: two-tier curated supply, geographic launch phasing (Gulshan, Banani, Baridhara), moat conditionality, demonstrated-care-fit reputation, date-level provider capacity, structured provider decline reasons, verified-booking reviews with photos, structured dispute flow, MFS-first payments (bKash/Nagad), capture-on-confirmation payment timing, admin operating ceiling (1 / 25 / 75), peak-period handling, lightweight vet-clinic directory, and acute-event response posture. The PRD does not re-litigate these; it operationalizes them into functional requirements.

## 1. Vision

PetCare is a curated Dhaka marketplace that connects pet owners with vetted boarding and care providers — built for the segment where informal supply fails most visibly: owners of dogs and cats with specific or special-care requirements (medication, allergy, anxiety, special diet, senior care). The product replaces trust-via-DM (Facebook groups, Messenger, WhatsApp) with a structured experience where the pet's needs, the provider's offer, and the progress of the stay are all visible, recorded, and auditable in one place.

The bet is that in a city where boarding happens through fragmented social channels and trust is mediated by private reputation, a small, opinionated, admin-vetted marketplace will beat both the informal status quo and a generic global marketplace. The advantage compounds through structured care data, verified booking history, and demonstrated provider experience — assets a generic marketplace cannot replicate at Dhaka-specific depth. The moat is **conditional**: it only compounds if owners keep booking through PetCare (rather than swapping contact details into WhatsApp after the first stay) and providers keep accepting bookings through PetCare (rather than negotiating repeat clients off-platform). v1 is designed from Day 1 to make the second booking faster, safer, and more valuable than the first — on both sides.

In 12 months, PetCare aims to be the trusted, bookable marketplace in Dhaka that an owner with a special-care pet reaches for first — not the loudest marketplace, not the cheapest, and not the largest, but the one whose reputation is built on what providers have *demonstrably* handled well across species and care needs over time. If that bet holds, the v2 expansion (additional neighborhoods, additional services, optional app surface) is a distribution problem, not a trust problem.

## 2. Target User

### 2.1 Jobs To Be Done

**Owner — urban Dhaka pet owner (primary).**
- *Emotional:* Find someone I trust to care for my pet the way I do — for a specific need (medication, anxiety, special diet), not just for a date range.
- *Emotional:* Get through a trip without worry; come home to a healthy, unstressed pet.
- *Functional:* Book quickly with confidence — shortlist of vetted providers, structured intake that captures what my pet actually needs, confirmation that the booking is locked in.
- *Functional:* See what happened during the stay — daily updates, chat, photos — without having to ask.
- *Social:* Book with a provider who has handled pets like mine before, not just any provider.
- *Contextual:* Especially during Eid, December holidays, summer vacations, and work/family trips — when informal supply is thinnest and the booking window is compressed.

**Provider — Dhaka home sitter or small boarding operator (primary).**
- *Emotional:* Be recognized for what I do well — repeat clients, reputation I can point to, fewer flaky one-off bookings.
- *Emotional:* Not have to negotiate every special-care request from scratch on Messenger.
- *Functional:* Predictable booking flow — calendar, requests, confirmations, chat, payout — in one place.
- *Functional:* Get paid reliably per confirmed booking, without cash-collection chasing.
- *Social:* Build a reputation asset that survives platform-to-platform and (eventually) gives me pricing power.
- *Contextual:* Especially during peak weeks (Eid, December, summer) when demand spikes and admin load is highest.

**Admin — Platform operator (primary).**
- *Emotional:* Maintain the curated-trust promise — every stay reflects well on the platform.
- *Functional:* Approve providers end-to-end without leaving the console; monitor active stays; intervene in disputes; manage payouts.
- *Functional:* Spot provider issues early (slow confirmation, repeated decline patterns, off-platform defection signals) and act before they become incidents.
- *Contextual:* Operate within the single-operator ceiling (25 active providers, 75 completed bookings/month at 1 admin) without drowning.

### 2.2 Non-Users (v1)

- **Pet owners outside Dhaka.** Out of scope. v1 is Dhaka only, dogs and cats only.
- **Owners of species other than dogs and cats.** Birds, fish, reptiles, small mammals, livestock — explicitly excluded in v1.
- **Owners seeking daily-home-visit service (not boarding).** v1 is boarding-only; daily visits are deferred to v2.
- **Owners seeking pickup-and-drop-off service.** Deferred to v2.
- **Owners seeking clinical / veterinary care.** The platform supports special-care instructions (food, medication, allergy, anxiety, extra attention) but does **not** accept bookings whose primary purpose is diagnosis, treatment, clinical monitoring, or veterinary procedures. Clinical-care bookings are rejected at intake.
- **Self-serve providers.** There is no public sign-up form. All provider onboarding is admin-gated.
- **Expat / diplomatic owners as a v1 acquisition priority.** They are a secondary segment served by the bilingual UI but not actively acquired in v1.

### 2.3 Key User Journeys

> UJ format follows the template's default: persona + context, entry state, path, climax, resolution, optional edge case. Persona context is captured inline at the moments that matter — no standalone persona section.

**UJ-1. Bibi books an Eid stay for her diabetic Shih Tzu with a Tier-A provider she hasn't used before.**

- **Persona + context:** Bibi, late-30s, dual-income household in Banani, has had her Shih Tzu (Tito) for four years. Tito was diagnosed diabetic 8 months ago and needs twice-daily insulin injections, a strict low-carb diet, and a quiet environment. Bibi's family is flying to Cox's Bazar for an 8-day Eid trip. She has never used a boarding service; previous family trips meant her mother watched Tito at home, but her mother is in Chittagong this year.
- **Entry state:** Authenticated on the web app (PWA) via phone OTP from a previous browse session. Has Tito's profile saved (species: dog; breed: Shih Tzu; age: 4; weight: 6 kg; conditions: diabetes; medication: insulin BID; dietary notes: low-carb kibble only, no table food).
- **Path:**
  1. Searches for boarding in Gulshan / Banani / Baridhara for the Eid window (8 nights). Result: a curated shortlist of 4 providers ranked by tier, neighborhood density, and per-date capacity. Tito's care requirements are pre-attached.
  2. Opens the first profile (Tier-A). Reads: photos, services, capacity (2 dogs max, no cats this stay), price/night (BDT 2,500), location on map, capability flags (senior pets ✓, medication administration ✓), 14 verified reviews with photos (avg 4.7), admin-introduced badge, Tier-A marker.
  3. Selects Tier-A provider. Configures stay: 8 nights, food (matches Tito's existing profile), additional service flag (extra medication attention), free-text instructions ("Insulin BID morning/evening; will bring insulin + syringes; call me if he refuses food or shows lethargy"). Submits request with bKash payment method.
  4. Provider receives request; reviews Tito's profile and care configuration; accepts within 3 hours.
  5. Bibi receives confirmation; payment captured. Daily update prompts begin on drop-off day.
  6. During the stay: 2 daily updates (photo + short note) per day from the provider; Bibi replies via in-app chat once on day 4 ("any concerns?" → "no, all good, he's eating well").
  7. On return day, Bibi collects Tito. Provider marks complete. Funds released net of commission. Bibi is prompted to confirm completion and leave a verified review with photos.
- **Climax:** Bibi picks up a healthy, calm Tito. The verified review she leaves (with two photos from the stay) becomes part of the provider's compounding reputation asset.
- **Resolution:** Tito's care history is now persisted on Bibi's account. Next booking pre-fills automatically. Provider's reputation now includes a "successfully handled diabetic small-breed senior" data point that improves future matching.
- **Edge case (acute event):** On day 3, Tito refuses his morning meal. Provider uses the in-app "Report a concern" action; admin is paged; the lightweight vet-clinic directory surfaces two nearby clinics; provider takes Tito to the closer one; admin communicates with Bibi via the documented acute-event cadence; outcome is a mild hypoglycemic episode treated in-clinic. Review and dispute records feed the runbook; the next booking still proceeds through PetCare.

---

**UJ-2. Rashid, a Gulshan home sitter, manages his calendar through Eid week.**

- **Persona + context:** Rashid, mid-40s, has been home-boarding cats and small dogs for six years via word-of-mouth and a Facebook group. Lives in a Gulshan apartment with a dedicated pet room and outdoor catio. Has 12–15 repeat clients per year, mostly cats. Applied to PetCare after the admin visited him in person; approved as Tier-A. Joined 3 months ago; has 7 completed bookings through the platform; 4.9-star average with photos.
- **Entry state:** Authenticated on the provider console (PWA). Eid is 4 weeks away. He has just been notified by the platform that Eid-week capacity-expansion is open for Tier-A providers.
- **Path:**
  1. Opens calendar. Default view: next 30 days. Current per-date capacity: 2 small pets. Eid window (8 nights): currently set to 2 pets.
  2. Clicks "Adjust Eid capacity" — sees the Tier-A peak-participation prompt, accepts the introductory commercial terms (lower commission during the Eid window), and raises capacity to 4 pets (2 dogs, 2 cats) for those 8 nights.
  3. Over the next 3 weeks, receives 11 booking requests. Confirms 8 (declines 3 with structured reasons: 2x "facility not suitable for large-breed dog," 1x "care requirements exceed capacity — senior dog with multiple medications"). Each confirmation triggers capture-on-confirmation payment.
  4. During the stays: posts daily updates (photo + note) for each booking; uses in-app chat for owner questions; runs one incident (per UJ-1's edge case) for a diabetic cat — coordinates with admin via the acute-event runbook.
  5. End of Eid: 8 completed bookings. 7 verified reviews with photos (1 owner didn't leave a review — within SLA). Reputation asset grows: now includes "diabetic cat handled successfully" and "high-volume Eid period completed without disputes."
- **Climax:** Payout for the Eid period lands reliably (MFS, net of commission, on the documented cadence). Rashid's utilization rate for Eid is 100% of expanded capacity; for the prior month it was 60%.
- **Resolution:** Rashid's next-month trough is buffered by his Eid reputation compounding. Repeat owners reach out via the platform (not WhatsApp); the structured care history on each repeat owner's pet pre-fills the intake in seconds rather than minutes.
- **Edge case (provider churn signal):** If Rashid's utilization drops below 40% for two consecutive off-peak months, admin reaches out via the 30/60/90-day re-engagement flow before he considers leaving.

---

**UJ-3. The solo admin handles a busy Eid week at the operating ceiling.**

- **Persona + context:** The platform's single admin operator. Working out of the launch console on a low-end Android phone on intermittent Dhaka connectivity. Eid week: 18 active providers, 52 bookings in flight, 4 in dispute window, 1 acute event (per UJ-1).
- **Entry state:** Authenticated on the admin console (English-only, mobile-first). Daily stand-up view loads in under 2 seconds on 4G.
- **Path:**
  1. Opens the queue dashboard. Sorted by urgency: 1 acute-event booking (highest), 4 disputes (next), 12 bookings awaiting provider confirmation (next), 35 in-stay bookings (bulk). One provider with a low confirmation rate flagged.
  2. Handles the acute event first. Runbook loads inline. Steps: contact provider (template message ready), check vet-clinic directory (auto-surfaces the closer clinic), notify owner on the documented cadence, log the incident timeline as it unfolds, set a post-mortem reminder.
  3. Works the dispute queue. Each dispute: review booking record (care history, updates, chat, decline patterns from prior bookings), decide on resolution (refund / partial / no-action), document the rationale.
  4. Skims the flagged provider: 40% confirmation rate over 12 requests. Pulls up the decline-reason distribution — most are "care requirements exceed capacity" on special-care requests. Admin decides: outreach to discuss whether to reduce auto-acceptance of special-care requests, or remove the senior-pet capability flag.
  5. End of day: queue zeroed. Acute event closed with a post-mortem entry. Admin logs off.
- **Climax:** All in-flight bookings survive Eid week with no escalations beyond the documented runbook. Admin's `% of bookings completed without any admin touch` metric rises week-over-week — proof the platform is doing its job without leaning on ops.
- **Resolution:** Eid-week data feeds the post-peak retrospective. Provider utilization by tier confirms Tier-A peak participation worked; off-peak retention plan is initiated for Tier-B providers whose utilization is trending down.
- **Edge case (operating ceiling breach):** If bookings/month trends toward 75+, admin flags this as a re-platforming signal — the v1 console is at its design limit, and the next hire (multi-admin RBAC) is the natural escalation, not a "stretch" goal.

---

**UJ-4. Bibi books again — the second-time owner experience validates the moat.**

- **Persona + context:** Bibi, 2 months after UJ-1. Has a Cox's Bazar weekend trip planned; needs 3 nights of boarding for Tito. Last time took her ~9 minutes end-to-end. This time: same provider is her first choice.
- **Entry state:** Authenticated. Tito's full care history is on file. Provider is favorited.
- **Path:**
  1. Opens the app, taps "Book again" on the favorited provider's last booking.
  2. Intake is pre-filled: dates (3 nights), Tito's profile (species, breed, age, weight, conditions, medication, dietary notes), and prior instructions appear as a template to edit rather than a form to fill.
  3. Reviews, edits the medication note (lower-carb kibble still in stock), submits.
  4. Provider confirms within 90 minutes (shorter than first time — repeat-owner signal). Payment captured.
  5. Bibi does not need to re-explain Tito's diabetes, insulin schedule, or dietary needs. The structured care history does it for her.
- **Climax:** Total time-to-confirmation under 4 minutes. Provider sees Tito's prior successful stay on the request — no re-litigation of capability. Both sides experience the moat functioning.
- **Resolution:** The second booking through PetCare (not WhatsApp) is logged as a moat-conditionality success metric. Provider's demonstrated-care-fit reputation gains another data point.
- **Edge case (off-platform defection attempted):** Provider messages Bibi on WhatsApp after the stay offering a 15% discount direct. Bibi declines (the platform's repeat-owner tooling + the structured care history make staying on-platform more valuable than the discount). Provider's behavior is logged as a soft signal in admin's defection-detection dashboard.

## 3. Glossary

*Every domain noun used across this PRD is defined here once. FRs, UJs, SMs, and NFRs reference these terms verbatim. Introducing a synonym anywhere else in the PRD is a discipline violation. If §4 introduces a new domain noun, it is added to this Glossary in the same pass.*

### Users and roles

- **Owner** — A pet owner authenticated on PetCare who books boarding and care for one or more pets. Realized as UJ-1, UJ-4.
- **Provider** — A Dhaka-based home sitter or small boarding operator, admin-vetted and approved to receive booking requests through the platform. Realized as UJ-2.
- **Admin** — The platform operator; the single role responsible for provider approval, identity and address verification, review moderation, dispute investigation, payout management, acute-event coordination, and operational monitoring. Realized as UJ-3.
- **Guest** — An unauthenticated visitor to the platform. Can browse marketing surfaces and read public provider profiles; cannot submit booking requests.

### Pets, care, and configuration

- **Pet** — A dog or cat registered to an Owner. Each Pet has a persistent profile and an accumulating Care History.
- **Pet Profile** — Structured attributes of a Pet: species (dog/cat), breed, age, weight, sex, vaccination status, behavioral notes, and (where relevant) species-specific fields (dogs: walking/exercise requirements, outdoor access; cats: litter box preferences, indoor/outdoor, single-cat vs. multi-cat tolerance).
- **Care History** — The complete, persistent record of an Owner's Pet across all bookings and providers: food type, dietary restrictions, medication, allergies, anxiety profile, special-attention needs, and Confirmed Stay records (provider, dates, review, decline reasons encountered). The Care History pre-fills future intakes and feeds demonstrated-care-fit ranking.
- **Care Configuration** — The per-booking subset of the Pet Profile the Owner chooses to expose for a specific stay: dates, food type, dietary notes, additional services, basic medication administration where Provider has agreed, and a free-text instructions field.
- **Special Care** — Care requirements that go beyond baseline boarding: medication administration, allergy handling, anxiety support, special diet, senior-pet support, limited-mobility support, or any combination thereof. v1 supports these as booking inputs; clinical / veterinary care is explicitly out of scope.
- **Capability Flag** — A Provider-declared attribute expressing what they accept: species accepted (dogs, cats, both), size range, senior pets accepted, medication administration accepted, anxiety-tolerant, etc. The Capability Flags of v1 are intake-side hints, not the trust signal — the trust signal is Demonstrated Care Fit.
- **Demonstrated Care Fit** — The reputational signal built over time from actual booking outcomes, Decline Reason patterns, verified Review records with photos, and species/special-care experience accumulating in a Provider's record. Replaces self-declared Capability Flags as the primary reputation driver over time.

### Supply and curation

- **Tier-A Provider (Anchor Provider)** — A Provider who is hand-picked by Admin via outbound outreach, pre-vetted to a stricter bar, featured in default search placement, and operates under a different introductory commercial arrangement (e.g. lower introductory commission during peak windows). Tier-A is the credibility gate at launch; participation in known peak windows is part of the Tier-A fit.
- **Tier-B Provider** — A Provider who applies through the open-admin-vetted intake, meets the same minimum vetting bar as Tier-A, and operates under standard commercial terms. Tier-B is the volume carrier; both tiers share the same minimum bar.
- **Provider Status** — The lifecycle state of a Provider record: applied → vetting → approved → (suspended | removed). Approved Providers only are visible to Owners in search.
- **Vetting** — The Admin's pre-listing review of a Provider application: identity verification, address verification, capability declaration review, references where applicable. Tier-A and Tier-B share the minimum bar; Tier-A additionally requires Admin-personal outreach.
- **Launch Neighborhood** — One of the initial Dhaka neighborhoods PetCare serves at v1 launch: Gulshan, Banani, Baridhara. Expansion to additional neighborhoods is gated on density validating in the launch set.

### Booking lifecycle

- **Booking** — A request from an Owner to a Provider for a specific Pet to stay a specific date range, with a specific Care Configuration, supported by an authorized payment method. A Booking moves through the eight-step Booking Lifecycle.
- **Booking Lifecycle** — Search → Select Provider → Configure Pet & Care → Submit Booking Request → Provider Confirms (accept or structured decline) → Stay (with optional daily updates, chat, vet-directory access) → Complete → Verified Review + Report-Issue window.
- **Booking State** — The current lifecycle position of a Booking, drawn from: requested, authorized (payment authorized), captured (payment captured on confirmation), declined (with Decline Reason), in-stay, completed, disputed, resolved, refunded. State transitions are governed by the Booking State Machine.
- **Booking Request** — The Owner's submission that initiates a Booking; contains the Pet Profile snapshot, Care Configuration, requested dates, and payment method. Triggers Provider review.
- **Provider Confirmation** — The Provider's explicit acceptance of a Booking Request. Required for the Booking to proceed; alternative is a structured Decline.
- **Structured Decline** — A Provider's decline of a Booking Request with a reason selected from the Decline Reason Taxonomy. Decline with reason is a first-class action and produces routing data consumed by future matching.
- **Decline Reason Taxonomy** — The closed list of categories a Provider can select when declining: cannot administer medication, cannot accommodate high-anxiety pets, cannot support senior/limited-mobility pets, care requirements exceed capacity, facility/environment not suitable, generic decline. The PRD lists the seed taxonomy; the full taxonomy may be extended in the architecture stage.
- **Stay** — The window between Confirmed Booking and Booking Completion during which the Pet is in the Provider's care.
- **Booking Completion** — The Provider's action marking a Stay complete. Triggers Verified Review window and payout release (net of commission, subject to dispute-window freeze).
- **Report an Issue** — The Owner's action raising a dispute within the defined dispute window. Independent of Verified Reviews; freezes the Provider payout pending Admin investigation.
- **Booking State Machine** — The set of allowed state transitions, including cancellation paths, no-show paths, and dispute-resolution paths. PRD names the states; the architecture stage specifies the state-machine implementation.

### Capacity, availability, and time

- **Date-Level Capacity** — A Provider's per-date (not on/off) inventory of available Pet slots, with per-species breakdown where relevant. Providers adjust capacity for known peak windows. Search filters Providers by Date-Level Capacity across the requested window; exhausted-capacity requests are blocked at submission.
- **Peak Window** — A known demand spike: Eid, December holidays, summer vacations. Treated as a strategic supply consideration in v1 (Tier-A peak participation is part of the Tier-A commercial arrangement; Date-Level Capacity is one signal of Tier-A fit).
- **Off-Peak Trough** — Weeks outside Peak Windows where supply utilization drops. The curated-supply model accepts the trough as a feature; v1 has no off-peak promotional pricing, subsidies, or retention incentives.
- **Confirmation Window** — The duration within which a Provider must Confirm or decline a Booking Request. PRD sets the base duration and peak adjustment policy; the architecture stage specifies the exact window values.
- **Dispute Window** — The duration after Booking Completion during which an Owner can raise Report an Issue. PRD names the window; the architecture stage specifies the duration.

### Trust and reputation

- **Verified Review** — A rating (1–5), written text, and optionally photos from the actual Stay, gated by a completed Booking. One Review per Booking. Public on the Provider Profile; Admin moderation exists for cause. Photos from the actual Stay are the Day-1 trust differentiator.
- **Review-With-Photos Rate** — The share of Verified Reviews that include at least one photo. The metric that proves the Day-1 trust claim is functioning.
- **Vet-Clinic Directory** — A per-Launch-Neighborhood directory (clinic name, address, phone, basic details) accessible to Owners and Providers during a Stay for incident-time lookup. The platform does not run an emergency hotline or formally partner with clinics in v1.
- **Acute Event** — A defined category of incident during a Stay: pet illness, injury, or death. Acute events are statistically inevitable at v1 booking volumes and have a documented Platform Response Posture.
- **Acute-Event Response Posture** — The defined Platform Response to an Acute Event: notification order, Provider in-the-moment vs. Admin platform-coordination responsibilities, Owner communication cadence, post-mortem practice regardless of outcome, and the loop from Review / Report an Issue records back into the runbook.
- **Acute-Event Runbook** — The Admin's step-by-step playbook for Acute Events, including communication templates, Vet-Clinic Directory access patterns, and incident closure.

### Payments and money

- **Payment Authorization** — The hold placed on an Owner's payment method at Booking Request submission. No funds are captured yet; the gateway authorises the method.
- **Payment Capture** — The conversion of Payment Authorization into captured funds. v1 captures on Provider Confirmation, not at Booking Request.
- **Capture-on-Confirmation** — The v1 payment-timing rule, driven by the Bangladesh payment-gateway landscape (SSLCommerz, bKash, Nagad do not natively support card-style escrow pre-auth-hold-then-capture).
- **Confirmed-but-Ghosted Booking** — A Booking where the Provider Confirms but does not host the Stay. The v1 payment-timing risk; mitigated by a Confirmation-to-Stay SLA and Admin reassignment flow (architecture stage).
- **MFS (Mobile Financial Services)** — bKash, Nagad (and any successor), the primary payment rails for v1. Card is a secondary option.
- **Platform Commission** — The percentage of captured Booking value retained by PetCare before Provider payout. May differ between Tier-A and Tier-B during introductory terms.
- **Payout** — The transfer of captured funds (net of Platform Commission) to the Provider after Booking Completion, subject to dispute-window freeze and resolution.
- **Payout Freeze** — The temporary hold placed on a Payout when Report an Issue is raised within the Dispute Window. Admin investigation is required to release the frozen Payout.

### Provider economics and operations

- **Operating Ceiling** — The single-admin v1 scale limit: 1 Admin, 25 active Providers, 75 completed Bookings per month. Crossing the ceiling is a re-platforming signal (multi-admin, RBAC), not a stretch goal.
- **Tier Utilization** — Bookings per active Provider per month, broken down by Tier. The metric that justifies the Tier-A commercial arrangement.
- **Re-Engagement Flow** — The Admin's outreach to a Provider whose Tier Utilization drops below defined thresholds at 30 / 60 / 90 days.

### Admin operations

- **Admin Console** — The internal application surface used by Admin. English-only in v1; designed for a single operator at launch; underlying data model and authentication remain extensible to multi-admin, RBAC, and delegation without re-platforming.
- **Queue Dashboard** — The Admin's daily prioritized view: Acute Events first, Disputes next, Awaiting Confirmation next, In-Stay bookings in bulk. Provider-quality flags surface inline.
- **Admin Intervention** — Any Admin action on a Booking (verification, dispute investigation, review moderation, override of connectivity-related issues). Tracked with a reason breakdown; the metric that makes Admin Intervention interpretable.
- **Vetting Bias Audit** — The periodic Admin audit of approval and decline decisions for protected-characteristic proxies (gender, religion, neighborhood, nationality). Required by §11 risk posture; cadence is architecture-stage-owned.

### Cross-cutting and platform

- **Bilingual Content** — Bangla (default) and English with full parity on Owner- and Provider-facing surfaces. Admin Console is English-only in v1. The data model supports Bangla content (names, descriptions, instructions, profiles) without locking in assumptions that prevent future localization.
- **PWA (Progressive Web App)** — The v1 surface: responsive web application, PWA-grade on supported mobile browsers. No native iOS or Android apps in v1.
- **Moat Conditionality** — The principle that the platform's 12-month moat (network + trust + accumulated care/booking data) only compounds if both Owners and Providers continue transacting through PetCare rather than via WhatsApp, Messenger, or direct negotiation. Off-platform defection is monitored as a leading indicator.
- **Off-Platform Defection** — Any Owner or Provider behavior that moves the transaction off PetCare after a successful first interaction: Owner–Provider WhatsApp swap, Provider direct-repeat-client negotiation, Owner unprompted Messenger outreach. Tracked as a leading indicator of moat failure.

*Glossary additions during §4 Features drafting are listed in §4.1 / §4.2 / §4.4 / §4.5 / §4.6 / §4.7 / §4.8 / §4.14 inline Notes where the FR introduces a new domain noun. The Glossary as written above reflects the §0–§3 pass; FR-introduced nouns (Cancellation Policy, No-Show Policy, Density Validation Threshold, Re-Engagement Flow thresholds) are surfaced in their respective feature Notes rather than being duplicated here.*

## 4. Features

*Features are grouped by capability area. Each subsection contains a behavioral description, globally-numbered Functional Requirements (FR-1 through FR-N), and feature-specific notes. FRs reference User Journeys by ID where the chain matters. New domain nouns introduced in a feature are added to the Glossary in the same pass.*

*FR numbering is global and stable (downstream artifacts reference FRs by ID even if features get reorganized). Note: the apparent gap between FR-7 and FR-10 reflects the late-stage addition of FR-10 (Care History + Booking record retention) to §4.2 after FR-7–FR-9 had stabilized; FR-10 sits in its feature home rather than being renumbered, to preserve cross-references that already existed in §11 Risks and §8 NFRs.*

### 4.1 Tier-A / Tier-B Provider Model and Vetting

**Description:** PetCare's curated supply is the credibility gate at launch. There is no self-serve sign-up; every Provider reaches Active status through Admin-gated Vetting. The supply is structured as two tiers sharing the same minimum Vetting bar but differing in outreach and commercial terms.

- **Tier-A (Anchor Providers)** are hand-picked by Admin via outbound outreach, pre-vetted to a stricter bar, featured in default search placement, and operate under a documented introductory commercial arrangement (e.g. lower introductory Platform Commission during Peak Windows). Tier-A carries the trust signal at launch; participation in known Peak Windows is one signal of Tier-A fit.
- **Tier-B** Providers apply through the open, admin-vetted intake, meet the same minimum Vetting bar, and operate under standard commercial terms. Tier-B is the volume carrier.

A Provider's Tier is a first-class attribute in the data model: search ranking and the "View all approved providers" surface respect it; Admin tooling distinguishes Tier-A outreach flows from Tier-B application flows. Vetting is the same process for both tiers at the minimum bar; Tier-A additionally requires Admin-personal outreach and (where applicable) an introductory commercial conversation. The Vetting Bias Audit is a periodic Admin responsibility — approval and decline decisions are reviewed for protected-characteristic proxies (gender, religion, neighborhood, nationality), and a right-of-appeal exists for declined Providers.

This feature realizes UJ-2 (Rashid's Tier-A lifecycle) and is the foundation that every other Owner-facing and Provider-facing capability depends on. Without curated supply — and without Tier-A anchor presence — no other feature has a moat.

**Functional Requirements:**

#### FR-1: Tiered supply structure

The platform supports two Provider Tiers (Tier-A and Tier-B), each sharing the same minimum Vetting bar but differing in outreach and commercial terms. Tier is a first-class attribute of a Provider record, exposed in search ranking, surfaced on the Provider Profile, and used in Admin tooling to distinguish workflows. Realizes UJ-2.

**Consequences (testable):**
- A Provider record stores Tier as a value; Tier can be changed only by Admin via a documented workflow.
- Search results rank Tier-A Providers above Tier-B Providers when other signals are equal.
- Admin tooling shows Tier-A and Tier-B in distinct queues with distinct outreach workflows.
- Tier-A Providers display an Admin-introduced badge on their public Provider Profile; Tier-B Providers do not.

**Out of Scope:**
- A third specialist tier beyond Tier-A and Tier-B (not in v1).
- Public comparison views that expose Tier as a competitive signal to Providers (Tier is a curation signal, not a marketing surface for Providers).

#### FR-2: Admin-gated Vetting

The platform accepts no public Provider sign-up. All Provider onboarding is initiated either by Admin outbound outreach (Tier-A) or by a submitted application reviewed by Admin (Tier-B). A Provider record moves through the Provider Status lifecycle: applied → vetting → approved → (suspended | removed). Only Providers in `approved` status are visible to Owners in search.

**Consequences (testable):**
- A submitted application enters the `applied` state and is not visible to Owners.
- An Admin advances an application forward along `applied → vetting → approved`. From `approved`, an Admin may transition the Provider to either `suspended` or `removed` — these are separate terminal outcomes, not sequential states.
- An Owner-facing search returns no Provider in any state other than `approved`.
- A Provider in `suspended` or `removed` state cannot receive Booking Requests or Confirmations.
- Tier-A applications additionally require Admin-personal outreach to be recorded in the application record before `approved`.

**Out of Scope:**
- Self-serve Provider sign-up flows.
- Automated Provider approval without Admin review.
- Public Provider directories listing non-approved Providers.

#### FR-3: Minimum Vetting bar (identity, address, capability, references)

Every Provider — Tier-A and Tier-B — is Vetting-gated on the same minimum bar before reaching `approved`: identity verification (NID or equivalent BD-issued ID), address verification (proof of address document or Admin site visit), Capability Flag declaration review (species accepted, size range, senior pets, medication, anxiety), and references where applicable. Admin may extend the bar for Tier-A.

**Consequences (testable):**
- A Provider record stores verification artifacts (NID, address proof, references) as part of the record, separate from the public Provider Profile.
- A Provider cannot be advanced to `approved` until identity, address, and capability review are each marked complete by Admin.
- Verification artifacts are Admin-visible but not Owner-visible.
- Tier-A applications may require additional Admin-personal outreach artifacts before `approved`.

**Out of Scope:**
- Mandatory vet affiliation or formal licensing verification for v1 (deferred).
- Insurance underwriting beyond what Bangladesh law requires.
- Background-check vendor integration in v1 (architecture-stage decision).

#### FR-4: Vetting Bias Audit and right-of-appeal

Admin conducts a periodic Vetting Bias Audit reviewing approval and decline decisions for protected-characteristic proxies (gender, religion, neighborhood, nationality). A declined Provider has a documented right-of-appeal path.

**Consequences (testable):**
- Audit cadence and findings are Admin-visible and recorded in the Provider record's audit log.
- A declined Provider can submit an appeal through a documented Admin-facing flow.
- Audit cadence is owned by Admin (not enforced by the platform in v1); the platform surfaces the data the audit needs.

**Out of Scope:**
- Automated bias detection on Vetting decisions (Admin-conducted only in v1).
- External regulator reporting (deferred to architecture / compliance stage).

#### FR-5: Provider Profile completeness and Admin-introduced badge

Every approved Provider has a public Provider Profile: photos, services, capacity (by species), price per night, location on map, Capability Flags, prior-experience statement, and Verified Reviews. Tier-A Providers display an Admin-introduced badge on their profile.

**Consequences (testable):**
- A Provider Profile is publicly visible only when the Provider is in `approved` status.
- Tier-A Providers render an Admin-introduced badge; Tier-B Providers do not.
- A Provider Profile displays per-species capacity, Capability Flags, and a profile-completeness indicator.
- Vetting verification artifacts are not visible on the public Provider Profile.

**Out of Scope:**
- Provider-edited "About me" long-form copy beyond the prior-experience statement (deferred).
- Provider-controlled photo galleries with admin moderation in v1.

**Notes:**
- The Profile-completeness indicator is a UX surface owned by the architecture stage; the PRD requires its presence as a pre-review Trust Signal.
- Tier-A introductory commercial terms (e.g. lower introductory Platform Commission during Peak Windows) are documented in the Provider's record and surfaced to Admin; the PRD does not specify the exact values (architecture stage).

### 4.2 Pet Profile and Care History

**Description:** Every Pet registered to an Owner has a persistent Pet Profile and an accumulating Care History. The Pet Profile captures structured attributes (species, breed, age, weight, sex, vaccination status, behavioral notes, plus species-specific fields). The Care History captures everything the platform knows about a Pet across bookings: Care Configurations submitted, Confirmed Stays (provider, dates, outcome), Verified Reviews left, Decline Reasons encountered, and any special-care patterns surfaced over time.

The Care History is the platform's data foundation — and the structural mechanism that defends against Off-Platform Defection. When an Owner returns for a second booking, the Care History pre-fills the intake automatically; when a Provider receives a repeat-Owner request, the Care History surfaces the Pet's prior successful stays and capability-relevant signals on the request itself. The second booking is faster than the first, on both sides, because the platform has accumulated the data that WhatsApp and Messenger do not have.

This feature realizes UJ-1 (Bibi's Tito profile + Care History built over the Eid stay), UJ-4 (the second-time Owner experience where Care History pre-fills intake and gives Owner and Provider a reason to stay on-platform), and is the input to Demonstrated Care Fit ranking (architecture stage).

*§4.2 is split into two subsections: §4.2.1 (Pet Profile) covers FR-6; §4.2.2 (Care History + Retention) covers FR-7 through FR-10. The split is structural rather than capability-driven: FR-6 is the Owner's profile-creation surface, FR-7 through FR-10 are the platform's accumulation and retention surfaces.*

#### 4.2.1 Pet Profile

**Functional Requirements:**

#### FR-6: Pet Profile creation and persistence

An Owner can create a Pet Profile for one or more Pets. Each Pet Profile stores species (dog or cat), breed, age, weight, sex, vaccination status, behavioral notes, and species-specific fields: dogs carry walking/exercise requirements and outdoor-access preferences; cats carry litter box preferences, indoor/outdoor, and single-cat vs. multi-cat tolerance.

**Consequences (testable):**
- An authenticated Owner can create, edit, and archive Pet Profiles.
- A Pet Profile is required before a Booking Request can be submitted.
- Species-specific fields appear conditionally based on the selected species.
- Pet Profile data is retained for the life of the Owner account; archival does not delete historical Bookings referencing the Pet.

**Out of Scope:**
- Pets of species other than dogs and cats.
- Pet records imported from external systems (vet clinics, microchip registries) in v1.
- Multi-Owner shared Pet records (single-Owner ownership in v1).

#### 4.2.2 Care History and Retention

**Functional Requirements:**

#### FR-7: Care History persistence and per-booking contribution

The platform maintains a Care History per Pet, accumulating across every Booking: Care Configurations submitted, Confirmed Stays (provider, dates, outcome), Verified Reviews left on those stays, and Decline Reasons encountered on declined requests. Care History persists across Providers — an Owner's second booking with a different Provider sees the same Care History as the first.

**Consequences (testable):**
- A Pet's Care History is queryable and reflects every Booking the Pet has been part of.
- A Confirmed Stay references the Provider, dates, Care Configuration snapshot, and any Verified Review the Owner left.
- A declined Booking Request records the Decline Reason against the Pet's Care History.
- Care History is visible to the Owner on the Pet's record and to the Provider on a Booking Request from that Pet.

**Out of Scope:**
- Cross-Pet aggregation within an Owner's account (each Pet has its own Care History in v1).
- Care History exported outside the platform in v1.

#### FR-10: Care History and Booking record retention

Pet Profile, Care History, and historical Booking records (including Confirmed Stays, Verified Reviews, and Report-an-Issue records) are retained for at least 24 months after the last Booking referencing the Pet, including after Owner account closure. Historical records remain available for repeat-booking pre-fill and dispute investigation, with privacy and access controls enforced.

**Consequences (testable):**
- A Pet's Care History and Booking records persist for at least 24 months after the last Booking referencing the Pet, even if the Owner closes the account.
- A returning Owner who re-registers after account closure can recover Care History linked to a previously registered Pet, subject to identity verification.
- An Admin conducting a dispute investigation can access historical Booking records within the retention window, subject to Admin access controls.
- Records outside the retention window may be deleted; deletion is an Admin-visible event with audit log.
- Retention behavior is conditional on legal/compliance validation (data-protection and animal-welfare regulations may impose longer minimums); the PRD sets 24 months as the floor, with longer retention where required by law.

**Out of Scope:**
- Permanent retention beyond what law requires.
- Care History export to Owners in v1.
- Cross-Pet retention aggregation.

**Notes:**
- The 24-month floor is a starting position; longer minimums may emerge from the PRD's pre-launch legal review (open question §9).
- Privacy and access controls for retained records are a Compliance / cross-cutting NFR; surfaced in §8.

#### FR-8: Care History pre-fill on intake

When an Owner initiates a new Booking for a Pet with existing Care History, the Care Configuration is pre-filled from the Pet's last successful Care Configuration, with species-specific fields and special-care flags carried forward. The Owner reviews and edits before submitting.

**Consequences (testable):**
- A Booking Request initiated for a Pet with prior Care History surfaces a pre-filled Care Configuration.
- Pre-filled fields are visually distinguishable as "from Care History" so the Owner knows what to verify.
- The Owner can edit, clear, or accept each pre-filled field before submitting the Booking Request.
- Pre-fill applies to food, dietary notes, medication, allergy, anxiety, and special-attention fields.

**Out of Scope:**
- ML-suggested pre-fill values (v1 is last-value-carry-forward; demonstrated-care-fit suggestions are architecture-stage).
- Cross-Pet pre-fill (Pet A's history never influences Pet B's intake).

#### FR-9: Care History visibility to Provider on incoming request

When a Provider receives a Booking Request, the Provider sees the Pet's Care History relevant to capability matching: prior Confirmed Stays with that Provider (if any), prior Confirmed Stays with other Providers, special-care flags, medication and dietary notes, and decline patterns.

**Consequences (testable):**
- A Booking Request includes the Pet's Care History in a Provider-visible summary.
- A repeat Owner–Provider pair sees prior Confirmed Stays highlighted.
- A Provider cannot edit the Care History; the Care History is read-only on the request view.

**Out of Scope:**
- Cross-Owner Pet history (a Pet's history is per-Owner; cross-Owner shared Pet profiles are out of scope).
- Provider ability to add notes to a Pet's Care History directly (notes are added via Stay updates and Reviews, which contribute to Care History indirectly).

**Notes:**
- The Care History visibility boundary is critical to Moat Conditionality: the Provider must see enough Care History to confidently accept a repeat-Owner booking, but not so much that the Provider can replicate the experience off-platform. The PRD requires the visibility described here; the exact surface is an architecture-stage decision.
- Care History pre-fill speed (UJ-4's "under 4 minutes total") is a Success Metric (SM in §7), not a functional requirement — the PRD requires the mechanism; the architecture stage and downstream measurement set the bar.

### 4.3 Search, Discovery, and Date-Level Capacity

**Description:** Search is the Owner's entry point. The Owner enters a Launch Neighborhood, requested date range, and Pet species; the platform returns a curated shortlist of 3–5 Providers by default, ranked by Tier (Tier-A first), Launch Neighborhood density, and Date-Level Capacity. A secondary "View all approved Providers" action exposes the full approved catalog in the Launch Neighborhoods. Results are never ordered by paid placement.

The key capability here is **Date-Level Capacity**: a Provider maintains per-date (not on/off) inventory with per-species breakdown where relevant. The shortlist only returns Providers who have remaining capacity for every night of the requested window. Requests against exhausted capacity are blocked at submission, not bounced at Confirmation — which means Providers are not pressured to Confirm bookings they cannot host, and Owners do not experience a confirmation that collapses.

Search also implements the Launch Neighborhood filter at v1 — the platform is not city-wide on day one. Geographic expansion is gated on density validating in the launch set.

This feature realizes UJ-1 (Bibi's search across Eid-window Providers) and is the operational front door for both Owner experience and Provider Demand signal.

**Functional Requirements:**

#### FR-11: Curated search default

The default search result for an Owner query is a curated shortlist of 3–5 Providers, ranked by Tier (Tier-A above Tier-B), Launch Neighborhood density, and Date-Level Capacity. Results are never ordered by paid placement. A secondary "View all approved Providers" action exposes the full approved catalog filtered to the Launch Neighborhoods.

**Consequences (testable):**
- A search query returns 3–5 Providers in the curated shortlist by default.
- Tier-A Providers rank above Tier-B Providers when other signals are equal.
- "View all approved Providers" returns the full approved catalog filtered to the Launch Neighborhoods.
- Search results contain no paid-placement ordering or "sponsored" markers.
- Search filters are Launch Neighborhood, date range, and species.

**Out of Scope:**
- A full-catalog view as the default surface (3–5 curated shortlist is the default).
- Paid placement, promoted listings, or advertising slots.
- Search ranking beyond Tier + Launch Neighborhood density + Date-Level Capacity in v1 (Demonstrated Care Fit ranking is architecture-stage).
- City-wide search (Launch Neighborhoods only in v1).

#### FR-12: Date-Level Capacity per Provider

A Provider maintains per-date (not on/off) inventory of available Pet slots, with per-species breakdown where relevant. Providers adjust Date-Level Capacity for known Peak Windows. The system stores capacity separately per date and per species.

**Consequences (testable):**
- A Provider record stores capacity as a per-date, per-species (where relevant) data structure.
- A Provider can adjust capacity for specific dates without affecting other dates.
- Capacity for a known Peak Window is adjustable through a documented Provider action; Tier-A Providers see a peak-participation prompt.
- Search filters out Providers whose Date-Level Capacity cannot host the requested window.
- A Booking Request against exhausted Date-Level Capacity is blocked at submission, not bounced at Confirmation.

**Out of Scope:**
- Dynamic / surge pricing.
- Tiered availability by Care Configuration complexity (medication, anxiety, etc.) in v1 — Capability Flags express what the Provider accepts; Date-Level Capacity expresses how many Pets can be hosted.
- Per-Pet-size capacity breakdowns beyond species in v1 (architecture-stage decision).

#### FR-13: Launch Neighborhood filtering and density gating

Search is filtered to Launch Neighborhoods (Gulshan, Banani, Baridhara) in v1. Geographic expansion to additional neighborhoods is gated on density validating in the launch set.

**Consequences (testable):**
- An Owner-facing search returns Providers only in Launch Neighborhoods.
- An Admin can monitor per-Launch-Neighborhood booking density (bookings per Launch Neighborhood per month).
- Expansion to a new neighborhood is an Admin action; the platform does not auto-expand.

**Out of Scope:**
- Auto-expansion based on density thresholds (Admin-initiated only in v1).
- Distance-based search (Launch Neighborhood filter is categorical in v1).

**Notes:**
- Density validation thresholds (bookings per Launch Neighborhood per month before expansion) are an Open Question (§9) — the PRD names the metric, the architecture stage specifies the threshold and Admin tool surface.
- Tier-A peak participation is treated as a strategic signal of Tier-A fit (FR-12 + Tier-A introductory commercial terms in §4.1). Providers who do not adjust capacity for known Peak Windows surface as a soft signal in Admin tooling.

### 4.4 Booking Lifecycle

**Description:** A Booking moves through the eight-step Booking Lifecycle: Search → Select Provider → Configure Pet & Care → Submit Booking Request → Provider Confirms (accept or Structured Decline) → Stay → Complete → Verified Review + Report-Issue window. Every step has explicit state, ownership, and exit conditions. The Booking State Machine distinguishes authorized, captured, declined, in-stay, completed, disputed, resolved, and refunded Payment states.

The lifecycle is the spine of the product. Two non-trivial decisions anchor it: **Capture-on-Confirmation** (the v1 Payment-timing rule driven by the Bangladesh payment-gateway landscape — payment is captured on Provider Confirmation, not at Booking Request) and **Structured Decline as a first-class action** (a Provider can decline a Booking Request with a reason selected from the Decline Reason Taxonomy, producing routing data the platform consumes for future matching).

The lifecycle also implements the Operational Ceiling's load-bearing rules: Confirmed-but-Ghosted Bookings are mitigated by a Confirmation-to-Stay SLA + Admin reassignment flow; no-show on both sides is handled explicitly.

This feature realizes UJ-1 (Bibi completes the lifecycle for Tito's Eid stay), UJ-4 (the second-time-Owner repeat-booking lifecycle), and is the operational substrate UJ-3's admin views observe.

**Functional Requirements:**

#### FR-14: Booking state machine

The platform maintains a Booking State for each Booking drawn from: requested, authorized (Payment Authorized), captured (Payment Captured on Confirmation), declined (with Decline Reason), in-stay, completed, disputed, resolved, refunded. State transitions are governed by a documented Booking State Machine.

**Consequences (testable):**
- A Booking Request creates a Booking in the `requested` state.
- Payment Authorization transitions the Booking to `authorized`.
- Provider Confirmation triggers Payment Capture, transitioning the Booking to `captured` and then `in-stay`.
- Structured Decline transitions the Booking to `declined` with a Decline Reason recorded.
- Booking Completion transitions the Booking to `completed`.
- Report an Issue within the Dispute Window transitions the Booking to `disputed`; Admin resolution transitions to `resolved` or `refunded`.
- A Cancellation policy and a No-Show policy govern the transitions to `canceled` and `no-show`; both are PRD-level requirements with architecture-stage mechanics.

**Out of Scope:**
- A third-party booking-system integration (the Booking State Machine is internal to PetCare).
- Custom state-machine extensions per Provider.

#### FR-15: Booking Request submission and Payment Authorization

An Owner submits a Booking Request containing the Pet Profile snapshot, Care Configuration, requested dates, and Payment method. Submission places a Payment Authorization on the Payment method; no funds are captured.

**Consequences (testable):**
- A Booking Request cannot be submitted without an attached Pet Profile, Care Configuration, requested dates, and Payment method.
- Payment Authorization is placed at Booking Request submission; the Authorization holds for the duration of the Confirmation Window.
- The Booking State transitions `requested → authorized`.
- An Owner can cancel the Booking Request before Provider Confirmation; cancellation releases the Payment Authorization.

**Out of Scope:**
- Payment Authorization extension beyond the Confirmation Window (architecture-stage decision).
- Multiple Payment methods per Booking (one Payment method per Booking in v1).

#### FR-16: Provider Confirmation

A Provider explicitly accepts or declines a Booking Request within the Confirmation Window. Provider Confirmation is required for the Booking to proceed.

**Consequences (testable):**
- A Booking Request in `authorized` state is visible to the Provider on the Booking Request queue.
- A Provider can Confirm (accept) or Structured Decline the Booking Request.
- Provider Confirmation triggers Payment Capture, transitioning the Booking to `captured` and then `in-stay`.
- Provider Confirmation is a documented Provider action; absence of action within the Confirmation Window triggers an Admin-visible timeout signal.

**Out of Scope:**
- Provider counter-offers (accept-or-decline only in v1; deferred to v2).
- Auto-Confirmation by absence of decline.

#### FR-17: Structured Decline with Decline Reason Taxonomy

A Provider can decline a Booking Request with a reason selected from the Decline Reason Taxonomy: cannot administer medication, cannot accommodate high-anxiety pets, cannot support senior/limited-mobility pets, care requirements exceed capacity, facility/environment not suitable, generic decline. The decline records the reason against the Booking and against the Pet's Care History.

**Consequences (testable):**
- A Structured Decline selects exactly one reason from the taxonomy.
- The decline releases the Payment Authorization.
- The decline transitions the Booking to `declined` with the reason recorded.
- The decline contributes to the Pet's Care History.
- Admin tooling surfaces Decline Reason distribution per Provider and per Pet for capability-pattern analysis.

**Out of Scope:**
- Decline reasons beyond the seed taxonomy in v1 (taxonomy may be extended in architecture stage; PRD names the seed categories).
- Provider free-text decline rationale in v1 (deferred; structured reason only).

#### FR-18: Stay period and Confirmation-to-Stay SLA

A Confirmed Booking enters the `in-stay` state at the start of the requested date range. The Provider hosts the Stay. A Confirmation-to-Stay SLA applies: a Confirmed Booking that does not transition to `in-stay` (Provider no-show) is escalated to Admin for reassignment or refund.

**Consequences (testable):**
- A Confirmed Booking transitions to `in-stay` on the requested start date (or earlier if the Owner checks in early, if supported by architecture).
- A Confirmed Booking that fails to reach `in-stay` within the Confirmation-to-Stay SLA triggers an Admin-visible flag.
- Admin can reassign the Booking to another Provider or initiate a refund per the Cancellation policy.
- The Provider in question has their confirmation-vs-completion metric updated for re-engagement review.

**Out of Scope:**
- Real-time check-in / check-out mechanics (architecture-stage decision).
- Late-arrival grace periods (architecture-stage decision).

#### FR-19: Booking Completion and Payment Capture-to-Payout

The Provider marks a Stay complete. Booking Completion triggers Verified Review window opening and Payout release (net of Platform Commission, subject to Dispute Window freeze).

**Consequences (testable):**
- The Provider marks the Booking `completed` upon Stay end.
- Payment Capture funds transition to Payout-eligible state at Booking Completion.
- The Verified Review window opens for the Owner.
- Payout is released to the Provider net of Platform Commission, conditional on no Report an Issue within the Dispute Window.
- Booking Completion is the input to Booking record retention (FR-10).

**Out of Scope:**
- Partial Payout for partial Stays (architecture-stage decision).
- Provider-initiated partial refund (deferred).

**Notes:**
- Confirmation Window and Dispute Window durations are Open Questions (§9); the PRD names the policies, the architecture stage specifies the values.
- Cancellation, refund, and no-show policies are PRD-level requirements with architecture-stage mechanics; the Open Question §9 list captures what must be answered before launch.

### 4.5 Verified Reviews with Photos

**Description:** Verified Reviews are the reputational surface that accumulates Booking data. A Verified Review is a rating (1–5), written text, and optionally photos from the actual Stay, gated by a completed Booking. One Review per Booking. Reviews are public on the Provider Profile; Admin moderation exists for cause. **Photos from the actual Stay are the Day-1 trust differentiator** — review text alone is common, but review photos from completed Stays are what distinguish a Verified Review on PetCare from a generic text review.

The trust signal here is **Demonstrated Care Fit**, not a single star rating. A Provider's reputation accumulates from what they have demonstrably handled well across species and special-care needs — Verified Reviews with photos, Confirmed Stays, Decline Reason patterns over time. v1 captures the data; Demonstrated Care Fit ranking consumption is architecture-stage.

Reviews are **independent of Reports**: a Verified Review can stand while a Report is being investigated, and a resolved Report does not retroactively delete a Review.

This feature realizes UJ-1's climax (Bibi's Verified Review with two photos), and is the spine of the moat-strengthening data loop that defends against Off-Platform Defection.

**Functional Requirements:**

#### FR-20: Verified Review gating and one-per-Booking rule

A Verified Review can be submitted only after Booking Completion. Exactly one Verified Review is permitted per Booking.

**Consequences (testable):**
- A Review submission UI is accessible to the Owner only after the Booking has transitioned to `completed`.
- The Owner can submit one Review per completed Booking; subsequent submission attempts on the same Booking are blocked.
- A Review references the Booking, not just the Provider; Reviews without a referenced Booking are not permitted.

**Out of Scope:**
- Multiple Reviews per Booking (deferred; not in v1).
- Reviews on Bookings that did not complete (e.g. declined requests, no-show) — not in v1.
- Provider-initiated Reviews of Owners (deferred).

#### FR-21: Review content — rating, text, photos from the Stay

A Verified Review consists of a rating (1–5), a written text component, and optionally photos from the actual Stay. Photos are uploaded by the Owner from the Stay window.

**Consequences (testable):**
- A Review submission requires a rating; text and photos are optional (text strongly encouraged in UX; architecture-stage decision on minimum length).
- Photos uploaded as part of a Review are tagged with the Booking reference.
- The platform stores Review photos as part of the Review record.
- The platform does not accept photos uploaded outside the Stay window for a Verified Review.

**Out of Scope:**
- Video reviews (deferred).
- Provider-uploaded counter-photos (deferred; Reviews and Reports are Owner-initiated in v1).

#### FR-22: Review independence from Report-an-Issue

A Verified Review and a Report-an-Issue are independent records. A Verified Review can stand while a Report is being investigated; a resolved Report does not retroactively delete a Review; a withdrawn Review does not affect a Report.

**Consequences (testable):**
- The Owner can submit both a Verified Review and a Report-an-Issue on the same Booking.
- Admin moderation of a Review (e.g. for abuse or off-topic content) does not affect any open or resolved Report on the same Booking.
- Admin resolution of a Report does not retroactively modify or delete a Review.

**Out of Scope:**
- Cross-record synchronization between Reviews and Reports (none in v1; they are deliberately independent).

#### FR-23: Review public visibility and Admin moderation

Verified Reviews are public on the Provider Profile. Admin moderation exists for cause (abuse, off-topic content, off-platform contact details).

**Consequences (testable):**
- A Verified Review renders on the public Provider Profile once submitted (subject to moderation).
- Admin can remove a Review for cause; removed Reviews are not rendered but are retained in the data record per FR-10.
- Reviews are displayed in reverse-chronological order by default on the Provider Profile.
- Provider Profile displays the Provider's Verified Review aggregate (average rating, Review-With-Photos Rate) at a glance.

**Out of Scope:**
- Provider response to Reviews (deferred to architecture stage; v1 has no Provider-response surface).
- Provider ability to dispute Reviews (deferred; Admin moderation is the v1 path).
- Cross-Provider Review comparison views (deferred).

**Notes:**
- The Review-With-Photos Rate is the metric that proves the Day-1 trust claim is functioning; surfaced as SM in §7.
- Demonstrated Care Fit ranking (consuming Verified Review data, Confirmed Stay history, Decline Reason patterns) is architecture-stage; v1 captures the data without consuming it for ranking (consistent with FR-11's out-of-scope).

### 4.6 Report an Issue and Disputes

**Description:** An Owner can raise a Report an Issue within the Dispute Window after Booking Completion. Reports are independent of Verified Reviews (FR-22): a Verified Review can stand while a Report is being investigated, and a resolved Report does not retroactively delete a Review. A Report freezes the Provider's Payout pending Admin investigation.

The Dispute model in v1 is intentionally simple. Three resolution outcomes:
- **Resolved — No Action:** no fault found; Payout releases.
- **Resolved — Refund:** full or partial Refund applied when appropriate.
- **Resolved — Provider Action:** warning, suspension, or removal applied independently of Payout outcome.

The Platform does not run a formal mediation service in v1 — Admin investigates, decides the resolution, and documents the rationale. v1 keeps the dispute state-machine lean; richer mediation, escrow, or insurance-backed dispute flows are deferred.

This feature realizes UJ-1's edge case (acute event handled through documentation, dispute investigated, payout decision made) and is a load-bearing component of Moat Conditionality: a fair, predictable dispute flow is part of why Owners trust the platform enough to book again rather than going to WhatsApp after the first incident.

**Functional Requirements:**

#### FR-24: Report an Issue within Dispute Window

An Owner can raise a Report an Issue within the Dispute Window after Booking Completion. The Report freezes the Provider Payout pending Admin investigation.

**Consequences (testable):**
- A Report submission UI is accessible to the Owner for the duration of the Dispute Window after `completed`.
- Report submission is blocked after the Dispute Window expires.
- Report submission triggers Payout Freeze; the Payout transitions to a `frozen` state and is not released until the Report is resolved.
- A Report references the Booking, not just the Provider; Reports without a referenced Booking are not permitted.
- The Owner can submit one Report per completed Booking.

**Out of Scope:**
- Multiple Reports per Booking (deferred).
- Reports on Bookings that did not complete (e.g. declined, no-show) — not in v1.
- Owner appeals of Report resolution outcomes (deferred; Admin resolution is the v1 final word).

#### FR-25: Admin investigation and resolution

Admin investigates a Report and documents a resolution: Resolved — No Action, Resolved — Refund, or Resolved — Provider Action. The three outcomes are independent of one another; Provider Action may apply even when no Refund is issued.

**Consequences (testable):**
- An Admin transitions a Report to one of the three documented resolution states.
- Resolved — No Action releases the Payout Freeze.
- Resolved — Refund applies a full or partial Refund and releases any remaining Payout net of Refund.
- Resolved — Provider Action applies a warning, suspension (Provider Status → `suspended`), or removal (Provider Status → `removed`) independently of the Payout decision.
- Admin documents the resolution rationale; the rationale is retained per FR-10.
- The Booking State transitions to `resolved` (or `refunded` if Refund was applied) on resolution.

**Out of Scope:**
- Owner-side mediation, escalation, or appeal paths (deferred).
- Insurance-backed or third-party dispute resolution (deferred).
- Bulk or pattern-based dispute resolution (deferred; each Report is investigated individually in v1).

**Notes:**
- Dispute Window duration is an Open Question (§9); the PRD names the policy, the architecture stage specifies the value.
- The Disputes feature does not have a Review-side dependency: Reports do not block Review submission, and Reviews do not block Report submission (FR-22 + FR-24).

### 4.7 Acute-Event Response Posture and Runbook

**Description:** An Acute Event — pet illness, injury, or death during a Stay — is statistically inevitable at v1 booking volumes and is the single biggest test of whether Owners trust the platform with the next Stay. v1 ships a defined Platform Response Posture and an Acute-Event Runbook that Admin and Provider can execute under pressure, on intermittent Dhaka connectivity, without ad-hoc handling.

The posture is operational realism, not clinical care. PetCare does not run an emergency hotline, does not formally partner with clinics, does not employ or contract veterinarians, and does not make medical decisions. The Provider carries primary in-the-moment responsibility (the Pet is in their physical care); Admin carries platform-coordination responsibility (notifications, Owner communication, documentation, post-mortem); the Vet-Clinic Directory (§4.10) is the incident-time lookup tool that turns "what do I do?" into "here is the closer clinic."

The Runbook is a defined artifact: trigger conditions, role split (Provider in-the-moment / Admin platform-coordination), Owner notification cadence, Vet-Clinic Directory usage, Payout / Dispute implications, and post-mortem practice. Reviews and Reports feed back into the Runbook so the platform's response improves over time.

This feature realizes UJ-1's edge case (Tito's hypoglycemic episode handled through the Runbook) and UJ-3's climax (Admin coordinates the acute event while managing the rest of the Eid-week queue).

**Functional Requirements:**

#### FR-26: Acute-Event trigger and Provider in-the-moment action

A Provider can raise an Acute Event from an active Booking. The trigger records the event type (illness / injury / death), time, and the Provider's initial observation. The Provider carries primary in-the-moment responsibility: stabilize, contact the Vet-Clinic Directory entry for the Booking's Launch Neighborhood, transport the Pet if needed, and notify the Owner.

**Consequences (testable):**
- An Acute Event trigger is accessible from an active Booking (`in-stay` state) for the assigned Provider.
- The trigger records event type, time, and Provider observation as the initial record.
- The Vet-Clinic Directory entry for the Booking's Launch Neighborhood is surfaced immediately on the trigger.
- The Owner is notified through the in-app communication channel at the time of the trigger; an SMS / push fallback applies if the Owner is offline.
- The Provider's transport-to-clinic decision is Provider-driven; the platform does not second-guess it.

**Out of Scope:**
- Platform-initiated transport (no pickup/drop-off in v1).
- Clinical decision support: the platform does not recommend treatments, dosages, or providers of care beyond the Vet-Clinic Directory.
- Veterinary triage or telemedicine.

#### FR-27: Admin platform-coordination and Owner notification cadence

On Acute Event trigger, Admin is paged. Admin carries platform-coordination responsibility: notification order, Owner communication on a documented cadence, Provider check-in, and document the timeline as the event unfolds. Admin does not make clinical decisions and does not override Provider in-the-moment judgement.

**Consequences (testable):**
- An Acute Event trigger generates an Admin-visible page in the Queue Dashboard at the top priority.
- Admin can send Owner notifications on a documented cadence (initial notification, status updates, closure) using a templated communication set.
- Admin can document timeline entries on the Acute Event record as the event unfolds.
- Admin's role is coordination and documentation; clinical decisions remain with the Provider and the clinic.
- An Admin can escalate by paging a second Admin in the architecture-stage-extensible case; v1 has one Admin.

**Out of Scope:**
- Multi-Admin coordination in v1 (deferred; the Operating Ceiling is one Admin).
- Admin clinical decision authority.
- Admin ability to override Provider's medical judgement.

#### FR-28: Vet-Clinic Directory usage during Acute Events

The Vet-Clinic Directory entry for the Booking's Launch Neighborhood is surfaced at Acute Event trigger. The Directory is a passive lookup tool — Provider chooses the clinic and arranges transport; the platform does not endorse, prioritize, or partner formally with clinics in v1.

**Consequences (testable):**
- The Vet-Clinic Directory entry for the Booking's Launch Neighborhood is one tap away from the Acute Event trigger.
- The Directory entry includes clinic name, address, phone, and basic details (hours, species handled) sufficient for incident-time lookup.
- The Directory freshness SLA is owned by Admin in v1 (architecture-stage decision on cadence and refresh process).
- Provider transport decisions are not gated by the platform.

**Out of Scope:**
- Formal clinic partnerships, preferred-provider rates, or platform-endorsed clinic recommendations.
- Real-time clinic availability or wait-time data.
- Telemedicine integration with clinics.

#### FR-29: Payout / Report implications of Acute Events

An Acute Event triggers automatic Payout Freeze on the affected Booking, opens the Dispute Window early (so the Owner can raise Report an Issue without waiting for Booking Completion), and flags the Provider for Admin follow-up review.

**Consequences (testable):**
- An Acute Event trigger freezes the Payout on the affected Booking.
- The Dispute Window opens at Acute Event trigger (rather than at Booking Completion) so the Owner can raise Report an Issue during the event.
- The Provider is flagged for Admin follow-up review; the flag does not auto-suspend or auto-remove.
- Report an Issue raised during an Acute Event follows the standard Resolution flow (FR-25).
- Verified Review submission is unaffected (Reviews remain independent per FR-22).

**Out of Scope:**
- Auto-suspension of the Provider on Acute Event trigger (Admin follow-up review only).
- Insurance claim automation (deferred).
- Platform liability determination (deferred; legal/compliance stage).

#### FR-30: Post-mortem practice and Runbook improvement loop

Every Acute Event is closed with a post-mortem entry, regardless of outcome. The post-mortem reviews the timeline, role execution, Owner communication quality, Vet-Clinic Directory usage, and any process gaps. Reviews and Reports on the affected Booking feed the post-mortem.

**Consequences (testable):**
- Every Acute Event record has a closed post-mortem entry within a documented timeframe after event closure.
- The post-mortem captures: timeline accuracy, role execution, Owner communication quality, Directory usage, process gaps, lessons learned.
- Verified Reviews and Reports on the affected Booking are accessible to Admin during post-mortem.
- Post-mortem entries are retained per FR-10.
- The Runbook itself is updated as post-mortems surface gaps; Runbook update cadence is Admin-discretion in v1 (architecture-stage decision on tooling).

**Out of Scope:**
- Public post-mortem publication (post-mortems are Admin-internal in v1).
- Auto-generated post-mortem templates from Booking data (post-mortem is Admin-authored in v1).
- Cross-event pattern analysis tooling (deferred; v1 is per-event post-mortem).

**Notes:**
- The Runbook is a defined artifact that Admin can execute under pressure; its content is owned by Admin and refined over time. The PRD requires the artifact exists and is updated; the specific Runbook content (notification cadence values, communication templates) is Admin-authored.
- v1 explicitly does NOT position PetCare as an emergency-response or clinical-care service. The Acute-Event Posture is operational coordination around an event the Provider is already managing — not platform-driven emergency response.

### 4.8 Admin Console

**Description:** The Admin Console is the internal application surface that Admin uses to operate PetCare end-to-end: Vetting Providers, monitoring Bookings, intervening in Disputes, coordinating Acute Events, moderating Reviews, managing Payouts, and detecting Off-Platform Defection signals. The Console is English-only in v1 and is designed for a single operator on a low-end Android phone over intermittent Dhaka connectivity.

The Console is bounded by the v1 Operating Ceiling: **1 Admin, 25 active Providers, 75 completed Bookings per month**. Crossing this ceiling is a re-platforming signal (multi-Admin, RBAC, delegation), not a stretch goal. The Console is built for one operator; the underlying data model, authentication, and audit logging remain extensible so multi-Admin, RBAC, and delegation can be added later without re-platforming.

The Queue Dashboard is the Admin's daily entry point. It surfaces priorities in order: Acute Events first, Reports-in-progress next, Bookings awaiting Provider Confirmation next, In-Stay Bookings in bulk. Provider-quality flags surface inline so Admin can act on soft signals before they become incidents.

This feature realizes UJ-3 (Admin at the Eid-week ceiling), and is the operational substrate for every other feature in v1.

**Functional Requirements:**

#### FR-31: Admin role, authentication, and extensibility boundary

Admin is a first-class platform identity with distinct authentication from Owner and Provider. The Admin Console is English-only. The underlying data model and authentication design remain extensible to multi-Admin, RBAC, and delegation in v2+; v1 ships a single-Admin role.

**Consequences (testable):**
- An Admin account authenticates separately from Owner and Provider accounts.
- Admin Console UI is English-only; Bangla is not surfaced in v1.
- A second Admin account can be created (architecture-stage extensibility) without re-platforming; v1 has one Admin.
- Admin actions are logged with a reason code for audit (FR-37).

**Out of Scope:**
- Multi-Admin RBAC, role hierarchies, or delegation in v1.
- Admin multi-language support.
- Admin impersonation of Owner or Provider accounts.

#### FR-32: Queue Dashboard and priority ordering

The Queue Dashboard is Admin's daily entry point. It surfaces Bookings and operational items in priority order: Acute Events first, Reports-in-progress next, Bookings awaiting Provider Confirmation next, In-Stay Bookings in bulk. Provider-quality flags surface inline.

**Consequences (testable):**
- The Queue Dashboard renders priority order top-to-bottom: Acute Events → Reports → Awaiting Confirmation → In-Stay.
- Provider-quality flags (e.g. low confirmation rate, repeated Decline Reasons) surface inline on the relevant Booking or Provider row.
- The Dashboard loads in under 2 seconds on a low-end Android phone on intermittent 4G (NFR-4 in §8).
- An Admin can drill into any item for the full Booking record, Care History, Decline Reason distribution, and prior Reviews.

**Out of Scope:**
- Customizable Dashboard layouts (fixed priority order in v1).
- Cross-Dashboard search / filter beyond documented priority surfaces.
- Real-time push notifications to Admin (polling cadence is architecture-stage).

#### FR-33: Provider application intake and Vetting workflow

Admin uses the Console to intake Tier-A outreach candidates and Tier-B applications, advance applications through the Provider Status lifecycle, record verification artifacts, and document Admin-personal outreach for Tier-A.

**Consequences (testable):**
- An Admin can create a Provider record from outreach (Tier-A) or from a submitted application (Tier-B).
- An Admin can advance an application forward along `applied → vetting → approved`. From `approved`, an Admin may transition the Provider to `suspended` or `removed` (FR-2 wording).
- An Admin can record verification artifacts (NID, address proof, references) against the Provider record.
- An Admin can record Tier-A-specific outreach artifacts before advancing to `approved`.
- An Admin can document a right-of-appeal outcome (FR-4).

**Out of Scope:**
- Automated Provider approval (Admin review required in v1).
- Bulk Provider import or migration tooling.
- Vetting-criteria customization per Provider (single documented bar in v1).

#### FR-34: Acute Event coordination surface

Admin uses the Console to coordinate Acute Events: receive the page, communicate with the Owner on the documented cadence, document the timeline, and close the event with a post-mortem (per §4.7).

**Consequences (testable):**
- An Acute Event trigger creates a top-priority entry in the Queue Dashboard (FR-32).
- An Admin can send Owner notifications using the templated communication set.
- An Admin can document timeline entries on the Acute Event record as the event unfolds.
- An Admin can close the event with a post-mortem entry per FR-30.
- Runbook artifacts (templates, cadence values) are Admin-editable in v1.

**Out of Scope:**
- Real-time Owner presence / chat co-pilot tooling.
- Auto-generated post-mortem drafts from Booking data.
- Runbook versioning or change-control tooling (Admin-editable plain text in v1).

#### FR-35: Report investigation and Dispute resolution

Admin uses the Console to investigate Reports, document resolution rationale, apply Refunds where appropriate, and apply Provider Action (warning, suspension, removal) where appropriate — independent of payout outcome.

**Consequences (testable):**
- An Admin can drill into a Report and view the Booking record, Care History, Updates, Chat, prior Decline Reason distribution, and prior Reviews.
- An Admin can transition a Report to one of the three documented resolution states (Resolved — No Action, Resolved — Refund, Resolved — Provider Action) per FR-25.
- An Admin can apply a Refund (full or partial) and document the rationale.
- An Admin can apply Provider Action (warning, suspension, removal) independently of the payout decision.
- An Admin can record a dispute-pattern observation for future Vetting Bias Audit use.

**Out of Scope:**
- Owner appeals or escalation paths (FR-25's deferred items).
- Insurance claim automation.
- Bulk or pattern-based dispute resolution tooling.

#### FR-36: Off-Platform Defection detection and Tier-A re-engagement

Admin uses the Console to detect Off-Platform Defection signals (Owner–Provider WhatsApp swap attempts, Provider direct-repeat-client negotiation, Owner unprompted Messenger outreach) and to re-engage Providers whose Tier Utilization drops below defined thresholds at 30 / 60 / 90 days.

**Consequences (testable):**
- The Console surfaces a defection-signal dashboard view, organized by Provider and by signal type.
- Tier Utilization is computed per active Provider per month, broken down by Tier (SM in §7).
- The Console flags Providers whose Tier Utilization is below defined thresholds at 30, 60, and 90 days from onboarding.
- An Admin can record re-engagement outreach and outcome against a Provider record.
- Defection signals are soft signals; they do not auto-suspend or auto-remove a Provider.

**Out of Scope:**
- Automated defection-pattern detection across Owners (Owner-side WhatsApp detection requires platform-side signals Admin does not have in v1).
- Bulk re-engagement campaigns.
- Re-engagement messaging templates (Admin-authored in v1).

#### FR-37: Audit log and Admin action attribution

Every Admin action is logged with the Admin identity, timestamp, action type, reason code (where applicable), and target entity. The audit log is retained per FR-10 and is Admin-visible for Vetting Bias Audit purposes.

**Consequences (testable):**
- Every Admin action generates an audit log entry.
- Audit log entries cannot be edited or deleted by Admin in v1.
- Audit log entries are accessible to Admin for Vetting Bias Audit review.
- Audit log retention follows FR-10 (24 months minimum).

**Out of Scope:**
- Audit log export or external SIEM integration in v1.
- Cross-Admin audit log attribution (one Admin in v1).

#### FR-38: Operating Ceiling monitoring

The Console surfaces the Admin's current load against the Operating Ceiling (1 Admin, 25 active Providers, 75 completed Bookings per month). Crossing the ceiling is surfaced as a re-platforming signal.

**Consequences (testable):**
- The Console displays current active Provider count and trailing-30-day completed Booking count.
- The Console flags when either threshold is approached or crossed.
- Approaching the ceiling is surfaced as a re-platforming signal (multi-Admin, RBAC) in a documented format; it is NOT a "stretch goal."

**Out of Scope:**
- Automatic hiring / multi-Admin activation triggers.
- Multi-Admin, RBAC, or delegation tooling in v1.

**Notes:**
- The Console is designed for one operator on a low-end Android phone over intermittent Dhaka connectivity. Performance envelope (initial page load under 2 seconds on 4G) is NFR-4 in §8.
- The Console surfaces the data Admin needs for Vetting Bias Audit and Off-Platform Defection Detection; it does not enforce cadence or auto-act on patterns. Admin judgement remains the v1 decision authority.

### 4.9 Payments and Payouts

**Description:** v1 Payment timing is Capture-on-Confirmation: Payment Authorization is placed at Booking Request submission (FR-15), Payment Capture happens on Provider Confirmation (FR-16), and Payout is released to the Provider net of Platform Commission at Booking Completion (FR-19), subject to Dispute Window freeze (FR-24) and Acute-Event triggers (FR-29).

This rule is driven by the Bangladesh payment-gateway landscape: SSLCommerz, bKash, and Nagad do not natively support card-style escrow pre-auth-hold-then-capture. v1's Capture-on-Confirmation removes Refund friction for Owners and keeps the Provider as the trust gate; the cost is the Confirmed-but-Ghosted Booking risk, which is mitigated by the Confirmation-to-Stay SLA + Admin reassignment flow (FR-18).

The Primary rails are MFS (bKash, Nagad); Card is a secondary option. Platform Commission is deducted before Payout; Tier-A and Tier-B may carry different introductory terms (architecture-stage decision on values).

This feature realizes UJ-1's climax (Bibi's payment captured on confirmation, payout released on completion) and UJ-2's resolution (Rashid's Eid payouts land reliably on the documented cadence).

**Functional Requirements:**

#### FR-39: Capture-on-Confirmation payment timing

Payment Authorization is placed at Booking Request submission; Payment Capture happens on Provider Confirmation. No funds are captured at Booking Request.

**Consequences (testable):**
- Booking Request submission places Payment Authorization; the Authorization holds for the duration of the Confirmation Window.
- Provider Confirmation triggers Payment Capture.
- Provider decline (Structured Decline) or Booking Request timeout releases the Authorization; the Owner is not charged.
- Booking Completion does not trigger a new Payment event; Payment Capture happened at Confirmation.
- Payment Authorization extension beyond the Confirmation Window is an architecture-stage decision (Open Question §9).

**Out of Scope:**
- Native escrow-style pre-auth-hold-then-capture (not supported by the v1 payment-gateway stack).
- Payment installments or split-tender in v1.

#### FR-40: MFS-first payment rails (bKash, Nagad); card secondary

The platform integrates bKash and Nagad as the primary Payment methods; Card is a secondary option. The Payment integration centers on a Bangladesh-compatible gateway (SSLCommerz or equivalent — architecture-stage decision).

**Consequences (testable):**
- An Owner can submit a Booking Request with a bKash or Nagad Payment method without an external redirect to card capture.
- Card Payment is supported but not surfaced as the default.
- Payment integration conforms to the gateway's documented authorization and capture mechanics.

**Out of Scope:**
- Card capture as the only Payment method (MFS-first by policy).
- International payment rails in v1.
- Cryptocurrency or alternative Payment methods.

#### FR-41: Platform Commission deduction and Payout

Platform Commission is deducted before Provider Payout. Tier-A and Tier-B may carry different introductory terms (values are architecture-stage; the PRD names the policy).

**Consequences (testable):**
- A Payout to a Provider equals captured funds minus Platform Commission.
- Platform Commission may differ between Tier-A and Tier-B during introductory terms.
- Payout is released at Booking Completion, subject to Dispute Window freeze (FR-24) and Acute-Event Payout Freeze (FR-29).
- Payout cadence is documented (architecture-stage decision on values; Open Question §9).

**Out of Scope:**
- Dynamic or surge-based commission in v1.
- Provider earnings disclosure to other Providers (likely no — antitrust / transparency concerns; Open Question §9).

#### FR-42: Refund mechanics on Report Resolution and Acute Events

Refunds are issued via the documented Refund policy when Report Resolution applies Resolved — Refund (FR-25) or when Admin determines Refund is appropriate during an Acute Event (FR-29).

**Consequences (testable):**
- An Admin can issue a full or partial Refund against a frozen Payout.
- The Refund returns funds to the Owner through the original Payment method where supported by the gateway.
- Refund mechanics are governed by the Refund policy (architecture-stage decision on values; Open Question §9).

**Out of Scope:**
- Owner-initiated Refund requests outside the Dispute Window (deferred).
- Refund to a different Payment method than the original.

**Notes:**
- Refund policy values (timing, partial-Refund thresholds, gateway-specific mechanics) are Open Questions (§9); the PRD requires the policy exists and is Admin-executable.
- Payout reconciliation drift across MFS settlement, partial Refunds, and Provider Payout cadences is a known operational risk (carried into §11 Risks).

### 4.10 In-Stay Updates and Chat

**Description:** During the Stay, the Provider is expected to post at least one daily update per active Booking (photo, short video, or short note). The Owner and Provider have a booking-scoped chat channel. Updates and Chat are auditable by Admin for cause.

Daily updates are an expected behavior, not a system-enforced requirement: the platform sends reminders and prompts but does not block Booking Completion on missed updates. This keeps the soft-signal nature of Updates intact while not punishing Providers for genuine connectivity gaps.

This feature realizes UJ-1's Stay path (Bibi receives 2 daily updates per day + a chat reply on day 4) and is a routine surface during Eid week (UJ-2, UJ-3).

**Functional Requirements:**

#### FR-43: Daily Updates during Stay

A Provider can post at least one daily Update per active Booking (photo, short video, or short note). The Owner receives Updates as they are posted.

**Consequences (testable):**
- A Provider can post an Update against an active Booking (`in-stay` state).
- An Update can be a photo, short video, or short note.
- The Owner receives Updates through the in-app channel.
- The platform sends reminders and prompts but does not block Booking Completion on missed Updates.

**Out of Scope:**
- Mandatory Update enforcement.
- Real-time Owner presence / read receipts on Updates.
- Provider-editable Update history (Updates are immutable once posted in v1).

#### FR-44: Booking-scoped Chat

Owner and Provider have a booking-scoped Chat channel for the duration of the Booking (from Confirmation through completion or resolution). Chat is auditable by Admin for cause.

**Consequences (testable):**
- An Owner and a Provider can exchange messages within a booking-scoped Chat channel.
- Chat is scoped to the Booking; Chat history does not carry across Bookings.
- Chat is accessible to Admin for cause (e.g. Report investigation, Acute Event coordination).
- Chat data is retained per FR-10.

**Out of Scope:**
- Persistent cross-Booking Chat threads (Chats are Booking-scoped in v1).
- Owner-to-Owner or Provider-to-Provider Chat in v1.
- Voice or video Chat.

**Notes:**
- Whether the daily Update reminder cadence is provider-configurable is an Open Question (§9).
- The Updates-and-Chat feature is operational realism for the curated-supply model; it is not a Differentiator in the trust sense (Reviews and Reports carry the trust signal).

### 4.11 Vet-Clinic Directory

**Description:** A per-Launch-Neighborhood Vet-Clinic Directory is available to Owners and Providers during the Stay. The Directory contains clinic name, address, phone, and basic details (hours, species handled). The platform does NOT run an emergency hotline, does NOT formally partner with clinics, and does NOT recommend or endorse specific clinics in v1. The Directory is a passive lookup tool, not a clinical-care or partnership surface.

This feature realizes the practical side of §4.7: at Acute Event trigger, the Directory entry for the Booking's Launch Neighborhood is one tap away (FR-26, FR-28). Directory freshness is Admin-owned in v1 (architecture-stage decision on cadence and refresh process).

**Functional Requirements:**

#### FR-45: Per-Launch-Neighborhood Vet-Clinic Directory

The platform maintains a Vet-Clinic Directory scoped to Launch Neighborhoods. Each Directory entry includes clinic name, address, phone, and basic details (hours, species handled).

**Consequences (testable):**
- A Vet-Clinic Directory entry exists for each Launch Neighborhood.
- Directory entries are accessible to Owners and Providers during an active Booking.
- The Directory entry for the Booking's Launch Neighborhood is surfaced at Acute Event trigger (FR-26).
- Directory freshness SLA is owned by Admin in v1 (architecture-stage decision on cadence and refresh process; Open Question §9).

**Out of Scope:**
- Formal clinic partnerships, preferred-provider rates, or platform-endorsed recommendations.
- Real-time clinic availability or wait-time data.
- Cross-Launch-Neighborhood search in v1 (Directory is Launch Neighborhood-scoped).
- Clinical / triage data integration.

**Notes:**
- The Vet-Clinic Directory is an operational support surface for Acute Events; it is NOT a Differentiator in the trust sense and is NOT a clinical-care feature.

### 4.12 PWA and Bilingual Surface

**Description:** v1 is a responsive web application, PWA-grade on supported mobile browsers. No native iOS or Android apps in v1. Bangla (default) and English are supported with full parity on Owner- and Provider-facing surfaces; the Admin Console is English-only in v1 (FR-31).

The Bilingual Content policy is pragmatic: Bangla content for names, descriptions, instructions, and Provider profiles must be supported per the §3 Glossary Bilingual Content entry. The data model must allow Bangla content; full i18n infrastructure is explicitly out of scope for v1.

This feature realizes the surface for every Owner and Provider UJ (UJ-1, UJ-2, UJ-4) and the Bilingual requirement from the brief.

**Functional Requirements:**

#### FR-46: Responsive web PWA surface

The platform is delivered as a responsive web application, PWA-grade on supported mobile browsers. No native iOS or Android apps in v1.

**Consequences (testable):**
- All Owner and Provider surfaces are accessible through a supported mobile browser.
- The application meets PWA criteria sufficient for "add to home screen" on supported mobile browsers.
- Native app store listings are not maintained in v1.

**Out of Scope:**
- Native iOS or Android applications.
- App-store ratings as a Success Metric (no native app in v1).

#### FR-47: Bangla + English parity on Owner and Provider surfaces

Bangla (default) and English are supported with full parity on Owner-facing and Provider-facing surfaces. The data model allows Bangla content for names, descriptions, instructions, and Provider profiles per the §3 Glossary Bilingual Content entry.

**Consequences (testable):**
- An Owner can switch the UI between Bangla and English; both languages surface full parity on Owner-facing surfaces.
- A Provider can switch the UI between Bangla and English; both languages surface full parity on Provider-facing surfaces.
- The data model stores Bangla and English content for the documented content types.
- The Admin Console is English-only (FR-31).

**Out of Scope:**
- Full internationalization infrastructure (i18n framework, RTL support, locale-specific formatting beyond Bangla + English) in v1.
- Languages other than Bangla and English.
- Bangla support in the Admin Console.

**Notes:**
- Localization strategy sufficient to support Bangla + English without over-engineering full internationalization is an architecture-stage decision (Open Question §9).

### 4.13 On-Platform Repeat Value Mechanisms

**Description:** Moat Conditionality is the principle that PetCare's 12-month moat only compounds if Owners and Providers continue transacting through the platform rather than via WhatsApp / Messenger / direct negotiation after the first Stay. v1 ships concrete, repeatable value for staying on the platform on both sides — the mechanisms that turn the second Booking into a moat-strengthening event rather than a potential Off-Platform Defection.

Owner-side repeat value comes from the Care History pre-fill (FR-8) and the persistent Pet Profile (FR-6). Provider-side repeat value comes from the Verified Reputation Asset (FR-23, FR-21) and the Repeat-Owner tooling surfaces (request history, prior Care Configurations visible on incoming requests). Both sides also benefit from the predictable Payment timing and Payout cadence (FR-39–FR-42).

This feature realizes UJ-4's climax (Bibi's second Booking through PetCare rather than WhatsApp, with under-4-minute intake) and UJ-4's edge case (provider attempts WhatsApp defection, logged as soft signal in Admin's defection-detection dashboard — FR-36).

**Functional Requirements:**

#### FR-48: Owner-side repeat Booking surface

An Owner can initiate a new Booking against a previously used Provider or Pet with pre-filled Care Configuration (per FR-8) and visible prior Booking history.

**Consequences (testable):**
- An Owner can see a list of prior Bookings on a Provider's profile or on the Pet's record.
- An Owner can initiate a new Booking against a previously used Provider with Care Configuration pre-filled from Care History.
- A "Book again" surface is accessible on a completed Booking.
- The Owner does not need to re-explain Pet Profile, Care Configuration, or special-care flags on a repeat Booking.

**Out of Scope:**
- Cross-Owner shared Pet records in v1.
- Repeat-Booking discount or loyalty pricing in v1.

#### FR-49: Provider-side repeat Owner and repeat Pet tooling

A Provider sees prior Booking history and Care History summary on an incoming Booking Request from a repeat Owner or for a repeat Pet (per FR-9).

**Consequences (testable):**
- A Provider can see prior Confirmed Stays with a particular Owner or Pet on an incoming request.
- A Provider can see the Pet's Care History summary relevant to capability matching on the request.
- The Provider's request view highlights repeat-Owner or repeat-Pet context.

**Out of Scope:**
- Provider-initiated repeat-Owner outreach (deferred; Off-Platform Defection detection is the v1 mechanism, FR-36).
- Provider-controlled Pricing differentiation by repeat-Owner status in v1.

#### FR-50: Off-Platform Defection signal capture

The platform captures Off-Platform Defection signals as soft signals in Admin tooling: Owner–Provider WhatsApp swap attempts (when surfaced via Report or Review), Provider direct-repeat-client negotiation (when surfaced via Owner feedback or Report), Owner unprompted Messenger outreach (when surfaced via Owner or Provider feedback).

**Consequences (testable):**
- Defection signals are captured when surfaced through documented channels (Reports, Reviews, Owner feedback).
- Admin tooling surfaces a defection-signal dashboard (FR-36).
- Defection signals are soft signals; they do not auto-suspend or auto-remove a Provider.
- Defection signals feed the Vetting Bias Audit and Off-Platform Defection detection workflows.

**Out of Scope:**
- Automated WhatsApp / Messenger content scanning (not in v1; signals are surfaced through user-initiated channels).
- Bulk defection-pattern detection (per-event signal in v1).

**Notes:**
- The Defection-signal mechanism depends on Owner and Provider surfacing the behavior through documented channels (Review text, Report, feedback). This is a known limitation — the platform does not detect WhatsApp-side activity in v1. The mechanism improves over time as Owner and Provider feedback increases.

### 4.14 Pre-Launch Validation (Demand and Supply)

*§4.14 is positioned as the closing §4 feature rather than embedded earlier for two reasons: (1) Pre-Launch Validation is launch-blocking pre-flight work, not a runtime Owner / Provider / Admin capability — it does not fit cleanly into §4.13 On-Platform Repeat Value or any prior feature; (2) it sits naturally as the §4 → §5 transition, where §5 enumerates what v1 will *not* build and §4.14 enumerates what v1 must *complete before launch* to be ready. The position is deliberate; downstream architecture and epics can read §4.14 alongside §11 Risks R-1 and R-2 (supply unproven, cold-start death spiral) which it operationalizes.*

**Description:** Pre-Launch Validation is the launch-blocking work that confirms the brief's working hypotheses before the first paid Booking. Two streams: **Pre-launch demand validation** (Owner-side) and **Pre-launch supply assessment** (Provider-side). Both are launch-blocking on the same footing; both were elevated to launch-blocking status in brief rev 3.

The Pre-launch demand validation tests the bet that Dhaka Owners with special-care pets prefer a curated, structured-intake marketplace over the Facebook / Messenger status quo — specifically that the primary pain (trust and quality uncertainty for special-care pets) is real, that special-care willingness-to-pay holds at the platform-commission price point, and that demand density in Launch Neighborhoods justifies the curated-supply economics. Recommended method: 20–30 Owner interviews or a structured-intake waitlist landing page. The decision rule for proceeding vs. re-opening the bet is an Open Question (§9).

The Pre-launch supply assessment inventories curated-eligible Providers in Launch Neighborhoods, names the Tier-A outreach list, sets onboarding throughput targets, and surfaces the waitlist risk if supply is short of demand. This is named as Owed to the PRD in the brief and remains launch-blocking.

**Functional Requirements:**

#### FR-51: Pre-launch demand validation

The platform team conducts a pre-launch demand validation round (20–30 Owner interviews or a structured-intake waitlist landing page) before the first paid Booking. The validation tests the primary pain, the willingness-to-pay range, and demand density in Launch Neighborhoods.

**Consequences (testable):**
- A documented demand-validation plan exists before the first paid Booking.
- The plan tests the primary pain (trust and quality uncertainty for special-care pets), the willingness-to-pay range at the platform-commission price point, and demand density in Launch Neighborhoods.
- A documented pass/fail criterion exists (architecture-stage decision on values; Open Question §9).
- A negative validation result triggers a brief re-open, not a silent scope change.

**Out of Scope:**
- Demand validation as a recurring operational practice (v1 is pre-launch only).
- Automated demand-survey tooling (manual interviews or waitlist landing page in v1).

#### FR-52: Pre-launch supply assessment

The platform team conducts a pre-launch supply assessment: curated-eligible Provider count in Launch Neighborhoods, named Tier-A outreach list, onboarding throughput targets, and waitlist risk analysis.

**Consequences (testable):**
- A documented supply-assessment exists before the first paid Booking.
- The assessment inventories curated-eligible Providers per Launch Neighborhood.
- A named Tier-A outreach list exists with documented outreach status.
- Onboarding throughput targets are documented per Admin-hour budget.
- Waitlist risk is documented and surfaced as a launch readiness signal.

**Out of Scope:**
- Supply assessment as a recurring operational practice (v1 is pre-launch only).
- Automated Provider-discovery tooling (manual outreach in v1).

**Notes:**
- Both Pre-launch Validation streams are launch-blocking on the same footing as the brief's other cannot-be-skipped items (Pre-launch legal review, Bangla-first customer-facing content).
- The decision rule for proceeding vs. re-opening the bet on negative validation is an Open Question (§9); the PRD requires the rule exists, not the specific values.

## 5. Non-Goals (Explicit)

*The brief and §4 already carry feature-level Out-of-Scope items. This section captures the broader "we are not building X / we are not becoming Y" statements that should prevent drift at every level — epic, ticket, code. Inline `[NON-GOAL for MVP]` callouts within §4 cover deferred items within features; this section captures the strategic and product-shape commitments v1 will not make.*

**Strategic and product-shape non-goals:**

- **PetCare is not an open marketplace.** v1 has no self-serve Provider sign-up. All Provider onboarding is Admin-gated (§4.1).
- **PetCare is not a clinical-care or veterinary service.** v1 supports special-care instructions (food, medication, allergy, anxiety, extra attention) but does not accept Bookings whose primary purpose is diagnosis, treatment, clinical monitoring, or veterinary procedures. The platform does not run an emergency hotline, does not formally partner with clinics, and does not employ or contract veterinarians (§4.7, §4.11).
- **PetCare is not a transportation / pickup-and-drop-off service.** No pet transport in v1.
- **PetCare is not a daily-home-visit service.** v1 is boarding-only; daily home visits are deferred to v2.
- **PetCare is not a native mobile application.** v1 ships as a responsive web PWA. No iOS or Android app (§4.12).
- **PetCare is not city-wide on day one.** v1 launches in Gulshan, Banani, Baridhara only; expansion is gated on density validation (§4.3).
- **PetCare is not a global platform.** v1 is Dhaka-only, dogs and cats only.
- **PetCare is not a counter-offer platform.** Provider counter-offers are deferred to v2; v1 is accept-or-decline with Structured Decline.
- **PetCare is not an AI-matching / dynamic-pricing / recommendation system in v1.** v1 captures the data; v1+ consumes it. Demonstrated Care Fit ranking is architecture-stage.

**Operational non-goals:**

- **PetCare is not a multi-Admin platform in v1.** The Operating Ceiling is 1 Admin, 25 active Providers, 75 completed Bookings per month. Multi-Admin, RBAC, and delegation tooling are deferred; the data model and authentication remain extensible so v2+ can add these without re-platforming (§4.8).
- **PetCare is not an off-peak-stimulus platform.** No off-peak promotional pricing, subsidies, or retention incentives in v1; utilization is measured and revisited after data justifies intervention.
- **PetCare is not a Provider-subscription or tiered-membership platform.** Tier-A and Tier-B are curation tiers, not subscription tiers.
- **PetCare is not an insurance underwriter.** Insurance posture is limited to what Bangladesh law requires; no platform-operated insurance product.
- **PetCare is not a WhatsApp / Messenger detection platform.** Off-Platform Defection signals are user-surfaced (Reviews, Reports, Admin feedback); the platform does not scan external messaging activity (§4.13, FR-50).

**Trust and verification non-goals:**

- **PetCare is not a full internationalization infrastructure in v1.** Bangla + English with parity on Owner and Provider surfaces; full i18n framework, RTL support, locale-specific formatting beyond Bangla + English are deferred.
- **PetCare is not an anonymous platform.** Owner identity is verified at Booking (minimum: phone OTP, with name and address per architecture stage); Provider identity is verified pre-listing.
- **PetCare is not a Provider-Counter-Dispute platform.** v1 has Admin moderation of Reviews only; Provider ability to dispute Reviews is deferred.
- **PetCare is not a Provider-Response-to-Reviews platform.** v1 has no Provider-response surface.

**Compliance non-goals:**

- **PetCare is not a clinical-decision platform.** Admin and Provider do not make clinical decisions on behalf of Owners; the platform does not recommend treatments, dosages, or providers of care beyond the Vet-Clinic Directory.
- **PetCare is not a self-regulatory animal-welfare body.** Animal-welfare compliance posture is limited to documented compliance with the Animal Welfare Act 2017 and platform-defined Acute-Event coordination (§4.7).
- **PetCare is not a payment-escrow platform in v1.** v1's Capture-on-Confirmation timing reflects the Bangladesh payment-gateway landscape; native escrow-style pre-auth-hold-then-capture is not supported by the v1 Payment-gateway stack.

## 6. MVP Scope

### 6.1 In Scope

*The v1 MVP includes everything described in §4 Features + FRs. The following is the consolidated capability surface for v1 launch:*

**Owner-facing:**
- Authenticated web PWA access (Bangla + English)
- Pet Profile creation and persistence (FR-6)
- Care History accumulation, pre-fill, and Provider visibility (FR-7, FR-8, FR-9)
- Care History + Booking record retention (FR-10)
- Search across Launch Neighborhoods with curated 3–5 shortlist default + "View all" (FR-11)
- Date-Level Capacity enforcement (FR-12)
- Booking Request submission with Payment Authorization (FR-15)
- Provider Confirmation receipt (FR-16)
- Structured Decline handling on the Owner side (FR-17)
- Stay Updates and Chat consumption (FR-43, FR-44)
- Vet-Clinic Directory lookup during Stay (FR-45)
- Verified Review submission with photos (FR-20, FR-21)
- Report an Issue submission within Dispute Window (FR-24)
- Owner-side repeat Booking surface with Care History pre-fill (FR-48)

**Provider-facing:**
- Authenticated web PWA access (Bangla + English)
- Date-Level Capacity management with Peak Window adjustment (FR-12)
- Booking Request review with Care History visibility (FR-9, FR-49)
- Provider Confirmation or Structured Decline (FR-16, FR-17)
- Daily Updates posting (FR-43)
- Chat with Owner during Stay (FR-44)
- Vet-Clinic Directory lookup during Stay (FR-45)
- Verified Review receipt on Provider Profile (FR-23)
- Tier-A peak-participation prompt (FR-12 + §4.1 Tier-A commercial terms)
- Payout receipt on Booking Completion (FR-19, FR-41)

**Admin-facing (English-only):**
- Queue Dashboard with priority ordering (FR-32)
- Provider application intake and Vetting workflow (FR-33)
- Tier-A outreach artifact recording (FR-1, FR-33)
- Vetting Bias Audit data support and right-of-appeal outcome recording (FR-4)
- Acute Event coordination surface (FR-34)
- Report investigation and Dispute resolution (FR-35)
- Off-Platform Defection signal dashboard (FR-36, FR-50)
- Tier Utilization 30/60/90-day re-engagement (FR-36)
- Payout Reconciliation oversight (FR-41)
- Operating Ceiling monitoring with re-platforming signal (FR-38)
- Audit log review (FR-37)

**Cross-cutting:**
- Bilingual content for Owner and Provider surfaces (FR-47)
- PWA surface on supported mobile browsers (FR-46)
- Pre-launch demand validation and supply assessment as launch-blocking (FR-51, FR-52)
- Care History + Booking record retention (FR-10)
- Acute-Event Response Posture + Runbook as defined artifacts (FR-26 through FR-30)
- Capture-on-Confirmation Payment timing with MFS-primary rails (FR-39, FR-40)
- Platform Commission deduction + Payout (FR-41)
- Refund mechanics on Report Resolution and Acute Events (FR-42)
- Off-Platform Defection signal capture (FR-50)

### 6.2 Out of Scope for MVP

*The following are explicitly NOT in v1. Items deferred to v2+ are tagged accordingly. Items not in v1 at any foreseeable horizon are tagged `[NON-GOAL]` to signal they are not roadmap commitments, just out-of-scope statements.*

**Deferred to v2 (specific roadmap commitments, not yet scheduled):**

- Pickup-and-drop-off service (transport to / from Provider). `[NON-GOAL for MVP]`
- Daily home visits (boarding-only in v1). `[NON-GOAL for MVP]`
- Provider counter-offers (accept-or-decline only in v1). `[NON-GOAL for MVP]`
- Native iOS or Android applications (PWA in v1). `[NON-GOAL for MVP]`
- Multi-Admin, RBAC, delegation tooling (single-Admin in v1). `[NON-GOAL for MVP]`
- City-wide or international expansion (Launch Neighborhoods in v1). `[NON-GOAL for MVP]`
- Subscription tiers for Owners or Providers. `[NON-GOAL for MVP]`
- Provider-initiated repeat-Owner outreach (`[NON-GOAL for MVP]` — see FR-49 Out of Scope)
- Owner appeals or escalation paths for Dispute resolution. `[NON-GOAL for MVP]`
- Automated WhatsApp / Messenger content scanning for Defection detection (`[NON-GOAL for MVP]` — see FR-50 Out of Scope).
- Insurance underwriting or platform-operated insurance product. `[NON-GOAL for MVP]`
- Owner-initiated Refund requests outside the Dispute Window. `[NON-GOAL for MVP]`
- Provider response to Reviews. `[NON-GOAL for MVP]`
- Real-time clinic availability or wait-time data in Vet-Clinic Directory. `[NON-GOAL for MVP]`
- Cross-Launch-Neighborhood Vet-Clinic search (Directory is Launch Neighborhood-scoped in v1). `[NON-GOAL for MVP]`

**Architecture-stage scope (deferred from PRD; PRD names the policy, architecture specifies values):**

- Confirmation Window duration (FR-16). `[Open Question §9]`
- Dispute Window duration (FR-24). `[Open Question §9]`
- Payout cadence (FR-41). `[Open Question §9]`
- Refund policy values and gateway mechanics (FR-42). `[Open Question §9]`
- Vet-Clinic Directory freshness SLA cadence (FR-45). `[Open Question §9]`
- Localization strategy specifics (FR-47). `[Open Question §9]`
- Tier-A introductory commercial terms (commission values, peak-participation terms) (§4.1). `[Open Question §9]`
- Tier-A / Tier-B minimum vetting-bar specifics (what documents, what references). `[Open Question §9]`
- Decline Reason Taxonomy extension beyond the seed categories (FR-17). `[Open Question §9]`
- Cancellation, refund, and no-show policy values (FR-14). `[Open Question §9]`

**Future-version scope (not roadmap commitments; deferred from v1):**

- AI matching, dynamic pricing, or recommendation systems consuming Demonstrated Care Fit data. `[NON-GOAL]`
- Full internationalization infrastructure beyond Bangla + English. `[NON-GOAL]`
- Pet species beyond dogs and cats (birds, fish, reptiles, small mammals). `[NON-GOAL]`
- Provider-Counter-Dispute tooling for Reviews (Admin moderation only in v1). `[NON-GOAL]`
- Owner-side mediation, escalation, or appeal paths for Reports. `[NON-GOAL]`
- Cross-Owner shared Pet records. `[NON-GOAL]`
- Cross-Pet aggregation within an Owner's account. `[NON-GOAL]`
- Persistent cross-Booking Chat threads (Chats are Booking-scoped in v1). `[NON-GOAL]`
- Voice or video Chat. `[NON-GOAL]`
- Auto-suspension of Providers on Acute Event trigger (flag-for-review only in v1). `[NON-GOAL]`
- Mass Provider outreach or auto-approval tooling. `[NON-GOAL]`
- Public post-mortem publication (post-mortems are Admin-internal in v1). `[NON-GOAL]`
- Permanent record retention beyond what law requires. `[NON-GOAL]`
- Pet record import from external systems (vet clinics, microchip registries). `[NON-GOAL]`

**Notes:**
- The MVP scope is bounded by the 1/25/75 Operating Ceiling. Crossing the ceiling is a re-platforming signal (§4.8, FR-38), not a "stretch goal." v2 is gated on operating reality, not on hitting ceiling metrics.
- Items tagged `[NON-GOAL]` are not roadmap commitments. Items tagged `[Open Question §9]` are PRD-required policies with architecture-stage values.

## 7. Success Metrics

*Success Metrics are calibrated to v1's strategic bets: Moat Conditionality, Demonstrated Care Fit, Operating Ceiling sustainability, and the curated-trust promise. Each SM cross-references the FR(s) it validates. Counter-metrics counterbalance primary or secondary metrics where premature optimization would distort behavior. Targets and thresholds are architecture-stage / operational decisions; the PRD names what to measure and why.*

**Primary (north-star, 6–12 month horizon):**

- **SM-1: Completed-and-Reviewed Bookings.** A Booking that reaches `completed` with a written Verified Review submitted is the closest proxy for "the product delivered on its trust promise." Validates FR-19, FR-20, FR-21, FR-23.
- **SM-2: Repeat-Booking Rate.** The share of Owners who book a second time on PetCare after a Completed-and-Reviewed first Booking. This is the cleanest read on whether Moat Conditionality is functioning. Validates FR-7, FR-8, FR-9, FR-48.
- **SM-3: Provider-Side Retention.** The share of Providers who, after their first Completed Booking on PetCare, accept and complete a second Booking on the platform. The curated-supply moat fails if Providers churn out after one Booking. Validates FR-16, FR-19, FR-36.

**Secondary (operational, 0–3 month horizon):**

- **SM-4: Search-to-Request Conversion Rate.** Owner intent strength from curated shortlist to Booking Request. Validates FR-11, FR-12, FR-15.
- **SM-5: Search-Shortlist-to-All-Catalog Rate.** Share of Owners who expand from the 3–5 curated shortlist to the full approved catalog. Reads whether the curated default is the right UX choice. Validates FR-11.
- **SM-6: Provider Confirmation Rate.** Share of Booking Requests that result in Provider Confirmation (vs. timeout / Structured Decline). A low rate signals either misaligned expectations or weak supply. Validates FR-16, FR-17.
- **SM-7: Decline-Reason Distribution (Provider-side).** The taxonomy from FR-17 produces routing data; monitoring distribution tells us whether the platform is matching Pets to Providers correctly or whether special-care Pets are being bounced unnecessarily. Validates FR-17, FR-7.
- **SM-8: Provider Response Time.** Median minutes from Booking Request submission to Provider Confirmation or Structured Decline. Validates FR-16, FR-17.
- **SM-9: Daily-Update Posting Rate during Active Stays.** Soft metric; Updates are not enforced (FR-43). Validates FR-43.
- **SM-10: Verified-Review Rate.** Share of Completed Bookings that produce a written Verified Review. Validates FR-20, FR-21.
- **SM-11: Review-With-Photos Rate.** Share of Verified Reviews that include at least one photo. This is the Day-1 trust differentiator metric: low photo rate weakens the Day-1 trust claim. Validates FR-21.
- **SM-12: Issue-Report Rate.** Share of Completed Bookings where the Owner raises a Report within the Dispute Window. Tracks whether the Report flow is being used appropriately, not over- or under-used. Validates FR-24.
- **SM-13: Provider Utilization by Tier.** Bookings per active Provider per month, broken down by Tier-A vs. Tier-B. The metric that proves the Tier-A commercial arrangement is justified. Validates FR-1, FR-12, FR-36.
- **SM-14: Launch Neighborhood Density.** Bookings per Launch Neighborhood per month. Validates the geographic-phasing decision. Validates FR-13.
- **SM-15: Second-Booking Time (Owner side).** Median minutes from "Book again" tap to Booking Request submission on a repeat Booking (Care History pre-fill + minimal edits). The metric that proves the On-Platform Repeat Value mechanisms are functioning. Realizes UJ-4's climax. Validates FR-8, FR-48.

**Admin / operational health:**

- **SM-16: Admin Intervention Rate, broken down by reason.** Verification, Booking/Payment, Report, Review moderation, User/System issue. The reason breakdown is what makes the metric interpretable; a single aggregate number is not. Validates FR-31 through FR-38.
- **SM-17: % of Bookings Completed Without Any Admin Touch.** The inverse read on SM-16: when this number rises over time, the platform is doing its job without leaning on ops. Validates FR-32.
- **SM-18: Admin Load vs. Operating Ceiling.** Current active Provider count and trailing-30-day Completed Booking count against the 1/25/75 ceiling. Crossing the ceiling is a re-platforming signal. Validates FR-38.
- **SM-19: Acute-Event Post-Mortem Closure Rate.** Share of Acute Events closed with a documented post-mortem entry per FR-30. Validates FR-30, FR-34.
- **SM-20: Acute-Event Time-to-Admin-Page.** Median minutes from Acute Event trigger to Admin's first documented timeline entry. Validates FR-27, FR-34.

**Counter-metrics (do not optimize):**

- **SM-C1: GMV or Booking-revenue as a v1 success metric.** v1 exists to validate the curated-trust moat; premature revenue targets distort Provider approval and Review moderation. Counterbalances SM-1, SM-13.
- **SM-C2: Active-User counts as a v1 success metric.** The Dhaka supply pool is small; chasing downloads produces a directory, not a curated marketplace. Counterbalances SM-4, SM-5.
- **SM-C3: Average Star Rating as the Provider reputation signal.** A single star rating averages across species and special-care needs and obscures Demonstrated Care Fit. Optimizing for average star rating would distort Provider behavior away from special-care acceptance. Counterbalances SM-11 and the demonstrated-care-fit principle.
- **SM-C4: Booking Volume per Launch Neighborhood as the Launch-readiness signal.** Volume alone does not validate density; the right density signal is Completed-and-Reviewed Bookings per neighborhood (SM-1 × SM-14). Optimizing raw volume would pressure Provider approval and Review moderation in the wrong direction. Counterbalances SM-14.
- **SM-C5: Provider Earnings as a Provider-success signal in v1.** Provider earnings are a v2+ health metric; in v1, the curated-supply model accepts the off-peak trough as a feature. Optimizing for Provider earnings would distort Admin re-engagement decisions and could lead to off-peak-stimulus thinking the brief explicitly excludes. Counterbalances SM-13.

**Explicitly NOT measured in v1:**

- App-store ratings — no native app ships in v1 (FR-46).
- International expansion metrics — Dhaka-only in v1 (§5).
- NPS or generic satisfaction scores — too coarse for v1's signal needs.

**Notes:**
- Targets and thresholds for SM-1 through SM-20 are architecture-stage / operational decisions; the PRD names what to measure and why. The brief explicitly states that "anything that would force us to invent a target number today — booking volume, MAU, conversion rate, NPS, revenue — is deferred to the PRD, where it can be tied to a realistic baseline after the first pilot cycle." This PRD preserves that discipline: SMs name the metrics; numerical targets come after the first pilot.
- Counter-metrics are as load-bearing as primary metrics. They prevent the architect from optimizing the wrong thing and the developer from gaming the wrong target.

## 8. Cross-Cutting Non-Functional Requirements

*System-wide non-functional requirements not tied to a single feature. These are platform-level qualities that every feature must respect; architecture specifies implementation.*

### 8.1 Performance and Reliability

- **NFR-1: Initial page payload under 500 KB on 4G.** Images lazy-loaded; works on low-end Android devices on intermittent connections. Validates FR-46, FR-47.
- **NFR-2: Time-to-interactive under 3 seconds on 4G for Owner and Provider primary surfaces.** Validates FR-46, FR-47.
- **NFR-3: Search response time under 1 second (p95) on 4G for the curated shortlist endpoint.** Validates FR-11, FR-12.
- **NFR-4: Admin Console initial load under 2 seconds on a low-end Android phone over intermittent Dhaka 4G.** Validates FR-32.
- **NFR-5: Platform uptime target of 99.5% monthly during Booking-peak hours.** Off-hours uptime may be lower; the platform is not a 24/7 service in v1. Validates FR-15, FR-16, FR-19.

### 8.2 Security and Data Protection

- **NFR-6: Owner identity verified at Booking (minimum: phone OTP, with name and address per architecture stage).** Owner identity is not anonymous. Validates FR-15, §5 Non-Goals.
- **NFR-7: Provider identity and address verified pre-listing.** Verification artifacts (NID, address proof, references) stored separately from the public Provider Profile; Admin-visible, not Owner-visible. Validates FR-3, FR-5.
- **NFR-8: In-Stay Chat and Updates are auditable by Admin for cause.** Chat and Update data is retained per FR-10 and is queryable by Admin for Report investigation, Acute Event coordination, and Vetting Bias Audit. Validates FR-44, FR-27, FR-30, FR-37.
- **NFR-9: Payment data handled through a Bangladesh-compatible Payment gateway with documented PCI-conformant tokenization.** Card data, where captured, is handled by the gateway, not by PetCare. Validates FR-39, FR-40.
- **NFR-10: Care History and Booking records are retained per FR-10 with privacy and access controls enforced.** Owner-facing surfaces only expose Care History the Owner has access to. Validates FR-7, FR-8, FR-9, FR-10.
- **NFR-11: Vetting Bias Audit data is Admin-accessible and audit-logged.** Audit log immutable per FR-37. Validates FR-4, FR-37.

### 8.3 Localization and Accessibility

- **NFR-12: Bangla (default) and English content parity on Owner and Provider surfaces.** Bangla content (names, descriptions, instructions, profiles) supported per the §3 Glossary Bilingual Content entry. Validates FR-47.
- **NFR-13: Admin Console English-only.** No Bangla in Admin UI in v1. Validates FR-31, FR-47.
- **NFR-14: Mobile-first responsive design across Owner, Provider, and Admin surfaces.** PWA-grade on supported mobile browsers. Validates FR-46, FR-31.
- **NFR-15: Functional on low-end Android devices (Android 9+, 2 GB RAM minimum) on intermittent Dhaka 4G.** Validates NFR-1, NFR-2, NFR-4, FR-46.

### 8.4 Operational and Compliance Posture

- **NFR-16: Animal Welfare Act 2017 compliance posture documented pre-launch.** Compliance checklist owned by Admin and surfaced for legal review. Validates §5 Compliance non-goals, FR-52.
- **NFR-17: Data-protection posture documented pre-launch.** Draft Data Protection Act 2023 readiness; Care History + Booking record retention behavior conditional on legal/compliance validation. Validates FR-10, NFR-10.
- **NFR-18: Tax treatment of Platform Commission documented pre-launch.** Compliance posture owned by Admin. Validates FR-41.
- **NFR-19: Trade licensing posture documented pre-launch (where applicable to Platform operations in Bangladesh).** Validates §5 Compliance non-goals.
- **NFR-20: Pre-launch legal review completed and documented before the first paid Booking.** Cannot-be-skipped per brief rev 3. Validates FR-52.

### 8.5 Auditability and Traceability

- **NFR-21: Every Admin action is logged per FR-37 with identity, timestamp, action type, reason code, and target entity.** Audit log entries cannot be edited or deleted by Admin in v1; retained per FR-10. Validates FR-37, FR-4.
- **NFR-22: Every Booking state transition is logged with timestamp and trigger.** Booking State Machine transitions are observable for Report investigation and post-mortem practice. Validates FR-14, FR-19.
- **NFR-23: Every Payment event (Authorization, Capture, Refund, Payout Freeze, Payout Release) is logged with timestamp, gateway reference, and Booking reference.** Validates FR-39, FR-40, FR-41, FR-42.

### 8.6 Trust-Signal Discipline

- **NFR-24: No paid placement in search results.** Search results are never ordered by paid placement; "sponsored" markers are not surfaced. Validates FR-11.
- **NFR-25: No surge pricing or dynamic commission in v1.** Pricing and commission are static for the v1 Booking lifecycle. Validates FR-41, §5 Operational non-goals.
- **NFR-26: Demonstrated Care Fit data is captured but not consumed for v1 ranking.** v1 ranking is Tier + Launch Neighborhood density + Date-Level Capacity only. Validates FR-11, §5 Strategic non-goals.

**Notes:**
- NFRs are platform-level qualities; specific implementation choices (e.g. which Payment gateway, which CDN, which i18n library) are architecture-stage decisions.
- NFR-16 through NFR-20 (compliance posture) are launch-blocking per the brief's cannot-be-skipped list; the PRD requires they be documented before the first paid Booking.

## 9. Open Questions

*Open Questions are PRD-required policies whose specific values are architecture-stage / operational / legal decisions. The PRD requires the policy or mechanism exists; the values are resolved downstream. Each OQ references the FR(s) it relates to.*

### 9.1 Booking Lifecycle and Payment Timing

- **OQ-1: Confirmation Window duration.** Base duration + peak adjustment policy. (FR-16)
- **OQ-2: Dispute Window duration.** How long after Booking Completion the Owner can raise Report an Issue. (FR-24)
- **OQ-3: Payout cadence.** Frequency and timing of Provider Payouts. *Directional default:* **weekly batched MFS payouts** for v1, with on-Completion payout for Verified Reviews with photos as a v2 candidate. Architecture stage refines the directional default against gateway mechanics, Provider cash-flow expectations, and reconciliation complexity. (FR-41)
- **OQ-4: Refund policy values.** Full vs. partial Refund thresholds, gateway mechanics, timing. (FR-42)
- **OQ-5: Payment Authorization extension policy.** Whether Authorization holds beyond the Confirmation Window for repeat-Booking scenarios. (FR-39)
- **OQ-6: Cancellation, no-show, and refund policy specifics.** State-machine transitions for cancellation paths (Owner-cancel, Provider-cancel, no-show Owner, no-show Provider); Refund mechanics for each path. (FR-14)
- **OQ-7: Whether Card capture is supported in v1 or deferred until MFS proves out.** Brief notes Card as secondary; the platform may defer Card integration entirely until MFS volume justifies it. (FR-40)

### 9.2 Provider Operations

- **OQ-8: Tier-A introductory commercial terms.** Commission values, peak-participation terms, introductory duration. *Directional bands:* **Tier-A introductory commission 8–12%** vs. **Tier-B standard 15–18%** for the first 90 days post-approval, after which Tier-A rates move to a smaller ongoing differential (e.g. 12–14% vs. Tier-B 15–18%). Tier-A peak-participation terms (lower commission during documented Peak Windows) apply for the introductory period. Architecture stage refines bands against actual Provider economics from the first pilot cycle. (FR-1, FR-12)
- **OQ-9: Tier-A / Tier-B minimum Vetting bar specifics.** Which documents (NID, trade license, references); SLA for application review; Tier-A additional artifacts. (FR-3, FR-33)
- **OQ-10: Decline Reason Taxonomy extension beyond the seed categories.** Whether the seed taxonomy is sufficient for v1 or extended (e.g. multi-Pet households, exotic-breed-specific reasons). (FR-17)
- **OQ-11: Re-engagement Flow thresholds.** Tier Utilization thresholds at 30 / 60 / 90 days. *Directional bands:* **<40% at day 30 → soft outreach** (Admin notes the signal, no Provider-facing action); **<30% at day 60 → active outreach** (Admin sends a re-engagement message); **<20% at day 90 → review-for-suspension** (Admin evaluates whether the Provider relationship is worth continuing). Architecture stage refines bands against actual Tier Utilization distribution from the first pilot cycle. (FR-36)
- **OQ-12: Whether the daily-Update reminder cadence is provider-configurable.** (FR-43)
- **OQ-13: Density validation thresholds for Launch Neighborhood expansion.** Bookings per Launch Neighborhood per month before expansion is approved. (FR-13)
- **OQ-14: Whether Provider earnings should be exposed to other Providers.** Brief flags "likely no — antitrust and transparency concerns." (FR-41 Out-of-Scope)
- **OQ-15: Named Tier-A anchor Providers at launch and outreach status.** (FR-1, FR-52)

### 9.3 Vet-Clinic Directory

- **OQ-16: Vet-Clinic Directory freshness SLA cadence.** How often Admin refreshes Directory entries; what "fresh" means. (FR-45)

### 9.4 Localization and Surface

- **OQ-17: Localization strategy specifics.** Bangla + English without over-engineering full i18n — slug generation, search indexing, URL handling, name transliteration. (FR-47)

### 9.5 Acute Event and Compliance

- **OQ-18: Pre-launch legal review scope.** Animal Welfare Act 2017, draft Data Protection Act 2023, trade licensing, tax treatment of Platform Commission — all need documented position before the first paid Booking. (NFR-16, NFR-17, NFR-18, NFR-19, NFR-20)
- **OQ-19: Care History + Booking record retention floor (24 months) vs. longer legal minimums.** Compliance validation may impose longer retention; the PRD names 24 months as the floor with longer retention where required by law. (FR-10, NFR-17)
- **OQ-20: Acute-Event Runbook notification cadence values + communication templates.** The Runbook exists per FR-30; the specific cadence values and templates are Admin-authored and refined over time. (FR-30, FR-34)

### 9.6 Pre-Launch Validation

- **OQ-21: Demand-validation pass/fail criterion.** What constitutes a passing demand validation result (Owner interviews, waitlist landing page conversion, special-care willingness-to-pay threshold). (FR-51)
- **OQ-22: Decision rule for proceeding vs. re-opening the brief on negative validation.** Whether the decision is a hard re-open, a conditional re-open, or a documented scope change. (FR-51)

### 9.7 Expat / Diplomatic Segment

- **OQ-23: Whether an expat-facing version of the UI is required in v1 or only Bangla-first.** Brief flags as deferred acquisition; the bilingual UI does not lock expats out but may not optimize for them. (FR-47, §2.2 Non-Users)

### 9.8 Cross-Stage Scope

- **OQ-24: When v2 deferrals become active work.** Pickup/drop-off, daily home visits, counter-offers, native apps, multi-Admin, subscription tiers — what triggers activation (Operating Ceiling approach? demand signal? funding event?). (FR-38, §6.2 Deferred to v2)
- **OQ-25: Demonstrated Care Fit ranking consumption timing.** Whether v1+ (architecture-stage or v2) consumes Care History + Verified Review + Decline Reason distribution data for ranking. (FR-11, §5 Strategic non-goals)

**Notes:**
- OQs are not silent gaps. They are documented policies whose values are resolved at the next stage (architecture, operations, legal review). The PRD requires the policy or mechanism exists.
- OQ-21 and OQ-22 (Pre-launch Validation) are launch-blocking per brief rev 3. Negative validation triggers a brief re-open, not a silent scope change.

## 10. Assumptions Index

*Every `[ASSUMPTION]` introduced across this PRD is surfaced here for explicit confirmation. Assumptions are inferences made during PRD drafting that have not been validated against reality, legal review, or operational data. They are not gaps; they are tagged inferences that the team has committed to validating before they harden into decisions.*

*Boundary with §11 Risks: an Assumption is a tagged inference about how something works (e.g. "Tier-A peak participation is a meaningful Tier-A fit signal"); a Risk is a named threat with likelihood and impact (e.g. "Dhaka supply pool is unproven"). A single situation can produce both — e.g. the assumption that Capture-on-Confirmation is the right Payment-timing rule (A-8) is paired with the risk that gateway support may change. §10 tracks inference-validation; §11 tracks threat-mitigation. Both surface as launch-blocking work in their own right.*

*The Assumptions Index is organized by section. Each assumption lists its source location, a short description, and the resolution path.*

### 10.1 From §1 Vision

- **[A-1] The Moat Conditionality principle is operationally enforceable.** *Source: §1, §4.13.* The principle that the 12-month moat only compounds if Owners and Providers continue transacting through PetCare assumes that the On-Platform Repeat Value mechanisms (FR-48, FR-49, FR-50) are sufficient to defend against WhatsApp / Messenger / direct-negotiation defection at scale. *Resolution path:* validated through SM-2 (Repeat-Booking Rate), SM-15 (Second-Booking Time), and the Off-Platform Defection signal dashboard (FR-36, FR-50) over the first 6 months post-launch.

### 10.2 From §4.1 Tier-A / Tier-B Provider Model

- **[A-2] Tier-A and Tier-B can share the same minimum Vetting bar.** *Source: §4.1, FR-3.* The decision that both Tiers share the same minimum Vetting bar (with Tier-A additionally requiring Admin-personal outreach) assumes that the same bar produces comparable Trust Signal strength across Tiers over time. *Resolution path:* validated through Tier Utilization parity (SM-13) and Verified Review aggregate comparison across Tiers; if Tier-A systematically outperforms Tier-B on perceived trust, the bar may need to differ.
- **[A-3] Tier-A peak participation is a meaningful Tier-A fit signal.** *Source: §4.1, FR-1, FR-12.* The decision to treat Peak Window capacity adjustment as one signal of Tier-A fit assumes Providers who adjust capacity for known peaks are systematically better-fit as anchors than those who do not. *Resolution path:* validated through Tier Utilization (SM-13) and Admin review of Tier-A peak-participation patterns; if the signal does not correlate with downstream quality, Tier-A fit criteria may need adjustment.

### 10.3 From §4.2 Pet Profile and Care History

- **[A-4] Care History visibility to Providers is sufficient but not over-shared.** *Source: §4.2, FR-9, FR-49.* The decision to expose Care History to Providers on incoming requests assumes the visibility boundary described (capability-relevant subset, read-only) is sufficient for repeat-Booking confidence without enabling off-platform replication. *Resolution path:* validated through SM-2 (Repeat-Booking Rate) and the Off-Platform Defection signal dashboard (FR-36, FR-50); if Providers systematically move repeat-Owner Bookings off-platform after seeing Care History visibility, the boundary needs tightening.

### 10.4 From §4.3 Search and Discovery

- **[A-5] The curated 3–5 shortlist is the right default UX choice.** *Source: §4.3, FR-11.* The decision to default search results to a 3–5 curated shortlist (with "View all" as a secondary action) assumes Owners prefer a curated default over a full-catalog view in a Dhaka curated-marketplace context. *Resolution path:* validated through SM-5 (Search-Shortlist-to-All-Catalog Rate); if expansion rate is consistently high or low, the default may need adjustment.
- **[A-6] Launch Neighborhood density validating can be measured per neighborhood.** *Source: §4.3, FR-13.* The decision to gate Launch Neighborhood expansion on per-neighborhood density assumes density is a meaningful signal at the neighborhood level (Gulshan, Banani, Baridhara). *Resolution path:* validated through SM-14 (Launch Neighborhood Density); if density varies materially across neighborhoods, the gating logic may need neighborhood-specific calibration.

### 10.5 From §4.4 Booking Lifecycle

- **[A-7] The 9-state Booking State Machine is sufficient for v1.** *Source: §4.4, FR-14.* The decision to model Booking state with 9 states (requested, authorized, captured, declined, in-stay, completed, disputed, resolved, refunded) assumes these states cover all v1 Booking transitions. *Resolution path:* validated through Report investigation (FR-35) and Acute Event handling (FR-26 through FR-30); if real-world incidents require states not covered, the state machine may need extension.
- **[A-8] Capture-on-Confirmation is the right Payment-timing rule for v1.** *Source: §4.4, FR-16, FR-39.* The decision to capture Payment on Provider Confirmation (rather than at Booking Request) assumes the Bangladesh payment-gateway landscape does not support card-style escrow pre-auth-hold-then-capture, and that Capture-on-Confirmation is the cleanest available mechanism. *Resolution path:* validated against current SSLCommerz / bKash / Nagad documentation pre-launch; if gateway support changes, the policy may need revision.

### 10.6 From §4.5 Reviews and §4.6 Disputes

- **[A-9] Reviews and Reports being independent records is the right structural choice.** *Source: §4.5, FR-22, §4.6, FR-24.* The decision that Verified Reviews and Reports do not retroactively affect each other assumes Owners and Providers experience the independence as fair. *Resolution path:* validated through Admin moderation patterns and Report resolution outcomes; if the independence produces unfair outcomes (e.g. a verified Review standing while a Report for the same incident resolves against the Provider), the structure may need revision.
- **[A-10] The 3-outcome Dispute model is sufficient for v1.** *Source: §4.6, FR-25.* The decision to model Dispute resolution with 3 outcomes (Resolved — No Action, Resolved — Refund, Resolved — Provider Action) assumes these cover all v1 Report resolution paths. *Resolution path:* validated through Report investigation patterns (FR-35); if real Reports require outcomes not covered (e.g. partial Provider Action, mediation), the model may need extension.

### 10.7 From §4.7 Acute Event

- **[A-11] The Acute-Event Response Posture is operationally realistic for a single-Admin v1.** *Source: §4.7, FR-26 through FR-30.* The decision to define a platform-coordination role for Admin during Acute Events assumes a single Admin can execute the documented Posture under Eid-week load (UJ-3) without becoming a bottleneck. *Resolution path:* validated through SM-20 (Acute-Event Time-to-Admin-Page) and SM-16 (Admin Intervention Rate); if the Posture produces Admin overload, the role split or scope may need adjustment.
- **[A-12] Acute Events trigger Payout Freeze, not Provider auto-suspension.** *Source: §4.7, FR-29.* The decision that Acute Events trigger automatic Payout Freeze but flag-for-review (rather than auto-suspend) assumes auto-suspension would be punitive and distort Provider behavior. *Resolution path:* validated through Provider retention patterns (SM-3) and Report resolution outcomes (FR-35); if the flag-only posture produces systemic Provider-behavior issues, the suspension policy may need revision.

### 10.8 From §4.8 Admin Console

- **[A-13] The Operating Ceiling (1/25/75) is the right v1 scale limit.** *Source: §4.8, FR-38.* The decision to lock v1 to 1 Admin, 25 active Providers, 75 completed Bookings per month assumes this is the realistic ceiling for a single operator on a low-end Android phone over intermittent Dhaka connectivity. *Resolution path:* validated through SM-18 (Admin Load vs. Operating Ceiling); if Admin reaches the ceiling and the Console performs adequately, the ceiling may need upward revision.
- **[A-14] Defection signals are user-surfaced only.** *Source: §4.8, FR-36, FR-50.* The decision that Off-Platform Defection signals are captured only through Reviews, Reports, and Admin feedback (rather than automated WhatsApp / Messenger scanning) assumes the platform does not attempt direct detection of external messaging activity in v1. *Resolution path:* validated through Defection signal dashboard (FR-36) over the first 6 months; if signal volume is insufficient, the mechanism may need expansion (deferred to v2+ per §6.2).

### 10.9 From §4.9 Payments and Payouts

- **[A-15] Refund mechanics are Admin-issued, not Owner-initiated outside the Dispute Window.** *Source: §4.9, FR-42.* The decision that Refunds are issued by Admin on Report Resolution or Acute Event, rather than Owner-initiated outside the Dispute Window, assumes Admin mediation is the appropriate v1 mechanism. *Resolution path:* validated through Issue-Report Rate (SM-12) and Admin Intervention Rate (SM-16); if Owner-initiated Refund requests emerge as a real pattern, the mechanism may need extension.

### 10.10 From §4.12 Bilingual Surface

- **[A-16] Bilingual parity without full i18n is feasible for v1.** *Source: §4.12, FR-47.* The decision to support Bangla + English with full parity on Owner and Provider surfaces without shipping full i18n infrastructure assumes the data model and content types can support Bangla without locking in i18n-framework-specific assumptions. *Resolution path:* validated through localization strategy execution (OQ-17) at architecture stage; if i18n-lite proves infeasible, scope may need adjustment.

### 10.11 From §4.13 On-Platform Repeat Value

- **[A-17] The Care History pre-fill mechanism is the load-bearing On-Platform Repeat Value surface.** *Source: §4.13, FR-48, FR-49.* The decision that Care History pre-fill (rather than reputation ranking or repeat-Booking discounts) is the primary mechanism for On-Platform Repeat Value assumes the second-Booking experience is the load-bearing moment for Moat Conditionality. *Resolution path:* validated through SM-15 (Second-Booking Time) and SM-2 (Repeat-Booking Rate); if pre-fill speed or quality does not produce repeat-Booking behavior, the mechanism may need rebalancing.

### 10.12 From §4.14 Pre-Launch Validation

- **[A-18] 20–30 Owner interviews (or waitlist landing page) is sufficient sample size for Pre-launch Demand Validation.** *Source: §4.14, FR-51.* The decision to use 20–30 Owner interviews (or a structured-intake waitlist landing page) as the validation method assumes this sample is sufficient to confirm or disconfirm the primary pain hypothesis in Dhaka. *Resolution path:* validated through the demand-validation plan execution; if the sample produces ambiguous results, the method may need extension.
- **[A-19] Pre-launch Supply Assessment is a manual, Admin-conducted inventory.** *Source: §4.14, FR-52.* The decision that the Pre-launch Supply Assessment is a manual outreach and inventory (rather than automated Provider-discovery tooling) assumes manual effort is the right mechanism for the curated-supply model in v1. *Resolution path:* validated through the supply-assessment execution; if manual effort is insufficient to inventory curated-eligible Providers, the method may need extension.

### 10.13 From §5 Non-Goals

- **[A-20] Off-Peak Trough is a feature, not a problem to solve in v1.** *Source: §5 Operational non-goals.* The decision that v1 accepts the off-peak trough as a feature of the curated-supply model (rather than introducing off-peak-stimulus mechanisms) assumes the trough does not threaten Provider retention at the operating scale v1 targets. *Resolution path:* validated through SM-3 (Provider-Side Retention) and SM-13 (Provider Utilization by Tier); if trough periods produce systematic Provider churn, the policy may need revision.

### 10.14 From §7 Success Metrics

- **[A-21] Numerical targets for SMs are deferred until after the first pilot cycle.** *Source: §7.* The decision to defer numerical targets for SM-1 through SM-20 until after the first pilot cycle assumes the brief's discipline (avoiding invented target numbers) is correct and that pilot data will produce more grounded targets than pre-launch guesswork. *Resolution path:* validated through the first pilot cycle's actual measurement; targets emerge from the data, not from the PRD.

**Notes:**
- Assumptions are tagged inferences, not gaps. They are validated through measurement and operational reality, not through argument.
- Negative validation of any assumption triggers a PRD revision (or brief re-open if the assumption is strategic), not a silent scope change.

## 11. Risks

*Risks carried from the brief (rev 3) and expanded where the PRD introduces operational specifics. Each risk is named, characterized by likelihood and impact, and tagged with the mitigation owned by the PRD / architecture / operations.*

### 11.1 Product and Market Risks

- **R-1: Dhaka supply pool is unproven (launch-blocking).** Curated-only is the right model, but the curated-eligible Provider count in Dhaka is unknown. If the supply pool is thin, Owners face waitlists and churn back to Facebook / Messenger before the curated moat has a chance to compound. *Likelihood: high. Impact: critical.* *Mitigation: FR-52 (Pre-launch Supply Assessment).*
- **R-2: Curated supply has a cold-start death spiral.** Even with Launch Neighborhoods locked, Admin cannot vet Providers without applications, Providers will not apply without demand, and Owners will not book without a credible catalog. Pre-launch Tier-A outreach and Tier-B application flow must happen before the first Booking. *Likelihood: medium. Impact: critical.* *Mitigation: FR-33 (Provider intake and Vetting workflow); FR-51, FR-52 (Pre-launch Validation).*
- **R-3: Availability is a major secondary pain, especially at Peak.** The curatorial model restricts supply relative to the open informal market. If Peak-week availability collapses, Owners defect back to FB / Messenger for capacity, not quality. Eid, December, and summer weeks will stress capacity. *Likelihood: high. Impact: high.* *Mitigation: FR-12 (Date-Level Capacity); FR-13 (Launch Neighborhood filtering); §5 Strategic non-goal (no surge pricing).*
- **R-4: Demand is spiky, not steady.** Peak weeks around Eid, December holidays, and summer vacation stress Provider capacity; off-peak weeks starve Providers of Bookings and tempt them off the platform. *Likelihood: high. Impact: high.* *Mitigation: FR-36 (Re-Engagement Flow); SM-13 (Provider Utilization by Tier); §5 Operational non-goal (off-peak trough acceptance).*
- **R-5: Verified Reviews alone may not be sufficient for first-time Bookings.** Reviews from strangers carry less weight than personal recommendation or visible care signals. The product supports this in v1 with daily Update reminders, Vet-Clinic Directory access, Tier-A admin-introduced badge, and Vet-affiliation display where applicable. *Likelihood: medium. Impact: medium.* *Mitigation: FR-21 (Review content); FR-23 (Review visibility); §4.1 Notes (Tier-A admin-introduced badge); revisit at the 6-month mark per SM-11.*
- **R-6: Provider-Vetting bias is a structural risk.** Vetting criteria that proxy for protected characteristics (gender, religion, neighborhood, nationality) are both ethically and legally problematic. The absence of a transparent, bias-aware Vetting process erodes the curated-trust promise. *Likelihood: medium. Impact: critical.* *Mitigation: FR-4 (Vetting Bias Audit + right-of-appeal); FR-37 (audit log).*
- **R-7: Special-care Bookings are higher-stakes and slower-to-Confirm.** The 12-month bet concentrates on special-care Pets. These Bookings are higher-stakes for Owners, higher-effort for Providers, more likely to be declined on capability grounds, and slower to Confirm. If the platform optimizes for special-care, baseline economics shift: lower throughput per Booking-hour, higher dispute probability, higher Admin load per Booking. *Likelihood: high. Impact: high.* *Mitigation: FR-17 (Structured Decline); FR-25 (Dispute resolution); FR-30 (post-mortem practice); FR-35 (Report investigation).*
- **R-8: Provider churn after a slow month.** Tier-B Providers in particular may leave if they do not see Bookings in the first 60 days. Off-peak weeks compound this. Supply acquisition is expensive (Admin hours per Provider). *Likelihood: medium. Impact: high.* *Mitigation: FR-36 (Re-Engagement Flow at 30/60/90 days); SM-3 (Provider-Side Retention).*
- **R-9: Species-mismatch risk in existing Dhaka supply.** Most existing Dhaka boarding is implicitly dog-first or dog-only; cats are deprioritized or excluded. If Providers overstate cat capacity and then have to decline cat Bookings, the 12-month bet on dogs-and-cats weakens. *Likelihood: medium. Impact: medium.* *Mitigation: FR-12 (per-species Date-Level Capacity); FR-17 (Structured Decline with reason recorded); SM-7 (Decline-Reason Distribution).*
- **R-10: Acute Events during a Stay are inevitable and platform-shaping.** A Pet will get sick, get hurt, or die in a Provider's care at some point during the v1 horizon — statistically, with the booking volume the Operating Ceiling implies, this is a near-certainty. How the platform detects, responds to, communicates around, and recovers from an Acute Event is the single biggest test of whether Owners trust it with the next Stay. *Likelihood: high. Impact: critical.* *Mitigation: FR-26 through FR-30 (Acute-Event Response Posture + Runbook); FR-29 (Payout Freeze + Dispute Window open); FR-30 (post-mortem practice); §4.7 boundary (operational coordination, not clinical care).*

### 11.2 Operational Risks

- **R-11: Provider quality is Admin-dependent.** A single bad Stay — mishandled medication, lost Pet — destroys more trust than ten good Stays build. Admin moderation has to be consistent and fast. *Likelihood: medium. Impact: critical.* *Mitigation: FR-32 (Queue Dashboard); FR-35 (Report investigation); FR-37 (audit log); §6 Operational non-goals (single-Admin reality).*
- **R-12: No-show on both sides.** Owners who do not show up for a Confirmed Stay; Providers who Confirm and then ghost. Both are real and need explicit handling. *Likelihood: medium. Impact: high.* *Mitigation: FR-18 (Confirmation-to-Stay SLA + Admin reassignment); OQ-6 (Cancellation, no-show, refund policy specifics).*
- **R-13: Payment reconciliation drift.** MFS settlement timing, partial Refunds, and Provider Payouts running on different cadences create an operational accounting problem that grows with volume. *Likelihood: high. Impact: medium.* *Mitigation: FR-41 (Payout cadence documented); NFR-23 (every Payment event logged); OQ-3 (Payout cadence value).*
- **R-14: Eid-week booking compression and infrastructure unreliability.** Dhaka has regular load-shedding and intermittent connectivity. A Provider who cannot post a daily Update because of a 4-hour power cut is not a quality issue. Confirmation windows that assume steady connectivity will produce false cancellations during infrastructure events. *Likelihood: high. Impact: medium.* *Mitigation: FR-43 (Update reminders, no enforcement); FR-18 (Confirmation-to-Stay SLA with Admin reassignment); NFR-15 (functional on intermittent 4G); Vet-Clinic Directory accessible offline-first per FR-45.*
- **R-15: Defection-signal capture is user-surfaced only.** Off-Platform Defection signals are captured only through Reviews, Reports, and Admin feedback — the platform does not attempt direct detection of external messaging activity in v1. If signal volume is insufficient, Moat Conditionality cannot be validated. *Likelihood: medium. Impact: high.* *Mitigation: FR-36 (Defection-signal dashboard); FR-50 (signal capture through documented channels); A-14 (validation through first 6 months of dashboard data).*

### 11.3 Regulatory and Ethical Risks

- **R-16: Local regulatory clarity is incomplete.** Trade licensing, Animal Welfare Act 2017 compliance, draft Data Protection Act 2023 obligations, and tax treatment of Platform Commission are partially specified at the time of writing. *Likelihood: high. Impact: high.* *Mitigation: NFR-16 through NFR-20 (Compliance posture documented pre-launch); FR-52 (Pre-launch Supply Assessment includes regulatory posture); OQ-18 (Pre-launch legal review scope).*
- **R-17: Animal-welfare incident handling.** If a Pet is injured or dies in a Provider's care, the platform's role and liability need to be defined clearly before launch — not after the first incident. *Likelihood: medium. Impact: critical.* *Mitigation: FR-26 through FR-30 (Acute-Event Response Posture + Runbook); OQ-20 (Runbook cadence values + templates); NFR-21 (audit log).*
- **R-18: Vetting Bias Audit drift.** If Vetting Bias Audit cadence is Admin-discretion in v1 (per FR-4), audit frequency may degrade over time without explicit accountability. *Likelihood: medium. Impact: medium.* *Mitigation: FR-37 (audit log); NFR-21 (every Admin action logged); operational discipline rather than platform-enforced cadence in v1.*

### 11.4 Architectural and Scope Risks

- **R-19: Architecture-stage scope creep.** Many Open Questions (§9) and architecture-stage decisions (OQ-1 through OQ-25) are deferred to the next stage. If the architecture stage introduces strategic decisions not in the PRD, scope drift occurs. *Likelihood: medium. Impact: medium.* *Mitigation: brief re-open protocol for strategic changes; architecture-stage review against §4 Feature scope; §6 MVP Scope boundaries.*
- **R-20: Operating Ceiling breach without re-platforming decision.** If Admin Load approaches or crosses the 1/25/75 ceiling (SM-18), the v1 Console may degrade without a deliberate re-platforming decision being made. The brief's framing is that crossing the ceiling is a structural signal, not a stretch goal. *Likelihood: medium. Impact: high.* *Mitigation: FR-38 (Operating Ceiling monitoring with re-platforming signal); §5 Operational non-goal (single-Admin reality); OQ-24 (v2 deferral activation triggers).*

**Notes:**
- Risk likelihoods and impacts are calibrated to v1 reality at the Operating Ceiling scale (1/25/75). At v2+ scale, certain risks (R-13 reconciliation, R-11 quality at volume) would re-emerge with different likelihoods.
- R-1, R-2, R-10, R-16, R-17 are launch-blocking per brief rev 3 cannot-be-skipped items.
- R-19 and R-20 are meta-risks about the PRD-to-architecture handoff itself; they are surfaced here for visibility, not for FR coverage.






