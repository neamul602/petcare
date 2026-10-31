---
intent: 001-petcare-v1
phase: construction
status: complete
type: new-feature (green-field)
created: 2026-10-28T18:10:00Z
updated: 2026-11-02T15:10:00Z
---

# Intent: PetCare v1

## 1. One-line intent

Build **PetCare v1**: a curated, trust-first pet-boarding marketplace for urban Dhaka, delivered as a mobile-first, bilingual (Bangla default, English parity) web PWA with three surfaces (Owner `/`, Provider `/provider`, Admin `/admin`, English only), backed by an API, a relational database and five separately runnable Dummy integration APIs.

## 2. Authority of this Intent

The brief (rev 3, final) and PRD (rev 1, final) are signed off. This Intent **reflects them and does not reinterpret them**. Where sources conflict, the order is: brief, PRD, DESIGN.md / EXPERIENCE.md, scenario page specs, mockups/prototype. Signed-off documents in `docs/` are never edited.

## 3. Business problem

Pet boarding in Dhaka happens through fragmented social channels (Facebook groups, Messenger, WhatsApp). Trust is mediated by private reputation, so owners cannot tell in advance whether a provider will meet a pet's specific needs, get no updates during a stay, and worry about food, medication and temperament. Providers face irregular demand, manual coordination, no-shows, payment friction and no reputation asset. The gap is widest for dogs and cats with special-care requirements (medication, allergy, anxiety, special diet, senior care).

PetCare replaces **trust-via-DM** with structured intake, curated (admin-vetted) supply, verified booking history, structured updates and demonstrated-care-fit reputation. The moat is **conditional**: it only compounds if both sides keep booking through PetCare after the first stay, so v1 must make the second booking faster, safer and more valuable than the first (UJ-4).

## 4. Primary users

| User | Surface | Role in v1 |
|---|---|---|
| **Owner** | `/` (Bangla default, English parity) | Urban Dhaka dog/cat owner; finds a vetted provider, books a stay for a special-care pet, follows the stay, leaves a verified review, books again. Persona: Bibi (Banani) and Tito. |
| **Provider** | `/provider` (Bangla default, English parity) | Dhaka home sitter or small boarding operator, Tier-A or Tier-B; manages date-level capacity, confirms or declines with structured reasons, posts daily updates, gets paid. Persona: Rashid (Gulshan, Tier-A). |
| **Admin** | `/admin` (English only) | Single operator (ceiling: 1 admin / 25 active providers / 75 completed bookings per month); vets providers, works the urgency queue, runs the acute-event runbook, resolves disputes, moderates reviews, reconciles payouts. Persona: Ayaat. |

Secondary (not an acquisition priority): expat/diplomatic owner. The bilingual UI and structured intake must not lock them out. Guests may browse marketing surfaces and public provider profiles but cannot book.

## 5. Desired outcomes

North-star proxies (PRD §7; numeric targets are deliberately deferred until after a pilot cycle):

- **SM-1** Completed-and-reviewed bookings (booking reaches `completed` with a verified review).
- **SM-2** Repeat-booking rate on-platform (the cleanest read on moat conditionality).
- **SM-3** Provider-side retention (second booking accepted and completed on-platform).

Operational reads that the build must make measurable: SM-4..SM-20 as listed in PRD §7. Counter-metrics SM-C1..SM-C5 are not to be optimised (no GMV target, no active-user counts, no average star rating as reputation signal, no raw booking volume as launch readiness, no provider earnings as success signal).

Experience targets taken from the PRD user journeys and NFRs:

- UJ-4: book-again confirmed end to end in **under 4 minutes**; second-booking intake pre-filled from care history.
- NFR-1/2: initial payload **< 500 KB**, TTI **< 3 s** on 4G (owner/provider); NFR-3: search p95 **< 1 s**; NFR-4: admin load **< 2 s** on a low-end phone.
- Acute event: trigger to owner notified **under 5 minutes** (workbook measure; PRD SM-20 measures time to admin page).

## 6. Scope: in (PRD §6.1)

Everything described in PRD §4 (FR-1..FR-50) and the cross-cutting NFRs, delivered across the three surfaces:

