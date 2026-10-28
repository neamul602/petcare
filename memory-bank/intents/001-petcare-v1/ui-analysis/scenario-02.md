# UI Analysis - Scenario 02: Bibi's Second Booking - The Moat Proof

Sources read in full: `docs/scenarios/02-bibis-second-booking-the-moat-proof/` scenario .md, `2.1` and `2.2` outline (.md) and spec (.spec.md), `_validation-report.md` (first 120 lines plus grep of the remainder); mockups `docs/ux/mockups/21-care-history-view.html` and `22-book-again-path.html`; PRD cross-check against `memory-bank/intents/001-petcare-v1/requirements.md`, `intent.md` and `docs/prd.md` (SM-15 only).

Conventions: "spec" = `.spec.md` (validated 2026-08-31); "outline" = the page `.md` (status `outlined`); "mockup" = HTML file. Where they conflict the spec wins (per brief) and the conflict is listed in section 14 of each page. "(inferred)" marks my inference, not a source statement. DESIGN.md and EXPERIENCE.md were not read; token names are quoted as the specs cite them.

Scenario-level facts: scenario status `validated`, design_status `complete`, 2 pages, persona Bibi (Owner), mobile PWA on mid-range Android, SM-15 climax, anchors FR-7, FR-8, FR-10, FR-48 (spec also FR-49), SM-15, SM-2. Scenario frontmatter carries a stale `pages: [8, 15]` that conflicts with `pages_assigned: 2` (validation report flags it, cosmetic).

---

# PAGE 2.1 - Pet Care History View

## 1. Identity
| Field | Value |
|---|---|
| Page ID | 2.1 |
| Name | Pet Care History View ("Tito's care") |
| Role | Owner |
| Route | `/pets/:petId/care-history`, SSR "for link-shareability", deep-linkable from Owner dashboard (spec, URL & Routing) |
| Mockup | `21-care-history-view.html` |
| Spec status | `validated · 2026-08-31 · WDS Phase 4 [V]` (outline status: `outlined`). Validation: PASS with warnings (house-style section order, no Object Registry H2) |
| Entry points | Owner dashboard recent-booking card; pet-card quick-link; direct deep link. Prefetch of care-history query on recent-booking-card hover/intersection |

## 2. Purpose
Show the pet's platform-owned accumulated care history and past stays (visible proof of FR-7/FR-10) and make "Book again with {provider}" the primary action that starts the SM-15 clock (PRD: FR-48, UJ-4).

## 3. UI components (names as in spec)
- `a.back-nav` (colour `{colors.muted-foreground}`), `<header>` with pet name as `<h1>`.
- `.pet-header` = `{card.muted}` (rounded-lg, 4-col: thumb / name / meta / Edit link); `button.variant.link` for Edit; 1:1 `rounded-md` thumbnail.
- `.condition-chip` = `{badge.warning-soft}` (DESIGN.md `badge.variants.warning` repurposed as medical flag), text "Diabetic".
- Quick-stats row: `text-sm text-muted-foreground tabular`, dot-separated.
- `.care-history-section` x6 = `{card.muted}` `<details>/<summary>` collapsible (Active conditions, Active medications, Diet, Allergies, Anxiety triggers, Vet contact).
- `.vet-contact` row, `tel:` link.
- `.past-booking-card` = `{card.elevated}` `<article>`; `.photo-thumb` 4-up 1:1 grid (`<ul>/<li>`, `{rounded.md}`); `.review-snippet` `{typography.editorial}` (serif) 2-line clamp with "Read full review"; `.booking-state-chip` = `{booking-state.completed}` combined with star rating.
- `button.primary size.md` inline CTA in the card; `{sticky-action-bar}` with primary CTA + two `{button.variant.link}` `.alt-path-link` links.
- State 5: `{badge.decline}` decline-reason chip. State 3: pet selector (component not named).
- Planned DS token reuse: `provider-card.standard` (past-booking card), `sticky-action-bar`, `booking-state.completed`.

## 4. User actions
| Action | Result |
|---|---|
| Tap back "← Dashboard" | Owner dashboard, dashboard context preserved |
| Tap "Edit" / "Edit profile" (`aria-label="Edit Tito's profile"`) | Opens pet profile editor 1.5 in edit mode |
| Tap care-history section header | Collapse/expand; `aria-expanded`; state persisted per visit in localStorage; Vet contact is always expanded (not collapsible) |
| Tap vet phone | `tel:` call (single-tap to call) |
| Tap photo thumb | Full-screen viewer (lazy-loaded thumbs) |
| Tap "Read full review" | Expands review text |
| Tap past-booking card (body) | Booking detail - out of scope for scenario 02 |
| Tap inline or sticky "Book again with {provider}" | 2.2 with provider prefilled (`petId`, `providerId`) |
| Tap "Book with another proven provider" | 2.2 with provider-selector open (State 2 of 2.2) |
| Tap "Book Tito at a new stay" | 1.3 Curated Shortlist with Tito pre-attached |
| Pet selector (multi-pet only) | Switches active pet; history and sticky CTA label re-render |
| Empty state CTA "Find care for Tito" | 1.3 |

