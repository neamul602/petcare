# UI Analysis - Scenario 05: Off-Platform Defection - The Loop-Closer

Sources read in full: scenario file, 13 page outlines (`5.x.md`), 13 page specs (`5.x.spec.md`), first 150 lines of `_validation-report.md`, PRD sections (FR-14..FR-30, FR-36..FR-50, NFR-1..NFR-26, UJ-1/UJ-4, OQ-1..OQ-5, SM-C1..C5 as defined in PRD). Mockups glanced: `57-acute-event-trigger.html`, `08-acute-event.html`, `47-review-moderation-queue.html`. All other pages are spec-only. Written spec wins over mockups; conflicts are listed per page and in section "Cross-cutting conflicts". "(inferred)" marks my inference, not source text.

Conventions: "spec" = `<id>.spec.md`; "Sx" = spec section/state; every page spec carries `spec_status: validated - 2026-08-31 - WDS Phase 4 [V]`; every outline carries `status: outlined`. Scenario frontmatter: `status: validated`, `design_status: complete`, `pages: [12,13,14,16,17,26,29,36,42,43,44,45,46]`.

IMPORTANT, applies to every page: the scenario/spec FR and SM numbers do NOT match the PRD numbering (see "Cross-cutting conflicts" C1-C3). I cite the spec's own anchor first, then the PRD FR that actually defines the behaviour (marked "PRD:").

---

## Scenario-level notes

- Scenario premise: 4-6 weeks after Scenario 01 (Bibi / Tito / Rashid Eid stay). Three personas: Bibi (owner), Rashid (provider), Ayaat (admin).
- Scenario's "linear path" (Q8) lists 13 steps; step 4 ("In-stay view... covered by scenario 01") is odd because 5.1 is a full spec here.
- Climax: second booking lands on-platform via "Book again" pre-fill (Scenario 02 / page 2.2) in under 4 minutes (PRD UJ-4, SM-15).
- Anchors cited by scenario: FR-36, FR-48, FR-50, FR-49, FR-10, A-14, SM-C1, SM-C2, SM-C5.
- Device: owner and provider mobile primary; admin desktop.
- Mockups for this scenario: only 5.7 has a direct mockup (57). 08 is a different acute-event form (appears to belong to another page, not named in scenario 05). 47 is the admin-side counterpart of 5.4 (page 4.7).

---

# PAGE BLOCKS

---

## 5.1 In-Stay View (Owner)

1. **Identity.** Page 5.1 - In-Stay View (Owner) - Role: owner (must own booking) - Route `/owner/stays/:bookingId/in-stay` - Mockup: spec-only - Spec status: validated 2026-08-31; outline `outlined`; platform mobile (390px).
2. **Purpose.** Bibi sees daily updates, chats with the provider and reaches the vet-clinic directory while the pet is in care ("structural answer to Radio-Silence fear").
3. **UI components.** `{card.elevated}` (status card, vet directory card), `{card.muted}` (feed entries), `{sticky-action-bar}` (3 quick actions), `{button.primary,size.md}` (Open chat), `{button.variant.secondary}` (Vet directory), `{button.variant.destructive}` (Report an issue), `{button.primary,size.lg}` (Mark complete), `{badge.warning}` (update-due), `{success}` status indicator with gentle pulse, `{info-soft}` (last-day banner), `{vet-clinic-entry}`, `{image.aspect-square}` (entry photo), `<ol>` feed, `role="dialog"` photo modal, confirmation modal (`{modal.standard}` inferred), header with back + menu.
4. **User actions.**
   - Back to "Stays".
   - Menu (⋯) - contents unspecified.
   - Open chat (shows unread count) -> booking-scoped chat (destination page not named; PRD FR-44).
   - Vet directory -> scrolls/jumps to pinned directory section (spec: "pinned section also reachable").
   - Report an issue -> 5.3.
   - Tap entry photo -> enlarged modal.
   - Tap vet phone -> `tel:` link.
   - Mark complete (last day only) -> confirmation modal -> 5.2 (cross-link); confirm text "Mark {pet}'s stay complete? This enables the review form (1+ photo required)".
   - Acute-event banner CTA -> 4.2 view.
   - "Report under investigation" indicator -> 5.3 status.