- **Owner:** phone-OTP sign-in; pet profile and care configuration (species-conditional, structured special-care flags); care history (persist, pre-fill, provider visibility, retention); search across launch neighbourhoods with a curated 3-5 shortlist plus "view all"; date-level capacity enforcement; booking request with payment authorization; confirmation and structured-decline handling; stay updates and booking-scoped chat; vet-clinic directory; verified reviews with photos; report an issue within the dispute window; book again.
- **Provider:** date-level capacity management with peak-window adjustment; request review with care history; confirm or structured decline; daily updates; chat; vet directory; verified reviews on profile; Tier-A peak-participation prompt; payouts.
- **Admin:** urgency queue; provider application intake and vetting (Tier-A/Tier-B, bias audit, appeal outcome); acute-event coordination and runbook; report investigation and dispute resolution; review moderation; payout reconciliation; immutable audit log; operating-ceiling monitoring; off-platform defection signals and 30/60/90-day re-engagement.
- **Cross-cutting:** capture-on-confirmation payments, MFS first (bKash, Nagad), card secondary (subject to OQ-7); commission and payout; refunds; PWA; Bangla/English parity; performance and accessibility budgets; auditability (NFR-21..23).
- **Four journeys to be demonstrable end to end:** UJ-1 first booking, UJ-2 provider Eid capacity, UJ-3 admin at the ceiling, UJ-4 book again.

## 7. Scope: out (v1 non-goals, PRD §5 and §6.2)

Not to be built and to be rejected or absent by design:

- **No clinical or veterinary boarding.** Bookings whose primary purpose is diagnosis, treatment, clinical monitoring or procedures are **rejected at intake**. No emergency hotline, no clinic partnership, no veterinarians. The vet-clinic directory is a **lookup, not a partnership** (clinic name, address, phone; per launch neighbourhood).
- No pickup/drop-off or transport; no daily home visits (boarding only).
- No native iOS/Android app (responsive web PWA only).
- No open provider sign-up (all onboarding is admin-gated).
- **Launch neighbourhoods only: Gulshan, Banani, Baridhara.** Dhaka only. **Dogs and cats only.**
- No counter-offers, subscriptions, multi-admin/RBAC, owner appeals, provider review responses or provider counter-dispute.
- No paid placement or "sponsored" markers (NFR-24); no surge pricing or dynamic commission (NFR-25); no consumption of demonstrated-care-fit data for ranking (NFR-26); v1 ranking is tier + neighbourhood density + date-level capacity only.
- No scanning of WhatsApp/Messenger for defection (signals are user-surfaced).
- No payment-escrow, no insurance product, no AI matching, no full i18n infrastructure beyond Bangla + English.

**Out of build scope for this project (documented, not coded):** pre-launch demand validation and supply assessment (FR-51, FR-52) and legal/compliance posture documents (NFR-16..NFR-20, OQ-18, OQ-21, OQ-22). These are launch-blocking for a real launch but are not software deliverables here.

## 8. Source artifacts (UI/UX included as a source)

| Source | Authority |
|---|---|
| `docs/PRODUCT.md` | Product summary, principles, non-capabilities, directional stack |
| `docs/brief.md` (rev 3) | Locked strategic decisions |
| `docs/prd.md` (rev 1) | 52 FRs, 4 UJs, 26 NFRs, 20 SMs + 5 counter-metrics, 25 OQs, assumptions |
| `docs/ux/DESIGN.md` | Visual authority: tokens, colours, typography, components |
| `docs/ux/EXPERIENCE.md` | Behaviour authority: IA, voice, states, flows, accessibility |
| `docs/ux/mockups/` (18 screens + index + one component spec), `prototype/index.html`, `demo/index.html` | Illustrations; written specs win on conflict |
| `docs/scenarios/` | 5 scenarios, 43 page specs (EN + BN content), trigger map |

**The final product must reproduce the functional experience represented by the supplied UI/UX** (mockups, prototype and page specs). It is built from the specifications; mockup/prototype JavaScript is not copied. Some page specs have no mockup; those are built from the written spec.

## 9. Dummy integrations (part of the product)

The real external systems are unavailable, so PetCare builds and uses separately runnable **Dummy APIs**. The application calls them only through its own ports/adapters, never from the UI, and nothing is hard-coded in the UI.

