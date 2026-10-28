---
title: PetCare — EXPERIENCE
status: final
created: 2026-08-29
updated: 2026-08-31
ux_revision: 3
revision_note: "DS extraction round 2: 8 behavioral entries added under Component Patterns — Toggle (Primary-Soft), Payout State Indicator, Pattern Detection Card, SM-C3 Protection Banner, Counter-Metric Header Card, Defection Signal Dot, Acute-Event Trigger Banner, Error State Illustrations. Sticky Action Bar updated with 2 new corpus variants."
source_prd: /home/bs00856/Documents/Projects/PetCare/_bmad-output/planning-artifacts/prds/prd-PetCare-2026-08-29/prd.md
---

# PetCare — EXPERIENCE

*Information architecture, behavior, states, interactions, accessibility, journeys. DESIGN.md owns visual identity. Spines win on conflict with any mock or import.*

## Mockups

Eight key-screen mockups in [`mockups/`](./mockups/) (open [`mockups/index.html`](./mockups/index.html) for the full demo grid). The Key Flows below reference these by ID.

- [`mockups/01-home.html`](./mockups/01-home.html) — Home / Landing · UJ-1 step 1
- [`mockups/02-search-results.html`](./mockups/02-search-results.html) — Search Results · UJ-1 step 2, UJ-4 step 1
- [`mockups/03-provider-profile.html`](./mockups/03-provider-profile.html) — Provider Profile · UJ-1 step 3
- [`mockups/04-booking-configuration.html`](./mockups/04-booking-configuration.html) — Care Configuration · UJ-1 step 4, UJ-4 step 2
- [`mockups/05-booking-confirmation.html`](./mockups/05-booking-confirmation.html) — Booking Confirmation · UJ-1 step 5-6 (climax)
- [`mockups/06-admin-queue.html`](./mockups/06-admin-queue.html) — Admin Queue Dashboard · UJ-3 step 1-7 (climax)
- [`mockups/07-provider-calendar.html`](./mockups/07-provider-calendar.html) — Provider Calendar / Capacity · UJ-2 step 1-6 (climax)
- [`mockups/08-acute-event.html`](./mockups/08-acute-event.html) — Acute Event Surface · UJ-3 step 2-4

## Foundation

**Form factor:** mobile-first Progressive Web App (PWA). The primary surface is a phone — Owner and Provider are designed at 390×844 first, then expanded for tablet and desktop. Admin Console is a separate, desktop-first surface (≥1280×800) optimized for an operator working through a queue, not browsing on the go. The reasoning is rooted in the PRD context: Owners and Providers operate on Dhaka 4G with intermittent connectivity (NFR-15); the Admin is the single operator at the operating ceiling (UJ-3), running the queue from a desk.

**UI system:** shadcn-derived components built on Tailwind CSS. Visual tokens (colors, typography, spacing, radii, elevation) live in DESIGN.md and are referenced from this document via `{path.to.token}` syntax when a behavioral decision depends on a specific visual constraint. Component visual specs — what a Button looks like, what a Tier-A badge contains — live in DESIGN.md too. This document owns *how things behave*.

**PWA, not native app:** the PRD commits to a PWA surface (FR-46). This means offline-tolerant interactions (cached profiles, in-progress bookings held locally), install-to-home-screen capability, and a web URL that works without app-store distribution. Behavioral implications: no native push notifications in v1 (booking-scoped chat uses on-page indicators + email), no background GPS, no contact picker. Anything that would have required native permissions belongs to v2.

**Theming:** single light theme in v1. Dark mode is design-system-ready (all colors are CSS variables per DESIGN.md.Notes) but not implemented. Bangla parity (FR-47) is built into the typography stack (DESIGN.md.Typography) but copy translation is out of scope for v1.

**Localization:** English-first copy throughout the demo. The font stack (DESIGN.md.Typography) supports Bengali script fallback when copy translation lands later.

## Information Architecture

The IA is three-rooted — one root per role. Each root has the screens its role needs to do its job. Cross-role touchpoints (Booking, Provider Profile, Chat) live in shared leaf nodes.

### Owner root — `/`

The Owner's IA is search-led: they come to PetCare because Tito needs care for the Eid trip, not to browse. The root surface is a search/landing page that prompts them with date + species + neighborhood before showing any Providers. From there the IA fans out into Provider discovery, Booking, and post-booking care flows.

```
/                            Home / search entrypoint
                             - Date picker, species, neighborhood prompt
                             - CTA: Search Providers
                             - For returning owners: pre-saved pets + recent bookings
/search                      Search Results (curated shortlist default, FR-11)
                             - Tier-A sorted above Tier-B
                             - Date-Level Capacity filter
                             - Neighborhood + density indicator
/provider/:id                Provider Profile
                             - Tier-A badge, profile completeness, photos
                             - Date-Level Capacity calendar for selected dates
                             - Verified Reviews (with photos)
/booking/new                 Booking Configuration
                             - Step 1: dates + Pet selection (pre-fill from Care History)
                             - Step 2: Care Configuration (food, medication, care flags, instructions)
                             - Step 3: review + submit
/booking/:id                 Booking Confirmation + State
                             - Booking State Indicator (FR-14)
                             - Booking-scoped chat (FR-44)
/booking/:id/daily-update    Daily Update (FR-43)
/bookings                    Owner's Bookings list
/pets                        Owner's Pets list
/pets/:id                    Pet Profile + Care History (FR-6, FR-7, FR-9)
/reviews/new/:bookingId      Submit a Verified Review (FR-20, FR-21)
```

