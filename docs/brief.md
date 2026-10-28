---
title: PetCare — Product Brief
status: final
created: 2026-08-29
updated: 2026-08-31
brief_revision: 3
confirmed_at_signoff: 2026-08-31 (Alignment & Signoff — brief content unchanged, re-confirmed against UX rev 3 + DS extraction round 2)
revision_summary: Applied Tier A (all 5) + 5 selected Tier B themes from second-formal brainstorming. Moat conditionality + demonstrated-care-fit added to Why-Win. Date-level capacity, persistent pet care history, acute-event response posture added across Sections 3, 5, 6, 7. Pre-launch demand validation added as launch-blocking.
---

# PetCare — Product Brief

---

## 1. Problem & Opportunity

**Who is hurting.** Urban pet owners in Dhaka, primarily dog and cat owners in middle-to-upper-middle income households (BDT 80k+), need temporary boarding and care for their pets during travel — most acutely around Eid, December holidays, summer vacations, and work or family trips. The primary decision-maker for pet care in Bangladeshi households skews female, age 25–40. A secondary segment — expats and diplomats in Gulshan–Baridhara — boards pets more frequently and at a higher willingness to pay, but is not the v1 target.

**What they do today.** Discovery happens through Facebook groups (e.g. *Pet Lovers Bangladesh*, *Cats & Dogs in Dhaka*), Bikroy and Facebook Marketplace classifieds, vet-clinic referrals, and WhatsApp word-of-mouth. Booking happens via Messenger DM. Payment is typically cash on hand or bKash P2P. There is no curated marketplace in Dhaka; the supply is fragmented and trust is mediated informally through private conversations.

**What breaks.** The current informal supply fails operationally, not in discovery. Owners repeatedly report:

- **No updates during the stay.** Radio silence for days is the most common complaint.
- **Food and medication mishandled.** Kibbles dumped together; special diets ignored; insulin, eye drops, and post-surgery care refused or forgotten.
- **Different care needs across species.** Dogs typically need walking, exercise, and active interaction; cats typically need a quieter environment, stable routine, and lower-stress handling. The current informal supply treats these as interchangeable.
- **Special-care needs falling through.** Medication, allergy-related care, anxiety support, and other extra-attention requirements are frequently mishandled or declined.
- **Cost opacity.** Quoted prices drift upward at drop-off with no prior disclosure.
- **No separation by size or temperament.** Small dogs stressed by large barking ones.
- **No emergency vet linkage** when a pet falls ill during the stay.

**Why now.** Dhaka pet ownership is growing off a small base — pandemic-era adoptions, rising disposable income, and social-media visibility have steadily increased the population of urban dogs and cats. No curated marketplace exists today; PetBacker lists Bangladesh but Dhaka supply is thin. Mobile-wallet infrastructure (bKash, Nagad) is mature enough to underwrite a commission-based marketplace with day-one payouts to providers.

The opportunity is to replace the trust-via-DM model with a **structured experience** — one where a pet owner can find a provider, understand what the provider offers, communicate the pet's specific requirements, and book based on the pet's actual needs.

**Primary and secondary pains (treated as hypotheses to validate, not locked facts).**
- **Primary pain (current working hypothesis):** trust and quality uncertainty. Owners can find *someone* but cannot tell in advance whether the provider will care for the pet the way it needs to be cared for — particularly when the pet has special needs (medication, allergies, anxiety, special diet, senior care).
- **Secondary pain, especially at peak:** availability. During Eid, December holidays, and summer vacation, even the fragmented informal supply becomes thin. A strictly curated marketplace could make availability *worse*, not better, if supply acquisition lags demand. v1 must be designed for this risk, not assume it away.

**Scope guardrail.** v1 supports special-care requirements and instructions (food type, medication, allergies, anxiety, extra attention) as booking inputs. v1 does **not** position itself as a medical or veterinary boarding service and does not accept bookings whose primary purpose is clinical care. The platform supports normal pet care and basic medication administration where the provider explicitly agrees; it does not provide or promise diagnosis, treatment, clinical monitoring, or veterinary procedures.

---

## 2. Vision, Target Users, and Why-Win

### Vision

PetCare is a trusted, bookable Dhaka marketplace that is particularly strong for pets with specific or special-care requirements — replacing trust-via-DM with structured intake, curated supply, and verified booking history.

### Target Users

**Primary — Pet Owner (urban Dhaka).**
- Dog or cat owner, household income BDT 80k+, lives in Dhanmondi / Gulshan / Banani / Uttara / Mirpur DOHS and adjacent neighborhoods.
- Ages 25–45, often dual-income, apartment dwellers.
- Primary decision-maker for pet care is typically female.
- Travel triggers: Eid, December holidays, summer vacation, work trips, family events.
- Pain: cannot tell in advance whether an informal provider will meet the pet's specific needs; does not get updates during the stay; worries about food, medication, and temperament handling. During peak periods (Eid, December, summer), also faces a thin-supply problem.
- Success = books confidently, gets updates during the stay, returns to a healthy, unstressed pet, and would book again.

**Primary — Pet Care Provider (Dhaka).**
- Single role in this brief; PRD may later split by workflow if home sitters and small commercial boarding facilities diverge meaningfully.
- Operates in Dhaka; offers boarding for dogs and/or cats; carries prior experience either as a home sitter with word-of-mouth clients or as a small commercial boarding operator (boutique pet hotel, vet-clinic-affiliated boarding, grooming shop with a boarding add-on).
- Pain today: irregular demand, manual coordination via Messenger, no-shows, payment collection friction, no review asset they can use to attract higher-quality clients.
- **Provider value-prop (what the platform must deliver, in priority order):**
  1. **Booking flow that beats Messenger DM** — calendar, requests, confirmations, and chat in one place.
  2. **Pre-vetted owner demand** — owners who have completed identity verification, with care requirements captured up front, reducing back-and-forth.
  3. **Reputation asset over time** — verified reviews that compound across bookings, publicly visible.
  4. **Payment reliability** — guaranteed MFS payout per confirmed booking, no cash-collection chasing.
- Success = predictable booking flow, payment guaranteed by the platform, growing review base that justifies premium pricing.

