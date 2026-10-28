# PetCare UI analysis: design system, mockups, prototype, demo

Scope: `docs/ux/DESIGN.md` (rev 3), `docs/ux/EXPERIENCE.md` (rev 3), `docs/ux/mockups/*` (index + 19 HTML + 1 component spec), `docs/ux/prototype/index.html`, `docs/ux/demo/index.html`. Per-page scenario specs are covered elsewhere. Nothing in `docs/` was modified. Items marked "(inferred)" are my reading, not stated in the sources. Precedence stated by the sources: "Spines win on conflict with any mock or import" (DESIGN.md and EXPERIENCE.md headers); the PRD wins over EXPERIENCE (requirements.md section 9, C-1).

Abbreviations: DS = DESIGN.md, EX = EXPERIENCE.md, O/P/A = Owner / Provider / Admin root.

---

## A. COMPONENT INVENTORY

DS lists 28 component sections (mockup index says "28 component sections"). Tokens use shadcn-style names (`bg-primary`, `bg-muted` ...). Sizes: DS Button sm/md/lg = h-8/h-10/h-12.

| # | Component | Purpose | Variants | States | Key tokens | Behavior (EX) | Roots |
|---|---|---|---|---|---|---|---|
| 1 | **Button** | All actions | primary, secondary, outline, ghost, destructive, link; sizes sm `h-8 px-3 text-sm`, md `h-10 px-4 text-base`, lg `h-12 px-6 text-lg` | hover (primary/90, muted/80), disabled (rare), loading | radius md (8px); primary = forest-700 on cream-50; focus ring forest 3px/.18 | Disabled must have a reason in button or helper text. Loading keeps size, label becomes spinner or "Booking...". Destructive confirm is inline, not modal. Exactly one primary button per view (enforced). Verb-first, two-word labels. | O P A |
| 2 | **Card** | Primary surface | flat, elevated (`shadow-lg`), muted (`bg-muted border-transparent`) | static vs interactive (nav card) | `bg-card` white, border cream-200, radius lg 12px, padding p-6 (p-8 desktop), shadow md | Interactive only when whole surface is a nav target, tap target >=44px. Static cards have no hover shadow. Stack `space-y-4`, interior `space-y-6`. No masonry/carousel. | O P A |
| 3 | **Input** | Form fields (care config) | text, number, date, select, textarea (`min-h-24 p-4 leading-relaxed`) | focus (`ring-2 ring-ring ring-offset-2`), error | `bg-input`, h-12 px-4 text-base, radius md | Always labelled; asterisk in label not placeholder; helper and error at same position below input (no toast); `role="alert"` on errors; persists to local storage on blur; no auto-submit. | O P (A inferred) |
| 4 | **Badge** | Trust/status markers | tier-a, verified, acute, warning, info, neutral, decline | none | pill, `px-3 py-1 text-xs font-medium tracking-wide`; verified = solid forest; acute = solid coral; decline = amber soft | "decline" badge shows structured decline reason. Colour never sole carrier of meaning (label + icon). | O P A |
| 5 | **Filter Chip** | Toggle filter | selected / unselected | selected (leading check), hover = inner shift only, no scale | `h-8 px-3 rounded-full text-xs`; selected `bg-primary-soft text-primary-soft-foreground border-primary/20`; unselected `bg-muted` | `role=button` + `aria-pressed`; Space/Enter; re-query debounced 300ms; horizontal scroll strip with `-mx-N px-N`. | O |
| 6 | **Summary Chip** | Single-edit affordance for active query | one | tap opens filter modal | `h-11 px-4 rounded-full bg-muted text-sm`, trailing caret | Copy pattern `{location} . {species} . {date-range} . {N} nights`. Sticky `top-0 bg-background/95 backdrop-blur`. Save-search button in top bar appears when filters non-default (FR-13). | O |
| 7 | **Tier-A Provider Badge** | Curated-anchor trust signal | one (content "Tier-A . Admin-vetted") | static; tap shows one-sentence explanation (no modal) | `border-2 border-primary bg-primary-soft rounded-full px-3 py-1 text-xs font-semibold`; leading 6px forest dot (component spec) | Never below the fold. Accessible name "Tier-A provider, admin-vetted". Tooltip copy "5+ vetted bookings with documented special-care experience" (EX). | O P (own profile) A |
| 8 | **Tier-B Provider Marker** | De-emphasised tier | one ("TIER-B") | n/a | `bg-muted text-muted-foreground border px-2 py-0.5 text-[10px]`; card `opacity-90`, photo replaced by icon placeholder | Never hidden, never "Tier-A minus colour". Single soft sentence, no numbers. | O A |
| 9 | **Provider Card** | Day-0 trust surface in shortlist | featured (4:3 hero + horizontal FitCards), standard (4:3 hero + inline fit paragraph), tier-b (no hero) | loading skeleton (4 cards), updating ("Updating..."), cached banner, empty | `bg-card rounded-xl border overflow-hidden shadow-md-soft`; Tier badge top-right overlay | Whole card is `<a>`; in-card Book button `preventDefault` + `router.push`. Variant is server-side decision. 4 sort modes (Tier-A first default, Closest, Price asc, Best demonstrated fit). Polling 30s + window focus; "Availability updated . Refresh" inline badge. | O |
| 10 | **Demonstrated Fit Card** | THE differentiator (FR-21/SM-11) | card (140px strip item) / inline (paragraph) | empty = "New to PetCare. Building a track record." | card `w-[140px] p-3 rounded-lg bg-muted`; value `tabular text-xl font-editorial font-semibold text-primary`; label `text-[11px]` | Every number admin-verified; backend `Provider.demonstratedFit[{value,label}]`; frontend never edits. `aria-label` per card. No fake data. | O (P read-only inferred) |
| 11 | **Verified Review Card** | Day-1 trust differentiator | single layout | n/a | photo `rounded-md aspect-[4/3]`; rating `tabular-nums text-base font-semibold text-primary`; text `font-editorial text-lg leading-relaxed` | Photo first, rating below/beside; attribution small ("Bibi, with Tito - 3 stays"); alt text describes photo. | O P A |
| 12 | **Booking State Indicator** | Booking lifecycle pill | requested, authorized, captured, in-stay, completed, declined, disputed, refunded (+ "confirmed-to-stay" in EX only) | ~200ms colour crossfade on change | see Section D | Always visible at top of booking surface; appears on `/booking/:id`, `/provider/booking/:id`, `/admin/queue/:id`; state changes surface as banner on other party's next visit (no push). `aria-live="polite"`. | O P A |
| 13 | **Payout State Indicator** | Provider payouts (3.10/5.6) | released, pending, frozen, hold | n/a | tabular-nums always | Frozen is silent to Provider (tooltip only, no email). Hold shown in 4.8. Released shows net + commission on tap. | P A |
| 14 | **Availability Pill** | Can this Provider take requested dates | available, partial, full | live poll 30s | `rounded-full px-2.5 py-1 text-xs`, 6px leading dot; full = `line-through text-muted-foreground/50` | Copy "Available all {N} nights" / "Available {N} of {M} nights" / "Fully booked {date-range}". Full disables Book and offers "see other providers". | O (P calendar cell) |
| 15 | **Date-Level Capacity Cell** | Calendar cell (FR-12) | empty, partial, full, peak | tap shows sheet detail; full unselectable | empty `bg-muted/50`; partial info-soft; full muted + line-through; peak primary-soft `border-primary/30` | Cell state is whole content (no nested icons). Partial tap -> sheet ("2 of 4 spots for 28 March"). No peak legend (but mockup 07 has a legend, see H). | O (profile) P |
| 16 | **Vet-Clinic Directory Entry** | Compact clinic row | one (PRIMARY / alternative in 3.5 mockup) | tap-to-call | `p-3 border rounded-md bg-card`; name semibold; action `text-primary` | Pre-loaded 3 nearest clinics by neighbourhood in acute form; soft reference in booking config ("vet near you" link). | O P A |
| 17 | **Chat Bubble** | Booking-scoped chat (FR-44) | owner (right, primary), provider (left, muted), admin (centred, accent-soft) | timestamps on tap | `rounded-lg`, `max-w-[80%]`, admin `max-w-[85%] text-sm` | Autosave to local storage on send; new-message indicator on booking-state header; Admin bubbles carry `[Admin]` prefix. | O P A |
| 18 | **Sticky Action Bar** | Commit-point CTA + price | 6 variants: booking-config, booking-submit, provider-profile, pet-profile-edit, care-history-book-again, book-again-submit | disabled while invalid | `sticky bottom-0 z-10 bg-background/95 backdrop-blur border-t px-5 py-4` | Disabled CTA shows helper ("Choose dates to continue"); cancel-as-link is destructive but never primary; `env(safe-area-inset-bottom)`; Tab order CTA then link; SM-15 elapsed timer sits above price in book-again-submit (under 4 min = success-soft, else muted, freezes on submit, logs elapsed). | O (P edit profile inferred) |
| 19 | **Toggle (primary-soft)** | "Use saved" switch | primary-soft only | on / off / Edited chip | track 36x20, knob 16px, on `bg-primary-soft border-primary/30` knob `bg-primary`, 150ms | `role="switch"` `aria-checked`; default ON; independent per axis; OFF = "reviewed" at submit; "Edited" chip is `badge.neutral` with x to revert. Also notification toggles (5.10). | O P (settings) |
| 20 | **Queue Dashboard Row** | Admin queue (FR-32) | P1..P4 | aging >15m amber text; hover `bg-muted/50` | `grid-cols-[2rem_1fr_8rem_6rem_6rem] gap-4 px-4 py-3` | Dense on desktop; mobile collapses to stacked cards; P1 has coral left border; priority is order. | A |
| 21 | **Pattern Detection Card** | 4.9 pattern -> runbook v[N+1] | one | n/a | card.muted, metric `tabular-nums text-base font-semibold text-primary` | Surfaces automatically when 3+ post-mortems match a category within 90 days; CTA opens a form (not inline); metric block always present; grounded voice. | A |
| 22 | **SM-C3 Protection Banner** | Counter-metric policy statement | one | persistent, "cannot be dismissed by closing the page" (DS says "persistent until dismissed") | `border-l-4 border-warning bg-warning-soft px-4 py-3` | On 4.7 top; summary on 5.4 (Owner). Plain language, no "SM-C3 jargon" in copy. | A (O summary) |
| 23 | **Counter-Metric Header Card** | SM-C1/C2/C5 at dashboard top | healthy, warning (Watch), breached | n/a | `grid grid-cols-3 gap-4`; value `tabular-nums text-2xl font-editorial` | Left-border colour + status pill ("Healthy / Watch / Breached" with check, warning, red-dot glyphs). | A |
| 24 | **Defection Signal Dot** | Aggregate signal category | owner (warning), provider (accent), cross (destructive) | n/a | `w-2 h-2 rounded-full` | Aggregate only; privacy enforced at API layer. | A |
| 25 | **Acute-Event Trigger Banner** | Provider-side R-10 entry | banner; helper (inline link) | persistent all stay | `border-l-4 border-destructive bg-destructive-soft`; CTA destructive sm | Calm copy ("If something is wrong, tap here."); never "URGENT"/"!"; helper is link, daily update posts regardless; confirm modal on 5.7 is `role="alertdialog"`, description min 20 chars + severity before Confirm enables. | P |
| 26 | **Care Configuration Field Group** | Guided intake | section header + helper + fields | read-only variant (Provider), pre-fill variant | header `text-lg font-semibold`, helper `text-sm`, fields `space-y-4`, dividers `my-8` | Fixed order Dates, Pet, Food, Medication, Care Flags, Instructions; Pet is read-only summary + edit; flag chips Anxiety/Senior/Allergies/Diabetic/Post-Surgery/Heat-Sensitive; textarea always present. | O P (read-only) A (read-only) |
| 27 | **Error State Illustrations** | 6 templates | capacity-exhausted, timeout, payment-fail, dispute-window-expired, network-error, load-shedding | n/a | CSS-only geometric art; title `font-editorial text-lg`; body `text-sm` | Cause + next step; no "Oops", no "sorry", no exclamation; network-error saves locally, auto-retry 3 attempts at 1s/2s/4s; load-shedding turns photos off. Full copy in DS. | O P (A inferred) |
| 28 | **Chip variants not given own section** | Care Flag chips, decline reason chips, "Edited" chip | multi-select chips | selected/unselected | reuse Filter Chip | Decline chips in EX only (see H). | O P |