## 5. Application states
| State | Trigger | Behaviour |
|---|---|---|
| 1 Default (post-Eid) | Load with >=1 completed booking | Eid stay card, "Book again with Rashid" prominent, quick-stats "1 booking" |
| 2 Pre-Eid / first-time, empty history | No past bookings | Placeholder copy "No bookings yet - Tito's first stay will appear here"; quick-stats hidden; primary CTA becomes "Find care for Tito" -> 1.3. PRD FR-7: "Empty state says 'first stay' with no fake content" |
| 3 Multi-pet household | >1 pet | Pet selector at top; per-pet history; sticky CTA label updates |
| 4 Provider no longer available | Provider paused/suspended by Admin | Inline card warning "{provider} is currently not accepting bookings"; "Book again with {provider}" hidden; "Book with another proven provider" promoted to `button.primary`; `role="status"` announcement |
| 5 Care-history sparse (first booking declined) | First booking declined | Card shows "Declined" with `{badge.decline}` reason chip; CTA "Book with a different provider"; no sticky "Book again" |
| Loading | Not specified (SSR + prefetch implied) | GAP |
| Error / offline | Not specified | GAP (PRD DR-10 / NFR-15 intermittent 4G apply) |
| Success | n/a (read page) | - |
Mockup shows only State 1.

## 6. Data displayed
| Field | Source entity | Notes |
|---|---|---|
| Pet thumbnail, name, breed, age, weight | Pet | Spec sample: Shih Tzu, 4 yrs, 7 kg |
| Condition chip "Diabetic" | Pet (medical conditions) | Mockup adds ANXIETY and SENIOR chips |
| Quick-stats: Bookings N, Reviews N, Days in care N, Avg stay rating X | Derived from Booking/Review (aggregate) | Definition of "Days in care" not given |
| Active conditions with duration ("Diabetes (8 months)") | Care history / Pet | Duration source unspecified |
| Active medications ("Insulin - 2 units BID") | Care history (care configuration) | |
| Diet ("Low-carb kibble - 2 meals/day", "vet-approved diabetic treats only") | Care history | |
| Allergies ("None known" when empty) | Care history | Spec: no blank sections when history exists |
| Anxiety triggers | Care history | |
| Vet contact (name, clinic, phone) | Pet/Care history | `Dr. [Name]`, `+880-XXX-XXXX` placeholders |
| Past booking: stay title, date range, nights, Booking State chip, rating | Booking, Review | "Eid-1 -> Eid+9 - 9 nights" |
| Photo grid (4) | Review/stay photos (outline: "Bibi's uploads") | Photo storage |
| Review snippet (truncated 2 lines) | Review (verified) | |
| Provider name for CTA label | Provider (most recent) | Dynamic, not generic |
| Decline reason (State 5) | Booking decline record (FR-17 taxonomy; outline cites FR-24, see gaps) | |

## 7. Data required / captured
None captured on this page (read-only). Client-side only: collapse/expand state per section (localStorage). Navigation parameters passed onward: `petId`, `providerId`, intent (same provider / different provider).

## 8. State transitions and navigation
- No booking, pet or payment state changes on this page.
- Outbound: 2.2 (same provider) with `/bookings/book-again?petId=&providerId=`; 2.2 with provider-selector open; 1.3 shortlist with pet pre-attached; 1.5 edit mode; booking detail (out of scope); Owner dashboard.
- The SM-15 clock: PRD FR-48/SM-15 measure from the "Book again" tap; the spec's timer starts on 2.2 page load (see 11).

## 9. Validation behaviour
None (no inputs). Rule-like constraints: every care-history section must show a value or "None known" (no blank sections when history exists); no fake content in empty state; "Vet contact" never collapsed.

## 10. Integration points
- Photo storage: lazy-loaded thumbs, full-screen viewer (FR-21 review photos).
- No SMS/OTP, payment gateway, MFS payout or notifications triggered here (session assumed authenticated via phone OTP, DR-1; inferred).
- Backend read: care history query (prefetched), per-pet; shown only to owning owner (NFR-10, DR-3).
- `tel:` handoff to device dialler.