**Primary — Admin (Platform Operator).**
- Internal role that owns the curated-trust promise end-to-end: vets and approves provider applications, verifies provider identity and address, monitors quality, moderates reviews, resolves disputes, manages payouts, and intervenes in escalated bookings.
- Treat as a primary platform role because the curated supply model and verified-review trust mechanism are operationally impossible without admin authority and workflow.
- **v1 operating ceiling:** 1 admin, 25 active providers, 75 completed bookings per month (single-operator scale). The admin console is designed for a single operator; the underlying system remains extensible so multi-admin, RBAC, and delegation can be added later without re-platforming.

**Secondary — Expat / Diplomatic Owner (Gulshan–Baridhara).**
- Boards pets more frequently (regular home leave), higher willingness to pay (BDT 2,500–4,000+/night), expects English-first or bilingual UI, prefers providers experienced with non-Bangladeshi pet breeds and routines. Not a v1 acquisition priority, but the platform's bilingual UI and structured intake should not lock them out.

### Why-Win

**12-month bet.** PetCare aims to become the trusted, bookable marketplace in Dhaka that is particularly strong for pets with specific or special-care requirements (medication, allergies, anxiety, special diet, senior care). The bet is defensible because it sidesteps the volume competition with Facebook/Messenger and concentrates on the segment where informal supply fails most visibly.

**12-month moat hypothesis.** *A growing network of vetted providers with structured capability/care data, verified booking history, and demonstrated experience handling different pet-care needs.*

The moat is the **network + trust + accumulated care/booking data**, not the software features. Concretely:
- A directory of vetted providers with self-declared capability (species, size, age, special care, senior pets) is copyable.
- Aggregated booking history, decline-reason patterns, and care-outcome data are not — they accrue with volume and improve matching, ranking, and routing over time.
- Tier-A anchor-provider relationships create a soft exclusivity that a generic marketplace cannot easily replicate at launch.

**Conditionality of the moat.** The moat only compounds if the marketplace stays the marketplace — that is, if owners keep returning to PetCare to book (rather than swapping contact details into WhatsApp after the first stay) and if providers keep taking bookings through the platform (rather than negotiating repeat clients off-platform for a lower effective rate). The brief treats this as a first-order design constraint, not a marketing afterthought: the product must deliver concrete, repeatable value *for staying on the platform* on both sides. For owners, that means the platform is the only durable record of a pet's care history across providers and is the only fast path to a provider the owner already trusts. For providers, that means the platform is the only path to repeat demand, reputation compounding, and predictable payouts at scale. Where a generic marketplace loses to informal channels after the first transaction, PetCare must be visibly the better long-run option — otherwise the moat evaporates as soon as the second booking happens.

**Demonstrated-care-fit over self-declared capability.** Self-declared capability flags ("we accept senior pets," "we can administer medication") are useful as intake but are not, on their own, the trust signal an owner needs at the decision moment. The 12-month moat is built on *demonstrated* care fit — actual booking outcomes, decline-reason patterns over time, verified review history with photos, and species/special-care experience accumulating in the provider's record. The reputation that wins the next booking is the one built on what the provider has actually handled well, not what they say they can handle. v1 is designed to capture this data from Day 1; ranking and matching improvements that consume it are sequenced in the PRD.

The v1 features that seed the moat:

1. **Structured intake is the data foundation.** Food type, dietary restrictions, medication, allergy, anxiety, extra-attention needs, and species-specific handling are captured at booking time, linked to the booking record, and aggregable over time. Each booking makes the platform's matching capability slightly better.
2. **Two-tier curated supply is the credibility gate.** Tier A (anchor providers, hand-picked and pre-vetted by admin, with featured placement and a different commercial arrangement) carries the trust signal at launch. Tier B (open applicants, still admin-vetted) carries the volume. Both tiers have the same minimum vetting bar; Tier A additionally has admin-personal outreach and a small commercial concession.
3. **Verified reviews with photos are the trust signal that compounds.** Only owners who have completed a booking can leave a rating, written review, and photos from the actual stay. Review text alone is common; review photos from completed stays are the differentiator.
4. **Structured provider decline reasons are the routing data.** Providers can decline a booking with a specific reason (cannot administer medication, cannot accommodate high-anxiety pets, cannot support senior/limited-mobility pets, care requirements exceed capacity, facility not suitable). This produces supply-side capability data that no informal channel captures and feeds future matching.
5. **MFS-first payments** (bKash / Nagad) match how Dhaka actually pays and remove the friction that has kept global marketplaces out of Bangladesh.

### What PetCare explicitly is not (v1)

- Not an open marketplace — no self-serve provider sign-up.
- Not a medical / veterinary boarding service — special-care support yes, clinical care no.
- Not a transportation / pickup-and-drop-off service.
- Not a daily-home-visit service — boarding only; daily visits deferred to v2.
- Not a native mobile app on day one — PWA / mobile-web is the launch surface.
- Not city-wide on day one — v1 launches in a small number of Dhaka neighborhoods (initial focus: Gulshan, Banani, Baridhara), expanding only after density validates.
- Not a global platform — Dhaka only, dogs and cats only, for v1.

---

## 3. Solution Shape

### Product concept

PetCare is a web-based curated marketplace that connects urban Dhaka pet owners with vetted pet-care providers for temporary boarding and care. The product replaces a trust-via-DM workflow (Facebook groups, Messenger, WhatsApp) with a structured booking experience in which the pet's needs, the provider's offer, and the progress of the stay are all visible and recorded in one place.

The product is a web application built mobile-first as a Progressive Web App (PWA). Bangla is the primary UI language; English is available throughout. No native iOS or Android app ships in v1.

### Booking lifecycle