### Provider root — `/provider`

The Provider's IA is calendar-led. They come to PetCare to manage their capacity, accept/decline requests, and post daily updates. The root surface is the Calendar (Date-Level Capacity) with incoming-booking notifications surfaced prominently.

```
/provider                    Calendar / Capacity dashboard
                             - Date-Level Capacity grid (FR-12)
                             - Peak-window indicator
                             - Pending requests badge
/provider/booking/:id        Booking detail
                             - Pet Profile (Owner-shared subset, FR-9)
                             - Care Configuration (read-only Owner input)
                             - Accept / Decline with structured reason (FR-17)
/provider/booking/:id/daily  Daily Update composer (FR-43)
/provider/reviews            Review feed (Tier-A providers only — Tier-B see own reviews without ranking signal)
/provider/profile            Profile editor (FR-5 — completeness drives Tier-A qualification)
```

### Admin root — `/admin`

The Admin's IA is queue-led. Single operator at the operating ceiling (UJ-3); the IA is built so the highest-priority item is always one tap away from the root.

```
/admin                       Queue Dashboard (FR-32)
                             - Priority 1: Acute (coral)
                             - Priority 2: Dispute (red)
                             - Priority 3: Awaiting vetting (amber)
                             - Priority 4: In-stay (forest)
/admin/queue/:id             Queue item detail
                             - Acute Event coordination (FR-34)
                             - Dispute investigation (FR-35)
                             - Provider intake + vetting (FR-33)
/admin/providers             Provider list + Tier Utilization 30/60/90 (FR-36)
/admin/audit                 Audit log (FR-37, NFR-21/22)
```

### Cross-root touchpoints

Some surfaces are referenced from more than one root:

- **Provider Profile** `/provider/:id` is reachable from Owner `/search` results, from booking-scoped chat history, and from Admin investigation flows.
- **Booking State Indicator** lives inline in `/booking/:id` (Owner view), `/provider/booking/:id` (Provider view), and `/admin/queue/:id` (Admin view). The same indicator, same color, same semantics — single source of truth.

## Voice and Tone

PetCare speaks the way a thoughtful friend who happens to know about pet care would speak — direct, warm, and never over-promising. Microcopy carries the trust load: it is where curated supply, demonstrated care fit, and acute-event responsibility are earned in plain language.

### Voice principles

- **Calm, not cheerful.** Owners are often anxious (Eid trip, diabetic pet, senior cat). The system's voice matches their emotional state without amplifying it.
- **Specific, not generic.** "Tito's insulin schedule at 7am and 7pm" not "your pet's medication needs." Specificity is a care claim.
- **Plain, not jargon.** "Date-Level Capacity" is internal product language; the surface says "which dates can take a new pet."
- **Honest about uncertainty.** When something is approximate (capacity estimates, vet clinic hours, transit windows), the copy says so. No "guaranteed" claims.
- **Brief, not curt.** PWA screens have limited space; voice compacts without losing warmth. Two clauses max per sentence.

### Tone calibration by surface

| Surface | Tone | Example |
|---|---|---|
| Search entrypoint | Warm, practical | "Find care for your pet." |
| Provider Profile | Confident, restrained | "Tier-A · Admin-vetted. Last Eid booking: 4 diabetic dogs." |
| Care Configuration | Attentive, serious | "Tito's routine matters to us. Walk us through insulin schedule, meal times, and any anxiety triggers." |
| Booking State Indicator | Informative | "Confirmed · Tito's stay begins 28 March" |
| Acute Event banner | Calm, action-oriented | "Rashid reported an event. We've notified Bibi and paused the payout for review." |
| Verified Review | Editorial | "Bibi, with Tito — three stays." |
| Structured Decline | Clear, respectful | "Rashid can't take diabetic pets this month — too many senior-dog bookings already." |
| Admin Queue | Operational | "Acute · Gulshan · 14m ago · Provider: Rashid" |

### Microcopy rules

- **Headlines are sentence case, not Title Case.** "Find care for your pet" not "Find Care For Your Pet."
- **Button labels are verb-first, two words.** "Search Providers", "Confirm Stay", "Submit Review", "Decline with reason." Never "Submit!" or "Click here."
- **Avoid stock phrases.** No "Oops!", "Sorry about that!", "Something went wrong." Use specific, factual corrections: "Booking not confirmed — Rashid's Calendar was already full."
- **Error messages name the cause and the next step.** "We couldn't reach bKash. Try again, or use a card."
- **Empty states describe what *could* be here.** "No bookings yet — when Bibi books with Rashid, you'll see stays here." Not "Nothing to show."

## Component Patterns

Components are defined visually in DESIGN.md. This section owns their *behavior* — when they appear, how they respond, what they do as state changes.

### Button

- **Disabled state = reason.** A disabled button is rare; if disabled, the button or its helper explains why ("Search needs at least one date").
- **Loading state stays in place.** Submitting buttons replace label text with a spinner or change to "Booking…" but do not collapse.
- **Destructive actions require confirmation inline.** "Decline with reason" opens an inline confirmation pattern, not a modal — speed matters in the Provider path.
- **Primary actions are one per view.** A screen has one forest-green primary button. Secondary actions are outline or ghost. This is enforced discipline, not a soft guideline.