Components shown in mockups but NOT defined in DS (gaps; inferred): bottom sheet / date detail sheet (EX Interaction Primitives only), top bar with status bar chrome, step indicator "1 Dates / 2 Pet / 3 Care / 4 Review" (mockup 04), stat tiles on admin queue and provider calendar (06, 07), segmented control (Illness/Injury..., Mild/Moderate/Severe), runbook step list + elapsed timer (42), moderation action row with acknowledgement checkbox (47), "Care log" given/skipped/partial radios (36), photo uploader tiles, skeleton cards (spec 13 only), offline banner, language toggle (mockup 01 top bar), "MOAT SEED / MOAT PROOF / LAUNCH-BLOCKING" mockup-annotation ribbons (documentation chrome, not product UI; inferred).

---

## B. DESIGN TOKENS

All colors in DS are `hsl(h s% l%)`. DS says colors are CSS variables "bound" for Tailwind but does not list variable names; shadcn-style names below are (inferred). The prototype's `tailwind.config` (reference only) nests soft tones as `primary.soft`, `primary.soft-foreground`, etc.

### B1. Colors

| Token (Tailwind) | CSS var (inferred) | HSL | Name in DS | Use |
|---|---|---|---|---|
| background | `--background` | 38 35% 97% | cream-50 | page background |
| foreground | `--foreground` | 30 12% 14% | charcoal-900 | primary text (never pure black) |
| muted | `--muted` | 36 18% 92% | cream-100 | secondary surfaces |
| muted-foreground | `--muted-foreground` | 30 8% 38% | stone-600 | secondary text |
| card | `--card` | 0 0% 100% | white | card surface |
| card-foreground | `--card-foreground` | 30 12% 14% | charcoal-900 | card text |
| border | `--border` | 34 14% 86% | cream-200 | borders |
| input | `--input` | 34 14% 90% | cream-200 | input bg |
| ring | `--ring` | 150 32% 32% | forest-700 | focus ring |
| primary | `--primary` | 150 32% 32% | forest-700 | primary action, trust |
| primary-foreground | `--primary-foreground` | 38 35% 97% | cream-50 | on primary |
| primary-soft | `--primary-soft` | 150 22% 92% | forest-100 | tinted bg |
| primary-soft-foreground | `--primary-soft-foreground` | 150 38% 22% | forest-900 | text on soft |
| accent | `--accent` | 14 64% 56% | coral-500 | care-status / acute |
| accent-foreground | `--accent-foreground` | 38 35% 97% | cream-50 | on accent |
| accent-soft | `--accent-soft` | 14 70% 94% | coral-100 | tinted bg |
| accent-soft-foreground | `--accent-soft-foreground` | 14 64% 32% | coral-700 | text on soft |
| success / success-soft | `--success`, `--success-soft` | 150 32% 32% / 150 22% 92% | = primary / primary-soft | success |
| warning / warning-soft | `--warning`, `--warning-soft` | 36 78% 46% / 36 78% 94% | amber-600 / amber-100 | warning, decline, low utilisation |
| destructive / destructive-soft | `--destructive`, `--destructive-soft` | 0 62% 48% / 0 62% 94% | red-600 / red-100 | destructive, dispute |
| info / info-soft | `--info`, `--info-soft` | 212 56% 48% / 212 56% 94% | sky-600 / sky-100 | informational |

Missing tokens that DS components reference: `destructive-foreground` (Button destructive), `warning-foreground`, `info-foreground` (inferred: need defining, probably cream-50 for destructive). Elevation ring color: `hsl(150 32% 32% / 0.18)`.

### B2. Typography

| Token | Value |
|---|---|
| UI family (`font-sans`) | `Inter, 'Noto Sans Bengali', system-ui, sans-serif`; weights 400/500/600/700 |
| Editorial family (`font-editorial`) | `'Source Serif 4', 'Noto Serif Bengali', Georgia, serif`; weights 400/600 |
| Bangla handling | Noto Sans/Serif Bengali as fallbacks in the same stacks; "no Bangla-specific design tokens in v1"; DS claims "same metrics as Inter" (inferred as an approximation, Bengali glyphs are taller; line-height `relaxed` 1.65 may be needed, not specified) |
| Editorial use | Hero h1, marketing section headers, Verified Review quotes, FitCard numerals, counter-metric values, error titles. NOT general product UI. |
| tabular-nums | All numbers in lists/tables (ratings, prices, counts, ages, timers, payouts, metrics) |

| Scale | rem | px | Notes |
|---|---|---|---|
| xs | 0.75 | 12 | captions, badges, dense cells (mockups also use `text-[10px]`, `text-[11px]` off-scale) |
| sm | 0.875 | 14 | helper text |
| base | 1 | 16 | body floor on mobile |
| lg | 1.125 | 18 | |
| xl | 1.25 | 20 | |
| 2xl | 1.5 | 24 | |
| 3xl | 1.875 | 30 | |
| 4xl | 2.25 | 36 | |
| 5xl | 3 | 48 | hero h1 desktop |
| 6xl | 3.75 | 60 | hero h1 generous |

Line-height: tight 1.2, snug 1.35, normal 1.5, relaxed 1.65. Letter-spacing: tight -0.015em, normal 0, wide 0.04em (badges, small caps).

### B3. Spacing, layout, radius, elevation, borders