1. **Search.** Owner searches by location (Dhaka launch neighborhoods first), dates, and pet type (dog / cat). The default search result is a curated shortlist of 3–5 providers, ranked by tier (Tier A first), neighborhood density, and capacity. A secondary "View all approved providers" action exposes the full approved catalog in launch neighborhoods. **Date-level availability is real:** providers maintain per-date capacity (not just an on/off toggle), the shortlist only returns providers who have remaining capacity for every night of the requested window, and requests against exhausted capacity are blocked at submission rather than bounced at confirmation. Results are never ordered by paid placement.
2. **Select provider.** Owner views a provider profile — photos, services offered, capacity by species, price per night, verified-booking reviews with photos, location on a map, the provider's self-declared capability flags (species accepted, special care accepted, senior pets accepted), and whether the provider is currently accepting bookings. Pre-review trust signals are present on every profile from Day 1: admin-introduced badge for Tier A providers, vet-affiliation display where applicable, profile completeness indicator, and prior experience / capacity statement.
3. **Configure pet / care needs.** Owner attaches a pet profile — common fields (species, breed, age, weight, sex, vaccinations, behavioural notes) plus conditional species-specific fields (dogs: walking/exercise requirements, outdoor access; cats: litter box preferences, indoor/outdoor, single-cat vs. multi-cat tolerance). Owner specifies the care configuration for this stay: food type and dietary notes, number of days, additional services (e.g. extra walks, extra attention, basic medication administration where provider has agreed), and a free-text instructions field for anything else the provider should know.
4. **Submit booking request.** Owner submits the booking request with payment details. No funds are captured yet; the gateway authorises the payment method.
5. **Provider confirms.** The provider reviews the request — including the pet profile and the care configuration — and either accepts or declines. **Decline with a structured reason is a first-class option:** the provider can choose from a taxonomy of reasons (cannot administer medication, cannot accommodate high-anxiety pets, cannot support senior/limited-mobility pets, care requirements exceed capacity, facility/environment not suitable, or generic decline). The platform captures the authorised payment on acceptance. If the provider declines or does not respond within a defined confirmation window, the authorisation is released and the owner is not charged. Confirmation-window duration is owned in the PRD; v1 should be sensitive to Dhaka load-shedding and peak periods (Eid, December, summer).
6. **Stay.** The pet is in the provider's care. The provider is expected to post daily updates (photo / short video / short note) during the stay; this is a soft expectation, not a hard system requirement — the platform sends reminders and prompts but does not block stay completion on missed updates. Owner and provider have a chat channel scoped to this booking. Admin can intervene if either party raises a concern. The owner has access to a lightweight **vet-clinic directory** for the booking's neighborhood (clinic name, address, phone) so the provider can act quickly in an emergency; the platform does not run an emergency hotline or formally partner with clinics.
7. **Complete.** The provider marks the stay complete. Funds are released to the provider net of platform commission. Owner is prompted to confirm completion and leave a verified review.
8. **Verified review and issue report.** Only after step 7 is the owner able to leave a rating (1–5), a written review, and **photos from the actual stay** (Day-1 trust differentiator). Reviews are public on the provider's profile; admin can moderate for abuse or off-topic content. In parallel, the owner can raise a **"Report an issue"** within a defined dispute window; if raised, the provider payout is temporarily frozen and admin investigates. Disputes and reviews are independent — a public review can stand while a dispute is being resolved, and a resolved dispute does not retroactively delete a review.

**Payment timing — note.** v1 captures payment on provider confirmation, not at booking request. This decision is driven by the Bangladesh payment-gateway landscape: aggregator gateways (SSLCommerz, bKash, Nagad) do not natively support escrow-style pre-auth-hold-then-capture in the way card-first markets do. As of writing, that is the case; the PRD must verify against current SSLCommerz / bKash / Nagad documentation before locking the payment flow. Capturing on confirmation removes refund friction for owners, keeps the provider as the trust gate, and works cleanly with the realistic v1 payment stack. The cost is a confirmed-but-ghosted-booking risk — the PRD must specify a confirmation-to-stay SLA and an admin reassignment flow before launch; both are launch-blocking.

### Headline feature areas

- **Pet profile & care configuration.** Owner builds a reusable pet profile (one or more pets) and configures the care needs for a specific stay. Unified intake with a pet-type selector; conditional species-specific fields (dogs: walking/exercise; cats: litter, indoor/outdoor). Special-care flags (medication, allergy, anxiety, extra attention) are first-class fields, not free-text afterthoughts.
- **Provider profile & discovery.** Providers maintain a public profile: photos, services, capacity (by species), price per night, location, availability toggle, self-declared capability flags (species accepted, special care accepted, senior pets accepted), and prior-experience statement. Owners discover providers via a curated shortlist (3–5 per query) with a "View all approved providers" secondary action; full search filters by date, pet type, location, and price.
- **Booking, confirmation & lifecycle.** A booking moves through the eight lifecycle steps with state visible to all parties. Provider confirmation is required. **Structured decline reasons** are a first-class provider action. Cancellations, modifications, and no-show handling have explicit policies (PRD-owned). The booking-state machine distinguishes authorised, captured, released, and refunded payment states.
- **In-stay updates & chat.** Provider posts at least one daily update per active booking; owner and provider have a booking-scoped chat. Updates and chat are auditable by admin. Reminders are sent; missed updates do not block stay completion.
- **Verified reviews with photos.** Reviews are gated by a completed booking. One review per booking. Each review may include a rating (1–5), written text, and **photos from the actual stay** — the differentiator from text-only review systems. Reviews are public; admin moderation exists for cause. **A provider's reputation on PetCare is built on what they have demonstrably handled well over time — species, special-care needs, repeat-owner success — not on a single average star rating.**
- **Structured pet care history.** Each pet accumulates a persistent care history across bookings — food, medication, allergy, anxiety, special-attention notes, and confirmed-stay records (provider, dates, outcome, review). Owners see it on every new booking and pre-fill it into the intake. Providers see the relevant history when an owner requests a stay. This is the data that makes the second booking faster than the first, gives owners a reason to keep booking through the platform rather than transacting via WhatsApp, and lets the system match future requests to providers with demonstrated success on the same care pattern.
- **Issue reporting and dispute flow.** Independent of reviews, the owner can raise a "Report an issue" within a defined dispute window; this freezes the provider payout and triggers admin investigation. Disputes do not retroactively affect reviews; reviews do not block dispute resolution.
- **Lightweight vet-clinic directory.** A per-neighborhood directory (clinic name, address, phone) is available to owners and providers during the stay. The platform does not run an emergency hotline or formally partner with clinics in v1.
- **Peak-period capacity handling.** The platform surfaces real provider availability and capacity, prevents requests when capacity is exhausted, and lets providers adjust their capacity for known peak windows (Eid, December, summer). No surge pricing, queuing, or complex peak-season logic in v1.
- **Payments & payouts.** MFS-first checkout (bKash, Nagad) with card as a secondary option. Platform commission is deducted before provider payout. Tier-A and Tier-B providers have a documented commercial arrangement (placement + potentially introductory commission difference). Exact commission %, payout cadence, and refund policy are PRD-owned.
- **Admin operations.** Provider application intake and approval workflow (Tier A and Tier B); identity and address verification; provider capability and capacity management; payout management with dispute freeze; dispute investigation; review moderation; booking oversight; basic quality metrics. Designed for a single-operator operating ceiling of 25 active providers and 75 completed bookings per month.

