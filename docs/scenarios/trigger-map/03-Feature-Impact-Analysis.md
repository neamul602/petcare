# Feature Impact Analysis: PetCare

## Scoring

**Primary Persona (⭐ Bibi the Banani-Booker):** High = 5 pts | Medium = 3 pts | Low = 1 pt
**Secondary Persona (🔧 Rashid the Reliable-Reliant):** High = 3 pts | Medium = 1 pt | Low = 0 pts
**Tertiary Persona (🏠 Ayaat the Admin-Operator):** High = 3 pts | Medium = 1 pt | Low = 0 pts

**Max Possible Score:** 11 (all three personas HIGH)
**Must Have MVP Threshold:** ≥8 OR Primary scored HIGH (5), with explicit sub-buckets per category

**Sub-bucket rationale:**
- **Primary-tier Must Have** — feature directly addresses Bibi's top wants/fears (Must-Address ranking)
- **Must Have for Secondary Objective 2 / Operational Constraint** — feature addresses Ayaat's binding constraint at the 1/25/75 ceiling (operational discipline that holds the engine)
- **Launch-Blocking Substrate** — Primary scored HIGH but rationale is structural rather than transformational; without it no UJ works, but it does not move the moat on its own
- **Shared Cross-Group Driver** — feature mitigates Off-Platform Defection, the shared cross-group driver
- **Consider for MVP** — mid-range scores, strategic value but not headline-driver
- **Defer** — minimal strategic value to the moat

---

## Prioritized Features

| Rank | Feature | Score | Sub-Bucket | Decision |
| ---- | ------- | ----- | ---------- | -------- |
| 1 | F1 — Acute Event Runbook | 11 | Primary-tier Must Have | Must Have |
| 2 | F2 — Care History persistence + pre-fill | 11 | Primary-tier Must Have | Must Have |
| 3 | F3 — Curated 3–5 search shortlist | 11 | Primary-tier Must Have | Must Have |
| 4 | F6 — Daily Updates + booking-scoped chat | 9 | Primary-tier Must Have | Must Have |
| 5 | F5 — Verified Reviews with photos | 9 | Primary-tier Must Have | Must Have |
| 6 | F7 — Tier-A/B supply + Admin-gated Vetting | 9 | Primary-tier Must Have | Must Have |
| 7 | F4 — Date-Level Capacity + Launch Neighborhood filtering | 9 | Primary-tier Must Have | Must Have |
| 8 | F13 — Off-Platform Defection signal capture | 9 | Shared Cross-Group Driver | Must Have |
| 9 | F12 — On-Platform Repeat Value mechanisms | 8 | Primary-tier Must Have | Must Have |
| 10 | F15 — Admin Queue Dashboard + audit log | 5 | Must Have for Secondary Obj 2 | Must Have |
| 11 | F14 — Operating Ceiling + Admin Load visibility | 5 | Must Have for Secondary Obj 2 | Must Have |
| 12 | F10 — Structured Decline with reason taxonomy | 7 | Consider | Consider |
| 13 | F17 — Vet-Clinic Directory (per Launch Neighborhood) | 7 | Consider | Consider |
| 14 | F9 — Booking lifecycle + capture-on-confirmation | 6 | Launch-Blocking Substrate | Must Have |
| 15 | F8 — Provider Profile + Admin-introduced badge | 6 | Consider | Consider |
| 16 | F11 — Report-an-Issue + Admin investigation | 6 | Launch-Blocking Substrate | Must Have |
| 17 | F16 — Payments + Payout + Refund mechanics | 6 | Launch-Blocking Substrate | Must Have |
| 18 | F18 — Bilingual surface (Bangla + English) | 6 | Launch-Blocking Substrate | Must Have |

---

## Decisions

### Must Have MVP — Primary-Tier (9 features)

These features directly address Bibi's top wants/fears (Must-Address ranking) and the Shared Cross-Group Driver. They are the load-bearing surfaces that move the moat.

- **F1 — Acute Event Runbook** (11)
  - Addresses Bibi Fear #1 (Tito's diabetes mishandled) — R-10 launch-blocking
  - Addresses Rashid Fear #2 (acute-event runbook gap)
  - Addresses Ayaat Want #1 (acute-event runbook under pressure)
  - Anchored to FR-14, FR-22, FR-26–30, FR-34 · SM-19 (Post-Mortem Closure Rate) · SM-20 (Time-to-Admin-Page)