## 11. Business rules embedded
- Primary CTA label is dynamic: "Book again with {most-recent providerName}", not generic.
- Past bookings ordered most-recent first.
- Review snippet truncated to 2 lines + "..." + "Read full review".
- Provider-rank / tier badge only if the provider is Tier-A ("tier-marking only on Tier-A").
- Must NOT: "Export your data" CTA beyond a GDPR-style request; top-level "Delete pet profile" (soft delete via Settings only); upsells (no PetCare+ in v1); urgency-bait ("Rashid's calendar fills up fast!"); blank sections; fake data.
- Vet contact always expanded and tap-to-call (Bibi Fear #1 mitigation).
- Care history is platform-owned, not provider-owned (FR-10; retention >= 24 months in PRD).
- Tap targets >= 48px, 8-grid baseline; quick-stats use tabular numerals.
- "Book with another proven provider" = list "filtered ... providers who have handled similar cases" (outline); 2.2 spec: "Diabetes + small breed".

## 12. Bangla / English
Bilingual content blocks provided (EN / BN) for: page title ("Tito's care" / "টিটোর যত্ন"), quick-stats row (`বুকিং {N} · রিভিউ {N} · যত্নে দিন {N} · গড় রেটিং {X}`), all six section titles, "Recent bookings" (সাম্প্রতিক বুকিং), sticky primary CTA (`{providerName}-এর সাথে আবার বুক করুন`), both alt CTAs, "Edit profile" (প্রোফাইল সম্পাদনা), empty state, "Find care for Tito" (টিটোর জন্য যত্ন খুঁজুন), provider-unavailable.
- Missing BN copy: "Completed" chip, "Diabetic" chip, "Declined" / "Book with a different provider" (State 5), "Read full review", "None known", "Your first stay will..." variants, photo alt text, aria-labels (spec aria-labels are EN only), pet selector label, State 4 `role="status"` text. Review text is user-generated (language as written; inferred).
- Number/date/currency formatting not specified (Bangla digits, "Eid-1 -> Eid+9" date format, how Eid-relative labels render). No Bangla font specified; mockup uses Inter + Source Serif 4 (inferred: neither covers Bangla glyphs, fallback font needed).
- Provider and pet names in BN appear only as hard-coded "টিটো" in strings; `{providerName}` suffix `-এর` assumes transliteration availability (inferred).
- NFR-12: Bangla default with English parity applies to owner surfaces.

## 13. Assumptions the design makes
- Care history already exists from a completed first stay (post-Eid) and Rashid is the "most-recent provider".
- Owner has one pet by default; multi-pet handled by a selector.
- Care history is derived/accumulated from the intake of each stay and edits; a review with photos exists.
- Admin can pause/suspend a provider and the page learns this at load.
- Rashid is Tier-A (page must not show tier badge otherwise).
- SSR route is accessible when the owner is authenticated (inferred).

## 14. Questions the design cannot answer / conflicts
1. **Spec vs mockup conflicts (spec wins):** mockup pet = "7 yrs - 5.2 kg" with chips DIABETIC/ANXIETY/SENIOR (spec: 4 yrs, 7 kg, single "Diabetic"); mockup quick-stats = "3 prior stays - 1 provider - 27 days on platform" (spec: Bookings 1, Reviews 1, Days in care 9, Avg 5.0); mockup shows only 4 care sections (Insulin schedule, Diet, Anxiety, Vet contact) with different content (Caninsulin, Hill's w/d, vacuum/TV/blanket, Dr. Rahman) vs spec 6 sections (adds Active conditions, Allergies; "Active medications" not "Insulin schedule"); mockup Vet contact is collapsed by default (spec: always expanded); mockup past stay "28 Mar - 5 Apr 2026 - 8 nights" with BDT 6,300 (spec: Eid-1 -> Eid+9, 9 nights, 4 photos, no price); mockup has no photo grid, no Read full review link, no inline card CTA, no "Book Tito at a new stay", no pet selector, no Edit in the header card (Edit in top bar); mockup back label "Pets" (spec "Dashboard"); mockup bar shows "Last stay - Rashid - BDT 6,300 - 8 nights" with "Book again" + "Different provider" (spec: "Book again with Rashid" + two link CTAs, labels "Book with another proven provider").
2. Outline vs spec label drift: outline secondary "Book again with another provider" in one place, "Book with another proven provider" in another; spec uses the latter.
3. Outline says decline reason is "FR-24"; PRD FR-24 is the owner dispute report; structured decline is FR-17 (records reason on care history).
4. "Proven provider" filter by similar handled cases uses care-fit data; PRD NFR-26 / DR-6 say care-fit is captured but not used for ranking, FR-11 shortlist ranked by tier, density, capacity only. Is this filter/ordering allowed? Order within the "proven" list unspecified.
5. Eid date labels ("Eid-1 -> Eid+9") vs "9 nights" and "Days in care 9": Eid-1 to Eid+9 spans 10 nights if inclusive of both; arithmetic and display of Eid-relative dates for a real calendar undefined.
6. Care history in outline includes "the insulin log from the stay" but the spec has no log/timeline display; unclear whether provider daily updates feed care history.
7. How are "Active conditions duration (8 months)" and "Days in care" computed; what counts as "Avg stay rating" with 0 reviews.
8. Does a completed-but-unreviewed or disputed/refunded stay appear? Which booking states show here (only Completed and Declined are specified; FR-14 has 8+ states).
9. PRD FR-10 retention (24 months, admin-readable, recoverable by identity verification) is not reflected; spec forbids "export" CTA but GDPR-style request path is unspecified (OQ-19 legal).
10. Loading, error, offline states absent (NFR-15, DR-10). SSR of owner-private data for "link-shareability" conflicts with NFR-10/DR-3 (owners see only their own) - who can a shared link open for? (inferred concern).
11. Edit profile destination "1.5 edit mode" - 1.5 not in scope; whether editing here retroactively changes past stays' snapshots is undefined (FR-7 says confirmed stay holds a configuration snapshot).
12. Which pet does the page open for in a multi-pet household when entered from the recent-booking card (pet of that booking, inferred).

---

# PAGE 2.2 - Book Again Path (Pre-filled Intake)

## 1. Identity
| Field | Value |
|---|---|
| Page ID | 2.2 |
| Name | Book Again Path (Pre-filled Intake); h1 "Book Tito with Rashid again" |
| Role | Owner |
| Route | `/bookings/book-again?petId=&providerId=` (deep-linkable with prefilled context) |
| Mockup | `22-book-again-path.html` |
| Spec status | `validated · 2026-08-31 · WDS Phase 4 [V]` (outline `outlined`). Validation: PASS; one cosmetic warning on `size.lg` vs DESIGN "md or lg"; `toggle.primary-soft` flagged NOT yet defined in DESIGN.md |
| Scenario role | THE SM-15 climax page |

## 2. Purpose
Single-screen intake with all care-history fields pre-filled so the owner changes only stay-specific details (dates, new note) and submits a booking request in under 4 minutes (SM-15; FR-8, FR-48).

## 3. UI components
- `a.back-nav` to 2.1; `<header>` + `{typography.editorial}` 24px h1.
- `.elapsed-timer` pill: `{success-soft}` under 4 min, `{muted}` otherwise; `role="timer" aria-live="off"`.
- `.prefill-context` = `{card.muted}` with `<dl>`: Provider line (with `{tier-a-badge}` and demonstrated-Fit snippet), Pet line (medical flag + routine), Dates line with "change" link.
- `.care-history-section` collapsible `<details>` x5 with `.use-saved-toggle` (`{toggle.primary-soft}`, `role="switch"`), `.override-input` (`{input.text}`), `.edited-chip` (`{badge.neutral}`).
- `.new-note-input` (`{input.textarea}`), `.time-picker` (native `<input type="time">`), date picker (component unnamed; opened from "change").
- `.price-summary` (`{card.muted}`, tabular) and `.auth-hold-note` (`{info-soft}`, `role="note"`).
- `{sticky-action-bar}`: `button.submit-request` (`{button.primary, size.lg}`, full width) + `button.save-draft` (`{button.variant.link}`).
- Provider-selector step (State 2/3; component unnamed). Warning banner (State 3). Toast (success). Overflow menu (holds "Start over").

## 4. User actions
| Action | Result |
|---|---|
| Back "← Tito's care history" | Returns to 2.1, prefill context preserved |
| Tap "change" on Dates | Opens date picker; price recalculates (inferred from State 3 "price recalculates") |
| Toggle "Use saved" OFF in a section | Shows override input/textarea; "edited" chip appears when value diverges from saved |
| Toggle "Use saved" ON | Display-only saved value; input hidden (`aria-hidden`) |
| Edit "Additional services" toggles | Photo updates pre-selected; Daily walk, Bath at end of stay unselected; selected services "not pre-charged" |
| Edit "Special instructions" free text | Editable pre-filled text; "[edited]" marker |
| Type "New note for this stay" | Free text, auto-saves on blur to local draft |
| Change "Pickup time" | Native time input, defaults to last stay's pickup time |
| Provider selector (different-provider path) | Curated list of proven providers; selecting returns to State 1 with that provider's data |
| "Save as draft" | Routes to Owner dashboard with toast |
| "Submit booking request" | POST /api/bookings -> payment authorization step (1.7-equivalent); timer freezes with check; toast "Booking request sent to Rashid - {M} min {S} sec" |
| Overflow menu "Start over" | Only place "Start over" exists (not at top) |
Outline also lists "tap any pre-filled field opens inline editor" - the spec replaced this with toggle-then-edit (display-only when toggle ON). Spec wins.

## 5. Application states
| State | Trigger | Behaviour |
|---|---|---|
| 1 Default pre-filled | Load | All sections "Use saved" ON, overrides hidden, dates editable |
| 2 Different-provider path | From 2.1 "Book with another proven provider" | Provider-selector at top; list filtered to providers who handled Tito's case (Diabetes + small breed); selection returns to State 1 |
| 3 Capacity conflict | Backend returns **409 on prefill fetch** | Warning banner "Rashid unavailable for these dates - see alternatives"; selector opens; price recalculates |
| 4 Pre-filled but edited | Any field changed | "Edited from saved care history" / `edited` chip per section; on success the edited value writes back to care history |
| 5 Submit-success | Submit | Routes to payment authorization; timer frozen with check; toast; `<section role="status" aria-live="polite">` announces |
| Elapsed-time variants | live | <4 min: "{M} min {S} sec - faster than your first ✓" (success-soft); 4-6 min: "{M} min - your second booking is faster than your first" (muted); >6 min: "{M} min - take your time" (muted, no penalty) |
| Submit disabled | Required fields invalid | See 9 |
| Empty care history | Care history genuinely empty | "No fake pre-fill: render placeholder copy, not placeholder data" (spec); layout for this not drawn |
| Loading, generic error, offline, payment failure | Not specified | GAP (PRD DR-9, DR-10, NFR-15) |
Mockup shows only State 1 with Instructions toggled OFF to demonstrate the edited chip.

## 6. Data displayed
| Field | Source entity |
|---|---|
| Provider name, neighbourhood ("Gulshan"), Tier-A badge | Provider |
| Demonstrated-Fit snippet ("12 diabetic small dogs handled") (outline also "4.9★", "successfully") | Provider aggregate (derived) |
| Pet name, medical flag (Diabetic), routine (Insulin BID) | Pet / Care history |
| Default dates, nights ("Fri 14 Mar 4pm -> Mon 17 Mar 10am", 3 nights) | Booking draft |
| Saved food ("low-carb kibble - 2x/day"), medication ("Insulin - 2 units BID"), anxiety triggers ("loud fireworks - larger dogs"), special instructions text (blanket), additional services selected last stay | Care configuration snapshot of last successful stay |
| Pickup time (default from last stay) | Last booking |
| Base price: nightly rate x nights ("BDT 2,200 x 3 = BDT 6,600"); additional services BDT 0; total authorization hold | Provider rate, Booking |
| Elapsed time | Client timer |
| Eid note on anxiety triggers ("Eid fireworks are over; check for any other triggers" in outline; "Eid over - anything else for this stay?" in spec) | Static copy (see gaps) |

## 7. Data required / captured
| Field | Type | Required | Options / default |
|---|---|---|---|
| Provider | id (selector) | Yes | Default = last provider; alternatives from proven list |
| Date range (check-in/out) | date range via picker | Yes | Default Fri -> Mon (spec), 3 nights |
| Food for this stay | toggle (use saved) + text override | One of food/medication "use-saved confirmed or override" must be satisfied | Saved value |
| Medication | toggle + text override | as above | Saved |
| Additional services | multi toggles | Optional | Daily photo updates (pre-selected), Daily walk, Bath at end of stay. Full catalogue not specified |
| Special instructions | free text, pre-filled | Optional (inferred) | Saved text |
| Anxiety triggers | toggle + text override | (inferred optional) | Saved |
| New note for this stay | textarea, no pre-fill | Optional (inferred) | Placeholder "Anything specific for this stay - favorite toys, anxiety triggers, the blanket Tito sleeps with" |
| Pickup time | time | Yes (inferred; defaulted) | Last stay value |
| Draft | local draft of the form | - | Auto-save on blur (new note) |
Not on the spec screen (but PRD FR-15 requires): payment method selection, pet snapshot confirmation, vet contact re-confirm (spec says vet contact is "re-confirmable on submit" in trigger-map text only; layout has no vet row; mockup has a Vet contact toggle). Allergies is a FR-8 pre-fill field but absent from the 2.2 spec layout.

## 8. State transitions and navigation
- Submit: creates a Booking request (PRD FR-15: request with pet snapshot, care configuration, dates, payment method; submission places an authorization, not a capture; booking goes to `requested` then `authorized` per FR-14, DR-8 slot race). Routing: -> payment authorization step (1.7-equivalent). Spec says routing must preserve the elapsed-time context (no reset).
- Success write-back: edited sections "write back to care history on success" (State 4). "Success" = submit vs authorization vs provider confirmation is not defined.
- Save as draft: stores draft (entity unspecified), -> Owner dashboard + toast.
- Back -> 2.1. Provider selection -> stays on 2.2.
- Downstream (not in scope): Provider confirm/decline within confirmation window (FR-16/FR-17), capture on confirm (FR-39).

## 9. Validation behaviour
- Submit disabled "until minimum required fields validated (dates, at least one of food/medication override or use-saved confirmed)". No specific error messages are written.
- No blank fields when care history exists (every section value or "None known").
- Date availability: 409 on prefill fetch if provider cannot cover the dates (capacity per night, FR-12). Behaviour when dates are changed after load (re-check) not specified; submit-time race (DR-8) not shown.
- Timing: inline (toggle/edit immediate), new note autosaves on blur; no field-level error copy specified.

## 10. Integration points
- Backend: GET `/api/pets/:petId/care-history` returns the full intake pre-filled server-side (spec wording "request payload"; read as response, inferred); POST `/api/bookings` with the full intake payload; no polling.
- Payment gateway: submit hands off to authorization step (hold, "not charged"). Mockup names bKash; spec names no method. PetCare handles tokens only (NFR-9). bKash/Nagad primary (FR-40).
- Notifications: submit-success toast is in-app; provider notification of the request implied (toast says request "sent to Rashid"); channel unspecified.
- Analytics: "backend logs elapsed time for analytics" for SM-15 verification (Next Steps) - needs client-reported or server-derived elapsed value.
- Local storage: draft, collapsible state.
- No SMS/OTP; no MFS payout; no photo storage on this page.

## 11. Business rules embedded
- **SM-15 target: under 4 minutes.** Spec: timer is "elapsed time since the page loaded" (client-side, ticks every second); freezes on submit; backend logs elapsed time. Outline: "shows elapsed time since the page loaded". PRD (FR-48, SM-15): measured from the "Book again" tap to submission of the booking request, in-app. **Measurement start differs** (2.2 page load vs 2.1 tap), and the end differs (spec: Submit tap/POST; PRD FR-48: "confirmation request submitted"; scenario text: "submits"). Whether the payment authorization step is inside the clock is open (spec asks to preserve elapsed context through 1.7-equivalent but the timer "freezes" at submit).
- Thresholds: <4 min success-soft; 4-6 min muted; >6 min muted ("no penalty"; "the user may have edited more"). Outline: 4-6 "Neutral". SM-15 itself is a median across users (PRD), whereas the UI evaluates per submission.
- Comparison claim "faster than your first booking" in the <4 and 4-6 bands; outline hard-codes "Under your first booking's 9 min" and scenario text says first booking took 8 pages and 9 minutes. The first-booking time is therefore a stored per-owner metric that the design assumes exists (inferred).
- Pricing: base = nightly rate x nights; additional services priced at BDT 0 here because "pre-selected, not pre-charged"; total = authorization hold; "authorized, not charged" language, `{info-soft}` callout discipline same as 1.7. No surge/dynamic commission (NFR-25).
- Capacity: provider unavailability -> 409; price recalculates on provider change.
- Must NOT: blank fields when history exists; re-typing the insulin curve; "Start over" at top (overflow menu only); pre-charged upsells; urgency-bait ("Submit now to lock in these dates!"); gamification/ranking via the timer (reassurance only); fake pre-fill (placeholder copy, not placeholder data).
- Pre-fill rules (PRD FR-8): marked "from care history", editable/clearable/acceptable per field, no cross-pet pre-fill.
- Auto-save new note to local draft on blur; "Save as draft" returns to dashboard.
- Pickup time defaults to last stay's value (spec) while date range defaults to Fri->Mon ("Bibi adjusts from defaults").
- Tap targets >= 48px; sticky bar respects safe-area inset.

## 12. Bangla / English
BN provided for: h1 (`টিটোকে রশিদের সাথে আবার বুক করুন`), three elapsed-indicator variants (`{M} মিনিট {S} সেকেন্ড · আপনার প্রথম বুকিংয়ের চেয়ে দ্রুত ✓`, etc.), "Pre-filled from Tito's last stay" header, section labels (Dates, Food, Medication, Additional services, Special instructions, Anxiety triggers), toggle labels (সংরক্ষিত ব্যবহার / ওভাররাইড), edited chip (সম্পাদিত), new-note label and placeholder, pickup time label, authorization note (`আপনার অ্যাকাউন্টে BDT {X} অনুমোদিত হবে, চার্জ নয়`), CTAs, capacity warning, success toast.
- Currency is written "BDT {X}" in both languages (no ৳ symbol, no Bangla digits specified). Time as "{M} মিনিট {S} সেকেন্ড" (digits not specified). Dates "Fri 14 Mar 4pm" in EN only; BN date/time formatting unspecified.
- Not in BN table: "Provider/Pet/Default dates" prefill-context labels, "Use saved (value)" composite lines, "Edited from saved care history", "Save as draft" toast text, "Rashid unavailable..." covered, "Pickup... Friday 4pm", "None known", overflow menu/Start over, Tier-A badge text, "12 diabetic small dogs handled", nights/pricing breakdown "{N} nights × BDT {X}", date picker, the provider-selector copy, validation errors, `aria-label`s (EN only).
- Hard-coded BN strings embed "টিটো" and "রশিদ" in h1/toast, but spec shows `{providerName}` on 2.1 only; need transliterated provider/pet name strategy (inferred).
- Fonts: spec uses `{typography.editorial}` (mockup: Source Serif 4; body Inter); no Bangla typeface specified (inferred gap).
- NFR-12 parity; authorization wording must remain accurate in both languages.

## 13. Assumptions the design makes
- Last successful configuration exists and maps cleanly to every current intake field; owner mostly accepts it.
- The first booking's elapsed time (9 min) is known and comparable; first booking was 8 pages.
- Owner already has a saved/usable payment method (no method picker on this screen) (inferred).
- Default Fri->Mon dates and last-stay pickup time are acceptable starting values; there's a single "pickup time" for the whole stay.
- Provider has rate (BDT 2,200/night) and capacity for the dates; Eid-peak rates (if any) do not carry over.
- Pet profile (insulin, vet) is still accurate despite 4 weeks passing.
- The provider-selector inside 2.2 reuses the same curated list as 2.1's "proven" CTA.
- Online at submit; local draft covers short offline stretches (inferred).

## 14. Questions the design cannot answer / conflicts
1. **Spec vs mockup:** mockup h1 "Book again" + sub-copy ("Tito's care is pre-filled from his last stay. Adjust dates, save time.") vs spec h1 "Book Tito with Rashid again" with elapsed indicator copy "2 min 15 sec - faster than your first ✓"; mockup timer is `mm:ss` ("01:12 · under target") vs spec "{M} min {S} sec"; mockup prefill rows differ: 5 toggles (Insulin schedule, Diet, Anxiety triggers, Vet contact, Instructions) vs spec 5 sections (Food, Medication, Additional services, Special instructions, Anxiety triggers) plus Dates, New note, Pickup time that the mockup lacks; mockup has no Additional services, New note, Pickup time, price breakdown, date "change" link or elapsed-time on freeze; mockup dates "28 Sep - 5 Oct 2026 - 7 nights" and total "BDT 6,300" (spec Fri 14 Mar -> Mon 17 Mar, 3 nights, BDT 6,600; 6,300/7 = 900/night, not 2,200); mockup shows "Rashid · Gulshan · TIER-A · 12 diabetic small dogs handled · Profile" with "Different provider" header link (spec provider-selector appears only on the different-provider path/409); mockup callout says authorization is "on your bKash" and "Rashid ... confirms or declines within 24 hours" (24h appears nowhere in the spec; PRD confirmation window value is OQ-1); mockup "Save draft" vs "Save as draft"; mockup has instructions text "Tito's settling in better this time..." vs spec blanket text; mockup has "5 of 5 saved" header, spec no such counter.
2. **SM-15 clock start/end mismatch** with PRD (see 11). Also whether a reload, backgrounded tab, resumed draft, or the offline hold resets/excludes time; client timer vs server-trusted measurement.
3. The timer area is described three ways: under h1 as a pill (layout, D2), "corner of the sticky CTA" (outline), and frozen-with-check after submit. Layout shows "2 min 15 sec" text before submit while D2 says "faster than your first ✓" appears after submit.
4. "Faster than your first booking" is displayed in 4-6 band without checking the claim; first-booking time must exist and be real (trust risk). For owners whose first booking was faster, or who have no stored time, behaviour undefined.
5. Date example "Fri 14 Mar ... Mon 17 Mar" is a fixed past/other-year date (14 Mar 2026 is a Saturday; scenario context is a post-Eid weekend, "4 weeks" later); real default-date logic (next Friday?) is undefined. Min/max nights, past-date blocking, blackout/peak dates not specified.
6. FR-8 says fields must be visibly marked "from care history"; spec uses "Use saved (value)" and "edited" chip - is "Use saved" sufficient? PRD FR-8 also lists allergy and "special attention" as pre-fill fields; allergy is absent here. PRD FR-48 says pre-fill includes "dates template", "pet profile" and prior instructions as editable text; dates template vs fixed Fri->Mon default undefined.
7. Spec State 4 writes edited values back to care history "on success": which fields (new note excluded? salmon reaction as an allergy?), what if booking is declined/timed out, and can the owner opt out of write-back?
8. Salmon note: should a "mild reaction" new note flag the provider (spec: "flag for review" in scenario text) - who reviews, and does it become an allergy in care history? Not specified.
9. 409 on the *prefill fetch* for capacity conflict is odd: the fetch has no dates, only petId/providerId (inferred). Where do dates come from at fetch time? Also what happens to capacity when dates change after load.
10. Payment: no payment method choice, no cancellation/refund policy display, no commission/service-fee display in price summary; FR-15 requires a payment method; 1.7-equivalent step's content is undefined here. DR-9 payment failure paths not shown.
11. "Additional services" catalogue, per-service prices and the rule that selected services are BDT 0 until confirmation (spec: "pre-selected but not pre-charged") vs eventual charge are unclear: does the total change when a service is chosen? Hold of BDT 6,600 would exclude them.
12. Different-provider path: how a provider's own rate/capacity/care-fit reflect, how the "proven" filter ranks, and whether pre-fill is re-validated against the new provider's declared care limits (decline taxonomy FR-17: cannot administer medication, etc.). NFR-26/DR-6 tension as on 2.1.
13. Missing states: loading, offline (DR-10 offline banner "Offline. Bookings will be sent when you're back online."), submit error, duplicate submit/idempotency, session expiry.
14. "Save as draft": draft persistence server-side or local; resume path; effect on SM-15 timing; not in PRD requirements list (inferred).
15. Anxiety-trigger inline note differs between outline ("Eid fireworks are over; check for any other triggers") and spec ("Eid over - anything else for this stay?"); hard-coded Eid reference would be wrong for non-Eid stays (should be conditional).
16. Pickup time: label "Pickup" is ambiguous (owner drop-off at provider vs provider pickup); check-in/out times (4pm / 10am) in the Dates line vs separate Pickup time field are redundant.
17. Elapsed time over 6 minutes copy "take your time" - also shows after a long idle; accessibility `aria-label` EN only.
18. Spec says "No blank fields when care history exists" but when a pre-filled value is stale (e.g., 4 weeks later weight/medication changed) no staleness prompt exists.
19. Whether 2.2 must be reachable without 2.1 (deep-link with `providerId` only) and who authorises `petId` (DR-3).

---

# SUMMARY AND CROSS-CUTTING

## (a) Page summary
| ID | Name | Route | Mockup? | Key entities |
|---|---|---|---|---|
| 2.1 | Pet Care History View | `/pets/:petId/care-history` | Yes (21-care-history-view.html) | Pet, CareHistory (conditions, medications, diet, allergies, anxiety triggers, vet contact), Booking, Review, ReviewPhoto, Provider, DeclineReason |
| 2.2 | Book Again Path (Pre-filled Intake) | `/bookings/book-again?petId=&providerId=` | Yes (22-book-again-path.html) | Pet, CareConfiguration snapshot, Provider, Booking (request), AdditionalService, Draft, ElapsedTime metric, PaymentAuthorization (handoff) |

## (b) Implied data entities and fields
- **Pet:** id, ownerId, name, breed, age, weight, thumbnail photo, medical flags/conditions (Diabetic), soft-deleted flag.
- **CareHistory / CareConfiguration (per pet, per stay snapshot; FR-7):** petId, conditions[] (label, since/duration), medications[] (name, dose, frequency e.g. BID), diet (food, meals/day, treats policy), allergies[] (or "None known"), anxietyTriggers[], vetContact {name, clinic, phone}, specialInstructions (text), additionalServices[], lastPickupTime, source/lastUpdatedBy, editedFromSaved flags.
- **Booking:** id, petId, ownerId, providerId, checkIn/checkOut (date + time), nights, stayTitle, state (FR-14; spec uses Completed, Declined, Requested/Authorized implicitly), careConfigurationSnapshot, newStayNote, pickupTime, price {nightlyRate, nights, additionalServices, total}, declineReason (FR-17), createdAt, submittedAt, `secondBookingElapsedSeconds` (SM-15, inferred), idempotency key (DR-10).
- **Review:** bookingId, rating, text, verified flag, photos[] (4 shown), createdAt.
- **Provider:** id, displayName, neighbourhood, tier (A/B), status (active/paused/suspended), nightlyRate, per-date capacity (FR-12), demonstrated-Fit stats (count of similar cases handled), rating.
- **AdditionalService:** id, name (Daily photo updates, Daily walk, Bath at end of stay), price (unspecified), selectedLastStay.
- **BookingDraft:** petId, providerId, form values, savedAt (location unspecified).
- **Quick-stats aggregate (derived):** bookingsCount, reviewsCount, daysInCare, avgStayRating.
- **UI preference (local):** care-section collapse state per visit.
- **FirstBookingDuration (inferred):** per-owner time of first booking, needed for the "faster than your first" claim.

## (c) Implied API operations
- GET pet care history (per pet): summary sections, quick-stats, recent bookings with review snippet/photos, most-recent provider, provider availability status (2.1; prefetched).
- GET review full text / photos for a stay.
- GET pre-filled booking intake for (petId, providerId): care configuration, provider summary, default dates/price/pickup time; returns conflict when provider cannot cover dates (2.2 prefill; spec path `/api/pets/:petId/care-history`).
- GET proven/alternative providers for a pet's case (2.1 link / 2.2 selector; filter semantics open).
- GET provider availability/price for chosen dates (date change / provider switch; inferred).
- POST create booking request with full intake (spec `POST /api/bookings`), idempotent; leads to payment authorization (gateway handoff, tokens only).
- POST/PUT save booking draft (inferred) and GET resume.
- PATCH/PUT care history write-back on successful submission (edited sections; trigger point open).
- POST record SM-15 elapsed time / events (spec: "backend logs elapsed time").
- GET/PATCH pet profile (edit via 1.5).
- GET owner's pets list (multi-pet selector).
- Shortlist search (1.3) with pet attached.

## (d) Hard-coded sample values that would be fabricated trust signals if shown as real
- **Names:** Tito, Shih Tzu, Rashid, "Rashid · Gulshan · Tier-A", Bibi, vet "Dr. Rahman · Gulshan Vet" (mockup) / "Dr. [Name] · Gulshan Veterinary" (spec), phone `+880-XXX-XXXX` / `+880-2-XXX-XXXX` (placeholders, must not be rendered as callable), "Dr. Rahman ... open until midnight · 1.2 km from Gulshan home boarder" (mockup).
- **Provider trust signals:** "Tier-A" badge, "4.9★" (outline), "12 diabetic small dogs handled (successfully)", "Eid-week care provider" aria-label, "Rashid · 5★" dashboard card, "Verified review · ★ 5.0".
- **Stats:** Bookings 1, Reviews 1, Days in care 9, Avg stay rating 5.0 (spec); 3 prior stays, 1 provider, 27 days on platform (mockup); "Diabetes (8 months)", 4 yrs/7 kg (spec) vs 7 yrs/5.2 kg (mockup).
- **Review text:** "Tito came back happy and his glucose curve stayed stable. Rashid sent daily updates with photos." (spec); "Tito came home happy, calm, and exactly on schedule. Rashid's daily photos made the whole week worry-free. Booking again for Eid." (mockup); 4 photos; the "5★" rating.
- **Stay data:** "Eid stay with Rashid · Eid-1 -> Eid+9 · 9 nights" (spec); "28 Mar - 5 Apr 2026 · 8 nights · BDT 6,300" (mockup); "Fri 14 Mar 4pm -> Mon 17 Mar 10am · 3 nights", pickup "Friday 4pm"; "28 Sep - 5 Oct 2026 · 7 nights" (mockup).
- **Pricing:** BDT 2,200/night, BDT 6,600 for 3 nights, BDT 0 additional services; BDT 6,300 (mockup); authorization on "your bKash"; "confirms or declines within 24 hours".
- **Care content:** Insulin 2 units BID (7am/7pm), Caninsulin, Hill's w/d half-cup, low-carb kibble 2 meals/day, loud fireworks / larger dogs, vacuum after 6pm / loud TV, blanket, salmon note ("Tito tried salmon this week..."), services "Daily photo updates", "Daily walk", "Bath at end of stay".
- **Timer claims:** "2 min 15 sec · faster than your first ✓", "Under your first booking's 9 min ✓", "01:12 · under target", "8 pages / 9 minutes" first-booking figure: shown as real, these would be false trust signals unless computed from the user's real first booking.
- **Dashboard card:** "Recent booking - Tito with Rashid · Eid week · 5★" (scenario Q6).
- **Quick-stats chips:** DIABETIC, ANXIETY, SENIOR, "5 of 5 saved" (mockup).

## Top cross-page gaps (summary)
1. SM-15 clock start/end (page load vs Book-again tap; submit vs confirmation/authorization) conflicts with FR-48/SM-15 wording; per-user vs median; no server-trusted measure.
2. "Faster than your first booking" and the 9-minute comparison rely on a stored first-booking time; claim is shown without verifying.
3. Mockups diverge widely from specs in data, labels, sections and prices (list above); mockup 2.2 lacks Dates/New note/Pickup/Services; mockup 2.1 lacks 6-section structure, photos, three-level CTA.
4. "Proven provider" filtering uses care-fit data, which NFR-26/DR-6 say is not used for ranking; also demonstrated-Fit stats ("12 ... handled") source/definition undefined.
5. Missing flows/states: payment method + FR-15 required inputs on 2.2, offline/error/loading (DR-9, DR-10), write-back timing and scope, draft entity, allergy pre-fill, bilingual coverage of many strings and no Bangla font/numeral rule.