### Surface area & language

- **Form factor.** Responsive web application, PWA-grade on supported mobile browsers. No native apps in v1.
- **Languages.** Bangla (default) and English, with full parity on all owner-facing and provider-facing screens. Admin console is English-only in v1 (locked in Section 7).
- **Performance envelope.** Initial page payload under 500 KB on 4G; images lazy-loaded; works on low-end Android devices on intermittent connections.

---

## 4. Success & Metrics

**What success means for v1 (qualitative).**
- A Dhaka pet owner with a specific-care pet (medication, allergy, anxiety, special diet) can complete a booking in under 10 minutes and report confidence in the booking before the stay begins.
- A provider in Dhaka can manage their bookings, communication, and payouts in one place without relying on Messenger DM coordination.
- Admin can approve a provider end-to-end, monitor active stays, and intervene in a dispute without leaving the platform.

**Outcomes that matter (north stars, 6–12 month horizon).**
1. **Completed-and-reviewed bookings.** A booking that reaches step 8 with a written review is the closest proxy we have for "the product delivered on its trust promise." This is the metric we treat as the primary north star for v1.
2. **Repeat-booking rate.** The share of owners who book a second time after a completed-and-reviewed first booking. This is the cleanest read on whether the trust moat actually works.
3. **Provider-side retention.** The share of providers who, after their first completed booking, accept and complete a second booking on the platform. The curated-supply moat fails if providers churn out after one booking.

**Leading indicators (operational, 0–3 month horizon).**
- Search-to-request conversion rate (owner intent strength).
- **Search-shortlist-to-all-catalog rate.** Share of owners who expand from the 3–5 curated shortlist to the full approved catalog. Reads whether the curated default is the right UX choice.
- Provider confirmation rate (a low rate signals either misaligned expectations or weak supply).
- **Decline-reason distribution** (provider side). The taxonomy in Section 3 produces routing data; monitoring distribution tells us whether the platform is matching pets to providers correctly or whether special-care pets are being bounced unnecessarily.
- Provider response time (median minutes from request to confirm/decline).
- Daily-update posting rate during active stays (soft metric, since updates are not enforced).
- Verified-review rate (share of completed bookings that produce a written review).
- **Review-with-photos rate** (share of verified reviews that include at least one photo). This is the differentiator-trust metric — if photo rate stays low, the Day-1 trust claim weakens.
- Issue-report rate (share of completed bookings where the owner raises a dispute). Tracks whether dispute flow is being used appropriately, not over- or under-used.
- **Provider utilization by tier** (Tier A vs. Tier B bookings per active provider per month). This is the metric that proves the Tier-A commercial arrangement is justified.
- **Geographic density** (bookings per launch neighborhood per month). Validates the phased-launch decision.
- Admin-touch health, tracked two ways:
  - **Admin intervention rate, broken down by reason** — verification, booking/payment, dispute, moderation, user/system issue. The reason breakdown is what makes the metric interpretable; a single aggregate number is not.
  - **% of bookings completed without any admin touch.** This is the inverse read: when this number rises over time, the platform is doing its job without leaning on ops.
- **Admin load vs. operating ceiling.** v1 ceiling is 25 providers / 75 bookings/month at 1 admin. Crossing this ceiling is a re-platforming signal, not a "stretch" goal.

**What we explicitly do not measure in v1.**
- GMV or revenue as a v1 success metric. v1 exists to validate the curated-trust moat; premature revenue targets distort provider approval and review moderation.
- Active-user counts as a v1 success metric. The Dhaka supply pool is small; chasing downloads produces a directory, not a curated marketplace.
- App store ratings — no native app ships in v1.

**What must be resolved before launch (carried into the PRD for numbers).**
1. **Payment and commission flow.** Specific commission percentage per tier, payout cadence, who absorbs gateway fees, and the exact reconciliation model between platform and provider.
2. **Provider vetting and approval requirements.** Identity verification depth, address verification, references, capacity checks, vaccination-proof handling, and the SLA for application review (Tier A vs. Tier B).
3. **Cancellation, refund, no-show, and dispute policies.** Including booking-state-machine transitions and payout-freeze mechanics.
4. **Relevant local legal and regulatory requirements.** Trade licensing, Department of Livestock Services (DLS) touchpoints, animal-welfare compliance, data-handling obligations, and tax treatment of platform commission.
5. **Viable provider supply in Dhaka.** A real-world supply assessment before launch — count of curated-eligible providers in launch neighborhoods, named Tier-A outreach list, realistic onboarding throughput, and the waitlist risk if supply is short of demand.

**What we explicitly do not know yet (gaps to close before scaling).**
- True demand baseline in Dhaka (no published census of pet-owning households or boarding-frequency data).
- Willingness-to-pay at the platform-commission price point relative to the current cash-on-hand alternative.
- The actual booking volume required for the curated-supply model to clear operational costs.
- Whether the Dhaka provider pool is large enough to support curated-only at launch without waitlist-driven churn of owners to informal alternatives.
- Whether the search-shortlist default (3–5 providers) is preferred over a full-catalog view — to be validated with real usage data.

**Cuts.** Anything that would force us to invent a target number today — booking volume, MAU, conversion rate, NPS, revenue — is deferred to the PRD, where it can be tied to a realistic baseline after the first pilot cycle. The brief captures *what we will measure*, *what we deliberately will not measure*, and *what must be resolved before launch*; the PRD captures the numbers and the acceptance criteria.

---

## 5. Risks & Open Questions

### Product & market risks

