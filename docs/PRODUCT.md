# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated. **Astro + Preact islands, Tailwind CSS, shadcn-derived tokens, Workbox service worker (PWA).** Chosen because the brief commits to mobile-first PWA on low-end Android over intermittent 4G with a 500 KB initial-payload budget and Bangla-first UI. Astro ships zero JS by default with Preact islands only on interactive surfaces (booking configuration, in-app chat, capacity calendar, admin queue), so the marketing and read-only profile pages stay HTML-light; Tailwind maps cleanly onto the existing DESIGN.md tokens; shadcn primitives cover the form-heavy intake (pet profile, care configuration) without locking the team into a heavier SPA framework. Workbox + a manifest give installable PWA behavior. Revisit if multi-admin RBAC, real-time chat at scale, or a native-shell push notification story forces a heavier runtime.

## Users

**Owner — urban Dhaka pet owner (primary).** Dog or cat owner, household income BDT 80k+, lives in Gulshan / Banani / Baridhara / Dhanmondi / Uttara / Mirpur DOHS. Ages 25–45, often dual-income, apartment dwellers; primary decision-maker is typically female. Travel triggers: Eid, December holidays, summer vacation, work trips, family events. Pain: cannot tell in advance whether an informal provider will meet the pet's specific needs; gets no updates during the stay; worries about food, medication, and temperament handling. During peak periods (Eid, December, summer) also faces thin-supply problems. Success = books confidently, gets updates during the stay, returns to a healthy unstressed pet, and books again through PetCare rather than via WhatsApp.

**Provider — Dhaka home sitter or small boarding operator (primary).** Single role in v1; workflow-split between home sitters and small commercial boarding operators is a PRD-owned possibility. Operates in Dhaka; offers boarding for dogs and/or cats; carries prior experience either as a home sitter with word-of-mouth clients or as a small commercial boarding operator (boutique pet hotel, vet-clinic-affiliated boarding, grooming shop with a boarding add-on). Pain today: irregular demand, manual coordination via Messenger, no-shows, payment collection friction, no review asset they can use to attract higher-quality clients. Success = predictable booking flow, payment guaranteed by the platform, growing review base that justifies premium pricing, and repeat demand routed back through PetCare rather than negotiated off-platform.

**Admin — Platform operator (primary).** The single operator (v1 ceiling: 1 admin, 25 active providers, 75 completed bookings per month). Owns the curated-trust promise end-to-end: vets and approves provider applications, verifies provider identity and address, monitors quality, moderates reviews, resolves disputes, manages payouts, intervenes in escalated bookings, runs the acute-event runbook. The admin console is designed for a single operator; the underlying system stays extensible so multi-admin, RBAC, and delegation can be added later without re-platforming.

**Expat / diplomatic owner (secondary).** Gulshan–Baridhara segment, more frequent boardings, higher willingness to pay, expects English-first or bilingual UI. Not a v1 acquisition priority; the bilingual UI and structured intake must not lock them out.

## Product Purpose

PetCare is a trusted, bookable Dhaka marketplace that is particularly strong for pets with specific or special-care requirements — replacing trust-via-DM (Facebook groups, Messenger, WhatsApp) with structured intake, curated supply, verified booking history, and demonstrated-care-fit reputation. v1 exists to validate the curated-trust moat: completed-and-reviewed bookings as the north-star proxy, repeat-booking rate and provider-side retention as the additive reads. The product must deliver concrete, repeatable value for staying on the platform on both sides — for owners, the platform is the only durable record of a pet's care history across providers and the only fast path to a provider the owner already trusts; for providers, the platform is the only path to repeat demand, reputation compounding, and predictable payouts at scale. Where a generic marketplace loses to informal channels after the first transaction, PetCare must be visibly the better long-run option — otherwise the moat evaporates as soon as the second booking happens.

## Positioning

A curated, admin-vetted marketplace whose reputation is built on what providers have *demonstrably* handled well across species and care needs over time — not on self-declared capability flags, not on paid placement, not on marketing reach. The mechanism is structured care data plus verified booking history plus demonstrated provider experience compounding inside a small Dhaka supply pool; the claim a neighboring product could not truthfully copy is "Tier-A-vetted providers in Gulshan / Banani / Baridhara with persistent photo-reviewed booking records on diabetic, anxious, senior, and special-diet pets."

## Operating Context

Dhaka-specific environment. Mobile-first PWA launched from owner and provider phones (predominantly low-end Android) on intermittent 4G; admin console runs English-only on the same phones plus desktop. Owners discover and book around compressed travel windows — Eid (annual, dominant peak), December holidays, summer vacations, work and family trips. Payment is MFS-first (bKash, Nagad) with card as secondary; cash-on-hand is the incumbent alternative. Load-shedding and intermittent connectivity are part of normal operation; capture-on-confirmation payment timing (not capture-on-request) is the v1 response to the Bangladesh aggregator-gateway landscape. Multilingual UI with Bangla as default and English as parity. The vet-clinic directory is per-neighborhood and lightweight (clinic name, address, phone) — the platform does not run an emergency hotline or formally partner with clinics in v1. Trade licensing, Department of Livestock Services (DLS) touchpoints, animal-welfare compliance, data handling, and tax treatment of platform commission are PRD-owned unresolved items.

