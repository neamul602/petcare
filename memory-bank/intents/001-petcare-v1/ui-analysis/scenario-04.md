# UI Analysis - Scenario 04: Ayaat's Eid-Week Runbook Execution at the Ceiling

Source: `docs/scenarios/04-ayaats-eid-week-runbook-execution/` (scenario .md, pages 4.1-4.10 `<id>.md` + `<id>.spec.md`, `_validation-report.md`). Mockups read: `docs/ux/mockups/06-admin-queue.html`, `42-acute-event-runbook.html`, `47-review-moderation-queue.html`, plus `08-acute-event.html` and `57-acute-event-trigger.html` for context. PRD cross-checked: `docs/prd.md`.

Conventions
- Treated as a functional specification. Written spec wins over mockups; conflicts are reported per page. "(inferred)" marks my inference, not source text.
- All 10 pages are ADMIN pages (role `admin`, single operator "Ayaat"). Desktop-primary (1280px source); only 4.2 declares mobile as secondary.
- Cross-cutting PRD facts that affect every page (see "Global conflicts" below): Admin Console is English-only (FR-31, NFR-13) but every spec carries a Bangla content column; PRD wants Admin mobile-first on a low-end Android (NFR-4, NFR-14, NFR-15) but specs are desktop-primary; the FR numbers cited by the scenario/specs do not match PRD FR numbering.
- Spec status: every `.spec.md` frontmatter says `spec_status: validated · 2026-08-31 · WDS Phase 4 [V]`; every outline `.md` says `status: outlined`. The `_validation-report.md` (audited 2026-08-31) claims all specs carry `spec_status: draft · suggest-mode` and flags this as its one CRITICAL issue, overall verdict `needs_work` in its YAML but "PASS" in prose. The files on disk already say `validated`, so the critical item appears resolved (inferred). Validation report lists 5 warnings (house-style deviations; 4.2 mobile-mockup vs desktop spec) and none are functional.

## Global conflicts and gaps (apply to all pages)

| # | Finding | Evidence |
|---|---|---|
| G1 | PRD says Admin Console is English-only, "Bangla is not surfaced in v1" (FR-31 out-of-scope: admin multi-language; NFR-13). Every spec has a Bangla column for all admin UI strings, and the validation report praises "100% bilingual coverage" and "Bangla-first default". Direct contradiction. Only legitimate Bangla on these pages is the OWNER-facing message template in 4.2 (Step 5), because the recipient is an Owner (FR-47 parity applies to Owner surfaces). | PRD FR-31, NFR-13, FR-47; all specs "Content Blocks" |
| G2 | FR numbering in the scenario/specs does not match PRD numbering. E.g. scenario says FR-14 = runbook, FR-22 = acute-event escalation, FR-27 = runbook activation under 5 min, FR-35 = provider-quality flags, FR-50 = audit trail, FR-29/31 = payout + reconciliation. PRD: FR-14 = booking state machine, FR-22 = review independence, FR-27 = admin coordination + owner notification cadence, FR-35 = report investigation, FR-37 = audit log, FR-50 = defection signal capture, FR-29 = payout/report implications of acute events, FR-31 = admin role/auth. Only some match (FR-30 post-mortem, FR-32 queue, FR-34 acute coordination surface, FR-38 ceiling, FR-36 defection). This analysis cites PRD numbers where I verified them and flags spec citations that differ. | PRD section 4 headings vs scenario Q2 |
| G3 | PRD FR-38 ceiling is "75 completed Bookings per month (trailing 30 days)". The specs use "52/75 in-stay bookings" (a concurrent count of in-stay bookings) as the axis. Different measure. The third axis "1 acute event / 1" is not a PRD ceiling axis; the "1" in 1/25/75 is the number of Admins. | PRD FR-38, SM-18; 4.1, 4.5 |
| G4 | PRD defers numerical targets (A-21, SM section: "no invented target numbers"; SM-20 is "median minutes ... to first documented timeline entry"). Specs hard-code 5 min (SM-20), 48 hr, 7-day SLA, 7-day dispute window, 15% commission, 80%/88% ceiling thresholds. Treat as design defaults needing sign-off. | PRD SM section, OQ list; specs |
| G5 | PRD says no real-time push to Admin in v1 (FR-32 out of scope: "polling cadence is architecture-stage"). Specs subscribe to push channels (`admin.queue.acute`, `runbook.{id}`, `admin.ceiling`, `review.moderation`, `postmortem.due`, `payout.reconciliation`, `defection.signals`) and a sound alert. UJ-3 / FR-27 say Admin is "paged", so some alerting is needed; the channel is undefined. | PRD FR-27, FR-32; all specs "Polling" |
| G6 | Specs cross-link to "4.7 audit-log" (in 4.5, 4.6, 4.7, 4.8, 4.10) but 4.7 is Review Moderation; no audit-log page exists in scope (mockup 06 has an "Audit log" tab). PRD FR-37 defines the log. | 4.5, 4.6, 4.8, 4.10 Next Steps |
| G7 | Auth: "redirects to `/admin/sign-in`" appears only in 4.1. No sign-in page spec exists in this scenario. Admin auth is distinct from Owner/Provider (FR-31) but mechanism is undefined (SMS/OTP vs password is not stated). | 4.1; PRD FR-31 |
| G8 | Wording/data typos in sources: 4.5 Bangla "বেসলাইেে রিসেট" (corrupt), 4.10 has mojibake characters in Bangla and one emoji; 4.8 says table has "7 columns" but lists 8 (Date, Provider, Booking, Gross, Comm, Net, MFS, State). | 4.5, 4.10, 4.8 |

---

# Page 4.1 - Admin Queue Dashboard

**1. Identity.** 4.1 - Admin Queue Dashboard - role: `admin` (Ayaat) - route `/admin/queue` (SSR, deep-linkable, `/admin` root) - mockup `06-admin-queue.html` (conflicts below) - spec_status validated 2026-08-31 (outline status: outlined). Auth gate: redirect to `/admin/sign-in` if no admin role.

