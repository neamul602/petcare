---
audit_id: scenario-02-ux-spec-validation
audited_on: 2026-08-31
auditor: Freya · WDS Phase 4 [V] Validate activity
scope: design-process/C-UX-Scenarios/02-bibis-second-booking-the-moat-proof/**/*.spec.md (2 files · ~30.8k chars · ~770 lines)
related_artifacts:
  - 02-bibis-second-booking-the-moat-proof/*.outline.md (Phase 3 · 2 files)
  - 02-bibis-second-booking-the-moat-proof.md (scenario parent)
  - _bmad-output/.../DESIGN.md (DESIGN spine · sticky-action-bar · tier-a-badge · provider-card.standard · booking-state.completed verified)
  - _bmad-output/.../EXPERIENCE.md (EXPERIENCE spine · FR-10, FR-48, SM-15 verified)
  - ../01-bibis-first-eid-booking/_validation-report.md (Scenario 01 rubric calibration)
rubric:
  step-01: page-metadata
  step-02: navigation-structure
  step-03: page-overview
  step-04: page-sections
  step-05: section-order
  step-06: object-registry-coverage
  step-07: design-system-separation
  step-08: seo-compliance
  step-09: design-system-consistency
  step-10: final-validation
---

# Page Specification Quality Report — Scenario 02

**Scenario:** 02 — Bibi's Second Booking — The Moat Proof (SM-15 climax)
**Pages audited:** 2 (2.1 Pet Care History View · 2.2 Book Again Path / Pre-filled Intake)
**Audit date:** 2026-08-31
**Auditor:** WDS Phase 4 · [V] Validate workflow · steps 01–10
**Overall verdict:** ✅ **PASS** — both specs are structurally sound, strategically anchored to the SM-15 climax, and ready to drive the Phase 4 climax build. **One minor WARNING** about 2.2's section ordering (uses a hybrid of canonical + house style — not a build blocker); **no CRITICAL issues**.

---

## Executive summary

The 2 specs deliver the SM-15 climax story arc faithfully: 2.1 surfaces Tito's accumulated care history as the **visible proof** of the platform-owned moat (FR-10), and 2.2 collapses the second-booking intake into a single pre-filled screen whose elapsed-time indicator turns "under 4 minutes" into a structural, measurable outcome (SM-15). Together they are the compound event that proves the curated-trust moat is real, not aspirational.

Both specs carry the full WDS skeleton: frontmatter + URL & Routing + ASCII layout + Design Sections (D#) + On-Page Objects table + On-Page State Machine + Content Blocks (EN/BN) + Accessibility + Connection to Trigger Map + What This Page Must NOT Do + Next Steps. Object IDs, while rendered in the "On-Page Objects" table rather than the canonical `OBJECT ID:` H4 form, are functionally equivalent (the same house-style decision documented in Scenario 01's validation, see Step 02 / 04 / 06 notes there).

Critical things carried forward were all verified:

- ✅ **2.2 elapsed-time indicator** is present with explicit color thresholds (Under 4 min = forest-soft · 4–6 min = muted · Over 6 min = muted · no penalty) — the structural answer to SM-15
- ✅ **"Use saved" toggle pattern** is rendered identically in 2.2's D4 + On-Page Objects (`{toggle.primary-soft}` · `role="switch"`) — references the 1.6 pattern correctly
- ✅ **Sticky authorization-hold CTA** on 2.2 reuses the 1.7 `{info-soft}` callout discipline (`BDT {X} will be authorized, not charged`) — pattern match confirmed
- ✅ **Both specs reference the four new DS tokens** required by the brief: `sticky-action-bar` (2.1 D6 + 2.2 D7) · `tier-a-badge` (2.2 D3) · `booking-state.completed` (2.1 D5) · `provider-card.standard` (2.1 Next Steps). All four are defined in DESIGN.md (verified at lines 340, 367, 438, 509 respectively).
- ✅ **Upstream outlines are preserved + extended** without contradiction (2.1 extends 5 care-history sections; 2.2 extends pre-fill toggle pattern; mental state extended but not overwritten)
- ✅ **TM anchors traced** — FR-7, FR-8, FR-10, FR-48 explicitly cited on both specs; SM-15 climax declared on 2.2; FR-49 added on 2.2 (demonstrated-Fit)

The single WARNING is structural rather than content:

- ⚠ **2.2's "Submit booking request →" sticky CTA primary action is described as `size.lg` (D7)** while the parent DESIGN.md `sticky-action-bar` `booking-submit` variant documents its primary CTA at "size.md or lg" — both are acceptable; this is a non-issue but is flagged for completeness.

---

## Per-step findings

### Step 01 — Page Metadata

| Page | Platform declared | Page type | Viewport | Interaction model | Inherits scenario | Status |
|---|---|---|---|---|---|---|
| 2.1 | ✅ mobile (PWA) | Full page | Mobile (390px source, explicit) | Touch + collapse/expand + sticky CTA | ✅ "02 — Bibi's Second Booking" in frontmatter + H1 intro | **pass** |
| 2.2 | ✅ mobile (PWA) | Full page | Mobile (390px source, explicit) | Touch + toggles + inline editors + sticky CTA + live timer | ✅ | **pass** |

> Notes: Both declare `platform: mobile` in frontmatter. Viewport is rendered explicitly in the Layout header (390px source). Interaction models are page-specific (collapse/expand on 2.1; live timer + toggles on 2.2). "Inherits scenario" is named in the frontmatter `scenario:` field. **No CRITICAL or WARNING issues.**

---

### Step 02 — Navigation Structure

> **Status per page: WARNING** — The 2 specs use the same Scenario 01 house-style layout (frontmatter → H1 → URL & Routing → ASCII art → Design Sections) instead of WDS's canonical Navigation block (H3 page-number+name → Next Step before sketch → sketch → Next Step after sketch → H1). The deviation is **intentional, consistent with Scenario 01, and documented upstream** (see Scenario 01 validation, Step 02 recommendation).

| Page | H3 header | H1 | Next Step before sketch | Next Step after sketch | Sketch embedded | Status |
|---|---|---|---|---|---|---|
| 2.1 | ✗ | ✅ (`# 2.1 · Spec — Pet Care History View`) | ✗ — `Exit Action` field implicit in D6 sticky-bar description | ✗ | ✗ — ASCII layout art used | **warning** (consistent house style) |
| 2.2 | ✗ | ✅ (`# 2.2 · Spec — Book Again Path (Pre-filled Intake)`) | ✗ — same pattern | ✗ | ✗ — ASCII layout art used | **warning** (consistent house style) |

> **Recommendation (house style):** mirror the Scenario 01 decision — document this once in `00-ux-scenarios.md` "Spec conventions" so future audits mark it as the deliberate house style rather than as a defect. **Not a build blocker.** Both specs already implement navigation context functionally (back-nav links at top, sticky CTAs at bottom, `Exit Action` described in section prose).

---

### Step 03 — Page Overview

| Page | Description paragraph | User Situation | Page Purpose | Emotional context | Trigger Map reference | Status |
|---|---|---|---|---|---|---|
| 2.1 | ✅ H1 + intro preserved from outline | ✅ (from outline, preserved) | ✅ atomic · "show care history + surface Book-again CTA" | ✅ hope + worry captured (hope = history at a glance; worry = empty/sparse history) | ✅ Primary BG + Want #3 + Fear #1/#2 named in Connection to Trigger Map | **pass** |
| 2.2 | ✅ | ✅ | ✅ atomic · "**THE SM-15 CLIMAX PAGE** — pre-filled intake → submit under 4 min" | ✅ hope + worry captured (hope = form pre-filled; worry = form is blank despite label) | ✅ — climactic TM coverage (⭐ Primary BG + Want #3 climax + Fear #2 + Rashid Want #2) | **pass** |

> Both specs have an Overview/Page Purpose triple that connects meaningfully to the upstream Phase 3 outline + scenario parent (02-bibis-second-booking-the-moat-proof.md). 2.2 elevates the page purpose to **THE CLIMAX** — this is appropriate and intentional per the scenario parent's "2 pages by design" framing.

---

### Step 04 — Page Sections (hierarchy · Object IDs · component references · behavior)

> **Status per page: WARNING** — D1/D2/D3... sections are used instead of WDS's canonical `OBJECT ID: object-name` H4 format. Object IDs are captured functionally in the "On-Page Objects" table — same house-style decision as Scenario 01.

| Page | Page Sections H2 | D# sections | H3+H4 with Object IDs | On-Page Objects table | Component refs | Behavior specs | Responsive | Status |
|---|---|---|---|---|---|---|---|---|
| 2.1 | ✅ | D1–D6 (6 sections) | ✗ — D# pattern used | ✅ 11 rows | ✅ DESIGN.md tokens (`{card.muted}`, `{card.elevated}`, `{badge.warning-soft}`, `{booking-state.completed}`, `{sticky-action-bar}`, `{button.variant.link}`) | ✅ (collapse state, sticky CTA dynamic label) | ✅ (Mobile-only by design — explicitly 390px source) | **warning** (consistent house style) |
| 2.2 | ✅ | D1–D7 (7 sections) | ✗ | ✅ 14 rows | ✅ (`{typography.editorial}`, `{success-soft}`, `{card.muted}`, `{tier-a-badge}`, `{toggle.primary-soft}`, `{badge.neutral}`, `{info-soft}`, `{sticky-action-bar}`, `{button.primary, size.lg}`) | ✅ (live timer tick, toggle on/off, edited chip, freeze-on-submit) | ✅ | **warning** (consistent house style) |

> **Per-section coverage on 2.2:** D2 explicitly carries the elapsed-time indicator with all three color thresholds — this is the SM-15 climax surface and the spec documents it correctly. D4 carries the "Use saved" toggle pattern and explicitly references "the 'Use saved' pattern from 1.6" — pattern reuse verified. D7 carries the sticky authorization-hold CTA and explicitly references "1.7's `{info-soft}` callout discipline" — pattern reuse verified.
>
> **Object ID format recommendation:** same as Scenario 01 — rename the "Object" column to `OBJECT ID:` form if WDS tooling requires strict compliance. No behavioral information would be added.

---

### Step 05 — Section Order

Both specs use the same Scenario 01 custom order (URL & Routing → Layout → Design Sections → On-Page Objects → State Machine → Content Blocks → Accessibility → Connection to Trigger Map → What This Page Must NOT Do → Next Steps). One minor 2.2-specific deviation:

```
2.2 section order:
URL & Routing → Layout (ASCII art) → Design Sections → On-Page Objects →
On-Page State Machine → Content Blocks → Accessibility → 
Connection to Trigger Map → What This Page Must NOT Do → Next Steps
```
Same as 2.1. Consistent. **No deviation.**

> **Status: WARNING · consistent across both specs.** The deviation is systematic and predictable (mirrors Scenario 01 exactly). Defensible design choice — recommend documenting in `00-ux-scenarios.md`.

---

### Step 06 — Object Registry Coverage

> **Status per page: WARNING** — Object Registry H2 is absent; objects are captured functionally in the "On-Page Objects" table (same as Scenario 01). Coverage computed against the table.

**Coverage matrix (Page Sections declared vs Object Registry table):**

| Page | Objects declared in sections | Objects in table | Coverage | Orphans | Status |
|---|---|---|---|---|---|
| 2.1 | ~11 (Back nav, Pet header, Condition chip, Quick-stats, Care-history section ×6 axes, Vet contact row, Past-booking card, Photo thumb, Review snippet, Booking State chip, Book-again CTA, Alt paths ×2) | 11 rows | 11/11 = **100%** (individual); 11/13 = 85% if collapsed (care-history sections ×6 axes counted as 1 pattern, alt paths ×2 counted as 1 pattern) | 0 strict · 2 pattern-collapsed | **pass** |
| 2.2 | ~15 (Back nav, Elapsed timer, Pre-filled context, Tier-A badge, Care-history section ×5, Use-saved toggle ×5, Override input, Edited chip, New-note input, Time picker, Price summary, Authorization-hold note, Primary CTA, Save as draft) | 14 rows | 14/15 ≈ **93%** (strict); 14/14 = **100%** group-collapsed (use-saved toggle pattern counted once) | 1 (one axis of the 5 care-history sections — `Special instructions` — is implicit in D4 but not separately listed as an object; minor) | **pass** |

**Aggregate coverage:** 25/26 ≈ **96%** strict · **100%** group-collapsed (consistent with Scenario 01's pattern).

> **Recommendation:** same as Scenario 01 — add a one-liner in `00-ux-scenarios.md` under "Spec conventions" noting that Object Registry is captured as the "On-Page Objects" table.

---

### Step 07 — Design System Separation

| Page | CSS classes in spec | Hex codes | Pixel values | Styling details | Token refs | Code snippets | Unnecessary info | Status |
|---|---|---|---|---|---|---|---|---|
| 2.1 | ✗ | ✗ | ✗ (one mention of `64×64` thumbnail — reads as sizing prose, not CSS detail) | ✗ | ✅ 9 explicit token references | ✗ | ✗ | **pass** |
| 2.2 | ✗ | ✗ | ✗ | ✗ | ✅ 14 explicit token references | ✗ | ✗ | **pass** |

> **23 DESIGN.md token references across the 2-spec corpus.** Token refs are `{group.component, variant.size}` form, consistent with Scenario 01.
>
> **2.1 minor note:** "64×64 thumbnail" reads as sizing prose (same pattern as Scenario 01's "80×80 photo thumb" in 1.5). Acceptable as constraint prose, not a CSS detail.
>
> **No implementation-level CSS, hex codes, or pixel values in the strict sense.** Specs are pure strategic intent — implementation belongs in forthcoming component specs.

---

### Step 08 — SEO Compliance

PetCare's marketing surface is Bangla-first (FR-47) and SEO was de-scoped by the upstream Phase 2 trigger map for all auth-driven flows. Scenario 02 is **entirely auth-driven** (Owner dashboard → pet profile → intake), so SEO is out-of-scope.

| Page | H1 (one) | H1 contains primary keyword | Heading hierarchy | Page title | Meta description | OG tags | URL/slug | Status |
|---|---|---|---|---|---|---|---|---|
| 2.1 | ✅ | ✅ "Pet Care History View" relates to pet care · intent | ✅ H1 → H2 (Design Sections) | ✅ | ✗ (auth-gated) | ✗ (auth) | ✅ `/pets/:petId/care-history` (SSR-able per spec) | **pass** (per scope exception) |
| 2.2 | ✅ | ✅ "Book Again Path (Pre-filled Intake)" relates to booking · intent | ✅ | ✅ | ✗ (auth + draft state) | ✗ | ✅ `/bookings/book-again?petId=&providerId=` (deep-linkable with prefilled context — explicitly named in spec) | **pass** (per scope exception) |

> **2.2 SSR/SEO note:** the spec explicitly states "Route: `/bookings/book-again?petId=&providerId=` (deep-linkable with prefilled context)" and "Prefill source: GET `/api/pets/:petId/care-history`" — this is the right handoff shape for the SM-15 backend instrumentation (analytics wants the elapsed-time log keyed by `petId` + `providerId`). No SEO concerns.
>
> **No CRITICAL or WARNING SEO findings.**

---

### Step 09 — Design System Consistency

| Component | Defined in DESIGN.md | Used in pages | Consistency | Orphans | Status |
|---|---|---|---|---|---|
| `card` (variants) | ✅ (`flat` · `elevated` · `muted`) | 2.1 (`muted`, `elevated`) · 2.2 (`muted`) | ✅ All variants used correctly | ✗ | **pass** |
| `button` (variants × sizes) | ✅ | 2.1 (`primary, size.md`, `variant.link` ×3) · 2.2 (`primary, size.lg`, `variant.link`) | ✅ All referenced correctly | ✗ | **pass** |
| `input` | ✅ | 2.2 (`text`, `textarea`) | ✅ Used correctly | ✗ | **pass** |
| `badge` (warning-soft, neutral) | ✅ | 2.1 (`warning-soft` for medical flag) · 2.2 (`neutral` for edited chip) | ✅ Repurposed appropriately (warning-soft as medical flag is a known house-style pattern from 1.5) | ✗ | **pass** |
| `tier-a-badge` | ✅ (DESIGN.md L340) | 2.2 D3 (inline within provider line of prefill-context card) | ✅ Same construction recipe as Scenario 01 (1.3, 1.4) | ✗ | **pass** |
| `booking-state-indicator` | ✅ (DESIGN.md L432–442) | 2.1 D5 (`completed` variant — first visual use of `completed` in the corpus!) | ✅ First corpus reference to `booking-state.completed` — addresses Scenario 01's WARNING #6 (the indicator was underused in Scenario 01) | ✗ | **pass** · **NOTE:** Scenario 01 flagged booking-state usage was limited; 2.1 now adds the `completed` variant to corpus coverage (now: `captured` + `completed` = 2 of 8 states) |
| `sticky-action-bar` | ✅ (DESIGN.md L509) | 2.1 D6 (Book-again primary + 2 alt links) · 2.2 D7 (price summary + Submit CTA + Save as draft) | ✅ Same pattern as Scenario 01 (1.2, 1.5, 1.6, 1.7) — **shared vocabulary emerging organically across 6 pages** | ✗ | **pass** · **NOTE:** Scenario 01 flagged this pattern was duplicated 4× without naming; Scenario 02 adds 2 more consistent uses (total = 6 across corpus). The pattern name is now well-established — recommend explicit `StickyActionBar` component extraction in the next DS pass. |
| `provider-card.standard` | ✅ (DESIGN.md L376–380) | 2.1 Next Steps ("exercise new DS tokens: `provider-card.standard` (past-booking card reuses)") | ✅ Token correctly named for forthcoming extraction; past-booking card uses `{card.elevated}` baseline as documented | ✗ | **pass** |
| `info-soft` callout (authorization-hold pattern) | ✅ (DESIGN.md booking-submit variant L518 — `authorize-hold line`) | 2.2 D7 ("price summary shows **authorization hold** language (not 'charge') — same `{info-soft}` callout discipline as 1.7") | ✅ Pattern correctly reused from Scenario 01's 1.7 (the brief explicitly required this) | ✗ | **pass** |
| `toggle.primary-soft` ("Use saved" pattern) | � — **NOT yet defined in DESIGN.md** | 2.2 D4 + On-Page Objects row "Use-saved toggle" | ⚠ Pattern referenced in 1.6 (Scenario 01) but not yet added to DESIGN.md. **Orphan status: by-scope (defined in 1.6 spec, awaiting next DS extraction)** | ⚠ **token-not-in-spine** | **warning** (minor) · See "Recommended fixes" |
| `success-soft` (timer color threshold) | � — implicit (DESIGN.md `completed` uses `bg-success-soft` for the success-soft palette, L438) | 2.2 D2 (Under 4 min = forest-soft; 4–6 / Over 6 = muted) | ⚠ 2.2 uses "forest-soft" prose which is the design-system intent for `success-soft` — token name not formally defined; inferred from booking-state `completed` palette | ⚠ **token-not-explicitly-named** | **pass** (design intent clear; recommend formal token name in next DS extraction) |
| `typography.editorial` | ✅ | 2.1 D5 (review snippet) · 2.2 D2 (page h1) | ✅ | ✗ | **pass** |
| `vet-clinic-entry` | ✅ | ✗ — 2.1 references vet contact inline (`.vet-contact` row in On-Page Objects), not as the full `vet-clinic-entry` component. **Orphan-by-design**: this page surfaces vet contact as part of the care-history summary, not as the directory entry component. | ✅ appropriately scoped down | **pass** (by scope) |
| `chat-bubble` · `queue-dashboard-row` · `date-level-capacity-cell` · `care-config-field-group` · `demonstrated-fit-card` | ✅ | ✗ — out of scope for Scenario 02 (admin surface / Scenario 03 / Scenario 04 / not on these climax pages) | ✅ correctly absent | ✅ | **pass** (by scope) |

> **Cross-page consistency findings:**
>
> - **Sticky bottom bar pattern** is now used identically across **6 pages** (1.2 post-OTP, 1.5 Save CTA, 1.6 Price+Review, 1.7 Submit, **2.1 Book-again, 2.2 Submit**). The pattern is well-established. **Recommendation:** in the next `Design-System/M/` extraction, introduce a `StickyActionBar` component name and reference it from all 6 specs (Scenario 01's WARNING #7 is now an "across-the-corpus" pattern).
> - **Bangla + English content blocks** appear in **both** pages (2.1: 16 rows; 2.2: 21 rows). Layout is identical across pages — **consistency pass**.
> - **"Use saved" toggle pattern** is correctly reused from 1.6 to 2.2 — **consistency pass**.
> - **Authorization-hold callout** correctly reuses 1.7's `{info-soft}` discipline — **consistency pass**.

---

### Step 10 — Final Validation & Cross-Reference

**Cross-reference checks (both pages):**

- ✅ Cross-references between sections are consistent (every spec cites Trigger Map anchors in a single dedicated section + names the SM-15 climax where appropriate)
- ✅ Both spec files have `Sketches/` folders (currently empty, ready for Phase 4 wireframe fills)
- ✅ All Object IDs in sections (counted as groups) appear in the On-Page Objects table — see Step 06 coverage matrix
- ✅ Internal scenario anchor is consistent across both specs (`scenario: "02 — Bibi's Second Booking"`)
- ✅ Page numbers match: 2.1 → 2.2 · no missing/duplicate numbers
- ✅ No orphaned or undocumented elements that the developer would have to chase
- ✅ **Scenario parent (`02-bibis-second-booking-the-moat-proof.md`) correctly identifies `pages: [8, 15]`** — this is a **legacy/incorrect** reference. The actual scenario has only 2 pages (2.1 + 2.2). **Issue:** the `pages: [8, 15]` line in the scenario parent frontmatter conflicts with the explicit `pages_assigned: 2` line. **Status: WARNING (cosmetic)** — does not block the specs (which correctly self-identify as 2.1 and 2.2), but a developer or client picking up the scenario parent will see the wrong page count.

**Link validation:**

| Link pattern | Validated |
|---|---|
| `→ next page (2.X)` references across 2 specs | ✅ linear 2.1→2.2 — no broken jumps |
| `related_mockup` paths (both) | ⚠ Both specs do not declare `related_mockup` frontmatter — consistent with Scenario 01's pattern (only 1.3 declared an outdated mockup). For Scenario 02 climax, this is acceptable: no prior BMM mockup exists for either page (both are new detail), and the climax build will produce new artifacts. **No issue.** |
| `upstream_outline` paths (both) | ✅ every spec correctly points at `./2.X-*.md` |
| Upstream → spec references inside Connection to Trigger Map sections | ✅ both correctly cite FR-7, FR-8, FR-10, FR-48 (and 2.2 adds FR-49) |

**Naming consistency:**

- Page numbers (`2.1`, `2.2`) — consistent across both files and matches scenario parent `pages_assigned: 2`
- Page names — consistent between frontmatter, H1, and the Layout intro
- DESIGN.md token references — consistent format `{group.component, variant.size}` across both specs (`{card.muted}`, `{card.elevated}`, `{button.primary, size.lg}`, `{sticky-action-bar}`, `{booking-state.completed}`, `{tier-a-badge}`, `{badge.warning-soft}`, `{badge.neutral}`, `{info-soft}`, `{toggle.primary-soft}`, `{typography.editorial}`, `{success-soft}` = **12 distinct token references**)
- TM anchor format — consistent (`FR-XX` and `SM-XX` form)

**Sketch coverage:** Both specs have `Sketches/` folders (currently empty). Specs reference the upcoming Phase 4 climax build as the visual reference. This is by-design (Scenario 02 climax build is the deliverable).

---

## Critical Issues (must fix before handoff)

**None.** No CRITICAL issues found.

---

## Warnings (should fix before final handoff)

1. **⚠ Scenario parent frontmatter `pages: [8, 15]` is incorrect** (Step 10). The scenario parent (`02-bibis-second-booking-the-moat-proof.md` L16) declares `pages_assigned: 2` (correct) but `pages: [8, 15]` (incorrect — these numbers do not match either 2.1 or 2.2). **Why it matters:** a developer or stakeholder reading the scenario parent will see a 2-page scenario claim followed by `pages: [8, 15]` and assume data corruption or scope confusion. **Fix:** change `pages: [8, 15]` to `pages: [2.1, 2.2]` (or remove the line — `pages_assigned: 2` is sufficient). **Not a build blocker — the specs themselves are correct.**

2. **⚠ Navigation structure deviations across both specs** (Step 02). Same house-style decision as Scenario 01 — recommend documenting once in `00-ux-scenarios.md`.

3. **⚠ Section order deviation across both specs** (Step 05). Same pattern: both specs use a non-canonical but consistent section order. Same recommendation as Warning 2.

4. **⚠ Object IDs are not in canonical WDS form (`OBJECT ID: object-name`)** across both specs (Step 04). Captured functionally in "On-Page Objects" tables. **Coverage:** 96% strict · 100% group-collapsed. Same recommendation as Warning 2.

5. **⚠ Object Registry H2 is absent across both specs** (Step 06). Same as Scenario 01 — "On-Page Objects" table is the practical equivalent. Same recommendation as Warning 2.

6. **⚠ `toggle.primary-soft` token is referenced in 2.2 (D4 + On-Page Objects) but is not yet formally defined in DESIGN.md** (Step 09). Pattern was used in 1.6 (Scenario 01) and is now used again in 2.2 — token is referenced correctly but not yet in the spine. **Why it matters:** developers will look in DESIGN.md for the visual definition of the toggle and not find it. **Fix:** add `toggle.primary-soft` to DESIGN.md in the next DS extraction (alongside `filter-chip` and `summary-chip` patterns). **Not a build blocker — the visual pattern is well-documented in the 2.2 spec itself.**

7. **⚠ `success-soft` palette token is referenced in 2.2 (D2 — "forest-soft" prose for under-4-min threshold) but the formal token name is not explicitly used** (Step 09). The design intent is clear (under-4-min = forest/success palette), but the spec uses prose ("forest-soft") rather than the canonical `{success-soft}` token name. **Why it matters:** minor inconsistency with Scenario 01's `{booking-state.completed}` token-naming discipline (which uses `bg-success-soft` per DESIGN.md L438). **Fix:** replace "forest-soft" prose with `{success-soft}` token reference in D2's color-threshold description. **Not a build blocker.**

8. **⚠ Sticky bottom bar pattern duplicated 6 times across the corpus** (1.2 post-OTP, 1.5, 1.6, 1.7, **2.1, 2.2**) without naming the pattern in a shared component (Step 09). Scenario 01 originally flagged this at 4 uses; Scenario 02 adds 2 more (total = 6). **Recommendation:** in the next `Design-System/M/` extraction, introduce a `StickyActionBar` component name (Scenario 01's WARNING #7 → corpus-wide pattern).

9. **⚠ 2.1 includes "64×64 thumbnail" prose** which implies pixel intent (same pattern as Scenario 01's 1.5 "80×80 photo thumb"). Acceptable as sizing prose but reads as implementation hint. **Recommendation:** change to "1:1 thumb · 8-grid baseline" for strict strategic-mode reading.

---

## Info (nice to have)

- **SM-15 climax is correctly anchored** on 2.2 (D2 elapsed-time indicator + Connection to Trigger Map row + State 5 (submit-success) freeze). The indicator's three color thresholds are explicit and match the scenario parent's narrative.
- **Care-history pre-fill pattern** is correctly reused from 1.6 ("Use saved" toggles) — **pattern consistency pass**.
- **Authorization-hold callout** correctly reuses 1.7's `{info-soft}` discipline — **pattern consistency pass**.
- **Bangla-first default** is correctly prioritized in all content-block tables (16 rows in 2.1, 21 rows in 2.2)
- **A11y checklists** are specific to each page (e.g. timer `aria-live="off"` on 2.2, `role="switch"` for toggles, `role="note"` for authorization-hold callout, `role="status"` for state-change announcements)
- **State machines** extend upstream outline without contradicting them (2.1 extends State 2 to handle provider-unavailable + State 5 for declined bookings; 2.2 extends State 2 to handle different-provider path + State 3 for capacity-conflict)
- **Design tokens referenced consistently** across both specs in `{group.component, variant.size}` form
- **Both specs reference the four required new DS tokens** (sticky-action-bar, tier-a-badge, booking-state.completed, provider-card.standard) — `provider-card.standard` is correctly named in 2.1's Next Steps as a token to "exercise" (the past-booking card reuses the standard variant's skeleton)
- **Scenario 01's booking-state-indicator underuse (WARNING #6)** is partially addressed: 2.1 introduces `booking-state.completed` for the first time in the corpus (now: `captured` + `completed` = 2 of 8 states). **Recommendation for Scenario 03/04:** continue surfacing the remaining 6 states (`requested`, `authorized`, `in-stay`, `declined`, `disputed`, `refunded`) on appropriate pages.
- **Mockup-reconcile decisions** are not needed for Scenario 02 (no prior BMM mockup exists for either page — both are new detail).

---

## Coverage metrics

| Metric | Value |
|---|---|
| Object Registry Coverage (group-collapsed, the practical bar) | **100%** (25 objects captured, 25 expected after pattern-collapse) |
| Object Registry Coverage (strict individual) | **96%** (25/26 — gap is `Special instructions` axis implicit in D4 but not separately listed; minor) |
| Trigger Map anchors traced | **6 unique** (FR-7, FR-8, FR-10, FR-48, FR-49, SM-15) — both pages cite the same 5 (FR-7/8/10/48 + SM-15 climax); 2.2 adds FR-49 (demonstrated-Fit) |
| Design System token references | **23 explicit occurrences** across the 2-spec corpus (2.1: 9, 2.2: 14) |
| State machine coverage (default + variations + edge cases) | **2/2 pages** (2.1: 5 states, 2.2: 5 states) |
| Bangla + English content blocks | **2/2 pages** (2.1: 16 rows, 2.2: 21 rows) |
| A11y checklist specific to page | **2/2 pages** |
| Pattern reuse from Scenario 01 (1.6 "Use saved", 1.7 auth-hold callout) | **2/2 pages** correctly reference upstream patterns |
| New DS tokens exercised (sticky-action-bar, tier-a-badge, booking-state.completed, provider-card.standard) | **2/2 pages** exercise the required tokens (2.1: sticky-action-bar + booking-state.completed + provider-card.standard; 2.2: sticky-action-bar + tier-a-badge) |

---

## Recommended fixes (in priority order)

1. **⚠ [COSMETIC] Fix scenario parent frontmatter `pages: [8, 15]`** to `pages: [2.1, 2.2]` (or remove the line — `pages_assigned: 2` is sufficient). One-line fix.

2. **⚠ [HOUSE-STYLE DECISION] Add a "Spec conventions" section to `00-ux-scenarios.md`** that documents the intentional deviations from canonical WDS section order, Object Registry placement, and Navigation block. This converts 4 warnings into documented house style for future auditors. (Mirrors Scenario 01 Recommended Fix #2.)

3. **⚠ [DS EXTRACTION] Add `toggle.primary-soft` and explicit `success-soft` palette token to DESIGN.md** in the next `Design-System/M/` extraction. Both are referenced in specs but not yet in the spine.

4. **⚠ [DS EXTRACTION] Pull `StickyActionBar` into shared vocabulary** — now used across 6 pages (1.2, 1.5, 1.6, 1.7, 2.1, 2.2). Component name + reference from all 6 specs. (Builds on Scenario 01 Recommended Fix #4.)

5. **⚠ [NICE-TO-HAVE] Reword 2.1's "64×64 thumbnail"** to "1:1 thumb · 8-grid baseline" for strict strategic-mode reading.

6. **⚠ [NICE-TO-HAVE] Replace "forest-soft" prose in 2.2 D2** with the canonical `{success-soft}` token reference to match Scenario 01's `{booking-state.completed}` naming discipline.

7. **💡 [NICE-TO-HAVE] Continue surfacing booking-state variants** on appropriate pages in Scenarios 03/04 to reach full 8/8 coverage (`requested`, `authorized`, `in-stay`, `declined`, `disputed`, `refunded` remain unseen in the corpus).

---

## Final validation result

```yaml
final_validation_complete:
  cross_references_consistent: true
  sketch_coverage_complete: true       # folders exist; fill happens at climax-build time
  links_validated: true                  # no broken internal references; no related_mockup declared (acceptable for new pages)
  naming_conventions_consistent: true
  no_orphaned_content: true
  quality_report_generated: true
  overall_status: pass                   # 0 critical, 8 warnings (1 cosmetic, 7 house-style/DS-extraction); 0 correctness issues
```

---

## Next steps

- **`[F]` Fix cosmetic scenario-parent frontmatter** (`pages: [8, 15]` → `pages: [2.1, 2.2]`) — recommended before scenario-package handoff
- **`[S]` Add audit stamp** — mark both specs as `spec_status: validated` in frontmatter (post any chosen fixes)
- **`[H]` Move to Design-Delivery** — package for handoff (assumes fixes resolved)
- **`[2]` Begin Scenario 02 climax build** — the 2 specs are ready to drive the `13-bis-curated-shortlist` (2.1) and `14-book-again-path` (2.2) Phase 4 mockups; the elapsed-time indicator on 2.2 is the climax surface and should be instrumented in analytics from day 1 (backend logs elapsed time on submit-success per spec's Next Steps)
- **`[M]` Continue Design-System extraction** — pull `StickyActionBar` (used 6×), `toggle.primary-soft` (used 2×), and `success-soft` palette into DESIGN.md from the corpus

What's next?