1. **Dhaka supply pool is unproven (launch-blocking).** Curated-only is the right model, but the curated-eligible provider count in Dhaka is unknown. If the supply pool is thin, owners will face waitlists and churn back to Facebook/Messenger before the curated moat has a chance to compound. *Mitigation owned in PRD: pre-launch supply assessment in launch neighborhoods; named Tier-A anchor-provider list; onboarding throughput targets.*
2. **Curated supply has a cold-start death spiral.** Even with the launch neighborhoods locked, admin cannot vet providers without applications, providers will not apply without demand, and owners will not book without a credible catalog. The pre-launch work — outbound supply acquisition (vet clinics, FB home-sitter groups, existing boarding shops) and pre-vetting — must happen before the first booking is taken. *Mitigation owned in PRD: pre-launch Tier-A outreach plan; outreach-driven Tier-B application flow; admin hours budgeted for pre-launch.*
3. **Availability is a major secondary pain, especially at peak.** The curatorial model restricts supply relative to the open informal market. If peak-week availability collapses, owners defect back to FB/Messenger for capacity, not quality. Eid, December, and summer weeks will stress capacity. *Mitigation owned in PRD: peak-aware capacity planning in launch neighborhoods; capacity-expansion flow for known peak windows; owner-facing availability messaging.*
4. **Demand is spiky, not steady.** Peak weeks around Eid, December holidays, and summer vacation will stress provider capacity; off-peak weeks will starve providers of bookings and tempt them off the platform. *Mitigation owned in PRD: peak-aware onboarding + capacity planning; off-peak retention strategies (review accumulation, repeat-owner programs) designed to weather the troughs.*
5. **Verified reviews alone may not be sufficient for first-time bookings.** Verified-booking reviews with photos are the chosen headline trust mechanism for v1 and remain the spine of the trust model. However, for an owner with no prior experience on the platform, reviews from strangers carry less weight than personal recommendation or visible care signals. The product supports this in v1 with daily-update reminders during the stay, vet-affiliation display on the provider profile, and Tier-A admin-introduced badge, but the broader question — whether reviews alone move a first-time booker from "interested" to "booked" — is open and should be revisited at the 6-month mark.
6. **Provider-vetting bias is a structural risk.** Because the marketplace depends on curated providers, the provider-selection and vetting process directly affects trust, fairness, supply, and platform quality. Vetting criteria that proxy for protected characteristics (gender, religion, neighborhood, nationality) would be both ethically and legally problematic, and the absence of a transparent, bias-aware vetting process would erode the curated-trust promise the platform is built on. *Mitigation owned in PRD: documented vetting criteria reviewed for bias; right-of-appeal for declined providers; periodic audit of approval decisions.*
7. **Special-care bookings are higher-stakes and slower-confirm.** The 12-month bet concentrates on pets with specific or special-care requirements. These bookings are higher-stakes for owners, higher-effort for providers, more likely to be declined on capability grounds, and slower to confirm. If the platform optimizes for special-care, baseline economics shift: lower throughput per booking-hour, higher dispute probability, higher admin load per booking. *Mitigation owned in PRD: dispute-window and refund policy tuned to special-care reality; admin runbook for special-care incidents; capability-tag quality monitoring.*
8. **Provider churn after a slow month.** Tier-B providers in particular will leave if they do not see bookings in the first 60 days. Off-peak weeks compound this. Even without retention incentives in v1, churn is a structural risk because supply acquisition is expensive (admin hours per provider). *Mitigation owned in PRD: provider-utilization monitoring at 30/60/90 days; re-engagement flow; Tier-A relationship management.*
9. **Species-mismatch risk in existing Dhaka supply.** Most existing Dhaka boarding is implicitly dog-first or dog-only; cats are deprioritized or excluded without explicit per-species capacity. If providers overstate cat capacity and then have to decline cat bookings, the 12-month bet on dogs-and-cats weakens. *Mitigation owned in PRD: per-species capacity as a first-class field; provider self-declaration of species accepted; declining-with-reason rate monitored by species.*
10. **Acute events during a stay (illness, injury, death) are inevitable and platform-shaping.** A pet will get sick, get hurt, or die in a provider's care at some point during the v1 horizon — statistically, with the booking volume the operating ceiling implies, this is a near-certainty. How the platform detects, responds to, communicates around, and recovers from an acute event is the single biggest test of whether owners trust it with the next stay. Generic "contact a vet" guidance is not enough; owners will judge the platform by whether there is a defined response posture, defined roles during an incident, and a visible track record of handling one well. *Mitigation owned in PRD: acute-event response runbook (who is notified, when, in what order; provider vs. admin responsibilities; owner communication template); vet-clinic directory designed for incident-time lookup; incident post-mortem practice even when the outcome was good; review-and-dispute records treated as inputs to the runbook, not as the runbook.*

### Operational risks

11. **Provider quality is admin-dependent.** A single bad stay — mishandled medication, lost pet — destroys more trust than ten good stays build. Admin moderation has to be consistent and fast. *Mitigation owned in PRD: incident-response SLA; provider suspension criteria; review-moderation rules.*
12. **No-show on both sides.** Owners who don't show up for a confirmed stay; providers who confirm and then ghost. Both are real and need explicit handling. *Mitigation owned in PRD: cancellation policy, confirmation-to-stay SLA, admin reassignment flow, no-show penalty rules.*
13. **Payment reconciliation drift.** MFS settlement timing, partial refunds, and provider payouts running on different cadences create an operational accounting problem that grows with volume. *Mitigation owned in PRD: settlement reconciliation design + a monthly finance close.*
14. **Eid-week booking compression and infrastructure unreliability.** Dhaka has regular load-shedding and intermittent connectivity. A provider who cannot post a daily update because of a 4-hour power cut is not a quality issue. Confirmation windows that assume steady connectivity will produce false cancellations during infrastructure events. *Mitigation owned in PRD: confirmation-window sensitivity to peak + load-shedding; admin manual override capability for connectivity-related issues; vet-directory accessible offline-first.*

### Regulatory & ethical risks

15. **Local regulatory clarity is incomplete.** Trade licensing, animal-welfare compliance (Animal Welfare Act 2017), data-handling obligations (draft Data Protection Act 2023), and tax treatment of platform commission are all partially specified at the time of writing. *Mitigation owned in PRD: pre-launch legal review with a BD-licensed practitioner; documented compliance checklist.*
16. **Animal-welfare incident handling.** If a pet is injured or dies in a provider's care, the platform's role and liability need to be defined clearly before launch — not after the first incident. *Mitigation owned in PRD: incident-response runbook; insurance posture; communication template.*

### Open questions (the brief keeps these visible; the PRD resolves)

- Exact commission percentage per tier and payout cadence.
- Confirmation-window duration (provider must confirm within X hours), and how it adjusts at peak.
- Dispute-window duration (how long after completion the owner can raise "Report an issue").
- Whether card capture is supported in v1 or deferred until MFS proves out.
- Whether the daily-update reminder cadence is provider-configurable.
- Whether the platform should expose provider earnings to other providers (likely no — antitrust and transparency concerns).
- Whether an expat-facing version of the UI is required in v1 or only Bangla-first.
- Named Tier-A anchor providers at launch and the introductory commercial terms.