- **F2 — Care History persistence + pre-fill** (11)
  - Addresses Bibi Want #3 (second-booking speed) — UJ-4 climax · SM-15 (Second-Booking Time <4 min)
  - Addresses Bibi Fear #2 (care-history loss in WhatsApp handoff)
  - Addresses Rashid Want #2 (care-record credit on profile)
  - Anchored to FR-7, FR-8, FR-10 · FR-48 (On-Platform Repeat Value) · SM-2 (Repeat-Booking Rate)

- **F3 — Curated 3–5 search shortlist** (11)
  - Addresses Bibi Want #1 (Tier-A fit on first search)
  - Addresses Rashid Want #2 (care-record credit visible to the right owners)
  - Addresses Ayaat Want #2 (provider-health visible at a glance via ranking surface)
  - Anchored to FR-11, FR-13 · SM-4 (Search-to-Request Conversion Rate)

- **F4 — Date-Level Capacity + Launch Neighborhood filtering** (9)
  - Addresses Bibi Want #1 (Tier-A fit on first search — Date-Level Capacity filters the right providers)
  - Addresses Rashid Want #1 (off-peak utilization buffered)
  - Addresses Ayaat Want #2 (provider-health at a glance) and R-3 (peak-week availability)
  - Anchored to FR-12, FR-13 · SM-13 (Provider Utilization by Tier) · SM-14 (Launch Neighborhood Density)

- **F5 — Verified Reviews with photos** (9)
  - Addresses Bibi Want #1 (Tier-A fit on first search — Day-1 trust differentiator)
  - Addresses Rashid Want #2 (care-record credit on profile)
  - Addresses Ayaat Want #2 (provider-health at a glance via review quality)
  - Anchored to FR-19, FR-21, FR-22, FR-23 · SM-11 (Review-With-Photos Rate) · SM-C3 (Average Star Rating NOT optimized)

- **F6 — Daily Updates + booking-scoped chat** (9)
  - Addresses Bibi Fear #3 (radio silence after handover) + Bibi Want #2 (daily in-stay visibility)
  - Addresses Rashid Want #2 (care-record accumulating into profile)
  - Addresses Ayaat Want #1 (acute-event signals surface during in-stay period)
  - Anchored to FR-15, FR-43, FR-44 · SM-9 (Daily-Update Posting Rate)

- **F7 — Tier-A/B supply + Admin-gated Vetting** (9)
  - Foundation of the curated-supply moat — every other feature depends on it
  - Addresses Rashid's Tier-A status and Tier-B standard pathway
  - Addresses Ayaat's role as the single operator (FR-2 lifecycle, FR-3 minimum bar, FR-4 bias audit)
  - Anchored to FR-1, FR-2, FR-3, FR-4 · FR-33 (Provider intake and Vetting workflow)

- **F12 — On-Platform Repeat Value mechanisms** (8)
  - Addresses Bibi Want #3 (second-booking speed) and Fear #2 (care-history loss)
  - Addresses Rashid Want #1 (off-peak utilization buffered via repeat-owner signal)
  - Anchored to FR-48 (Owner-side repeat Booking surface) · FR-49 (Provider-side repeat Owner and repeat Pet tooling)

- **F13 — Off-Platform Defection signal capture** (9)
  - **Shared Cross-Group Driver** — appears from Bibi's care-history-loss angle, Rashid's utilization-collapse angle, and Ayaat's invisible-signal angle
  - Addresses Bibi Fear #2 (care-history loss in WhatsApp handoff) — the structural reason the second booking must stay on-platform
  - Addresses Rashid Fear #1 (off-platform defection eroding his demonstrated record)
  - Addresses Ayaat Fear #3 (off-platform defection invisible from inside the platform)
  - Anchored to FR-36 (Off-Platform Defection detection + Re-Engagement Flow at 30/60/90 days) · FR-50 (off-platform soft-signal capture) · A-14 (defection monitoring)

### Must Have MVP — Secondary Objective 2 / Operational Constraint (2 features)

These features address Ayaat's binding constraint at the 1/25/75 operating ceiling. They are the operational discipline that holds the engine together. Strictly by formula they score 5, but their absence makes the Primary-tier Must Haves unreliable under volume.