| Group | Tokens |
|---|---|
| Spacing (Tailwind defaults) | 0, px, 0.5=2px, 1=4, 1.5=6, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64, 20=80, 24=96 |
| Container | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| Breakpoints | sm 640, md 768, lg 1024, xl 1280, 2xl 1536 |
| Design widths | Owner/Provider 390x844 first; Admin desktop-first >=1280x800 (PRD says admin on low-end phone too; C-6) |
| Radius | sm 4, md 8 (buttons, inputs, photos), lg 12 (cards), xl 16 (provider card, modals), 2xl 24 (hero), full (pills, avatars, Tier-A) |
| Border width | default 1px, strong 2px (Tier-A badge ring, special-care flag emphasis) |
| Elevation | `sm: 0 1px 2px rgba(30,22,12,.04)`; `md: 0 2px 4px -1px rgba(30,22,12,.06), 0 1px 2px rgba(30,22,12,.04)` (card default); `lg: 0 8px 16px -4px rgba(30,22,12,.08), 0 4px 8px -2px rgba(30,22,12,.04)` (popover/dropdown); `xl: 0 16px 32px -8px rgba(30,22,12,.12), 0 8px 16px -4px rgba(30,22,12,.06)` (modal/drawer/sheet); `ring: 0 0 0 3px hsl(150 32% 32% / .18)`. Tailwind keys used by mockups/prototype: `shadow-sm-soft`, `md-soft`, `lg-soft`, `xl-soft`, `ring`. |
| Motion | Functional only: hover/focus/state; 200ms colour crossfade on booking state; 80ms active darken on tap; 150ms toggle; `prefers-reduced-motion` collapses all to instant; no decorative animation; sheets drag-to-dismiss at 100px |
| Touch | >=44x44px targets, >=8px between targets (spec 13 checklist says CTAs >=48px, "verify") |

### B4. Do's and Don'ts (condensed, DS section "Do's and Don'ts")

Forest green vs coral discipline:
- Forest green = primary actions, trust signals (Tier-A badge, Verified Review), captured-booking indicator, focus ring, success. NOT headings, dividers, "lifestyle" decoration. If something is green it must be a meaningful state. Solid forest is reserved for primary CTAs; "use saved" toggles use primary-soft.
- Coral = acute-event and care-status only (Acute badge, acute queue P1, Acute Event surface, provider-initiated defection dot, admin chat bubble tint). Not scattered. Note: DS also uses coral for admin chat bubble (accent-soft) and defection "provider" dot, which stretches "acute/care-status only" (see H).
- No fourth state colour (only forest, amber, red, sky); no pink/purple/teal.
- Cream `bg-background` for pages, white only for cards. No pure black, no pure white page.
- No gradients (DS), no cartoon/paw-print motifs, error art is CSS geometric.
- Shadows never a substitute for colour contrast; never replace focus ring with shadow.
- tabular-nums on all dense numbers; no uppercase body copy.
- No animation beyond functional feedback.
- Do: serif for hero + review quotes; photos 4:3 / 16:9 with room; Care Config fields stacked with generous spacing; Tier-A + Verified indicators above the fold; Sticky Action Bar at every commit point; counter-metrics at the top of the defection dashboard; SM-C3 banner persistent; defection data aggregate-only.
- Don't: panic-CTA the acute trigger; optimise moderation for star ratings; surface individual defection signals.
- Accessibility floor: WCAG 2.1 AA (4.5:1 body, 3:1 large/UI). Inferred risk: amber-600 text on white/amber-100 and `text-muted-foreground/50` on muted (full pills, full cells) are very likely below 4.5:1 and need verification before build.

### B5. Tailwind config skeleton (derived, for developers)

```
colors: background/foreground/muted(+foreground)/card(+foreground)/border/input/ring
        primary{DEFAULT,foreground,soft,soft-foreground}
        accent{DEFAULT,foreground,soft,soft-foreground}
        info{DEFAULT,soft} warning{DEFAULT,soft} destructive{DEFAULT,soft,foreground*} success{DEFAULT,soft}
fontFamily: sans, editorial (see B2)
boxShadow: sm-soft, md-soft, lg-soft, xl-soft, ring
borderRadius: sm .25rem, md .5rem, lg .75rem, xl 1rem, 2xl 1.5rem
utilities: .tabular { font-variant-numeric: tabular-nums }
```
(* destructive-foreground not defined in DS.)

---

## C. INFORMATION ARCHITECTURE AND ROUTES

Three roots, one per role (EX Information Architecture). Admin is a separate desktop-first surface; PRD FR-31 says admin has separate authentication, English only.

### C1. Routes as stated in EX

| Root | Route | Surface | FR refs |
|---|---|---|---|
| Owner `/` | `/` | Home / search entrypoint (date, species, neighbourhood; returning owners see saved pets + recent bookings) | |
| | `/search` | Search results (curated shortlist, Tier-A above Tier-B, capacity filter) | FR-11 |
| | `/provider/:id` | Provider profile | |
| | `/booking/new` | Booking configuration (Step 1 dates+pet, Step 2 care config, Step 3 review+submit) | FR-15 |
| | `/booking/:id` | Booking confirmation + state + booking chat | FR-14, FR-44 |
| | `/booking/:id/daily-update` | Owner view of daily updates | FR-43 |
| | `/bookings` | Bookings list | |
| | `/pets`, `/pets/:id` | Pets list; pet profile + care history | FR-6, 7, 9 |
| | `/reviews/new/:bookingId` | Submit verified review | FR-20, 21 |
| Provider `/provider` | `/provider` | Calendar / capacity dashboard, pending-requests badge | FR-12 |
| | `/provider/booking/:id` | Booking detail, accept / decline with structured reason | FR-9, 17 |
| | `/provider/booking/:id/daily` | Daily update composer | FR-43 |
| | `/provider/reviews` | Review feed (Tier-A only; Tier-B sees own reviews without ranking signal) | |
| | `/provider/profile` | Profile editor | FR-5 |
| Admin `/admin` | `/admin` | Queue dashboard | FR-32 |
| | `/admin/queue/:id` | Queue item detail (acute, dispute, intake/vetting) | FR-33/34/35 |
| | `/admin/providers` | Provider list + Tier Utilization 30/60/90 | FR-36 |
| | `/admin/audit` | Audit log | FR-37 |

Cross-root: Provider Profile reachable from `/search`, chat history, admin investigation. Booking State Indicator is the same component on `/booking/:id`, `/provider/booking/:id`, `/admin/queue/:id`.

### C2. Conflicts and gaps vs page specs / other sources

| Issue | Detail |
|---|---|
| Route collision | Owner `/provider/:id` (public profile) sits under the Provider root prefix `/provider`; `/provider/booking`, `/provider/reviews`, `/provider/profile` are literal segments, so `:id` vs those literals needs ordering rules, and a provider whose id is "booking"/"reviews"/"profile" would collide. Also a role-guard problem: `/provider/*` is Provider-only but `/provider/:id` is Owner (and Admin) readable. Recommend a distinct public prefix (e.g. `/providers/:slug`), which is exactly what spec 13 uses (see next row). |
| Spec 13 route | `13-curated-shortlist.component.md` section 10 uses `/providers/{slug}` (plural, slug) while EX uses `/provider/:id` (singular, id). |
| Missing routes (no EX route for page-spec surfaces) | Sign-in 1.2 (and admin separate sign-in, FR-31); pet create/edit (1.5; only `/pets/:id`); book-again 2.2; care-history view 2.1 (only implied by `/pets/:id`); booking chat page; issue report 5.3; booking completion/review 5.2 (only `/reviews/new/:bookingId`); notifications inbox/centre 5.5/5.9; settings 5.10; provider payouts 3.10/5.6; provider care-record history 3.9; booking completion 3.7; incoming request 3.3 / confirmation decision 3.4 (partly `/provider/booking/:id`); acute-event trigger 5.7; admin: provider application review 4.3, provider health 4.4, operating ceiling 4.5, dispute investigation 4.6, review moderation 4.7, payout reconciliation 4.8, post-mortem log 4.9, defection dashboard 4.10/5.8; legal/marketing landing 1.1. |
| Mockup-implied routes | Mockup 01 shows "Welcome back, Bibi" home (so `/` is a returning-owner home, while page 1.1 is "landing-marketing-home" for visitors; inferred that `/` must serve both states). |
| Prototype routes | Hash routes `#/owner/*`, `#/provider/*`, `#/admin/*` (listed in F). They are demo-only, do not follow EX, and must not be adopted. |
| Admin responsive | EX: Admin desktop-first >=1280; PRD/requirements C-6: admin on low-end phone, build responsive. |
| Language | EX: language toggle in persistent footer; mockup 01 places "EN . বাংলা" in the top bar (inferred header position). Admin is English only (FR-31). |

### C3. Shared page chrome (inferred from mockups)
Owner/Provider mockups: 390px frame, fake status bar (9:41, 4G), top bar with back arrow + title, sticky bottom bar. Admin mockups: left/top nav with Queue / Providers / Audit log / Reports; mockup 06 header "Eid week . Day 3 . Operating at 87% of ceiling".

---

## D. STATE MODELS

### D1. Booking lifecycle (EX State Patterns + DS booking-state; PRD FR-14)

EX says nine states; DS defines eight tokens (no Confirmed-to-Stay). PRD FR-14 also lists `canceled`, `no-show`, `resolved` (requirements.md C-7, C-8: unresolved).