## Capabilities and Constraints

Confirmed v1 capabilities (PRD-anchored; not to be relitigated by design work):

- Curated two-tier supply (Tier A hand-picked anchor providers; Tier B admin-vetted open applicants). Minimum vetting bar identical across tiers; Tier A additionally has admin-personal outreach and a documented introductory commercial arrangement.
- Curated 3–5 shortlist as the default search result, ranked by tier, neighborhood density, and date-level capacity; "View all approved providers" is a secondary action. No paid placement.
- Per-date capacity (not just an on/off toggle). The shortlist only returns providers with remaining capacity for every night of the window; requests against exhausted capacity are blocked at submission, not bounced at confirmation.
- Pet profile + care configuration: species, breed, age, weight, sex, vaccinations, behavioral notes; conditional species-specific fields (dogs: walking/exercise, outdoor access; cats: litter box, indoor/outdoor, single-cat vs. multi-cat tolerance); first-class special-care flags (medication, allergy, anxiety, extra attention).
- Booking lifecycle with state visible to all parties; provider confirmation required; structured decline reasons as a first-class action.
- Capture-on-confirmation payment timing (not pre-auth-hold-then-capture) because Bangladesh aggregator gateways do not natively support escrow-style flows; confirmation-to-stay SLA and admin reassignment flow are launch-blocking.
- MFS-first checkout (bKash, Nagad); card secondary.
- In-stay chat scoped per booking; daily updates (photo + short note) as a soft expectation with reminders and prompts, not a hard system requirement.
- Verified reviews with photos, gated by completed booking; one review per booking; admin moderation for cause. Reputation built on accumulated demonstrated-care-fit, not on a single average star rating.
- Structured pet care history: persistent across bookings, surfaces on every new booking, pre-fills intake for the second booking faster than the first.
- Issue reporting and dispute flow independent of reviews; payout freeze on dispute; admin investigation.
- Lightweight vet-clinic directory per neighborhood, available during the stay.
- Admin console: provider application intake + approval (Tier A and Tier B), identity and address verification, payout management with dispute freeze, dispute investigation, review moderation, booking oversight, basic quality metrics, acute-event runbook, operating-ceiling visibility, off-platform defection detection.
- Bilingual UI with Bangla default; English parity on owner and provider screens; admin console English-only in v1.

Explicit v1 non-capabilities (do not promise these):

- No open self-serve provider sign-up.
- No clinical / veterinary boarding — diagnosis, treatment, clinical monitoring, and veterinary procedures are out of scope and rejected at intake.
- No transportation / pickup-and-drop-off service.
- No daily-home-visit service — boarding only.
- No native iOS or Android app in v1 (PWA on supported mobile browsers is the launch surface).
- No city-wide launch on day one — initial launch in Gulshan, Banani, Baridhara, expanding only after density validates.
- No global or multi-city — Dhaka only, dogs and cats only.
- No GMV / revenue / active-user / app-store-rating as success metrics in v1.

Explicitly undecided product facts (PRD-owned, not yet resolved):

- Exact platform commission percentage per tier.
- Payout cadence (daily, weekly, biweekly).
- Who absorbs MFS gateway fees.
- Confirmation-to-stay SLA duration.
- Admin reassignment flow for confirmed-but-ghosted bookings.
- Provider vetting depth: identity verification, address verification, references, capacity checks, vaccination-proof handling.
- Cancellation, refund, no-show, and dispute policies.
- Local legal and regulatory compliance: trade licensing, DLS touchpoints, animal-welfare compliance, data handling, tax treatment of platform commission.
- Viable provider supply in Dhaka: count of curated-eligible providers in launch neighborhoods, named Tier-A outreach list, realistic onboarding throughput, waitlist risk if supply is short of demand.

## Brand Commitments