Each mitigation listed above is *owned in the PRD* — meaning the PRD is where the answer is supposed to appear. If the PRD cannot answer a mitigation, that is itself a launch-readiness signal.

---

## 6. Implications & Constraints

This section translates the brief's decisions into constraints the PRD, architecture, and implementation must respect. Each constraint is stated as **decision → consequence**; detailed technical design is left to the PRD and architecture.

### Product scope

- **Decision:** v1 covers exactly the eight-step booking lifecycle in Section 3. **Consequence:** new lifecycle states or side flows are out of scope without an explicit brief update.
- **Decision:** Dogs and cats only. **Consequence:** any new category (birds, fish, reptiles, small mammals) requires a brief update, not a PRD tweak.
- **Decision:** v1 supports special-care flags (medication, allergy, anxiety, extra attention) but does not position as medical or veterinary boarding. **Consequence:** clinical-care bookings are rejected at intake; the data model treats these as care-instruction fields, not as clinical records.

### Provider model

- **Decision:** Curated, admin-gated provider onboarding; no self-serve sign-up. **Consequence:** provider registration is an admin workflow, not a public form; the data model represents provider status as a lifecycle state (applied, vetting, approved, suspended, removed).
- **Decision:** **Two-tier curated supply.** Tier A = anchor providers, hand-picked and pre-vetted by admin via outbound outreach, with featured placement and a documented commercial arrangement (lower introductory commission or equivalent value). Tier B = open applicants, still admin-vetted to the same minimum bar but without admin-personal outreach. **Consequence:** the data model must represent tier as a first-class provider attribute; search ranking and "view all" surfaces must respect tier; admin tooling must distinguish Tier A outreach flows from Tier B application flows.
- **Decision:** **Geographic launch phasing.** v1 launches in a small number of Dhaka neighborhoods (initial focus: Gulshan, Banani, Baridhara). Expansion to other neighborhoods is gated on density validating in the launch set. **Consequence:** provider onboarding and owner acquisition are scoped to launch neighborhoods at launch; the data model supports neighborhood-level filtering and density metrics.
- **Decision:** One "Pet Care Provider" type in this brief. **Consequence:** the PRD may split into subtypes (home sitter, small commercial) only if workflows, pricing, availability, or vetting diverge meaningfully; until then, the data model keeps a single provider type.

### Trust and verification

- **Decision:** Verified reviews with photos are gated by a completed booking; one review per booking; public on the provider profile. **Consequence:** the booking lifecycle must record "completed" before a review can be submitted; the review table references a booking, not just a provider; review photos are stored as part of the review record and surfaced on the provider profile.
- **Decision:** Structured provider decline reasons are a first-class option at the confirmation step. **Consequence:** the decline action records a reason from a taxonomy; the data model makes decline reason a queryable attribute; routing and matching improvements consume this data over time.
- **Decision:** Independent "Report an issue" + payout-freeze dispute flow exists in parallel with verified reviews. **Consequence:** the booking lifecycle includes a dispute state; payout release is conditional on dispute-window expiry or admin resolution; dispute and review records are independent and do not retroactively affect each other.
- **Decision:** Daily updates are an expected behavior, not a system-enforced requirement. **Consequence:** the platform sends reminders and prompts but does not block "Mark Complete" on missed updates; update posting is observable in metrics but not in state-machine transitions.
- **Decision:** Provider identity and address verification are required pre-listing. **Consequence:** no provider profile becomes publicly visible until admin approval is recorded; the data model includes verification artifacts (NID, address docs, references) as part of the provider record, separate from the public profile.

### Payments and money

- **Decision:** Payment is captured on provider confirmation, not at booking request. **Consequence:** the payment-state machine distinguishes *authorised*, *captured*, *released*, and *frozen-for-dispute*; cancellation and timeout paths must explicitly release the authorisation; dispute paths must freeze payout and release on resolution.
- **Decision:** MFS (bKash, Nagad) is primary; card is secondary. **Consequence:** the payment integration centres on a Bangladesh-compatible gateway (SSLCommerz or equivalent); card support can be deferred without blocking MVP.
- **Decision:** Platform commission is deducted before provider payout; Tier A and Tier B may carry different introductory terms. **Consequence:** the payout flow computes net amount by tier; reconciliation between platform settlement and provider payout is a first-class operational concern.
- **Decision:** Provider payout can be temporarily frozen by a "Report an issue" raised within the dispute window. **Consequence:** the payout-state machine adds a `frozen` state and a resolution path; admin investigation is required to release a frozen payout.

### Surface, language, and performance

- **Decision:** Responsive web app, PWA-grade on mobile; no native apps in v1. **Consequence:** the architecture targets web standards; no iOS or Android toolchain in v1.
- **Decision:** Bangla (default) and English with parity on owner and provider screens; admin console English-only. **Consequence:** the data model must allow Bangla content for names, descriptions, instructions, and provider profiles without locking in assumptions that make future localization hard — particularly for slug generation, search indexing, and URL handling. The PRD and architecture decide the exact localization strategy; the brief only requires that the design does not preclude bilingual content.
- **Decision:** Initial page payload under 500 KB on 4G; functional on low-end Android on intermittent connections. **Consequence:** the architecture must support code-splitting, lazy-loaded media, and graceful degradation; performance is a non-functional requirement, not an optimisation.
- **Decision:** Search default is a curated shortlist of 3–5 providers per query; "View all approved providers" is a secondary action. **Consequence:** search-results endpoint returns tier- and density-ranked shortlist by default; full-catalog endpoint is separate and reachable via explicit user action.

### Operational posture