| State | Label (as written) | Pill classes (DS) | Surface meaning (EX) |
|---|---|---|---|
| requested | Requested | `bg-info-soft text-info border-info/30` (sky) | Awaiting Provider confirmation |
| authorized | Authorized | same as requested | Payment authorised, awaiting confirmation |
| captured | Captured | `bg-primary-soft text-primary-soft-foreground border-primary/20` (forest soft) | Payment captured on Provider confirmation; default "happening" state |
| confirmed-to-stay | Confirmed-to-Stay | EX: "primary (forest)"; **no DS token** | "SLA window passed" |
| in-stay | In-Stay | `bg-primary text-primary-foreground` (solid forest) | Stay in progress; daily updates |
| completed | Completed | `bg-success-soft text-success border-success/30` | Stay finished, review window |
| declined | Declined | `bg-warning-soft text-warning border-warning/30` (amber) | Structured decline reason visible, booking voided |
| disputed | Disputed | `bg-destructive-soft text-destructive border-destructive/30` (red) | Report under investigation, payout frozen |
| refunded | Refunded | `bg-muted text-muted-foreground border-border` | Refund processed, booking closed |

Transitions defined in the sources (none given as a formal table):
- Owner submit + payment authorisation: `Requested` (EX Flow 1 step 5; spec/mockup 17: "hold, not capture"). DS/EX list `authorized` separately; Flow 1 goes Requested -> Captured and Flow 4 goes Requested -> Captured, skipping Authorized (EX conflict).
- Provider accepts: -> `Captured` (EX Flow 1 step 6; mockup 05 pill "Captured . Confirmed").
- Provider declines with structured reason: -> `Declined` (Flow 2 step 5), hold released (mockup 17: hold released automatically if declined or no response in 24 hours).
- SLA window passes: `Captured` -> `Confirmed-to-Stay` (EX table only; trigger unspecified).
- Stay starts: -> `In-Stay` (implied); stay ends: -> `Completed` (implied).
- Acute event reported by Provider: -> `Disputed` (EX Acute Event state, Flow 3 step 2; mockups 08/57: "Booking transitions to Disputed"); payout pauses.
- Owner "Report an Issue": -> `Disputed`, payout freezes (EX Disputes state).
- Resolution outcomes: Resolved-No-Action, Resolved-Refund, Resolved-Provider-Action (FR-35); refund -> `Refunded` (implied). Return paths from Disputed are not specified.
- Dispute window 7 days after stay (error template "The 7-day report window has closed"; prototype review screen repeats it).
- Pill colour crossfade ~200ms; announced via `aria-live="polite"`.

### D2. Payout states (DS payout-state; EX)

| State | Pill | Meaning | Source transitions |
|---|---|---|---|
| released | success-soft | released to MFS (bKash/Nagad/Rocket); default | on resolution of freeze/hold (EX) |
| pending | info-soft | period closed, awaiting MFS settlement reconciliation | |
| frozen | destructive-soft | active dispute/acute event; silent to Provider (no email) | entered on Disputed (4.6 chains here) |
| hold | warning-soft | period-level hold, cycle mismatch awaiting reconciliation (4.8); "resolves to pending or frozen" | |

### D3. Connectivity (EX, NFR-15)
- Online fast: full surface, animations, chat presence.
- Online slow: background sync queued, no animation, input persistence continues (error template "load-shedding" turns photos off).
- Offline: cached surfaces work (profile, care history, booking state); booking submit held locally and sent on reconnect; top banner "Offline. Bookings will be sent when you're back online."
- Error template network-error: auto-retry 3 attempts, exponential 1s/2s/4s. Search list states from spec 13: idle / loading / skeleton / cached / error; cached banner "Connection slow - showing cached results from 2 min ago".

### D4. Care history (EX, FR-7)
- Empty: pet profile exists, "this is Tito's first stay", no fake content.
- Populated: dense list (not cards) of prior bookings by date, one-tap detail; mockup 21 shows three sections of care (insulin, diet, anxiety triggers, vet contact) + stats (prior stays, providers, days on platform) + past stay card + review.
- Persistent: retained 24 months minimum after account closure (FR-10), disclosed in Pet Profile privacy settings.

### D5. Acute event (EX; mockups 08, 57, 42)
- Trigger by Provider (single "Report an Acute Event" in Booking view / banner on in-stay). Form: event type, severity, immediate action, vet contacted.
- Effects: Booking -> Disputed; Admin queue P1; owner banner on next visit (no push); payout frozen silently to provider; vet directory (3 nearest) shown immediately.
- Runbook (mockup 42, 7 steps): 1 Confirm trigger, 2 Provider role, 3 Admin role, 4 Vet-clinic lookup, 5 Owner notification (Bangla + English template, one-tap send), 6 Payout implications ("hold pending resolution, no automated penalty"), 7 Post-mortem entry (-> 4.9). Step statuses in mock: done / active / pending, with "Mark complete" and "Skip (with note)". Header "Acute Event Active" -> "ACUTE ACTIVE". Elapsed timer; SM-20: first admin timeline entry under 5 min (mock shows 05:00 "SM-20 met"). SM-19: post-mortem within 48 hr of close.
- Named event states: only "active"/"resolved" appear in mockups (42: ACUTE ACTIVE; prototype also `vet-contacted`, `resolved`; see F). No formal state list in EX (gap).

### D6. Disputes (EX Disputes state)
- Trigger: Owner "Report an Issue" (taxonomy per FR-25 seed + narrative) -> Disputed, payout freezes.
- Independent from reviews (FR-22). Resolutions: Resolved-No-Action, Resolved-Refund, Resolved-Provider-Action (FR-35). No intermediate states (investigating, awaiting-response) are named in EX (gap; mockup 06 row text "Investigation open").

### D7. Queue priority (EX, DS, FR-32)

| Priority | EX name | Colour | DS queue-row note |
|---|---|---|---|
| P1 | Acute | coral | coral badge |
| P2 | Dispute | red | red badge |
| P3 | **Awaiting vetting** (provider applications) | amber | DS says "Awaiting" (ambiguous) |
| P4 | In-stay | forest | forest |

PRD FR-32 order is acute, reports, **awaiting provider confirmation**, in-stay (requirements.md C-2). Mockup 06 labels P3 "Vetting" and shows 11 applications. Aging: amber age text on rows >15m.

### D8. Other small state sets
- Availability: available / partial / full.
- Capacity cell: empty / partial / full / peak.
- Counter-metric: healthy / warning(Watch) / breached.
- SM-15 timer: under 4 min success-soft, otherwise muted.
- Daily update (mockup 35): "DUE TODAY, soft reminder", soft expectation, non-blocking; update tags observed: GLUCOSE / BEHAVIOUR / INTAKE / NORMAL.
- Review moderation (mockup 47): filter tabs All / Pending / Flagged / Edited / Removed; actions Approve / Edit / Remove (reason required); action disabled until SM-C3 acknowledgement checked on 3-star critical reviews.
- Toggle: on (use saved) / off (edited, Edited chip).
- Provider tier: Tier-A / Tier-B; provider profile completeness drives Tier-A qualification (EX /provider/profile).

---

## E. MOCKUP COVERAGE

Mockups index states "9 of 10 launch-critical surfaces shipped" and lists 18 screens. The scenarios have 43 page specs (requirements.md C-11: header says 46). All mockups are 390px mobile except where noted. Desktop frames are 1280px.

| File | Title in mock | Width | Mapped page ID | Notes |
|---|---|---|---|---|
| `index.html` | UX Mockups Index (grid, links, spine references) | desktop page | n/a | claims 28 DS component sections, "English-first, Bangla-ready" |
| `01-home.html` | Home (returning owner "Welcome back, Bibi", species/dates/neighbourhood, "Book Rashid for Tito again?", EN . বাংলা toggle) | mobile 390 | 1.1 (partial; 1.1 is marketing landing, mock is returning home) (inferred) | "52 Vetted Providers", "1.4k Verified stays" hard-coded stats |
| `02-search-results.html` | Search Results (12 providers, capacity strips on cards) | mobile 390 | 1.3 (older; superseded) | Spec 13 section 18 says capacity mini-strip removed from cards |
| `13-curated-shortlist.html` + `.component.md` | Curated Shortlist (4 providers, fit cards, filter chips, sticky summary chip) | mobile 390 | 1.3 (canonical) | component spec: props, states, a11y, perf budget (JS <200KB, first paint <1.5s), analytics events, i18n keys, test matrix |
| `03-provider-profile.html` | Provider Profile (Rashid) | mobile 390 | 1.4 | month capacity calendar, 2 reviews shown "of 42" |
| `15-pet-profile-management.html` | 1.5 Pet Profile Management ("Moat seed") | mobile 390 | 1.5 | accordion sections: identity, basic, behaviour, medical, medication, diet, special attention |
| `04-booking-configuration.html` | Care Configuration (4-step indicator) | mobile 390 | 1.6 | no "Use saved" toggles drawn here (those appear in 22) |
| `17-booking-submission-payment.html` | 1.7 Review + authorise (bKash/Nagad/Card) | mobile 390 | 1.7 | "Continue to bKash OTP" |
| `05-booking-confirmation.html` | Booking confirmation, captured state, payment breakdown | mobile 390 | 1.8 (partially; 1.8 is "confirmation-waiting", mock shows the accepted/captured outcome) (inferred) | no waiting/requested state drawn |
| `21-care-history-view.html` | 2.1 Care History View | mobile 390 | 2.1 | |
| `22-book-again-path.html` | 2.2 Book Again, elapsed timer 01:12 | mobile 390 | 2.2 | 5 "Use saved" toggles |
| `07-provider-calendar.html` | Provider Calendar / Capacity | mobile 390 | 3.2 (also overlaps 3.1 dashboard stats and 3.3 incoming request cards) (inferred) | capacity stepper, pending requests inline |
| `35-in-stay-management.html` | 3.5 In-Stay Management | mobile 390 | 3.5 | persistent acute-event banner |
| `36-daily-update-composer.html` | 3.6 Daily Update Composer | mobile 390 | 3.6 | voice mic, care-log |
| `57-acute-event-trigger.html` | 5.7 Acute-Event Trigger | mobile 390 | 5.7 | |
| `08-acute-event.html` | Acute Event (older provider form + Disputed state + vet directory) | mobile 390 | 5.7 (older; superseded by 57) / touches 3.5, 5.1 (inferred) | different event/severity taxonomy than 57 |
| `06-admin-queue.html` | Admin Queue (stat tiles, P1-P4 rows) | desktop (max-w 1280) | 4.1 | "Operating at 87% of ceiling" tile -> overlaps 4.5 |
| `42-acute-event-runbook.html` | 4.2 R-10 Acute Event Runbook | desktop 1280 (`.desktop-frame`) | 4.2 | |
| `47-review-moderation-queue.html` | 4.7 Review Moderation Queue | desktop 1280 | 4.7 | |

