# UI/UX Functional Analysis — Scenario 03: Rashid's Eid-Week Capacity Fill + Care-Record Credit

Source folder: `docs/scenarios/03-rashids-eid-week-capacity-fill/` (scenario .md, pages 3.1–3.10 outlines `.md` + specs `.spec.md`, `_validation-report.md`). Cross-checked against `docs/prd.md` and three mockups in `docs/ux/mockups/` (07 = 3.2, 35 = 3.5, 36 = 3.6). The UI/UX is treated as a functional specification; nothing here redesigns it. "(inferred)" marks my inference, not source text. The written spec wins over mockups; conflicts are reported.

All 10 pages are provider-role (`provider` role required; redirect to `/provider/sign-in` per 3.1). All 10 specs carry `spec_status: validated · 2026-08-31 · WDS Phase 4 [V]`. The validation report's overall status is `needs_work` (1 critical: 3.5/3.6 lack a hard `related_cross_scenario` link to Scenario 04 / 4.2, R-10 launch-blocking). It reports that the specs were extended from the outlines "without contradiction"; this analysis finds several contradictions (see Section 0).

---

## 0. Cross-cutting findings (read first)

### 0.1 FR/NFR numbering in the scenario does NOT match the PRD
The scenario/spec pages cite FR IDs from an earlier numbering. Examples (scenario cites -> what that ID actually is in `prd.md`):

| Cited in scenario | Cited as | PRD's actual meaning of that ID | PRD ID that matches the concept |
|---|---|---|---|
| FR-1 | booking lifecycle (3.3) | Tiered supply structure | FR-14 (state machine), FR-15, FR-16 |
| FR-3 | accept/decline (3.3) | Minimum vetting bar | FR-16 |
| FR-4 | provider application/approval; "provider management" | Vetting bias audit | FR-2/FR-33; FR-5 for profile |
| FR-15 | daily updates (3.1, 3.5, 3.6) | Booking Request submission + Payment Authorization | FR-43 |
| FR-24 | structured decline (3.3, 3.4) | Report an Issue within Dispute Window | FR-17 |
| FR-26 | booking chat + audit (3.5, 3.6) | Acute-Event trigger | FR-44 |
| FR-25, FR-28 | vet directory (3.5) | Admin investigation; Vet-Clinic usage during acute events | FR-45 (+FR-28) |
| FR-22 | completion / acute-event escalation | Review independence from Report | FR-19 (completion), FR-26 (acute) |
| FR-23 | verified review trigger (3.7) | Review public visibility/moderation | FR-20/FR-21 |
| FR-29 | payout release (3.7, 3.10) | Payout/Report implications of Acute Events | FR-19, FR-41 |
| FR-31 | payout reconciliation (3.10) | Admin role/auth | FR-41, FR-42, NFR-23 |
| FR-43 | per-species handling (3.6) | Daily Updates during Stay | FR-43 matches the daily update; "per-species handling" has no match |
| FR-44 | per-care-need handling (3.8); Tier-A badge | Booking-scoped Chat | FR-5 (badge, Capability Flags) |
| FR-49 | demonstrated-Fit (3.4, 3.9) | Provider-side repeat Owner/Pet tooling | NFR-26, OQ-25, §4.5 (no FR owns Demonstrated Care Fit) |
| FR-50 | off-platform soft-signal (scenario Q2) | Off-Platform Defection signal capture | FR-50 (matches) |
| NFR-15 | 30s polling (3.1) | Low-end Android 9+, 2 GB RAM | no polling NFR in PRD |
| SM-7, SM-11, SM-13 | scenario Q2 (review-with-photos rate, demonstrated-Fit exposure, off-peak utilization) | SM-7 = decline-reason distribution; SM-11 = review-with-photos rate; SM-13 = utilization by tier | partial |

Impact: do not trace requirements from the scenario's FR IDs. In this document I cite the PRD's actual IDs, and write "(scenario cites FR-x)" where the page cites a different one.

### 0.2 Top contradictions with the PRD
1. **Commission 15% labelled "Tier-A introductory rate"** (3.10, 3.7 net 16,830, 3.1 stats). PRD OQ-8 directional bands: Tier-A introductory 8-12%, Tier-B 15-18%; UJ-2 says Tier-A gets a lower commission during the Eid window; FR-41/NFR-25 say values are architecture-stage and static. 15% is a Tier-B band value.
2. **Payout cadence "bi-weekly"** (3.10) vs OQ-3 directional default "weekly batched MFS payouts". FR-41 also says payout is "released at Booking Completion, subject to freeze". 3.7 copy says "Payout release queued" on completion; 3.10 shows batch dates.
3. **Demonstrated Fit ranking**: 3.9 says "the algorithm ranks by what's here"; scenario Q7 says it surfaces to owners on first search. PRD NFR-26 / §5 / OQ-25: Fit data is captured but NOT consumed for v1 ranking (v1 ranking = Tier + neighbourhood density + Date-Level Capacity).
4. **Free-text on decline**: 3.4 has an elaboration textarea (280 chars) and requires >=10 chars for "Generic decline". PRD FR-17 Out of Scope: "Provider free-text decline rationale in v1 (deferred; structured reason only)". The label "tell Bibi more" also implies the owner reads it; the outline says it feeds routing data.
5. **Per-size capacity (small/medium/large)** in 3.8 vs FR-12 Out of Scope: "Per-Pet-size capacity breakdowns beyond species in v1".
6. **"Edit today's update"** (3.5) vs FR-43 Out of Scope: "Provider-editable Update history (Updates are immutable once posted in v1)".
7. **Photo mandatory in the daily update** (3.6) vs FR-43: an Update is "a photo, short video, or short note" (photo not mandatory; no video option in 3.6).
8. **Acute event blocks completion** (3.7 state 3) vs FR-19/FR-29: acute event freezes payout and opens the dispute window early; the PRD does not say completion is blocked. Also 3.7 state 4 "dispute-window-open" before completion conflicts with the PRD definition (dispute window starts after completion, or at acute event trigger).
9. **Confirmation-window expiry "auto-released to next provider"** (3.3 state 8). PRD FR-16/FR-39: no response triggers an Admin-visible timeout signal and releases the authorization; no "next provider" routing exists in the PRD. FR-16 also excludes auto-confirmation.
10. **"6 hours" confirmation window** appears only in the 3.3 outline; PRD OQ-1 leaves duration open and UJ-1 mentions 90 minutes for repeat owners.
11. **Provider-side acute-event surface**: 3.5 says it routes to a "provider-side acute-event runbook trigger surface"; 3.6 says it "hard-links to Scenario 04 admin runbook". The Admin console is English-only (NFR-13) and admin-role; a provider cannot use it. The actual provider destination is undefined (mockup 57-acute-event-trigger exists but is outside this scope).
12. **Eid dates/duration**: "Eid-1 -> Eid+9" is 11 calendar days (10 nights), yet it is labelled "9 nights" (3.1, 3.3, 3.4, 3.7, 3.9) and "9 dates" (3.2 banner "Aug 25 - Sep 2"). UJ-2 says "8 nights"; mockup 07 says "Mar 28 - Apr 05 (8 nights)".
13. **Free-hand claims on 3.8**: "Profiles at 80%+ get 2x more confirmed bookings" is an unsubstantiated statistic and contradicts the page's own "no pressure CTAs" rule.
14. **Review counts**: 3.8 preview "4.9 star · 47 reviews" vs 3.9 "Verified reviews with photos: 48" (more photo-reviews than total reviews). 3.8 preview also shows "Reviews (3)".
15. **Fit delta in scenario**: scenario Q7 says "climbs from 12 to 16"; Q8 and 3.9 say 12 -> 13; 3.7 says "+1" per stay.

### 0.3 Cross-page structural gaps
- 3.1 has **no Confirmed (future) bookings list** and no "Completed column", yet 3.4 says "booking moves to Confirmed column" and 3.7 "booking moves to Completed column". Scenario Q6 mentions "6 confirmed bookings this week".
- **No entry point to 3.7 (Mark complete)**: 3.7 says "accessible from 3.5 when stay end-date passes", but 3.5's layout has no such control; 3.1 in-stay card only has "Open". The validation report claims a "3.5 -> 3.7" link that is not in the 3.5 spec.
- **No entry point to 3.9** except "3.1 dashboard footer link + 3.8 preview"; the 3.1 footer is a stat line with no stated tap action.
- **No payout account setup** (bKash/Nagad number, verification) on any page, though 3.10 depends on MFS payout.
- **No provider-initiated cancellation, no-show, or owner-cancellation notice** screens (PRD OQ-6).
- **No offline handling** except the 3.5 banner (PRD R-14 load-shedding concern).
- **Names hard-coded in UI copy**: "Bibi" and "Ayaat" appear inside content blocks (e.g. "Bibi's payment will be charged", "Ayaat notified for monitoring"); these must be templated ({owner}, {admin}) and the admin's personal name should never reach providers.

---

## 1. Page 3.1 — Provider Dashboard (Bookings + Capacity)

1. **Identity**
   - Page ID 3.1; "Provider Dashboard (Bookings + Capacity)"; role provider; route `/provider/dashboard` (SSR, deep-linkable; redirect to `/provider/sign-in` if not provider).
   - Platform mobile + desktop. Mockup: spec-only (no mockup). Spec status: validated 2026-08-31 (outline status: outlined).