- **F14 — Operating Ceiling + Admin Load visibility** (5)
  - Addresses Ayaat Want #3 (ceiling-aware scheduling) and Fear #2 (operating-ceiling breach)
  - Without it, every Primary-tier Must Have collapses when bookings/month trends toward 75+
  - Anchored to FR-38 (Operating Ceiling with throttle surface) · SM-18 (Admin Load vs. Operating Ceiling) · A-13 (Operating Ceiling decision, validated through SM-18)

- **F15 — Admin Queue Dashboard + audit log** (5)
  - Addresses Ayaat Want #2 (provider health at a glance) and Fear #1 (acute-event runbook gap)
  - The daily entry point for the solo operator; without it, every acute-event response and dispute investigation starts from improvisation
  - Anchored to FR-32, FR-34, FR-35, FR-37 · SM-16 (Admin Intervention Rate) · SM-17 (% of Bookings Completed Without Any Admin Touch)

### Must Have MVP — Launch-Blocking Substrate (4 features)

Primary scored HIGH (5) on each, but their rationale is structural rather than transformational. Without them, no UJ works — but they do not move the moat on their own. They are the substrate the Primary-tier Must Haves run on.

- **F9 — Booking lifecycle + capture-on-confirmation** (6)
  - The eight-step lifecycle is the operational substrate for UJ-1, UJ-4, and UJ-3's admin views
  - Anchored to FR-1, FR-15, FR-16, FR-18, FR-19

- **F11 — Report-an-Issue + Admin investigation** (6)
  - Companion surface to Bibi Fear #1 (acute-event mishandled) and the dispute-window discipline
  - Anchored to FR-24, FR-25 · SM-12 (Issue-Report Rate)

- **F16 — Payments + Payout + Refund mechanics** (6)
  - Capture-on-confirmation, MFS-first rails (bKash, Nagad), Platform Commission deduction, Payout mechanics, Refund on Report Resolution
  - Driven by the Bangladesh payment-gateway landscape — without it, no revenue or trust claim is real
  - Anchored to FR-39, FR-40, FR-41, FR-42 · R-13 (Payment-gateway reconciliation)

- **F18 — Bilingual surface (Bangla + English)** (6)
  - Brief §7 cannot-be-skipped item — Bangla-first customer-facing content is launch-blocking
  - Anchored to FR-47 (Bangla + English parity on Owner and Provider surfaces)

### Consider for MVP (3 features)

These features support the moat without being headline drivers. They earn their place if MVP scope allows; otherwise they go to Phase 2.

- **F10 — Structured Decline with reason taxonomy** (7)
  - Routing-data layer that reads whether the matching is correct · SM-7
  - Without it, decline-reason distribution is opaque; with it, Ayaat can act on misrouting signals
  - Anchored to FR-17

- **F17 — Vet-Clinic Directory (per Launch Neighborhood)** (7)
  - Runbook companion surface — accessed during acute events for incident-time lookup
  - Anchored to FR-45

- **F8 — Provider Profile + Admin-introduced badge** (6)
  - The public surface where Rashid's Care-record credit accumulates
  - Anchored to FR-5
  - *Note: F8 is partially delivered via F5 (Verified Reviews with photos) and F7 (Tier-A Admin-introduced badge) — the standalone feature may be reconsidered if F5 + F7 cover the public-profile surface*

### Defer (Phase 2+ Roadmap)

- **Demonstrated-Care-Fit Ranking Improvements** — Phase 2 post-v1 (per Brief §10 / PRD §10 A-X). Replace capability-and-tier baseline with signals that consume the v1 data layer.
- **Multi-Admin RBAC** — Phase 3, when Admin Load trends toward the 1/25/75 ceiling breach (per PRD §11 A-13).
- **Geographic Expansion beyond Gulshan, Banani, Baridhara** — Phase 4, gated on SM-14 (Launch Neighborhood Density) validating (per FR-13).
- **Daily-Home-Visit Service** — Phase 5, currently a v2 deferred item per Brief §5 cannot-be-skipped items (boarding-only at v1).
- **Cats-and-Dogs-Plus Expansion** — Phase 6 (birds, fish, small mammals, reptiles explicitly deferred per Brief §5).
- **City-Wide & National Expansion** — Phase 7, explicitly out of v1 scope per Brief §5.

---

## Strategic Implications