### Card

- **Cards are interactive when their entire surface is a navigation target.** Tap target ≥ 44×44px on every card.
- **Static cards (info surfaces, empty states) have no hover shadow change.** Only navigation cards respond on hover.
- **Cards stack on mobile with `space-y-4`.** No masonry, no carousel.
- **Inside cards, sections have `space-y-6` minimum.** Generous interior spacing.

### Input

- **Inputs are always labeled.** Placeholder text is example-only, never a label substitute. Required fields have an asterisk in the label, not the placeholder.
- **Helper text appears below the input.** Errors appear at helper-text position — same place, not a separate toast.
- **Care Configuration has section breaks.** Food, Medication, Care Flags, and Free-text Instructions each get their own group with header + helper text + grouped fields. The intake feels guided, not a wall of fields.
- **Inputs persist their state to local storage on blur.** PWA reality: if connectivity drops mid-intake, the user does not lose Tito's diabetes notes. Reconnection resyncs when the booking is submitted.

### Tier-A Provider Badge

- **Always visible, never below the fold.** Appears in Search Results card top-right, on Provider Profile header, and inline in booking confirmation.
- **Behavior:** static element. Tapping it surfaces a one-sentence explanation ("Admin-vetted: 5+ vetted bookings with documented special-care experience."). No modal, no nav.
- **Tier-B pairing (visual spec in DESIGN.md).** Tier-B providers are real, vetted providers with less proven track record. Visual treatment is de-emphasized — same card surface, `opacity-90`, emoji placeholder instead of photo, single-soft-sentence summary. Never hidden, never "Tier-A minus color." The hierarchy is shown, not assumed.

### Verified Review Card

- **Photo-first.** The photo (or photo grid) occupies the top portion. Rating is below or beside, not above.
- **Quote-style text uses the editorial serif** (`font-editorial` → {DESIGN.md.Typography.editorial}). Other UI text remains Inter.
- **Attribution is small and subdued.** "Bibi, with Tito — 3 stays" not a long name-and-date block.

### Booking State Indicator

- **State pill is always visible at the top of the booking surface.** Reachable in one tap from the booking list. No hidden state.
- **Color carries the state** (forest = captured/completed, amber = pending/declined, red = disputed, coral = acute). When state changes, the indicator animates with a brief ~200ms color crossfade.
- **State changes notify both parties.** A state change surfaces a banner on the other party's next visit; no push (PWA constraint, FR-44).

### Date-Level Capacity Cell

- **Each cell has a state** (empty, partial, full, peak). The state is the whole content of the cell — no nested numbers or icons.
- **Partial cells show date + partial count on tap** (e.g., "2 of 4 spots for 28 March"). Sheet-style expansion, not full page.
- **Full cells are unselectable.** Strike-through styling communicates this without text.
- **Peak-window cells are visually distinct** (primary-soft background per {DESIGN.md.Components.capacity-cell}). No separate "peak" legend.

### Chat Bubble

- **Owner messages right-aligned, Provider messages left-aligned, Admin messages centered.** Visual grammar maps to conversational turn-taking.
- **Time-stamps appear on tap, not always-on.** Default surface is clean; timestamps surface when the user wants them.
- **Booking-scoped chat keeps the booking state at the chat header.** The state is always one tap away from the conversation.
- **Admin messages carry an `[Admin]` prefix in the bubble.** The Admin is a moderator, not a participant — this is explicit so users know who's seen the message.

### Queue Dashboard Row

- **Rows are dense on desktop.** Smaller padding, tighter columns. Mobile collapse pattern transforms rows to stacked cards.
- **Priority is visual, not just ordinal.** Priority 1 (Acute) row has the coral left-border accent. No sorting required — the priority *is* the order.
- **Aging indicator surfaces on rows > 15m.** Subtle amber `text-warning` on the age column. Avoids a separate "stale" badge.

### Care Configuration Field Group

- **Order is fixed and predictable:** Dates → Pet → Food → Medication → Care Flags → Instructions. This order is repeated across re-bookings so muscle memory helps (UJ-4 climax: second booking under 4 minutes per SM-15).
- **Pet section is read-only summary + edit link.** Reduces input effort for repeat bookings — the second-booking UX is a key flow.
- **Care Flags chips are multi-select.** Anxiety, Senior, Allergies, Diabetic, Post-Surgery, Heat-Sensitive. Each carries a one-tap toggle.
- **Free-text Instructions textarea is always present** with placeholder: "Anything else Rashid should know — favorite toys, anxiety triggers, the blanket Tito sleeps with."

### Provider Card (visual specs in DESIGN.md)

- **Full-card tap target.** Entire `<ProviderCard>` wraps an `<a href="/providers/{slug}">`. The in-card "Book" button calls `e.preventDefault()` and routes to the same URL via `router.push()` to avoid double-event firing.
- **Featured vs standard vs tier-b is a server-side decision**, not user-toggle. Tier ranking comes from the backend's `demonstrated-fit + tier + capacity` formula; v1 uses capability-and-tier baseline, Phase 2 will add demonstrated-Fit ranking (TM Gap).
- **Sort selector offers four modes:** Tier-A first (default) · Closest · Price ascending · Best demonstrated fit. Sort changes re-order in place; no re-fetch unless filters change.
- **Polling:** capacity re-validates every 30s and on window focus. Capacity-just-changed surfaces a small inline badge "Availability updated · Refresh" without forcing a re-render storm.