Page specs mapped to at least one mockup (16): 1.1 (partial), 1.3, 1.4, 1.5, 1.6, 1.7, 1.8 (partial), 2.1, 2.2, 3.2, 3.5, 3.6, 4.1, 4.2, 4.7, 5.7.

**Page IDs with NO mockup (27 of 43):**
- Scenario 1: 1.2 (owner sign-in)
- Scenario 3: 3.1 (provider dashboard; only partly in 07), 3.3 (incoming request; only a card in 07), 3.4 (confirmation decision), 3.7 (booking completion), 3.8 (profile editor), 3.9 (care-record history), 3.10 (payouts / earnings)
- Scenario 4: 4.3 (provider application review), 4.4 (provider health), 4.5 (operating ceiling; a stat tile only in 06), 4.6 (dispute investigation), 4.8 (payout reconciliation), 4.9 (post-mortem log), 4.10 (defection dashboard)
- Scenario 5: 5.1 (in-stay owner view), 5.2 (completion + review), 5.3 (issue report), 5.4 (review moderation result), 5.5 (notifications inbox), 5.6 (payouts view), 5.8 (defection detection), 5.9 (notifications center), 5.10 (settings), 5.11 (error states; templates only in DS text), 5.12 (empty states), 5.13 (loading skeletons; skeleton rules only in spec 13)

Components with no mockup at all: payout state indicator, pattern detection card, counter-metric header card, defection signal dot, error-state illustrations, toggle on 1.6 (only in 22), chat bubble (only a text excerpt in 35).

Mockup content flags (fabricated-trust-signal risk if shown as real; see F3): ratings (4.9, 4.8, 4.4), review counts (42, 47, 28), "52 Vetted Providers", "1.4k Verified stays", verified review quotes with names, "12 diabetic small dogs handled".

---

## F. PROTOTYPE ANALYSIS (`docs/ux/prototype/index.html`, 2064 lines, ~123 KB)

Understanding only. Its JavaScript must NOT be copied into the product. It is a single-file, no-build hash-router SPA that loads Tailwind from the CDN, Google Fonts, and renders HTML strings. The "demo/index.html" note says "throwaway prototype, no persistence, state in memory".

### F1. Screens and flows

Landing (`#/`): role picker ("Sign in as Pet Owner / Provider / Admin" cards, no auth) + footer stats "52 features, 26 non-functional reqs, 20 success metrics, 5 counter-metrics". Top bar has a role-switcher pill; Esc returns to `#/`. A left sidebar per role. All screens are desktop-width (max 1400px, sidebar w-60), NOT the 390px mobile design source (contradicts DS/EX).

| Root | Routes (screen) |
|---|---|
| Owner | `#/owner` home (in-stay card or "Re-book Rashid"); `/search` ("Step 1 of 4", location, dates, care requirement chips); `/results` ("Curated for Tito", 4 provider cards); `/provider?p=id` (profile with fit, reviews, price sidebar); `/configure` ("Step 2 of 4", 5 "use saved" toggles + textarea); `/payment` ("Step 3 of 4", bKash/Visa radio, authorise-not-pay copy); `/confirmation` (Booking requested, pill Authorized); `/bookings`; `/instay` (daily update, care timeline, acute event log); `/daily-update`; `/care-history`; `/book-again`; `/review`; `/pets`; `/messages` |
| Provider | `#/provider` dashboard (KPI tiles, action queue); `/queue`; `/booking` (detail with Accept / Decline / Counter-offer); `/calendar` (April 2026, 14 days); `/instay` (trigger banner, care log, past acute events, vet directory); `/daily-update`; `/trigger`; `/completed`; `/reviews`; `/listings` ("My listing", capacity, accepts, verification status) |
| Admin | `#/admin` (KPI tiles, acute queue, counter-metrics); `/runbook` (7 steps + pattern detection card); `/booking`; `/moderation` (SM-C3 banner + flagged review); `/providers` (supply table); `/defection` (counter-metrics, aggregate signals, cohorts) |

Component re-implementations: TierABadge, TierBTag, BookingStateBadge (8 states mapped to DS classes), AvailPill, FitCard (150px wide vs DS 140px), Toggle (`role="switch"`), Icon set (inline SVGs), PageHeader, Sidebar, Shell.

### F2. Behaviour actually implemented in the JS (rules, numbers, timers)

The JS contains almost no business logic. Everything is static data + string templates.

- Router: `routes` table of 32 hash routes; `go(hash)`; `render()` replaces `#app` innerHTML on `hashchange`; unknown hash -> landing; `Esc` -> `#/`.
- State mutation: only `state.currentUser = role` on role-button click. No bookings, toggles, forms, filters, sorting, or timers actually change. Search "See 4 vetted providers" is a hard link. Tier/price/sort buttons are inert. `setTimeout/setInterval/localStorage`: none. No SM-15 elapsed timer, no 30s capacity poll, no debounce, no offline handling, no sheet, no focus trap.
- Pricing formula (hard-coded in templates): total = `pricePerNight x nights + 990` service fee; Rashid 2200x9 + 990 = 20,790; book-again 2200x7 + 990 = 16,390. Provider-detail price sidebar uses the same fee. Fee value 990 is not in DS/EX/PRD; mockups show 0 (mockup 17: platform fee "included", total hold 19,800) or 280 (mockup 05).
- Payment copy: "authorized (not captured) until Rashid accepts"; "If he declines, the hold releases in 3-5 days" (mockup 17 says released automatically if declined or no response in 24 hours).
- Provider booking detail: "You'll be paid 24h after the stay ends via bKash" (payout timing rule not in DS/EX; inferred invention), "Counter-offer dates" action and a "Counter-offered" status in the request list (no such state/feature in DS/EX/lifecycle).
- Confirmation: "Rashid typically responds within 6 hours" (invented SLA; mockup 17 uses 24h).
- Acute trigger: "Admin is looped in within 60 seconds" (mockup 57: "within 2 minutes"); "starts a 24h resolution timer"; creates "AE-2026-XXXX"; "Call vet - log call time"; categories (7): Hypoglycemia, Refused food/skipped insulin, Vomiting or diarrhea, Lethargy/collapse, Injury, Anxious/hiding, Other concerning behavior; severity (3): Stable - monitoring; Needs vet within hours; Emergency - call vet now.
- Runbook step list in JS: 1 Provider triggers; 2 Owner notified via SMS + push; 3 Vet directory opened, contact attempted; 4 Vet spoken, guidance received; 5 Owner looped in, status update sent; 6 24h resolution timer, monitoring; 7 Post-mortem + runbook improvement. Event `runbookStep: 4`, "Mark step 4 complete" is a dead button. Elapsed shown as `Math.round(min/60)h min%60m`; `elapsedMin 412` shown for "triggered 23:14 last night". Rule: events older than 1440 min render as days.
- Admin KPI: Active acute events 1; Provider supply 47 (8 Tier-A, 39 Tier-B); Bookings this cycle 128; "92% capture rate"; Review queue 3.
- Counter-metrics (hard-coded): SM-C1 Platform-booking share 73% healthy; SM-C2 labelled "Repeat-booking rate" 68% healthy; SM-C5 labelled "Provider supply utilization" 84% **watch**. Status mapping `healthy -> "Healthy"`, `watch -> "Watch"`, else "Breached".
- Defection screen: "6 owners viewed profiles without booking in the last 7 days" with 4 owner / 1 provider / 1 cross dots; categories counts 12 / 3 / 1 (the counts disagree with the dots: 4+1+1=6 vs 12+3+1=16); cohorts "First-time boarders -4%", "Eid-window returners 73%", "Tier-B -> Tier-A path watch".
- Pattern card: "Hypoglycemia overnight . 3 occurrences in 90 days; median 11pm; all Tier-A"; CTA "Apply to runbook v9" (hard-coded version; DS says v[N+1]).
- Provider calendar: capacity map hard-coded by day index in April (`{2:partial,3:partial,5:full,6:full,7:full,10:partial,11:peak,12:peak}`); week starts Monday (mockups start Sunday); KPIs "14 / 30 nights", "4 / 4 peak windows", "avg response 2.4h".
- Provider listing: "Max pets at once: 2 small dogs OR 1 dog + 1 cat" (mockups say 4 dogs at a time); verification rows (NID + selfie, home inspection, background check, insurance expiry Aug 2026); "Accepts / Does not accept" chips.
- Admin provider utilisation formula: `round((total-available)/total*100)%`.
- Moderation: shows flagged reviews only; actions Approve / Edit & approve / Remove; no reason-required step, no SM-C3 acknowledgement, no consistency check (differs from mockup 47). Flag reason text "Mentioned competitor name in text" attached to a 5-star review.
- Reviews screen: rating distribution bars hard-coded 88/9/3/0/0 %.
- Review screen copy: "7-day dispute window applies to refund claims; reviews are independent".
- Landing, owner and provider screens use the same `BR` avatar regardless of role.