### 1. The Must-Have cluster is dominated by Bibi's headline wants/fears
F1 (Runbook), F2 (Care History), F3 (Curated shortlist), F4 (Capacity), F5 (Reviews with photos), F6 (Daily Updates), F7 (Tier-A/B), F12 (On-Platform Repeat Value) — together these 8 features address the curated-trust moat's headline mechanism. Removing any one breaks the moat's compounding logic.

### 2. The Substrate cluster carries the binding constraint
F9 (lifecycle), F11 (Report), F16 (Payments), F18 (Bilingual) each score 6 because Primary scored HIGH on them — but their rationale is structural. They must exist for the headline cluster to work, but they do not on their own move the moat. This is the Brief §7 cannot-be-skipped discipline: substrate items are launch-blocking but not transformational.

### 3. The Operational Constraint cluster protects against scaling failure
F14 (Operating Ceiling) and F15 (Queue Dashboard) score 5 strictly by formula, but their absence makes every other Must-Have unreliable under volume. This is the Secondary Objective 2 binding constraint. Ayaat's discipline at the 1/25/75 ceiling is what keeps the Primary-tier Must Haves real.

### 4. The Shared Cross-Group Driver (Off-Platform Defection) earns its own row
F13 scores 9 because Off-Platform Defection appears from three different angles. Mitigating it closes the loop on all three personas. This is the rare feature where one surface addresses all three driving forces simultaneously — exactly why it earned promotion from per-persona fear to shared cross-group driver in workshop 4.

### 5. The Consider cluster can be sequenced flexibly
F10 (Structured Decline), F17 (Vet-Clinic Directory), and F8 (Provider Profile) are supporting surfaces. They earn their place if MVP scope allows, but their absence does not break the moat. F8 is partially redundant with F5 + F7 and may be reconsidered.

### 6. The roadmap phases are downstream of the Must-Have cluster, not parallel
The 7 future phases (Demonstrated-Care-Fit Ranking → Multi-Admin RBAC → Geographic Expansion → Daily Visits → Species+ Expansion → City-Wide) are downstream of v1. None of them should enter MVP scope without an explicit brief re-open.

---

## Questions for Designer

1. **How should the curated shortlist surface communicate demonstrated-care-fit vs capability at launch?** The v1 ranking is capability-and-tier baseline; demonstrated-care-fit ranking is Phase 2. The UX must communicate this honestly — without overpromising signals that won't actually surface in the ranking.

2. **How does the "Book again" path surface the Care History pre-fill latency?** UJ-4's climax is median time under four minutes. The design must visibly signal "your care history is pre-filling" rather than re-asking Tito's insulin schedule.

3. **How does the Acute Event Runbook surface on the Owner side without creating panic?** The Runbook is launch-blocking (R-10), but the Owner-facing surface must communicate "the platform has a documented response" without making Owners expect acute events as the default.

4. **How does the Off-Platform Defection detection surface without becoming surveillance?** FR-50 captures soft signals; FR-36 surfaces them to Ayaat. The Owner-facing surface must communicate "staying on-platform is structurally more valuable" rather than "we are watching your WhatsApp."

5. **How does the Queue Dashboard surface prioritize in urgency order without overwhelming Ayaat?** FR-32 sorts by urgency: Acute Events first, Reports-in-progress next, Confirmations next, In-Stay bulk. The UX must keep this ordering under stress — Eid-week at the ceiling with 18 active providers, 52 bookings, 4 disputes, 1 acute event.

---

## Related Documents

- **[00-trigger-map.md](00-trigger-map.md)** — Visual overview and navigation
- **[01-Business-Goals.md](01-Business-Goals.md)** — Vision, 3-tier objectives, flywheel
- **[02-Bibi-the-Banani-Booker.md](02-Bibi-the-Banani-Booker.md)** — ⭐ Primary persona (Owner)
- **[03-Rashid-the-Reliable-Reliant.md](03-Rashid-the-Reliable-Reliant.md)** — 🔧 Secondary persona (Provider)
- **[04-Ayaat-the-Admin-Operator.md](04-Ayaat-the-Admin-Operator.md)** — 🏠 Tertiary persona (solo Admin)
- **[05-Key-Insights.md](05-Key-Insights.md)** — Strategic implications, emotional transformation, dev-phase mapping

---

_Generated with the Whiteport Design Studio framework._
_Strategic input for Phase 4: UX Design and Phase 6: PRD/Development._