### Demonstrated Fit Card (visual specs in DESIGN.md)

- **Every FitCard is a proven claim** backed by admin-verified booking history. The backend exposes `Provider.demonstratedFit: Array<{value, label}>`; the frontend renders but never edits these.
- **Featured horizontal scroll** is `overflow-x-auto` with `-mx-4 px-4` to break out of card padding and signal scrollability. Snap-on-scroll optional in production.
- **Aria-label on each FitCard button** describes the proven claim ("12 diabetic small dogs handled successfully") for screen readers.
- **Empty state:** a Provider with zero demonstrated-fit history shows a single sentence: "New to PetCare. Building a track record." No fake data, no placeholder numbers.

### Availability Pill (visual specs in DESIGN.md)

- **Distinct from Booking State Indicator.** Booking State is about a specific booking's lifecycle (`requested` → `authorized` → `captured` → …). Availability is about *whether this Provider can take the requested dates, right now*.
- **Always carries the date span in the copy** ("Available all 9 nights"). Bibi should never have to wonder whether the pill is reflecting her dates or someone else's.
- **Live-poll every 30s.** A provider's availability can change between search and tap-through; the pill reflects the *current* state, not the search-time state.
- **Full state (`Fully booked {date-range}`)** disables the Book button and surfaces the "see other providers" CTA instead.

### Filter Chip + Summary Chip (visual specs in DESIGN.md)

- **Filter Chip toggle is keyboard-operable** (Space + Enter) with `aria-pressed` reflecting toggle state.
- **Re-query on toggle** is debounced 300ms — prevents thrashing the API on rapid multi-select.
- **Summary Chip is a single-edit affordance** — it opens the full filter modal where Bibi can change location, species, dates, or reset all filters in one tap.
- **Sticky positioning:** stays at `top-0` with `bg-background/95 backdrop-blur` so content underneath is visible but de-emphasized during scroll.
- **Save-search button** appears in the page top-bar when filters are non-default; tapping it saves the query to the Owner's saved-searches list (PRD FR-13).

### Sticky Action Bar (visual specs in DESIGN.md)

- **Sticky bottom-0 with backdrop-blur.** Content scrolls underneath; the CTA stays visible without blocking the read.
- **Cancel-as-link variant** is destructive but never primary. Example copy: "Cancel this request" in `text-destructive` underline — opens the cancellation modal, never confirms on tap.
- **Disable primary CTA while inputs are invalid.** When the form above the bar is incomplete, the CTA shifts to `disabled` with explanatory helper copy ("Choose dates to continue").
- **Keyboard accessibility:** Tab order is CTA → secondary link. Focus ring stays visible (DESIGN.md `elevation.ring`).
- **Safe-area padding** for notched devices — the bar respects `env(safe-area-inset-bottom)` so it never sits under the home indicator.
- **Behavioral differences per context** are listed in DESIGN.md `sticky-action-bar.variants`. The behavioral delta across contexts (e.g., booking-config has no secondary; pet-profile has no price; care-history-book-again has multiple alt paths; book-again-submit shows SM-15 elapsed indicator) lives here.
- **SM-15 elapsed-time indicator** (Book-Again Path 2.2) sits inside the sticky-action-bar above the price summary — live timer, color thresholds (Under 4 min = `{success-soft}`, otherwise muted), freezes on submit-success. Logs elapsed time per submit for analytics.

### Toggle — Primary-Soft (visual specs in DESIGN.md)

- **"Use saved" pattern** — when the Care Configuration pre-fills from Care History, each pre-filled axis gets a toggle. Default state: ON (use saved). Owner can flip OFF to edit for this booking; flipped-off axes get an `Edited` chip.
- **aria-checked reflects state, role="switch".** Screen reader announces "Use saved insulin schedule, switch, on."
- **Toggle is independent per axis.** Flipping insulin OFF does not affect diet or anxiety.
- **Edited chip persists across saves** until Owner re-engages the saved value or submits. The chip is a `badge.neutral` with × to revert.
- **Submit-time validation** treats an OFF toggle as "user has reviewed this axis." An ON toggle does not require re-validation — Care History is the authoritative source.

### Payout State Indicator (visual specs in DESIGN.md)

- **Four states, sister to Booking State Indicator:** Released (forest) · Pending (sky) · Frozen (red) · Hold (amber).
- **Frozen state is silent to Provider.** No email, no push — the payout row simply shows "Frozen" with a tooltip explaining the active dispute. The payout-release happens on resolution.
- **Hold state surfaces in 4.8 Payout Reconciliation** as the row's source-of-truth. Admin sees the cycle mismatch; Provider sees a single line in the table.
- **Released state always shows net + commission breakdown** on tap — never just the gross. The transparency is a trust signal.

### Pattern Detection Card (visual specs in DESIGN.md)

- **Surface correlated post-mortems.** When 3+ post-mortems match a category within 90 days, a pattern card surfaces automatically.
- **CTA "Apply to runbook v[N+1]"** opens a form (not inline) — Admin can choose what to fold back, with versioning on the runbook itself.
- **Metric block is always present** — count + median + provider tier mix. The metric is the proof the pattern is real, not anecdotal.
- **Voice stays grounded.** "Hypoglycemia overnight · 3 occurrences in 90 days · all Tier-A providers" — not "you must fix this!" The Admin decides.