- **Decision:** Admin is a primary platform role with a single-operator v1 operating ceiling of 25 active providers and 75 completed bookings per month. **Consequence:** role-based access treats admin as a first-class identity; the admin console is a real application surface designed for one operator at launch; the underlying data model and authentication design remain extensible to multi-admin, RBAC, and delegation without re-platforming.
- **Decision:** The platform is not anonymous. **Consequence:** owner identity is verified at booking (minimum: phone OTP, with name and address per PRD); provider identity is verified pre-listing.
- **Decision:** In-stay chat and updates are auditable by admin for cause. **Consequence:** chat and update data is retained and queryable by admin; the privacy posture is documented in the PRD.
- **Decision:** Lightweight vet-clinic directory per launch neighborhood is available during stays. **Consequence:** the data model supports a neighborhood-scoped clinic directory (name, address, phone, basic details); maintenance cadence and freshness SLA are PRD-owned; the platform does not run a hotline or partner formally with clinics in v1.
- **Decision:** Peak periods (Eid, December, summer) are designed for at the level of real capacity visibility, capacity-expansion controls, and owner-facing availability messaging. **Consequence:** the booking flow surfaces real availability and refuses requests when capacity is exhausted; providers can adjust capacity for known peak windows; no surge pricing, queuing, or complex peak-season logic in v1. Peak supply is a *strategic* supply consideration, not just an operational one: Tier-A anchor-provider participation in known peak windows is treated as part of the Tier-A commercial arrangement, and peak-week capacity is one of the signals used to vet Tier-A fit.
- **Decision:** Providers manage date-level capacity, not an on/off availability toggle. **Consequence:** the data model represents per-date capacity with per-species breakdown where relevant; the search endpoint filters out providers who cannot host the requested window; the admin console surfaces per-date capacity and per-provider utilization over time; peak-week expansion is a date-level adjustment, not a global toggle.
- **Decision:** The platform must deliver concrete, repeatable value for staying on the platform on both sides — otherwise the moat does not compound past the first booking. **Consequence:** owner-side repeat value comes from a persistent pet care history that pre-fills future intakes, makes the second booking faster than the first, and is the only durable cross-provider record of a pet's needs; provider-side repeat value comes from a verified reputation asset that compounds across bookings, repeat-owner tooling, and predictable payouts — none of which exist on WhatsApp or Facebook Messenger. The product is evaluated against this conditionality; off-platform defection is monitored as a leading indicator.
- **Decision:** Acute events during a stay (illness, injury, death) get a defined platform response posture, not ad-hoc handling. **Consequence:** the platform defines who is notified, in what order, with what communication template; the provider carries primary in-the-moment responsibility while admin carries platform-coordination responsibility; the owner is informed on a documented cadence; the incident is closed with a post-mortem regardless of outcome; review and dispute records feed back into the runbook.

### Foundational capabilities (high-level only)

The brief identifies what is *foundational*, not the build order; the PRD and architecture determine the actual development sequencing. Foundational capabilities are:

- **Two-tier provider onboarding and admin approval, including pre-launch Tier-A outreach.** Without curated supply — and without the Tier-A anchor presence — no other feature has a moat.
- **Booking lifecycle up through provider confirmation, including capture-on-confirmation payment, structured decline reasons, and date-level provider capacity.** Without a working payment and confirmation flow, no revenue or trust claim is real; without structured decline reasons, the routing-data layer is missing; without date-level capacity, peak handling collapses to vibes.
- **Verified-review gate with photos and the independent dispute flow.** Without either, the headline trust mechanism and the dispute safety net are both hollow.
- **Persistent pet care history across bookings.** Without it, every booking re-types the pet's needs from scratch, owners have no reason to keep booking through the platform, and the matching-data loop never closes. The history is what turns the second booking into a moat-strengthening event rather than a potential off-platform defection.
- **Acute-event response posture.** Without a defined runbook before the first incident, the platform's first real test of trust will be handled ad-hoc — and ad-hoc handling is exactly what the curated-trust promise exists to prevent.

In-stay updates, chat, surface vet-directory, advanced admin dispute tooling, and demonstrated-care-fit ranking improvements depend on the above and can be sequenced later.

### Explicit non-goals (also constraints)

- No pickup/drop-off service.
- No daily-home-visit service (boarding only; daily visits deferred to v2).
- No provider counter-offers in v1 (accept-or-decline only).
- No native iOS or Android apps.
- No multi-city or international expansion.
- No subscription tiers.
- No AI matching, dynamic pricing, or recommendation systems.
- No video check-ins or mandatory vet/license verification as a core v1 requirement.
- No multi-admin RBAC, delegation, or advanced ops tooling in v1.
- No platform-operated emergency hotline or formal clinic partnership in v1.
- No full internationalization infrastructure in v1 — Bangla + English is a product and data-model constraint, not an i18n framework.
- No insurance underwriting beyond what Bangladesh law requires.

This section does not become an implementation document. Every constraint above answers "what must the downstream artifact respect," not "how should it be built." Detailed technical decisions — localization framework choice, payment gateway vendor, database schema, deployment topology — belong in the architecture and implementation artifacts.

---

## 7. What Comes Next

This section closes the brief with a tight handoff to the PRD. It names what is *locked* in this brief, what is *owed* to the PRD, and what cannot be skipped without re-opening a brief decision.

### Locked in this brief