| Real conceptual system | Training substitute |
|---|---|
| Payment gateway (bKash, Nagad, card): authorize, capture, release, refund | Dummy Payment Gateway API |
| MFS payout rail: batches, freeze, release | Dummy MFS Payout API |
| SMS / OTP provider | Dummy SMS / OTP API |
| Notification channel (booking, acute-event, re-engagement messages) | Dummy Notification API |
| Photo storage (stay photos, review photos) | Dummy Photo Storage API |

Each Dummy API has health, reset, inspection and failure modes (down, timeout, decline, ambiguous result where the request succeeded but the answer was lost). These are **training contracts only**; no claims are made about the real bKash, Nagad, SSLCommerz or SMS interfaces. Real gateway contracts are **not invented**.

## 10. Principles carried into every artifact

1. Do not invent requirements silently: Ask, Record, Decide, Continue.
2. Keep PRD identifiers (FR-1..FR-52, NFR-1..NFR-26, UJ-1..UJ-4, OQ-1..OQ-25) for traceability.
3. **Never fabricate trust signals** (PRODUCT.md): no fabricated bookings, reviews or testimonials; seed data is training data, clearly labelled, and lives only in seed files.
4. Capture on confirmation, never on request (FR-39); every booking transition (NFR-22) and payment event (NFR-23) is logged; admin audit log is immutable (NFR-21).
5. Coral is used only for the acute state; forest green is primary (DESIGN.md).

## 11. Unresolved questions (PRD §9, identified explicitly)

None of these is silently decided; values needed by the software are decided by a human in Step 7a and recorded as training decisions (TD-*).

**Update 2026-10-29:** the blocking questions below are now resolved in `memory-bank/standards/training-decisions.md` (TD-1..TD-16).

**Software cannot run without a value (decide as training values):**
OQ-1 confirmation window; OQ-2 dispute window; OQ-3 payout cadence (directional default: weekly batched MFS); OQ-4 refund values; OQ-5 authorization extension for repeat bookings; OQ-6 cancellation / no-show paths and their refund mechanics; OQ-7 card in v1 or deferred; OQ-8 commission per tier (directional bands: Tier-A introductory 8-12%, Tier-B 15-18%); OQ-10 decline-reason taxonomy extension; OQ-11 re-engagement thresholds (directional: <40% day 30, <30% day 60, <20% day 90); OQ-12 update-reminder cadence and configurability.

**Needed in a lighter form (resolve during requirements/stories):**
OQ-9 vetting-bar documents and review SLA; OQ-13 density thresholds for expansion; OQ-14 provider earnings visibility (brief: likely no); OQ-16 vet-directory freshness cadence; OQ-17 localization specifics (slugs, transliteration, search indexing); OQ-19 retention floor (PRD: 24 months minimum); OQ-20 acute-event cadence values and templates; OQ-23 expat UI (PRD: Bangla-first with English parity); OQ-24 v2 activation triggers; OQ-25 care-fit ranking consumption (v1: no).

**Out of build scope:** OQ-15 named Tier-A anchor providers (replaced by seeded training providers), OQ-18 legal review scope, OQ-21 and OQ-22 demand-validation criteria and decision rule.

**Source observations to flag (not silently resolved):**
- PRD UJ-1 shows a provider profile with "14 verified reviews (avg 4.7)" and UJ-2 shows a provider with 7 completed bookings and a 4.9 average. Under the never-fabricate rule these cannot be seeded as real; reviews must be produced by completing training bookings in the app or labelled as training fixtures.
- UJ-1 says the provider accepts within 3 hours while OQ-1 (confirmation window) is open; the 3 hours is narrative, not a rule.
- PRODUCT.md lists six neighbourhoods in the owner persona (including Dhanmondi, Uttara, Mirpur DOHS) but launch neighbourhoods are only Gulshan, Banani and Baridhara (PRD §4.3, §5).
- The scenarios header says `pages_total: 46` while `pages_specified: 43`; the build targets 43 page specs.

## 12. Approved standards this Intent builds on

`memory-bank/standards/` (tech stack, data stack, coding standards, testing standards), approved 2026-10-28: Astro + Preact + Tailwind + Workbox PWA; Node 22 LTS + Fastify + PostgreSQL + Drizzle; separate Dummy services; Vitest and Playwright.

## 13. Not in this artifact

No implementation, no requirements elaboration (Step 7), no units, stories or bolts. Next artifact after approval: detailed Requirements.