### SM-C3 Protection Banner (visual specs in DESIGN.md)

- **Persistent on Review Moderation Queue (4.7).** Cannot be dismissed by closing the page — reappears on each visit. The persistence is the structural answer.
- **Plain language, no jargon.** "Star-rating optimization is NOT a moderation goal." Not "SM-C3 enforces counter-metric."
- **Prevents the failure mode** of removing critical reviews to protect average. Per-review warning on critical (≤3★) reviews cross-references this banner.
- **Appears in review moderation result (5.4)** as a summary so Owners know the policy applies to them too.

### Counter-Metric Header Card (visual specs in DESIGN.md)

- **Three cards at top of Defection Dashboard (5.8).** SM-C1 (Platform-Booking Share) · SM-C2 (Provider Platform-Share) · SM-C5 (Care-Record Completeness).
- **State on each card** carries the urgency: Healthy / Watch / Breached. Color-coded via left-border accent.
- **Tied to trending banner.** When a metric shifts toward "Watch" or "Breached", the trending narrative explains why.
- **Owner of the dashboard read is Ayaat.** She sees the counter-metrics daily; the structural visibility is the SM-C* answer.

### Defection Signal Dot (visual specs in DESIGN.md)

- **Three categories** — Owner-initiated (warning), Provider-initiated (accent), Cross-group (destructive). Aggregate only.
- **Privacy boundary is structural.** No row-level identifier ever renders at dashboard scale. This is enforced at the API layer, not just the UI.
- **Trending banner composition** uses one dot per category in the trending narrative — visual recognition without revealing the underlying signal mix.

### Acute-Event Trigger Banner (visual specs in DESIGN.md)

- **Persistent on Provider in-stay surface (3.5 D7).** Visible the entire stay, not just when the Provider is composing an update. The structural answer to acute-event responsibility.
- **Concerning-helper inline link** in 3.6 Daily Update Composer — a separate warning-soft surface inside the form. The helper is a *link* to the runbook, never a CTA that hijacks the daily-update submit.
- **Confirm modal on 5.7** is `role="alertdialog"` — the action is consequential enough to deserve an alert role. Description validation min 20 chars + severity self-assessment before Confirm enables.
- **No urgency-bait in the banner copy.** "If something is wrong, tap here." — never "URGENT" or exclamation marks. Calm, action-oriented.

### Error State Illustrations (visual specs in DESIGN.md)

- **Six templates:** capacity-exhausted · timeout · payment-fail · dispute-window-expired · network-error · load-shedding.
- **Body names cause and next step.** Never "Oops!" or "Something went wrong." Brief §3 ("Reviews and disputes are independent records") appears verbatim in the dispute-window-expired template.
- **Network-error is offline-tolerant.** Selection is saved locally; auto-retry with exponential backoff (3 attempts, 1s/2s/4s).
- **Load-shedding degrades photos** (Brief §3 perf envelope) — keeps the core flow working on slow 4G.
- **Voice stays calm under failure.** The brand promise is that curated supply is reliable; error states reinforce that by being factual, not panicky.

## State Patterns

PetCare has many states because curating trust requires handling more flows than a typical marketplace. State patterns are defined once and reused.

### Connectivity state (PRD NFR-15)

- **Online, fast:** full surface, animations enabled, real-time chat presence.
- **Online, slow:** background sync queued, no animation, input persistence continues.
- **Offline:** cached surfaces still work (Profile, Care History, Booking state). Booking submit is held locally and submitted on reconnection. Banner across the top: "Offline. Bookings will be sent when you're back online."

### Booking lifecycle states (PRD FR-14)

Nine states — each maps to a visible indicator and a defined surface treatment:

| State | Pill color | Surface behavior |
|---|---|---|
| Requested | info (sky) | Awaiting Provider confirmation. Owner sees; Provider sees in queue. |
| Authorized | info (sky) | Payment authorized, awaiting confirmation. |
| Captured | primary-soft (forest) | Payment captured on Provider confirmation. Default "happening" state. |
| Confirmed-to-Stay | primary (forest) | SLA window passed. |
| In-Stay | primary (forest, solid) | Stay in progress. Daily Updates surface. |
| Completed | success-soft (forest) | Stay finished. Awaiting review window. |
| Declined | warning-soft (amber) | Structured Decline reason visible. Booking voided. |
| Disputed | destructive-soft (red) | Report under investigation. Payout frozen. |
| Refunded | muted (stone) | Refund processed. Booking closed. |

Each state has a transition animation (~200ms color crossfade), an optional explanation banner ("Confirmed-to-Stay passed · payout scheduled"), and a defined next action.

### Care History state (PRD FR-7)

- **Empty state:** Pet Profile exists; Care History is "this is Tito's first stay." No fake content.
- **Populated:** Care History lists prior bookings by date with one-tap detail. Display is dense (list, not cards) — there can be many entries.
- **Persistent across account closure:** Care History is retained 24 months minimum even after the Owner closes their account (FR-10). Disclosure lives in Pet Profile Privacy settings.

### Acute Event state (PRD FR-26 → FR-30)

The Acute Event state is the highest-stakes UX in the system. Behavior:

