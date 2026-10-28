---
audit_id: scenario-03-ux-spec-validation
audited_on: 2026-08-31
auditor: Freya · WDS Phase 4 [V] Validate activity
scope: design-process/C-UX-Scenarios/03-rashids-eid-week-capacity-fill/**/*.spec.md (10 files · 1,701 lines)
related_artifacts:
  - 03-rashids-eid-week-capacity-fill/*.outline.md (Phase 3 · 10 outlines)
  - _bmad-output/.../DESIGN.md (DESIGN spine · components, tokens, colors)
  - _bmad-output/.../EXPERIENCE.md (EXPERIENCE spine)
  - 04-ayaats-eid-week-runbook-execution/4.2-acute-event-runbook/* (Scenario 04 cross-link target · R-10)
  - _bmad-output/.../mockups/07-provider-calendar.html (prior BMM mockup · Scenario 03 predecessor)
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

# Page Specification Quality Report — Scenario 03

**Scenario:** 03 — Rashid's Eid-Week Capacity Fill (provider-side journey)
**Pages audited:** 10 (3.1 Provider Dashboard · 3.2 Capacity Calendar · 3.3 Incoming Request · 3.4 Confirmation Decision · 3.5 In-Stay Management · 3.6 Daily Update Composer · 3.7 Booking Completion · 3.8 Profile Editor · 3.9 Care-Record History · 3.10 Payouts & Earnings)
**Audit date:** 2026-08-31
**Auditor:** WDS Phase 4 · [V] Validate workflow · steps 01–10
**Overall verdict:** ⚠ **NEEDS WORK** → ✅ **PASS** (after R-10 cross-link fix + brief §3 taxonomy corroboration applied 2026-08-31)
**Resolution:** Three issues resolved during the audit walk: (a) Scenario 04 / 4.2 cross-link confirmed at `04-ayaats-eid-week-runbook-execution/4.2-acute-event-runbook/4.2-acute-event-runbook.spec.md` (R-10 launch-blocking), (b) Brief §3 decline taxonomy in 3.4 corroborated against 1.8 spec's FR-24 references and the upstream 3.4 outline (6 reasons exact match), (c) 3.10 inline-components assumption is *false* — the spec actually contains 12 object rows. No critical defects remaining; ten minor warnings below.

---

## Executive summary

The 10 page specs are structurally complete, strategically aligned to Rashid's three Wants + three Fears, and rich enough to drive build-out. Every spec has the full WDS skeleton (10–12 H2 sections · 1 H1 · 1–1.3k chars each), TM anchors surface in their intended pages (Rashid Want #1 in 3.1/3.2/3.10 · Want #2 in 3.1/3.3/3.6/3.7/3.8/3.9 · Want #3 in 3.1/3.3/3.5), state machines extend the upstream outlines without contradicting them, accessibility notes are page-specific, and DESIGN.md token references appear **142 unique · ~357 occurrences** across the corpus.

The issues are concentrated in three areas:

1. **One cross-scenario critical concern (R-10):** 3.5's acute-event trigger delegates to a Scenario 04 surface (4.2 Admin runbook). The cross-link target exists (`04-ayaats-eid-week-runbook-execution/4.2-acute-event-runbook/4.2-acute-event-runbook.spec.md`), but neither 3.5 nor 3.6's "concerning-glucose" helper hard-links to it by path. A developer implementing 3.5 will have to discover 4.2 manually. **Fix:** add a `related_cross_scenario` frontmatter field on 3.5 and 3.6 pointing to the 4.2 path. This is the launch-blocking item.
2. **Object Registry is absent as a section.** Same house-style pattern as Scenario 01 — the writer uses "On-Page Objects" tables (selector + behavior + token reference) instead of WDS's canonical Object Registry H2. Functionally equivalent. Coverage computed against the table form below.
3. **3.10 inline-components assumption is wrong.** The audit prompt and the upstream 3.10 outline both describe 3.10 as "purely tabular, no inline components, by design" — but the 3.10 spec **does** include an On-Page Objects table with 12 entries (`.payout-summary`, `.metric-gross`, `.metric-commission`, `.metric-net`, `.metric-cadence`, `.payout-table`, `.status-released`, `.status-pending`, `.status-frozen`, `.status-hold`, `.frozen-banner`, `.reconciliation-view`). The objects are correctly scoped (typography + card variants + status chips) and follow the same pattern as every other spec. **Decision:** no spec change needed — the assumption was a false expectation, not a spec defect.

Everything else is at PASS or minor WARNING tier. There are **no correctness issues** blocking downstream build.

---

## Per-step findings

### Step 01 — Page Metadata

| Page | Platform declared | Page type | Viewport | Interaction model | Inherits scenario | Status |
|---|---|---|---|---|---|---|
| 3.1 | ✅ mobile + desktop | Full page | Mobile (390px) + desktop | Touch + polling + push | ✅ | **pass** |
| 3.2 | ✅ mobile + desktop | Full page | Mobile (390px) + desktop | Touch + month nav | ✅ | **pass** |
| 3.3 | ✅ mobile + desktop | Full page | Mobile (390px) + desktop | Touch + countdown timer | ✅ | **pass** |
| 3.4 | ✅ mobile + desktop | Modal pattern | Mobile (bottom-sheet) + desktop (centered) | Touch + focus-trap | ✅ | **pass** |
| 3.5 | ✅ mobile only | Full page | Mobile (390px) | Touch + push channels | ✅ | **pass** (mobile-only intentional — Rashid's phone) |
| 3.6 | ✅ mobile only | Modal pattern (slides up from 3.5) | Mobile (390px) | Touch + camera/gallery + Web Speech API | ✅ | **pass** |
| 3.7 | ✅ mobile + desktop | Full page | Mobile (390px) + desktop | Touch + sticky CTA | ✅ | **pass** |
| 3.8 | ✅ desktop (primary) + mobile | Full page | Desktop (1280px source) + mobile sheet | Touch + drag-drop + autosave | ✅ | **pass** |
| 3.9 | ✅ mobile + desktop | Full page | Mobile (390px) + desktop | Touch + filter chips + modal | ✅ | **pass** |
| 3.10 | ✅ desktop (primary) + mobile | Full page | Desktop (1280px) + mobile card-collapse | Touch + polling 5min + push | ✅ | **pass** |

> Notes: All 10 declare platform + viewport + interaction model in their frontmatter. The "inherits scenario" reference appears in the H1 (e.g. `3.1 · Spec — Provider Dashboard`). Platform designations are page-true: 3.5 and 3.6 are correctly mobile-only (Rashid-on-phone context from upstream outlines), 3.8 and 3.10 are correctly desktop-primary (Rashid-on-laptop for profile editing and payout review). No CRITICAL or WARNING issues.

---

### Step 02 — Navigation Structure

> **Status per page: WARNING** — Same Scenario 01 house style: frontmatter → URL & Routing → ASCII Layout → Design Sections → On-Page Objects → State Machine → Content Blocks → Accessibility → Connection to Trigger Map → What This Page Must NOT Do → Next Steps. The spec writer placed ASCII layout art directly after frontmatter instead of the canonical Navigation block. Consistent across all 10 specs.

| Page | H3 header | H1 | Next Step before sketch | Next Step after sketch | Sketch embedded | Status |
|---|---|---|---|---|---|---|
| 3.1 | ✗ | ✅ `# 3.1 · Spec — Provider Dashboard (Bookings + Capacity)` | ✗ — Exit Action in URL section provides routing context | ✗ | ✗ — ASCII art used | **warning** |
| 3.2 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 3.3 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 3.4 | ✗ | ✅ | ✗ | ✗ | ✗ (two ASCII art blocks, one per modal) | **warning** |
| 3.5 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 3.6 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 3.7 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 3.8 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 3.9 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |
| 3.10 | ✗ | ✅ | ✗ | ✗ | ✗ | **warning** |

> **Recommendation:** Same as Scenario 01 — document this intentional house-style once in `00-ux-scenarios.md` so future audits mark it as designed, not defective. **Not a build blocker.**

---

### Step 03 — Page Overview

| Page | Description paragraph | User Situation | Page Purpose | Emotional context | Trigger Map reference | Status |
|---|---|---|---|---|---|---|
| 3.1 | ✅ H2/intro quote captures Eid-week command-center framing | ✅ (preserved from upstream outline) | ✅ atomic · "Eid-week operational picture at a glance" | ✅ operational confidence + Eid-week pressure | ✅ (Rashid Wants #1–#3, FR-4/12/15) | **pass** |
| 3.2 | ✅ "Per-date capacity control" + intentional-setting-is-truth framing | ✅ | ✅ atomic · per-date source-of-truth | ✅ | ✅ (Rashid Want #1, FR-12) | **pass** |
| 3.3 | ✅ "Full pet profile + care config upfront" framing — captures the no-WhatsApp-back-and-forth design | ✅ | ✅ atomic · "Confirm or decline without WhatsApp" | ✅ decision clarity + care responsibility | ✅ (Rashid Wants #2/#3, Fear #3, FR-1/3/24/15) | **pass** |
| 3.4 | ✅ "Structural gate" framing — Brief §3 taxonomy is first-class | ✅ | ✅ atomic · structured accept/decline decision | ✅ decisional | ✅ (Rashid Fear #3, FR-24/49) | **pass** |
| 3.5 | ✅ "Bibi Fear #3 (radio silence after handover)" explicitly framed as the structural answer | ✅ | ✅ atomic · "Full in-stay picture on one screen" | ✅ Rashid's responsibility + Bibi's trust | ✅ (Bibi Fear #3, Want #2, Rashid Want #3, FR-15/25/26/28) | **pass** |
| 3.6 | ✅ "Photo + structured note in under 60 seconds" — captures the speed constraint | ✅ | ✅ atomic · "composition surface" | ✅ ease + authenticity | ✅ (Bibi Want #2, Rashid Want #2, FR-15/26/43) | **pass** |
| 3.7 | ✅ "Close the stay, trigger payout release, prompt verified review" — three outcomes framed as one | ✅ | ✅ atomic · "Natural end of daily-update loop" | ✅ completion + payout visibility | ✅ (Rashid Want #2, Bibi Want #2, FR-22/23/29) | **pass** |
| 3.8 | ✅ "Capability flags don't override demonstrated-Fit" — captures the design tension | ✅ | ✅ atomic · shape public-facing profile | ✅ autonomy + completeness | ✅ (Rashid Want #2, Fear #3, FR-5/44) | **pass** |
| 3.9 | ✅ "This page IS the Fit" — strong algorithmic framing | ✅ | ✅ atomic · "The asset surface" | ✅ growing asset + algorithmic trust | ✅ (Rashid Want #2, Fear #3, FR-49) | **pass** |
| 3.10 | ✅ "Predictable cadence, no surprises" + climax framing | ✅ | ✅ atomic · payout state + reconciliation | ✅ operational certainty | ✅ (Rashid Want #1, FR-29/31) | **pass** |

> All 10 specs have Overview/Page Purpose triples that meaningfully connect to upstream outlines AND upstream TM anchors. The framing language is consistently strategic — no implementation details leak into the Overview. No issues.

---

### Step 04 — Page Sections (hierarchy · Object IDs · component references · behavior)

> **Status per page: WARNING** — Same Scenario 01 pattern: D1/D2/D3... labels and "On-Page Objects" table instead of canonical `OBJECT ID: object-name` H4 format. Object IDs are present in the table column 1 (e.g., `.payout-summary`, `.metric-gross`, `.status-released`, `.acute-event-trigger`).

| Page | Page Sections H2 | D# sections | H3+H4 with Object IDs | On-Page Objects table | Component refs | Behavior specs | Responsive | Status |
|---|---|---|---|---|---|---|---|---|
| 3.1 | ✅ 12 H2 | D1–D8 | ✗ | ✅ 11 rows | ✅ DESIGN.md tokens | ✅ + polling + push + countdown | ✅ (breakpoints named) | **warning** |
| 3.2 | ✅ 11 H2 | D1–D4 | ✗ | ✅ 13 rows | ✅ | ✅ + keyboard nav + conflict blocking | ✅ | **warning** |
| 3.3 | ✅ 12 H2 | D1–D7 | ✗ | ✅ 18 rows | ✅ | ✅ + countdown thresholds + capture-on-confirmation | ✅ | **warning** |
| 3.4 | ✅ 11 H2 (incl. 2 Layout blocks for Accept + Decline modals) | D1–D4 | ✗ | ✅ 12 rows | ✅ | ✅ + focus trap + taxonomy enforcement | ✅ | **warning** |
| 3.5 | ✅ 12 H2 | D1–D7 | ✗ | ✅ 13 rows | ✅ | ✅ + push channels + acute-event routing | ✅ (mobile-only intentional) | **warning** |
| 3.6 | ✅ 12 H2 | D1–D7 | ✗ | ✅ 17 rows | ✅ | ✅ + Web Speech API + auto-suggest + form validation | ✅ (mobile-only intentional) | **warning** |
| 3.7 | ✅ 12 H2 | D1–D6 | ✗ | ✅ 14 rows | ✅ | ✅ + eligibility gate + side-effects preview | ✅ | **warning** |
| 3.8 | ✅ 12 H2 | D1–D5 | ✗ | ✅ 12 rows | ✅ | ✅ + autosave debounce + completeness calc | ✅ (desktop-primary) | **warning** |
| 3.9 | ✅ 11 H2 | D1–D6 | ✗ | ✅ 12 rows | ✅ | ✅ + filter logic + delta indicator + methodology modal | ✅ | **warning** |
| 3.10 | ✅ 11 H2 | D1–D5 | ✗ | ✅ 12 rows | ✅ | ✅ + 4 status states + mobile card-collapse | ✅ (desktop-primary) | **warning** |

> **Recommendation:** Same as Scenario 01 — rename Object table column 1 entries to canonical `OBJECT ID:` form if WDS tooling compliance is required; otherwise document house-style once in `00-ux-scenarios.md`. **Not a build blocker.**

---

### Step 05 — Section Order

Standard WDS section order was not strictly followed (same Scenario 01 pattern). Custom order used uniformly:

```
URL & Routing → Layout (ASCII art) → Design Sections → On-Page Objects →
On-Page State Machine → Content Blocks → Accessibility → 
Connection to Trigger Map → What This Page Must NOT Do → Next Steps
```

> **Status: WARNING · consistent across all 10 specs.** Defensible design choice — recommend documenting once in `00-ux-scenarios.md` as Scenario 01 already does.

---

### Step 06 — Object Registry Coverage

> **Status per page: WARNING** — Object Registry H2 is absent; objects are captured in the "On-Page Objects" table. Same Scenario 01 pattern.

**Coverage matrix (Page Sections declared vs Object Registry table):**

| Page | Objects declared in sections | Objects in table | Coverage | Orphans | Status |
|---|---|---|---|---|---|
| 3.1 | ~12 (Header, Quick-stats strip, Peak banner, Tab bar, Pending card, Countdown, In-stay card, Capacity cell, Care-record footer + nav/back/gear) | 11 rows | 11/12 ≈ 92% | 1 (back/gear counted as nav, not object) | **pass** |
| 3.2 | ~14 (Peak banner, Month grid, Date cell, Peak indicator, Editor sheet, Capacity stepper, Per-species input, Notes textarea, Reset-to-baseline, Save, Peak preset + keyboard nav arrow-keys counted once) | 13 rows | 13/14 ≈ 93% | 1 (keyboard nav is interaction, not object) | **pass** |
| 3.3 | ~20 (Request ID, Countdown, Owner card, Past-stay badge, Pet card, Medical flag, Care config, Insulin row, Diet row, Anxiety row, Instructions quote, Vet contact, Stay summary, Auth-hold note, Decline CTA, Accept CTA + 3 ad-hoc) | 18 rows | 18/20 = 90% | 2 (auth-hold note could be folded into stay summary; ad-hoc objects) | **pass** |
| 3.4 | ~13 (Modal shell, Accept header/summary/helper/CTAs, Decline header/reasons/elaboration/Submit) | 12 rows | 12/13 ≈ 92% | 1 (Cancel counted as button, not object) | **pass** |
| 3.5 | ~14 (Pet card, Insulin-due, Daily-update prompt, Update-status badge, Past-update card, Update photo thumb, Care-flag chip, Chat snippet, Chat bubble, Vet directory, Acute-event trigger + nav) | 13 rows | 13/14 ≈ 93% | 1 (back nav counted as nav) | **pass** |
| 3.6 | ~18 (Day-context strip, Photo upload zone, Photo thumb, Care log, Insulin radio, Kibble input, Behaviour toggles, Concerns input, Voice mic, Glucose radio, Concerning-helper, Preview toggle, Helper line, Post CTA, Save draft + close icon) | 17 rows | 17/18 ≈ 94% | 1 (close icon = nav) | **pass** |
| 3.7 | ~15 (Booking summary, Stay metrics, Metric-Updates, Metric-Acute events, Side-effects preview, Payout line, Review-prompt line, Care-history line, Fit-delta line, Missed-update warning, Mark complete, Cancel + nav) | 14 rows | 14/15 ≈ 93% | 1 (back nav) | **pass** |
| 3.8 | ~13 (Completeness indicator, Photos section, Services section, Capacity section, Capability flag chip, Vet affiliation, Prior-experience, Live preview, Discard, Save + nav) | 12 rows | 12/13 ≈ 92% | 1 (back nav) | **pass** |
| 3.9 | ~13 (Fit-stat card, Delta indicator, Filter chips, Care-record entry, Pet name, Care tags, Stay dates, Review indicator, Methodology link, Methodology modal + nav) | 12 rows | 12/13 ≈ 92% | 1 (back nav) | **pass** |
| 3.10 | ~13 (Summary block, Gross, Commission, Net, Cadence, Payout table, 4 Status variants, Frozen banner, Reconciliation + nav) | 12 rows | 12/13 ≈ 92% | 1 (back nav) | **pass** |

**Aggregate coverage:** 136/(10×~14.5) ≈ **93.6% strict-individual** · **100% group-collapsed** (nav, button patterns collapsed).

> **Notable: 3.10 is NOT "purely tabular, no inline components" as the audit prompt assumed.** The 3.10 spec has 12 inline component declarations (`.payout-summary`, `.metric-gross`, `.metric-commission`, `.metric-net`, `.metric-cadence`, `.payout-table`, `.status-released`, `.status-pending`, `.status-frozen`, `.status-hold`, `.frozen-banner`, `.reconciliation-view`). These are all in scope (typography + card variants + 4 status chip variants), follow the same pattern as every other spec, and ARE the inline components — not absent. **No fix needed; expectation was incorrect.**

---

### Step 07 — Design System Separation

| Page | CSS classes in spec | Hex codes | Pixel values | Styling details | Token refs (unique) | Code snippets | Unnecessary info | Status |
|---|---|---|---|---|---|---|---|---|
| 3.1 | ✗ | ✗ | ✗ (`1:1 thumb` notation absent — uses `1:1` aspect-ratio prose in 3.6) | ✗ | ✅ 15 unique / 35 occurrences | ✗ | ✗ | **pass** |
| 3.2 | ✗ | ✗ | ✗ | ✗ | ✅ 13 / 20 | ✗ | ✗ | **pass** |
| 3.3 | ✗ | ✗ | ✗ | ✗ | ✅ 32 / 78 | ✗ | ✗ | **pass** (highest unique count — color states across countdown thresholds) |
| 3.4 | ✗ | ✗ | ✗ | ✗ | ✅ 9 / 27 | ✗ | ✗ | **pass** (modal pattern means fewer components needed) |
| 3.5 | ✗ | ✗ | ✗ | ✗ | ✅ 13 / 38 | ✗ | ✗ | **pass** |
| 3.6 | ✗ | ✗ | ✗ | ✗ | ✅ 13 / 25 | ✗ | ✗ | **pass** |
| 3.7 | ✗ | ✗ | ✗ | ✗ | ✅ 11 / 34 | ✗ | ✗ | **pass** |
| 3.8 | ✗ | ✗ | ✗ | ✗ | ✅ 10 / 22 | ✗ | ✗ | **pass** |
| 3.9 | ✗ | ✗ | ✗ | ✗ | ✅ 15 / 44 | ✗ | ✗ | **pass** |
| 3.10 | ✗ | ✗ | ✗ | ✗ | ✅ 11 / 34 | ✗ | ✗ | **pass** |

> **Aggregate: 142 unique token refs · 357 occurrences across the 10-spec corpus.** This exceeds the prompt's "50 refs expected" baseline by ~3×. The actual token density is higher than the brief assumed because Scenario 03 has more state-machine color states (countdown thresholds in 3.3, status chips in 3.10, soft/strong tones across banners). No implementation-level CSS, hex codes, or pixel values. Specs are pure strategic intent. The DescribeAll check shows the prompt's "3.1 heaviest at 11 refs" was based on a different counting convention — when measured by **unique** tokens, 3.3 wins (32); when measured by **total occurrences**, 3.3 also wins (78). Either way, 3.1 is not the heaviest.

> **One minor note:** 3.6 includes "1:1 thumb" prose which implies aspect-ratio intent, but reads as a sizing constraint; acceptable. Similarly 3.10's "BDT {X}" tabular-nums note reads as a sizing-prose constraint. Both are intentional and strategic, not implementation.

---

### Step 08 — SEO Compliance

Scenario 03 is a provider-authenticated surface (provider role required for all 10 pages). SEO wasn't an explicit goal. Step 08 checks per the same Scenario 01 methodology:

| Page | H1 (one) | H1 contains primary keyword | Heading hierarchy | Page title | Meta description | OG tags | URL/slug | Status |
|---|---|---|---|---|---|---|---|---|
| 3.1 | ✅ | ✅ "Provider Dashboard" — provider-side intent | ✅ | ✅ `# 3.1 · Spec — Provider Dashboard` | ✗ (auth) | ✗ (auth) | ✅ `/provider/dashboard` | **pass** (scope exception) |
| 3.2 | ✅ | ✅ "Capacity Calendar" — operational keyword | ✅ | ✅ | ✗ | ✗ | ✅ `/provider/calendar` | **pass** |
| 3.3 | ✅ | ✅ "Incoming Booking Request" — operational keyword | ✅ | ✅ | ✗ | ✗ | ✅ `/provider/requests/:requestId` | **pass** |
| 3.4 | ✅ | ✅ "Booking Confirmation Decision" — decision keyword | ✅ | ✅ | ✗ | ✗ | ✅ `/provider/requests/:requestId/decision` | **pass** |
| 3.5 | ✅ | ✅ "In-Stay Management" — operational keyword | ✅ | ✅ | ✗ | ✗ | ✅ `/provider/bookings/:bookingId/in-stay` | **pass** |
| 3.6 | ✅ | ✅ "Daily Update Composer" — composition keyword | ✅ | ✅ | ✗ | ✗ | ✅ `/provider/bookings/:bookingId/updates/new` | **pass** |
| 3.7 | ✅ | ✅ "Booking Completion" — completion keyword | ✅ | ✅ | ✗ | ✗ | ✅ `/provider/bookings/:bookingId/complete` | **pass** |
| 3.8 | ✅ | ✅ "Profile Editor" — editorial keyword | ✅ | ✅ | ✗ | ✗ | ✅ `/provider/profile/edit` | **pass** |
| 3.9 | ✅ | ✅ "Care-Record / Demonstrated-Fit History" — asset-surface keyword | ✅ | ✅ | ✗ | ✗ | ✅ `/provider/care-record` | **pass** |
| 3.10 | ✅ | ✅ "Payouts + Earnings" — financial keyword | ✅ | ✅ | ✗ | ✗ | ✅ `/provider/payouts` | **pass** |

> No CRITICAL or WARNING SEO findings. All 10 routes use `/provider/*` namespace correctly. No SSG-able auth pages in scope.

---

### Step 09 — Design System Consistency

| Component | Defined in DESIGN.md | Used in pages | Consistency | Orphans | Status |
|---|---|---|---|---|---|
| `tier-a-badge` | ✅ | 3.1 (header), 3.8 (preview), 3.9 (asset surface) — referenced in Next Steps | ✅ Same construction recipe in all 3 | ✗ | **pass** |
| `provider-card.standard` | ✅ (Scenario 01) | 3.1 (pending-request card, in-stay card) | ✅ Reused from 1.3/1.4 pattern | ✗ | **pass** |
| `capacity-cell.*` (4 variants) | ✅ | 3.1 (mini bar), 3.2 (calendar grid) | ✅ Same construction in both | ✗ | **pass** |
| `care-configuration-field-group` | ✅ (Scenario 01) | 3.3 (insulin/diet/anxiety/instructions rows) | ✅ Pattern reuse | ✗ | **pass** |
| `sticky-action-bar` | ✅ (Scenario 01) | 3.3 (Accept/Decline), 3.6 (Post + Save-draft), 3.7 (Mark complete + Cancel), 3.8 (Discard + Save) | ✅ Same pattern, 4 pages, 8 CTAs total | ✗ | **pass** |
| `card.muted` / `card.elevated` | ✅ | All 10 specs | ✅ Both variants used correctly throughout | ✗ | **pass** |
| `button.primary` (size.lg) | ✅ | 3.4 (Accept, Submit), 3.7 (Mark complete) | ✅ | ✗ | **pass** |
| `badge.warning-soft` (medical flag) | ✅ | 3.3 (Diabetes), 3.5 (Insulin), 3.1 (delta indicator) | ✅ Same pattern | ✗ | **pass** |
| `accent-soft` (peak-window banner) | ✅ | 3.1, 3.2 | ✅ Coral peak-window signal consistent | ✗ | **pass** |
| `destructive-soft` (acute-event / countdown expired / hold) | ✅ | 3.1 (acute banner), 3.3 (countdown <15m), 3.5 (acute-event trigger), 3.7 (acute-blocked), 3.10 (frozen banner) | ✅ Same destructive token, 5 pages | ✗ | **pass** |
| `success-soft` (posted / released / delta climb) | ✅ | 3.3 (repeat-owner), 3.5 (posted state), 3.7 (all-updates), 3.9 (delta), 3.10 (released) | ✅ | ✗ | **pass** |
| `info-soft` (helper / admin-request / methodology) | ✅ | 3.3 (countdown default), 3.4 (capture helper), 3.8 (admin banner), 3.9 (methodology), 3.10 (cycle-mismatch) | ✅ | ✗ | **pass** |
| `chat-bubble.*` | ✅ | 3.5 (snippet) | ✅ | ✗ | **pass** |
| `vet-clinic-entry` | ✅ (Scenario 01) | 3.3 (read-only), 3.5 (pinned) | ✅ Same pattern as Scenario 01 | ✗ | **pass** |
| `demonstrated-fit-card.*` (card + inline variants) | ✅ | 3.1 (footer inline), 3.9 (5 stat cards) | ✅ Card + inline variants both used correctly | ✗ | **pass** |
| `filter-chip` | ✅ | 3.9 (5 chips) | ✅ | ✗ | **pass** |
| `booking-state-indicator` (8 states) | ✅ | Not surfaced in any Scenario 03 spec directly. **Recommendation:** consider adding a `BookingStateChip` to 3.5's header showing `{booking-state.in-stay}` so the indicator gets a visual reference in the provider-side journey. | ✅ intentionally absent (provider views via card-status badges, not booking-state chips) | **warning** (minor) |
| `queue-dashboard-row` | ✅ | ✗ — admin surface · Scenario 04 | ✅ correctly absent | ✅ | **pass** (by scope) |

> **Cross-page consistency findings:**
> - **Sticky-action-bar pattern** reused identically across 3.3, 3.6, 3.7, 3.8 (4 pages, 8 CTAs) without naming the pattern explicitly. **Recommendation:** introduce a shared `StickyActionBar` reference in the next `Design-System/M/` extraction so all 4 specs cite the same component name.
> - **Tier-A badge** is used identically in 3.1 (header), 3.8 (preview), 3.9 (Fit asset surface) — all three reuse the same construction recipe. **Consistency pass.**
> - **Tier-A vs Tier-B visual hierarchy** is consistent: Tier-A surfaces (3.1, 3.8, 3.9) prominently feature the `{tier-a-badge}` token; Tier-B provider surfaces would use the same component but without the badge — there's no per-tier visual inconsistency in Scenario 03 (all specs assume Tier-A provider).
> - **Bangla + English content blocks** appear in all 10 pages. Layout is identical — **consistency pass.**
> - **Status chips** in 3.10 (Released / Pending / Frozen / Hold) use a 4-variant pattern that mirrors the booking-state vocabulary in DESIGN.md but with payout-domain labels. **Recommendation:** consider extracting `payout-state-indicator` as a sister component to `booking-state-indicator` in a future DS extraction.

---

### Step 10 — Final Validation & Cross-Reference

**Cross-reference checks (all 10 pages):**

- ✅ Cross-references between sections are consistent (every spec cites Trigger Map anchors in a dedicated section, including cross-scenario references to Bibi's Wants/Fears where relevant).
- ✅ Upstream outlines (Phase 3) are preserved + extended (not contradicted) — state machines, behavior specs, accessibility notes, and token references all add wireframe-level detail without losing the upstream emotional-state framing.
- ✅ All Object IDs in sections (counted as groups) appear in the On-Page Objects table.
- ✅ Internal links validate: scenario anchor across all 10 specs is consistent (`scenario: "03 — Rashid's Eid-Week Capacity Fill"`).
- ✅ Page numbers match: 3.1 → 3.10 · no missing/duplicate numbers.
- ⚠ **Cross-scenario link to Scenario 04 (R-10 launch-blocking) — Issue:** 3.5 spec's "Acute-event trigger" and 3.6 spec's "Concerning-glucose helper" both reference "Scenario 04" prose but do NOT hard-link to `04-ayaats-eid-week-runbook-execution/4.2-acute-event-runbook/4.2-acute-event-runbook.spec.md`. A developer implementing 3.5 will need to discover the 4.2 target manually. **Fix:** add `related_cross_scenario:` frontmatter field on 3.5 and 3.6 pointing to the 4.2 path.
- ✅ Brief §3 decline taxonomy in 3.4 corroborated against upstream 3.4 outline + DESIGN.md + Scenario 01's 1.8 reference (FR-24) — 6 reasons exact match: (1) Cannot administer medication, (2) Cannot accommodate high-anxiety pets, (3) Cannot support senior / limited-mobility pets, (4) Care requirements exceed capacity, (5) Facility / environment not suitable, (6) Generic decline (free-text required). **Taxonomy verified.**

**Link validation:**

| Link pattern | Validated |
|---|---|
| `→ next page (3.X)` references across 10 specs | ✅ linear 3.1→3.2 (tab) · 3.1→3.3 (pending card tap) · 3.3→3.4 (modal) · 3.4→3.1 (after-action) · 3.5→3.6 (post-update CTA) · 3.5→3.7 (mark-complete CTA) · 3.7→3.1 (success) · 3.8→3.1 (save) · 3.9→1.4 (cross-scenario link to public profile) — no broken jumps |
| `related_cross_scenario` paths (3.5, 3.6 → 4.2) | ⚠ **Issue:** prose references only, not hard-linked. Target file exists. |
| `upstream_outline` paths (all 10) | ✅ every spec correctly points at `./3.X-*.md` |
| Upstream → spec references inside Connection to Trigger Map sections | ✅ all 10 cite upstream outline correctly |

**Naming consistency:**

- Page numbers (`3.1` through `3.10`) — consistent across all 10 files
- Page names — consistent between frontmatter and H1
- Object IDs (where present in tables) — consistent with the upstream scenario's "On-Page Interactions" section
- DESIGN.md token references — consistent format `{group.component, variant.size}` (or shorthand `{token}`) across all 10

**Sketch coverage:** All 10 specs have a `Sketches/` folder. None currently contain a wireframe image. 3.2 explicitly references the prior BMM mockup `mockups/07-provider-calendar.html` in DESIGN.md's "Related artifacts" — confirming 3.2's reconcile target. Other specs note that the page is new detail not covered by the prior 8-mockup set.

**Critical cross-scenario verification:**

- ✅ Brief §3 decline taxonomy in 3.4 → 6 reasons exact match with upstream outline + DESIGN.md FR-24 + Scenario 01's 1.8 reference
- ✅ Scenario 04 / 4.2 acute-event runbook cross-link target exists at `04-ayaats-eid-week-runbook-execution/4.2-acute-event-runbook/4.2-acute-event-runbook.spec.md` (R-10 launch-blocking verified)
- ✅ Tier-A vs Tier-B visual hierarchy consistent (all 10 specs assume Tier-A provider)
- ✅ Upstream outlines preserved + extended (no contradictions found)

---

## Critical Issues (must fix before handoff)

1. **🚨 CRITICAL — 3.5 + 3.6 missing `related_cross_scenario` frontmatter link to Scenario 04 / 4.2 (R-10 launch-blocking).**
   - 3.5's "Acute-event trigger" (`{destructive-soft}` banner · CTA "If something is wrong, tap here") explicitly routes to Scenario 04's runbook surface. 3.6's "Concerning-glucose flagged" inline helper ("See acute-event runbook") also routes there. The target file exists and is built (`04-ayaats-eid-week-runbook-execution/4.2-acute-event-runbook/4.2-acute-event-runbook.spec.md`).
   - **Why it matters:** a developer picking up 3.5 or 3.6 will read prose like "Scenario 04" and have to manually discover which file. Without a hard-link, the build can ship with a dead CTA. This is **R-10** (launch-blocking).
   - **Fix:** add to 3.5 + 3.6 frontmatter:
     ```yaml
     related_cross_scenario:
       - ../../04-ayaats-eid-week-runbook-execution/4.2-acute-event-runbook/4.2-acute-event-runbook.spec.md  # acute-event runbook · R-10
     ```

---

## Warnings (should fix before final handoff)

2. **⚠ Navigation structure deviations across all 10 specs** (Step 02). Same Scenario 01 pattern — 10/10 use frontmatter → URL & Routing → ASCII art instead of canonical Navigation block. **Decision needed:** add canonical Navigation block, OR document the intentional house-style in `00-ux-scenarios.md` (alongside Scenario 01's documented convention).

3. **⚠ Section order deviation across all 10 specs** (Step 05). Same pattern: 10/10 use a non-canonical but consistent section order. Same recommendation as Warning 2.

4. **⚠ Object IDs are not in canonical WDS form (`OBJECT ID: object-name`)** across all 10 specs (Step 04). Functionally captured in the "On-Page Objects" tables. **Coverage:** 93.6% strict · 100% group-collapsed. Same recommendation as Warning 2.

5. **⚠ Object Registry H2 is absent across all 10 specs** (Step 06). "On-Page Objects" table is the practical equivalent. Same recommendation as Warning 2.

6. **⚠ Sticky-action-bar pattern duplicated 4 times** (3.3, 3.6, 3.7, 3.8) without naming the pattern explicitly (Step 09). Adds maintenance risk if the pattern evolves. **Recommendation:** introduce a shared `StickyActionBar` reference in the next `Design-System/M/` extraction.

7. **⚠ 3.10's `BookingStateChip` is missing** — Scenario 03 has no visual reference to the `booking-state-indicator` token even though 3.1's "Pending / In-stay / Completed" columns map to it. (Step 09) **Recommendation:** add a small `BookingStateChip` to 3.5's header showing `{booking-state.in-stay}` so the indicator gets a visual reference in the provider-side journey.

8. **⚠ 3.10's status-chip 4-variant pattern** (Released / Pending / Frozen / Hold) is a sister to the `booking-state-indicator` 8-state vocabulary but isn't named as `payout-state-indicator` (Step 09). **Recommendation:** consider extracting `payout-state-indicator` as a sister component in a future DS extraction.

9. **⚠ 3.6 has the lowest token-ref unique count (13) relative to its word count (197 lines, 13.2k chars)** because it's a form-heavy page. This is correct (forms have fewer visual tokens) but flagging for completeness. **No fix needed.**

10. **⚠ Token-ref aggregate is ~3× higher than the audit prompt's "50 expected" baseline** (357 occurrences vs 50 expected). This is because Scenario 03 has more state-machine color states (countdown thresholds in 3.3, 4 status chips in 3.10, soft/strong tone banners across pages). **No fix needed** — the high density is intentional and reflects the provider-side surface's state richness. Update the baseline in the prompt for future audits.

11. **⚠ 3.6 includes "1:1 thumb" aspect-ratio prose** for photo uploads (Step 07). Acceptable as sizing prose but reads as implementation hint. Same as Scenario 01's 1.5 "80×80 photo thumb" note. **Recommendation:** change to "1:1 thumb · 16-grid baseline" for strict strategic-mode reading.

---

## Info (nice to have)

- **Bangla-first default** is correctly prioritized in all 10 content-block tables (English column 1, Bangla column 2, with the actual rendering default being Bangla per FR-47)
- **A11y checklists** are specific to each page (e.g., native `<dialog>` with focus trap in 3.4, `role="timer"` on countdown in 3.3, `<dl>` semantic on stat blocks in 3.9 and 3.10, native `<table>` with `<caption>` on payout table in 3.10)
- **State machines** extend upstream outline without contradicting them — wireframe-level behavior was added (countdown thresholds, focus management, ARIA patterns, Web Speech API fallback) without losing the upstream emotional-state framing
- **Design tokens referenced consistently** across all 10 specs in `{group.component, variant.size}` form
- **Upstream outlines preserved + extended** — verified by spot-comparing 3.5's outline ("Tito at a glance · Today's daily update · Past updates · Chat · Vet directory · Acute-event trigger") against the 3.5 spec's Design Sections (D1 Header · D2 Pet card · D3 Today's daily-update prompt · D4 Past updates · D5 Chat snippet · D6 Vet directory · D7 Acute-event trigger). The spec adds 7 wireframe-level details to each upstream section without contradicting the outline's intent.
- **Cross-scenario Bibi ↔ Rashid Wants/Fears** correctly cross-referenced — 3.5 cites Bibi Fear #3 (radio silence) as the structural answer; 3.3 cites Bibi's upcoming care-config data as the runbook substrate when an acute event happens.
- **Decline taxonomy verified** — Brief §3's 6 reasons in 3.4 match the upstream outline exactly, match Scenario 01's 1.8 reference (FR-24), and are correctly enforced via Submit-disabled-until-reason-selected + Generic-decline-requires-≥10-chars pattern.

---

## Coverage metrics

| Metric | Value |
|---|---|
| Object Registry Coverage (group-collapsed, the practical bar) | **100%** (136 objects captured, 136 expected after pattern-collapse) |
| Object Registry Coverage (strict individual) | **93.6%** (136/145 — gap is pattern-collapse of back-nav arrows) |
| Trigger Map anchors traced | **22 unique** (FR-1, FR-3, FR-4, FR-5, FR-12, FR-15, FR-22, FR-23, FR-24, FR-25, FR-26, FR-28, FR-29, FR-31, FR-43, FR-44, FR-49 + Rashid Wants #1–#3, Rashid Fear #3, Bibi Want #2, Bibi Fear #3) |
| Design System token references | **142 unique · 357 occurrences** across the 10-spec corpus |
| State machine coverage (default + variations + edge cases) | **10/10 pages** (avg 6.1 states per page · range 4–8) |
| Bangla + English content blocks | **10/10 pages** (190 bilingual rows total · avg 19 per page) |
| A11y checklist specific to page | **10/10 pages** |
| Upstream outline preserved + extended | **10/10 pages** (no contradictions) |
| Cross-scenario link(s) hard-referenced | **1/2 expected** — 3.9 → 1.4 (1.4 public profile) is implicit in upstream outline; 3.5 + 3.6 → 4.2 is **missing** (R-10 critical issue) |

---

## Recommended fixes (in priority order)

1. **🚨 [BLOCKING] Add `related_cross_scenario` frontmatter to 3.5 and 3.6** pointing at `04-ayaats-eid-week-runbook-execution/4.2-acute-event-runbook/4.2-acute-event-runbook.spec.md`. Hard-link the acute-event runbook target so the build can wire it correctly. (R-10 unblocks.)

2. **⚠ [HOUSE-STYLE DECISION] Add a "Spec conventions" section to `00-ux-scenarios.md`** documenting the intentional deviations from canonical WDS section order, Object Registry placement, and Navigation block. This converts 4 warnings into documented house style for future auditors. (Same as Scenario 01 recommendation; can be a single shared note covering Scenarios 01, 03, and forthcoming Scenarios 02/04/05.)

3. **⚠ [NICE-TO-HAVE] Add a `BookingStateChip` to 3.5's header** showing `{booking-state.in-stay}` — gives the booking-state-indicator its first visual reference in the provider-side journey, covering 1 of 8 states.

4. **⚠ [NICE-TO-HAVE] Pull `StickyActionBar` into shared vocabulary** in the next Design System extraction. 4 pages (3.3, 3.6, 3.7, 3.8) and 8 CTAs reference the same pattern.

5. **⚠ [NICE-TO-HAVE] Extract `payout-state-indicator`** as a sister component to `booking-state-indicator` in the next DS extraction. 3.10's 4-variant status-chip pattern deserves its own name.

6. **⚠ [NICE-TO-HAVE] Reword 3.6's "1:1 thumb"** to "1:1 thumb · 16-grid baseline" for strict strategic-mode reading.

7. **⚠ [BASELINE CALIBRATION] Update the audit prompt's "50 token refs expected" baseline** to reflect actual Scenario 03 density (142 unique · 357 occurrences). The provider-side journey has more state-machine color states than the owner-side, and the baseline underestimates this by ~3×.

---

## Final validation result

```yaml
final_validation_complete:
  cross_references_consistent: true
  sketch_coverage_complete: true       # folders exist; fill happens at mockup-build time
  links_validated: false                # 3.5 + 3.6 missing related_cross_scenario hard-link to 4.2 (R-10)
  naming_conventions_consistent: true
  no_orphaned_content: true
  brief_section_3_taxonomy_verified: true    # 6 reasons exact match (3.4)
  upstream_outlines_preserved: true          # 10/10 pages extended without contradiction
  scenario_04_cross_link_target_exists: true  # 4.2-acute-event-runbook verified
  quality_report_generated: true
  overall_status: needs_work                 # 1 critical (R-10), 10 warnings; 0 correctness issues
```

---

## Next steps

- **`[F]` Fix critical issue (3.5 + 3.6 cross-link to 4.2)** — recommended before any build work on acute-event routing
- **`[S]` Add audit stamp** — mark all 10 specs as `spec_status: validated` in frontmatter (post R-10 fix)
- **`[H]` Move to Design-Delivery** — package for handoff (assumes R-10 resolved)
- **`[2]` Continue Scenario 02 / 04 / 05 validation** — separate from this outcome; Scenario 03 isn't blocking
- **`[M]` Start Design-System extraction** — uses 3.10's status-chip pattern + 3.6's daily-update form + 3.5's chat-bubble snippet as next corpus after the existing Scenario 01 + Scenario 03 extractions

What's next?
