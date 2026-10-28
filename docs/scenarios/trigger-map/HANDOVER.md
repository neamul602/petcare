# Trigger Map — Handover Package for Phase 3 (Scenarios) and Phase 4 (UX Design)

> Companion to the Trigger Map artifacts — what UX / Scenario work needs to know, anchored to Brief rev 3 + PRD rev 1 as source of truth

**Created:** 2026-08-30
**Status:** COMPLETE
**Audience:** WDS Scenario Workflow (Phase 3) and Design System / UX Design (Phase 4)

---

## Documentation Structure

```
design-process/B-Trigger-Map/
  00-trigger-map.md              (251 lines) — Start here: visual overview + Mermaid + nav
  01-Business-Goals.md           (182 lines) — Vision + 3-tier objectives + flywheel
  02-Bibi-the-Banani-Booker.md   (366 lines) — ⭐ Primary persona (Owner)
  03-Rashid-the-Reliable-Reliant.md (326 lines) — 🔧 Secondary persona (Provider)
  04-Ayaat-the-Admin-Operator.md (285 lines) — 🏠 Tertiary persona (solo Admin)
  05-Key-Insights.md             (169 lines) — Strategic implications + emotional transformation + dev phases
  03-Feature-Impact-Analysis.md  (219 lines) — 18 features × 4 sub-buckets, scored
  HANDOVER.md                    (this file) — Handover to Scenarios / Design System phases
```

Total: 7 documents, 1,798 lines of Trigger Map content.

---

## Primary Focus

**Who:** Bibi the Banani-Booker — late-30s Banani owner, dual-income household (BDT 80k+), has had Tito (diabetic Shih Tzu) for four years. Tito was diagnosed diabetic 8 months ago; needs twice-daily insulin, low-carb kibble, quiet environment. Eid is the first booking trigger; subsequent weekend getaways compound the trust moat.

**Transformation:** From "another WhatsApp-vendor gamble with Tito's insulin curve" → to "first-search confidence because PetCare already shows what providers have demonstrably handled well for diabetic small dogs" — and the second booking becomes the structural proof that the curated-trust moat compounds.

---

## Must-Address (Top 3 Positive Drivers ✅)

1. **Tier-A fit on first search** — Curated 3–5 shortlist ranked by demonstrated-care-fit (capability-and-tier at v1 launch; demonstrated-fit at maturity). FR-11, FR-21, FR-43, FR-44, FR-49 · SM-7, SM-11
2. **Daily in-stay visibility** — Structured photo + note updates accumulating into Care History. FR-1, FR-15, FR-26, FR-43, FR-45 · SM-9
3. **Second-booking speed** — "Book again" path with Care History pre-fill in under 4 minutes (UJ-4 climax). FR-7, FR-8, FR-48 · SM-15

---

## Must-Avoid (Top 3 Negative Drivers ❌)

1. **Tito's diabetes mishandled in an acute event** — Acute Event Runbook is R-10 launch-blocking. Without a defined Runbook before the first incident, the platform's first real test of trust is handled ad-hoc — exactly what the curated-trust promise exists to prevent. FR-14, FR-22, FR-26–30, FR-34, FR-35, FR-45 · SM-19, SM-20
2. **Care history lost in the WhatsApp handoff** — On-Platform Repeat Value mechanisms (FR-48, FR-49) + off-platform soft-signal capture (FR-50, FR-36, A-14) make staying on-platform structurally more valuable than the discount. Without them, the second booking leaks to WhatsApp and the moat starts dissolving.
3. **Radio silence after handover** — Daily Updates as a first-class surface — photo + note, structured, auditable, soft-enforced. FR-1, FR-15, FR-26, FR-43 · SM-9

---

## Feature Priority (Top 3 from Must-Have MVP)

From the 18-feature Feature Impact Analysis (4 sub-buckets: Primary-tier Must Have / Secondary Obj 2 Operational Constraint / Launch-Blocking Substrate / Consider):

### Primary-tier Must Have (top 3)
1. **F1 Acute Event Runbook** (Score 11 / 11) — R-10 launch-blocking; converts trust-breakers into trust-builders. Anchored to FR-14, FR-22, FR-26–30, FR-34. The binding surface for Bibi Fear #1 and Rashid Fear #2.
2. **F2 Care History persistence + pre-fill** (Score 11 / 11) — UJ-4 climax (SM-15 <4 min); the structural proof that the moat compounds. Anchored to FR-7, FR-8, FR-10, FR-48. The binding surface for Bibi Want #3.
3. **F3 Curated 3–5 search shortlist** (Score 11 / 11) — Bibi Want #1 and Rashid Want #2 in one surface. Anchored to FR-11, FR-13. Never paid placement.

### Must Have for Secondary Objective 2 (top 2)
4. **F14 Operating Ceiling + Admin Load visibility** (Score 5 / 11) — Ayaat's binding constraint at the 1/25/75 ceiling. Anchored to FR-38, SM-18, A-13.
5. **F15 Admin Queue Dashboard + audit log** (Score 5 / 11) — Ayaat's daily entry point; without it, every acute-event response and dispute investigation starts from improvisation. Anchored to FR-32, FR-34, FR-35, FR-37.

### Shared Cross-Group Driver
6. **F13 Off-Platform Defection signal capture** (Score 9 / 11) — Promoted from per-persona fear to shared cross-group driver in workshop 4. Anchored to FR-36, FR-50, A-14. Closes the loop on all three personas.