- **Trigger from Provider:** Single button in Booking view — "Report an Acute Event." Tap opens structured form (event type, severity, immediate action taken, vet contacted?). Submit transitions the Booking to Disputed state (red pill) and routes to the Admin Queue with Priority 1.
- **Vet Directory surfaces immediately** in the Acute Event form (PRD FR-45). Three nearest clinics by neighborhood, with hours and phone. Tap-to-call enabled on mobile.
- **Owner notification is asynchronous but immediate.** Banner on Owner's next visit: "An Acute Event was reported. See what happened." No push notification (PWA constraint).
- **Payout freeze is silent to the Provider.** The Booking state pill changes but no email/notification — Provider sees payout paused in Payouts view.
- **Admin coordination view is the canonical surface** for the event. The Admin has the full timeline: trigger form, Provider notes, Owner notification time, vet clinic reference.

### Vet Directory state (PRD FR-45)

- **Default surface in the Acute Event form.** Pre-loaded with three clinics by neighborhood.
- **Available in Booking Configuration** as a soft reference. Not surfaced by default — accessible via a "vet near you" inline link in the Care Configuration helper text.

### Disputes state (PRD FR-24, FR-25)

- **Trigger from Owner via Report an Issue.** Form captures issue category (taxonomy per FR-25 seed) and narrative. Submit transitions booking to Disputed; payout freezes.
- **Admin investigations are independent** of Reviews (FR-22). Reviews are public; Resolutions are private to the affected parties.
- **Three Resolutions (FR-35):** Resolved-No-Action, Resolved-Refund, Resolved-Provider-Action. Each Resolved maps to a defined state surface in the booking history.

### Queue priority state (PRD FR-32)

Four priorities, ordered. Color and position carry the priority:

- **P1 Acute** (coral) — Booking with active Acute Event. Top of queue.
- **P2 Dispute** (red) — Booking with active Report. High urgency.
- **P3 Awaiting vetting** (amber) — Provider application under review. Bulk item.
- **P4 In-stay** (forest) — Current bookings with daily updates expected. Lowest urgency.

## Interaction Primitives

The system uses a small interaction vocabulary: tap, sheet, inline form, calendar grid, chat. Animations are functional feedback only (DESIGN.md.Notes).

### Tap

- **Primary action target ≥ 44×44px.** Mobile is the design source.
- **Active state shows on tap** with a brief ~80ms color darken. No scale, no shadow.
- **Tap-to-call enabled on phone numbers** in Vet Directory entries and Booking-scoped chat context.

### Sheet (modal-bottom)

- **Used for date pickers, capacity cell detail, photo expand.** Slides up from bottom on mobile; centered modal on desktop.
- **Drag-to-dismiss on mobile** with 100px threshold. Snap to close.
- **Always has a Close button** in addition to the drag handle.

### Inline confirmation

- **Used for destructive actions** (Decline with reason, Report an Issue). Replaces the screen with a confirmation surface, not a modal.
- **Reason chips** for Decline (date conflict, capacity reached, special-care not in scope, other). Selecting a chip prefills the reason field.

### Calendar grid (Date-Level Capacity)

- **Horizontal scroll on mobile** with week-snapping. Vertical stack on desktop with month view.
- **Cells respond to tap with state detail**, not navigation. The calendar is a control, not a page.
- **Highlighted range for selected dates.** Forest-green border + soft background for in-progress selection. Confirmed dates get the primary-soft treatment.

### Chat

- **Booking-scoped, not platform-wide.** FR-44.
- **Autosaves to local storage** on send. State persists if the network drops mid-conversation.
- **Notification of new messages appears at the booking-state header**, not as a separate inbox.

### Form persistence

- **All form input persists to local storage on blur.** PWA reality (NFR-15, NFR-16).
- **Submit only triggers on explicit user action.** "Confirm Stay" button — never auto-submit.

### Pull-to-refresh

- **Standard mobile pattern** for refreshing lists (Bookings, Reviews, Queue).
- **Only enabled on lists**, not on booking details or configuration.

## Accessibility Floor

The system is built to WCAG 2.1 AA. Behavioral accessibility is owned here; contrast floors are validated in DESIGN.md.Colors.

### Keyboard navigation

- **All interactive surfaces reachable via Tab** in logical reading order.
- **Focus ring is always visible** on `:focus-visible`. Focus ring uses {DESIGN.md.Elevation.ring} — never replaced by shadow.
- **Skip-to-content link** at the top of every surface.
- **Modal/sheet focus-trap on open.** Focus returns to the trigger on close.

### Screen reader

- **All inputs have associated `<label>` elements.** Not just placeholders.
- **Buttons announce state.** "Confirm Stay, button, primary" — not silent.
- **Live regions for state changes.** Booking state transitions, Acute Event triggers, and message receipt use `aria-live="polite"`. Acute Event on the Admin side uses `aria-live="assertive"`.
- **Tier-A badge has accessible name** "Tier-A provider, admin-vetted" — not just visual.
- **Verified Review photos have alt text** describing what's in the photo. Reviewer photo, not generic pet stock.

### Touch targets

- **44×44px minimum.** The Owner path (especially the Search Results) holds to this strictly.
- **Adjacent touch targets have ≥ 8px spacing** so users don't tap the wrong one.

### Color and contrast

- **WCAG 2.1 AA contrast floor validated** for every text/background pairing in DESIGN.md.Colors.
- **Color is never the sole carrier of meaning.** Booking state indicators combine color with text label and icon. Verified Reviews combine star rating with numeric score.
- **Tested with color-blindness simulators.** Forest and amber separate cleanly for deuteranopia; coral and red are differentiated by their label states.

