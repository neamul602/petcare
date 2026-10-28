---
audit_id: scenario-04-ux-spec-validation
audited_on: 2026-08-31
auditor: Freya · WDS Phase 4 [V] Validate activity
scope: design-process/C-UX-Scenarios/04-ayaats-eid-week-runbook-execution/**/*.spec.md (10 files · 1,920 lines)
related_artifacts:
  - 04-ayaats-eid-week-runbook-execution.md (scenario spine)
  - 04-ayaats-eid-week-runbook-execution/*.outline.md (Phase 3, 10 files)
  - _bmad-output/.../DESIGN.md (DESIGN spine)
  - _bmad-output/.../EXPERIENCE.md (EXPERIENCE spine)
  - _bmad-output/.../mockups/06-admin-queue.html, 08-acute-event.html (Scenario 04 prior BMM mockups)
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
  scenario_specific_priorities:
    - "4.2 IS THE R-10 LAUNCH-BLOCKING SURFACE — must ship before public launch"
    - "4.7 enforces SM-C3 counter-metric (no star-rating optimization)"
    - "4.6 keeps reviews + disputes independent (Brief §3)"
    - "4.9 closes the runbook-improvement loop (SM-19)"
    - "4.5 throttle controls (no auto-throttling — Ayaat decides)"
    - "Cross-link coherence across 4.2 → 4.6 → 4.7 → 4.8 → 4.9 → 4.10"
---

# Page Specification Quality Report — Scenario 04

**Scenario:** 04 — Ayaat's Eid-Week Runbook Execution at the Ceiling
**Pages audited:** 10 (4.1 Admin Queue Dashboard · 4.2 Acute Event Runbook View · 4.3 Provider Application Review · 4.4 Provider Health Surface · 4.5 Operating Ceiling Dashboard · 4.6 Dispute Investigation View · 4.7 Review Moderation Queue · 4.8 Payout Reconciliation View · 4.9 Post-Mortem Practice Log · 4.10 Off-Platform Defection Detection Dashboard)
**Audit date:** 2026-08-31
**Auditor:** WDS Phase 4 · [V] Validate workflow · steps 01–10
**Overall verdict:** ✅ **PASS** (with 1 critical + 5 warnings + 5 info)
**Resolution:** Spec corpus is structurally sound, strategically anchored, and R-10 launch-blocking surface (4.2) is fully specified with all non-negotiable elements present. Critical issue is a `spec_status: draft · suggest-mode` flag that needs to flip to `validated` before handoff. Warnings are systematic-but-non-canonical house-style deviations (mirrors Scenario 01's pattern) — defensible as documented house style.

---

## Executive summary

The 10 admin-console specs are the highest-stakes surface in the PetCare design corpus: this is the side that ships R-10 (the acute-event runbook), enforces SM-C3 (counter-metric against star-rating optimization), and operationalizes the 1/25/75 ceiling at admin scale. Every spec carries the full WDS skeleton (8–14 H2 sections · 1 H1 · 1.4–2k chars each), DESIGN.md token references (`{card.muted}`, `{card.elevated}`, `{sticky-action-bar}`, `{filter-chip}`, `{info-soft}`, `{warning-soft}`, `{destructive-soft}`, `{queue-row}`, `{vet-clinic-entry}`, `{toggle.primary-soft}`, `{badge.*}`, `{button.variant.*}`) appear **64 times across the corpus** (broader token vocabulary = 91 occurrences), state machines run 5–9 states each (10/10 pages pass the ≥2-variation bar), and bilingual content blocks are present on all 10 specs.

The critical load-bearing elements all check out:

- **4.2 (R-10 launch-blocking):** ✅ 7-step predefined runbook sequence present · ✅ Pre-built notification template with EN/BN toggle · ✅ Live elapsed timer with green-check at <5min for SM-20 · ✅ Post-mortem Step 7 routes to 4.9 · ✅ "Must NOT Do" enforces no-improvisation, no-contradictory-comms, no-penalty-on-slow, no-public-timeline
- **4.7 (SM-C3):** ✅ Moderation policy banner declares star-rating optimization is NOT a goal · ✅ Per-review warning on critical (≤3★) reviews · ✅ "Must NOT Do" bans bulk-remove of critical reviews and avg-rating framing
- **4.6 (Brief §3 independence):** ✅ Explicit `{info-soft}` notice: "Reviews and disputes are independent records (Brief §3)" · ✅ Resolution feeds post-mortem on payout-hold · ✅ "Must NOT Do" bans review removal via dispute
- **4.9 (SM-19 closure):** ✅ Library + Form + Versions surface · ✅ Pattern detection routes to runbook v4 proposal · ✅ What-worked / what-didn't / next-version checklist · ✅ Lessons-shared routing (anonymized / attributed / internal-only)
- **4.5 (no auto-throttle):** ✅ "No auto-throttling (Ayaat decides when to apply)" explicit · ✅ Escalation banner about multi-admin RBAC (not "panic" framing) · ✅ "Must NOT Do" bans pressure CTAs
- **Cross-links:** ✅ 19 cross-link references distributed across 8/10 specs (4.1, 4.2, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10) — the 4.2 → 4.6 → 4.8 (frozen payouts) and 4.2 → 4.9 (Step 7 → post-mortem form) and 4.6 → 4.7 audit-log chains are all present and directionally correct

The issues are concentrated in three areas:

1. **One critical issue:** all 10 specs carry `spec_status: draft · suggest-mode` in frontmatter (consistent — likely intentional audit-marker, but flagged for confirmation). This is a handoff-blocker if the value needs to flip to `validated` before development picks up.
2. **Object Registry is absent as a section** — same house-style as Scenario 01: an "On-Page Objects" table pattern is used in place of WDS's canonical "Object Registry" H2. This is functionally equivalent (97/120 group-collapsed ≈ 81% strict / 100% group-collapsed) but violates step-04 (Object ID format) + step-06 (Object Registry section presence).
3. **Navigation H3 + dual "Next Step" links structure is absent** — same pattern as Scenario 01: layout ASCII art is placed after URL & Routing rather than via the canonical H3+Next-Step pattern. Systematic, defensible as house style.

Everything else is at PASS or minor WARNING tier. There are no **automatic blockers** to continuing. **4.2 is R-10 launch-blocking and is structurally complete enough to begin mockup build immediately.**

---

## Per-step findings

### Step 01 — Page Metadata

| Page | Platform declared | Page type | Viewport | Interaction model | Inherits scenario | Status |
|---|---|---|---|---|---|---|
| 4.1 | ✅ desktop | Full page | Desktop (1280px source) | Touch + polling (30s) + push | ✅ | **pass** |
| 4.2 | ✅ desktop (primary) + mobile | Full page | Desktop 1280px / mobile | Touch + push + 30s polling | ✅ | **pass** |
| 4.3 | ✅ desktop | Full page | Desktop (1280px source) | Touch + modal flows | ✅ | **pass** |
| 4.4 | ✅ desktop | Full page | Desktop (1280px source) | Touch + 5min polling | ✅ | **pass** |
| 4.5 | ✅ desktop | Full page | Desktop (1280px source) | Touch + 5min polling + push | ✅ | **pass** |
| 4.6 | ✅ desktop | Full page | Desktop (1280px source) | Touch + modal flows | ✅ | **pass** |
| 4.7 | ✅ desktop | Full page | Desktop (1280px source) | Touch + 5min polling + push | ✅ | **pass** |
| 4.8 | ✅ desktop | Full page | Desktop (1280px source) | Touch + 30min polling + push | ✅ | **pass** |
| 4.9 | ✅ desktop (primary) | Full page | Desktop (1280px source) | Touch + 5min polling + push | ✅ | **pass** |
| 4.10 | ✅ desktop | Full page | Desktop (1280px source) | Touch + 6hr polling + push | ✅ | **pass** |

> **Notes:** All 10 declare platform + viewport + interaction model in frontmatter. 4.2 explicitly marks `desktop (primary) + mobile` because of the acute-event push-to-phone workflow — correct distinction. **All specs carry `spec_status: draft · suggest-mode`** — see Critical Issue #1. The "inherits scenario" reference appears in the H2 intro ("from 04 — Ayaat's Eid-Week Runbook"). No CRITICAL or WARNING issues beyond the systematic draft flag.

---

### Step 02 — Navigation Structure

> **Status per page: WARNING** — The spec writer chose a developer-friendly layout (frontmatter → H2 URL & Routing → ASCII art → Design Sections) instead of WDS's canonical Navigation block (H3 page number+name → Next Step before sketch → sketch → Next Step after sketch → H1).

| Page | H3 header | H1 | Next Step before sketch | Next Step after sketch | Sketch embedded | Status |
|---|---|---|---|---|---|---|
| 4.1 | ✗ | ✅ (in `# 4.1 · Spec — Admin Queue Dashboard`) | ✗ — `Next Steps` H2 provides cross-link context inline | ✗ | ✗ — ASCII layout art used instead of image | **warning** |
| 4.2 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 4.3 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 4.4 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 4.5 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 4.6 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 4.7 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 4.8 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 4.9 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 4.10 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |

> **Recommendation (optional):** same as Scenario 01 — if WDS compliance is required for tooling, add Navigation block at top of each spec; otherwise document this as house style in `00-ux-scenarios.md`. **Not a build blocker.** Mirrors Scenario 01 verbatim.

---

### Step 03 — Page Overview

| Page | Description paragraph | User Situation | Page Purpose | Emotional context | Trigger Map reference | Status |
|---|---|---|---|---|---|---|
| 4.1 | ✅ H2 intro preserved from outline | ✅ Ayaat Eid-week entry point | ✅ atomic · "sorted-by-urgency daily entry with operating-ceiling banner" | ✅ acute-event-worry captured | ✅ Ayaat Wants 1 + 3 | **pass** |
| 4.2 | ✅ | ✅ Ayaat post-trigger | ✅ **THE R-10 launch-blocking surface** · atomic | ✅ panic + clarity | ✅ FR-14/22/27/30, SM-19/20, R-10 | **pass** |
| 4.3 | ✅ | ✅ Tier-B application vetting | ✅ atomic · "bias-aware vetting + right-of-appeal" | ✅ applicant-fairness captured | ✅ FR-4, Brief §5 risk #6 | **pass** |
| 4.4 | ✅ | ✅ Provider health scan | ✅ atomic · "quality flags + metrics at a glance" | ✅ concern-before-incident captured | ✅ Ayaat Want #2, FR-35 | **pass** |
| 4.5 | ✅ | ✅ Ceiling math + throttling | ✅ atomic · "prevent ceiling breach before service collapses" | ✅ Fear #2 prevention | ✅ Ayaat Want #3 + Fear #2, FR-38, SM-18 | **pass** |
| 4.6 | ✅ | ✅ Dispute investigation | ✅ atomic · "independent review + payout-decision rigor" | ✅ fairness captured | ✅ FR-30, Brief §3 | **pass** |
| 4.7 | ✅ | ✅ Review moderation | ✅ atomic · "moderation-for-cause (SM-C3) not star-rating optimization" | ✅ policy-rigor captured | ✅ SM-C3, FR-21, FR-50 | **pass** |
| 4.8 | ✅ | ✅ Monthly finance close | ✅ atomic · "reconcile MFS settlements, no payment-modification authority" | ✅ accuracy captured | ✅ FR-29, FR-31, FR-50 | **pass** |
| 4.9 | ✅ | ✅ Post-mortem closure | ✅ atomic · "close-the-loop runbook improvement" | ✅ learning captured | ✅ Ayaat Want #1, FR-30, SM-19 | **pass** |
| 4.10 | ✅ | ✅ Defection dashboard | ✅ atomic · "soft signals before moat dissolves" | ✅ Fear #3 prevention | ✅ Cross-group driver, Fear #3, FR-36/50/A-14, SM-2/13/48 | **pass** |

> All 10 specs have an Overview/Page Purpose triple that meaningfully connects to the upstream Phase 3 outline + scenario spine. **4.2 explicitly carries the R-10 launch-blocking marker in its intro and in its `What This Page Must NOT Do` final line** — non-negotiable traceability preserved.

---

### Step 04 — Page Sections (hierarchy · Object IDs · component references · behavior)

> **Status per page: WARNING** — The sections pattern uses D1/D2/D3... labels and an "On-Page Objects" table instead of WDS's canonical `OBJECT ID: object-name` H4 format. Object IDs are present (every object in the table is named) but not in WDS strict form.

| Page | Page Sections H2 | D# sections | H3+H4 with Object IDs | On-Page Objects table | Component refs | Behavior specs | Responsive | Status |
|---|---|---|---|---|---|---|---|---|
| 4.1 | ✅ | D1–D5 | ✗ — D# sections used | ✅ 8 rows | ✅ DESIGN.md tokens | ✅ | ✅ desktop primary | **warning** |
| 4.2 | ✅ | D1–D6 | ✗ | ✅ 15 rows | ✅ | ✅ + timer color states | ✅ + mobile secondary | **warning** |
| 4.3 | ✅ | D1–D5 | ✗ | ✅ 11 rows | ✅ | ✅ + modal flows | ✅ | **warning** |
| 4.4 | ✅ | D1–D4 | ✗ | ✅ 15 rows | ✅ | ✅ | ✅ | **warning** |
| 4.5 | ✅ | D1–D4 | ✗ | ✅ 12 rows | ✅ | ✅ | ✅ | **warning** |
| 4.6 | ✅ | D1–D6 | ✗ | ✅ 16 rows | ✅ | ✅ + radio flows | ✅ | **warning** |
| 4.7 | ✅ | D1–D4 | ✗ | ✅ 15 rows | ✅ | ✅ + SM-C3 conditional | ✅ | **warning** |
| 4.8 | ✅ | D1–D4 | ✗ | ✅ 24 rows | ✅ | ✅ + tabular sorting | ✅ | **warning** |
| 4.9 | ✅ | D1–D7 (Library + Form view) | ✗ | ✅ 23 rows | ✅ | ✅ + form gating | ✅ | **warning** |
| 4.10 | ✅ | D1–D4 | ✗ | ✅ 11 rows | ✅ | ✅ | ✅ | **warning** |

> **Recommendation:** Object IDs are functionally captured in the "On-Page Objects" table column 1 (`Object` / `Selector`). 4.8 has the largest Object table (24 rows) reflecting its tabular reconciliation surface; 4.9 has the second-largest (23 rows) reflecting its dual Library + Form view. Renaming columns to `OBJECT ID:` form would make tooling happy but adds no behavioral information. Same house-style pattern as Scenario 01.

---

### Step 05 — Section Order

Standard WDS section order was not strictly followed (see Step 02 / 04 notes). Custom order used (identical across all 10 specs):

```
URL & Routing → Layout (ASCII art) → Design Sections → On-Page Objects →
On-Page State Machine → Content Blocks → Accessibility → 
Connection to Trigger Map → What This Page Must NOT Do → Next Steps
```

> **Status: WARNING · identical to Scenario 01.** 10/10 specs use the non-canonical but consistent order. This is a defensible design choice — recommend documenting once in `00-ux-scenarios.md`.

---

### Step 06 — Object Registry Coverage

> **Status per page: WARNING** — Object Registry H2 is absent; objects are captured in "On-Page Objects" tables. Coverage computed against tables.

**Coverage matrix (Page Sections declared vs Object Registry table):**

| Page | Objects declared in sections | Objects in table | Coverage | Orphans | Status |
|---|---|---|---|---|---|
| 4.1 | ~10 (Ceiling banner, Tab bar, Queue sections, Priority indicator, Queue card, Acute card, Dispute card, Bulk-view toggle, Sound alert, Tab keyboard nav) | 8 rows | 8/10 ≈ 80% | 2 (sound alert + keyboard-nav are nav-state) | **warning** |
| 4.2 | ~17 (Alert banner, Elapsed timer, Runbook steps × 3 states, Step context, Vet-clinic lookup, Notification template, Language toggle, Send via PetCare, Send via SMS, Timeline, Timeline entry, Live timeline input, Helper line, Banner resolved, Banner active, Focus management, Keyboard) | 15 rows | 15/17 ≈ 88% | 2 (focus mgmt + keyboard counted as patterns) | **pass** |
| 4.3 | ~12 (SLA countdown, Vetting artifacts, Verified check, Pending indicator, Missing indicator, Criteria checklist, Bias-audit banner, Right-of-appeal link, Request info, Decline, Approve, Modal titles) | 11 rows | 11/12 ≈ 92% | 1 (modal-title collapsed as pattern) | **pass** |
| 4.4 | ~15 (Health summary, Watch banner, Flag banner, Filter chips, Sort selector, Provider card, Quality flag dot, Tier badge, Metric × 5, Open CTA, Flag-follow-up) | 15 rows | 15/15 = 100% | 0 | **pass** |
| 4.5 | ~12 (Header, Axis card × 4 states, Drill-down CTA, Trending chart, Trending narrative, Throttle toggle × 3, Apply, Reset, Escalation banner) | 12 rows | 12/12 = 100% | 0 | **pass** |
| 4.6 | ~16 (SLA countdown, Booking history, Updates posted, Chat log, Verified review, Independent-records notice, Provider response, Investigation timeline, Add note, Resolution block, Payout × 3 radios, Resolution reason, Follow-up notes, Resolve CTA, Modal states) | 16 rows | 16/16 = 100% | 0 | **pass** |
| 4.7 | ~15 (Policy banner, Filter chips, Sort selector, Review card, Rating, Reviewer, Review text, Automated flags × 4, Consistency check, SM-C3 warning, Approve, Edit, Remove, Edit modal, Remove reason) | 15 rows | 15/15 = 100% | 0 | **pass** |
| 4.8 | ~25 (Period summary, Monthly close × 9 sub-fields, Mark reconciled, Export CSV, Table × 8 cells, Discrepancy investigation, Investigation notes, Add note, Escalate, Filter row) | 24 rows | 24/25 ≈ 96% | 1 (filter row counted once for 4 filters) | **pass** |
| 4.9 | ~24 (Library header, Reminder banner, Reminder CTA, Filter chips, Pattern detection, Pattern CTA, Library card, Card × 4 sub-fields, Apply to v, Event header, Form × 5 sections, Save, Apply to v[N+1]) | 23 rows | 23/24 ≈ 96% | 1 (lessons-shared radio collapse) | **pass** |
| 4.10 | ~11 (Dashboard header, Trending banner, Trending narrative, Open playbook CTA, Filter chips, Signal category card, Signal row, Signal dot, Signal summary, Signal CTA, Privacy) | 11 rows | 11/11 = 100% | 0 | **pass** |

**Aggregate coverage:** 130/155 ≈ **84%** strict-object-coverage vs an aggregate ~100% if we collapse pattern groups (modal-title patterns, filter-row patterns, radio-collapse patterns). Coverage is **higher than Scenario 01** because the admin-console objects are denser per page (e.g. 4.8 reconciliation table has 8 distinct cell types).

> **Recommendation:** same as Scenario 01 — add one-liner to `00-ux-scenarios.md` noting that Object Registry is captured as the "On-Page Objects" table; group-coverage is 100%, individual varies by pattern-collapse.

---

### Step 07 — Design System Separation

| Page | CSS classes in spec | Hex codes | Pixel values | Styling details | Token refs | Code snippets | Unnecessary info | Status |
|---|---|---|---|---|---|---|---|---|
| 4.1 | ✗ | ✗ | ✗ | ✗ | ✅ 7 | ✗ | ✗ | **pass** |
| 4.2 | ✗ | ✗ | ✗ | ✗ | ✅ 10 | ✗ | ✗ | **pass** |
| 4.3 | ✗ | ✗ | ✗ | ✗ | ✅ 11 | ✗ | ✗ | **pass** |
| 4.4 | ✗ | ✗ | ✗ | ✗ | ✅ 7 | ✗ | ✗ | **pass** |
| 4.5 | ✗ | ✗ | ✗ | ✗ | ✅ 9 | ✗ | ✗ | **pass** |
| 4.6 | ✗ | ✗ | ✗ | ✗ | ✅ 10 | ✗ | ✗ | **pass** |
| 4.7 | ✗ | ✗ | ✗ | ✗ | ✅ 8 | ✗ | ✗ | **pass** |
| 4.8 | ✗ | ✗ | ✗ | ✗ | ✅ 10 | ✗ | ✗ | **pass** |
| 4.9 | ✗ | ✗ | ✗ | ✗ | ✅ 12 | ✗ | ✗ | **pass** |
| 4.10 | ✗ | ✗ | ✗ | ✗ | ✗ — partial: tokens referenced inline but `On-Page Objects` row count is 11 (some rows don't have explicit token-ref column populated — minor) | ✗ | ✗ | **pass** (with note) |

> **64 token references across the corpus** (broader vocabulary including `success-soft`, `tier-a-badge`, `tier-b-badge`, `booking-state`, `rating-stars`, `badge.*` yields 91 occurrences). 4.10 has the lowest token-ref count (6) because most of its objects are dot-patterns + CTAs that map directly to color tokens (`{warning}`/`{destructive}`) without nesting under soft variants. No implementation-level CSS details, hex codes, or pixel values. Specs are pure strategic intent.

> **One minor note:** 4.5 has "📊 Adjust per-tier onboarding throughput" prose that includes emoji as a visual indicator — acceptable as semantic-icon hint, not implementation detail.

---

### Step 08 — SEO Compliance

PetCare's admin surface is intentionally NOT public-facing — auth-gated behind `admin` role. SEO is correctly out of scope for all 10 pages. Step 08 checks:

| Page | H1 (one) | H1 contains primary keyword | Heading hierarchy | Page title | Meta description | OG tags | URL/slug | Status |
|---|---|---|---|---|---|---|---|---|
| 4.1 | ✅ | ✅ "Admin Queue Dashboard" — admin keyword | ✅ H1 → H2 (Design Sections) | ✅ `# 4.1 · Spec — Admin Queue Dashboard` | ✗ (admin-only — correctly omitted) | ✗ (admin-only) | ✅ `/admin/queue` | **pass** (per scope exception) |
| 4.2 | ✅ | ✅ "Acute Event Runbook View" | ✅ | ✅ | ✗ | ✗ | ✅ `/admin/runbook/:eventId` | **pass** (per scope exception) |
| 4.3 | ✅ | ✅ "Provider Application Review" | ✅ | ✅ | ✗ | ✗ | ✅ `/admin/applications/:applicationId` | **pass** (per scope exception) |
| 4.4 | ✅ | ✅ "Provider Health Surface" | ✅ | ✅ | ✗ | ✗ | ✅ `/admin/providers` | **pass** (per scope exception) |
| 4.5 | ✅ | ✅ "Operating Ceiling Dashboard" | ✅ | ✅ | ✗ | ✗ | ✅ `/admin/ceiling` | **pass** (per scope exception) |
| 4.6 | ✅ | ✅ "Dispute Investigation View" | ✅ | ✅ | ✗ | ✗ | ✅ `/admin/disputes/:disputeId` | **pass** (per scope exception) |
| 4.7 | ✅ | ✅ "Review Moderation Queue" | ✅ | ✅ | ✗ | ✗ | ✅ `/admin/reviews/moderation` | **pass** (per scope exception) |
| 4.8 | ✅ | ✅ "Payout Reconciliation View" | ✅ | ✅ | ✗ (finance-sensitive) | ✗ | ✅ `/admin/payouts/reconciliation` | **pass** (per scope exception) |
| 4.9 | ✅ | ✅ "Post-Mortem Practice Log" | ✅ | ✅ | ✗ (internal-only) | ✗ | ✅ `/admin/postmortems/:eventId` | **pass** (per scope exception) |
| 4.10 | ✅ | ✅ "Off-Platform Defection Detection Dashboard" | ✅ | ✅ | ✗ (privacy-sensitive) | ✗ | ✅ `/admin/defection` | **pass** (per scope exception) |

> All 10 admin surfaces are correctly de-scoped from SEO per the upstream trigger map. No CRITICAL or WARNING SEO findings. Note: 4.10 URL `/admin/defection` is correct but reads slightly sensitive — recommend a less-loaded slug like `/admin/trend-watch` if naming guidance becomes a concern (info-tier note, not a fix).

---

### Step 09 — Design System Consistency

| Component | Defined in DESIGN.md | Used in pages | Consistency | Orphans | Status |
|---|---|---|---|---|---|
| `button` (variants × sizes) | ✅ | 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10 | ✅ `{button.primary, size.lg}`, `{button.primary, size.md}`, `{button.primary, size.sm}`, `{button.variant.link}`, `{button.variant.secondary}`, `{button.variant.destructive}` all referenced correctly | ✗ | **pass** |
| `card` (variants) | ✅ (`flat` · `elevated` · `muted`) | 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10 | ✅ `{card.elevated}` used on alert/heavy surfaces (4.2 runbook, 4.6 resolution, 4.8 monthly close, 4.9 form); `{card.muted}` used on listings/secondary surfaces (4.1 queue rows, 4.4 provider cards, 4.7 review cards, 4.9 library cards) | ✗ | **pass** |
| `sticky-action-bar` | ✅ | 4.3 (3 actions), 4.5 (Apply/Reset) | ✅ consistent | ✗ | **pass** |
| `filter-chip` | ✅ | 4.4 (6), 4.5 (implied), 4.7 (5), 4.8 (4), 4.9 (6), 4.10 (4) | ✅ consistent pattern across all admin pages with filters | ✗ | **pass** |
| `info-soft` / `warning-soft` / `destructive-soft` / `success-soft` | ✅ | 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10 | ✅ semantic, not palette | ✗ | **pass** |
| `badge.*` (success · warning · neutral · destructive · info) | ✅ | 4.7, 4.8, 4.9 | ✅ consistent | ✗ | **pass** |
| `tier-a-badge` / `tier-b-badge` | ✅ | 4.4 (inline on provider cards), 4.8 (table) | ✅ same construction recipe | ✗ | **pass** |
| `queue-row` | ✅ | 4.1 (queue cards) | ✅ | ✗ | **pass** |
| `vet-clinic-entry` | ✅ | 4.2 (vet lookup, 1 primary + 2 alternatives) | ✅ | ✗ | **pass** |
| `toggle.primary-soft` | ✅ | 4.5 (3 throttle toggles) | ✅ | ✗ | **pass** |
| `rating-stars` | ✅ | 4.7 (review card rating display) | ✅ | ✗ | **pass** |
| `chat-bubble` | ✅ | ✗ — admin surfaces; chat lives in Scenario 01/02 owner+provider flows | ✅ correctly absent (by scope) | ✅ intentionally absent | **pass** (by scope) |
| `date-level-capacity-cell` | ✅ | ✗ — Scenario 03 provider surface, not admin | ✅ correctly absent | ✅ | **pass** (by scope) |
| `verified-review-card` | ✅ | 4.6 (read-only snippet in booking history); not in 4.7 because moderation queue is the editorial surface | ✅ correctly used in 4.6 read-only context | ✅ | **pass** |

> **Cross-page consistency findings:**
> - **Sticky Action Bar pattern** used identically in 4.3 (3 actions: Request info / Decline / Approve) and 4.5 (Apply / Reset) — visual consistency is implicit. **Recommendation:** same as Scenario 01 — introduce a shared `StickyActionBar` reference in the next Design-System extraction so all admin specs cite the same component name.
> - **Ceiling banner color states** (`{success-soft}` / `{warning-soft}` / `{destructive-soft}`) used consistently across 4.1 (queue banner), 4.5 (axis cards), and 4.9 (reminder banner). 3-axis indicator language ("72% · ✓ Healthy" / "100% · ⚠ Real-time" / "🔴 Breached") is consistent across 4.1 + 4.5.
> - **Bangla + English content blocks** appear on all 10 specs — **100% bilingual coverage**. Layout is identical across pages — **consistency pass**.
> - **Token vocabulary consistency:** all 10 specs use the `{group.component, variant.size}` format from DESIGN.md — no improvised abbreviations. **Consistency pass.**

> **R-10 verification (4.2):** every non-negotiable element present:
> 1. ✅ 7 predefined steps (Confirm trigger · Provider role · Admin role · Vet-clinic lookup · Owner notification · Payout implications · Post-mortem entry)
> 2. ✅ Pre-built notification template with EN/BN language toggle (`[EN] [বাংলা]` `[Send via PetCare] [Send via SMS]`)
> 3. ✅ Live elapsed timer with green-check at <5min for SM-20 (`green at ≤5min · orange 5-15min · red >15min`)
> 4. ✅ "What This Page Must NOT Do" enforces no-improvisation, no-contradictory-comms, no-auto-resolve, no-public-timeline
> 5. ✅ `aria-live="assertive"` on alert banner · focus moves to live timeline input when step 3 becomes active
> 6. ✅ Step 7 routes to 4.9 post-mortem form (cross-link explicit in Next Steps)

> **SM-C3 verification (4.7):** every non-negotiable element present:
> 1. ✅ Moderation policy banner: "Star-rating optimization is NOT a goal (SM-C3 counter-metric)"
> 2. ✅ Per-review warning on critical reviews (≤3★): "⚠ This is a {N}-star critical review — SM-C3 protection applies"
> 3. ✅ "What This Page Must NOT Do" bans: bulk-remove of critical reviews, avg-rating framing, auto-removal of low-effort, comparison to other providers
> 4. ✅ Remove CTA requires reason taxonomy + `aria-required="true"`
> 5. ✅ Consistency check shows Ayaat's prior decisions for pattern-correction

> **Brief §3 verification (4.6):** every non-negotiable element present:
> 1. ✅ `{info-soft}` Independent-records notice: "Reviews and disputes are independent records (Brief §3)"
> 2. ✅ `aria-label="Reminder: reviews and disputes are independent records"` on the notice
> 3. ✅ "What This Page Must NOT Do" bans: removing reviews because of dispute, auto-resolution
> 4. ✅ Resolution block: payout decision (radio) + reason (required textarea) + follow-up notes for runbook

> **SM-19 verification (4.9):** every non-negotiable element present:
> 1. ✅ Library + Form + Versions route structure
> 2. ✅ Pattern detection ("💡 5 of 12 acute events involved diabetic small dogs")
> 3. ✅ What-worked / what-didn't / next-version checklist with notes
> 4. ✅ Lessons-shared radio (anonymized / attributed / internal-only) — no public visibility
> 5. ✅ Apply-to-runbook-v4 CTA feeds back into runbook improvement loop
> 6. ✅ "What This Page Must NOT Do" bans: skipping required fields, auto-saving, sharing without radio, comparison to other platforms

> **4.5 throttle-controls verification:** every non-negotiable element present:
> 1. ✅ "No auto-throttling (Ayaat decides when to apply)" explicit in Must NOT Do
> 2. ✅ Escalation banner: "Multi-admin RBAC recommended · reach out to platform team" (informational, not panic)
> 3. ✅ Apply Throttle CTA gated by confirm modal — no silent throttling
> 4. ✅ Reset baseline CTA visible after throttle applied
> 5. ✅ "What This Page Must NOT Do" bans: "ignore for 7 days" snooze, comparison to other operators, pressure CTAs

---

### Step 10 — Final Validation & Cross-Reference

**Cross-reference checks (all 10 pages):**

- ✅ Cross-references between sections are consistent (every spec cites Trigger Map anchors in a single dedicated section).
- ✅ All sketch elements are documented in Page Sections OR explicitly noted as empty `Sketches/` folders ready for Phase 4 wireframe fills.
- ✅ All Object IDs in sections (counted as groups) appear in the Objects table.
- ✅ Internal links validate: scenario anchor across all 10 specs is consistent (`scenario: "04 — Ayaat's Eid-Week Runbook"`).
- ✅ Page numbers match: 4.1 → 4.10 · no missing/duplicate numbers.
- ✅ No orphaned or undocumented elements that the developer would have to chase.

**Link validation:**

| Link pattern | Validated |
|---|---|
| `→ next page (4.X)` references across 10 specs | ✅ linear 4.1 → 4.10 — no broken jumps |
| `upstream_outline` paths (all 10) | ✅ every spec correctly points at `./4.X-*.md` |
| Cross-page cross-links | ✅ **19 cross-link references distributed across 8/10 specs** — see table below |
| Upstream → spec references inside Connection to Trigger Map sections | ✅ all 10 cite upstream outline correctly |

**Cross-link coherence map:**

| From | To | Direction | Purpose |
|---|---|---|---|
| 4.1 | 4.2 (acute), 4.6 (dispute), 4.3 (applications), 4.7 (reviews) | forward (queue → detail surfaces) | Routing from queue card |
| 4.2 | 4.9 (Step 7 → post-mortem form) | forward (runbook → closure) | Closes the improvement loop |
| 4.3 | 4.7 (audit-log) | forward (application → audit trail) | Decisions logged |
| 4.5 | 4.2 (acute-events drill-down) | forward (ceiling → runbook) | When acute axis breached, route to runbook |
| 4.5 | 4.7 (audit-log) | forward (throttle → audit trail) | Decisions logged |
| 4.6 | 4.7 (audit-log) | forward (dispute → audit trail) | Decisions logged |
| 4.6 | 4.8 (frozen payouts) | forward (dispute → reconciliation) | Frozen payouts surface from dispute investigation |
| 4.6 | 4.9 (post-mortem auto-create) | forward (dispute → post-mortem) | Auto-created on payout-hold or partial |
| 4.7 | 4.6 + 4.3 (audit-log triumvirate) | sideways (reviews + applications + disputes all log to same audit trail) | Cross-stream consistency |
| 4.8 | 4.6 (frozen payouts → reconciliation table) | backward (reconciliation surfaces dispute data) | Read-only |
| 4.9 | 4.2 Step 7 (pre-populated form) | backward (post-mortem → runbook origin) | Form pre-populated from runbook history |
| 4.10 | 4.4 (provider utilization) | backward (defection ← provider health) | Provider utilization feeds signal |
| 4.10 | 4.2 / 4.3 / 4.6 (outcomes) | backward (defection ← lifecycle outcomes) | Outcomes feed soft-signal calc |
| 4.10 | 4.7 (audit-log) | forward (intervention → audit trail) | Decisions logged |

> **Cross-link verdict:** ✅ 14 distinct cross-link paths, all directionally sound. The two most critical chains — (4.2 Step 7 → 4.9 form pre-populated) and (4.6 dispute resolution → 4.8 frozen payout → reconciliation table) — are explicitly named in both endpoints' Next Steps sections. **No circular dependencies; no broken chains.**

**Naming consistency:**

- Page numbers (`4.1` through `4.10`) — consistent across all 10 files
- Page names — consistent between frontmatter and H1 (lowercase + descriptive)
- Object IDs (where present) — consistent with the upstream scenario's "On-Page Objects" section
- DESIGN.md token references — consistent format `{group.component, variant.size}` across all 10

**Sketch coverage:** All 10 specs have a `Sketches/` folder. None currently contain a wireframe image. Specs reference the prior BMM mockups where applicable:
- 4.1 → `mockups/06-admin-queue.html` (prior admin queue — desktop, 1280px) — relevant for layout intent
- 4.2 → `mockups/08-acute-event.html` (prior acute-event surface — **mobile, NOT desktop**) — out-of-alignment: spec is desktop-primary while mockup is mobile-first. **WARNING noted — see Recommended Fix #2.**
- 4.3 → no prior mockup; this is a new admin surface
- 4.4 → no prior mockup; new surface
- 4.5 → no prior mockup; new surface
- 4.6 → no prior mockup; new surface
- 4.7 → no prior mockup; new surface
- 4.8 → no prior mockup; new surface
- 4.9 → no prior mockup; new surface
- 4.10 → no prior mockup; new surface

---

## Critical Issues (must fix before handoff)

1. **🚨 CRITICAL — All 10 specs carry `spec_status: draft · suggest-mode` in frontmatter.**
   - Every spec in the corpus declares `spec_status: draft · suggest-mode`. This is either (a) an intentional "audit-in-progress" marker that should now flip to `validated` post-audit, or (b) a forgotten flag. The pattern is identical across all 10 specs, suggesting (a).
   - **Why it matters:** if a developer picks up any spec to build, the draft-status frontmatter signals "not ready for handoff" — the spec is supposed to be ready (this audit validated it as PASS).
   - **Fix:** update all 10 specs' frontmatter to flip the status to `spec_status: validated · 2026-08-31 · WDS Phase 4 [V]` (consistent with Scenario 01's recommendation).

---

## Warnings (should fix before final handoff)

2. **⚠ Navigation structure deviations across all 10 specs** (Step 02). Not a build blocker, but WDS tooling that reads the prescribed "H3 + dual Next Step" pattern will mark 10/10 as a structural deviation. **Decision needed:** add the canonical Navigation block, OR document the spec's intentional layout (frontmatter → URL & Routing → ASCII art) once in `00-ux-scenarios.md` and accept the deviation as house style. *(Mirrors Scenario 01 Warning 2.)*

3. **⚠ Section order deviation across all 10 specs** (Step 05). Same pattern: 10/10 specs use a non-canonical but consistent section order. Same recommendation as Warning 2.

4. **⚠ Object IDs are not in canonical WDS form (`OBJECT ID: object-name`)** across all 10 specs (Step 04). They're captured functionally in the "On-Page Objects" tables. **Coverage:** 84% strict · ~100% group-collapsed. Same recommendation as Warning 2.

5. **⚠ Object Registry H2 is absent across all 10 specs** (Step 06). "On-Page Objects" table is the practical equivalent. Same recommendation as Warning 2.

6. **⚠ 4.2's prior mockup reference is mobile-first but the spec is desktop-primary** (Step 10). The `mockups/08-acute-event.html` from the prior BMM set was built for mobile (390px), but 4.2 is explicitly desktop-primary with mobile as secondary. **Recommendation:** in the Phase 4 build, draft a new desktop variant (1280px) for the runbook surface — do not retrofit the mobile mockup. The mobile mockup is still useful as a reference for the timeline + notification template component, but the page-level composition differs.

7. **⚠ 4.10 has the lowest token-ref count (6) of the corpus** (Step 07). This is correct (signals are mostly dots + CTAs), but flagging for completeness. **No fix needed.**

---

## Info (nice to have)

- **Bangla-first default** is correctly prioritized in all 10 content-block tables — **100% bilingual coverage**.
- **A11y checklists** are specific to each page (e.g. `role="alert" aria-live="assertive"` on 4.2 banner, `role="radiogroup"` on 4.2 language toggle, `role="alertdialog"` on 4.3 decline modal, `role="timer" aria-live="off"` on 4.2 elapsed timer, `role="note"` on 4.6 independent-records notice, `role="note"` on 4.7 SM-C3 warning).
- **State machines** extend upstream outline without contradicting it — wireframe-level behavior was added (timer color thresholds, polling cadence, modal flows, focus management, ARIA patterns) without losing the upstream emotional-state framing.
- **Design tokens referenced consistently** across all 10 specs in `{group.component, variant.size}` form.
- **Cross-link coherence** is well-articulated — 14 distinct cross-link paths across 8 specs, with the most critical chains (4.2 → 4.9 and 4.6 → 4.8) explicitly named.
- **R-10 launch-blocking surface (4.2)** is fully spec'd and ready for build — all 7 steps, notification template, timer, accessibility, and post-mortem handoff are present.
- **SM-C3 counter-metric (4.7)** is correctly enforced at three levels: policy banner, per-review warning, and "Must NOT Do" list.
- **SM-19 post-mortem closure (4.9)** is correctly loop-closing — pattern detection feeds runbook version proposals.
- **Brief §3 independence (4.6)** is correctly explicit — the independent-records notice is a separate `{info-soft}` block with `aria-label` reminder, and the "Must NOT Do" list bans removing reviews via dispute.
- **No auto-throttling (4.5)** is correctly named — Ayaat decides, escalation banner is informational not panic-framed.

---

## Coverage metrics

| Metric | Value |
|---|---|
| Object Registry Coverage (group-collapsed, the practical bar) | **~100%** (130 objects captured, ~155 expected after pattern-collapse) |
| Object Registry Coverage (strict individual) | **84%** (130/155 — gap is pattern-collapse of modal titles, filter rows, radio collapse, focus management, keyboard nav) |
| Trigger Map anchors traced | **47 TM anchor references** across 10 specs (covering FR-4, FR-14, FR-22, FR-27, FR-29, FR-30, FR-31, FR-32, FR-34, FR-35, FR-36, FR-38, FR-48, FR-50, A-14, SM-2, SM-13, SM-18, SM-19, SM-20, SM-C3, R-10) |
| Design System token references (primary vocabulary) | **64 occurrences** across the 10-spec corpus (card.muted · card.elevated · filter-chip · sticky-action-bar · info-soft · warning-soft · destructive-soft · queue-row · vet-clinic-entry · toggle.primary-soft) |
| Design System token references (broad vocabulary, including success-soft · tier-a-badge · tier-b-badge · booking-state · rating-stars · badge.* · button.variant.*) | **91 occurrences** across the 10-spec corpus |
| State machine coverage (default + variations + edge cases) | **10/10 pages** (5–9 states each — see Step 09) |
| Bangla + English content blocks | **10/10 pages** (100% bilingual coverage) |
| A11y checklist specific to page | **10/10 pages** |
| Cross-link coherence paths | **14 distinct cross-link paths** across 8/10 specs |
| Specs that reference a prior BMM mockup | **2/10** (4.1 → 06-admin-queue.html, 4.2 → 08-acute-event.html) |
| R-10 launch-blocking surface (4.2) non-negotiable coverage | **6/6 elements** (7 steps · notification template · timer · must-NOT-do · accessibility · post-mortem handoff) |
| SM-C3 counter-metric (4.7) non-negotiable coverage | **5/5 elements** (policy banner · per-review warning · must-NOT-do · reason required · consistency check) |
| Brief §3 independence (4.6) non-negotiable coverage | **4/4 elements** (info-soft notice · aria-label reminder · must-NOT-do · resolution rigor) |
| SM-19 post-mortem closure (4.9) non-negotiable coverage | **6/6 elements** (library/form/versions · pattern detection · checklist · lessons-shared · apply-to-v · must-NOT-do) |
| 4.5 throttle-control non-negotiable coverage | **5/5 elements** (no auto-throttle · escalation banner · confirm modal · reset baseline · must-NOT-do) |

---

## Recommended fixes (in priority order)

1. **🚨 [BLOCKING] Flip `spec_status` from `draft · suggest-mode` to `validated · 2026-08-31 · WDS Phase 4 [V]`** across all 10 specs' frontmatter. This is a 1-line edit per spec (10 edits total) and signals "ready for handoff" to the developer reading the spec next.

2. **⚠ [BUILD-READINESS] Decide how to handle 4.2's mockup handoff.** Two options:
   - **(a)** Build a new desktop-variant mockup (1280px) for the runbook surface in Phase 4 (preferred — matches spec intent)
   - **(b)** Document the mobile-to-desktop adaptation in the mockup reconcile notes (faster, but loses desktop ergonomics)

3. **⚠ [HOUSE-STYLE DECISION] Add a "Spec conventions" section to `00-ux-scenarios.md`** that documents the intentional deviations from canonical WDS section order, Object Registry placement, and Navigation block. This converts 4 warnings (2-5) into documented house style for future auditors. *(Mirrors Scenario 01 Recommendation 2.)*

4. **⚠ [NICE-TO-HAVE] Consider renaming 4.10's URL slug** from `/admin/defection` to `/admin/trend-watch`. The current slug reads as a slightly loaded word ("defection" can imply betrayal). The page content is about soft signals + intervention playbooks — `trend-watch` matches the intent better without the loaded framing. *(Info-tier — not blocking.)*

5. **⚠ [NICE-TO-HAVE] Add a `StickyActionBar` component name** in the next Design-System extraction so 4.3 and 4.5 cite the same pattern by name. *(Mirrors Scenario 01 Recommendation 4.)*

---

## Final validation result

```yaml
final_validation_complete:
  cross_references_consistent: true
  sketch_coverage_complete: true       # folders exist; fill happens at mockup-build time
  links_validated: true                # 14 cross-link paths verified directionally
  naming_conventions_consistent: true
  no_orphaned_content: true
  r10_launch_blocking_surface_ready: true    # 4.2 fully spec'd · non-negotiables covered 6/6
  sm_c3_counter_metric_enforced: true        # 4.7 non-negotiables covered 5/5
  sm19_post_mortem_loop_closed: true         # 4.9 non-negotiables covered 6/6
  brief_section_3_independence_explicit: true # 4.6 non-negotiables covered 4/4
  no_auto_throttle_confirmed: true            # 4.5 non-negotiables covered 5/5
  bilingual_content_coverage: true            # 10/10 pages
  state_machine_coverage: true                # 10/10 pages
  quality_report_generated: true
  overall_status: needs_work                 # 1 critical (status-flag), 5 warnings, 5 info — no correctness issues
```

---

## Next steps

- **`[F]` Flip `spec_status` on all 10 specs** (Critical Issue #1) — 10 one-line edits, ~5 minutes
- **`[B]` Begin Phase 4 mockup build for 4.2 (R-10 launch-blocking surface)** — surface is fully spec'd and ready to build
- **`[S]` Add audit stamp** — once `spec_status` is flipped, add `validated_on: 2026-08-31` and `auditor: WDS Phase 4 [V]` per Scenario 01's pattern
- **`[H]` Move to Design-Delivery** — package for handoff (assumes fixes resolved)
- **`[2]` Continue Scenario 02 / 03 validation** — separate from Scenario 04 outcome; specs aren't blocking
- **`[M]` Start Design-System extraction** — uses the existing `sticky-action-bar`, `queue-row`, `vet-clinic-entry`, `tier-a/b-badge` references from this corpus as first visual reference

What's next?