2. **Purpose**: Eid-week command center: pending requests, in-stay bookings, capacity, month payouts and care-record stat on one screen (PRD UJ-2, FR-12, FR-16, FR-43; scenario cites FR-4/12/15).
3. **UI components**: `tier-a-badge` (header, tap = explainer copy), quick-stats strip (`<dl>`), peak banner (`accent-soft`), tab bar (`tab.primary`, 4 tabs), `provider-card.standard` (request card and in-stay card), countdown timer, `capacity-cell.*` (mini bar), `demonstrated-fit-card.inline` (care-record footer), banners `destructive-soft` / `warning-soft` / `info-soft`.
4. **User actions**
   | Action | Result |
   |---|---|
   | Tap Tier-A badge | Explainer copy (content not specified) |
   | Gear icon | "settings" (destination unspecified) |
   | Expand icon | Opens desktop full-screen (unspecified) |
   | Tab Today / Calendar / Payouts / Profile | Today = this page; Calendar -> 3.2; Payouts -> 3.10; Profile -> 3.8 |
   | Tap pending-request card | -> 3.3 `/provider/requests/:requestId` |
   | "Confirm" on card | Spec says "Confirm / Decline CTAs inline"; destination not stated (inferred: opens 3.4 accept modal; note 3.3 labels the button "Accept", 3.1 "Confirm") |
   | "Decline" on card | (inferred) opens 3.4 decline modal |
   | "Open" on in-stay card | -> 3.5 `/provider/bookings/:bookingId/in-stay` |
   | Acute banner "Open Runbook" | Routes to acute-event surface (Scenario 04 gate; destination undefined, see 0.2 #11) |
   | Onboarding banner link | Admin support (destination unspecified) |
5. **States**
   - S1 default Eid peak: peak banner + populated pending + in-stay + capacity 95% + latest Fit.
   - S2 quiet/off-peak: banner swaps to re-engagement nudge text; pending may be empty; capacity bar shows under-utilization.
   - S3 acute event active: banner "{N} acute event active · Open Runbook", `destructive-soft`, replaces peak/quiet banner.
   - S4 capacity near full: inline banner above pending list "3 of 5 spots filled for tomorrow's window", `warning-soft`.
   - S5 no pending: empty state "No pending requests · check back soon".
   - S6 Tier-A first-time setup: onboarding banner "Welcome to Tier-A · here's what changes".
   - Loading, error, offline states: NOT specified (gap). Countdown colour shifts at 1h remaining. In-stay card status badge: "Update posted today" / "Due today".
6. **Data displayed**
   | Field | Source entity |
   |---|---|
   | Provider name, Tier-A badge | Provider (tier) |
   | Eid-week utilization % (95%), Pending count (4), In-stay count, "Month payouts BDT 84,000" | derived from Capacity, BookingRequest, Booking, Payout |
   | Peak window flag/name | PeakWindow definitions |
   | Pending card: pet thumbnail, name, species/breed, care-config tags (diabetic, insulin, special diet), dates, nights, countdown, CTAs | BookingRequest, Pet, CareConfiguration |
   | In-stay card: thumbnail, name, breed, age, "Day N of M", update status | Booking, DailyUpdate |
   | Capacity mini bar: per-day filled/total (Mon 5/5 ... Fri 5/5) | DateCapacity + confirmed bookings |
   | Care-record: "Diabetic small dogs handled: 13 (+1)" | DemonstratedFit |
7. **Data required**: none captured (read-only). Tabs and CTA taps only.
8. **State transitions / navigation**: No state change on this page itself. Confirm/Decline lead (via 3.4) to: Confirm -> payment capture, Booking `authorized` -> `captured` -> `in-stay` (PRD FR-16); Decline -> `declined`, authorization released (FR-17). Optimistic list updates return here per 3.4 D4.
9. **Validation**: none (display only). Live countdown colour thresholds only.
10. **Integrations**: realtime channel subscriptions `provider.{id}.requests` and `provider.{id}.bookings` ("Push", unsubscribe on unmount); polling every 30s for pending count + capacity. "Push" is ambiguous: realtime channel vs Web Push notification (inferred: both undefined). No SMS/OTP, payment, MFS, or photo calls on this page. Sign-in mechanism for providers not specified.
11. **Business rules**
   - Pending sorted by submission time, **oldest first** (first-come-first-served fairness).
   - Peak banner only during active peak (Eid, December, summer).
   - Capacity bar shows per-day "filled/total"; peak dates use `peak` style.
   - +1 delta badge when Fit climbed "this session".
   - No on/off capacity toggle; no auto-adjust of capacity; no gamification of Fit; no provider comparison/ranking; no blocking of stay completion for missed updates.
   - Quiet-week banner implies Admin may suggest a "re-engagement nudge" (PRD UJ-2 edge case: <40% utilization two months -> admin outreach; FR-36).
12. **Bangla/English**: Content-block table has EN/BN for: tabs (আজ, ক্যালেন্ডার, পেআউট, প্রোফাইল), peak/quiet/acute banners, section headers (মুলতুবি অনুরোধ ({N}), থাকা চলছে ({N}), এই সপ্তাহের ক্যাপাসিটি), empty state, Confirm (নিশ্চিত করুন), Decline (প্রত্যাখ্যান), Open (খুলুন), countdown ("নিশ্চিত করতে {N} ঘন্টা {M} মিনিট বাকি"). Provider name is the same string in both languages. The care-record footer uses the same template in both languages ({care-need}: {count} (+{delta})) with no BN text. `lang="bn"` on Bangla content; mixed EN+BN follows "longest-content rule" (undefined). Numerals/currency/date format rule not stated.
13. **Assumptions**: provider has multiple concurrent bookings; Tier-A is the only provider tier shown; capacity is a single per-night total; 5 spots/night in Eid; real-time infrastructure available.
14. **Questions / conflicts**
   - Quick stats "In-stay 6" vs "In-stay (1)" section and scenario ("6 confirmed, 1 in-stay"): which is it?
   - "Month payouts BDT 84,000" equals gross in 3.10; net is 71,400. Which figure, and does it include pending/frozen?
   - "Capacity near full: 3 of 5 spots filled" is not near full; capacity bar says tomorrow 4/5 in the outline (Wed 4/5 in the spec).
   - Utilization 95% vs bar (24/25 = 96%, inferred); calculation window/definition undefined.
   - Layout shows weekday cells (Mon-Fri) while outline says "tonight / tomorrow / day after".
   - "Confirm" vs "Accept" label inconsistency (3.1 vs 3.3/3.4).
   - Where are Confirmed (upcoming) bookings? No section (see 0.3).
   - 3.1 `Countdown` described as "Live MM:SS" but displayed as "{N}h {M}m".
   - Does a pending request hold capacity before acceptance? (FR-12: exhausted capacity blocks submission; unspecified for pending).
   - Acute banner destination.

---

## 2. Page 3.2 — Date-Level Capacity Calendar

1. **Identity**: 3.2; "Date-Level Capacity Calendar"; provider; route `/provider/calendar` (SSR desktop, SPA mobile; default current month, Eid-month if currently Eid-week; prefetch peak-window definitions). Platform mobile + desktop. **Mockup: `07-provider-calendar.html`** (prior BMM mockup; the validation report calls it the "reconcile target"). Spec status validated.
2. **Purpose**: Per-date capacity control (set for peaks, adjust for demand, see utilization) (PRD FR-12, UJ-2).
3. **Components**: peak banner (`accent-soft`), month grid (native `<table>`, 42 cells), `capacity-cell.*` / `capacity-cell.peak`, peak indicator glyph, per-date editor (`<dialog>`, `card.elevated`; sticky bottom on mobile, side panel on desktop), capacity stepper (`input.number`), per-species inputs (`input.text`), notes textarea (`input.textarea`), Reset-to-baseline (`button.variant.link`, `warning-soft` confirm), Save (`button.primary size.sm`), peak preset link, confirm `alertdialog`.
4. **User actions**
   | Action | Result |
   |---|---|
   | Back "Dashboard" | -> 3.1 |
   | Month nav `<` / `>` | Previous/next month (the layout shows only `[< Aug]`) |
   | Tap date cell / Enter | Opens per-date editor for that date |
   | Stepper +/- on Total | Changes total capacity |
   | Edit Dogs / Cats | Per-species split (must equal total; "auto-balances") |
   | Edit Notes | Auto-saves on blur (200 char max) |
   | Reset to baseline | Per-date or bulk (see gaps); confirm modal "This will reset all dates to your default · proceed?" then success toast |
   | Save | Persists and closes editor; success toast |
   | Cancel | Closes editor (Escape also closes) |
   | "Expand for {peak-name}" | Copies "current week" capacity to the peak-window dates |
   | "Reset to baseline after peak" | Bulk revert |
5. **States**: S1 default current month; S2 Eid-week active (prominent banner, expanded capacity); S3 December peak approaching (banner "{Peak-name} peak in {N} weeks · adjust capacity now", December cells highlighted); S4 capacity conflict (bookings > set capacity; inline `role="alert"` banner "Bookings exceed capacity · resolve before reducing", cell `destructive-soft`, **cannot save a lower number until bookings resolved**); S5 sync-with-baseline (bulk reset confirmed, toast); S6 editor open (capacity input focused). Loading/error/offline for save: not specified.
6. **Data displayed**: date number and capacity number per cell (outline also: booked, available); peak tag; peak window name and N dates; date-level total/dogs/cats/notes. Mockup also shows: "Capacity 4 per day, max", "Eid utilization 68% (27 of 32 slots)", "Pending 3 requests", a legend (Partial / Peak / Empty / Full), per-date booking chips (owner + pet names), a "Pending requests" list.
7. **Data required (editor)**
   | Field | Type | Required | Rules |
   |---|---|---|---|
   | Total capacity | integer stepper | yes | `aria-valuenow/min/max`; max not stated; cannot go below existing bookings |
   | Dogs | integer | yes (inferred) | dogs + cats = total |
   | Cats | integer | yes (inferred) | same |
   | Notes | free text | optional | 200 chars, auto-save on blur |
   Options: none (no preset values) except peak presets "Eid / December / summer".
8. **State transitions**: writes DateCapacity per date (and per species); capacity changes affect search eligibility and request blocking (PRD FR-12: search filters out providers lacking capacity; requests against exhausted capacity are blocked at submission). Navigation: editor sheet in-page; Dashboard back.
9. **Validation**: species sum must equal total; cannot save lower than booked (S4, with inline alert text above); bulk reset requires confirmation; notes max 200 chars. Error message timing for sum mismatch not specified (auto-balance suggests prevention).
10. **Integrations**: Backend `/api/peak-windows` (peak definitions; math client-side); persistence of capacity. No payment/SMS/photo/MFS.
11. **Business rules**: date-level capacity, NOT on/off; no auto-adjust from bookings; no lower save when bookings exceed; no comparison to other providers ("Tier-A average ~4-5" explicitly prohibited as copy); no pressure CTAs; peak types Eid/December/summer; Eid capacity example 5/night vs typical 3 (outline); example breakdown Total 5 = Dogs 3 + Cats 2.
12. **Bangla/English**: BN provided for title (ক্যালেন্ডার), month nav (`{B.year}` - Bangla year? ambiguous, inferred Bangla-numeral year or Bengali calendar year; undefined), banner "{Peak-name} পিক উইন্ডো · {N} তারিখ", editor labels (তারিখ, মোট, কুকুর, বিড়াল, নোট, সংরক্ষণ, বেসলাইনে রিসেট, বাতিল), preset, conflict warning, December banner, sync confirm. `{Peak-name}` is substituted (Eid name in both languages not provided). Month names/day-name headers not provided in BN. Numerals not specified. **Mockup 07 is English-only** (`lang="en"`).
13. **Assumptions**: a "baseline/default" capacity exists per provider; peak windows are defined centrally; species only dogs and cats; capacity unit is pets per night; provider capacity is edited on desktop or mobile.
14. **Questions / conflicts**
   - **Spec vs mockup**: Mockup shows Mar 2026, capacity 4/day, Eid window "Mar 28 - Apr 05 (8 nights)", utilization 68%, pending count 3, a four-colour legend, owner/pet chips per slot, and Accept/Decline buttons inside the calendar's pending list. None of that matches the spec (Aug 2026, capacity 5, 9 dates). The mockup has no per-species fields, notes, Reset-to-baseline, Save, peak preset or banner. The mockup also bypasses the 3.4 reason modal (direct "Accept booking"/"Decline"). The mockup's own text is inconsistent ("3 of 4 spots open" while 3 slot chips are filled and 1 is open).
   - Spec sample grid inconsistent: banner "Aug 25 - Sep 2" (9 dates) but peak glyphs on Sep 1-6 and not on Aug 30-31; editor says "Mon Aug 25" and the grid shows Aug 1 under Friday (in 2026, Aug 25 is a Tuesday and Aug 1 a Saturday, inferred from the calendar). Peak dates need a real source.
   - Where does the Tier-A **peak-participation prompt with acceptance of introductory commission terms** (PRD FR-12, UJ-2) live? Not on this page; "peak-window terms active" is never defined.
   - "Reset to baseline" means three different things (per-date reset, bulk revert, "sync-with-baseline") and where baseline is set is not specified.
   - "Expand for Eid-week copies current week" - ambiguous semantics; "Expand capacity" amount unspecified.
   - Auto-save on blur (notes) vs explicit Save: which fields are saved on blur?
   - Capacity-conflict: how does the provider "resolve" bookings (cancel flow does not exist)?
   - Does capacity count pending (authorized) requests? Does the checkout night count?
   - Multi-date edit/range selection absent (UJ-2 edits 8 nights in one action).
   - Per-species: PRD says per-species where relevant; spec only dogs/cats; 3.8 adds per-size.
   - Past dates: editable?

---

## 3. Page 3.3 — Incoming Booking Request

1. **Identity**: 3.3; "Incoming Booking Request"; provider; route `/provider/requests/:requestId` (SSR desktop, SPA mobile). Platform mobile + desktop. Mockup: spec-only. Status validated.
2. **Purpose**: Show the request with full pet profile + care configuration so the provider can accept/decline without WhatsApp (PRD FR-9, FR-16, FR-49; scenario cites FR-1/3/24).
3. **Components**: countdown banner (`info-soft` -> `warning-soft` -> `destructive-soft`), owner card (`card.muted`), past-stay badge (`tier-a-badge` pattern), pet card (`card.muted`), medical flag chip (`badge.warning-soft`), care-config block (`card.elevated`, `care-configuration-field-group`), instructions quote (editorial italic), vet contact `tel:` link, stay summary, auth-hold note (`info-soft`), `sticky-action-bar` (Decline / Accept).
4. **User actions**
   | Action | Result |
   |---|---|
   | Back "Dashboard" | -> 3.1 (request stays pending) |
   | Tap request ID | Copies ID to clipboard |
   | Tap vet phone | Phone dialer (`tel:`) |
   | Accept | Opens 3.4 accept modal; on confirmation, capture fires and routes to 3.1 (note: the 3.3 object table says Accept "fires" capture and "routes to 3.1"; 3.4 puts an extra confirmation modal first) |
   | Decline | Opens 3.4 structured-reason modal |
5. **States**: S1 fresh; S2 repeat owner (success-soft owner card, "You've hosted Tito before · 5★"); S3 new owner ("First-time booking"); S4 special-care-heavy banner ("This booking requires {care} · confirm {care} capability", `warning-soft`, `role=status`); S5 capacity-tight banner ("{N} spot remaining for this date"); S6 countdown <1h (warning-soft, orange); S7 <15m (destructive-soft, red); S8 expired: "This request was released · expired", CTAs disabled, `role=alert`. Loading/error (e.g. request not found, capture failure) not specified.
6. **Data displayed**
   | Field | Entity |
   |---|---|
   | Request ID (#PC-2026-0001 format) | BookingRequest |
   | Countdown (remaining to confirm) | BookingRequest.confirmation deadline |
   | Owner photo, first name, neighbourhood (Banani), "Verified owner", past stays with this provider (count, rating) | Owner, Booking history, Review |
   | Pet: thumbnail, name, breed, age, weight, sex, neutered, medical chip (Diabetic, "8 months") | Pet (snapshot) |
   | Care config: insulin (units, schedule BID 8am+8pm, refrigerated), diet (kibble type, restrictions), anxiety triggers, special instructions (max 280 chars displayed, truncated with ellipsis), vet contact (name, clinic, phone) | CareConfiguration |
   | Stay: start -> end, nights, "Total authorization hold BDT 19,800" | BookingRequest, Payment authorization |
7. **Data required**: none (read-only; decision captured on 3.4).
8. **State transitions**: Accept -> capture-on-confirmation (PRD FR-16/FR-39): `authorized` -> `captured` -> `in-stay` (at start date, FR-18); capacity consumed (inferred). Decline -> `declined`, authorization released. Expiry -> authorization released, Admin timeout signal (PRD FR-16/39; spec adds "auto-released to next provider"). Navigation after accept: 3.1 (spec) vs 3.5 on check-in date (outline).
9. **Validation**: none on page; CTAs disabled when expired. Countdown ticks client-side every second, no server poll.
10. **Integrations**: Payment gateway: `capture(hold_id)` on Accept (flagged "confirm Brief §3 alignment"). Phone dialer. Notifications (Owner told on accept: via 3.4). No SMS/OTP/MFS/photos here.
11. **Business rules**: capture on confirmation, not on completion; "authorization hold" copy rather than "charge"; countdown colour thresholds 1h / 15m; accept-or-decline only (no counter-offers, no price negotiation, no pre-decision chat, no auto-accept); special instructions max 280 chars; request ID format "#PC-2026-0001" (inferred pattern, shown as sample); outline: "Confirm or decline within 6 hours".
12. **Bangla/English**: Full EN/BN table for countdown, verified owner (যাচাইকৃত মালিক), past stay, pet line ("{age} বছর · {weight} কেজি"), neutered (নিউটার্ড), insulin line, anxiety (উদ্বেগ), instructions, vet, stay dates ("{N} রাত"), auth-hold, special-care banner, capacity-tight, repeat/first-time tags, Accept (গ্রহণ), Decline (প্রত্যাখ্যান), expired. Free text (owner instructions, pet names, breed, vet) renders as entered (bilingual content per FR-47/glossary). Not stated whether the breed is localized. Currency token "BDT" is Latin in both languages.
13. **Assumptions**: care configuration is already structured (insulin schedule, diet, anxiety triggers) at intake; the provider sees owner neighborhood and first name; single pet per request (inferred); repeat-owner detection by past stays with this provider.
14. **Questions / conflicts**
   - PRD FR-9 requires showing prior Confirmed Stays with other providers and decline patterns; the page shows only "past with you".
   - Owner neighborhood and photo exposure to provider before acceptance: privacy rule undefined (NFR-10).
   - Vet contact on this page = owner's own vet ("Gulshan Veterinary") but 3.5 vet directory = platform per-neighborhood directory (FR-45) and 3.8 has "vet affiliation" for the provider: three different vet concepts.
   - Where the 6-hour window comes from (OQ-1 open); "released to next provider" has no PRD basis.
   - Accept in this page "charges" while the modal says "Capture-on-confirmation: ... will be charged": capture failure (insufficient MFS balance, expired authorization, gateway error) path is not designed.
   - No "capacity-tight vs no-capacity" distinction: what if the date capacity was reduced after the request?
   - "Capacity-tight" banner conflicts with "no counter-numbers on capacity" (must-not-do list).
   - Sample vet fields use placeholders "Dr. [Name]" / "+880-XXX-XXXX".
   - Outline says Accept goes to 3.5 on check-in date; spec says 3.1.

---

## 4. Page 3.4 — Booking Confirmation Decision

1. **Identity**: 3.4; "Booking Confirmation Decision"; provider; route `/provider/requests/:requestId/decision` (modal pattern, not standalone page; bottom sheet on mobile, centered dialog on desktop). Mockup: spec-only. Status validated.
2. **Purpose**: Capture accept/decline with structured decline reasons feeding routing data (PRD FR-16, FR-17, SM-7; scenario cites FR-24/FR-49).
3. **Components**: modal shell (`dialog.decision-modal`, `card.elevated`), accept summary (`card.muted`), capture helper (`info-soft`), Cancel (`button.variant.link`), Accept / Submit decline (`button.primary size.lg`), radio group in `<fieldset>`, `<textarea>` with char count, live-region toast.
4. **User actions**
   | Action | Result |
   |---|---|
   | Accept (modal) | Capture-on-confirmation fires immediately; optimistic UI moves booking to captured state in 3.1; modal closes; toast "{pet}'s booking confirmed · Bibi notified"; route to 3.1 |
   | Cancel (accept modal) | Closes modal, no action, returns to 3.3 |
   | Select decline reason | Enables Submit; free-text enabled |
   | Enter elaboration (optional) | 280 chars |
   | Submit decline | Logs reason + free text; toast "Decline logged · Ayaat notified for monitoring"; route to 3.1 with request removed |
   | Cancel / Escape (decline) | Closes, returns to 3.3 |
   | Enter key in accept modal | Triggers Accept |
5. **States**: S1 accept default; S2 accept success (optimistic); S3 decline default (Submit disabled, `aria-disabled` + `aria-describedby` reason); S4 reason selected; S5 generic selected (free-text required, Submit disabled until >=10 chars, live count); S6 decline success. Error states (capture failed, network/offline, request already expired) not specified.
6. **Data displayed**: pet name; dates; nights; "BDT 19,800 authorization hold" (accept summary: "Tito · Eid-1 -> Eid+9 · 9 nights", "💉 Insulin BID"); six reasons.
7. **Data required (decline)**
   | Field | Type | Required | Options/limits |
   |---|---|---|---|
   | Decline reason | single choice radio | yes (exactly one) | 1 Cannot administer medication; 2 Cannot accommodate high-anxiety pets; 3 Cannot support senior / limited-mobility pets; 4 Care requirements exceed capacity; 5 Facility / environment not suitable; 6 Generic decline (free-text required) |
   | Elaboration | text | optional; required when reason 6 | 280 max; >=10 chars for reason 6 |
8. **State transitions**: Accept: Booking `authorized` -> `captured` (-> `in-stay` at start) (FR-16, FR-39); Owner notified. Decline: Booking -> `declined` with reason recorded against Booking and Pet Care History (FR-17); authorization released (PRD; not stated on this page); Admin sees reason distribution. Always returns to 3.1.
9. **Validation**: decline reason required (Submit disabled until selected); generic needs >=10 chars; textarea max 280; no batch decline. No inline error text defined; prevention by disabling.
10. **Integrations**: Payment gateway `capture(hold_id)` (backend); notifications: owner "notified" (channel unspecified; in-app per FR-43, inferred), Admin "notified for monitoring" (channel unspecified; PRD says Admin tooling surfaces distribution, not per-decline notification). Taxonomy as backend enum via `/api/decline-reasons`.
11. **Business rules**: six-reason taxonomy (Brief §3), exactly one; accept-or-decline only; no counter-offers/negotiation/pre-decision chat; no skipping reason; generic needs free text; no batch decline; Accept copy "Capture-on-confirmation: ... payment will be charged".
12. **Bangla/English**: EN/BN for all strings including six reasons (e.g. ওষুধ দিতে অক্ষম), toasts, labels. Notes: BN decline header ends with "?" (`প্রত্যাখ্যান করবেন?`) but EN does not; BN exposes jargon "ট্যাক্সোনমি" and "ক্যাপচার" (EN: "taxonomy", "Capture-on-confirmation") to providers (copy needs plain-language review); "Bibi"/"আয়াত" are hard-coded names.
13. **Assumptions**: gateway capture succeeds synchronously enough for optimistic UI; the decline reasons are stable enum; admin monitors declines individually.
14. **Questions / conflicts**
   - PRD FR-17: free-text deferred (see 0.2 #4); to whom is the elaboration shown (owner or admin)?
   - Optimistic update of a payment capture: rollback behaviour on failure undefined.
   - Decline success copy should state owner is not charged (FR-39); not present.
   - PRD FR-17: decline also written to the Pet's Care History; whether owner sees the reason is unspecified.
   - Accept leaves no "confirmation of capacity impact".
   - Hard-coded "Ayaat notified" vs PRD admin model.
   - Outline says "Decline path: request removed" vs PRD: Booking becomes `declined` (record persists).

---

## 5. Page 3.5 — In-Stay Management

1. **Identity**: 3.5; "In-Stay Management"; provider; route `/provider/bookings/:bookingId/in-stay` (mobile-only, deep-linkable from 3.1). **Mockup: `35-in-stay-management.html`** (header "3.5 In-Stay Management (Provider · Eid week, Day 4)"). Status validated; cross-ref `related_cross_scenario` to 4.2 is missing from front-matter (validation critical R-10).
2. **Purpose**: Whole in-stay picture (updates, chat, vet directory, acute trigger) from the phone (PRD FR-43, FR-44, FR-45/FR-28, FR-26; scenario cites FR-15/25/26/28).
3. **Components**: pet card (`card.muted`), insulin-due countdown, daily-update prompt (`card.elevated`) with status badge (`badge.warning-soft` / `success-soft` / `badge.neutral`), past-update card (`card.muted`), update photo thumb (1:1, lazy, tap = fullscreen), care-flag chip (`badge.neutral`), chat snippet + `chat-bubble.*`, `vet-clinic-entry`, acute-event trigger banner (`destructive-soft`), connectivity banner.
4. **User actions**
   | Action | Result |
   |---|---|
   | Back "Dashboard" | -> 3.1 |
   | "Post today's update" | -> 3.6 (modal slides up) |
   | "Edit today's update" (when posted) | -> 3.6 in edit mode (inferred) |
   | Tap photo thumbnail | Fullscreen viewer |
   | "Open full chat" / chat snippet | Booking-scoped chat (out of scope); reply inline per outline |
   | Tap vet phone | `tel:` dial |
   | "2 alternative clinics" | Expands list |
   | "If something is wrong, tap here" | Acute-event runbook trigger (Scenario 04 / 4.2; out of scope here) |
5. **States**: S1 posted today (green check, CTA "Edit today's update"); S2 due today ("Due today (soft reminder)", CTA "Post today's update"); S3 overdue past midnight: "Skipped (grace allowed)", no penalty, CTA still available; S4 acute event active (banner replaces update section with runbook entry); S5 connectivity issue (banner "Connection intermittent · updates will sync when restored", past updates still visible); S6 chat new message (unread badge, "Open full chat" highlighted). Loading/empty (no updates yet, day 1) states not specified.
6. **Data displayed**: pet name, breed, medical chip, "Insulin due in {N}h" (derived from care-config schedule; live MM:SS, colour shift <30 min); "{pet}'s stay · Day N of M"; today's update status; past updates (day, timestamp, photos, note quote, care-flag chips Glucose/Insulin/Behaviour; newest first); chat (last 2 messages, relative time); vet directory entry (clinic name, distance, phone) + 2 alternatives. Mockup adds: chips DIABETIC + ANXIETY, "Insulin due in 2h 15m", "3 of 9 days", Day 1 "INTAKE" update with "Glucose check 5.8 mmol/L" and "intake checklist complete", "2 new" chat count, clinic hours ("open until midnight", "24h"), "PRIMARY" tag on vet, floating chat button.
7. **Data required**: none on this page (chat reply is outside scope).
8. **State transitions**: none by itself; the acute trigger creates an acute event (PRD FR-26: Booking `in-stay`; Payout Freeze + early dispute window per FR-29). Daily update posted/skipped status flows from 3.6. Mockup's acute trigger sub-copy: "Starts the runbook · notifies Ayaat + Bibi · payout pauses for review" (not in the spec).
9. **Validation**: none. Soft enforcement: no penalty for missed updates, no blocking of completion.
10. **Integrations**: polling every 60s for chat + update status; realtime channels `booking.{id}.messages` and `booking.{id}.events`; phone dialer; Owner notifications via chat/updates; acute event notifies Owner (in-app, SMS/push fallback per FR-26) and Admin; photo storage for update thumbnails (read).
11. **Business rules**: updates are a soft expectation (Brief §3); Skipped label only after midnight; no auto-generated updates; no scheduled updates; no penalty/gamification; vet directory pinned, always expanded, 2 alternatives; "Day N of M" tabular.
12. **Bangla/English**: BN for day header, insulin-due ("ইনসুলিন {N} ঘন্টায়"), daily-update statuses, CTAs, section headers, chat header ("{owner}-এর সাথে চ্যাট"), vet directory (ভেট ডিরেক্টরি), acute trigger, connectivity banner. Uses BN digits? Not specified. **Mockup is English-only** (`lang="en"`). Update notes and chat are user-entered free text.
13. **Assumptions**: a single in-stay booking per page; the care config contains parseable dose times; the vet directory has coordinates for distance ("1.2 km"); chat exists as separate screen.
14. **Questions / conflicts**
   - "Edit today's update" vs FR-43 immutability.
   - No "Mark stay complete" entry despite 3.7 saying it is reached from 3.5.
   - Acute surface destination (see 0.2 #11); mockup shows "notifies Ayaat" / "payout pauses" copy absent from spec; `4.2` and `57` mockups outside scope.
   - Mockup vs spec: mockup includes ANXIETY chip, intake checklist, a numeric glucose reading, clinic hours, and a floating chat button that the spec does not define; the spec's past-update photo grid and "Glucose stable" check differ in detail.
   - Vet distance requires provider/clinic geocoding; no source defined.
   - "Skipped (grace allowed)" is a judgement label shown to the provider; PRD only says reminders and no blocking (OQ-12: reminder cadence undefined).
   - Chat read/unread and attachment rules not specified (PRD FR-44).
   - "Booking state chip" absent (validation recommends adding one).

---

## 6. Page 3.6 — Daily Update Composer

1. **Identity**: 3.6; "Daily Update Composer"; provider; route `/provider/bookings/:bookingId/updates/new` (modal pattern, slides up from 3.5; mobile-only). **Mockup: `36-daily-update-composer.html`** ("FIT EVIDENCE GENERATOR · Under 60 sec to post"). Status validated; missing hard-link to 4.2 (R-10).
2. **Purpose**: Post photo + structured care log in under 60 s; feeds Care History and Demonstrated Fit (PRD FR-43, FR-7; scenario cites FR-15/26/43).
3. **Components**: day context strip, photo upload zone (4 slots, dashed border), upload thumbs with remove (x), care-log block (`card.muted`), insulin radio + `<input type="time">`, kibble text input with suggestions, behaviour multi-select chips (`badge.neutral`, `role=checkbox`), concerns textarea with None checkbox + voice mic (`button.variant.icon`), glucose radio (4), concerning helper (`warning-soft`), preview `<details>`, helper line, `sticky-action-bar` (Post update primary lg + Save as draft link).
4. **User actions**
   | Action | Result |
   |---|---|
   | Back "Tito's stay" | -> 3.5 (draft handling on exit undefined) |
   | Tap "+" slot | Camera or gallery |
   | Tap-and-hold thumb / tap x | Remove photo |
   | Insulin Given / Skipped / Partial | Given shows time input (default 8 am); Skipped hides time and makes kibble required |
   | Kibble text | Free text; suggestions from past updates (no auto-fill) |
   | Behaviour toggles | Multi-select Calm / Active / Anxious |
   | "None" checkbox / free text | If concern text path chosen, text becomes required |
   | Mic | Web Speech API voice-to-text, Bangla + English; pulses while listening; disabled if unsupported |
   | Glucose radio | Normal / Slight drop / Slight rise / Concerning |
   | "Concerning" helper link | -> acute-event runbook (Scenario 04, 4.2); post still allowed |
   | Preview toggle | Expand "Preview (what Bibi sees)" |
   | Post update | Uploads, creates update; toast "Daily update posted · Bibi notified"; -> 3.5 with update at top |
   | Save as draft | -> 3.5 with toast (draft storage undefined) |
5. **States**: S1 empty (CTA disabled); S2 photo required (helper "Photo required"); S3 insulin given (time input, default 8am); S4 insulin skipped (time hidden, kibble required); S5 any-concerns (free text required, mic enabled); S6 concerning glucose (helper shown, CTA still enabled); S7 preview open; S8 submit success. Upload progress/failure, offline, voice unsupported (mic visible but disabled), and draft-restored states: partially specified or missing.
6. **Data displayed**: "Day N of M · Today"; photo thumbs; (outline) "Preview" of what the Owner sees; helper copy. Mockup adds a header timestamp "11:42pm · Eid-4", "2 of 4 · under 5MB each", default insulin time 20:00, dose label "2u".
7. **Data required**
   | Field | Type | Required | Options / limits |
   |---|---|---|---|
   | Photos | image file 1-4 | yes (>=1) | 5 MB each; JPEG/PNG types unspecified; optional caption per photo (D2) |
   | Insulin status | radio | no (default Given) | Given / Skipped / Partial |
   | Insulin time | time | when Given | default 8:00 AM (mockup: 20:00) |
   | Kibble portion | text | optional; required if insulin Skipped | free text with suggestions |
   | Behaviour | multi-select | outline says photo + behaviour tag are the only forced fields; spec only enforces photo | Calm / Active / Anxious |
   | Any concerns | None checkbox + text (voice) | optional; text required if concerns present | free text |
   | Glucose observation | radio | optional | Normal / Slight drop / Slight rise / Concerning |
8. **State transitions**: creates DailyUpdate (immutable per FR-43) for the booking day; updates the update-status on 3.1/3.5; adds to Care History and Fit evidence (inferred pipeline: "3.7 -> 3.9"); no booking-state change; "Concerning" does NOT auto-trigger acute event (Rashid decides).
9. **Validation**: photo required (CTA disabled; `aria-describedby` explains); kibble required when insulin skipped; concerns text required when concerns flagged; 5MB per photo; max 4 photos (backend validates + compresses); no auto-fill from past updates; no scheduling in advance. Timing: CTA disabled in real time; server validation on submit.
10. **Integrations**: photo storage (presigned S3 or equivalent upload, backend validation and compression); Web Speech API (browser; BN/EN, browser-dependent; transcript may be processed by the browser vendor, inferred); notifications: "Bibi notified" (channel unspecified; PRD FR-43 says in-app channel); no payment/SMS/MFS.
11. **Business rules**: min 1 / max 4 photos; 5 MB each; "under 60 seconds"; helper line says "30 sec" (inconsistent); insulin Skipped -> kibble required; concerns -> text required; "Concerning" glucose offers runbook link only; no penalty for skipping; no auto-generated/auto-filled/scheduled updates; one-per-day semantic implied by "today's update" (not stated).
12. **Bangla/English**: Full BN for labels, options, placeholder (using BN numerals and "৮টায"), helper, CTAs, toast. BN helper line keeps "demonstrated-Fit" in English (EN-only term, no BN translation). "ছবি (আবশ্যক, ১-৪)" uses Bangla digits (rule consistent with only some pages). Voice input must support BN and EN. **Mockup is English-only.** "Preview" shows the owner's view, so BN/EN depends on owner locale (inferred).
13. **Assumptions**: the care log is built for an insulin-dependent diabetic dog (Insulin, Glucose rows); the same form is used for other pets (unspecified); the provider has a camera/gallery and connectivity during load-shedding; update is posted once a day.
14. **Questions / conflicts**
   - Form is hard-wired to diabetic-care fields; how do non-medicated pets, cats, or other care configs change fields? (Spec says per-care-config care flags in 3.5 chips.)
   - Photo-only requirement vs FR-43 (photo, short video, or note); no video option.
   - Outline vs spec: "no forcing structured fields beyond photo + behaviour tag" vs spec only photo enforced.
   - Drafts: where stored, offline behaviour, expiry; photo upload while offline/queued (R-14); "Save as draft" conflicts with "no scheduling" only if a draft auto-posts (not stated).
   - Mockup differences: two behaviour chips pre-checked (Calm + Active), 20:00 default time, dose "2u" display (dose not in spec fields), no caption UI, no draft-confirm.
   - Validation report: "1:1 thumb" copy; "Hard-links to Scenario 04 admin runbook" target is admin console (English-only).
   - Whether insulin "Skipped/Partial" notifies the owner or admin.
   - Auto-suggest "from past updates" versus "no auto-fill" distinction (suggestion list only).
   - "Fit evidence" claim in mockup header: each update counts toward Fit; PRD says Fit derived from completed bookings and reviews, not updates.

---

## 7. Page 3.7 — Booking Completion (Provider Marks Complete)

1. **Identity**: 3.7; "Booking Completion (Provider Marks Complete)"; provider; route `/provider/bookings/:bookingId/complete` ("accessible from 3.5 when stay end-date passes"). Platform mobile + desktop. Mockup: spec-only. Status validated.
2. **Purpose**: Close the stay, queue payout, prompt the owner's verified review (PRD FR-19, FR-20/21, FR-41).
3. **Components**: booking summary (`card.muted`), stay metrics `<dl>` (`success`/`destructive` coloured), side-effects preview (`card.elevated`, 4 check lines), missed-update warning (`warning-soft`), `sticky-action-bar` (Mark stay complete primary lg + Cancel link).
4. **User actions**
   | Action | Result |
   |---|---|
   | Back "In-stay management" / Cancel | -> 3.5, no action |
   | "Mark stay complete" | Triggers side effects; routes to 3.1 with toast "Tito's stay complete · payout queued · Bibi notified"; booking in Completed column; payout row appears in 3.10 |
5. **States**: S1 eligible, all updates posted; S2 eligible with missed updates (warning "{N} days · {M} updates posted · {K} missed · Still allowed · no penalty"); S3 acute event active: disabled with "Acute event active · close runbook first" (`role=alert`); S4 dispute-window-open: completion allowed, payout on hold ("Payout on hold pending Admin review" instead of "Payout release queued"); S5 not yet end date: backend 403, redirect to 3.5; S6 success.
6. **Data displayed**: pet, dates, nights, **gross BDT 19,800 and net BDT 16,830**; "Daily updates posted: N / M"; "Acute events: N"; "Verified review status: pending / started / completed"; side effects with payout amount, review prompt, care history archived, Fit delta "{care-tag} +N" (from a backend projected-Fit endpoint, not frontend estimate).
7. **Data required**: none (confirmation only; no modal in spec though outline has "Tito's stay is complete?" modal).
8. **State transitions**: Booking `in-stay` -> `completed` (PRD FR-19); Verified Review window opens for Owner; funds become payout-eligible; payout release queued **asynchronously**; Care History updated; Fit delta calculated. Payout stays held if freeze conditions apply (FR-24, FR-29). Navigation -> 3.1. No new payment event at completion (FR-39).
9. **Validation**: backend returns 403 if `booking.end_date > today` (provider time zone not stated; Dhaka assumed, inferred); blocked if acute event active; no validation for missed updates (never blocks).
10. **Integrations**: payment/MFS payout queue (async); notification to Owner (verified-review prompt, channel unspecified); Care History/Fit backend; no SMS/photo.
11. **Business rules**: net = gross minus commission (shown 19,800 -> 16,830, i.e. 15%); no blocking on missed updates; no forced review before completion; no holding payout beyond dispute window; no upsell; no pressure CTAs ("Mark complete now to release payout faster"); payout release async.
12. **Bangla/English**: Full EN/BN table (header সম্পন্ন হিসেবে চিহ্নিত করুন, metrics, side-effects, missed warning with "কোনো শাস্তি নেই", acute blocked, CTA, cancel, toast "টিটোর থাকা সম্পন্ন..."). The BN toast hard-codes "টিটো"/"বিবি" (names). Review status enum values (pending/started/completed) left untranslated in BN string. Fit tag "Fit" kept in English. Money shown as "BDT {X}".
13. **Assumptions**: provider triggers completion manually after end date; gross/net are known at completion (commission rate fixed); the Fit delta is predictable.
14. **Questions / conflicts**
   - Acute-event block and dispute-window-open state vs PRD (0.2 #8).
   - No route into this page from 3.5/3.1 (0.3).
   - "Payout release queued" vs batch cadence and dispute window; "released" copy implies immediate release.
   - Review status "started" source (no review-in-progress signal elsewhere).
   - Early checkout/early completion not allowed (403) - what about stays ending earlier than booked, or partial stays (FR-19 Out of Scope)?
   - Mark-complete timing for late providers (no SLA), no reminder defined.
   - "Verified review ... deepens your Fit" copy implies guaranteed review; owner may not review (UJ-2 notes 1 of 8 did not).

---

## 8. Page 3.8 — Provider Profile Editor

1. **Identity**: 3.8; "Provider Profile Editor"; provider; route `/provider/profile/edit` (desktop-primary 60/40 editor + preview; mobile collapses preview into a tab/sheet). Mockup: spec-only. Status validated.
2. **Purpose**: Edit the public profile (photos, services, capacity, capability flags, vet affiliation, prior-experience) with live preview and completeness indicator (PRD FR-5; scenario cites FR-5/44).
3. **Components**: completeness indicator (progress ring), 6 collapsible `<details>` sections, photo slots (drag to reorder, keyboard alternative), services list, capacity inputs, capability flag chips (`badge.neutral`, `role=checkbox`), vet affiliation, textarea with counter, live preview (reuses 1.4 Provider Profile components, `tier-a-badge`, Demonstrated Fit card, reviews), `sticky-action-bar` (Discard changes + Save changes), discard `alertdialog`, `info-soft` admin banner.
4. **User actions**
   | Action | Result |
   |---|---|
   | Back "Dashboard" | -> 3.1 (warn if unsaved) |
   | Upload / remove / drag-reorder photos | Edits gallery (5 slots) |
   | Add/remove service, edit price | Services list |
   | Edit capacity per species/size | Capacity section |
   | Toggle capability flags | Multi-select |
   | Link/unlink vet affiliation | Optional |
   | Edit prior-experience | 500 char |
   | Preview (mobile) | Bottom sheet; tap outside closes |
   | Discard changes | Confirm `alertdialog`, reverts to last saved |
   | Save changes | Persists; toast "Profile updated · preview refreshed"; routes to 3.1 |
5. **States**: S1 first-time setup (wizard-style, ~50% completeness); S2 returning (prefilled, shows missing items); S3 completeness low (reminder); S4 admin-requested update ("PetCare Admin requests: {request}", `info-soft`); S5 unsaved changes (Discard enabled, leave warning); S6 mobile preview sheet. Save button `aria-disabled` when no changes. Autosave states (saving/saved/failed) not specified.
6. **Data displayed**: completeness % and missing-items text ("85% complete · Add: 2 more photos, 1 prior-experience detail"); photos "3 of 5" and "Need 2 more for 'Excellent'"; services with prices (Boarding BDT 2,200/night; Walking BDT 500/walk; Bath BDT 800/stay); capacity (Dogs 3 · Cats 2; Small dogs 2 / Medium 1 / Large 0; Cats 2); flags; linked vet; prior-experience (480/500); preview: name, Gulshan, Tier-A, "4.9★ · 47 reviews", hero photo, Demonstrated Fit (Diabetic 13, Senior 5, Repeat 4), reviews (3) incl. "Bibi, with Tito..." 5★ photos.
7. **Data required**
   | Field | Type | Required | Options/limits |
   |---|---|---|---|
   | Photos | images, hero + up to 5 gallery | >=3 required, 5 recommended | file size/type not specified |
   | Services | list of {service, price} | boarding assumed | Boarding (per night), Walking (per walk), Bath/grooming (per stay); BDT |
   | Capacity | integers per species; per-size for dogs | yes (inferred) | dogs: small/medium/large; cats |
   | Capability flags | multi-select | optional | Diabetic pets; High-anxiety pets; Senior pets; Post-surgery recovery; Special diet (5) |
   | Vet affiliation | link to clinic | optional | source list undefined |
   | Prior-experience statement | text | optional (completeness driver) | 500 chars |
8. **State transitions**: updates Provider Profile (public); recalculates completeness via backend; Capability Flags are declarative and do not alter Fit; no Booking state change. Profile re-moderation by Admin upon edit: not specified. Save routes to 3.1 (outline) while spec also auto-saves.
9. **Validation**: min 3 photos; 500-char counter; completeness computed server-side live; discard confirmation; leave-page warning when unsaved; no auto-decline for low completeness. Error messages not specified.
10. **Integrations**: photo storage (upload, reorder); completeness endpoint; vet directory (inferred); no payment/SMS/MFS.
11. **Business rules**: autosave debounced 1.5 s plus explicit Save; min 3 / recommended 5 photos; prior-experience 500 chars; capability flags never override demonstrated Fit; no fake reviews/photos/completions; no comparison; no pressure CTAs; "Profiles at 80%+ get 2x more confirmed bookings" shown as an informational reminder; completeness example 85%.
12. **Bangla/English**: BN for headers, completeness, section names (e.g. সক্ষমতা পতাকা), flags, banners, discard/save, toast. Char counter uses BN digits "{N}/৫০০"; "৮০%+ ... ২x" mixes digits/Latin. "PetCare অ্যাডমিন", "প্রিভিউ" transliterations. Profile free text (prior-experience, service names) must be storable in BN and EN (PRD FR-47, glossary). Photos hint uses quoted "চমৎকার" for "Excellent" (level undefined).
13. **Assumptions**: provider offers walking/bath services; per-size capacity; vet affiliation is a platform concept; editing happens mainly on desktop; Tier-A.
14. **Questions / conflicts**
   - Autosave vs explicit Save vs Discard semantics (what is "last saved" if autosave persists?).
   - Services beyond boarding (walking, bath) and per-size capacity are outside PRD FR-5/FR-12 (PRD defers daily visits, price per night only).
   - Capability flag list differs from PRD (species accepted, size range, senior, medication, anxiety-tolerant): no "species accepted", no medication-administration flag; "Diabetic pets", "Post-surgery recovery", "Special diet" are new.
   - PRD FR-5 out of scope: provider-controlled photo galleries with moderation - drag-reorder gallery editing may not be v1.
   - PRD FR-5 requires location on map: not editable here.
   - Edit of profile by approved provider: moderation/re-approval unknown.
   - "2x more confirmed bookings" claim has no data; "Excellent" photo tier undefined.
   - Review count mismatch (0.2 #14).
   - Hero photo: "hero + 5 gallery" = 6 vs "3 of 5 / 5 slots".
   - Capacity here (static default) vs 3.2 per-date: which is the baseline source?

---

## 9. Page 3.9 — Care-Record / Demonstrated-Fit History

1. **Identity**: 3.9; "Care-Record / Demonstrated-Fit History"; provider; route `/provider/care-record` (from 3.1 footer link + 3.8 preview). Mobile + desktop. Mockup: spec-only. Status validated.
2. **Purpose**: Show what the provider has demonstrably handled (the reputation asset). PRD: §4.5 Demonstrated Care Fit; NFR-26 (data captured, not consumed in v1); OQ-25.
3. **Components**: `demonstrated-fit-card.card` (5 stat cards, 2-col grid, tabular), delta indicator (`success-soft`), `filter-chip` x5 (horizontal scroll, `aria-pressed`), care-record entry (`card.elevated`, `badge.neutral` tags), methodology link (`info-soft`), methodology modal (`<dialog>`, `card.elevated`).
4. **User actions**
   | Action | Result |
   |---|---|
   | Back "Dashboard" | -> 3.1 |
   | Filter chip (All / Dogs / Cats / Diabetic / Senior) | Client-side filter of timeline; stat cards may show subset totals |
   | Tap record entry | Booking detail (out of scope) |
   | "How is demonstrated-Fit calculated?" | Opens methodology modal; Close / tap-outside / Escape closes |
5. **States**: S1 strong history (stats populated, delta shown); S2 sparse (new Tier-A): placeholder "No demonstrated-Fit yet · your profile shows self-declared capability until your first bookings complete", stats hidden, zero timeline entries; S3 filtered; S4 methodology open. Outline: "Strong history: top stats highlighted in gold". Loading/error not specified. Polling 60 s + window focus revalidation.
6. **Data displayed**: five stats (Diabetic small dogs handled 13; Cat boardings 8; Senior pets handled 5; Repeat owners 4; Verified reviews with photos 48); delta "+1 this week" (outline/delta text) / "+1 this session" (condition); timeline entries: pet name, breed, care tags, dates, nights, "Completed", care-flag chips (e.g. insulin BID, low-carb kibble), review indicator "{N} review photos · {rating}★". Sources: Booking, CareRecord, Review, Pet.
7. **Data required**: none (read-only; filters are UI state). Outline mentions additional filters by year and outcome (not in spec).
8. **State transitions**: none; values change after 3.7 completion + review. Navigation: 3.1, booking detail, 1.4 public profile cross-link (via preview).
9. **Validation**: none. Rule: no fake Fit; data only from completed bookings + verified reviews.
10. **Integrations**: Fit endpoint (same endpoint as 1.4 public profile); no SMS/payment/MFS/photo (review photos are shown as counts).
11. **Business rules**: Fit informational, not a leaderboard; no gamification; no provider comparison; no "reach gold tier" CTAs; methodology link always visible; Fit is based on completed bookings + verified reviews + per-species handling, "not on self-declared flags"; 5 fixed stat categories shown; "+1" delta only when Fit climbed this session.
12. **Bangla/English**: BN provided for header (যত্নের রেকর্ড), stat labels, filter chips, timeline header, entry templates, methodology link, sparse placeholder. "Demonstrated-Fit" is left in English inside BN strings (stats header, link, placeholder) - EN-only coined term needing a BN decision. Numerals: "tabular-nums"; BN numerals not specified. Pet names/breeds as entered. Methodology modal body: not written in either language ("write as separate spec note").
13. **Assumptions**: five fixed stat categories apply to every provider; "diabetic small dogs" defined (small = by weight/breed?) in backend; each stat is computable from Care History.
14. **Questions / conflicts**
   - NFR-26/OQ-25 vs "algorithm ranks by what's here" (0.2 #3).
   - Definition of "handled successfully" and "small dog" (threshold) unspecified.
   - Count conflicts: 48 photo-reviews vs 47 total (3.8); delta "this week" vs "this session"; 12 -> 13 vs 12 -> 16 (scenario).
   - Privacy: timeline lists other owners' pets by name ("Luna · Persian"); if exposed publicly via 1.4, pet/owner consent undefined (NFR-10).
   - Gold highlight and filter/year/outcome items versus no-gamification rule.
   - Timeline pagination for large histories (client-side list prefetch).
   - Who writes the methodology text; Admin-owned copy.
   - Empty-state copy exposes "self-declared capability" concept to the provider (PRD says capability flags are intake hints).

---

## 10. Page 3.10 — Payouts + Earnings

1. **Identity**: 3.10; "Payouts + Earnings"; provider; route `/provider/payouts` (desktop-primary table; mobile collapses to cards). Mockup: spec-only. Status validated.
2. **Purpose**: Per-booking payout state, month totals, frozen payouts, predictable cadence (PRD FR-19, FR-41, FR-42, NFR-23, OQ-3; scenario cites FR-29/31).
3. **Components**: summary block (`card.muted` x4), payout table (`card.elevated`, native `<table>`), status chips (`success-soft` Released, `info-soft` Pending, `warning-soft` Frozen, `destructive-soft` On hold), frozen banner (`destructive-soft`, `role=alert`, Admin link), cycle-mismatch banner (`info-soft`), reconciliation view (`card.muted`, `role=note`), mobile card list with `<details>`.
4. **User actions**
   | Action | Result |
   |---|---|
   | Back "Dashboard" | -> 3.1 |
   | Tap payout row/line | Payout detail (out of scope); mobile expands card |
   | Admin link in frozen banner | Admin contact/support (destination unspecified) |
   No payout release, rate change, or withdrawal action exists (by design).
5. **States**: S1 all released; S2 dispute window open (frozen banner, row "On hold"); S3 acute event active (banner "Payout extended pending post-mortem"); S4 payout-cycle mismatch (banner "MFS settlement typically takes 1-2 business days · patience appreciated"); S5 mobile collapsed cards. Loading/empty/error not specified. Polling every 5 min + push on payout channel.
6. **Data displayed**: header "Payouts · August 2026"; month summary: Gross BDT 84,000; Commission BDT 12,600 (15% Tier-A); Net BDT 71,400; Cadence "Bi-weekly · Next: Sep 1". Per-booking rows: booking label, gross, commission, net, status, released date (sample sums reconcile: 84,000 / 12,600 / 71,400). Reconciliation line "Platform -> MFS -> Provider (bKash/Nagad) · typically 1-2 business days". Source: Payout, Booking, Payment.
7. **Data required**: none (read-only).
8. **State transitions**: displays Payout states: Pending -> Released; Frozen/On hold on Report an Issue (FR-24) or acute event (FR-29). No provider-triggered transitions ("no manual payout release").
9. **Validation**: none.
10. **Integrations**: MFS payout (bKash/Nagad) settlement status "uses real MFS settlement data (bKash/Nagad APIs)" for reconciliation; payment gateway data for captured amounts; Admin payout management (Scenario 04: 4.6 dispute, 4.2 runbook). No contracts are defined here.
11. **Business rules**: commission 15% (Tier-A introductory, fixed in v1, "no payout-rate negotiation"); per-booking commission = gross x 15% (all sample values exact; rounding rule unspecified); bi-weekly cadence, system-driven; no manual release; frozen payouts never hidden; no comparison with other providers; no "boost your tier" CTA (no tier-rate differential in v1 - contradicts the Tier-A vs Tier-B commission policy in PRD FR-41); status vocabulary: Released, Pending, Frozen, On hold; MFS settlement typically 1-2 business days.
12. **Bangla/English**: BN for headers, summary labels (মোট, কমিশন, নেট পেআউট, চক্র · পরবর্তী: {date}), table headers, status labels (✓ মুক্ত, ⏳ মুলতুবি, ❄ হিমায়িত, ⚠ ধরে রাখা), banners, reconciliation (MFS and প্ল্যাটফর্ম/প্রোভাইডার). "BDT" stays Latin in BN. "{Month} {Year}" unlocalized placeholders; BN digits used in "১-২ কার্যদিবস". "MFS" is EN-only acronym. Date format for "Sep 3" not specified in BN.
13. **Assumptions**: a fixed commission rate per tier; payout batches per cadence; MFS provides settlement statuses; one currency (BDT).
14. **Questions / conflicts**
   - Commission 15% vs PRD bands; cadence bi-weekly vs weekly; "payout released at completion" vs batch (0.2 #1-2).
   - Sample timing: "Next: Sep 1" but items "Released Sep 3" and "Pending Sep 17" in an "August 2026" view; "Frozen"/"On hold" difference undefined; the sample table includes a Pending row but state 1 says "all released"; frozen banner example "1 payout on hold" but the table has no such row.
   - Month summary: does "Net payout 71,400" include Pending (Polly 8,500) and frozen items? Month attribution (completion date vs release date) undefined.
   - "Bi-weekly" ambiguity (twice weekly vs every two weeks; the sample suggests 14 days, inferred).
   - No payout account (bKash/Nagad number) setup/verification, no payout history months navigation, no statements/tax docs (NFR-18).
   - Refunds/clawbacks (FR-42) not shown; Report outcomes ("Resolved - Refund") not displayed.
   - "Payout extended pending post-mortem" requires acute-event/post-mortem state (FR-30) exposed to providers.
   - Reconciliation timeline "static informational" but dev note says real MFS settlement data (inconsistent).
   - "Eid-week payout released Sep 3" vs "9 nights" etc.

---

## A. Summary table

| ID | Name | Route | Mockup | Key entities |
|---|---|---|---|---|
| 3.1 | Provider Dashboard | `/provider/dashboard` | spec-only | Provider, BookingRequest, Booking, DateCapacity, DailyUpdate, Payout (summary), DemonstratedFit |
| 3.2 | Date-Level Capacity Calendar | `/provider/calendar` | 07-provider-calendar.html | DateCapacity (per date, per species), PeakWindow, Booking |
| 3.3 | Incoming Booking Request | `/provider/requests/:requestId` | spec-only | BookingRequest, Owner, Pet, CareConfiguration, PaymentAuthorization, Review (past stay) |
| 3.4 | Booking Confirmation Decision (modal) | `/provider/requests/:requestId/decision` (modal) | spec-only | BookingRequest, Booking state, DeclineReason, PaymentCapture |
| 3.5 | In-Stay Management | `/provider/bookings/:bookingId/in-stay` | 35-in-stay-management.html | Booking, DailyUpdate, ChatMessage, VetClinic, AcuteEvent |
| 3.6 | Daily Update Composer (modal) | `/provider/bookings/:bookingId/updates/new` | 36-daily-update-composer.html | DailyUpdate, UpdatePhoto, CareLog, Draft |
| 3.7 | Booking Completion | `/provider/bookings/:bookingId/complete` | spec-only | Booking, Payout, ReviewPrompt, CareHistory, FitDelta |
| 3.8 | Provider Profile Editor | `/provider/profile/edit` | spec-only | Provider, ProviderPhoto, Service, CapabilityFlag, VetAffiliation, ProfileCompleteness |
| 3.9 | Care-Record / Demonstrated-Fit History | `/provider/care-record` | spec-only | DemonstratedFit, CareRecord, Review, Pet |
| 3.10 | Payouts + Earnings | `/provider/payouts` | spec-only | Payout, Booking, Commission, MFSSettlement |

## B. Data entities and fields implied

- **Provider**: id, name (EN/BN), tier (A/B), neighbourhood, approved status, hero photo, gallery photos (3-5+), prior-experience statement (<=500), capability flags, linked vet clinic, completeness %, rating, review count.
- **ProviderService**: provider, type (boarding/walking/bath), unit (night/walk/stay), price BDT.
- **DateCapacity**: provider, date, total, dogs, cats (and per-size small/medium/large per 3.8), note (<=200), is-peak, baseline-source, booked count (derived).
- **PeakWindow**: name (Eid, December, summer), start date, end date, per-year definition.
- **BookingRequest / Booking**: id (format PC-YYYY-NNNN), owner, provider, pet snapshot, care configuration snapshot, start/end dates, nights, price (gross), authorization (hold id), confirmation deadline, state (requested, authorized, captured, declined, in-stay, completed, disputed, resolved, refunded), decline reason (enum) + elaboration, completed-at.
- **Owner (as seen by provider)**: first name, photo, neighbourhood, verified flag, past stays with this provider (count, rating).
- **Pet / CareConfiguration**: name, species, breed, age, weight, sex, neutered, medical conditions (diabetes, duration), medication (name, dose units, schedule, storage), diet (kibble, restrictions), anxiety triggers, special instructions (<=280 shown), vet contact (name, clinic, phone).
- **DeclineReason** (enum of 6) with label EN/BN.
- **DailyUpdate**: booking, day number, timestamp, photos (1-4, <=5 MB, caption), insulin status (given/skipped/partial) + time, kibble portion text, behaviour tags (calm/active/anxious), concerns (none/text), glucose observation (normal/slight drop/slight rise/concerning), status (posted/draft/skipped-derived), immutable once posted.
- **ChatMessage**: booking, sender, text, timestamp, read state.
- **VetClinic (directory)**: name, address, distance, phone, hours, species handled, primary flag.
- **AcuteEvent**: booking, type, time, observation, status (active/closed).
- **Payout**: booking, gross, commission rate and amount, net, status (pending/released/frozen/on hold), release date, batch/cycle date, freeze reason.
- **MFSSettlement**: payout, rail (bKash/Nagad), settlement status, expected 1-2 business days.
- **DemonstratedFit / CareRecord**: provider, care-need tag, count, delta period, timeline entries (pet, breed, tags, dates, nights, outcome, review photos count, rating).
- **Review (as displayed)**: rating, text, photo count, owner first name.
- **Notification**: recipient, type (request, decision, update, completion, review prompt), channel.
- **Draft update**: booking, partial fields (storage location unspecified).
- **ProfileCompleteness**: score, missing-items list.

## C. API operations implied (no gateway contracts invented)

| Verb + resource | Purpose |
|---|---|
| GET provider dashboard summary | Quick stats, banners, capacity bar, care-record stat |
| GET provider pending requests (poll 30 s / realtime) | Pending list with countdown |
| GET in-stay bookings list | Dashboard in-stay cards |
| GET peak windows (`/api/peak-windows`) | Peak definitions for calendar and banners |
| GET date capacity (month range) | Calendar grid |
| PUT/PATCH date capacity (date, total, dogs, cats, note) | Save per-date editor; reject if below booked (conflict) |
| POST bulk capacity operation (expand for peak / reset to baseline) | Presets and bulk reset |
| GET booking request detail | 3.3 (includes care config, owner summary, auth-hold amount, deadline) |
| POST accept booking request (`capture(hold_id)` internally) | Accept: capture payment, state transition, notify owner |
| POST decline booking request (reason enum + optional text) | Structured decline, release authorization, log reason |
| GET decline reasons (`/api/decline-reasons`) | Taxonomy enum EN/BN |
| GET booking in-stay detail | 3.5 header, update status, insulin-due calculation |
| GET daily updates for booking | Past updates list |
| POST request photo upload URL (presigned) + upload | Photo storage for updates and profile |
| POST daily update (photos, care log) | Create immutable update, notify owner |
| POST/PUT draft update | Save as draft (storage assumption) |
| GET/POST booking chat messages | Snippet and full chat (out of scope here) |
| GET vet directory for booking neighbourhood | Pinned directory, alternatives |
| POST acute event (type, time, observation) | Acute trigger (Scenario 04) |
| GET booking completion eligibility/summary | 3.7 metrics, projected Fit delta (403 if end date in future) |
| POST complete booking | Mark completed, open review window, queue payout |
| GET/PUT provider profile | 3.8 load/save (autosave patch) |
| GET profile completeness | Live completeness |
| POST/DELETE/PATCH provider photos | Gallery management |
| GET demonstrated Fit + care-record list | 3.9 and 1.4 shared endpoint |
| GET payouts (month) + summary | 3.10, poll 5 min / push |
| GET payout settlement/reconciliation status | MFS settlement timeline |
| Subscribe realtime channels `provider.{id}.requests`, `provider.{id}.bookings`, `booking.{id}.messages`, `booking.{id}.events`, payout channel | Live updates (transport unspecified) |
| Auth: provider sign-in | `/provider/sign-in` (mechanism unspecified) |

## D. Hard-coded sample values that would be fabricated trust signals if shown as real data

| Value | Where |
|---|---|
| "Rashid M.", Gulshan, Tier-A badge, "6 years hosting" | 3.1, 3.2 mockup, 3.8 |
| Eid-week utilization 95%; Pending 4; In-stay 6; Month payouts BDT 84,000 | 3.1 |
| Capacity cells 5/5, 5/5, 4/5 ... ; "3 of 5 spots filled" | 3.1 |
| "Diabetic small dogs handled: 13 (+1)"; Cat boardings 8; Senior 5; Repeat owners 4; Verified reviews with photos 48 | 3.1, 3.9 |
| 4.9 star · 47 reviews; "Reviews (3)"; review "Bibi, with Tito..." 5 star with photos | 3.8 preview |
| "Past with you: 1 stay · 5 star", "Bibi · Banani", "Verified owner" | 3.3 |
| Tito, Shih Tzu, 4 yrs, 7 kg, male/neutered, diabetes 8 months; insulin 2 units BID 8am+8pm; low-carb kibble | 3.3, 3.4, 3.5, 3.7, 3.9 |
| "Dr. [Name] · Gulshan Veterinary · 1.2 km"; "+880-XXX-XXXX"; mockup: Dr. Rahman, Banani Pet Hospital 2.1 km, Gulshan 2 Animal Care 3.4 km (24h) | 3.3, 3.5, 3.5 mockup |
| Request #PC-2026-0001; "4h 32m remaining"; "Confirm or decline within 6 hours" | 3.3, 3.1 |
| BDT 19,800 / 9 nights; BDT 2,200/night; walking BDT 500; bath BDT 800 | 3.3, 3.4, 3.7, 3.8 |
| Gross 19,800, net 16,830; commission 15% "Tier-A introductory" | 3.7, 3.10 |
| Payout rows: Mini 18,500/15,725; Luna 20,200/17,170; Bruno 17,000/14,450; Polly 8,500/7,225; release dates Sep 3, Sep 17, next payout Sep 1; totals 84,000 / 12,600 / 71,400 | 3.10 |
| Care record entries: Tito (4 review photos, 5 star), Luna (Persian, senior); "Mini · Persian · 3 yrs, Day 4 of 9" | 3.9, 3.1 |
| "Profiles at 80%+ get 2x more confirmed bookings"; "85% complete"; "Need 2 more for Excellent"; prior-experience "6 years hosting. Diabetic small dogs are my specialty..." (480/500) | 3.8 |
| "Tier-A providers in Gulshan average 8 diabetic pets" (listed as prohibited copy, but shows the pattern) | 3.9 |
| Day 1-3 sample updates ("Tito settled in well...", "Glucose curve stable...", "Behaviour calm...") and chat ("How's Tito today?") | 3.5 outline/spec |
| Mockup 07: capacity 4, "Eid utilization 68% · 27 of 32 slots", Pending 3, Bibi/Tito, Shahin/Luna, Sadia/Max, Tahmid/Bhai (senior Labrador) | 07 |
| Mockup 35: "Glucose check 5.8 mmol/L", "2h 15m", Day 3 6:14pm, "3 of 9 days" | 35 |
| Mockup 36: "11:42pm · Eid-4", "2 of 4", dose "2u" | 36 |
| Names "Bibi", "Ayaat" embedded in UI strings (toasts, helpers) | 3.4, 3.6, 3.7 |
| Eid dates (Aug 25 - Sep 2; Mar 28 - Apr 5) | 3.2, 07 |
| "Payout cadence Bi-weekly" and "MFS typically 1-2 business days" presented as facts | 3.10 |

All of the above must come from live data (or be removed) in the implementation; none should appear as placeholder-in-production.