### Motion and animation

- **Reduced-motion preference honored** at the system level (`prefers-reduced-motion: reduce`). All transitions collapse to instant.
- **No motion used for state communication** (color + label do that work).
- **Loading states are explicit**, never implied via skeleton timing. ≤300ms transitions are bare-tolerable.

### Language

- **English-first in v1.** Bangla parity (FR-47) is built into the typography stack.
- **Language toggle lives in the persistent footer**, not the auth flow. Single tap.
- **Right-to-left is not in v1** but the typography stack handles it when needed.

### Forms

- **Errors are announced** with `role="alert"` and visible text.
- **Field-level error messages** appear inline, not as toasts.
- **Required fields are clear** — asterisk in label, not placeholder.
- **Form auto-fill is supported** via standard `autocomplete` attributes where applicable.

## Key Flows

Four named flows from the PRD's User Journeys (UJ-1 through UJ-4), with the climax beat named explicitly. Each flow's component grammar is rooted in the patterns above.

### Flow 1 — Bibi's Eid booking (UJ-1, climax: request submitted)

*Bibi, an Owner in Gulshan, is preparing for Eid travel. She needs care for Tito, her diabetic Shih Tzu, for 28 March through 5 April. She's nervous about Tito's insulin schedule and has had bad experiences with sitters who don't follow it.*

**Steps:**

1. **Entrypoint.** Bibi opens PetCare (PWA). The Home surface prompts her for dates, species, and neighborhood. The Order of fields is set: Pet Species, Dates, Neighborhood. Bibi selects 28 March – 5 April, Dog (small), Gulshan.
2. **Search Results.** FR-11 curated shortlist surfaces with Tier-A Providers shown above Tier-B. Each card carries the Tier-A badge, photos, and a one-line specialty line. The default sort surfaces special-care experience — Tito's diabetes is what Bibi is searching for.
3. **Provider Profile.** Bibi opens Rashid (Tier-A). Profile shows his Dog-vetted status, "Special-care experience: senior dogs, diabetic pets, post-surgery." Date-Level Capacity Calendar shows partial availability on her dates. Verified Reviews at the bottom — three of them with photos of dogs in Rashid's Gulshan home.
4. **Booking Configuration.** Bibi taps "Request Booking." Care Configuration is a guided walk: Dates (pre-filled, with the calendar grid highlighting her range), Pet (pre-filled from Care History — Tito's profile appears with an "edit" link), Food & Dietary Notes, Medication (Tito's insulin schedule at 7am and 7pm with the warning "Important for diabetic care"), Care Flags (multi-select chips — Diabetic selected by default), Free-text Instructions ("Tito sleeps with the small blue blanket. Don't run the vacuum after 6pm — he gets anxious.").
5. **Review + submit.** Bibi confirms the booking. Payment authorization triggers (FR-15). Booking State pill: `Requested` (sky).
6. **Provider confirmation.** Rashid gets a push to his Provider queue (in-session, not push). He reviews Tito's Care Configuration, accepts. Booking State pill transitions to `Captured` (forest-soft). Both parties see the change. Payout schedule is visible to Rashid.
7. **Climax beat.** Booking is `Captured` — Tito's Eid stay is confirmed on the platform. Bibi can monitor via Booking-scoped chat, daily updates during the stay, and Verified Review at the end. The first-stay moat-validation moment: Bibi has been heard, Tito's diabetes is documented on-platform, Rashid has the care data, and the booking will compound into Bibi's trust loop.

**Component pattern reference:** Tier-A badge, Date-Level Capacity Cell, Booking State Indicator, Care Configuration Field Group, Verified Review Card.

### Flow 2 — Rashid's Eid capacity (UJ-2, climax: capacity locked)

*Rashid, a Provider in Gulshan, hosts 4 dogs at a time and is preparing for peak Eid season. He needs to manage his calendar — accepting bookings he's comfortable with, declining those that don't fit.*

**Steps:**