### F3. Data model implied by the JS (reference only; inferred shape)

```
state { currentUser, activeRoute,
  bookings[ {id 'BK-2026-0142', pet, provider, dates(str), nights, status(8 values),
             total, neighborhood, species,
             configuredCare{ insulin|diet|anxiety|instructions|vet : {on:boolean, value:str} }} ],
  providers[ {id, name, tier 'A'|'B', neighborhood, distanceKm, yearsHosting, pricePerNight,
              rating, reviewsCount, repeatOwners, verifiedReviewsWithPhotos,
              fitStats[{value,label}], description, homeType,
              capacityThisWindow{available,total}, color(hue)} ],
  acuteEvents[ {id 'AE-2026-NNNN', bookingId, pet, provider, owner, category, severity,
                triggeredAt(str), elapsedMin, runbookStep 1-7, status, notes} ],
  pets[ {id, name, species, age, weight, medical, diet, flags[], photo(emoji)} ],
  reviews[ {id 'RV-...', providerId, bookingId, owner, rating, text, photosCount, date,
            flag: null|'pending-moderation', flagReason} ] }
```
Observations: care config is flattened to 5 axes (insulin / diet / anxiety / instructions / vet) matching mockup 22 "5 of 5 saved" (EX Flow 1 lists Food, Medication, Care Flags, Instructions). IDs follow `BK-YYYY-NNNN`, `AE-YYYY-NNNN`, `RV-YYYY-NNNN` (mockups use `#PC-2847`, `PC-2842`, `AE-2026-0001`, `PC-2026-0007`, so booking id format conflicts). Dates and money stored as display strings (not a model to copy).

### F4. Hard-coded sample data (fabricated-trust-signal risk if shown as real)

The PRD rule (requirements.md C-4, C-10, DR-15: "no seeded ratings / fabricated signals") makes all of the following unsafe to ship as real data. Flag every one for removal or clearly synthetic labelling.

| Data | Where | Risk |
|---|---|---|
| Rashid M.: Tier A, 4.9 rating, 47 reviews, "47 verified reviews with photos", 6 yrs, 12 repeat owners, fit "12 diabetic small dogs handled successfully", "6 cat boardings . 5 with medication", "4 repeat owners . 3 with senior pets", "4/4 Eid-week capacity honored", BDT 2,200/night | providers[0] | fabricated trust signals; also 47-with-photos = 100% vs mockup 03 "87% with photos" |
| Farzana A.: Tier A, 4.8, 28 reviews, 28 with photos, fit 9/5/3, BDT 1,950 | providers[1] | same |
| Asif K.: Tier A, 4.7, 35 reviews (30 with photos), fit 14 senior pets / 7 special-diet, BDT 2,400 | providers[2] | same; not in any mockup |
| Kamrul H.: Tier B, 4.4, 6 reviews (2 with photos), BDT 1,500 | providers[3] | Tier-B "4.4 stars / 6 reviews" is a rating a new provider would not have; mockup 13 says "2 verified reviews" while 02 says 6 stays |
| Reviews RV-2026-0091 (Bibi R., 5 stars, 4 photos), RV-2026-0078 (Tahsin A., 5 stars, 3 photos) with narrative text | reviews[] | fabricated verified reviews |
| Provider reviews screen "4.9 / 47 reviews", rating histogram 88/9/3/0/0 | ScreenProviderReviews | fabricated distribution; SM-C3 says avg must not be reputation signal (C-4) |
| Admin KPIs: 47 providers (8 Tier-A / 39 Tier-B), 128 bookings, 92% capture rate, 3 review queue | admin dashboard | invented; contradicts "52 Vetted Providers" in mockup 01 and ceiling of 25 providers / 75 bookings per month (EX Flow 3) |
| Counter-metrics 73% / 68% / 84% | admin dashboard + defection | invented; never show as real |
| Provider earnings "BDT 48,400 this cycle", completed stays with 4.8/5.0 stars | provider screens | invented financials |
| Care history stats "3 stays, 23 nights, 3x repeat, 1 acute event" | owner care history | inconsistent with bookings[] (only 2 bookings) |
| Provider hub "Rashid typically responds within 6 hours", "Online, replies in ~10 min", "avg response 2.4h" | owner confirmation, messages, provider calendar | invented SLA/behavioural signals |
| Verification: NID, home inspection "passed Mar 2024", background "Cleared", insurance "expires Aug 2026" | provider listing | invented verification claims |
| Phone numbers `01711-222-333`, bKash `01711-***-3344`, Visa `4127` | owner/provider | placeholder PII-shaped data; vet clinics (Banani Pet Clinic Dr. Iqbal etc.) are made-up clinics |
| Defection screen figures (6 owners, 12/3/1) | admin | internally inconsistent |
| Tito: Toy Poodle, 8 yrs, 4.2 kg, Humulin N, 8am/8pm; mockups: Shih Tzu 4/6/7 yrs, 5.2/7 kg, Caninsulin 2 units 7am/7pm | pets, bookings | fixture names should be flagged as demo-only |

### F5. Prototype contradictions with DS/EX/PRD

1. Layout: desktop sidebar app for all three roles, vs EX "Owner and Provider designed at 390x844 first".
2. Role switcher "Sign in as" with no authentication; PRD FR-31 requires separate admin authentication.
3. Routes use hash and non-EX paths (`#/owner/search`, `#/provider/queue`, `#/admin/runbook`, `#/admin/moderation`, `#/admin/defection`) vs EX route table.
4. Booking states: 8 (no Confirmed-to-Stay); demo bookings jump straight from `authorized` (confirmation) to `in-stay`; `Counter-offered` status invented; `Awaiting` labels.
5. Runbook step 2 "Owner notified via SMS + push" contradicts EX "no native push in v1" (requirements C-9); runbook order differs from mockup 42 (e.g. payout step missing; 24h timer invented); no Bangla/English template.
6. Counter-metric names SM-C2 "Repeat-booking rate" and SM-C5 "Provider supply utilization" vs EX SM-C2 "Provider Platform-Share" and SM-C5 "Care-Record Completeness" (DS also lists "SM-C1/C2/C5").
7. Admin dashboard has no priority-ordered queue (P1-P4); it shows tile KPIs; the queue priority model from EX/mockup 06 is not implemented. Provider queue is a table, not the DS/EX "structured decline reason chips" flow; Decline is a bare button.
8. Moderation screen lacks reason-required removal and SM-C3 acknowledgement from mockup 47.
9. Provider trigger confirms with "Take a breath. We'll guide you through this." (calm, ok) but uses severity options different from mockup 57 (Stabilized / Urgent) and 08 (Mild / Moderate / Severe); trigger is a route, not an `alertdialog` with min-20-char validation.
10. Service fee 990, hold wording and day counts (9 nights Mar 28 - Apr 6) differ from mockups (8 nights Mar 28 - Apr 5; 9 nights Eid-1..Eid+9).
11. Prototype ProviderCard code maps `fitStats` using array destructuring `([v,l])` but the data are `{value,label}` objects, so fit values render `undefined` (a defect; also the stat strip would not display on the cards); the provider detail page has the same pattern. (Defect in prototype, not in spec.)
12. Editorial font stack lacks `Noto Serif Bengali` (DS includes it); body uses only `Inter, system-ui` (ignores the Bangla fallback in `body` CSS; Tailwind `font-sans` has it).
13. Tier-A badge font 0.6875rem (11px) vs DS `text-xs` (12px); FitCard width 150 vs 140; uses `bg-gradient-to-b` on landing (DS: no gradients).
14. English only; Bangla toggle and parity (FR-47) absent. No skip link, focus trap, offline banner, reduced-motion handling.
15. Prototype shows Tier-B card with no rating suppression; DS says Tier-B soft sentence with no numbers (prototype still lists rating 4.4 and 6 reviews).
16. Owner "Leave a review" link in in-stay screen ("after stay"), reviews photos placeholder; fine as demo.