**2. Purpose.** Daily entry point listing everything that needs action, ordered by urgency, under an always-visible operating-ceiling banner (FR-32, FR-34*, FR-38; Ayaat Want #1 and #3).

**3. UI components.** `.ceiling-banner` (sticky, tokens success-soft/warning-soft/destructive-soft), `.tab-bar` (tab.primary, role tablist), `.queue-section` (queue-row.section-header, h2, accordion), `.priority-dot`, `.queue-card` (queue-row), `.acute-card` (card.elevated + destructive-soft accent), `.dispute-card`, `.bulk-view-toggle` (button.variant.link), sound-alert (2-tone chime), header (admin name, period context, logout).

**4. User actions.**
| Action | Result |
|---|---|
| Open Runbook (acute card) | Navigate to 4.2 `/admin/runbook/:eventId` |
| Open dispute (dispute card) | Navigate to 4.6 `/admin/disputes/:disputeId` |
| Tap any card in other sections | Detail page: applications -> 4.3; review moderation items -> 4.7 (link text "12 review-moderation items"); awaiting-confirmation and in-stay: target not specified (gap) |
| Tab bar: Queue / Providers / Payouts / Runbook / Settings | Switch tab. Targets implied: Providers -> 4.4 `/admin/providers`; Payouts -> 4.8 (inferred); Runbook -> 4.2 or runbook list (unspecified); Settings (sound mute toggle lives here) |
| Expand/collapse section; Bulk-view toggle (sections 3-6) | Collapses sections into summary cards; `aria-expanded` |
| Banner click (inferred) | 4.5 `/admin/ceiling` ("deep-linkable from queue banner") |
| Throttle-new-supply CTA (ceiling-breached) | Goes to throttle controls (4.5) (inferred) |
| Logout | Ends admin session |
| Mute toggle for chime | In Settings (Next Steps); not on this page |

**5. States.**
1. Default/quiet: banner green, sections expanded, no acute/dispute cards.
2. Acute-event-active: acute section expanded, "timeline-entry CTA prominent" on acute card.
3. Ceiling-near: banner orange "at 22/70 (88% of any axis)"; throttle-new-supply suggestion appears.
4. Ceiling-breached: banner red; throttle-new-supply CTA primary; escalation banner "Multi-admin RBAC recommended - reach out to platform team".
5. High-volume-period: lower-priority sections auto-collapse to bulk view.
6. New-acute-trigger: sound alert + push; acute card slides in at top; timeline CTA focuses; `role="alert"`.
Loading/empty/error/offline: not specified. Polling every 30 s (acute events time-critical) implies stale-data handling is needed (gap). PRD requires load < 2 s on 4G low-end Android (NFR-4). Offline behaviour unspecified.

**6. Data displayed.**
- Banner: active providers N/25, in-stay bookings N/75, disputes N, acute events N (source: Provider, Booking, Report/Dispute, AcuteEvent counts).
- Acute card: pet name, event type, time-ago, "Day N of M" of stay, provider name + neighborhood, owner name + neighborhood (AcuteEvent, Booking, Pet, Provider, Owner).
- Dispute card: category, booking ref, time-ago, provider, owner (Report/Dispute).
- Sections with counts: Acute (1), Disputes (4), Awaiting Provider Confirmation (6), In-Stay (52), Provider Applications (2), Review Moderation Queue (12). Card fields generically: priority indicator, subject, booking/owner/provider link, time elapsed, CTA.
- Header: adminName, "Solo operator", period context ("Eid-week").

**7. Data required/captured.** None captured (read-only). Only UI state: section expand/collapse, sound mute (setting).

**8. Transitions/navigation.** No entity state changes here. Items disappear only on resolution ("No removing items from queue without resolution"). Next: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7 (cross-links listed in spec). Order is system-determined.

**9. Validation.** None (no inputs). Banner thresholds are computed rules (see 11).

**10. Integrations.** Push/notification channel subscriptions `admin.queue.acute`, `admin.queue.disputes` (channel tech unspecified). Polling 30 s. No SMS/payment/MFS/photo here.

**11. Business rules.**
- Section order fixed: Acute (1) > Disputes (2) > Awaiting Provider Confirmation (3) > In-Stay (4) > Provider Applications (5) > Review Moderation (6). PRD FR-32 lists only the first four; sections 5 and 6 are additions.
- Priority colors: acute coral, dispute red, awaiting amber, in-stay forest, applications sky, review muted (note: outline uses red/orange/yellow/green/blue/white dots).
- Ceiling: 25 providers / 75 in-stay / 1 acute. Near state "orange at 22/70 (88% of any axis)". Breached = red.
- Must NOT: drag-reorder sections; hide acute events behind pagination (always top, always expanded); "mark all read" without action; remove items without resolution (audit trail); auto-dismiss disputes (Brief s3).
- Sound alert: brief 2-tone chime, respects system volume, mute in Settings.
- All CTAs >= 48 px.

**12. Language.** English only for admin per PRD. Spec lists a Bangla column (see G1). Strings: "Open Runbook ->", "Open dispute ->", "Below ceiling", "Approaching ceiling - {axis} at {percent}%", "Ceiling breached - throttle supply - consider multi-admin RBAC", section titles.

**13. Assumptions.** Admin sits at a desktop (scenario Q5) with mobile only for alerts; one acute event at a time (acute axis max 1); queue counts are small enough for bulk view; audio alert is acceptable; tab bar is the only navigation.

**14. Gaps/questions.**
- Banner example "1 acute event - Below ceiling" while acute axis is 1/1 = 100% (4.5 shows it orange); and near-threshold stated as 88%/22/70 here but ">80%" in 4.5 (22/25 = 88%, 70/75 = 93%). Which rule governs, and what happens when a second acute event occurs (axis 2/1 = breach?).
- Sections 3-6 cards (awaiting confirmation, in-stay) have no destination page in scope.
- Outline says "Reports in progress"; spec says "Disputes in progress" (terminology; PRD uses Report/Dispute).
- Mockup 06 conflicts (written spec wins):
  - Mockup has P1-P4 priority tiers with 2 acute (Rashid, Farzana), 4 disputes, 11 vetting, 58 in-stay, "Operating at 87% of ceiling", "Eid week - Day 3", "Today BDT 64k payouts scheduled", total 75 active items with pagination "Showing 8 of 75"; spec has 6 sections (1 acute, 4 disputes, 6 awaiting, 52 in-stay, 2 applications, 12 reviews) and no awaiting-confirmation or review section in the mockup.
  - Mockup nav tabs: Queue, Providers, Audit log, Reports; spec: Queue, Providers, Payouts, Runbook, Settings.
  - Mockup has filter chips Acute/Dispute/Vetting/In-stay + Filter + Sort; spec forbids reordering and has no filter.
  - Mockup single-percentage banner (87%) vs spec 3-axis banner.
  - Mockup acute subject wording ("Rashid reported - senior dog, lethargy") differs from spec (Tito glucose drop).
  - Mockup shows 2 simultaneous acute events, against the 1/1 acute axis.
- Whether tab "Runbook" is a list of events or a runbook template editor (PRD FR-34: runbook templates and cadence values are Admin-editable).

---

# Page 4.2 - Acute Event Runbook View (R-10 launch-blocking)

**1. Identity.** 4.2 - Acute Event Runbook View - role `admin` - route `/admin/runbook/:eventId` (deep-linkable from queue and from SMS/push notifications) - mockup `42-acute-event-runbook.html` (mobile `08-acute-event.html` is the provider-side report, not this page; see below) - spec validated. Platform: desktop primary + mobile (push notification opens it on phone). Event ID format `#AE-2026-0001`.

**2. Purpose.** The pre-built escalation path for an acute event: confirm trigger, role split, vet lookup, templated owner notification, payout implications, timeline, post-mortem hand-off; target first timeline entry within 5 min of trigger (SM-20) (PRD FR-27, FR-28, FR-29, FR-30, FR-34; risk R-10).

**3. UI components.** `.alert-banner` (destructive-soft; role alert, aria-live assertive), `.elapsed-timer` (success/warning/destructive; role timer), `.runbook-steps` (card.elevated, 7-step accordion, `aria-current="step"`), `.step-done/.step-active/.step-pending`, `.step-context` (expandable), `.vet-lookup` (`vet-clinic-entry` x 3), `.notification-template` (card.muted; readonly textarea + copy-to-clipboard), `.lang-toggle` (button.variant.toggle; radiogroup), `.send-via-platform` (button.primary md), `.send-via-sms` (button.variant.link), `.timeline` (`<ol>`, card.muted), `.timeline-entry`, `.timeline-input` (input.text), `.helper-line`. Header with back link "Queue".

**4. User actions.**
| Action | Result |
|---|---|
| Back to Queue | 4.1 |
| Expand step | Show step context |
| Advance step manually | Backend stores per-step status; "Ayaat advances manually" (Next Steps). Control not drawn in spec; mockup draws "Mark complete" and "Skip (with note)" buttons on the active step |
| Select vet clinic / view primary + 2 alternatives | Display only; phone shown; no select action specified (gap) |
| Language toggle EN / BN | Switches template body language; preference preserved; same structure |
| Send via PetCare | Sends in-app notification to Owner; logs timestamp; (Step 5 -> done, inferred) |
| Send via SMS | SMS fallback to Owner; logs timestamp |
| Copy template | Copy-to-clipboard |
| Add timeline entry (free text) | Posts immediately, optimistic UI, new entry shown (spec says "at top" but layout is chronological - conflict), count badge updates |
| Step 7 / post-mortem CTA | Routes to 4.9 `/admin/postmortems/:eventId`, form pre-populated |
| Back-to-queue from resolved state | auto-link to 4.9 |
Timeline timestamps and the owner-notified/vet-contacted entries are auto-logged ("logs timestamp").

**5. States.**
1. Trigger-just-fired (current): "Step 1 done, Step 3 (Admin) active, timeline empty, banner shows 5-min timer" (spec text). Layout drawn is different: steps 1-2 done, step 3 active, timeline with 4 entries (internal inconsistency).
2. In-resolution: steps 1-5 done, Step 6 (payout) active, timeline populated, follow-up cadence active.
3. Post-mortem-due: all steps complete; banner "Resolution documented - schedule post-mortem entry" / "Post-mortem due within 48 hours"; CTA to 4.9.
4. Acute-event-resolved: all steps done, banner success-soft "Acute event resolved - post-mortem due"; auto-link to 4.9.
5. Timeline-entry-saved: optimistic add.
Timer colors: green at <= 5:00, orange 5-15 min, red > 15 min; "auto-success at 5 min". Offline/error/loading not specified; push `runbook.{id}` plus 30 s polling.

**6. Data displayed.**
- Event header: event ID, event type (e.g. glucose drop, diabetic small dog), pet name, stay "Day N of M", provider name + neighborhood, owner name + neighborhood, started time, current time, elapsed MM:SS (AcuteEvent, Booking, Pet, Provider, Owner).
- Per-step: number, name, state, done-timestamp, context text (AcuteEventStep).
- Vet lookup: clinic name, doctor, distance (km), phone, hours ("open until midnight") for 1 primary + 2 alternatives (VetClinic, FR-45 per-neighborhood directory; "pre-fetched").
- Template body with placeholders {pet}, {provider}, {vet}, provider phone, admin phone, "We'll update you within 30 min" (spec layout includes this line; outline example omits it).
- Timeline entries: icon by type, timestamp, actor, text (AcuteEventTimelineEntry).
- Helper: "Aim: first timeline entry within 5 min - post-mortem within 48 hr".

**7. Data required/captured.**
| Field | Type | Required | Notes |
|---|---|---|---|
| Timeline entry text | free text | required to post (inferred) | Admin-authored only |
| Notification language | enum EN/BN | default (unspecified) | toggle |
| Send channel | enum PetCare / SMS | one chosen | one-tap |
| Step status | enum done/active/pending | system + manual advance | per-step in backend |
| Skip note (mockup only) | text | required for skip | mockup "Skip (with note)" |

**8. Transitions/navigation.**
- Step machine: 7 predefined steps, status done/active/pending; Ayaat advances manually.
- Steps: 1 Confirm trigger (done by provider's in-app report), 2 Provider role (Rashid in-the-moment, vet lookup, owner notification), 3 Admin role (platform coordination, owner notification cadence, payout), 4 Vet-Clinic lookup, 5 Owner notification, 6 Payout implications ("payout on hold pending resolution; no automated penalty"), 7 Post-mortem entry (closes the runbook).
- Acute event lifecycle: triggered -> in-resolution -> resolved -> post-mortem due -> post-mortem closed (4.9). No "auto-resolve"; every entry human-authored.
- Booking state: PRD FR-29 says trigger freezes payout and (mockup 57) moves booking to `disputed`; this page does not itself change booking state (inferred: trigger is provider-side, scenario 05 / mockup 57).
- Entry: from 4.1 acute card, SMS/push deep link, 4.5 acute axis "Open runbook".

**9. Validation.** Timeline input: no min length stated (mockup 57 provider form has min 20 chars; not here). No penalty if > 5 min: "soft reminder, no blame". Send buttons should log even if SMS fails (error handling unspecified).

**10. Integrations.** Notifications: in-app notification to Owner (Send via PetCare); SMS to Owner (Send via SMS, fallback); push to Admin (`runbook.{id}`, deep links in SMS/push). Vet directory read (no external call; directory data is internal, FR-45). No payment gateway call is made from this page though Step 6 depends on payout freeze (FR-29, automatic) (inferred). Sends: template body rendered in selected language, owner contact, timestamp; receives delivery status (not specified).

**11. Business rules.**
- SM-20: first timeline entry within 5 min of trigger; helper shows "Aim: 5 min". Timer colors: <= 5 min green; 5-15 min orange; > 15 min red.
- Post-mortem within 48 hr of resolution.
- Owner follow-up: template promises update within 30 min; timeline sample "Following up in 30 min".
- Payout: held pending resolution; no automated penalty.
- Vet lookup: 1 primary + 2 alternatives, pre-fetched; sample sorted by distance (1.2 km primary).
- Single template, single language toggle: no contradictory comms; template is a backend constant (both EN and BN) in spec Next Steps, but PRD FR-34 says runbook artifacts (templates, cadence values) are Admin-editable (conflict) and mockup shows "Last edited by Ayaat".
- Timeline is private to admin + provider + owner; no public sharing.
- Keyboard focus moves to timeline input when step 3 becomes active.
- R-10 launch-blocking: must ship before public launch.
- Runbook cadence values: PRD FR-27 says "initial notification, status updates, closure" on a documented cadence; the only concrete cadence in this spec is "update within 30 min". Closure notification not in the UI (gap).

**12. Language.** Admin UI is English (PRD). Exception: the Owner-notification template has EN and Bangla versions (owner-facing). Spec also adds Bangla for all admin chrome (see G1). "Template body" content for BN is not provided in the spec (placeholder `{template-body}`), only EN sample.

**13. Assumptions.** Provider triggers the event in-app (Step 1 already done); Admin is paged; vet clinic directory is pre-built per neighborhood; "Rashid administered glucose gel per your care instructions" assumes care instructions exist on the Pet profile; Admin phone and provider phone are available to template; single acute event at a time.

**14. Gaps/questions.**
- State 1 text (timeline empty, only Step 1 done) vs drawn layout (steps 1-2 done, timeline of 4 entries incl. Ayaat's 11:07 entry): inconsistent. Also the spec sample treats Ayaat's entry at exactly 5 min after trigger as "5 min elapsed" success (green at <= 5:00).
- Spec says entry "appears at top" (state 5) while timeline is chronological ascending.
- Step numbering/order: vet lookup is Step 4 here but "Step 3 (vet lookup)" in 4.9 library sample; 4.9 form lists Step 3 as "Admin role - vet lookup available". Order of Step 4/5 relative to Step 3's content also overlaps (Step 3 includes owner notification and payout, then steps 5 and 6 repeat them).
- Which step completions are automatic vs manual; how a step is "skipped" (mockup only).
- Delivery-failure behaviour for PetCare/SMS sends, Owner acknowledgement, and who closes the event (resolved state trigger). PRD FR-27 wants "closure" notification and Admin ability to escalate to second admin (not in v1).
- Template placeholders for Dr. [Name] and +880-XXX numbers are placeholders; real data must come from directory/profile.
- AE ID `#AE-2026-0001`: 4.9 shows the SAME ID resolved "Aug 26, 2026 11:42pm" while 4.2 shows it active at 11:07pm and mockup dated 31 Aug 2026. Timeline of the same event is contradictory across pages.
- Mockup 42 vs spec: mockup timeline has an extra 11:03 "Rashid: glucose gel administered" entry and Ayaat's entry at 11:05 (spec 11:07, vet contacted 11:04 / owner notified 11:05 separately); header shows "2 / 7 done", "Step 3 Mark complete / Skip (with note)" buttons and "SM-20 met" badge; template says "Dr. Rahman at Gulshan Vet ... standing by" (spec: "Dr. [Name] has been contacted") and shows "Last edited by Ayaat - 31 Aug 11:03pm"; vet lookup shows named clinics (Gulshan Veterinary Clinic 1.2 km open until midnight PRIMARY, Banani Pet Hospital 2.1 km until 10pm, Gulshan 2 Animal Care 3.4 km 24h); Step 1 context "category: Glucose drop, severity: Urgent". Mockup elapsed shows "05:00" with a green "met" badge while header time says 11:07pm (consistent with 11:02 trigger).
- Related provider mockups: `57-acute-event-trigger.html` is page 5.7 (Provider, Scenario 05): "This starts the runbook. Ayaat and Bibi will be notified within 2 minutes ... booking transitions to Disputed and payout pauses", fields event type (Glucose/medical, Injury, Behavioural, Other), description >= 20 chars, severity Stabilized / Urgent. `08-acute-event.html` is an older BMM provider-side mobile report form (event type Illness/Injury/Allergic/Behavioral/Other, severity Mild/Moderate/Severe, action taken 500 chars, vet contacted + directory). Neither maps to a 4.x page; both feed 4.2. They disagree with each other (event types, severity levels, "notified within 2 minutes" is a number not in the 4.x spec) and with the spec's Step 1 ("structured trigger").
- Validation report notes mobile 08 mockup vs desktop spec misalignment; recommended new desktop mockup (the 42 mockup appears to be that, rendered as a desktop page).

---

# Page 4.3 - Provider Application Review

**1. Identity.** 4.3 - Provider Application Review - role `admin` - route `/admin/applications/:applicationId` (deep-linkable from queue's applications section) - spec-only (no mockup; mockup 06 shows "Vetting" rows P3 that link to similar content) - spec validated. SLA 7 days.

**2. Purpose.** Tier-B application vetting (identity, address, references, capacity, vaccination proof) with transparent criteria, bias-aware language and right of appeal (Brief s5 risk 6; PRD FR-2, FR-3, FR-4, FR-33; scenario cites FR-4).

**3. UI components.** Header with `.sla-countdown`, `.vetting-artifacts` (card.muted, `<dl>`, 6 rows), `.verified-check`, `.pending-indicator` (info-soft), `.missing-indicator`, `.criteria-checklist` (native checkboxes in fieldset), `.bias-audit-banner` (info-soft, role note), `.appeal-link` (button.variant.link), sticky action bar (`sticky-action-bar`) with `.request-info`, `.decline-application`, `.approve-application`; Decline modal (alertdialog), Approve modal (dialog).

**4. User actions.**
| Action | Result |
|---|---|
| Back to Queue | 4.1 |
| Toggle criteria checkboxes | Records checklist state per item (are they Admin-editable? spec shows native checkboxes, so yes) |
| Right-of-appeal mechanism link | Routes to admin policy doc |
| Request more info | "Returns to applicant with structured question"; application paused; applicant notified |
| Decline | Opens modal: reason (taxonomy, required); applicant notified with appeal mechanism; application archived |
| Approve | Opens modal: optional introductory notes; application moves to Tier-B onboarding; ceiling math updates |

**5. States.**
1. New-application: SLA countdown started; artifacts partially populated.
2. Awaiting-info: paused; applicant notified; "awaiting {N} items".
3. Criteria-complete: all checked; Approve enabled.
4. Tier-A-invitation-outreach: different flow (admin outbound), distinct UI path, not specified.
5. Bias-audit-periodic: quarterly audit banner "All approval decisions in {quarter} shown for review".
6. Declined: reason logged; applicant notified with appeal; archived.
7. Approved: moves to Tier-B onboarding; ceiling banner updates.
SLA color: green > 2 days; orange "N days remaining - prioritize"; red "N day remaining - escalate" (shift "at 2 days"; exact orange/red cutoffs not given). Loading/error/offline not specified.

**6. Data displayed.** Applicant name (e.g. Sadia H.), tier, neighborhood, submitted date/age, SLA days remaining; artifacts: Identity (NID verified), Address (address doc on file), References (N contacted, N received), Capacity (per-species breakdown requested), Vaccination (on file, admin policy), Capability flags (self-declared); criteria checklist (7 items): identity verified (NID + photo match), address verified (utility bill), references 2/2 received, capacity provided, vaccination-proof on file, capability flags declared, no disqualifying flag (background-check policy). Bias-audit policy text. Source: ProviderApplication, ProviderVerificationArtifact (NFR-7: artifacts stored separately from public profile).

**7. Data required/captured.**
| Field | Type | Required | Options |
|---|---|---|---|
| Criteria checkboxes (7) | boolean each | all must be checked to approve | list above |
| Decline reason | taxonomy select | required | taxonomy not defined: "parallel to 3.4 but for applications" |
| Approve intro notes | free text | optional | |
| Request-more-info question | structured question | required (inferred) | structure undefined |

**8. Transitions.** PRD FR-33 lifecycle `applied -> vetting -> approved` (+ `suspended`/`removed`). Spec: application -> awaiting-info -> approved (Tier-B onboarding) / declined (archived). Provider status mapping to PRD statuses is implicit (inferred). Approve -> ceiling active-provider count +1 (18 -> 19, inferred). Back to 4.1.

**9. Validation.** Approve disabled until all criteria checked ("no approving without all criteria checked"); Decline requires taxonomy reason (`aria-required`); Decline copy "Decline (reason required)". No comparison with other applicants; no fast-track in v1.

**10. Integrations.** Notification to applicant on request-info, decline, approve (channel unspecified; applicant is a Provider candidate who may be Bangla-speaking: language of applicant message not specified, gap). References are "contacted" (outreach method unspecified: phone/SMS). No payment/photo integrations; NID/address documents are stored artifacts (storage not specified).

**11. Business rules.** SLA 7 days with live countdown, color shifts at 2 days; all criteria visible to applicant after decision; quarterly bias audit; right of appeal; vaccination proof "on file (admin policy)"; no disqualifying flag (background-check policy); approval affects ceiling (25 provider cap); "No hiding approval-decision rationale from applicant"; every action audit-logged (FR-37).

**12. Language.** Admin English; applicant-facing decision/appeal communication language not defined. Bangla column present in spec (G1).

**13. Assumptions.** Applicant is Tier-B; Tier-A uses a separate outreach track; references are contacted outside the app; vaccination proof relates to the provider's own pets/household (unclear) (inferred).

**14. Gaps/questions.**
- Sample data contradiction: header "Submitted 12 days ago" but "SLA 5 days remaining" under a 7-day SLA (12 days elapsed exceeds 7). Also queue (4.1) says 2 Tier-B applications; mockup 06 shows applications from Tanvir H. and Laila R., not Sadia H.
- Approve requires all criteria checked, but sample shows "References 1/2 received" and "Capacity requested": approve is impossible in that state; what happens at SLA expiry?
- Can Admin approve over a missing reference by documented exception? (No fast track.)
- Decline reason taxonomy and "structured question" format undefined; what the applicant sees (Bangla/English) undefined.
- Bias-audit data: PRD FR-4 audits protected-characteristic proxies (gender, religion, neighborhood, nationality); spec only shows banner; audit view is "separate page (out of scope)".
- Approval does not mention creating Provider Profile, sending credentials/onboarding, or Tier-B terms/commission.
- Mockup 06 "Vetting" cards (profile % complete, photos) show data not present in this spec.

---

# Page 4.4 - Provider Health Surface

**1. Identity.** 4.4 - Provider Health Surface - role `admin` - route `/admin/providers` (table view; `/admin/providers/:id` drill-down is out of scope, reuses 3.1 layout with admin overlay) - spec-only - spec validated.

**2. Purpose.** At-a-glance quality signals for all active providers so soft problems are caught before incidents (Ayaat Want #2; FR-32 "provider-quality flags inline"; scenario cites FR-35).

**3. UI components.** `.health-summary` (header summary dl), `.watch-banner` (warning-soft), `.flag-banner` (destructive-soft), `.filter-chips` (`filter-chip`, 6, aria-pressed), `.sort-selector` (native select, 4 modes), `.provider-card` (card.muted), `.quality-flag-dot`, `.tier-badge` (tier-a-badge/tier-b-badge), metric fields, `.open-provider` (link), `.flag-followup` (link), toast.

**4. User actions.**
| Action | Result |
|---|---|
| Filter chip: All, Healthy, Watch, Flag, Tier-A, Tier-B | Grid re-renders; count updates (single or combinable chips unspecified) |
| Sort: Quality flag (desc), Response time, Last booking, Tier | Re-order grid |
| Open (per card) | Provider detail `/admin/providers/:id` (out of scope) |
| Flag for follow-up | Adds provider to Ayaat's task list; card highlighted; toast; task list updates |
| Banner CTAs "Open watch list" / "Investigate" | Filters to watch/flag providers (inferred) |

**5. States.** 1 default all-healthy (no banners). 2 watch-list-non-empty (warning banner "N providers on watch", at least one yellow dot, "Open watch list" CTA). 3 flag-list-non-empty (destructive banner "N provider flagged", "Investigate" CTA primary). 4 filtered view. 5 flag-for-follow-up added. Empty/loading/error/offline unspecified. Polling every 5 min.

**6. Data displayed (per provider card).** Quality flag (healthy/watch/flag), name, tier badge, neighborhood, Response rate %, Updates posted "N/N" (daily-update rate), Care-record completeness %, Disputes count (red if > 0), Last booking time-ago. Header: "{N} active - {N} watch - {N} flag". Source: Provider, derived ProviderHealthSignal aggregates (response rate, daily-update rate, care-record completeness, dispute count, last booking date). Sample: Rashid M. (Tier-A, Gulshan; Response 96%, Updates 9/9, Care-record 95%, Disputes 0, last booking today); Farzana A. (Tier-A, Banani).

**7. Data captured.** "Flag for follow-up" creates a task item (provider ref, created time; optional note not specified). No form inputs.

**8. Transitions.** Flag-for-follow-up creates admin task (no provider state change). Quality flag is computed, not set by admin (spec: "multi-signal threshold required"; thresholds documented in admin policy, out of scope). Open -> provider detail.

**9. Validation.** No inputs. Rule: no auto-flagging based on a single signal.

**10. Integrations.** None external. Backend aggregate endpoint refreshed every 5 min.

**11. Business rules.** Flag levels: Healthy / Watch / Flag (soft signals). Multi-signal threshold required for any flag (values undefined). Disputes shown red if > 0. Admin-only visibility. No provider comparison/ranking ("Rashid ranks #5 of 18"). No penalty for Tier-B. No pressure CTAs. Header sample "18 active - 3 watch - 1 flag". 4.2 sample row "Updates 9/9" corresponds to Rashid's current 9-day stay.

**12. Language.** English (admin). Bangla column in spec (G1). "Flag 🔴" Bangla "পতাকা" (flag).

**13. Assumptions.** Metrics are available per provider from confirmation, daily update, care-record and dispute data; 18 providers fit one page ("16 more cards"); Tier-A and Tier-B are the only tiers.

**14. Gaps/questions.**
- Flag thresholds and the formula for response rate (denominator?), updates "N/N" (per stay vs per period), care-record completeness: undefined.
- Whether watch/flag notes, history of flags, or resolution of "follow-up" tasks exist; the "Ayaat's task list" has no page in this scenario.
- "Sort: Quality flag desc" with filters combination; whether Tier chips are exclusive.
- PRD FR-32 "low confirmation rate, repeated Decline Reasons" are the PRD's examples of quality flags; spec's four metrics do not include confirmation rate or decline reasons.
- Provider health metrics for Tier utilization (FR-36 / SM-13) not here although 4.10 says 4.4 feeds it.

---

# Page 4.5 - Operating Ceiling Dashboard

**1. Identity.** 4.5 - Operating Ceiling Dashboard - role `admin` - route `/admin/ceiling` (deep-linkable from queue banner) - spec-only - spec validated.

**2. Purpose.** Real-time Admin load vs the 1/25/75 ceiling, trend and projection, and throttle controls so Ayaat can restrict new supply before quality collapses (FR-38, SM-18, Ayaat Fear #2).

**3. UI components.** `.ceiling-header`, three `.axis-card` (card.muted; healthy/near/breached/real-time variants), `.axis-drilldown` links, `.trending-chart` (card.elevated; lightweight custom SVG, 30-day line + 7-day projection, figure/figcaption), `.trending-narrative`, three `.throttle-toggle` (toggle.primary-soft, role switch), `.apply-throttle` (button.primary md), `.reset-baseline` (link), apply/confirm modal (alertdialog), toast, escalation banner (role alert).

**4. User actions.**
| Action | Result |
|---|---|
| View providers (axis 1) | Drill to providers list (4.4) |
| View in-stay (axis 2) | Drill to in-stay bookings list (target not defined) |
| Open runbook (axis 3) | 4.2 |
| Toggle: Pause new Tier-B applications | Staged toggle |
| Toggle: Prioritize Tier-A outreach | Staged toggle |
| Toggle: Adjust per-tier onboarding throughput | Staged toggle; the adjustment input (number/slider) not defined |
| Apply throttle | Confirmation modal (logs decision), applies, success toast, "Throttle active since {time}" |
| Reset to baseline | Confirm modal; bulk reverts toggles |
| Back to Queue | 4.1 |

**5. States.** 1 below-ceiling (current; all green; no throttle). 2 near-ceiling: at least one axis > 80%; that card orange; throttle suggestion appears. 3 breached: at least one axis at/above 100%; red; Apply Throttle primary; escalation banner "Multi-admin RBAC recommended - reach out to platform team". 4 acute-events-active: acute axis shows real-time binding "1 active", CTA to 4.2. 5 throttle-active: toggles highlighted, indicator, Reset visible. 6 throttle-confirm modal. Polling 5 min + push `admin.ceiling`. Loading/error/offline unspecified.

**6. Data displayed.** Active providers current/25 and % (sample 18/25 = 72%); in-stay bookings current/75 (52/75 = 69%); acute events current/1 (1/1 = 100% orange "Real-time axis"); status label per axis; 30-day trend series for providers, in-stay, acute; projection narrative "Approaching ceiling in {N} days if current pace holds" (sample 11 days; with "pace matches baseline" for providers); throttle state and activation time. Source: Provider, Booking, AcuteEvent counts; ThrottleSetting.

**7. Data captured.** Throttle toggles (3 booleans; third has an undefined throughput value), applied timestamp, decision log entry (logged to audit trail). No free-text reason required (gap given PRD FR-31/FR-37 "reason code for audit").

**8. Transitions.** Throttle: off -> staged -> applied (active) -> reset to baseline. Effects (inferred): Pause Tier-B applications -> 4.3 intake stops accepting/queueing new applications; Tier-A outreach priority; throughput limits onboarding rate. Axis state: healthy -> near (> 80%) -> breached (>= 100%).

**9. Validation.** Confirm modal before apply and before reset; no snooze; no auto-throttle.

**10. Integrations.** None external. Push channel `admin.ceiling`. Throttle decisions go to audit log.

**11. Business rules.**
- Ceiling 1 Admin / 25 active providers / 75 in-stay bookings (PRD: 75 completed bookings per month, trailing 30 days).
- Near threshold: above 80% of any axis (4.1 says orange at 22/70, 88% of any axis; 22/25 = 88%, 70/75 = 93%).
- Breached at/above 100%.
- Acute axis is always "real-time bound", shown orange at 1/1 even though 100% would be "breached" by the generic rule.
- No auto-throttling (Ayaat decides); no "ignore 7 days" snooze; no pressure CTAs; no comparison with other operators; crossing the ceiling is a re-platforming signal not a stretch goal (PRD).
- Throttle decisions logged.
- Chart is lightweight custom SVG; no chart library in v1.

**12. Language.** English admin. Bangla column in spec (G1; "Reset to baseline" Bangla has corrupted characters).

**13. Assumptions.** Counts are available in real time; linear pace projection is acceptable ("current pace"); throttle only affects supply side (Tier-B applications and onboarding), not booking intake from owners.

**14. Gaps/questions.**
- Measures differ from PRD (completed bookings/month vs in-stay) (G3).
- Acute axis 1/1 shown orange vs "breached" rule; threshold 80% (here) vs 88% (4.1).
- Throttle side-effects on other pages undefined (e.g. how 4.3 shows "paused"; what applicants see). "Adjust per-tier onboarding throughput" has no value inputs.
- Projection method, and the sample "approaching ceiling in 11 days" inconsistent with 69% and "52 today" (cannot be verified).
- What happens on breach beyond banner: no auto-block of new provider approval or new bookings.
- The "Throttle active" state when a second acute event occurs.

---

# Page 4.6 - Dispute Investigation View

**1. Identity.** 4.6 - Dispute Investigation View - role `admin` - route `/admin/disputes/:disputeId` (deep-linkable from queue) - spec-only - spec validated. Dispute ID format `#DSP-2026-0001`. "Dispute window: 7 days from booking completion".

**2. Purpose.** Investigate an Owner's "Report an issue" independently of reviews, decide payout (release/hold/partial), document resolution and feed post-mortem (PRD FR-24, FR-25, FR-22, FR-35; scenario cites FR-30; Brief s3).

**3. UI components.** Header with `.sla-countdown`; `.booking-history` (card.muted, dl): `.history-updates`, `.history-chat`, `.history-review`; `.independent-records-notice` (info-soft, role note); `.provider-response` (card.muted); `.investigation-timeline` (ol) + `.add-note-input` (input.textarea); `.resolution-block` (card.elevated): radio group `.payout-release/.payout-hold/.payout-partial` (+ amount input), `.resolution-reason` textarea, `.followup-notes` textarea, `.resolve-dispute` (button.primary lg).

**4. User actions.**
| Action | Result |
|---|---|
| Back to Queue | 4.1 |
| View booking history summary (updates N/M, chat N messages, verified review snippet) | Read-only; deeper drill (full chat/updates) not specified |
| Add investigation note | Posts immediately to timeline, timestamped |
| Choose payout decision (Release / Hold / Partial + amount) | Enables Resolve once reason entered |
| Enter resolution reason / follow-up notes | |
| Resolve dispute | Logs decision; closes dispute; outcome per payout choice |
Also "initial-investigation CTA" (state 1; not drawn); provider notified (state 2; trigger not drawn).

**5. States.** 1 just-opened (SLA countdown; initial-investigation CTA; history expanded). 2 awaiting-provider-response ("Awaiting response - {N}h elapsed"; notes allowed). 3 resolution-ready (evidence reviewed; Resolve active). 4 closed-with-payout-release (payout released; post-mortem entry "auto-created (if applicable)"; archived). 5 closed-with-payout-hold (freeze remains; post-mortem entry created; archived; visible in 4.8). 6 dispute-window-expired (auto-archive; default to payout release; manual override possible). Window colors: green; orange "N days remaining - prioritize"; red "N day remaining - escalate" (cutoffs: "color shifts at 2 days"). Success message "Dispute closed - payout {state} - post-mortem logged". Error/offline unspecified.

**6. Data displayed.** Dispute ID, category (e.g. Noise complaint), booking ref (PC-2026-0007), owner (shown as "Anon"), provider (Kamrul H.) + neighborhood (Bashundhara), reported time-ago, window days remaining; booking history: updates posted 7/9, chat messages 12, verified review snippet (stars + text), provider response text + author + submitted time; investigation notes with timestamps; payout amount (BDT 16,830 sample). Source: Report, Booking, DailyUpdate, ChatMessage, Review, Payout.

**7. Data required/captured.**
| Field | Type | Required | Options |
|---|---|---|---|
| Payout decision | radio | required | Release full / Hold pending follow-up / Partial release |
| Partial amount | currency number (BDT) | required if Partial | bounds not stated |
| Resolution reason | textarea | required | |
| Follow-up notes for runbook | textarea | optional | feeds runbook updates |
| Investigation note | textarea | each entry non-empty (inferred) | |

**8. Transitions.** Report -> awaiting provider response -> resolution ready -> closed. Payout: frozen (on Report, FR-24) -> released / held / partially released. PRD FR-25 resolution states (Resolved - No Action releases freeze; Resolved - Refund; Resolved - Provider Action) and Booking `disputed -> resolved | refunded` are NOT represented (conflict). Closed with hold/partial -> auto-creates post-mortem entry (4.9); hold shows in 4.8. Window expiry -> auto-archive with payout release (conflicts with "No auto-resolution").

**9. Validation.** Resolve CTA disabled (`aria-disabled`, `aria-describedby` explains) until payout decision + reason present. Partial amount validation unspecified (<= payout, > 0).

**10. Integrations.** Notification to provider (awaiting response); notifications to owner on resolution (not specified). Payout release/hold action presumably triggers payout flow (MFS payout; not specified here). Refund via payment gateway (PRD FR-42) is absent. No photo storage.

**11. Business rules.** Dispute window 7 days from booking completion (PRD: duration is an Open Question; architecture sets it). Reviews and disputes independent (Brief s3) with persistent notice; no removing reviews because of a dispute; no resolving without reason; no auto-resolution except window-expired default-release; no comparison with other disputes; no pressure CTAs; decision, payout, reason and follow-up logged to audit trail (FR-37); post-mortem entry auto-created on resolution with hold/partial (Next Steps) vs "if applicable" on release.

**12. Language.** English admin; Bangla column present (G1). Review snippet may be in either language (user content, shown as written).

**13. Assumptions.** Owner can be anonymous ("Anon" shown) (owner identity is actually required by NFR-6, so "Anon" is odd); provider response is optional; one dispute per booking.

**14. Gaps/questions.**
- No Refund and no Provider Action (warning/suspend/remove) controls although PRD FR-25/FR-35 define them and say they are independent of payout; booking state outcomes (`resolved`/`refunded`) not shown.
- Sample inconsistencies: "5 days remaining" window vs "reported 2h ago" and "just-opened" (7-day window from completion; plausible only if completed 2 days ago); Owner "Anon" while 4.7 shows same booking PC-2026-0007 reviewed by "Bibi R."; the scenario calls it "the Bibi-disputed noise complaint". 4.8 maps PC-...007 to Rashid M. (not Kamrul) and a frozen payout for Kamrul to PC-...003.
- Payout BDT 16,830 equals the GROSS amount in 4.8 (net to provider 14,306); which amount is "full payout"? 4.8 "Frozen payouts" also uses 16,830.
- Verified review shown while the same review sits as pending moderation in 4.7 (mockup 47); is a review shown to Admin before approval; label "Verified review ✓".
- Spec header says provider response is "optional" but gives no deadline for the provider.
- Expiry default (auto release) conflicts with "No auto-resolution"; PRD says Resolved - No Action is Admin-documented.
- How acute events (PRD FR-29 early-opened dispute window) show up in dispute list.

---

# Page 4.7 - Review Moderation Queue

**1. Identity.** 4.7 - Review Moderation Queue - role `admin` - route `/admin/reviews/moderation` (deep-linkable from queue's review section) - mockup `47-review-moderation-queue.html` - spec validated. Desktop-primary.

**2. Purpose.** Moderate reviews for cause only (abuse, off-topic, low-effort), explicitly NOT to optimise average star rating (SM-C3); log every decision (PRD FR-21, FR-23, FR-37; scenario cites FR-21, FR-50).

**3. UI components.** Header summary dl; `.moderation-policy-banner` (info-soft, role note, link to full policy); `.filter-chips` (filter-chip x5); `.sort-selector` (native select x3); `.review-card` (card.muted) with `.review-rating` (rating-stars), `.review-reviewer`, `.review-text`, `.automated-flags` (badge.neutral/warning/destructive), `.consistency-check`, `.smc3-warning` (warning-soft) + acknowledgment checkbox; Approve (button.primary md), Edit (button.variant.secondary), Remove (button.variant.destructive); `.edit-review-modal` (modal.standard, readonly textarea with redact selection, preview, Save), remove modal (alertdialog: select + textarea); bulk-pattern banner.

**4. User actions.**
| Action | Result |
|---|---|
| Filter: All / Pending / Flagged / Edited / Removed | Re-render list; count badge updates |
| Sort: Newest / Flag severity / Lowest rating first | Re-order |
| Acknowledge SM-C3 (checkbox, critical reviews only) | Required before actions on <= 3-star reviews (mockup disables all three actions until checked) |
| Approve | Publishes review to provider profile; logs decision |
| Edit | Modal: redact selected content, keep the rest; preview; Save logs what was redacted |
| Remove (reason required) | Modal: reason from taxonomy (select) + textarea; Save logs decision; cross-link to audit log |
| Bulk-view CTA (pattern banner) | Opens bulk view of similar-pattern reviews; per-review acknowledgment still needed for critical ones |
| See full policy | Policy doc (not specified) |
| Back to Queue | 4.1 |
| Load more (mockup) | Pagination |

**5. States.** 1 default pending queue. 2 flagged-only. 3 consistency-detected: inline "consistent with prior decisions" or "inconsistent - explain deviation". 4 SM-C3-warning-shown: reviews of 3 stars or fewer display warning; still editable but explicit acknowledgment required. 5 edit-modal-open. 6 remove-modal-open. 7 bulk-pattern-detected: "N reviews of similar pattern detected this week". Empty/error/offline unspecified; polling 5 min + push `review.moderation`. "Edge-case review: escalate to Ayaat's manual review only" (outline; undefined).

**6. Data displayed.** Header: pending count (12), flagged for review (3); policy text; per card: star rating (N of 5), reviewer name (or anonymous), booking ref, submitted time-ago, review text, automated flags (clean / low-effort / profanity / off-topic), Ayaat's prior decisions for similar reviews (count by type with approved/edited breakdown), SM-C3 warning; photos (outline says photos shown; spec layout does not show photos). Source: Review, ReviewPhoto, ReviewFlag, ModerationDecision history.

**7. Data required/captured.**
| Field | Type | Required | Options |
|---|---|---|---|
| SM-C3 acknowledgment | checkbox | required for critical reviews | |
| Remove reason | select (taxonomy) + textarea | required | abuse / off-topic / low-effort / doxxing / impersonation (Next Steps; policy banner lists only abuse, off-topic, low-effort) |
| Edit redaction | text selection of readonly body | required to save | preview shown |
| Deviation explanation | text | required when "inconsistent" (inferred) | |

**8. Transitions.** Review: pending -> approved (published to provider profile) | edited (redacted, published) | removed. PRD FR-23 says reviews render publicly "once submitted (subject to moderation)" and removed reviews are retained but not rendered; spec makes publication gated on Admin approval (pre-moderation). Filters imply states Pending/Flagged/Edited/Removed. Decisions logged to audit trail (FR-37). Next: back to 4.1.

**9. Validation.** Remove modal: reason required (`aria-required`); no removal of critical reviews without a documented policy-violation reason; no bulk-remove of critical reviews without per-review acknowledgment; low-effort is a flag not auto-action; Edit modal textarea not required.

**10. Integrations.** Photo storage (review photos displayed/moderated; outline). Notifications on removal/edit to reviewer or provider: not specified. Push `review.moderation`.

**11. Business rules.** SM-C3: average star rating is NOT a goal; critical reviews = 3 stars and below (spec: "3 stars and below"; mockup says "2-star/3-star critical"); automated-flag types: clean, low-effort (under 5 words, no specifics), profanity, off-topic; consistency check groups prior decisions by length/flag type; no avg-rating displays or "hurting our average" framing; no comparison across providers; SM-C3 dashboard tile "Reviews moderated this week: {N} - critical reviews protected: {N}" is suggested as a separate surface; removal requires the same rigor as declining an application; all decisions audit-logged (FR-37, FR-50 in spec).

**12. Language.** English admin UI; Bangla column present (G1). Review text is user content, shown in whatever language written (inferred).

**13. Assumptions.** Reviews arrive as pending and are held until Approve; automated flagging (profanity, off-topic, low-effort) exists; Ayaat's own decision history is queryable.

**14. Gaps/questions.**
- Pre-moderation (hold until approved) vs PRD FR-23 (public once submitted, remove for cause); reason set differs (PRD: abuse, off-topic, off-platform contact details; spec: abuse, off-topic, low-effort + doxxing, impersonation). "Edit/redact" has no PRD basis and could conflict with "Verified Review" integrity (FR-20/FR-21); is the reviewer informed? PRD FR-23 says Provider cannot respond or dispute reviews in v1.
- Does the verified review also show in 4.6 as "Verified review" before it is approved?
- Whether `<= 3 stars` or `critical` threshold is "3 and below" vs mockup showing 2- and 3-star only; 4-star has no warning.
- Pattern detection rule ("similar pattern") undefined; counts "this week".
- Mockup differences: header adds "Last decision 23m ago - 47 this week"; filter counts show All 12, Pending 9, Flagged 3, Edited 2, Removed 1 (Pending 9 vs header "12 pending"); third card (Tahmid K., 4 stars, booking PC-2026-0012) with 27 prior decisions; reviewer 2 shown as "Anonymous - username T_dhaka_99" (spec "Anon"); card 1 adds "Tito's Eid stay with Kamrul" (Tito stays with Rashid in 4.2); SM-C3 acknowledgment checkbox disabling the actions is drawn (consistent with A11y spec); "Load more" with "9 more pending". Bulk banner says "2-star low-effort reviews on bookings PC-2026-0003 through PC-2026-0009".
- Review photos: outline lists photos; spec shows none (FR-21 "reviews with photos").

---

# Page 4.8 - Payout Reconciliation View

**1. Identity.** 4.8 - Payout Reconciliation View - role `admin` - route `/admin/payouts/reconciliation` (deep-linkable from queue's finance section) - spec-only - spec validated.

**2. Purpose.** Monthly finance close: reconcile MFS settlements against provider payouts, detect discrepancies, hand off a reconciled ledger; read/reconcile only, no payment modification (PRD FR-41, NFR-23, risk R-13; scenario cites FR-29, FR-31).

**3. UI components.** Header period summary; `.monthly-close-card` (card.elevated) with gross/commission/net/MFS received/mismatch delta (warning-soft)/frozen/expected-vs-actual, `.mark-reconciled` (button.primary lg), `.export-csv` (link); `.reconciliation-filters` (filter-chip); `.reconciliation-table` (card.muted; sortable table; copy-to-clipboard on MFS ref, mono font; state badges success/warning/neutral); `.discrepancy-investigation` (card.elevated, conditional) with `.investigation-notes` (ol), `.add-investigation-note` (input.text), `.escalate-platform-team` (button.variant.destructive); confirm modal for period close.

**4. User actions.**
| Action | Result |
|---|---|
| Filter by provider, date range, state (All / Matched / Mismatch / Frozen / Pending) | Re-render table |
| Sort columns | Table sortable |
| Copy MFS ref | Clipboard |
| Add investigation note (mismatch) | Posts immediately with timestamp |
| Escalate to platform team | Routes to platform-team queue; platform team notified; notes preserved (state 6) |
| Mark period reconciled | Confirm modal "Mark Aug 2026 reconciled? Once marked, no further edits from this surface"; logs decision; period archived; next period loads. Disabled when a mismatch exists |
| Export to accounting (CSV) | Downloads CSV (parallel to accounting import schema; format unspecified) |
| Back to Queue | 4.1 |

**5. States.** 1 period-open (reconciled as they complete; close CTA enabled only when all reconciled). 2 period-mismatch-detected (delta > 0; Mark disabled; Escalate primary; discrepancy section visible). 3 period-frozen-payouts-present (4.6 disputes show as frozen; accounted for; not blocking). 4 period-closing-confirm. 5 period-closed (archived; CSV exported; next period loads). 6 discrepancy-escalated. 7 all-matched-clean ("All matched - ready to close"). Row states: matched, mismatch, frozen, pending. Polling every 30 min; push `payout.reconciliation`.

**6. Data displayed.**
- Summary: period (Aug 2026), booking count (47) split reconciled/mismatch/frozen (45/1/1), gross, commission (15%), net to providers, MFS settlements received (+ delta vs expected), frozen payouts (4.6 disputes pending), expected vs actual MFS balance.
- Table columns: Date, Provider (name + tier badge), Booking (truncated ref, tooltip full), Gross, Commission, Net, MFS ref (e.g. bKash-TXN-...8812), State. Date format stated as YYYY/MM/DD but sample shows MM/DD.
- Discrepancy: amount missing, provider, date, expected MFS ref, received state, booking, provider contact, notes.
Source: Booking, Payment, Payout, MfsSettlement, Report (for frozen), ReconciliationPeriod.

**7. Data captured.** Investigation notes (text, timestamped); period close action (confirm); filters. Escalation (target, reason implicit). No numeric edits.

**8. Transitions.** Payout line: pending -> matched | mismatch | frozen. Period: open -> closing-confirm -> closed (archived, immutable on this surface). Mismatch: noted -> escalated. Frozen derives from 4.6 resolved-with-hold disputes (and PRD acute-event freezes).

**9. Validation.** Mark reconciled disabled with `aria-disabled` + `aria-describedby` while mismatch present; confirm modal before close; every line human-reviewed (no auto-reconcile). Arithmetic in sample: commission 15% (92,775 on 6,18,500), net = gross - commission (5,25,725), delta = 7,500 (5,25,725 - 5,18,225).

**10. Integrations.** MFS settlement data (bKash / Nagad "settlement API pull", Next Steps; assumption, no contract given); CSV export to accounting; platform-team escalation queue. Receives MFS txn refs and amounts; sends nothing to MFS (no payment-modification authority).

**11. Business rules.** Commission 15% shown as a fixed label (PRD FR-41/NFR-25: static in v1, values architecture-stage; Tier-A and Tier-B may differ) (conflict with "Commission (15%)" as one rate for all rows). Row sample: 16,830 gross -> 2,524 commission -> 14,306 net (rounded down; 15% = 2,524.50). Close blocked while mismatch > 0; frozen payouts do not block closing. After close, no further edits from this view. Audit logging of decisions (FR-37). No auto-reconcile, no penalty CTA, no period-to-period pressure comparison, admin-only.

**12. Language.** English; Bangla column present (G1). Currency format BDT with Indian-style grouping (6,18,500).

**13. Assumptions.** One MFS settlement ref per booking; settlement amounts arrive in the same month; monthly period; expected MFS balance = net to providers (frozen not excluded); Platform team exists as an escalation destination (but v1 is a single admin; PRD has no "platform team" role) (inferred).

**14. Gaps/questions.**
- Summary math: frozen 16,830 appears as part of expected 5,25,725 net? Expected MFS balance equals total net, so frozen payouts are not excluded, yet payouts that are frozen have not been paid. Unclear.
- Frozen amount BDT 16,830 equals gross for Kamrul's PC-...003 / and 4.6's full payout; row shows net 14,306 for frozen row; amount basis inconsistent.
- Frozen row is Kamrul / PC-...003 (08/26) but the open dispute in 4.6 is on PC-2026-0007 (Kamrul). 4.8's PC-...007 is Rashid M., matched.
- Booking 47 in Aug vs scenario's "52 in-stay" and PRD ceiling 75/month.
- "Platform team" is not defined in PRD (single admin).
- "Bookings: 47 (45 reconciled - 1 mismatch - 1 frozen)" sums to 47; header shows "1 ⚠".
- What does Admin do on mismatch other than escalate (retry settlement pull, mark exception)? Partial settlements, refunds (PRD FR-42) and gateway fees not in columns.
- Sample dated Aug 2026 with Eid week; Eid-al-Adha context vs Aug unclear (sample).
- PRD says audit log export is out of scope; CSV export for accounting is separate (OK).

---

# Page 4.9 - Post-Mortem Practice Log

**1. Identity.** 4.9 - Post-Mortem Practice Log - role `admin` - routes `/admin/postmortems` (library), `/admin/postmortems/:eventId` (form; deep-link from 4.2 Step 7), `/admin/postmortems/versions` (runbook version history) - spec-only - spec validated.

**2. Purpose.** Close every acute event with a documented post-mortem and feed lessons back into a versioned runbook (SM-19; PRD FR-30, FR-34; Ayaat Want #1).

**3. UI components.** Library: `.library-header`, `.postmortem-reminder` (warning-soft banner) + `.open-postmortem-form` (button.primary md), `.library-filters` (filter-chip x6), sort selector, `.pattern-detection` (info-soft, role note) + `.apply-pattern-to-version`, `.library-card` (card.muted) with worked/didn't/next lines, `.card-lessons-shared` (badge.success/neutral), `.apply-to-version` (button.primary sm). Form: `.event-header` (card.muted), `.form-summary`, `.form-worked` and `.form-didnt` (input.checklist + notes), `.form-next-version`, `.form-lessons-shared` (radio fieldset), `.save-postmortem` (button.primary lg), `.apply-to-runbook-v[N+1]` (button.variant.secondary). Version history view (ol with ins/del diff).

**4. User actions.**
| Action | Result |
|---|---|
| Open post-mortem form (reminder) | Form for that event, pre-filled |
| Filter: All / Diabetic / Heat / Behavioral / Provider / Tier-A | Re-render |
| Sort: Newest / Pattern density / Lessons-shared | Re-order |
| View pattern | Pattern detail (undefined target) |
| Apply to runbook v4 (pattern or card) | Creates runbook-version proposal; banner "Version v4 proposed - review in versions" |
| Open (library card) | Form/detail |
| Form: fill summary, tick checklists, notes, next-version changes, pick lessons-sharing | |
| Save post-mortem | Validates required; saves; returns to library; entry on top; logged |
| Apply to runbook v[N+1] (form) | Creates version proposal; "Applied to runbook v4 - review in versions"; links to versions |
| Version history | Timeline of versions; diff v3 vs v4 |
| Back to Library/Queue | |

**5. States.** 1 library. 2 reminder-active (CTA to that event). 3 filter-applied. 4 pattern-applied (proposal created). 5 form-new (save disabled until required; apply disabled). 6 form-pre-populated (steps pre-checked from runbook history; save enabled). 7 form-saved. 8 form-applied-to-version. 9 runbook-version-history. Outline: "Recent-event-no-postmortem: banner 'Acute event from 2 days ago - post-mortem due'". Polling 5 min; push `postmortem.due`. No partial autosave ("full or nothing").

**6. Data displayed.** Library header: documented count (12), due (1), active runbook version (v3). Reminder: event ID, title, "Event resolved N days ago", 48 hr window. Pattern card: "5 of 12 acute events involved diabetic small dogs - consider Tier-A diabetic-care specialization?". Library card: event ID, title (Tito's glucose drop), resolved date, runbook version at the time, what worked, what didn't, next version, lessons-shared status. Form header: event ID, title, "Eid stay - Day 4", provider/owner/neighborhoods, resolved datetime, active runbook version. Source: AcuteEvent, PostMortem, RunbookVersion.

**7. Data required/captured.**
| Field | Type | Required | Options |
|---|---|---|---|
| Event summary | textarea | required | |
| What worked | checklist of runbook steps (1-7) + notes | optional | steps pre-checked from history |
| What didn't | checklist of steps + notes | optional | |
| What to change in next version | textarea | required | |
| Lessons learned shared | radio | required (explicit selection mandatory) | Yes - anonymized / Yes - attributed / No (internal only) |
| Apply to runbook v{N+1} | action | optional | creates proposal |

**8. Transitions.** Acute event: resolved -> post-mortem due (within 48 hr) -> post-mortem documented (closed). Runbook: v3 active -> v4 proposed (from post-mortem or pattern) -> (accepted?) active (acceptance step not specified). Lessons sharing: anonymized -> provider portal; attributed -> provider portal with name; internal -> admin only.

**9. Validation.** Save disabled until Event summary and Next-version changes are filled; `aria-describedby` explains; no auto-save of partial entries; no sharing without explicit radio choice; Apply CTA disabled in new form and shows diff preview via `aria-describedby="version-preview"`; 48 hr window is a soft reminder, no penalty.

**10. Integrations.** Notifications: sharing lessons to provider portal (anonymized/attributed) and, per library sample, "owner in-app" (conflicts with form options which only mention providers); push `postmortem.due`. No SMS/payment/photos.

**11. Business rules.** Post-mortem within 48 hr of resolution (soft); every acute event gets a post-mortem regardless of outcome (PRD FR-30); required fields (summary, next-version); lessons sharing opt-in with anonymization; version-controlled runbook with diff; pattern detection example "5 of 12"; post-mortems visible to admin + provider + owner only (no public); SM-19 = post-mortem closure rate per acute event; pattern detection by event type + provider + neighborhood.

**12. Language.** English admin; Bangla column (G1). Lessons shared with providers: language of shared content unspecified.

**13. Assumptions.** Runbook is a versioned artifact (v3 active); checklist steps align with 4.2's 7 steps; each event has stored timeline for reference; pattern analysis can be computed from event type taxonomy (diabetic, heat, behavioral...).

**14. Gaps/questions.**
- PRD FR-34 out of scope: "Runbook versioning or change-control tooling (Admin-editable plain text in v1)"; FR-30 out of scope: "Cross-event pattern analysis tooling (deferred)". 4.9's version history/diff and pattern detection exceed PRD v1. Decide whether to build.
- Step numbering mismatch with 4.2 (library says Step 3 = vet lookup; form says Step 3 Admin role and Step 4 vet lookup; 4.2 Step 4 = vet lookup).
- Timeline contradiction for AE-2026-0001 (resolved Aug 26 11:42pm / "2 days ago" with v3 runbook, vs 4.2 active at 11:07pm in the same event, vs 31 Aug mockup date). Also a post-mortem that says "Step 1 fired within 30 sec" vs 4.2 Step 1 timestamps (11:02pm).
- "Resolved 2 days ago ... 48hr follow-up window" means the window is about to expire; sample shows the due state at exactly the limit.
- Who "accepts" a version proposal; what the owner/provider sees of "lessons shared" and whether "owner in-app" is a valid audience.
- Filters "Provider" and "Tier-A": meaning undefined. Event type taxonomy (Diabetic, Heat, Behavioral) incomplete (injury, death, etc., PRD includes illness, injury, or death).
- "Lessons shared with all providers" attributed option names the provider (Rashid) to peers: privacy/fairness concern vs 4.4 "no provider comparison".

---

# Page 4.10 - Off-Platform Defection Detection Dashboard

**1. Identity.** 4.10 - Off-Platform Defection Detection Dashboard - role `admin` - route `/admin/defection` (validation report suggests renaming to `/admin/trend-watch`) - spec-only - spec validated. Intervention playbook page is out of scope (not specified).

**2. Purpose.** Show aggregate soft signals that owners/providers are moving repeat bookings to WhatsApp/off-platform, with intervention playbook entry points (Ayaat Fear #3; PRD FR-36, FR-48, FR-50, SM-2, SM-13; assumption A-14 per scenario).

**3. UI components.** `.defection-header`, `.defection-trending-banner` (warning-soft; role status), `.defection-filters` (filter-chip x4), `.signal-category-card` (card.muted x3 categories), `.signal-row`, `.signal-dot` (warning / destructive), `.signal-summary`, `.signal-playbook` (link) and `.open-intervention-playbook` (button.primary md).

**4. User actions.**
| Action | Result |
|---|---|
| Filter: All / Owner-side / Provider-side / Cross-side | Show matching categories; count updates |
| Open playbook (per signal / banner) | Opens playbook page (out of scope); signal marked "intervention in progress"; audit-log entry created |
| Back to Queue | 4.1 |
| Complete intervention (state 6) | Signal archived; next-period data refreshes (control not drawn) |

**5. States.** 1 clean-state (no banner; signals shown; no patterns). 2 attrition-period (banner "Repeat-booking rate trending down {N}% - investigate - intervention playbook ready"; playbook CTA primary). 3 pattern-detected (at least one cross-side signal red; intervention CTA primary). 4 filter-applied. 5 intervention-launched. 6 intervention-completed. Polling every 6 hr; push `defection.signals`. Empty/error/offline unspecified.

**6. Data displayed (aggregates only).**
- Header: N signals (12), patterns detected (2).
- Trending banner: repeat-booking rate trend (down 8%); "12 owners with care-history >= 1 booking have not re-booked in 60+ days".
- Owner-side: 12 owners care-history viewed but no booking submitted (last 30 days); 5 owners unbookmarked/unsaved provider; 3 owners "I'm booking again" search returned zero results (capacity-supply gap).
- Provider-side: 2 providers utilization drop 30%+ (last 30 days); 1 provider profile views but no conversions (last 30 days).
- Cross-side: 4 owner+provider pairs appeared together once, no second booking (last 60 days; red/high priority).
- Source: aggregates of Booking, CareHistory view events, Bookmark/Saved, SearchEvent, ProviderProfileView, utilization (SM-13), repeat-booking rate (SM-2).

**7. Data captured.** None. Playbook launch records intervention started (signal id, time, actor) (audit log).

**8. Transitions.** Signal: detected -> intervention in progress -> completed/archived. Navigates to playbook (nudge templates + scheduling, out of scope; "both flow through PetCare, not WhatsApp").

**9. Validation.** None. Privacy rule: aggregate only, no per-owner/provider drill-down.

**10. Integrations.** Notifications: owner re-engagement nudge and provider re-engagement offer sent through PetCare notifications (not WhatsApp) (outline: "Your pet's care history is here - book in under 4 min"). Event-tracking inputs (care-history views, bookmarks, searches, profile views). Push `defection.signals`.

**11. Business rules.** Aggregates only; no auto-intervention (all nudges admin-initiated); no revealing defection to the provider being nudged; no sharing signals with other users; no "spy on chat" framing; no pressure copy or platform comparisons. Windows: owner signals last 30 days; "not re-booked in 60+ days"; provider utilization drop 30%+ in 30 days; cross-side 60 days. Dots: yellow soft signals, red cross-side. Banner threshold "trending down {N}%" (8% in sample; trigger threshold not defined). PRD: 30/60/90-day re-engagement thresholds for Tier Utilization from onboarding (FR-36) are not represented as such; the page uses 30-day and 60-day windows and no 90-day. Audit-logging interventions (cross-link "4.7 audit-log").

**12. Language.** English admin; Bangla column (G1; contains corrupted glyphs). Nudge copy for owners/providers must be bilingual per FR-47 (not specified here; playbook out of scope).

**13. Assumptions.** The platform can observe care-history views without booking, bookmarks/unsaves and zero-result "I'm booking again" searches; defection is inferred from behaviour, not from chat content; interventions are playbook-driven.

**14. Gaps/questions.**
- PRD FR-36 says the view is "organized by Provider and by signal type", flags providers below Tier Utilization thresholds at 30/60/90 days from onboarding, and lets Admin record re-engagement outreach and outcome against a Provider record. This spec is aggregate-only with no provider-level drill-down, no 90-day threshold and no outreach/outcome recording. FR-36 also scopes OUT automated owner-side defection detection ("requires platform-side signals Admin does not have"), while this page assumes owner-side signals.
- PRD FR-50 signals (WhatsApp swap attempts, direct repeat-client negotiation, unprompted Messenger outreach) are not covered; spec uses different signals.
- "12 signals - 2 patterns" in header vs listed rows (3 owner + 2 provider + 1 cross = 6 signal rows; counts 12/5/3/2/1/4 are population sizes). Which 2 patterns? ("12 owners" appears both as signal and banner).
- "Repeat-booking rate trending down 8%" threshold and period undefined (SM-2 targets deferred by PRD).
- Playbook page is out of scope but is the only action path; no way to record outcomes here.
- Sample banner emoji replaced by a corrupted character in spec; Bangla strings corrupt.
- The route name "defection" flagged as loaded by the validation report.

---

# Summary appendices

## (a) Page summary

| ID | Name | Route | Mockup? | Key entities |
|---|---|---|---|---|
| 4.1 | Admin Queue Dashboard | `/admin/queue` (admin root `/admin`; sign-in `/admin/sign-in`) | Yes: `06-admin-queue.html` (large divergence) | QueueItem (acute, report, booking, application, review), CeilingSnapshot, AcuteEvent, Report, Booking, ProviderApplication, Review |
| 4.2 | Acute Event Runbook View | `/admin/runbook/:eventId` | Yes: `42-acute-event-runbook.html` (provider-side `08`/`57` are upstream) | AcuteEvent, AcuteEventStep, AcuteEventTimelineEntry, OwnerNotification, VetClinic, NotificationTemplate |
| 4.3 | Provider Application Review | `/admin/applications/:applicationId` | Spec-only | ProviderApplication, VerificationArtifact, VettingCriterion, DeclineReason, Appeal |
| 4.4 | Provider Health Surface | `/admin/providers` (detail `/admin/providers/:id` out of scope) | Spec-only | Provider, ProviderHealthSignal, QualityFlag, AdminTask |
| 4.5 | Operating Ceiling Dashboard | `/admin/ceiling` | Spec-only | CeilingSnapshot, CeilingTrendPoint, ThrottleSetting, AuditLogEntry |
| 4.6 | Dispute Investigation View | `/admin/disputes/:disputeId` | Spec-only | Report/Dispute, Booking, Payout, InvestigationNote, ProviderResponse, PostMortem (auto) |
| 4.7 | Review Moderation Queue | `/admin/reviews/moderation` | Yes: `47-review-moderation-queue.html` | Review, ReviewPhoto, ReviewFlag, ModerationDecision, RemoveReason |
| 4.8 | Payout Reconciliation View | `/admin/payouts/reconciliation` | Spec-only | ReconciliationPeriod, Payout, MfsSettlement, Booking, InvestigationNote, Escalation |
| 4.9 | Post-Mortem Practice Log | `/admin/postmortems`, `/admin/postmortems/:eventId`, `/admin/postmortems/versions` | Spec-only | PostMortem, RunbookVersion, AcuteEvent, PatternInsight |
| 4.10 | Off-Platform Defection Detection Dashboard | `/admin/defection` | Spec-only | DefectionSignal (aggregate), InterventionPlaybook, InterventionRecord |

Mockups not tied to a 4.x page: `08-acute-event.html` (provider-side acute-event report form, older BMM set; feeds 4.2 Step 1) and `57-acute-event-trigger.html` (page 5.7, Scenario 05 provider-side trigger; "This starts the runbook").

## (b) Data entities and fields implied

Fields marked * are shown in the specs; others are (inferred) from behaviour.

- **AdminUser** (Ayaat): id, name, role=admin, auth credentials (mechanism unspecified), sound-mute preference.
- **CeilingSnapshot**: active_providers (max 25), in_stay_bookings or completed_bookings_30d (max 75; see G3), disputes_open, acute_events_open (max 1), computed percent and state (healthy/near/breached) per axis, timestamp.
- **CeilingTrendPoint**: date, providers, in_stay, acute; projection (days to ceiling).
- **ThrottleSetting**: pause_tier_b_applications (bool), prioritize_tier_a_outreach (bool), per-tier onboarding throughput (value type undefined), active_since, applied_by, reset_at.
- **QueueItem** (derived): type (acute/dispute/awaiting_confirmation/in_stay/application/review), priority, subject, links (booking/owner/provider), created_at (for time-elapsed), CTA target.
- **Booking** (reference): id (format PC-2026-NNNN), owner, provider, pet, state (PRD: in-stay, disputed, resolved, refunded, completed, etc.), stay day N of M, gross, commission, net, payout_status.
- **AcuteEvent**: id (AE-2026-NNNN), booking, pet, provider, owner, event_type (e.g. glucose drop), severity (mockup), triggered_at, resolved_at, state, elapsed timer, runbook_version, steps[], timeline[], post_mortem_ref.
- **AcuteEventStep**: step_no (1-7), name, status (done/active/pending/skipped?), completed_at, skip_note (mockup).
- **AcuteEventTimelineEntry**: event_id, timestamp, actor (provider/admin/system), type (trigger, vet contacted, owner notified, custom), text.
- **OwnerNotification**: event_id, language (EN/BN), channel (in-app/SMS), body, sent_at, sent_by, delivery status (inferred).
- **NotificationTemplate / RunbookArtifact**: language, body with placeholders, version (editable per PRD FR-34; "backend constant" per spec).
- **RunbookVersion**: version number (v3 active, v4 proposed), content, changes (diff), source post-mortem/pattern, status (proposed/active), created_at.
- **VetClinic** (FR-45): name, doctor, neighborhood, distance_km, phone, hours/24h flag, rank (primary/alternative), freshness.
- **PostMortem**: event_id, summary*, worked_steps[] + notes, didnt_steps[] + notes, next_version_changes*, lessons_sharing (anonymized/attributed/internal), saved_at, runbook_version_applied.
- **PatternInsight**: pattern label (e.g. diabetic small dogs), N of M events, suggested action.
- **ProviderApplication**: id, applicant name, tier (B), neighborhood, submitted_at, sla_due_at (7 days), status (applied/vetting/awaiting_info/approved/declined), decision, decline_reason, intro_notes, request-info thread.
- **VerificationArtifact**: type (identity NID, address, references, capacity per species, vaccination, capability flags), status (verified/pending/missing), references contacted/received counts, document refs.
- **VettingCriterionState**: 7 boolean criteria per application.
- **Provider**: id, name, tier, neighborhood, status (active/suspended/removed), health metrics (response_rate, daily_update rate N/N, care_record_completeness, dispute_count, last_booking_at), quality_flag (healthy/watch/flag), flagged_for_followup.
- **AdminTask** (follow-up): provider_id, created_at, note?, status.
- **Report/Dispute**: id (DSP-2026-NNNN), booking, category (e.g. noise complaint), reported_at, window_ends_at (7 days from completion), provider_response (text, submitted_at), investigation notes[], resolution (payout decision, partial_amount, reason, follow_up_notes), state (open/awaiting_provider/resolution_ready/closed/archived).
- **Review**: id, booking, reviewer (name or anonymous username), rating (1-5), text, photos[], submitted_at, moderation_state (pending/approved/edited/removed), automated flags (clean/low_effort/profanity/off_topic), published_at.
- **ModerationDecision**: review_id, action (approve/edit/remove), reason (taxonomy), redacted_ranges, SM-C3 acknowledged (bool), decided_at, decision similarity group.
- **Payout / MfsSettlement / ReconciliationPeriod**: period (month), booking_id, gross, commission, net, mfs_ref (e.g. bKash TXN), settlement_amount, state (matched/mismatch/frozen/pending), mismatch delta, notes[], escalated flag, closed_at, closed_by, CSV export.
- **DefectionSignal** (aggregate): category (owner/provider/cross), definition, count, window, severity (soft/red), intervention_state.
- **InterventionRecord**: signal, playbook, started_by, started_at, completed_at.
- **AuditLogEntry** (PRD FR-37): admin identity, timestamp, action type, reason code, target entity; immutable, 24-month retention (FR-10).
- **Notification subscription channels**: admin.queue.acute, admin.queue.disputes, runbook.{id}, admin.ceiling, review.moderation, postmortem.due, payout.reconciliation, defection.signals.

## (c) API operations implied (no gateway contracts invented)

All require admin auth; polling intervals as specified.
- GET queue summary + sections (poll 30 s) incl. ceiling banner counts.
- GET ceiling snapshot and trend/projection (poll 5 min); POST apply throttle; POST reset throttle.
- GET acute event detail with steps, timeline, vet clinics (poll 30 s); POST advance/skip step; POST add timeline entry; POST send owner notification (channel PetCare or SMS, language); POST create/close acute event resolution; GET notification template by language.
- GET vet clinics for the event's neighborhood (directory).
- GET provider application detail; PATCH criteria checkbox state; POST request-more-info; POST decline (reason); POST approve (optional notes); GET appeal policy.
- GET providers with health metrics and filters/sort (poll 5 min); POST flag provider for follow-up (create admin task).
- GET dispute detail with booking history summary; POST investigation note; POST resolve dispute (payout decision, optional amount, reason, follow-up); GET/POST provider response is Provider-side (not here).
- GET review moderation queue with filters/sort and prior-decision aggregates (poll 5 min); POST approve review; POST edit/redact review; POST remove review (reason); GET bulk pattern group.
- GET reconciliation period summary + rows with filters (poll 30 min); POST reconciliation note; POST escalate mismatch; POST mark period reconciled; GET CSV export.
- GET post-mortem library (filters, sort, pattern insights); GET/POST post-mortem for event; POST apply to runbook version (create proposal); GET runbook versions and diff.
- GET defection signal aggregates (poll 6 hr); POST start intervention (audit log); POST complete intervention.
- POST audit log entry (implicit on every state-changing action); GET admin notification subscription/push.

## (d) Hard-coded sample values that would be fabricated trust signals if shown as real data

Do NOT ship these as seed or default content in production; they come from the storyboard.
- People: Ayaat (admin); Rashid M., Gulshan (Tier-A provider, Response 96%, Updates 9/9, Care-record 95%, Disputes 0); Farzana A., Banani (Tier-A); Kamrul H., Bashundhara; Sadia H., Bashundhara (Tier-B applicant); Bibi R. / Bibi (owner, Banani); "Anon"; Tito (diabetic small dog; Shih Tzu in mockup); mockup-only names: Tanvir H., Laila R., Nadia T., Imran S., Asif R., Rahima K., Shahin & Luna, Tahmid K., "T_dhaka_99", Dr. Rahman, Dr. Khan.
- Vet clinics: Gulshan Veterinary (1.2 km, open until midnight), Dr. [Name] placeholder; mockup 42: Gulshan Veterinary Clinic, Banani Pet Hospital (2.1 km, until 10pm), Gulshan 2 Animal Care (3.4 km, 24h); mockup 08: Gulshan Pet Clinic, Banani Animal Care, Dhanmondi Veterinary Hospital; all phone numbers (+880-XXX-XXXX placeholders; +880 1700-123456 etc. in 08).
- Counts/ratios: 18/25 providers (72%), 52/75 in-stay (69%), 1/1 acute (100%), 4 disputes, 6 awaiting confirmation, 2 Tier-B applications, 12 reviews pending/3 flagged, 3 on watch/1 flagged, 12 documented post-mortems/1 due/runbook v3, "5 of 12 acute events involved diabetic small dogs", 12 signals/2 patterns, 12 owners, 5 owners, 3 owners, 2 providers, 1 provider, 4 pairs, "trending down 8%", "approaching ceiling in 11 days", mockup 06: 2 acute, 11 vetting, 58 in-stay, 87% of ceiling, BDT 64k, "Day 3 of Eid week", "75 active items"; mockup 47: "47 this week", "Last decision 23m ago", 27 prior decisions.
- Money and dates: BDT 16,830 payout; 6,18,500 gross; 92,775 commission (15%); 5,25,725 net; 5,18,225 MFS received; 7,500 missing; row values 12,450 / 1,867 / 10,583; 9,200 / 1,380 / 7,820; bKash-TXN-...8812; Aug 2026 period; 47 bookings (45/1/1); AE-2026-0001, DSP-2026-0001, PC-2026-0001...0012 booking refs; 31 Aug 2026; resolved Aug 26, 2026 11:42pm; 11:02pm trigger and timeline times (11:04, 11:05, 11:07; 11:42pm, 11:55pm, 12:08am; 12:14pm, 12:30pm); "Submitted 12 days ago / 5 days left"; Day 4 of 9; 7/9 updates posted; 12 chat messages.
- Reviews and quotes: "The neighborhood was loud at night. Kamrul tried his best but my dog couldn't sleep." (3 stars, Bibi R.); "this provider is ok i guess" (2 stars); "Nadia sent photo updates every evening..." (4 stars, mockup); provider response "I addressed the noise concern within 30 minutes..."; Ayaat's prior-decision stats (4 reviews: 3 approved/1 edited; 12 low-effort: 8 approved/4 edited; 27: 26/1); post-mortem sample text (what worked/didn't, step timings "vet lookup fired in 4 min", "saved 5+ min", "Owner asked 2 clarifying questions").
- Ratings or counts shown on provider cards (health percentages) and "ranked" comparisons must always be computed from real data.