- **Name:** PetCare.
- **Brand posture:** calm, trustworthy, warm, modern — premium without being precious, caring without being childish. Reinforces three load-bearing promises: curated (every provider vetted), demonstrated care fit (reputation built on what providers have actually handled), and special-care-strong (intake flows treat care configuration with the seriousness it deserves).
- **Voice references (visual):** the warmth of Headspace's editorial care, the precision of Linear's information hierarchy, the photography-forward restraint of Airbnb's host pages.
- **Anti-references:** playful pet-app tropes (paw-print logos, cartoon illustrations, bubble fonts, pastel overload), generic marketplace SaaS (gradient-heavy, marketing-deck polish), and minimalist black/white aesthetics that read as cold for the warmth positioning.
- **Languages:** Bangla (default) and English, full parity on owner- and provider-facing screens; admin console English-only in v1.
- **Photography as a trust asset:** real stay photos, real pet photos carry the demonstrated-care-fit claim; the design system gives photography room to breathe.
- **Whitespace as a trust signal:** restrained visual hierarchy, no busy layouts, no decorative noise.
- **Locked color discipline (DESIGN.md):** forest-green primary reserved for primary actions, trust signals (Tier-A badge, verified reviews), and the booking-state "captured" indicator — never decorative. Coral reserved for care-status / acute-event indicators. Warm neutrals do the heavy lifting on surfaces. Status colors are semantic, not decorative.
- **Locked typography (DESIGN.md):** Inter for UI (with Noto Sans Bengali fallback), Source Serif 4 for editorial moments (hero h1, verified review quote style, with Noto Serif Bengali fallback).

## Evidence on Hand

This is a greenfield project — there is no shipped product, no real bookings, no real reviews, no real testimonials yet. Future work must not fabricate them.

Artifacts already produced and binding:

- **Product brief** at `_bmad-output/planning-artifacts/briefs/brief-PetCare-2026-08-29/brief.md` (rev 3, status final).
- **PRD** at `_bmad-output/planning-artifacts/prds/prd-PetCare-2026-08-29/prd.md` (rev 1, status final; 52 FRs, 4 UJs, 20 SMs, 5 counter-metrics).
- **UX scenarios** at `design-process/C-UX-Scenarios/00-ux-scenarios.md` and the 5 scenario folders (43 page specs, 100% inventory coverage).
- **DESIGN.md** at `_bmad-output/planning-artifacts/ux-designs/ux-PetCare-2026-08-29/DESIGN.md` (rev 3, status final; tokens, typography, color discipline).
- **EXPERIENCE.md** at `_bmad-output/planning-artifacts/ux-designs/ux-PetCare-2026-08-29/EXPERIENCE.md` (behavior, IA, flows).
- **8 mockups** at `_bmad-output/planning-artifacts/ux-designs/ux-PetCare-2026-08-29/mockups/` (index: `mockups/index.html`).
- **Prototype** at `_bmad-output/planning-artifacts/ux-designs/ux-PetCare-2026-08-29/prototype/`.
- **Brainstorm artifacts** at `_bmad-output/brainstorming/` (discovery and validation sessions).

State of these artifacts: they are final and signed-off (Alignment & Signoff 2026-08-31). DESIGN.md + EXPERIENCE.md are the visual-authority and behavior-authority records for v1 — they predate this PRODUCT.md, so future design work should treat them as the visual world unless and until a redesign is requested through new-work.

Real-world evidence the team must gather before scaling (not on hand yet, must not be fabricated): named Tier-A provider outreach list in Gulshan / Banani / Baridhara; pre-launch demand validation count; pilot bookings; verified reviews with photos; payment-gateway integration test results against SSLCommerz / bKash / Nagad documentation.

## Product Principles

1. **Curated beats large.** Volume is not the moat — demonstrated trust in a small Dhaka supply pool is. Every design decision must answer: does this make the curated-trust promise more credible, or does it push toward scale-at-the-cost-of-quality?
2. **Stay on the platform is the moat.** The product must make the second booking through PetCare faster, safer, and more valuable than the first — and more valuable than transacting via WhatsApp. Care-history pre-fill, demonstrated-care-fit ranking, and predictable payouts exist to keep both sides inside the loop.
3. **Demonstrated over declared.** Reputation is built on what providers have actually handled well over time (species, special-care patterns, repeat-owner success), not on what they say they can handle. Capture and surface real outcomes; rank by them.
4. **Care configuration is first-class.** Special-care inputs (medication, allergy, anxiety, special diet, senior) deserve more vertical space, clearer field hierarchy, and structured fields — not free-text afterthoughts. The seriousness of the care promise lives or dies here.
5. **Operator ceiling is a design constraint.** v1 is designed for one admin, 25 active providers, and 75 completed bookings per month. Crossing the ceiling is a re-platforming signal, not a stretch goal. Admin workflows must be runnable on a low-end Android phone on intermittent Dhaka connectivity.

## Accessibility & Inclusion

- WCAG 2.1 AA contrast floor across all surfaces (NFR-12 in the PRD).
- Bilingual UI (Bangla default, English parity) on owner and provider screens; admin console English-only in v1.
- Mobile-first PWA tuned for low-end Android on intermittent 4G; initial page payload under 500 KB on 4G; images lazy-loaded.
- Care history pre-fill and structured fields reduce the typing burden for the second-booking owner (inclusion read: less re-typing = lower cognitive load for owners under travel-day stress).
- Special-care flags (medication, allergy, anxiety, extra attention) are first-class intake fields, not free-text — the product treats them as accessibility-relevant input shapes, not optional metadata.