---

## G. DEMO (`docs/ux/demo/index.html`, ~23 KB)

A guided "Demo Walkthrough" wrapper: "throwaway prototype, web, no build, no server". It loads the static mockup HTML files in an iframe-style frame host (surface flag mobile or desktop per step), with a talk-track line per step, back/next buttons, progress dots, jump-to list, and keyboard controls (left/right arrows = prev/next, 1-5 = jump to journey, Esc = back to picker). Tips panel: "End on the moat" (UJ-4 climax), "Don't read screens, tell the story", "Honest unknowns: Payment Authorization is a placeholder, say 'this is a prototype, bKash integration is next'", "Backup: if a click breaks, the index grid still works". Tailwind config repeats DS tokens (omits destructive/success tokens, includes Noto Serif Bengali in editorial).

Journeys (5):

| Journey | Steps (page ID: mockup) |
|---|---|
| **UJ-1 Bibi's first Eid booking** (owner) | 1.1 `01-home` -> 1.3 `13-curated-shortlist` -> 1.4 `03-provider-profile` -> 1.5 `15-pet-profile-management` -> 1.6 `04-booking-configuration` -> 1.7 `17-booking-submission-payment` (six steps; ends at 1.7, the confirmation/waiting screen 1.8 is not part of the journey) |
| **UJ-4 Second booking (moat proof)** | (context) 1.7 -> 2.1 `21-care-history-view` -> 2.2 `22-book-again-path` |
| **R-10 Acute-event response** | 5.7 `57-acute-event-trigger` -> 4.2 `42-acute-event-runbook` (desktop) -> 3.5 `35-in-stay-management` -> 3.6 `36-daily-update-composer` (order as in the file) |
| **Admin: Queue + Runbook** | 4.2 runbook -> 4.7 `47-review-moderation-queue` -> 4.2 revisit ("1 / 25 / 75" ceiling talk) |
| **Quick overview: all surfaces** | 1.1, 1.3, 1.4, 2.1, 2.2, 3.5, 3.6, 4.2, 4.7, 5.7 |

Observations: the demo never uses mockups 02, 05, 06, 07, 08 (superseded or unused), so 1.8 confirmation, 3.2 calendar and 4.1 queue are not part of any journey. The demo is independent from the prototype. The talk tracks make claims: "Default is 3-5 vetted Providers", "capture happens on Provider Confirmation, not at request", "Soft-signal, not enforced" for daily updates, "Provider hits 'Report a concern'" (mockup button is "Submit Acute Event report" / "This starts the runbook"), "paged" (no paging feature; EX says no push).

---

## H. CONFLICTS AND GAPS

Severity: **H** high (blocks build decision), **M** medium, **L** low.