- v1 target market: Dhaka, Bangladesh; dogs and cats only; boarding-only (no daily visits).
- **Geographic launch phasing:** initial focus on Gulshan, Banani, Baridhara; expand only after density validates.
- **Two-tier curated supply:** Tier A (anchor, admin-outreach, featured placement, introductory commercial arrangement) and Tier B (open applicants, same minimum vetting bar). No self-serve sign-up.
- **Verified-booking reviews with photos** as the headline trust mechanism; review text + photos from the actual stay.
- **Structured provider decline reasons** as a first-class option at the confirmation step.
- **Independent dispute flow:** "Report an issue" within a defined dispute window freezes the provider payout for admin review; disputes and reviews are independent records.
- Pickup/drop-off deferred to v2.
- Daily home visits deferred to v2.
- Provider counter-offers deferred to v2 (accept-or-decline only in v1).
- Commission-based monetization with capture-on-confirmation payment timing; Tier A and Tier B may have different introductory terms.
- Provider confirmation as a required step in the booking lifecycle; decline with a structured reason is a valid outcome.
- Daily updates as expected behavior during the stay, not system-enforced; reminders only.
- **Search default = curated shortlist of 3–5 providers per query; "View all approved providers" as a secondary action.**
- **Lightweight vet-clinic directory per launch neighborhood** during stays. No platform hotline, no formal clinic partnership in v1.
- **Peak-period handling:** real capacity visibility, capacity-expansion controls, owner-facing availability messaging. No surge pricing or complex peak-season logic in v1. **Peak-week supply is a strategic consideration:** Tier-A anchor-provider participation in known peak windows is part of the Tier-A commercial arrangement, and peak-week capacity is one of the signals used to vet Tier-A fit.
- **Secondary pain (availability at peak) is a first-class design driver**, not a v2 follow-up. v1 must be designed for Eid/December/summer capacity pressure from Day 1.
- **Off-peak troughs are accepted as a feature of the curated-supply model.** No off-peak promotional pricing, subsidies, or retention incentives in v1; utilization is measured and revisited after data justifies intervention.
- **Admin operating ceiling v1 = 1 admin, 25 active providers, 75 completed bookings/month.** Admin console designed for single-operator scale; system remains extensible.
- **The moat is conditional on staying on the platform.** The product must deliver concrete, repeatable value to owners and providers for transacting through PetCare rather than via WhatsApp/Messenger after the first stay; off-platform defection is monitored as a leading indicator and is a first-order design constraint, not a marketing afterthought.
- **Demonstrated-care-fit over self-declared capability.** A provider's reputation is built on what they have demonstrably handled well across species and special-care needs, not on a single average star rating or self-declared flags alone. v1 captures the data from Day 1; ranking and matching improvements that consume it are sequenced in the PRD.
- **Date-level provider capacity (not on/off availability).** Providers maintain per-date capacity with per-species breakdown where relevant; search filters out providers who cannot host the requested window; peak-week capacity adjustments are date-level.
- **Persistent pet care history per pet across bookings.** Each pet accumulates food, medication, allergy, anxiety, special-attention notes, and confirmed-stay records. Owners see the history on every new booking; providers see the relevant history on incoming requests; the history pre-fills future intakes and feeds demonstrated-care-fit ranking over time.
- **Acute-event response posture is required from Day 1.** Acute events during a stay (illness, injury, death) get a defined platform response — who is notified, when, in what order, with what communication template — not ad-hoc handling. The vet-clinic directory is designed for incident-time lookup. The response posture is a launch-blocking deliverable in the PRD, not a post-incident retrofit.
- Three primary users — Owner, Provider, Admin. Expat/diplomatic owners are a secondary segment.
- Surface: responsive web app / PWA. Bangla + English on owner and provider screens with full parity; admin console English-only in v1.
- Booking lifecycle: Search → Select provider → Configure pet & care → Submit booking request → Provider confirms (accept or structured decline) → Stay (with optional daily updates, chat, and vet directory access) → Complete → Verified review + Report-issue window.

### Owed to the PRD (must be answered before launch)

The brief deliberately stops where numbers, rules, and acceptance criteria begin. The PRD owns:

- Exact commission percentage per tier, payout cadence, and the gateway-fee absorption rule.
- Cancellation, refund, no-show, and dispute policies in detail, including booking-state-machine transitions and payout-freeze mechanics.
- Confirmation-window duration (base + peak adjustment) and dispute-window duration.
- Provider vetting criteria (Tier A vs. Tier B), capability-flag taxonomy, and the application-review SLA.
- Local regulatory compliance checklist (trade license, Department of Livestock Services, animal welfare, data protection, tax treatment of platform commission).
- Pre-launch Dhaka supply assessment — curated-eligible provider count in launch neighborhoods, named Tier-A outreach list, onboarding throughput targets, waitlist risk.
- **Pre-launch demand validation plan and pass criteria** — 20–30 owner interviews or a structured-intake waitlist landing page, the specific signals being tested (trust/quality as primary pain, special-care willingness to pay, density in launch neighborhoods), and the decision rule for proceeding vs. re-opening the bet.
- Functional and non-functional requirements per lifecycle step.
- Localization strategy sufficient to support Bangla + English without over-engineering full internationalization.
- Admin operational runbooks for incident response, dispute resolution, review moderation, and connectivity-related override.
- **Acute-event response runbook** — defined roles during an incident (provider in-the-moment, admin platform-coordination, owner informed on a cadence), notification order, communication template, post-mortem practice, and the way review and dispute records feed back into the runbook.
- **Provider calendar UX and data model** — how date-level capacity is set, adjusted for known peak windows, surfaced in search, and consumed by the admin console.
- **Peak/Eid capacity management detail** — when capacity-expansion windows open for known peaks, how peak-tier commercial terms surface to providers, owner-facing availability messaging during compression.
- Search ranking rules: how the 3–5 curated shortlist is composed (tier weight, neighborhood density, capacity, capability match).
- **Demonstrated-care-fit ranking improvements** — which signals (species handled, special-care success, repeat-owner rate, review-with-photos) feed into ranking and matching in what order; the v1 baseline is capability-and-tier, the post-v1 progression is demonstrated-fit.
- Decline-reason taxonomy finalized (the brief lists five categories; the PRD may extend or split).
- Vet-clinic directory freshness SLA and maintenance cadence.
- Provider re-engagement and utilization-monitoring thresholds (30/60/90-day touchpoints).
- **Off-platform defection detection and mitigation** — leading indicators (second-booking rate, request-to-WhatsApp swap signals, provider repeat-client rate off-platform), and the intervention playbook when indicators degrade.

### Cannot be skipped without re-opening the brief

- **Pre-launch supply assessment with named Tier-A outreach list.** Curated-only is the moat. If supply is thin, the moat collapses before it compounds. This is launch-blocking.
- **Pre-launch demand validation.** The brief's bet — that Dhaka owners with special-care pets will prefer a curated, structured-intake marketplace over the Facebook/Messenger status quo — is a working hypothesis, not a fact. A pre-launch demand-validation round (recommended: 20–30 owner interviews or a waitlist-with-structured-intake landing page) is required before the first paid booking, to confirm the primary pain (trust and quality uncertainty, especially for special-care pets) is real, the willingness-to-pay range holds at the platform-commission price point, and the demand density in launch neighborhoods justifies the curated-supply economics. This is launch-blocking on the same footing as the supply assessment.
- **Pre-launch legal review.** Animal Welfare Act 2017, draft Data Protection Act 2023, trade licensing, and tax treatment of platform commission all need a documented position before the first paid booking.
- **Bangla-first customer-facing content.** The primary acquisition channel is Dhaka-based; English-first or Bangla-second would undercut that channel.

### Next artifact to produce

The next workflow to run is the **PRD** (`bmad-prd`). The PRD consumes this brief, expands the eight-step lifecycle into functional and non-functional requirements, and answers the items in *Owed to the PRD* above. After the PRD, the natural progression is **architecture** (`bmad-architecture`) and then implementation (`bmad-build`).

### Status of this document

This brief is the locked input to the PRD at the time of writing. Anything in this document can be revised if new evidence demands it; the constraints and locked decisions above are the version the downstream artifacts should start from.