1. **Calendar root.** Rashid opens `/provider` — the Date-Level Capacity grid is the homepage. Eid peak window (28 March – 5 April) is primary-soft highlighted (DESIGN.md.Components.capacity-cell peak variant).
2. **Set peak capacity.** Rashid adjusts the capacity for Eid week from 4 to 3 (he's away two nights). Calendar updates with `partial` and `full` cells across the peak window.
3. **Incoming request.** Bibi's booking request arrives in Rashid's queue. The Care Configuration shows Tito's insulin schedule — Rashid has handled diabetic pets before and accepts.
4. **Daily rhythm.** The Calendar surfaces partial-availability days with one-tap detail (e.g., "2 of 3 spots for 28 March"). Rashid manages incoming requests through the day.
5. **Structured Decline.** A different request arrives for a dog Rashid isn't comfortable with. Rashid taps Decline; an inline confirmation surface appears with reason chips ("date conflict", "capacity reached", "special-care not in scope", "other"). Rashid selects "special-care not in scope" with a short note. Booking transitions to `Declined` (amber). The decline reason is visible to the Owner.
6. **Pre-stay preparation.** Daily updates composer surfaces three days before each booking. Rashid posts photos and notes — this is the verified-review material for Bibi after.
7. **Climax beat.** Capacity locked in. Rashid's Eid calendar is filled with bookings he can actually handle, all with documented special-care needs. He's earned the Tier-A status by handling what v1 search ranking can't yet surface — *demonstrated* care fit.

**Component pattern reference:** Date-Level Capacity Cell, Tier-A Provider Badge, Queue Dashboard Row, Chat Bubble, Care Configuration Field Group (read-only).

### Flow 3 — Admin at the operating ceiling (UJ-3, climax: queue triaged)

*The solo Admin is running PetCare from a desk, hitting the operating ceiling (1 / 25 Providers / 75 bookings/month). Eid morning brings an Acute Event and a vetting queue together.*

**Steps:**

1. **Queue root.** Admin opens `/admin` — Queue Dashboard. The rows are priority-ordered: P1 Acute (coral left-border), P2 Dispute (red), P3 Awaiting vetting (amber), P4 In-stay (forest). Aging indicators surface on rows > 15 minutes.
2. **Acute Event hits.** A new queue item arrives at P1: Rashid reported a sudden illness for a senior dog on stay. Booking transitions to `Disputed` (red pill on all three surfaces). Admin taps the row.
3. **Acute Event detail.** The detail view surfaces Rashid's structured trigger form (event type, severity, immediate action, vet contacted), the Booking's Care Configuration (read-only), and the Vet Directory (three nearest clinics with phone numbers).
4. **Owner notification.** Admin taps "Notify Owner." A pre-formatted notification (English + Bangla in v2) goes to Bibi — appears as a banner on her next visit. No native push (PWA constraint).
5. **Payout freeze.** The Booking's payout is frozen silently — Rashid sees a paused-payout note in his Payouts view, but no email/notification.
6. **Vetting queue.** Admin returns to the Queue, triages three vetting items in the P3 stack. Each is a Provider application under review with profile + photos + neighborhood. Admin spends ≤ 60 seconds per vetting item — quick yes/no, with notes.
7. **Climax beat.** Queue triaged. Acute Event under coordination, Owner notified, Payout frozen for review, vetting queue processed. The 1-admin operating ceiling is hit but not breached — solo Admin can run Eid-week load with the right IA and priority structure.

**Component pattern reference:** Queue Dashboard Row, Booking State Indicator, Vet Directory Entry, Chat Bubble (Admin variant).

### Flow 4 — Second-time Owner (UJ-4, climax: request submitted in < 4 min)

*A second-time Owner returns to PetCare for another booking. UJ-4 is the moat-validating moment: did the first stay produce a repeat?*

**Steps:**

1. **Home with care memory.** Owner opens PetCare. The Home surface recognizes them — pets pre-listed, recent bookings shown, last Provider offered ("Book Rashid for Tito again?").
2. **One-tap repetition.** Owner confirms the same Provider. Booking Configuration opens with Pet pre-filled from Care History, food/medication/flags pre-filled from the prior stay's Care Configuration. Two fields change: dates (new dates for this stay) and free-text instructions (small variation).
3. **Adjust.** Owner edits the dates, updates the free-text ("Tito's settling in better this time. Same schedule works."), confirms.
4. **Submit.** Booking State pill: `Requested` → `Captured` (matches Flow 1 transitions).
5. **Climax beat.** Second booking under 4 minutes per SM-15. The moat validates: the Care History persistence, the on-platform repeat surface (FR-48), and the Care Configuration pre-fill (FR-8) reduce the second-booking friction to almost nothing. The Owner does not need to leave PetCare — repeat value is on-platform.

**Component pattern reference:** Care Configuration Field Group (pre-fill variant), Booking State Indicator, Tier-A Provider Badge, Verified Review Card (read-only after first stay).

## Key Success Metrics — Thresholds

| Metric | Target | Where it lives |
|---|---|---|
| SM-15 · Second-Booking Time | **< 4 min** from Book-Again tap to Submit | Book Again Path (2.2) · elapsed-time pill in sticky action bar |
| SM-19 · Post-mortem Closure | **< 48 hr** from Acute Event close to Post-mortem entry | Acute Event Runbook (4.2) · Step 7 routes to Post-mortem Practice Log (4.9) |
| SM-20 · Runbook First Entry | **< 5 min** from trigger to first Admin timeline entry | Acute Event Runbook (4.2) · live elapsed timer in alert banner |
| SM-C1 · Platform-Booking Share | **counter-metric · no-go direction** | Defection Detection Dashboard (5.8) |
| SM-C2 · Provider Platform-Share | **counter-metric · no-go direction** | Defection Detection Dashboard (5.8) |
| SM-C3 · Star-Rating Optimization | **counter-metric · MUST NOT** | Review Moderation Queue (4.7) · SM-C3 protection banner |
| SM-C5 · Care-Record Completeness | **counter-metric · no-go direction** | Defection Detection Dashboard (5.8) |
| R-10 · Acute-Event Runbook | **launch-blocking · both surfaces shipped** | 4.2 (Admin) + 5.7 (Provider) |

## Source References

- `source_prd:` — `/home/bs00856/Documents/Projects/PetCare/_bmad-output/planning-artifacts/prds/prd-PetCare-2026-08-29/prd.md` (52 FRs, 4 UJs, 26 NFRs, 20 SMs + 5 counter-metrics)
- All `FR-*` references in this document map to the corresponding feature requirements in §4 of the source PRD.
- All `UJ-*` references map to the named-protagonist journeys in §2.
- All `NFR-*` references map to the cross-cutting non-functional requirements in §8.