5. **States.** S1 in-stay (feed, chat, vet dir; Mark complete hidden) - S2 last day (banner + Mark complete enabled + confirm modal) - S3 update pending (badge, soft "provider typically posts by {time}", no blame) - S4 issue-reported (Report CTA disabled; "Report under investigation · admin notified · payout frozen") - S5 acute-event-active (red banner "Acute event: {event} · provider is following the runbook" -> 4.2) - S6 mark-complete-confirm modal - S7 offline ("Connection slow · showing cached from {time}"; vet dir from cache, last cached updates). Loading: 5.13 In-Stay skeleton (status card, feed placeholders, vet directory). Empty: 5.12 "Today's update is pending". Error: not defined on this page beyond offline (see Q).
6. **Data displayed.** Booking: pet name, provider display name + neighborhood ("Rashid M. · Gulshan"), day N of M, status (In stay), last-update summary + relative time, next-update-due time. Daily update entry: day number, timestamp, photo, provider-authored structured note, verified indicator "✓ verified by owner view". Chat: unread count. Vet entry: name, distance, open status/hours, phone. Source entities: Booking, DailyUpdate, ChatThread, VetClinic (Launch-Neighborhood directory), AcuteEvent (flag), Report (flag).
7. **Data captured.** None on this page except actions (open chat, confirm mark-complete). No form inputs.
8. **Transitions/navigation.** Mark complete -> 5.2 route `/owner/stays/:bookingId/complete`. Booking state implied: `in-stay` -> owner-initiated completion request -> `completed` (see Q: PRD FR-19 says the PROVIDER marks completed). Report -> 5.3 (payout freeze occurs on 5.3 submit). Acute event -> 4.2. Stay-list back -> "Stays" list (page not in this scenario).
9. **Validation.** Mark complete enabled only on last day (`aria-disabled="true"` + `aria-describedby` otherwise). No text validation.
10. **Integrations.** Push subscription channel `in-stay.{bookingId}`; polling every 60s for new daily updates; photo storage (daily-update photos, thumbnails); notifications (push); IndexedDB offline cache (vet directory + last 5 daily updates + booking metadata); vet directory pre-fetched at booking confirmation.
11. **Business rules.** Poll 60s; offline cache = vet directory for last-viewed booking + last 5 updates; vet directory = 1 primary + 2 alternatives (spec Next Steps; layout shows "[3 more nearby]" - inconsistent); Mark complete only last day; no auto-marking complete ("Ayaat decides"); old updates never removed; last-update timestamp always visible; late update = soft language, no blame; do not reveal provider's other bookings; no dispute/review inputs on this page.
12. **Bilingual.** Full EN+BN table for header, status, pending badge, quick actions, feed header, verified label, vet header, last-day banner, CTA, confirm modal, issue-reported, acute banner, offline. Vet entry block is language-neutral ({name} · {distance} · {open-status} · {phone}). Provider-authored note text and vet info stay in source language (5.10 disclosure). Bangla header shape: "{provider}-এর কাছে {pet} · {M}-এর {N} দিন". Mixed: Bangla confirm modal keeps "(1+ ছবি আবশ্যক)" with Latin digits; Bangla uses Latin digits throughout the 5.1 table (vs Bangla numerals in 5.5 and 5.7 - see C10).
13. **Assumptions.** Updates arrive about daily around 9pm; owner has connectivity at least intermittently; vet list can be prefetched; "Day N of M" derivable from stay dates; unread count available.
14. **Gaps/questions.**
    - "Mark complete" by owner vs PRD FR-19 provider marks complete; and 5.2 gate says "only after provider confirms completion OR after dispute window opens post-stay-end" - circular/unclear. "Ayaat decides" in must-not list contradicts owner action.
    - Status card shows both "Last update 2h ago (9:14pm entry)" and "Update due badge ⏳ pending" and "next update due 9pm today" - sample data contradicts itself.
    - "✓ verified by owner view" - meaning undefined (inferred: owner has viewed it); PRD FR-43 has no verification concept; also no read receipts (PRD FR-43 out of scope "real-time Owner presence / read receipts").
    - Chat destination page/route not specified; chat audit "available to Admin" is only in outline.
    - Vet phone shown as "+880-XXX-XXXX" placeholder; directory data source/refresh owner (PRD FR-45: Admin-owned).
    - Offline write behaviour (chat messages) not defined.
    - Acute-event banner points to "4.2 (provider-side runbook is Ayaat's)"; owner would land on an admin runbook view? Owner-visible event view not defined. PRD FR-26 says owner notified in-app + SMS/push fallback.
    - Daily updates may be photo, short video or note (PRD FR-43); spec shows photo + structured note only. "Structured note" fields undefined.
    - Report disabled in S4 but PRD FR-24 allows one report per booking so this is consistent; but Report allowed DURING the stay? PRD FR-24 opens the window after completion (or early on acute event, FR-29).
    - Scenario Q8 calls 5.1 "covered by scenario 01" but is specified again here (potential duplicate of another scenario's page - see "in-stay" in 3.5/1.x).

---

## 5.2 Booking Completion Confirmation (Owner Reviews)

1. **Identity.** 5.2 - Booking Completion Confirmation / Mark stay complete - Role: owner - Route `/owner/stays/:bookingId/complete` - Mockup: spec-only - validated 2026-08-31; mobile.
2. **Purpose.** Owner confirms the stay went as expected and leaves a verified review with photos from the stay (the "demonstrated-Fit accumulator").
3. **Components.** `{card.elevated}` (step 1 and step 2), radio group (native), `{rating-stars}`, `{input.textarea}`, `{photo-upload}`, `{image.aspect-square}` thumbnails, native checkboxes (care specifics), `{button.primary,size.lg}` (Submit), `{info-soft}` (skip panel), `{button.variant.link}` (Skip), `{modal.standard}` (skip confirm), toast, spinner.
4. **Actions.**
   - Back to in-stay.
   - Step 1 radio Yes -> reveals step 2.
   - Step 1 radio No -> routes to 5.3 (independent flow).
   - Set rating 1-5 stars.
   - Type review text.
   - Add photo (camera or library, `accept="image/*" capture`).
   - Tap thumbnail -> removes photo.
   - Tick care-specific checkboxes (glucose readings handled per instructions; medication on schedule).
   - Submit review -> pending -> success toast "Review submitted · thank you · moderation may apply" -> dashboard.
   - Skip for now -> modal "Skip your review? You can add one later from your stay page" -> confirm -> dashboard; review marked "skipped, allowed to add later".
5. **States.** S1 just-completed (step 1 only) - S2 yes-selected (step 2 shown; submit enabled when valid) - S3 no-selected (route to 5.3) - S4 submit-pending (disabled + spinner "Submitting your review...") - S5 submit-success - S6 skip-confirmed - S7 review-moderated (cross-link to 5.4). Error/offline/empty/loading states: not defined (gap).
6. **Displayed.** Booking summary: pet, provider, period, N days, amount ("Tito stayed with Rashid · Eid 2026 · 9 days · BDT 16,830"). Species-specific placeholder text and checklist items (backend-driven per pet species). Source: Booking, Pet, Provider, Payment (amount).
7. **Captured.** Completion confirmation: radio yes/no, required. Rating: integer 1-5, required. Review text: textarea, min 20 chars to submit (spec says both "optional min 20 chars" in object table and "disabled until rating + 1+ photo + text"). Photos: 1+ required, from camera/library, compressed client-side < 800 KB each (max count not stated). Care specifics: optional checkboxes, backend list per species (examples: glucose, medication). All tied to booking id.
8. **Transitions.** No -> 5.3. Submit -> Review created, goes to admin moderation queue (4.7) -> outcome visible at 5.4. Skip -> dashboard. Booking state: shown as `completed` gate; review may be submitted only after completion (PRD FR-20).
9. **Validation.** Submit disabled until rating + >=1 photo + text (>=20 chars; hint shown under 20 chars - "gentle hint", text not specified). `aria-disabled` with `aria-describedby`. No error message strings defined for failed submit or upload.
10. **Integrations.** Photo storage (upload, compression), notifications (post-stay push deep-links to this page), moderation queue (4.7) receives submission.
11. **Business rules.** 1+ photo mandatory; review text min 20 chars; photo < 800 KB; review independent of dispute (Brief §3); no star-optimisation display; reviews visible to others only after moderation passes; one review per booking (PRD FR-20); no pressure CTAs; no comparison to other providers; skip allowed with reminder.
12. **Bilingual.** Full EN+BN table including species-parametrised copy ("{species}-এর অন্যান্য মালিকদের..."). Review text is user-authored (language unspecified). Bangla page header "থাকা সম্পন্ন চিহ্নিত করুন". Bangla skip CTA "এখন জন্য এড়িয়ে যান" (awkward, review). Hard-coded diabetic wording in layout ("owners with diabetic small dogs") is replaced by {species} in content blocks - fixed copy conflict.
13. **Assumptions.** Owner has photos from the stay (they are the owner, not the provider - so "photos from the actual stay" presumably come from provider daily updates or owner visit/pick-up; inferred); camera available; the provider name and pet species are known.
14. **Gaps.**
    - PRD FR-21: only rating is required, photos and text optional; spec requires 1+ photo and min 20 chars. PRD brief-level "photos are Day-1 trust differentiator" but not a gate. Needs decision.
    - PRD FR-21: "does not accept photos uploaded outside the Stay window" - spec does not say how that is enforced (EXIF? upload time?).
    - Gate text ("after provider confirms completion OR after dispute window opens post-stay-end") conflicts with PRD FR-19/FR-20 and with 5.1 owner-initiated Mark complete.
    - Step 1 "No" routes to 5.3 which then needs "completed" state; if booking not yet completed, how does dispute window apply?
    - Skip: reviews can be "added later from stay page" - no deadline or reminder cadence defined; "allowed but reminded" - reminder mechanism not defined.
    - Max photos, accepted formats beyond image/*, upload failure/offline handling undefined.
    - Review text language not defined.
    - Rating label states "1 star · tap to set" in layout (default shown as 1 star?) - default value undefined.
    - Dashboard destination not named (owner dashboard).

---

## 5.3 Issue Report ("Report an Issue")

1. **Identity.** 5.3 - Issue Report - Role: owner - Route `/owner/stays/:bookingId/report` - Mockup: spec-only - validated; mobile.
2. **Purpose.** Independent dispute trigger within the dispute window; freezes provider payout; does not retroactively affect reviews.
3. **Components.** `{card.muted}` (countdown, category, description, photos), native radios, `{input.textarea}`, `{photo-upload}` plus file upload, `{info-soft}` (independent-records notice), `{sticky-action-bar}` + submit button, window countdown (`{success}`/`{warning}`/`{destructive}`), `{muted-foreground}` expired text, spinner, `role="status"` countdown.
4. **Actions.**
   - Back to in-stay.
   - Select category (1 of 6).
   - Type description.
   - Add photo (and add file).
   - Submit report -> pending -> success "Report submitted · admin will respond within 48 hours · view status" -> dashboard.
   - Expired state: review CTA -> 5.2.
   - Already-reported: "view-status CTA".
5. **States.** S1 within window (green) - S2 near-window (orange "⚠ {N} days remaining · prioritize") - S3 last day (red "🔴 {N} day remaining · escalate") - S4 expired (fields disabled; "Dispute window expired · leave a review instead"; review CTA -> 5.2) - S5 already-reported (fields replaced by "Your report is being investigated by Admin · payout frozen") - S6 submit-pending ("Submitting your report...") - S7 submit-success. Error: none defined for submit failure (generic 5.11 retry assumed, inferred). Loading/offline not defined.
6. **Displayed.** Window end date, days remaining, color tier; category list; independent-records notice; (already-reported) report status. Source: Booking (completion date), DisputeWindow (derived), Report.
7. **Captured.** Category: single select, required, enum of 6 {Medication mishandled, Food not followed, Injury during stay, Behavior / care quality, Safety concern, Other}; description: text, required, min 30 chars; photos/evidence: optional, photo + file upload (images and PDF), max 5 photos, client compression. ("Other" has "free-text" per Next Steps but there is only one description field; unclear.)
8. **Transitions.** Submit -> Report created -> payout state `frozen` -> admin dispute queue (4.6) -> booking state moves toward disputed (PRD FR-14/25 `resolved`/`refunded`). Admin response within 48 hours. Back -> 5.1. Expired -> 5.2. Review remains available after dispute (cross-link 5.2).
9. **Validation.** Submit disabled until category + description (>= 30 chars) valid; char count via `aria-describedby`; no per-field error strings defined; window expiry polled every 60s (form flips to expired state live).
10. **Integrations.** Photo/file storage (evidence), notifications (admin notified; owner confirmation), payment/payout system (freeze payout - NFR-23 logging), audit log (decision logged, FR-50 anchor per spec).
11. **Business rules.** Window = 7 days from booking completion (spec); color shifts at 2 days (orange at <=2? exact boundary: "shifts at 2 days"); one report per booking (PRD FR-24); admin SLA 48h; no auto-resolution; not publicly visible; provider not penalised until resolved (frozen, not penalised); no comparison with other disputes; review independence; countdown refresh every 60s. Orange copy shows "{N} days remaining" and red "{N} day remaining".
12. **Bilingual.** Full EN+BN. Bangla for "prioritize/escalate" is transliterated ("এসকেলেট"). Banner uses "Brief §3" literal inside user-facing copy (internal reference leaking into UI; see Gaps). Bangla "বিতর্ক উইন্ডো" for dispute window (vs 5.6 "বিতর্ক"). Evidence file names user-authored.
13. **Assumptions.** Owner can only report after completion; one report per booking; admin can respond in 48h; "completion" date well defined.
14. **Gaps.**
    - Dispute-window duration is PRD Open Question OQ-2; spec fixes 7 days (and 5.10 refers to "dispute-7 window"). Needs sign-off.
    - PRD FR-29: acute event opens dispute window EARLY (before completion); spec only supports post-completion window - no early-window state.
    - Spec labels "🔴 {N} day remaining" and color thresholds (orange at what N?) undefined precisely.
    - "Brief §3" shown to end users in copy.
    - Category "Other" needs free text but only one description field; admin mapping of categories to FR-25 outcomes not defined.
    - Max file size, PDF allowed (`accept` includes PDF) vs "photos/screenshots" copy.
    - What happens to window countdown timezone (Asia/Dhaka inferred).
    - Frozen-payout visibility to owner: copy says "payout frozen" - owners seeing provider payout state is a privacy question.
    - "Admin will respond within 48 hours" is a new SLA not in PRD.
    - PRD FR-24 owner appeals of resolution deferred; no page for owner to see resolution outcome (only "view status" CTA, destination undefined).

---

## 5.4 Review Moderation Result View

1. **Identity.** 5.4 - Review Moderation Result View - Role: owner (must own review); admin can view (per must-not list "owner + admin only") - Route `/owner/reviews/:reviewId/moderation` - Mockup: spec-only (admin-side counterpart is mockup 47 = 4.7) - validated; mobile.
2. **Purpose.** Transparency: owner sees admin's moderation outcome (approved / edited / removed), reason, appeal path and audit trail.
3. **Components.** `{card.muted}` (booking ref, original review, audit trail), `{card.elevated}` (outcome detail), `{success-soft}`/`{warning-soft}`/`{destructive-soft}` banners, `{info-soft}` (appeal), `{button.variant.link}` (appeal CTA), `{typography.scale.sm mono}` audit id with copy-to-clipboard, `<article>`, `<dl>`, stars display.
4. **Actions.**
   - Back to care history.
   - Appeal mechanism -> appeal form (out-of-scope spec; "should require reason + new evidence").
   - Copy audit id.
   - Policy reference link -> policy doc.
   - Menu.
5. **States.** S1 approved (default; no banner; no appeal) - S2 edited (warning banner "⚠ Edited for {reason}"; original + edited version; appeal CTA) - S3 removed (destructive banner "🔴 Removed — {reason}"; original still visible; reason, category, date removed, decider; appeal CTA primary) - S4 appeal-submitted ("Your appeal is being reviewed by a different admin") - S5 appeal-upheld ("Appeal upheld · review restored"; removed -> re-published, edited -> full version restored) - S6 appeal-denied ("Appeal denied · decision stands · no further appeal"). Static after moderation; no polling. Loading/error/empty undefined.
6. **Displayed.** Booking reference (pet's stay with provider, period); outcome status; original review (rating, submitted date, text, photos); edited remaining text; specific reason; reason category (taxonomy); date removed; decider "PetCare Admin"; audit: decision date, decision id, policy section. Source: Review, ModerationDecision, AuditLogEntry, Appeal, Booking.
7. **Captured.** None on this page. Appeal form (not specified): reason + new evidence (inferred from Next Steps).
8. **Transitions.** Approved -> published to provider profile. Edited/Removed -> appeal -> new admin (different from original) -> upheld/denied (final). Navigation: 5.2 cross-link when moderated; care history; 4.7 admin side.
9. **Validation.** None on page. Appeal-form validation unspecified.
10. **Integrations.** Notifications: push for moderation outcome deep-links here; audit log (FR-50 anchor / PRD FR-37).
11. **Business rules.** Critical reviews protected unless documented policy violation (SM-C3 per spec); original text never hidden from owner; reason always disclosed; appeal reviewer must differ from original moderator; appeal decision final; no penalty for appealing; page not public; reason taxonomy parallel to 4.7: abuse / off-topic / low-effort / doxxing / impersonation (4.7 mockup lists abuse, off-topic, low-effort; PRD FR-23 adds off-platform contact details).
12. **Bilingual.** Full EN+BN. Placeholders {reason}, {specific-reason}, {taxonomy-category}, {policy-section} must be bilingual (taxonomy labels need BN) - not provided. Review text is user-authored. Admin names "PetCare Admin" translated as "PetCare অ্যাডমিন" - while admin console is English-only (PRD NFR-13), these owner-facing strings are legitimately owner-side.
13. **Assumptions.** Owner is notified of moderation; every review goes through moderation; admin always provides a reason; an appeal workflow and second admin exist (v1 has ONE admin).
14. **Gaps.**
    - PRD FR-23: no owner appeal path; FR-23 out-of-scope says provider dispute of reviews deferred; PRD FR-24 owner appeal deferred (reports). Owner appeal of review moderation is new scope. Also "different admin" cannot exist in a single-admin v1 (PRD FR-31/Operating Ceiling 1 admin).
    - Sample data contradiction: "Tito's stay with Rashid" but review text names "Kamrul" (and mockup 47 says "Tito's Eid stay with Kamrul"); also this sample review is a 3-star review that does not mention photos though 5.2 requires 1+ photo.
    - "SM-C3" in PRD = Average Star Rating as reputation signal (counter-metric); spec uses it as "critical reviews protected" - related but reworded.
    - "Approved" state shows no banner; so the page is only reachable if edited/removed? Owner entry from care history for approved reviews - purpose unclear.
    - Moderation timing/SLA not specified; pre-moderation vs post-moderation: 5.2 says others see it only after moderation passes; PRD FR-23 says renders once submitted "subject to moderation".
    - Edit moderation: only "last sentence redacted" shown; edit diff format undefined; "edited version beneath" vs "remaining review" copy.
    - Appeal CTA copy "Appeal mechanism →" is design-language (not user-friendly).
    - Conflicts with mockup 47: mockup removal reasons abuse/off-topic/low-effort; includes bulk-view pattern. Mockup shows admin must acknowledge SM-C3 for <=3-star reviews before removing. Not a conflict but a 5.4 transparency rule needs the same reason taxonomy.

---

## 5.5 Notifications Inbox (Owner)

1. **Identity.** 5.5 - Notifications Inbox (Owner) - Role: owner - Route `/owner/notifications` (tab bar + push deep-link) - Mockup: spec-only - validated; mobile.
2. **Purpose.** Single owner inbox; its re-engagement section is "the defection-prevention surface".
3. **Components.** Header with "Mark all as read" `{button.variant.link}`; section headers (sticky) with `{badge.destructive}`/`{badge.warning}`/`{badge.success}`; `{card.elevated}` (action, re-engagement with `{success-soft}`), `{card.muted}` (updates, past); unread dot (`{destructive}`/`{warning}`/`{success}`); `{button.primary,size.md}` (re-engagement CTA); `{button.variant.destructive}` (acute-event CTA); `<details>` Past; filter chip (State 2); toast; empty state illustration.
4. **Actions.**
   - Mark all as read -> clears unread dots + toast; logged to audit trail.
   - Tap notification -> relevant page.
   - "View booking" -> booking configuration (1.6).
   - "View event" -> 4.2 (opens in-stay with event highlighted per a11y).
   - "Book in under 4 min →" -> 2.2 Book Again path.
   - Filter chip "action required only".
   - Expand "Show {N} past notifications".
   - Menu.
5. **States.** S1 default (action first, re-engagement highlighted) - S2 action-required-only filter - S3 acute-event-active (pinned at top, red) - S4 re-engagement-active (prominent CTA, "climax beat") - S5 mark-all-read (toast) - S6 empty ("No notifications · We'll let you know when something happens") - S7 high-volume (group by day, "{N} updates today · grouped by day") - S8 past-collapsed. Loading: 5.13 inbox skeleton. Error/offline not defined.
6. **Displayed.** Per notification: icon, title, brief, timestamp (time-ago), unread dot; section counts. Examples: booking confirmed (id PC-2026-0007, provider, time, "Eid stay · 9 days · BDT 16,830"), acute event (type, "Started 11:02pm · Admin notified"), daily update (day, text excerpt), booking confirmation reminder "payment due", re-engagement "Tito's care history is waiting - Book in under 4 minutes - your last booking with Rashid", past: booking completed, review approved. Source: Notification, Booking, AcuteEvent, DailyUpdate.
7. **Captured.** None (read-state toggles only).
8. **Transitions.** Notification tap -> booking/in-stay/issue pages; re-engagement -> 2.2; acute -> 4.2. Booking state events surfaced (confirmed, completed). Push deep-link preserved (tap opens relevant section).
9. **Validation.** n/a.
10. **Integrations.** Push (`notifications.owner.{userId}`), polling every 30s, in-app notifications, SMS/email per 5.10 preferences (sending side not defined here), audit log.
11. **Business rules.** Section order: Action required, Updates, Re-engagement, Past; max 1 re-engagement nudge per booking per 60 days; no auto-mark-as-read on view; no notifications for bookings older than 6 months (archive); no urgency-bait, pressure CTAs, platform comparison, or other owners' activity; Past collapsed by default; Section counts shown.
12. **Bilingual.** Full EN+BN. Bangla re-engagement copy uses Bangla numeral "৪" ("৪ মিনিটের নিচে") whereas the CTA elsewhere says "under 4"/"4"; section name "পুনঃ-সংযুক্তি". Notification text for daily updates embeds provider-authored text ({text}) in source language. Emoji severity icons in headers.
13. **Assumptions.** Push notifications permitted; 60-day cap enforced server-side; "under 4 minutes" is achievable and true (PRD says SM-15 is a metric, not a requirement); owner has 12 past notifications.
14. **Gaps.**
    - "Book in under 4 min" is a performance claim in UI copy; PRD notes under-4-minutes is a Success Metric (SM-15), not a functional requirement - claiming it in copy is a trust risk if not measured.
    - Re-engagement trigger rule undefined (who/what decides to send: admin playbook 5.8, provider nudge 5.6, or automatic?). 5.8 says "no auto-intervention (every nudge is admin-initiated)"; 5.6 says provider-initiated; 5.5 implies system "care-history nudge".
    - Section label "Action required" includes "Booking confirmed" (informational) - classification rule undefined.
    - Layout shows "Booking confirmation reminder · payment due" in Updates: contradicts PRD FR-39 (no payment due after confirmation: payment captured on confirmation).
    - "Past" collapsed but layout shows it expanded.
    - Notification types and event catalogue undefined (a list of events is only implied).
    - "6 months archive" vs PRD FR-10 retention (24 months audit log); archive behaviour (visible elsewhere?).
    - 5.5 and 5.9 overlap: 5.9 says it is the role template and 5.5 the owner specific; duplicated spec.
    - FR-50 anchor on 5.5 ("soft-signal capture - this is where nudges land") is a mismatch; PRD FR-50 is about capturing signals, not delivering nudges.
    - SMS fallback for acute alerts (PRD FR-26) not shown in inbox.

---

## 5.6 Payouts + Earnings View (Provider)

1. **Identity.** 5.6 - Payouts + Earnings View - Role: provider - Route `/provider/payouts` (drill-down `/provider/payouts/:bookingId` out of scope) - Mockup: spec-only - validated; platform desktop (1280px) (outline says desktop; scenario says Rashid is mobile primary - see gap).
2. **Purpose.** Rashid sees payout state per booking with predictable cadence, plus profile-view stat and a provider-initiated re-engagement action.
3. **Components.** `{card.elevated}` (3 summary cards, profile views), `{card.muted}` (table, re-engagement), `{warning-soft}` frozen notice, `{success-soft}` re-engagement, sortable `<table>`, `{badge.success}`/`{badge.warning}`/`{badge.neutral}` state badges, trend indicator, `{button.primary,size.md}` (send nudge), "View profile" link, `role="status"` frozen notice.
4. **Actions.**
   - Back to dashboard.
   - Sort table columns.
   - Row click -> drill-down (out of scope).
   - Frozen notice link -> 5.3 (cross-link "see 5.3" - provider cannot access owner route; destination for provider unspecified).
   - View profile -> provider profile (3.9 cross-link).
   - Send re-engagement nudge -> nudge composer (out-of-scope spec) -> confirmation "Re-engagement nudges sent to {N} past owners" + log.
5. **States.** S1 default - S2 frozen-payouts-present - S3 profile views trending up (green, "Fit deepening") - S4 trending down ("Profile views down {N}% · consider adding photos") - S5 re-engagement available (CTA enabled) - S6 re-engagement sent. Pending state badge exists ("⏳ pending (within dispute window)"). Loading/empty/error not defined (empty month, no payouts unspecified).
6. **Displayed.** Period header and net total; Gross, Commission (15%), Net with booking counts; frozen amount and dispute count; per-booking rows: date, booking id (PC-...007), pet (owner name) e.g. "Tito (Bibi)", gross, commission, net, state (paid/frozen/pending); profile views this month + % change + narrative; count of past owners with care-history visible. Source: Payout, Booking, Provider, ProfileViewAggregate, Owner (name shown to provider), Report (frozen).
7. **Captured.** None on page; composer (out of scope) will capture nudge content/audience (inferred).
8. **Transitions.** Payout states: pending (within dispute window) -> paid; pending/paid -> frozen (dispute) -> released/refunded after admin resolution (PRD FR-25/41/42). Nudge send -> notification to past owners (their 5.5 re-engagement). Cross-links: 5.3, 4.8 reconciliation (admin), 3.9.
9. **Validation.** n/a (read-only). Nudge limit "max 1 per owner per 60 days" enforced in composer.
10. **Integrations.** MFS payout (bKash/Nagad; PRD FR-40/41) - state displayed only; notifications (re-engagement nudge to owners; payout updates push on `payouts.provider.{userId}`); polling 6h; profile views aggregate endpoint (daily update); payment gateway data (capture/commission).
11. **Business rules.** Commission 15% (hard-coded in header text "Commission (15%)"); Net = Gross - Commission; payouts only shown after dispute window or admin release; read-only; no payment modification; no other providers' payouts or profile views comparison; no auto-sent nudges (provider-initiated); max 1 nudge per owner per 60 days (composer); profile-views aggregate updated daily; table sortable; pending/paid/frozen badges.
12. **Bilingual.** Full EN+BN, including numerals formatting: layout uses lakh grouping "BDT 5,25,725" (Indian/Bangladeshi digit grouping); content blocks use "BDT {X}". Bangla table uses mixed Latin digits; "ফিট সিগন্যাল" transliteration of "Fit signal". Owner/pet names inside rows are user data.
13. **Assumptions.** Provider monthly view; weekly or other cadence (OQ-3 directional default: weekly batched MFS payouts); 15% flat commission; profile-view tracking exists; provider can see the owner's first name.
14. **Gaps.**
    - Commission 15% hard-coded; PRD FR-41 and NFR-25: values are architecture-stage, Tier-A/B may differ, static in v1. The UJ-4 "15% discount" in PRD is unrelated (provider's off-platform offer).
    - PRD FR-49 out of scope: "Provider-initiated repeat-Owner outreach (deferred; defection detection is the v1 mechanism)". 5.6 introduces provider-initiated nudges: direct conflict. Also conflict with 5.8 "every nudge is admin-initiated" and "No auto-intervention".
    - PRD SM-C5 = Provider Earnings as a success signal (counter-metric): an "Earnings" page headlining net totals and profit trends sits close to this counter-metric; in v1 the PRD accepts off-peak trough as a feature.
    - "Payouts + cadence visible" but no cadence field is displayed (payout date/next payout date/method not shown; only state). OQ-3 unresolved.
    - Sample 47 bookings in a month for one provider vs PRD operating ceiling 75 completed bookings/month platform-wide.
    - Profile views stat "Fit signal" - PRD NFR-26: Demonstrated Care Fit captured but not consumed in v1 ranking; narrative "reviews are deepening your Fit signal" may over-promise; profile view analytics not defined in PRD.
    - Frozen payout lines reveal the dispute but not whether the provider can respond (PRD: provider counter-evidence deferred).
    - Provider sees owner name+pet name ("Tito (Bibi)"): fine for own bookings; "past owners with care-history visible" implies provider sees owners' care history after the booking (PRD FR-9?) unclear.
    - Platform: desktop-primary but Rashid is mobile-primary per scenario Q5 (provider on mobile) - mobile layout of a 6-column table not given.
    - Frozen amount equals one booking's gross (16,830) not net - minor.
    - "Re-engagement offer available during off-peak week" - "offer" content (discount?) undefined; PRD says no repeat discount/loyalty pricing in v1 (FR-48 out of scope).

---

## 5.7 Acute-Event Trigger Surface (Provider)

1. **Identity.** 5.7 - Acute-Event Trigger Surface - Role: provider (assigned to booking) - Route `/provider/stays/:bookingId/report-event` (from 3.5 in-stay management and emergency banner) - Mockup: `57-acute-event-trigger.html` (header banner "R-10 LAUNCH-BLOCKING"); related different design `08-acute-event.html` - validated; mobile.
2. **Purpose.** Provider starts the Acute-Event Runbook with a predefined category, description and severity self-assessment.
3. **Components.** `{card.elevated}` (runbook notice, category), `{card.muted}` (pet context, description, severity), native radios, `{input.textarea}`, `{sticky-action-bar}` (Confirm), `{modal.alert}` `role="alertdialog"`, `{button.variant.link}` (Cancel), spinner, `role="status"` notice.
4. **Actions.**
   - Back to in-stay (3.5).
   - Select category.
   - Type description.
   - Select severity.
   - Confirm trigger -> confirm modal -> Confirm inside modal -> "Starting the runbook..." -> routes to 4.2.
   - Cancel -> "Are you sure? If the pet needs urgent care, please call the vet directly" -> back to in-stay management.
   - Retry on error / contact Ayaat via phone number.
5. **States.** S1 default (Confirm disabled) - S2 valid form (Confirm enabled, opens modal) - S3 confirm-modal-open - S4 submit-pending - S5 submit-success (route to 4.2; step 1 pre-checked; message "Runbook started · admin is now in step 3 (admin role) · owner will be notified · timeline begins") - S6 submit-error ("Could not start the runbook · try again or contact Ayaat directly +880-XXX-XXXX") - S7 cancel-confirm. Offline: not defined (critical gap; trigger on intermittent connectivity).
6. **Displayed.** Pet + booking context: pet, species, owner name, day N of M, neighborhood ("Tito (diabetic Shih Tzu) · Bibi's stay · Day 4 of 9 · Gulshan"), care plan summary ("glucose gel on hand"), vet name (Gulshan Vet; phone pre-populated from 5.1 directory). Runbook notice with 5-minute goal. Source: Booking, Pet, CareConfiguration, VetClinic.
7. **Captured.** Category: single, required, enum {Pet illness (sudden · not responding to care plan), Injury, Behavioral emergency (aggression · biting · escape), Death (rare but planned for)}; no "Other". Description: text, required, min 20 chars. Severity: radio {Yes - stabilized, admin can coordinate follow-up; No - admin should treat as urgent}; spec calls it "2-option radio"; whether it is required is unclear (button disabled "until category + description" only). Event time (implicit timestamp; PRD FR-26 records time).
8. **Transitions.** Confirm -> AcuteEvent created -> admin paged at top of queue (4.1/4.2) -> owner notified -> routes to 4.2 with timeline starting. Booking/payout effects not stated in spec; PRD FR-29: payout frozen, dispute window opens early, provider flagged for follow-up. Mockup 57 notice says: "The booking transitions to Disputed and payout pauses" (conflicts with spec silence/PRD). 5.1 for owner shows acute banner.
9. **Validation.** Confirm disabled until category + description >= 20 chars; char counter via aria; copy "Min 20 characters" in mockup; no error message for validation; soft timing: no penalty if >5 min.
10. **Integrations.** Notifications to admin (page) and owner (in-app + SMS/push fallback per PRD FR-26); SMS (5.10 recommends SMS for acute alerts); audit/timeline log; vet directory data; photo storage not used here (no attachments - gap).
11. **Business rules.** First timeline entry within 5 minutes (SM-20 cross-link; PRD SM-20 = median time from trigger to Admin's first documented entry); 4 predefined categories only, no improvisation; severity self-assessment feeds 4.2 step 3; no auto-resolution; human-authored entries; no comparison with other events.
12. **Bilingual.** Full EN+BN. Bangla numerals used ("৫ মিনিটের", "ধাপ ৩") here vs Latin elsewhere. Admin-facing 4.2 is English-only (PRD NFR-13) while this provider page is bilingual; description text is user-authored in provider's language and must be understandable to English-only admin (gap). "Ayaat" is named in provider-facing copy (should be the admin role, not a person; mark as a fabricated/specific name).
13. **Assumptions.** Provider has connectivity at crisis moment; 4 categories cover all events; admin can respond within 5 minutes; provider can call vet directly (cancel copy); Ayaat's phone number is available.
14. **Gaps.**
    - Mockup 57 vs spec: categories (mockup: Glucose/medical, Injury, Behavioural, Other; spec: Illness, Injury, Behavioral emergency, Death, no Other); notice time (mockup: owner/admin notified "within 2 minutes"; spec: first timeline entry within 5 minutes); title ("Something is wrong" vs "Report acute event"); CTA ("Confirm & start runbook" vs "Confirm trigger"); severity labels (Stabilized/Urgent vs Yes/No question); mockup adds a Tip linking to daily-update composer for non-emergencies and a sample description pre-filled with "237 / 20 characters" counter; mockup says booking becomes Disputed. Pet age in mockup "7 yrs" vs PRD UJ-1 Tito age 4. Spec wins.
    - Mockup 08 (event type Illness / Injury / Allergic reaction / Behavioral / Other; severity Mild/Moderate/Severe; immediate action 500 chars; vet contacted; vet directory with fabricated clinics) is a different acute-event form that does not match 5.7 at all - which does the build use?
    - PRD FR-26 categories are illness / injury / death; spec adds behavioral emergency (OK extension); PRD FR-26 also requires recording "Provider's initial observation" (matches description) and surfacing the vet-directory entry immediately on trigger (FR-28) - spec shows vet name in context but trigger-time vet directory display not specified.
    - PRD FR-29 effects (payout freeze, early dispute window, provider flag) not mentioned anywhere in the spec; owner-facing notification content not defined.
    - Spec notes "no hotline" - PRD says platform does not run a hotline; yet error state surfaces "contact Ayaat directly" with a phone - an informal hotline? Gap.
    - Offline / queued trigger for loss of connectivity not defined (PRD NFR-15 intermittent 4G).
    - Provider can add timeline entries later (4.2) - not defined here.
    - Death event: copy tone, owner notification handling not defined.
    - Spec references "R-10 launch-blocking" - PRD risk numbering: R-10 not verified in PRD; note scenario spec language only.
    - Success copy mentions "admin is now in step 3 (admin role)" - internal runbook step numbering leaks.
    - No photo attachment for evidence on acute event.

---

## 5.8 Defection Detection Dashboard (Admin)

1. **Identity.** 5.8 - Defection Detection Dashboard - Role: admin - Route `/admin/defection` (deep-link from queue dashboard trend-watch) - Mockup: spec-only (companion of 4.10) - validated; desktop (1280px).
2. **Purpose.** Ayaat sees soft signals of off-platform defection, with counter-metrics, and launches an intervention playbook before the moat dissolves.
3. **Components.** `{card.elevated}` (3 counter-metric cards), `{warning-soft}` trending banner, `{filter-chip}` (4, `aria-pressed`), `{card.muted}` (3 signal category cards), signal rows with `{warning}`/`{destructive}` dots, `{button.primary,size.md}` (Open intervention playbook), `{button.variant.link}` (per-signal Open playbook), status labels (✓ Healthy / ⚠ Watch / 🔴 Critical), `<dl>` metrics.
4. **Actions.**
   - Back to Queue (4.1).
   - Filter chips All / Owner-side / Provider-side / Cross-side.
   - Open intervention playbook (banner) -> playbook (out of scope).
   - Open playbook per signal row -> playbook.
   - Playbook produces re-engagement templates + scheduling; intervention decisions logged to audit trail (4.7).
5. **States.** S1 clean (no banner, counters green) - S2 attrition-period (trending banner + primary CTA) - S3 counter-degraded (a counter at Watch/Critical) - S4 pattern-detected (cross-side signal 🔴 high priority) - S5 filter-applied - S6 intervention-launched (signal "intervention in progress") - S7 intervention-completed (signal archived, cross-link to 4.7 audit log). Outline adds "No-patterns" clean state. Loading: 5.13 defection skeleton. Empty/error: undefined besides clean state.
6. **Displayed.** Header counts ("12 signals · 2 patterns detected"); counters SM-C1 Platform-booking share 87% (Healthy), SM-C2 Provider platform-share 94% (Healthy), SM-C5 Care-record completeness 91% (Watch); trending banner "Repeat-booking rate trending down 8%"; "12 owners with care-history ≥1 booking have not re-booked in 60+ days"; owner-side signals: 12 owners care-history viewed but no booking (30d), 5 owners unbookmarked/unsaved, 3 owners "book again" search returned zero results (capacity-supply gap); provider-side: 2 providers utilization drop 30%+ (30d), 1 provider profile views but no conversions; cross-side: 4 owner+provider pairs appeared once, no 2nd booking (🔴). Source: aggregates (Booking, CareHistory view events, SearchEvent, Bookmark/Favorite, Provider utilization, ProfileView events).
7. **Captured.** Filter selection only; intervention decisions captured in the playbook (out of scope).
8. **Transitions.** Signal -> intervention launched -> in progress -> completed/archived with audit entry. Playbook leads to owner nudge (appears in 5.5 re-engagement) and provider offer (5.9 provider re-engagement / 5.6).
9. **Validation.** n/a. Counter status thresholds (Healthy/Watch/Critical) undefined numerically (5.10 admin "defection-pattern thresholds" editable).
10. **Integrations.** Notifications (push channel `defection.signals`; polling 6h); audit log; analytics aggregates; notification send for interventions (via playbook).
11. **Business rules.** SM-C1 = bookings via PetCare / total bookings; SM-C2 = provider bookings via PetCare / provider total; SM-C5 = care records with >=1 daily update / total in-stay (spec Next Steps formulas); refresh every 6 hours; aggregate only, no per-owner/per-provider drill-down; no "spy on chat"; no pressure copy; no auto-intervention (admin-initiated); intervention not revealed to the nudged user; no sharing signals; pattern example "12 owners... 60+ days"; utilization drop threshold 30%+ (30d).
12. **Bilingual.** EN+BN content table present but PRD NFR-13/FR-47 say Admin Console is English-only; Bangla for admin is out of scope. Strings include "ডিফেকশন", "প্লেবুক" transliterations. Emoji severity.
13. **Assumptions.** Platform can know bookings made off-platform (SM-C1 denominator: "total bookings" including those off-platform - impossible to measure); can observe care-history views, searches returning zero, "unbookmarked"; utilisation computed.
14. **Gaps.**
    - PRD FR-36/FR-50: defection signals are captured only from Reports, Reviews and user feedback (R-15), the platform does NOT detect WhatsApp activity; owner-side automated pattern detection is explicitly out of scope; "bulk defection-pattern detection" out of scope. 5.8 owner-side/cross-side signals are behavioural analytics not in PRD scope.
    - PRD FR-36: dashboard "organized by Provider and by signal type", tier utilization thresholds at 30/60/90 days from onboarding; 5.8 is aggregate-only with no provider drill-down, no 30/60/90 thresholds; Admin cannot act on a specific provider. Direct conflict with "aggregate only" privacy boundary vs. re-engagement of specific providers (PRD "record re-engagement outreach against a Provider record").
    - SM-C1, SM-C2, SM-C5 mean different things in the PRD (GMV counter-metric, active-user counts counter-metric, provider-earnings counter-metric). Spec redefines them as platform-share and care-record-completeness KPIs. A-14 not verified in PRD.
    - SM-C1 "total bookings" denominator unknowable; "unbookmarked" signal and "care-history viewed but no booking" require event tracking not in PRD.
    - Mixed counts: header says "12 signals" while owner-side alone lists 12+5+3, provider 2+1, cross 4.
    - "Pairs ... appeared once" is entity-level data yet "no per-owner drill-down" - actionability undefined.
    - Admin console must be English-only per PRD; Bangla table present.
    - Playbook page (out of scope) is critical to the scenario climax but unspecified; owner/provider notification content undefined.
    - Counter thresholds numeric definitions; who edits (5.10 admin "defection-pattern thresholds").
    - Sample values 87%/94%/91%/8%/12/5/3/2/1/4 are fabricated.

---

## 5.9 Notifications Center (Cross-Role)

1. **Identity.** 5.9 - Notifications Center (Cross-Role) - Role: owner, provider, admin (role-aware template) - Route `/{role}/notifications` e.g. `/owner/notifications`, `/provider/notifications`, `/admin/notifications` - Mockup: spec-only - validated; mobile + desktop (390 / 1280).
2. **Purpose.** Role-aware notifications hub (booking events, daily updates, re-engagement, acute alerts, dispute status, queue alerts).
3. **Components.** Same as 5.5: header + Mark all as read, section headers `<h2>`, `{card.elevated}`/`{card.muted}`, `{success-soft}` accents, notification card (icon, title, brief, timestamp, unread dot, CTA link), toast, empty state.
4. **Actions.** Mark all as read; per-notification CTA -> relevant page (owner: 1.6/4.2/2.2/5.3; provider: 5.6 payouts, requests, update reminders; admin: 4.1 queue, 4.2 runbook, 5.8 pattern alerts); filter action-required-only; deep link from push scrolls to and pre-expands the item; menu.
5. **States.** S1 default - S2 action-required-only - S3 high-volume (grouped by day) - S4 empty inbox - S5 mark-all-read toast - S6 deep-link-from-push. Loading: not listed in 5.13 for 5.9 (only 5.5). Error/offline undefined.
6. **Displayed.** Sections by role - Owner: Action required, Updates, Re-engagement, Past. Provider: Action required, Daily-update reminders, Re-engagement, Payout updates, Past. Admin: Queue events, Acute-event alerts, Pattern alerts, Past. Each item icon/title/brief/time-ago/unread.
7. **Captured.** None.
8. **Transitions.** Notification CTAs deep-link to role pages; booking, payout, runbook, queue states.
9. **Validation.** n/a.
10. **Integrations.** Push channel `notifications.{role}.{userId}`; 30s polling; audit log of mark-all-read; SMS/email per settings.
11. **Business rules.** "Role-appropriate caps per notification type" (numbers undefined except re-engagement 60 days from 5.10/5.5); no auto-mark-read; no notifications older than 6 months; no urgency/pressure; unread dot semantic colors with `aria-label`; tap target 48px mobile / 40px desktop.
12. **Bilingual.** EN+BN section names for all three roles, including admin sections (conflicts with admin English-only). Notification bodies not defined for provider/admin.
13. **Assumptions.** Same notification infrastructure serves all roles; role segmentation by backend.
14. **Gaps.**
    - Admin Bangla copy vs PRD NFR-13 English-only.
    - Section color semantics inconsistent between roles (admin "Acute-event alerts" is yellow/warning while owner's acute event is red Action required; provider "Payout updates" yellow under same dot).
    - Provider "Action required" contents (incoming requests, confirm/decline with timeouts) not defined; PRD FR-16 confirmation window.
    - No notification catalogue/trigger list, no channel matrix per type (push vs SMS vs email), no per-type caps other than re-engagement.
    - 5.9 overlaps 5.5 (owner) - two specs for same route `/owner/notifications`; which wins? (5.5 more detailed.)
    - Provider "Re-engagement" section purpose (offers from admin?) undefined; "Admin Pattern alerts" source: 5.8 channel `defection.signals`.
    - Loading skeleton (5.13) covers only 5.5.

---

## 5.10 Settings / Profile (Per Role)

1. **Identity.** 5.10 - Settings / Profile - Role: owner, provider, admin (role variants) - Route `/{role}/settings` (avatar menu, footer) - Mockup: spec-only - validated; mobile + desktop.
2. **Purpose.** Per-role settings: identity verification, language, notification preferences, role-specific management, account management.
3. **Components.** `{card.muted}` per section, `<dl>` identity, ✓ verified check `{success}`, radios (language), `{info-soft}` language disclosure, `{toggle.primary-soft}` (`role="switch"`) for channels and types, disabled toggle (acute events), `{button.variant.link}` sub-section links, `{button.variant.destructive}` (Delete account, soft-delete pet), modals (delete account, edit identity inline form), toasts.
4. **Actions.**
   - Edit identity -> inline form (phone/NID/email editable, save/cancel).
   - Language toggle (Bangla / English) -> full UI re-render + confirmation toast.
   - Toggle channel Push / Email / SMS -> toast.
   - Toggle type: Booking events, Daily updates, Re-engagement nudges, Marketing emails; Acute-event alerts locked on.
   - Owner: Manage payment methods; Manage pet profiles (1.5); Soft-delete a pet profile -> removed from active lists, kept in history + audit log.
   - Provider: Manage capacity defaults; Manage payout method; Open profile editor (3.8).
   - Admin: View runbook versions (4.9); Edit thresholds (defection-pattern); Open audit log (4.7).
   - Change password; Sign out; Delete account -> modal "This is irreversible · contact support first · we'll verify by phone before deletion".
5. **States.** S1 default (language = user preference) - S2 identity-edit - S3 language-toggle (toast) - S4 channel toggled - S5 type toggled (not acute) - S6 delete-account modal - S7 soft-delete-pet. Loading/error/offline undefined.
6. **Displayed.** Name, phone (masked "+880-XXX-XXXX" verified), NID last 4 (verified), email (verified), language selection, channel and type toggle values, role-specific links. Source: User, VerificationStatus, NotificationPreference, Pet (soft-delete), PaymentMethod, PayoutMethod, CapacityDefaults, AdminConfig.
7. **Captured.** Phone/NID/email edits (text, validation unspecified; NID and email are provider-ish - owners also shown NID?), language (radio), channel booleans, type booleans, change password (form unspecified), delete-account (support flow), soft-delete confirmation; admin thresholds (out of scope page).
8. **Transitions.** Language change -> re-render, preserve current page. Soft-delete pet -> pet `soft-deleted`, preserved for dispute-7 window and care history. Delete account -> contact support first, phone verification (no self-serve).
9. **Validation.** Acute-event toggle locked at code level; frequency caps enforced at send-time; no language change without confirmation toast (toast, not confirm dialog); delete requires support flow. Identity-edit validation rules undefined.
10. **Integrations.** SMS/OTP (phone verification, edit phone - OTP presumably; not stated), notification channels (push/email/SMS), audit log (soft delete, mark-all-read), payment gateway / MFS (manage payment methods, payout method), password auth (a password exists: PRD uses phone OTP, see gap).
11. **Business rules.** Acute-event alerts cannot be disabled; re-engagement nudges <= 1 per booking per 60 days enforced at send-time; marketing emails default off (☐); SMS recommended for acute alerts; Bangla is "primary per FR-47"; some content (care instructions, vet info) stays in source language; soft-delete pet is "rare"; delete account irreversible with contact-support-first; no pressure copy to enable notifications.
12. **Bilingual.** Full EN+BN, including "● বাংলা (FR-47 অনুযায়ী প্রাথমিক)" which exposes an internal FR code in UI; English label stays "English" in both languages; admin variants bilingual (conflict C7). Soft-delete Bangla "নরম-মুছুন" is a literal translation (unclear).
13. **Assumptions.** Users have passwords (or OTP + password); NID collected for owners and providers; email exists for all; admin one user.
14. **Gaps.**
    - Auth model: PRD uses phone OTP (NFR-6; UJ-4 entry); 5.10 "Change password" implies a password credential. PRD never says passwords.
    - NID for owners: PRD NFR-6 owner verification = phone OTP minimum + name and address; NID is provider verification (NFR-7, stored separately and Admin-only). Showing "NID last-4 (verified)" for owners/admin unsupported.
    - Editing verified identity fields (phone/NID/email) has re-verification implications undefined; NID edit by provider conflicts with admin-gated vetting (PRD FR-3).
    - "FR-47 Bangla-first" displays PRD id to users; PRD says Admin console English-only.
    - Language disclosure: "care instructions, vet info stay in source language" vs PRD "full parity".
    - Soft-delete pet "dispute-7 window" implies 7-day window consistent with 5.3 but unresolved OQ-2; PRD FR-10 retention 24 months min for Care History.
    - Notification types per role not differentiated (provider types: payouts, requests, reminders); channel opt-out for SMS vs "Acute-event alerts cannot disable" - what if all channels off?
    - Payment methods page not specified (MFS bKash/Nagad linking); payout method page not specified; PRD NFR-9 gateway tokenization.
    - Admin settings "Edit thresholds" has no spec (what thresholds/units).
    - Delete-account also affects retained data (PRD FR-10) - policy undefined.

---

## 5.11 Error States (Cross-Cutting)

1. **Identity.** 5.11 - Error States - Role: all (varies per state: owner for capacity/timeout/payment/dispute-expired; all for network/load-shedding) - Route: none; inline on relevant pages (deep-linkable retry action) - Mockup: spec-only - validated; mobile + desktop.
2. **Purpose.** Failure modes handled in solution-forward, non-blaming language without breaking the linear path.
3. **Components.** Error header (back + title + menu; layout header text "Something went sideways" appears in the layout but is not in the content blocks), `{card.elevated}` illustration + body, `{typography.scale.xl}` title (`<h1>`), `{typography.scale.md}` body, `{button.primary,size.lg}` + `{button.variant.secondary}` (max 2 CTAs), inline SVG illustrations (6), cached timestamp label, manual code `{input.text}`, Save offline button, spinner.
4. **Actions.** (per template - see table). Retry (re-attempts with spinner). Save offline (queue to IndexedDB, flush on reconnect). Manual code entry (OTP). Auto-retry (exponential backoff, 3 attempts, then retry-failed). After repeated failure: "Still happening? Contact support +880-XXX-XXXX".
5. **States.** S1 capacity-exhausted - S2 confirmation-timeout - S3 payment-failed - S4 dispute-window-expired - S5 network-fail - S6 load-shedding - S7 retry-success (re-attempting, spinner, goes to success state) - S8 retry-failed (support contact CTA). Polling: retry-capable states poll every 30s for resolution. `role="status"` for retryable, `role="alert"` for terminal.
6. **Displayed.** Title, body, illustration, 1-2 CTAs, cached time {time}, support phone placeholder.
7. **Captured.** Manual OTP code (text input, format hint, visible from start of OTP flow); retry actions. Draft save for payment-failed (booking draft entity).
8. **Transitions.** Capacity -> 1.3 with widened dates or 1.6 full catalog. Timeout -> back to shortlist (1.3); hold released. Payment failed -> retry payment (1.7) or save booking as draft. Dispute-window-expired -> 5.2 or back to stay (5.1). Network fail -> retry / save offline. Load-shedding -> auto-retry OTP / manual code.
9. **Validation.** Manual code input format hint; no format defined.
10. **Integrations.** Payment gateway (authorization failed, hold released), SMS/OTP (30-60s delay, auto-retry), IndexedDB offline queue, support contact.
11. **Business rules.** Max 2 CTAs per error state; no panic/blame/urgency copy ("failed" and "Critical error" banned - yet "Payment authorization failed" title uses "failed", and "retry failed" internal); auto-retry 3 attempts with exponential backoff; 30s resolution polling; SMS may take 30-60s; manual code entry visible from start of OTP flow.
12. **Bilingual.** Full EN+BN content block per template. Missing: network "cached" body uses placeholder. Illustrations: 6 SVGs "human, simple, not corporate". Phone number placeholder.
13. **Assumptions.** Load-shedding and low-signal are common; payment gateway returns authorization failures; the platform authorises (not captures) at request (PRD FR-39).
14. **Gaps.**
    - No templates for: generic server error (5xx), 404/forbidden/auth-expired, upload failure (photo), form validation errors, booking-not-found, acute event submit-error (defined only in 5.7), payout/permission errors, SMS delivery failure after N attempts, session expiry.
    - Outline vs spec differences: outline Capacity body "No providers in Banani have full availability for these dates" vs spec "No providers have full availability" (neighbourhood dropped). Outline Dispute window "Dispute window has expired · leave a review instead" vs spec rewrote. Outline: Network "retry · save offline", "cached results from 2 min ago" vs "{time}".
    - Payment copy: PRD FR-39 payment is authorized at request and captured at confirmation; error "Payment authorization failed" fits; but 1.7 route and draft behavior unspecified.
    - Timeout copy: "Your authorization hold was released" good vs PRD FR-39 (decline/timeout releases authorization).
    - Banned word "Failed" appears in titles (self-contradiction with must-not list).
    - Load-shedding state is OTP-specific but named "Peak Eid"; what triggers it (client timeout?) not defined; a "power load-shedding" vs "SMS delay" naming confusion.
    - "Auto-retry (primary)" CTA though auto retry is already on; semantics unclear.
    - Cross-link list in Next Steps says 5.1 (network), 1.2 (load-shedding) but 5.12 reuses the same copy (copy-paste error).

### 5.11 reusable component catalogue

| Named state | Icon + title (EN) | Body (EN) | CTAs (primary / secondary) | Illustration | Applies to screens | Role/aria |
|---|---|---|---|---|---|---|
| ErrorCapacityExhausted | ⚠ No providers have full availability for these dates | Two options: try widening your dates · view the full approved catalog | Try widening dates / View full catalog | Empty calendar with date highlighted | 1.3 (shortlist), 1.6 (booking configuration) | status (retryable) |
| ErrorConfirmationTimeout | ⏱ Provider didn't respond in time | Your authorization hold was released. You can find another provider or adjust your dates | Find another provider / Adjust dates | Hourglass | 1.8 (confirmation wait) | status |
| ErrorPaymentFailed | ⚠ Payment authorization failed | Try another payment method or save as draft | Try another payment method / Save as draft | Card with subtle X | 1.7 (booking submission/payment) | status |
| ErrorDisputeWindowExpired | ⏱ Dispute window expired | You can still leave a verified review — that's how the next owner with your pet's specific care needs finds the right provider | Leave a review / Back to stay | Calendar with crossed-out date | 5.3 (and 5.1/5.2 links) | alert (terminal) |
| ErrorNetworkSlow | 📡 Connection is slow | Showing cached results from {time}. You can retry or save offline | Retry / Save offline | Signal bars at low strength | Spec says 5.1 (and generally any data page) | status |
| ErrorSmsLoadShedding | ⏱ SMS may take 30–60s | We're in low-signal areas right now. Auto-retry is on. You can also enter the code manually when it arrives | Auto-retry / Manual code entry | Clock with patience indicator | 1.2 (OTP login) | status |
| ErrorRetryFailed (suffix) | "Still happening? Contact support +880-XXX-XXXX" | - | Contact support | - | All retryable states after 3 attempts | - |
| ErrorRetrying (transient) | Spinner "Re-attempting" | - | - | - | All | status |

---

## 5.12 Empty States (Cross-Cutting)

1. **Identity.** 5.12 - Empty States - Role: varies per state (owner, provider, admin) - Route: none, inline - Mockup: spec-only - validated; mobile + desktop.
2. **Purpose.** Friendly, empowering empty states; each surfaces a real next action (not "you're missing out").
3. **Components.** Header (back + `{state-name}` + menu; layout appears as a full page), `{card.elevated}` illustration + body, `{typography.scale.xl}` title, `{typography.scale.md}` body, `{button.primary,size.md}` CTA (max 1 primary), `{button.variant.link}` secondary, inline SVG illustrations (7 "organic, hand-drawn feel").
4. **Actions.** Find care near you (-> search/shortlist 1.3, inferred); View demonstrated-Fit (provider profile section); Open chat (secondary); View Tier-A outreach queue (admin); Add reminder (provider, 3.5); none for passive-wait states.
5. **States.** S1 no-bookings, S2 no-reviews, S3 no-in-stay-updates, S4 no-applications, S5 no-past-bookings, S6 no-notifications, S7 no-daily-updates-yet. Static, `role="status"`.
6. **Displayed.** Titles/bodies with placeholders {pet}, {provider}, {species}, {time}, {N}.
7. **Captured.** Add reminder (provider reminder: time/offset undefined).
8. **Transitions.** CTA routes as above; no state changes.
9. **Validation.** n/a.
10. **Integrations.** Notifications (reminder; "We'll let you know when it arrives" push).
11. **Business rules.** Max 1 primary CTA per empty state; no urgency/shame/missing-out framing; no forcing action when passive wait is appropriate; no comparison; "1/25/75 ceiling" mention (admin copy); Tier-A anchor evidence alternative; "Pace is healthy at the 1/25/75 ceiling".
12. **Bilingual.** Full EN+BN for 7 states ("No in-stay" and others); admin variant (No Tier-B applications) bilingual though admin is English-only; "Tier-A/Tier-B" remain Latin. Duplicate/near-duplicate Bangla keys.
13. **Assumptions.** Providers have a typical posting time ({time}); Tier-A outreach queue exists; there is a "demonstrated-Fit" section above reviews on the provider profile.
14. **Gaps.**
    - Contradiction: In-stay empty (5.1) "No CTA needed · 'Open chat' secondary" vs state machine "no CTA or chat"; second in-stay (3.5) empty uses "Add reminder" primary (provider) vs same copy "typically arrives by 9pm".
    - "No reviews yet" body says Fit evidence "above" and "Tier-A badge": PRD NFR-26/FR-23 defines demonstrated care fit data captured but not consumed; "View demonstrated-Fit" destination undefined; Phase-2 note.
    - Empty states missing: no chat messages, no payouts yet (5.6), no defection signals (5.8 clean state), empty vet directory, no photos in feed, no search results (shortlist), empty pet list, no saved/favorite providers, no disputes, no reviews to moderate, no care-history pre-fill.
    - "No Tier-B applications this week / 2 Tier-A invitations queued" - hard-coded numbers in the spec body vs {N} in content blocks; "1/25/75" is PRD operating ceiling (1 admin / 25 providers / 75 bookings).
    - Headline "Today's update is pending" is used as an *empty state* but the same string is the 5.1 update-due badge; duplicate pattern.
    - Next Steps cross-link list identical to 5.11 (copy-paste: 1.3/1.6/1.8/1.7/5.3/5.1/1.2) - wrong for empty states.
    - 7 illustrations vs "6 SVGs" in 5.11.

### 5.12 reusable component catalogue

| Named state | Title (EN) | Body (EN) | CTA | Applies to | Role | Passive? |
|---|---|---|---|---|---|---|
| EmptyNoBookings | No bookings yet | Find care near you — your first verified booking starts the care history that travels with your pet | Find care near you (primary) | Owner dashboard | owner | no |
| EmptyNoReviews | No verified reviews yet | See {provider}'s demonstrated-Fit evidence above — verified care-record stats and Tier-A badge signal trusted care for {species} | View demonstrated-Fit (primary); Tier-A fallback if applicable | Provider profile (3.x / public) | owner viewing provider | no |
| EmptyNoInStayUpdates | Today's update is pending | Provider typically posts by {time}. We'll let you know when it arrives | none; "Open chat" secondary | 5.1 in-stay view | owner | yes |
| EmptyNoApplications | No Tier-B applications this week | {N} Tier-A outreach invitations queued · Pace is healthy at the 1/25/75 ceiling | View Tier-A outreach queue | Admin provider review | admin | no |
| EmptyNoPastBookings | No past bookings yet | {pet}'s first stay will appear here once it's complete. The verified review and care history will travel with them | Find care near you | 2.1 care history | owner | no |
| EmptyNoNotifications | No notifications | We'll let you know when something happens | none | 5.5 (and 5.9) | all roles | yes |
| EmptyNoDailyUpdates | No updates posted yet today | {provider}'s daily update cadence is established — first update typically arrives by {time} | Add reminder (primary); Open chat (secondary) | 3.5 in-stay management | provider | no |

---

## 5.13 Loading / Skeleton States (Cross-Cutting)

1. **Identity.** 5.13 - Loading / Skeleton States - Role: all - Route: none, inline - Mockup: spec-only - validated; mobile + desktop.
2. **Purpose.** Skeletons that preserve layout shape (never spinner-only) with "Loading..." helper and estimated-time hint.
3. **Components.** `{card.muted}` skeleton card, `{skeleton.shimmer}` (photo/text/CTA/grid/section blocks), loading header (`{typography.scale.lg muted}`), helper text and estimated-time hint (`{typography.scale.sm muted}`), animation (shimmer sweep, opacity pulse), back button disabled.
4. **Actions.** None (non-skeleton CTAs disabled with `aria-disabled="true"`, back disabled).
5. **States.** S1 initial-load (skeleton + "Loading..." + back disabled + estimate) - S2 data-arrived (skeleton fades, content slides in, helper disappears) - S3 slow-connection ("⏱ Connection slow · estimated 8s on 4G") - S4 data-failed (skeleton replaced by 5.11 error) - S5 cached-data-shown ("Showing cached results from {time}" + sync indicator).
6. **Displayed.** "Loading...", "⏱ Estimated {N}s on 4G" (example 3s; 8s slow), cached timestamp.
7. **Captured.** None.
8. **Transitions.** Loading -> content or -> 5.11 error or -> cached content.
9. **Validation.** n/a.
10. **Integrations.** Performance monitoring (4G connection detection), IndexedDB cache.
11. **Business rules.** Initial payload < 500 KB on 4G (PRD NFR-1); TTI < 3s on 4G (NFR-2); shimmer 1.2s cycle, CSS-only; calendar uses opacity pulse 1.2s; admin queue staggered section shimmer; no spinner-only; "Loading..." not "Please wait..."; no blocking UI > 3s without estimated-time hint; show cached content after skeleton; skeletons decorative for screen readers (`aria-busy`, `aria-label="Loading"`); slow = "4G-or-slower indicator triggers estimated-time hint".
12. **Bilingual.** Full EN+BN ("লোড হচ্ছে..."). "4G" and "s" units stay Latin in Bangla ("4G-তে আনুমানিক {N}s").
13. **Assumptions.** Connection speed detectable (Network Information API; not universally supported on iOS Safari, inferred); estimates computed.
14. **Gaps.**
    - Outline lists 4 surfaces; spec lists 8 (adds notification inbox, defection dashboard, runbook, in-stay). Missing: provider payouts 5.6, provider/admin 5.9 center, settings, review/booking forms, chat.
    - PRD NFR-4 Admin Console < 2s initial load (spec says TTI < 3s for all).
    - Shortlist skeleton "4 cards" assumes 4 results; PRD curated shortlist size not verified here.
    - Queue dashboard "6 section blocks" fixed number of sections not sourced.
    - Runbook "7 step placeholders": runbook step count (7) not verified in PRD.
    - How the estimated seconds are calculated is undefined; "estimated 3s" in layout is a hard-coded sample (fabricated trust/performance signal).
    - Back disabled during load could trap users on slow connections (no cancel).

### 5.13 reusable component catalogue

| Skeleton | Layout | Animation | Applies to |
|---|---|---|---|
| SkeletonShortlist | 4 cards, square photo block + 3 text lines + CTA block, same height as real | shimmer L-R 1.2s | 1.3 curated shortlist |
| SkeletonCalendar | month grid, date numbers visible, capacity placeholders | opacity pulse 1.2s | 3.2 provider capacity calendar |
| SkeletonAdminQueue | 6 section blocks, priority indicator + card placeholders | shimmer, staggered by section | 4.1 queue dashboard |
| SkeletonCareHistory | pet card + section blocks + booking-card skeletons | shimmer 1.2s | 2.1 care history |
| SkeletonNotificationsInbox | faded section headers + notification card placeholders | shimmer 1.2s | 5.5 (inferred 5.9) |
| SkeletonDefectionDashboard | counter-metric cards + signal category cards | shimmer 1.2s | 5.8 / 4.10 |
| SkeletonRunbook | alert banner + 7 step placeholders + notification template + timeline | shimmer 1.2s | 4.2 |
| SkeletonInStay | status card + daily-update feed placeholders + vet directory | shimmer 1.2s | 5.1 |
| LoadingHelper | "Loading..." + "⏱ Estimated {N}s on 4G" | - | all |
| SlowConnectionHelper | "⏱ Connection slow · estimated {N}s on 4G" | - | all |
| CachedDataIndicator | "Showing cached results from {time}" + sync indicator | - | all cached-capable pages |

---

# CROSS-CUTTING CONFLICTS AND GAPS

| # | Conflict / gap | Where | Source evidence |
|---|---|---|---|
| C1 | FR numbering in the specs does not match PRD. Spec: FR-22 = acute-event escalation, FR-30 = dispute + payout freeze/post-mortem, FR-29/31 = payout/reconciliation, FR-15/25/26/28 = daily updates/vet directory/chat, FR-19/21/43 = reviews, FR-14/27 = runbook. PRD: FR-22 = review independence, FR-24/25 = Report/dispute, FR-26..30 = acute event, FR-39..42 = payments/payout, FR-43 daily updates, FR-44 chat, FR-45 vet directory, FR-19 booking completion, FR-20/21 review, FR-23 moderation. | All pages | spec "Connection to Trigger Map" vs PRD §4 |
| C2 | SM-C1/C2/C5 meaning differs. Spec: platform-booking share, provider platform-share, care-record completeness (as health KPIs). PRD: SM-C1 GMV, SM-C2 active-user counts, SM-C5 provider earnings, all counter-metrics to AVOID optimising; SM-C3 = average star rating (spec says "critical reviews protected"). A-14 reference unverified. | 5.4, 5.8, scenario | PRD §7 |
| C3 | Defection detection scope: PRD FR-36/FR-50/R-15: signals are user-surfaced only (Reports, Reviews, feedback); no detection of off-platform behaviour; automated owner-side detection and bulk patterns out of scope; dashboard organised by Provider and signal type; Tier Utilization thresholds 30/60/90 days. 5.8 shows behavioural-analytics signals (care history viewed, unbookmarked, zero search results), aggregate-only with no provider drill-down. | 5.8 | PRD FR-36, FR-50 |
| C4 | Provider-initiated re-engagement (5.6 "Send re-engagement nudge") conflicts with PRD FR-49 out-of-scope ("Provider-initiated repeat-Owner outreach deferred") and with 5.8 ("no auto-intervention; every nudge is admin-initiated"); also "re-engagement offer" content/discount undefined (PRD FR-48: no repeat discount in v1). Who sends owner nudges (5.5) is undefined. | 5.5, 5.6, 5.8 | PRD FR-48/49 |
| C5 | Completion/review gates: owner "Mark complete" (5.1/5.2) vs PRD FR-19 provider marks completed; photo required for review (spec) vs optional (PRD FR-21); text min 20 chars vs "architecture-stage decision"; owner appeal of moderation (5.4) vs PRD FR-23/FR-24 (no appeal in v1) and single admin (no "different admin"). | 5.1, 5.2, 5.4 | PRD FR-19..24 |
| C6 | Hard-coded policy values the PRD leaves open: dispute window 7 days (OQ-2), admin response 48h, 15% commission (FR-41, NFR-25), payout cadence not shown (OQ-3), 60-day nudge cap, 6-month notification archive, 5-minute first timeline entry (PRD SM-20 is a measurement, not a target), under-4-minutes (PRD SM-15 metric). | 5.3, 5.5, 5.6, 5.7, 5.10 | PRD §9 |
| C7 | Admin surfaces are bilingual in spec (5.8, 5.9 admin sections, 5.10 admin, 5.12 admin copy) but PRD NFR-13/FR-31/FR-47: Admin console English-only. | 5.8, 5.9, 5.10, 5.12 | PRD NFR-13 |
| C8 | Acute-event handling mismatch: spec 5.7 categories vs PRD FR-26 vs mockup 57 vs mockup 08 (see 5.7). Payout freeze/early dispute window (PRD FR-29) and vet-directory-at-trigger (PRD FR-28) not specified in 5.7. Mockup 57 says booking becomes "Disputed". | 5.7, 5.1, 5.5 | mockups 57, 08 |
| C9 | Payment copy mismatch: 5.5 "payment due" reminder after confirmation contradicts PRD FR-39 capture-on-confirmation. | 5.5 | PRD FR-39 |
| C10 | Auth/identity: "Change password" and "NID verified" for owners/admin vs PRD phone OTP (NFR-6) and NID only for providers (NFR-7). | 5.10 | PRD NFR-6/7 |
| C11 | Numeral policy inconsistent: Latin digits (5.1, 5.2, 5.3, 5.4, 5.6, 5.8, 5.10) vs Bangla numerals (5.5 "৪", 5.7 "৫", "৩"). | 5.5, 5.7 | specs |
| C12 | Notifications overlap: 5.5 and 5.9 both define `/owner/notifications`; both own empty/high-volume states; 5.9 also overlaps 5.11/5.12 empty copy. | 5.5, 5.9 | specs |
| C13 | Internal references leaked into UI copy: "Brief §3" (5.3), "primary per FR-47" (5.10), "step 3 (admin role)" (5.7), SM-C3 labels, "Appeal mechanism →", "(🌐 Shared Driver)" (5.8, admin only). | 5.3, 5.7, 5.10 | content blocks |
| C14 | Sample data inconsistent: provider "Rashid" vs "Kamrul" in review text (5.4 and mockup 47); Tito age 7 (mockup 57) vs PRD age 4; status card shows both "last update 2h ago/9:14pm" and "update pending"; counter totals inconsistent ("12 signals"). | 5.1, 5.4, 5.8 | spec and mockups |
| C15 | Scenario Q8 sequence includes steps that are not user flows (settings, errors, empty, loading) and lists 5.1 as "already covered by Scenario 01"; no spec defines the climax: playbook, nudge composer and "Book again" are out of scope here (page 2.2). | scenario | scenario file |
| C16 | Missing offline/error/loading definitions for transactional pages (5.2 upload, 5.3 submit, 5.7 trigger) despite NFR-15 intermittent connectivity. | 5.2, 5.3, 5.7 | PRD NFR-15 |
| C17 | Validation report states "PASS" despite the numbering/semantic mismatches; its checks are structural only (warnings: no canonical Navigation H3, Object IDs, Registry). | `_validation-report.md` | report |

---

# (a) SUMMARY TABLE

| ID | Name | Role | Route | Mockup? | Key entities |
|---|---|---|---|---|---|
| 5.1 | In-Stay View (Owner) | owner | `/owner/stays/:bookingId/in-stay` | spec-only | Booking, DailyUpdate, ChatThread, VetClinic, AcuteEvent, Report |
| 5.2 | Booking Completion + Review | owner | `/owner/stays/:bookingId/complete` | spec-only | Booking, Review, ReviewPhoto, CareSpecific, Pet |
| 5.3 | Issue Report | owner | `/owner/stays/:bookingId/report` | spec-only | Report, ReportEvidence, DisputeWindow, Payout (freeze) |
| 5.4 | Review Moderation Result | owner (admin view) | `/owner/reviews/:reviewId/moderation` | spec-only (admin side = mockup 47) | Review, ModerationDecision, Appeal, AuditLogEntry |
| 5.5 | Notifications Inbox (Owner) | owner | `/owner/notifications` | spec-only | Notification, Booking, AcuteEvent, DailyUpdate |
| 5.6 | Payouts + Earnings | provider | `/provider/payouts` (+`/:bookingId` out of scope) | spec-only | Payout, Booking, ProfileViewAggregate, Report, ReengagementNudge |
| 5.7 | Acute-Event Trigger | provider | `/provider/stays/:bookingId/report-event` | mockup 57 (and unrelated 08) | AcuteEvent, Booking, Pet, CareConfiguration, VetClinic |
| 5.8 | Defection Detection Dashboard | admin | `/admin/defection` | spec-only | SoftSignal aggregates, CounterMetric, Intervention/Playbook, AuditLogEntry |
| 5.9 | Notifications Center (cross-role) | owner/provider/admin | `/{role}/notifications` | spec-only | Notification (role-typed) |
| 5.10 | Settings / Profile | owner/provider/admin | `/{role}/settings` | spec-only | User, Verification, NotificationPreference, Pet, PaymentMethod, PayoutMethod, CapacityDefault |
| 5.11 | Error States | all | none (inline) | spec-only | n/a (UI templates) |
| 5.12 | Empty States | all | none (inline) | spec-only | n/a (UI templates) |
| 5.13 | Loading Skeletons | all | none (inline) | spec-only | n/a (UI templates) |

---

# (b) DATA ENTITIES AND FIELDS IMPLIED

- **User** (owner/provider/admin): id, role, name, phone (+verified), email (+verified), NID (last-4 shown, +verified), language preference (bn/en), avatar menu.
- **NotificationPreference**: channel push/email/SMS booleans; types booking events, daily updates, acute-event (locked true), re-engagement nudges, marketing emails; per-user.
- **Notification**: id, recipient, role section (action/update/reengagement/past; provider: reminders/payouts; admin: queue/acute/pattern), type, icon, title, brief, linked entity + deep-link target, created at, read flag, unread dot, archive at 6 months, re-engagement frequency tracking (per booking, per 60 days).
- **Pet**: name, species, breed, age, conditions, care instructions, soft-deleted flag + audit.
- **Booking**: id (PC-2026-NNNN), owner, provider, pet, period, N days, amount BDT, status (in-stay, completed, confirmed, disputed/frozen/resolved, etc.), completion timestamp, neighborhood, care plan summary, vet clinic.
- **DailyUpdate**: booking, day number, timestamp, photo(s), structured note, (verified indicator semantics undefined), posting due time.
- **ChatThread/Message**: booking-scoped, unread count, admin audit.
- **VetClinic (directory)**: name, address, phone, hours/open status, distance, species handled, neighbourhood; primary + 2 alternatives.
- **Review**: booking, rating 1-5, text (>=20), photos (>=1), care-specific checks (species-based list), submitted date, status (pending/approved/edited/removed/skipped), edited text, skip state.
- **ModerationDecision**: review, outcome, specific reason, reason category (abuse/off-topic/low-effort/doxxing/impersonation), redacted segment, date, decider, audit id, policy reference.
- **Appeal**: review, reason, evidence, reviewer (different admin), status (submitted/upheld/denied).
- **Report (dispute)**: booking, category enum (6), description (>=30), evidence files (<=5 photos, PDF), status (submitted/investigating/resolved no action/refund/provider action), submitted at, admin response SLA 48h.
- **DisputeWindow**: opens at completion (or acute trigger per PRD), 7-day length, remaining days, color tier.
- **Payout**: booking, provider, gross, commission (15%), net, state (pending/paid/frozen), freeze reason, date; MFS method.
- **ProfileViewAggregate**: provider, month count, % change; updated daily.
- **ReengagementNudge**: sender (provider or admin), recipients, send time, audience (past owners with care history), 60-day cap.
- **AcuteEvent**: booking, provider, category (illness/injury/behavioral/death), description (>=20), severity (stabilized/urgent), triggered at, first timeline entry time, timeline entries, runbook status, admin notified, owner notified.
- **SoftSignal aggregates**: category owner/provider/cross, type, count, window (30d), flagged state, intervention status.
- **CounterMetric**: SM-C1, SM-C2, SM-C5 values %, state (Healthy/Watch/Critical), thresholds (admin-editable).
- **Intervention/Playbook**: signal, template, schedule, status (in progress/completed), audit entry.
- **AuditLogEntry**: actor, action (mark-all-read, moderation decision, settings), timestamp, reason, target.
- **OfflineCache (client)**: vet directory, last 5 updates, booking metadata, save-offline queue.
- **CapacityDefaults, PayoutMethod, PaymentMethod**: referenced only as links (structure out of scope).

---

# (c) API OPERATIONS IMPLIED (no gateway contracts)

- GET in-stay booking summary (status, day N of M, last/next update, flags) by bookingId; poll 60s or push on `in-stay.{bookingId}`.
- GET daily updates for booking (paged, reverse chronological); photo URLs.
- GET unread chat count / open chat thread (messages GET/POST) - booking scoped.
- GET vet-clinic directory entries for booking neighbourhood (prefetch at confirmation).
- POST mark stay complete (owner-triggered; actor undefined, PRD says provider).
- POST review (booking id, rating, text, photo ids, care-specific flags); POST photo upload (multipart, compressed); DELETE photo before submit; POST skip review (mark skipped).
- GET review moderation result (decision, original, audit); POST appeal (reason, evidence); GET appeal status.
- GET dispute-window state for booking; POST issue report (category, description, evidence files); GET report status; (server) freeze payout on report.
- GET notifications (role-scoped, paged, grouped); POST mark-all-read; (PATCH mark-read); push subscription register per channel; GET unread counts.
- GET provider payouts summary + lines for period; GET profile-views aggregate; POST re-engagement nudge send (audience, template) with 60-day cap enforced; GET eligible past-owner count.
- POST acute-event trigger (booking, category, description, severity) -> creates AcuteEvent, pages admin, notifies owner, (freezes payout / opens dispute window per PRD) ; GET acute event for owner banner.
- GET defection signals (aggregates by category, filter), GET counter metrics (SM values + status), POST launch intervention (signal, template), PATCH intervention status; GET thresholds / PUT thresholds (admin).
- GET/PUT settings: identity edit (with verification), language, notification preferences; soft-delete pet; change password; delete-account request (support); sign out.
- Auth: OTP request/verify with delayed-SMS handling (resend/auto-retry), manual code verify.
- Client: save-offline queue flush; sync/cache of read data; connectivity detection.
- Audit log write on mark-all-read, moderation decision, settings changes, intervention decisions.

---

# (d) HARD-CODED SAMPLE VALUES THAT WOULD BE FABRICATED TRUST SIGNALS IF SHOWN AS REAL

Must not ship as live data; replace with real data or neutral placeholders.

**5.1:** "Tito at Rashid's · Day 4 of 9"; "Rashid M. · Gulshan"; "Last update 2h ago · Glucose stable · evening walk complete"; "Next update due 9pm today"; "Open chat (3)"; Day 4 9:14pm note with "Glucose reading normal (118 mg/dL)"; Day 3 9:02pm note; Day 2 9:11pm; vet entries "Gulshan Veterinary 1.2 km · open until midnight", "Banani Pet Clinic 2.4 km · open until 10pm", "[3 more nearby]", phone "+880-XXX-XXXX"; "✓ verified by owner view".
**5.2:** "Tito stayed with Rashid · Eid 2026 · 9 days · BDT 16,830"; "diabetic small dogs" copy; glucose/medication checklist items.
**5.3:** "{date} · {N} days remaining" (placeholders only); "admin will respond within 48 hours" (a promise).
**5.4:** "Tito's stay with Rashid · Eid 2026 · 9 days"; review "★★★☆☆ submitted Aug 26, 2026 - The neighborhood was loud at night. Kamrul tried his best but my dog couldn't sleep."; remaining text "... Kamrul tried his best."
**5.5:** "Booking PC-2026-0007 confirmed by Rashid · 11:42am · Eid stay · 9 days · BDT 16,830"; "Acute event: Tito's glucose drop · Started 11:02pm"; "Daily update posted · Day 4 · Glucose stable · 2h ago"; "Long walk in the park · 1d ago"; counts Action (2), Updates (3), Re-engagement (1), Past (12); "Booking completed · 3 weeks ago"; "Tito's care history is waiting"; "Book in under 4 minutes".
**5.6:** "Aug 2026 · BDT 5,25,725 net"; Gross BDT 6,18,500 · 47 bookings; Commission (15%) BDT 92,775; Net 5,25,725; frozen BDT 16,830 (1 dispute); rows "08/28 PC-...007 Tito (Bibi) 16,830 / 2,524 / 14,306 paid", "08/27 PC-...005 Max (Hasan) 12,450 / 1,867 / 10,583 paid", "08/26 PC-...003 Lala (Sara) 16,830 / 2,524 / 14,306 frozen"; "Profile views this month: 142 ↑ 38%"; "5 past owners have care-history visible".
**5.7:** "Tito (diabetic Shih Tzu) · Bibi's stay · Day 4 of 9 · Gulshan · glucose gel on hand · vet contact: Gulshan Vet"; "Ayaat directly +880-XXX-XXXX"; "5 minutes". Mockup 57: "Tito · Shih Tzu · 7 yrs", "Glucose dropped to 3.2 at 10:55pm...", "237 / 20 characters". Mockup 08: "Gulshan Pet Clinic · Dr. Khan · 0.8 km · +880 1700-123456", "Banani Animal Care · Dr. Rahman", "Dhanmondi Veterinary Hospital · 24h emergency · 5.1 km", "14m ago".
**5.8:** Counters 87% / 94% / 91% with Healthy/Healthy/Watch; "8%" trend; "12 owners... 60+ days"; "12 signals · 2 patterns"; 12 / 5 / 3 owner signals; 2 providers 30%+; 1 provider; 4 pairs.
**5.10:** "+880-XXX-XXXX (verified ✓)", NID "{nid-last-4} (verified ✓)".
**5.11:** "Showing cached results from 2 min ago" (outline), "No providers in Banani..." (outline), "SMS may take 30–60s", support "+880-XXX-XXXX".
**5.12:** "2 Tier-A outreach invitations queued · 1/25/75 ceiling", "first update typically arrives by 9pm", "Tito's first stay".
**5.13:** "Estimated 3s on 4G", "estimated 8s".
**Mockup 47 (related):** "Pending 12 · Flagged 3 · Last decision 23m ago · 47 this week", reviewer names "Bibi R.", "Tahmid K.", "T_dhaka_99", quoted reviews, "Ayaat's prior decisions: 4 reviews of this length - 3 approved, 1 edited", "5 reviews of similar pattern detected".
**Scenario file:** "Rashid's profile shows 1 booking + 1 verified review", "2 patterns flagged", "Book Tito's next stay in under 4 minutes".