| # | Sev | Conflict / gap | Sources | Suggested handling |
|---|---|---|---|---|
| 1 | H | Language: EX says "English-first... copy translation out of scope for v1", "English-first in v1", toggle in footer; PRD FR-47/NFR-12 require Bangla default with full parity (owner + provider; admin English only). Mockup index says "English-first . Bangla-ready"; spec 13 section 16 expects `messages/en.json` + `bn.json`. Mockup 01 shows toggle in header. | EX Foundation/Localization, EX Accessibility > Language; mockups/index.html; requirements.md C-1 | PRD wins (already decided in requirements C-1). Needs a DS addition: Bangla line-height/size tuning, longer string overflow rules, numerals (Bangla vs Latin digits not specified), language toggle position. |
| 2 | H | Queue P3 naming: EX/DS "Awaiting vetting" (provider applications) vs PRD FR-32 "awaiting provider confirmation"; mockup 06 labels "P3 Vetting" and omits any awaiting-confirmation row; DS queue-row says only "Awaiting (amber)". | EX Queue priority; DS Queue Dashboard Row; mockup 06; requirements C-2 | Show both; clarify with PRD order. |
| 3 | H | Decline reasons: EX chips (date conflict, capacity reached, special-care not in scope, other) vs PRD FR-17 six-reason seed taxonomy; prototype has no chips; mockup 07 has only a bare "Decline". EX uses chips in both Interaction Primitives and Flow 2. | EX Inline confirmation; EX Flow 2 step 5; requirements C-3 | PRD taxonomy wins; DS has `badge.decline` but no chip visual for the selector. |
| 4 | H | Booking state set: EX 9 states incl. Confirmed-to-Stay (no DS token); DS 8; FR-14 includes canceled, no-show, resolved. Flows skip `Authorized` (Requested -> Captured). Acute/dispute modelled as Disputed (EX) vs "payout freeze + flag" (FR-29). Mockups 08/57 hard-code "booking transitions to Disputed". Prototype adds "Counter-offered". | EX Booking lifecycle, Flows 1/4; DS booking-state; requirements C-7, C-8 | Resolve in lifecycle decision; add pill token for any added state. |
| 5 | H | Fabricated trust signals: DS/EX/mockups/prototype all show 4.9 / 47 reviews etc. as examples; PRD forbids fabricated/seeded signals and says average rating must not be a reputation headline. DS review card shows `4.7` rating tabular; mockup 02/03/13 headline "4.9" next to name. | DS Verified Review Card; EX Voice table ("Last Eid booking: 4 diabetic dogs"); mockups 01-03, 13; prototype F4; requirements C-4, C-10 | Treat all as layout fixtures only; Demonstrated Fit empty state ("New to PetCare. Building a track record.") must be default for new providers. |
| 6 | H | Route collision / naming: `/provider/:id` (Owner profile) under Provider root `/provider`; spec 13 uses `/providers/{slug}`; prototype uses `#/owner/provider?p=`. | EX IA; spec 13 section 10; prototype routes | Choose one public profile route, avoid prefix clash (see C2). |
| 7 | M | Acute event form taxonomy differs across sources: mockup 08 event types (Illness, Injury, Allergic reaction, Behavioral, Other) and severity (Mild / Moderate / Severe); mockup 57 types (Glucose/medical, Injury, Behavioural, Other) and severity (Stabilized / Urgent); EX form fields (event type, severity, immediate action, vet contacted?); prototype 7 categories and 3 severity labels. Notification SLA: 57 "within 2 minutes" vs prototype "within 60 seconds"; SM-20 5-min target for first admin entry. | mockups 08, 57, 42; EX Acute Event state; prototype F2 | Use 57 (newer, tied to 5.7 spec) as canonical (inferred); confirm taxonomy with PRD/FR-26/OQ-20. |
| 8 | M | Runbook step names differ between mockup 42 and prototype; EX does not enumerate the runbook; DS says Acute-Event Trigger step flow "Step 7 -> 4.9". Mockup 42 includes payout step; prototype does not; prototype adds SMS+push (contradicts C-9). | mockup 42; prototype runbook; EX; requirements C-9 | Mockup 42 canonical (inferred). |
| 9 | M | Booking id/money/date inconsistencies across mockups: Tito details (Shih Tzu 4y/6y/7y; 5.2kg/7kg); insulin 7am/7pm (04, 05, 08, 21, 22) vs 8am/8pm (15, 17, prototype); 8 nights Mar 28-Apr 5 (01-05) vs 9 nights "Eid-1 -> Eid+9" (13, 17); stay price BDT 5,600 (03, 05) vs 6,300 (21, 22) vs 19,800 (13, 17); service fee BDT 280 (05) vs "platform fee included" (17) vs 990 (prototype); vet "Dr. Khan, Gulshan Pet Clinic" (04, 08) vs "Dr. Rahman, Gulshan Vet" (17, 21, 22, 35, 42). Hold release: 24 hours (17) vs 3-5 days (prototype). Fee policy undefined in DS/EX. | mockups 03-05, 13, 15, 17, 21, 22; prototype | Fee/commission model must come from PRD, not mockups. Use fixtures consistently. |
| 10 | M | Provider chain of responsibility: DS says Acute-Event Trigger Banner used on 3.5/3.6/5.7; EX says persistent on 3.5; mockup 35's banner copy "If something is wrong, tap here" matches; mockup 36 helper is "If concerning, see acute-event runbook" while DS copy is "Concerning? See acute-event runbook." (minor); DS "no exclamation marks" but mockup 08/57 use "!" glyph icon (a "!" icon, not copy). | DS Acute-Event Trigger Banner; mockups 35, 36 | L |
| 11 | M | Color discipline strains: coral "reserved for acute/care-status" but DS also uses coral for (a) admin chat bubble (`accent-soft`), (b) provider defection dot, (c) booking-state comment "coral = acute-event" with no coral booking token while the acute state is shown as Disputed (red). DS says "Forest green reserved... not decorative" but green is also success, Tier-A, Verified, captured, completed, in-stay, available, healthy, released, peak cells, fit numerals, toggle on, selected chips (many meanings). EX table: "coral = acute" pill exists in prose but DS booking-state has no `acute` entry. | DS Colors discipline vs components; EX Booking State Indicator | Define explicit allowed-uses list; add acute booking pill or drop claim. |
| 12 | M | Contrast: DS claims all pairings validated 4.5:1, but amber-600 text on white / amber-100 (booking-state declined, payout hold, counter-metric Watch) and `text-muted-foreground/50` on muted (availability `full`, capacity `full`) are likely below AA; DS `badge.decline` uses `text-foreground/80` while booking-state declined uses `text-warning` (inconsistent). (inferred, needs measurement) | DS Colors, booking-state, availability-pill, capacity-cell | Measure before build; likely adjust. |
| 13 | M | DS Mockups section says "Eight key-screen mockups"; EX likewise; actual: 18 screens + index + component spec. The mockup index counts "9 of 10 launch-critical surfaces". Only 16 of 43 page specs have a mockup (requirements C-11). | DS Mockups; EX Mockups; mockups/index.html | Informational. |
| 14 | M | Duplicate/superseded mockups: 02 vs 13 (search), 08 vs 57 (acute trigger), 04 vs 22 (use-saved toggles shown only in 22), 05 (captured outcome) vs spec 1.8 ("confirmation-waiting"), 06 queue (P-tiles) vs 4.1/4.5. DS/EX still reference 01-08 as "the" mockups; spec 13 section 18 says new build extends. | mockups index; spec 13 | Choose canonical: 13, 57. |
| 15 | M | Sticky Action Bar: DS says "used 6x (1.2, 1.5, 1.6, 1.7, 2.1, 2.2)" but 1.2 is sign-in and the variants list booking-config, submit, profile, pet-profile, care-history, book-again; DS Do-list says "Provider Profile ... Pet Profile Editor"; "Cancel" link referenced in EX not in DS variants. Mockup 15 shows "Book Rashid" and "Discard" at top (not a sticky bottom bar). | DS Sticky Action Bar vs mockup 15 | L |
| 16 | M | Provider Card contradictions: card radius `xl` (DS provider-card) vs primary cards `lg`; Tier-A badge "border-2" vs `badge.tier-a` "border"; DS says Provider Card uses `shadow-md-soft` token while elevation tokens are `sm/md/lg/xl` (soft suffix only in Tailwind config of mockups); EX says "Tier-A badge is static element, tap shows one-sentence explanation" (static yet tappable); EX says FitCard button has aria-label but DS shows FitCards as div strips. Spec 13 checklist: CTA >=48px vs EX 44px. | DS Provider Card / Tier-A; EX Tier-A, Provider Card; spec 13 | L |
| 17 | M | Capacity cell: EX "no separate peak legend" but mockups 07 shows a legend (Partial / Peak / Empty / Full); EX "no nested numbers" but mockup 02 shows "3/4" counts on cells; mockup 07 has week starting Sunday, prototype Monday. | EX Date-Level Capacity Cell; mockups 02, 07; prototype | L |
| 18 | M | Search: EX shortlist "curated shortlist default" (3-5, spec 13 "4 providers"); mockup 02 "12 Providers". EX sort modes include "Closest" and "Best demonstrated fit"; EX also says v1 ranking is "capability-and-tier baseline, Phase 2 adds demonstrated-Fit ranking" while sort "Best demonstrated fit" is offered (requirements OQ-25: care-fit ranking v1: no). | EX Provider Card; spec 13; mockup 02; requirements | Drop or hide "Best demonstrated fit" sort in v1 (inferred). |
| 19 | M | Chat: EX says Admin bubbles centred with `[Admin]` prefix; DS defines admin bubble `accent-soft`; EX also says timestamps on tap while DS has timestamp token `text-xs mt-1` (always-on?). No chat mockup besides excerpt in 35. EX "chat... new messages at booking-state header, not separate inbox" vs page specs 5.5/5.9 notifications inbox/center. | DS Chat Bubble; EX Chat Bubble, Interaction Primitives; scenarios 5.5/5.9 | Needs spec reconcile. |
| 20 | M | Push/notification: EX "No native push in v1; on-page banner + email"; Flow 1 step 6 says "Rashid gets a push to his Provider queue (in-session, not push)" (self-contradiction); mockup 57 "Ayaat and Bibi will be notified within 2 minutes" with no channel; prototype "SMS + push". | EX PWA / Flow 1 step 6; mockup 57; prototype; requirements C-9 | Use notification port (Dummy) per C-9. |
| 21 | M | Admin surface: EX desktop-first >=1280; PRD says admin on low-end phone; DS "Admin Console density"; mockup 06 is a "max-w-[1280px]" card on a page. DS queue-row grid has fixed 5 columns with no mobile spec (EX says rows collapse to stacked cards). | EX Foundation; DS Queue Row; requirements C-6 | Build responsive. |
| 22 | M | Counter-metric definitions: EX SM-C1 Platform-Booking Share, SM-C2 Provider Platform-Share, SM-C5 Care-Record Completeness; prototype redefines SM-C2/C5; DS references only IDs. EX table says SM-C3 "MUST NOT" star optimisation; DS "persistent until dismissed" vs EX "Cannot be dismissed by closing the page - reappears on each visit" (inconsistent: dismissible or not). | DS SM-C3 banner; EX SM-C3 banner; EX Key Success Metrics; prototype | L/M |
| 23 | M | Missing DS definitions for components used in mockups (bottom sheet, step indicator, stat tile, segmented control, runbook timeline/step list, moderation action bar with acknowledgement, photo uploader, skeleton, offline banner, language toggle); EX/DS do not specify empty states (5.12) or loading skeletons (5.13) except spec 13 text. DS "Error State Illustrations" are specified in text only (no art spec beyond "CSS geometric"). | DS; mockups | Define when implementing pages 5.11-5.13. |
| 24 | L | Tone and copy contradictions: EX microcopy "Button labels are verb-first, two words" but DS/mockups use "Authorize & Send Request", "Review & confirm stay", "Continue to bKash OTP", "Request booking", "Submit Acute Event report" (multi-word). EX "no exclamation marks / no sorry" vs error template "Oops-free" ok. DS "Error voice: no 'sorry'". | EX Microcopy; DS Sticky variants; mockups | L |
| 25 | L | Accessibility spec gaps: EX says "Tested with colour-blindness simulators" (claim, no evidence); focus ring `ring-2 ring-offset-2` (Input) vs elevation ring `3px .18` (DS Elevation / prototype). Reduced-motion and skip-link are required but not drawn in any mockup. | EX Accessibility; DS Input vs Elevation | L |
| 26 | L | DS typography: "Inter ... supports Bangla script fallback" (Inter does not contain Bengali; the fallback is Noto) and "same metrics as Inter" is a claim. Source Serif 4 is loaded in weights 400/600 per DS but mockups load 700; prototype loads 400/600/700. Third-party CDN (Google Fonts, Tailwind CDN) in all mockups/prototype/demo conflicts with NFR payload/offline budget (500KB initial, 3s TTI per DS Notes) (inferred; self-host fonts and compile Tailwind). | DS Typography/Notes; prototype head | M |
| 27 | L | Date/time and number formats: mockups mix "BDT 19,800", "৳ 5,600", "৳ 5,880"; EX Flow text uses "28 March" vs mockups "Mar 28"; spec 13 uses `toLocaleString('en-BD')`. No Bangla numerals/date rule. | mockups 03/05/13; spec 13 | Define format helper per locale (inferred). |
| 28 | L | Flow naming: EX Flow 1 step 6 says Provider confirmation happens "in-session, not push"; SLA window and "Confirmed-to-Stay" trigger undefined; SLA window duration unspecified (24 hours appears only in mockup 17 and Hold copy). | EX Flow 1, Booking lifecycle; mockup 17 | Confirm with PRD FR-17/18. |
| 29 | L | EX "Persistent footer language toggle" vs mockups with no footer; mockup 01 shows toggle in header; Admin English only. | EX Accessibility > Language; mockup 01 | L |
| 30 | L | Two prototype-vs-mockup structure differences worth recording: Owner pet "Care config" 5 axes (mockup 22) vs EX Care Configuration 6 groups; in 04, "Medication" is a group with a "Critical" tag and "Care flags" includes Diabetic, Anxious, Senior, Allergies, Post-surgery, Heat-sensitive (matches EX list, "Anxious" vs EX "Anxiety"). | mockups 04, 22; EX | L |

### H1. Top-5 summary
1. Language: EX "English-first" vs PRD Bangla default (resolved to PRD in requirements C-1; DS needs Bangla typography/format rules).
2. Queue priority P3 meaning (vetting vs awaiting provider confirmation) and decline-reason taxonomy (EX chips vs PRD FR-17).
3. Booking lifecycle mismatch across EX (9 states incl. Confirmed-to-Stay) / DS (8 tokens) / PRD (canceled, no-show, resolved) and acute-event -> "Disputed" modelling.
4. Fabricated trust signals everywhere (ratings, review counts, stats, SLAs, verification, financials) in DS/EX examples, 18 mockups, and the prototype; prototype also has a rendering bug and several invented rules (990 fee, 3-5 day hold release, 24h payout, counter-offer, 6h response, SMS+push).
5. Route collision `/provider/:id` vs Provider root `/provider` (and spec 13 `/providers/{slug}`), plus 27 of 43 page specs without any mockup.
