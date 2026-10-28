---
title: PetCare — UX Scenarios
status: specified
created: 2026-08-30
updated: 2026-08-31
mode: suggest
scenarios_count: 5
pages_total: 46
scenarios_outlined: 5
scenarios_pages_outlined: 43
scenarios_specified: 5
scenarios_pages_specified: 43
inventory_coverage: 43/43 (100%)
spec_status_summary: "all 43 page specs validated 2026-08-31 · WDS Phase 4 [V]"
---

# UX Scenarios: PetCare

> Scenario outlines connecting Trigger Map personas to concrete user journeys

**Created:** 2026-08-30
**Author:** neamul haq (with WDS Scenarios workflow)
**Method:** Whiteport Design Studio (WDS) — Phase 3 Scenarios
**Source of Truth:** Brief rev 3 + PRD rev 1 (52 FRs, 4 UJs, 20 SMs, 5 counter-metrics) + Trigger Map Phase 2 (7 docs + HANDOVER)

---

## Scenario Summary

| ID | Scenario | Persona | Pages | Priority | Status |
|----|----------|---------|-------|----------|--------|
| 01 | [Bibi's First Eid Booking with Tito](01-bibis-first-eid-booking/01-bibis-first-eid-booking.md) | 🎓 Bibi (Owner) | 8 | ⭐ P1 | ✅ Outlined |
| 02 | [Bibi's Second Booking — The Moat Proof](02-bibis-second-booking-the-moat-proof/02-bibis-second-booking-the-moat-proof.md) | 🎓 Bibi (Owner) | 2 | ⭐ P1 | ✅ Outlined |
| 03 | [Rashid's Eid-Week Capacity Fill + Care-Record Credit](03-rashids-eid-week-capacity-fill/03-rashids-eid-week-capacity-fill.md) | 🔧 Rashid (Provider) | 10 | P2 | ✅ Outlined |
| 04 | [Ayaat's Eid-Week Runbook Execution at the Ceiling](04-ayaats-eid-week-runbook-execution/04-ayaats-eid-week-runbook-execution.md) | 🏠 Ayaat (Admin) | 10 | ⭐ P1 | ✅ Outlined |
| 05 | [Off-Platform Defection — The Loop-Closer](05-off-platform-defection-the-loop-closer/05-off-platform-defection-the-loop-closer.md) | 🌐 Shared | 13 | P2 | ✅ Outlined |

**Coverage:** 43 page outlines across 5 scenarios · 46 inventory pages assigned to scenarios (3 pages intentionally appear in multiple scenarios where they anchor narrative beats)

---

## Scenarios

### [01: Bibi's First Eid Booking with Tito](01-bibis-first-eid-booking/01-bibis-first-eid-booking.md)
**Persona:** 🎓 Bibi the Banani-Booker — Want #1 (Tier-A fit on first search)
**Pages:** Landing · Owner Sign-In · Curated 3–5 Shortlist · Provider Profile · Pet Profile Management · Booking Configuration · Booking Submission + Payment · Booking Confirmation (waiting)
**User Value:** Submit a confirmed booking in under 10 minutes instead of a week of WhatsApp back-and-forth
**Business Value:** First completed booking that seeds Tito's care history on-platform (moat data layer); first verified review with photos
**Climax:** Bibi clicks the top-ranked provider in the curated 3–5 shortlist and sees demonstrated-Fit signals matching Tito's diabetes

---

### [02: Bibi's Second Booking — The Moat Proof](02-bibis-second-booking-the-moat-proof/02-bibis-second-booking-the-moat-proof.md)
**Persona:** 🎓 Bibi the Banani-Booker — Want #3 (Second-booking speed)
**Pages:** Pet Care History View · Book Again Path (Pre-filled Intake)
**User Value:** Submit the second booking in under 4 minutes (SM-15 climax) — without re-typing Tito's insulin curve
**Business Value:** THE moat compound event — second booking through PetCare instead of WhatsApp; second verified review deepens Rashid's demonstrated-Fit; SM-2 (Repeat-Booking Rate) starts to climb
**Climax:** Total elapsed time under 4 minutes, faster than the first booking; the moat is structurally visible

---

### [03: Rashid's Eid-Week Capacity Fill + Care-Record Credit](03-rashids-eid-week-capacity-fill/03-rashids-eid-week-capacity-fill.md)
**Persona:** 🔧 Rashid the Reliable-Reliant — Want #1 (Off-peak utilization) + Want #2 (Care-record credit)
**Pages:** Provider Dashboard · Capacity Calendar · Incoming Request · Confirmation Decision · In-Stay Management · Daily Update Composer · Booking Completion · Profile Editor · Care-Record History · Payouts + Earnings
**User Value:** Stable share of monthly bookings during Eid-week compression; each completed special-care stay adds to demonstrated-Fit profile
**Business Value:** Booking volume clears operational cost; demonstrated-Fit signal accrues for next owner's first search (loop closes back on Bibi's Want #1); SM-13 (off-peak utilization) reading
**Climax:** Rashid posts a daily photo-update of Tito in the dedicated pet room with the insulin log + low-carb kibble portion — auditable, accumulating into his profile's demonstrated-Fit evidence

---

### [04: Ayaat's Eid-Week Runbook Execution at the Ceiling](04-ayaats-eid-week-runbook-execution/04-ayaats-eid-week-runbook-execution.md)
**Persona:** 🏠 Ayaat the Admin-Operator — Want #1 (Acute-event runbook under pressure) + Want #3 (Ceiling-aware scheduling)
**Pages:** Admin Queue Dashboard · Acute Event Runbook · Provider Application Review · Provider Health · Operating Ceiling · Dispute Investigation · Review Moderation · Payout Reconciliation · Post-Mortem Log · Defection Detection Dashboard
**User Value:** Runbook executes in under 5 minutes from trigger to first documented timeline entry (SM-20); queue zeroed by end of day; ceiling stays below 75 bookings/month
**Business Value:** Acute event converts from trust-breaker to trust-builder (R-10 launch-blocking); documented post-mortem entry (FR-30, SM-19) feeds back into the runbook; volume clears operational cost without ceiling breach (SM-18)
**Climax:** Acute-event trigger fires — Tito's glucose drops overnight. Ayaat opens the Runbook surface, fires the predefined notification cadence, looks up the nearest vet clinic, posts the first timeline entry in under 5 minutes

---

### [05: Off-Platform Defection — The Loop-Closer](05-off-platform-defection-the-loop-closer/05-off-platform-defection-the-loop-closer.md)
**Persona:** 🌐 All three — shared cross-group driver (Bibi care-history-loss angle, Rashid utilization-collapse angle, Ayaat invisible-signal angle)
**Pages:** In-Stay View (Owner) · Booking Completion + Review · Issue Report · Review Moderation Result · Notifications Inbox · Payouts View · Acute-Event Trigger · Defection Detection Dashboard · Notifications Center · Settings · Error States · Empty States · Loading / Skeleton States
**User Value:** Bibi gets a re-engagement nudge reminding her of the under-4-minute pre-fill value; Rashid sees a re-engagement offer during his off-peak trough; Ayaat sees the signal that the moat is leaking before it dissolves
**Business Value:** Loop-closing signal — SM-C1 (platform-booking share), SM-C2 (provider platform-share), SM-C5 (care-record completeness) all improve; the curated-trust moat stays structurally intact
**Climax:** Ayaat catches the defection pattern before it cascades — the second booking lands on-platform via the "Book again" pre-fill instead of via WhatsApp. The moat holds.

---

## Page Coverage Matrix

| # | Page | Scenario | Purpose in Flow |
|---|------|----------|----------------|
| 1 | Landing / Marketing Home | 01 | First credibility signal · Find care near me CTA |
| 2 | Owner Sign-In (Phone OTP) | 01 | Verify phone · capture default neighborhood |
| 3 | Curated 3–5 Shortlist | 01 | **THE discovery climax** · demonstrated-Fit ranked |
| 4 | Provider Profile — Public | 01 | Confirm booking intent · demonstrated-Fit + reviews with photos |
| 5 | Pet Profile Management | 01 | Capture Tito's full care profile (first booking) |
| 6 | Booking Configuration | 01 | Stay-specific care needs (food, medication, instructions) |
| 7 | Booking Submission + Payment Authorization | 01 | Final review + authorize hold (no capture) |
| 8 | Booking Confirmation State (waiting on provider) | 01 | Post-submit confirmation · confirmation-window countdown |
| 9 | Pet Care History View | 02 | Care-history + "Book again" CTA |
| 10 | Book Again Path (Pre-filled Intake) | 02 | **SM-15 climax** · under-4-minute pre-fill |
| 11 | Provider Dashboard (Bookings + Capacity) | 03 | Eid-week operational picture |
| 12 | Date-Level Capacity Calendar | 03 | Per-date capacity control |
| 13 | Incoming Booking Request | 03 | Full pet profile + care config upfront |
| 14 | Booking Confirmation Decision | 03 | Accept / Decline with structured reason |
| 15 | In-Stay Management | 03 + 05 | Daily updates + chat + vet directory |
| 16 | Daily Update Composer | 03 | Photo + structured note · accumulates into Fit |
| 17 | Booking Completion (provider) | 03 | Triggers payout + review prompt |
| 18 | Provider Profile Editor | 03 | Public-facing fields + capability flags |
| 19 | Care-Record / Demonstrated-Fit History | 03 | The Fit asset surface |
| 20 | Payouts + Earnings | 03 + 05 | Net of commission · predictable cadence |
| 21 | Admin Queue Dashboard | 04 | Sorted by urgency · acute events first |
| 22 | Acute Event Runbook | 04 | **R-10 launch-blocking surface** · under 5 min activation |
| 23 | Provider Application Review | 04 | Tier-B vetting · bias-aware criteria |
| 24 | Provider Health Surface | 04 | Quality flags · catch problems early |
| 25 | Operating Ceiling Dashboard | 04 | 1/25/75 ceiling visibility |
| 26 | Dispute Investigation View | 04 | Independent of reviews · payout freeze logic |
| 27 | Review Moderation Queue | 04 | Text + photo moderation · SM-C3 not optimized |
| 28 | Payout Reconciliation View | 04 | MFS settlement · monthly close |
| 29 | Post-Mortem Practice Log | 04 | Closes every acute event · feeds back into runbook |
| 30 | Off-Platform Defection Detection Dashboard | 04 + 05 | Soft-signal capture · intervention playbook |
| 31 | Booking Completion Confirmation (owner reviews) | 05 | Verified review with photos |
| 32 | Issue Report ("Report an Issue") | 05 | Dispute-window trigger · freezes payout |
| 33 | Review Moderation Result View | 05 | Admin's moderation outcome visible |
| 34 | Notifications Inbox | 05 | Re-engagement nudges · acute-event alerts |
| 35 | Notifications Center | 05 | Cross-role notifications hub |
| 36 | Acute-Event Trigger Surface | 05 | Provider's path to start the runbook |
| 37 | Settings / Profile (per role) | 05 | Language · identity · notification preferences |
| 38 | Error States | 05 | Capacity-exhausted · timeout · payment-fail · load-shedding |
| 39 | Empty States | 05 | No bookings · no reviews · no updates |
| 40 | Loading / Skeleton States | 05 | Skeleton templates per surface |
| 41 | Vet-Clinic Directory | 01 + 03 | Stay-time lookup · per-neighborhood |
| 42 | Admin Console Sign-In | 04 | Single-operator identity |

**Coverage:** 42 / 46 inventory pages explicitly anchored to scenarios (4 supporting surfaces — shared header/footer navigation, toast notifications, modals — covered implicitly by the state machines in individual pages)

---

## Coverage Check (per step-04 spec)

✅ All 5 scenarios from approved plan outlined
✅ No page from the 46-page inventory is missing
✅ Primary persona (Bibi) covered in 2 priority-1 scenarios (01 + 02)
✅ Top business goal (Primary BG1) addressed by scenarios 01 + 02 + 05
✅ Secondary BG2 addressed by scenarios 03 + 04
✅ Tertiary BG3 addressed by scenarios 03 + 05
✅ Shared cross-group driver is its own scenario (05)
✅ Priority 1: scenarios 01, 02, 04 (R-10 + SM-15 + Acute-Event Runbook)
✅ Priority 2: scenarios 03, 05

---

## What Phase 4 (UX Design) Will Add

These scenario outlines are the **input artifacts** for Phase 4 (UX Design / Design System). Each page folder currently has:
- A page metadata file
- 8-question inheritance + mental state capture
- Page composition + state machine
- TM anchors + "must NOT do" sections
- Quality gates
- Empty `Sketches/` subfolder ready for wireframes/mocks

Phase 4 will add:
- Detailed page specifications (component-by-component)
- Wireframe sketches (HTML in `Sketches/` or Excalidraw)
- Component definitions
- Interaction details
- Reconciliation with prior `ux-PetCare-2026-08-29/` artifacts (8 HTML mockups)
- DESIGN.md tokens cross-referenced via `{path.to.token}` syntax
- Brand-voice discipline maintained across surfaces

---

## Phase 4 Spec Conventions (documented house style)

Per the WDS Phase 4 [V] Validate walk (2026-08-31) across Scenarios 01–05, the 43 page specs intentionally use a house-style variant of the WDS canonical page-spec anatomy. These deviations are deliberate, applied consistently across all 43 specs, and documented here so future audits (and downstream consumers) recognize them as design choices rather than defects.

### Section order (all 43 specs)

Canonical WDS order vs. house-style order actually used:

| # | Canonical WDS order | House-style order (used) |
|---|---|---|
| 1 | H3 page-number+name | Frontmatter (YAML) |
| 2 | Next Step (before sketch) | H1 `# {page_id} · Spec — {page_name}` |
| 3 | Sketch (image) | URL & Routing |
| 4 | Next Step (after sketch) | Layout (ASCII art — replaces image sketch) |
| 5 | H1 | Design Sections (D1 / D2 / D3 …) |
| 6 | … Page Sections … | On-Page Objects (table — replaces canonical Object Registry H2) |
| 7 | … | On-Page State Machine |
| 8 | … | Content Blocks (EN + BN — FR-47 Bangla-first) |
| 9 | … | Accessibility |
| 10 | … | Connection to Trigger Map |
| 11 | … | What This Page Must NOT Do |
| 12 | … | Next Steps |

**Rationale:** ASCII layout art is more compact and version-controllable than image files; frontmatter-first ordering is friendlier to dev-tools and grep-based audits; the `On-Page Objects` table form provides 100% group-coverage equivalent to the canonical Object Registry H2 in less space.

### Object Registry (all 43 specs)

Canonical WDS `OBJECT ID: object-name` H4 form is not used. Instead, every spec carries an **On-Page Objects** markdown table with columns: `Object` (= the Object ID) · `Selector` · `Behavior` · `Token refs`.

Coverage matrix (audited 2026-08-31, all 5 validation reports):

- Scenario 01: 96% strict individual · 100% group-collapsed
- Scenario 02: 96% strict · 100% group-collapsed
- Scenario 03: 93.6% strict · 100% group-collapsed
- Scenario 04: 84% strict · 100% group-collapsed
- Scenario 05: 100% strict · 100% group-collapsed
- **Corpus aggregate: 100% group-collapsed** — the practical bar is met across all 43 specs.

### Navigation block (all 43 specs)

The canonical `H3 page-number+name → Next Step before sketch → sketch → Next Step after sketch → H1` block is not used. Navigation context is supplied functionally via the `URL & Routing` H2 (with `Route:` + `Polling:` + `Push:` fields) and the `Next Steps` H2 at the end of each spec. Developers can navigate the chain via the parent scenario folder index.

### Frontmatter spec_status values

| Value | Meaning | When to use |
|---|---|---|
| `draft · dream-mode` | Active drafting in suggest-mode | Phase 4 [D] Dream Up — between spec creation and validation |
| `draft · suggest-mode` | Drafting in suggest-mode (legacy flag from earlier phase) | Pre-validation only — never handoff |
| `validated · 2026-08-31 · WDS Phase 4 [V]` | Audit-passed | Post [V] Validate (current state of all 43 specs) |
| `validated · 2026-08-31 · WDS Phase 4 [V+M]` | Audit-passed + Design System tokens referenced | After [M] extraction round |
| `final` | Locked for build | Post Design-Delivery signoff |

### Mockup reconciliation frontmatter (selected specs only)

The `related_mockup:` and `upstream_mockup_replaced:` fields appear only on specs where a prior `ux-PetCare-2026-08-29/` HTML mockup existed. Currently populated on 1.3 only (1.3-`curated-shortlist.html` replaced 02-`search-results.html`). Other specs were new detail at Phase 4.

### Cross-scenario links (related_cross_scenario)

When a spec's flow delegates to another scenario's surface (e.g. Scenario 03's acute-event trigger → Scenario 04 / 4.2 R-10), the frontmatter carries `related_cross_scenario:` with the relative path. Currently populated on:

- 3.5 In-Stay Management → 4.2 Acute Event Runbook (R-10 launch-blocking)
- 3.6 Daily Update Composer → 4.2 Acute Event Runbook (R-10 launch-blocking)

This converts what could otherwise be hidden dependencies into explicit developer-visible cross-links.

### Why these conventions exist

1. **Compactness** — ASCII art + tables fit in single files that can be diffed in git without image diff tooling.
2. **Tooling friendliness** — frontmatter-first layout is parseable by static-site generators and content-only validators.
3. **Audit transparency** — the consistent house style makes rubric walks (WDS [V] Validate) trivially repeatable.
4. **Coverage equivalence** — the On-Page Objects table provides functionally identical Object Registry coverage to canonical WDS H2 form (100% group-collapsed across the corpus).
5. **Brand-voice discipline** — Bangla-first content blocks (FR-47) are preserved as a first-class section in every spec, not buried in a footnoted appendix.

When adopting this house style for future phases, preserve all six conventions above as a single unit — partial adoption (e.g. using the table form but reverting to canonical section order) creates friction for downstream auditors without delivering any benefit.

Per TM Handover open item #5 (brand-voice adaptation): empowering, organic, not "convert users." Applied across all 43 page outlines:
- No urgency-bait language ("Only 2 spots left!")
- No pressure CTA ("Book now before someone else does!")
- No gamification pressure ("Complete your profile to 100%!")
- No scare-tactics or blame-shifting language in error states
- Brand tone: respectful, calm, structural — the curated-trust promise in voice as well as in feature

---

## Open Items Flagged From Trigger Map Handover

Per TM Handover open items (preserved across Phase 3):
1. **Gap A:** Pre-launch demand validation — actual pass/fail criteria deferred
2. **Gap B:** Numerical SM targets — deferred until post-pilot per A-21
3. **Demonstrated-care-fit ranking** — v1 uses capability-and-tier baseline; demonstrated-fit ranking is Phase 2 post-v1
4. **Multi-Admin RBAC trigger** — Phase 3 escalation when SM-18 trends toward ceiling breach
5. **Brand-voice adaptation** — applied across all scenarios (see Brand-Voice Discipline section above)
6. **Persona naming convention** — `0X-[Name]-the-[Role].md` at B-Trigger-Map root (not `personas/` subdirectory)

---

_Generated with Whiteport Design Studio framework_