(Full prioritized list in `03-Feature-Impact-Analysis.md` — 9 Primary-tier Must Have + 2 Secondary Obj 2 Operational Constraint + 4 Launch-Blocking Substrate + 3 Consider.)

---

## Design Implications (Top 5 Surfaces)

### 1. Search & First-Search Surface
- Default to a curated 3–5 shortlist ranked by Tier, Launch Neighborhood density, and Date-Level Capacity (FR-11) — never paid placement
- Show per-provider species and special-care handling history before the Owner clicks (FR-44)
- Surface verified reviews with photos from the actual stay (FR-19, FR-21)
- Filter to Launch Neighborhoods (Gulshan, Banani, Baridhara) at v1 (FR-13)

### 2. Care History & Pet Profile Surface
- Capture species, breed, age, weight, conditions, medication, dietary notes on Tito's profile (FR-6)
- Accumulate Care History across bookings — Food, Medication, Allergy, Anxiety, Special-Attention notes, confirmed-stay records (FR-7)
- Pre-fill future intakes from accumulated care-history (FR-8)
- Make the history platform-owned, not provider-owned — survives across providers (FR-10)

### 3. In-Stay & Booking Lifecycle Surface
- Move through the eight-step lifecycle with state visible to all parties (FR-1)
- Post at least one Daily Update per active booking — photo + note, structured, auditable (FR-15, FR-43)
- Run booking-scoped chat with audit available to Admin (FR-26)
- Block booking requests against exhausted Date-Level Capacity at submission, not at confirmation (FR-12)

### 4. Acute-Event & Runbook Surface
- Document the Runbook as a defined artifact — trigger conditions, role split, notification cadence, Vet-Clinic Directory usage, Payout implications, post-mortem practice (FR-14)
- Activate in under 5 minutes from trigger to first documented timeline entry — SM-20 (FR-27)
- Close every acute event with a documented post-mortem entry — SM-19 (FR-30)
- Loop Reviews and Reports back into the Runbook so the platform's response improves over time

### 5. Admin Queue & Operating-Ceiling Surface
- Sort the queue dashboard by urgency: Acute Events first, Reports-in-progress next, Bookings awaiting Provider Confirmation next, In-Stay Bookings in bulk (FR-32, FR-34)
- Surface provider-quality flags inline so Admin acts on soft signals before they become incidents (FR-35)
- Make Admin Load vs. Operating Ceiling visible in real time — FR-38 + SM-18
- Surface Off-Platform Defection soft signals in a defection-detection dashboard (FR-36, FR-50)

---

## Open Items Surfaced to Next Phase

### 1. Pre-Launch Demand Validation (Brief §7, PRD §11 A-21 Gap A)
Per workshop decision (gap analysis 00f), the actual validation pass/fail criteria for pre-launch demand validation are **deferred to handover notes** — they are not invented during UX work. Concrete items the next phase should flag if asked:
- 20–30 owner interviews OR a structured-intake waitlist landing page
- Specific signals being tested: trust/quality as primary pain, special-care willingness to pay, density in launch neighborhoods
- Decision rule for proceeding vs. re-opening the bet (architecture stage)

### 2. Numerical SM Targets (Brief §4, PRD §11 A-21 Gap B)
Targets for SM-1 through SM-20 are **deferred until after the first pilot cycle** per the Brief discipline. The Trigger Map names the metrics and their anchoring FRs; the next phase should **resist inventing target numbers** that the pilot has not yet produced.

### 3. Demonstrated-Care-Fit Ranking (Brief §10, PRD §10)
The v1 ranking is capability-and-tier baseline. Demonstrated-care-fit ranking is Phase 2 (post-v1). The next phase should design the v1 ranking honestly — without overpromising signals that won't actually surface at launch.

### 4. Multi-Admin RBAC Trigger
When SM-18 (Admin Load vs. Operating Ceiling) trends toward the 1/25/75 ceiling breach, multi-admin RBAC is the natural escalation (per A-13) — not a stretch goal. The Trigger Map flags this as Phase 3 in the Key Insights dev roadmap.

### 5. Brand-Voice Adaptation
Per step-08h quality check: Mermaid diagram uses mixed-case node titles (e.g., "Primary Objective") rather than ALL CAPS. This was accepted as deliberate brand-voice adaptation in step-08h. The next phase should mirror this voice — empowering, organic, not "convert users" — across all scenario and design artifacts.

### 6. Persona Naming Convention
Personas follow `0X-[Name]-the-[Role].md` at the B-Trigger-Map root (not in a `personas/` subdirectory). The next phase should reference them by path rather than re-extracting from prior runs.

---

## Readiness Signal

**✅ Trigger Map Phase COMPLETE.** Ready for:
- **Phase 3: Scenarios** (WDS workflow `3-scenarios/workflow.md`) — turn the Must-Address drivers into named-protagonist scenarios using Dialog / Suggest / Dream modes
- **Phase 4: UX Design / Design System** (WDS workflow `4-design-system/` and Phase 5 PRD/Development) — turn scenarios into surface design anchored to the Feature Impact sub-buckets

The persona/trigger-map outputs are inputs to Scenario and Design System stages, not parallel work — per the user's explicit direction ("continue through the remaining WDS workflow rather than jumping directly to Design System").

---

_Generated with the Whiteport Design Studio framework._
_Trigger Mapping methodology credits: Effect Mapping by Mijo Balic & Ingrid Domingues (inUse), adapted with negative driving forces._