---
title: PetCare — DESIGN
status: final
created: 2026-08-29
updated: 2026-08-31
ux_revision: 3
revision_note: "DS extraction round 2: 8 patterns promoted from Scenarios 02–05 specs to named tokens — StickyActionBar (corpus-wide), toggle.primary-soft, success-soft palette, payout-state-indicator, pattern-detection-card, SM-C3 protection banner, defection signal dots, counter-metric header card, acute-event trigger banner, error-state illustrations. 100% inventory coverage."
source_prd: /home/bs00856/Documents/Projects/PetCare/_bmad-output/planning-artifacts/prds/prd-PetCare-2026-08-29/prd.md
---

# PetCare — DESIGN

*Per the [Google Labs DESIGN.md spec](https://github.com/google-labs-code/design.md). Owns visual identity. EXPERIENCE.md owns behavior, IA, and flows. Spines win on conflict with any mock or import.*

## Mockups

Eight key-screen mockups in [`mockups/`](./mockups/) (open [`mockups/index.html`](./mockups/index.html) for the full demo grid):

- [`mockups/01-home.html`](./mockups/01-home.html) — Home / Landing (mobile)
- [`mockups/02-search-results.html`](./mockups/02-search-results.html) — Search Results (mobile)
- [`mockups/03-provider-profile.html`](./mockups/03-provider-profile.html) — Provider Profile (mobile)
- [`mockups/04-booking-configuration.html`](./mockups/04-booking-configuration.html) — Care Configuration (mobile)
- [`mockups/05-booking-confirmation.html`](./mockups/05-booking-confirmation.html) — Booking Confirmation (mobile)
- [`mockups/06-admin-queue.html`](./mockups/06-admin-queue.html) — Admin Queue Dashboard (desktop, 1280px)
- [`mockups/07-provider-calendar.html`](./mockups/07-provider-calendar.html) — Provider Calendar / Capacity (mobile)
- [`mockups/08-acute-event.html`](./mockups/08-acute-event.html) — Acute Event Surface (mobile)

## Brand & Style

PetCare is a curated Dhaka marketplace for pets with specific or special-care requirements. The brand posture is **calm, trustworthy, warm, modern** — premium without being precious, caring without being childish. The visual system reinforces three load-bearing product promises:

- **Curated** — every Provider is vetted. Restrained visual hierarchy; no busy layouts, no decorative noise. Whitespace is a trust signal.
- **Demonstrated Care Fit** — reputation is built on what Providers have actually handled. Photography (real Stay photos, real Pet photos) carries the trust claim; the design system gives photography room to breathe.
- **Special-care-strong** — intake flows have more vertical space and clearer field hierarchy than typical booking apps. Care configuration is treated with the seriousness it deserves.

**Anti-references:** playful pet-app tropes (paw-print logos, cartoon illustrations, bubble fonts, pastel overload), generic marketplace SaaS (gradient-heavy, marketing-deck polish), and minimalist-black/white aesthetics that read as cold for the warmth positioning.

**Voice references (visual):** the warmth of Headspace's editorial care, the precision of Linear's information hierarchy, the photography-forward restraint of Airbnb's host pages.

**Foundations:** shadcn-derived component tokens with Tailwind CSS. The system is built for theme-extensibility (English / Bangla parity per PRD FR-47), component reuse (Owner / Provider / Admin share core primitives), and accessibility (WCAG 2.1 AA contrast floor per NFR-12).

## Colors

Palette anchored on warm neutrals with a forest-green primary (care + trust signal) and a warm coral accent (care-status / acute-event signal). All tokens are documented with their HSL values and CSS variable bindings so they map cleanly to Tailwind's `bg-primary`, `text-primary-foreground`, etc.

```yaml
colors:
  # Base — warm neutrals (the cream/ivory tone reads as calm + premium)
  background: "hsl(38 35% 97%)"      # cream-50 — page background
  foreground: "hsl(30 12% 14%)"      # charcoal-900 — primary text
  muted: "hsl(36 18% 92%)"           # cream-100 — secondary surfaces (cards, sections)
  muted-foreground: "hsl(30 8% 38%)" # stone-600 — secondary text, captions
  card: "hsl(0 0% 100%)"             # pure white — card surface
  card-foreground: "hsl(30 12% 14%)" # charcoal-900 — card text
  border: "hsl(34 14% 86%)"          # cream-200 — borders, dividers
  input: "hsl(34 14% 90%)"           # cream-200 — input field background
  ring: "hsl(150 32% 32%)"           # forest-700 — focus ring

  # Primary — forest green (trust + care)
  primary: "hsl(150 32% 32%)"        # forest-700 — primary buttons, links, key surfaces
  primary-foreground: "hsl(38 35% 97%)"  # cream-50 — text on primary
  primary-soft: "hsl(150 22% 92%)"   # forest-100 — primary tinted background (alerts, chips)
  primary-soft-foreground: "hsl(150 38% 22%)"  # forest-900 — text on primary-soft

  # Accent — warm coral (care-status / acute-event signal)
  accent: "hsl(14 64% 56%)"          # coral-500 — care-status indicators, acute-event badges
  accent-foreground: "hsl(38 35% 97%)"  # cream-50 — text on accent
  accent-soft: "hsl(14 70% 94%)"     # coral-100 — accent tinted background
  accent-soft-foreground: "hsl(14 64% 32%)"  # coral-700 — text on accent-soft

  # Semantic
  success: "hsl(150 32% 32%)"        # forest-700 — same as primary (success state)
  success-soft: "hsl(150 22% 92%)"   # forest-100 — success background
  warning: "hsl(36 78% 46%)"         # amber-600 — warning state (decline signals, low utilization)
  warning-soft: "hsl(36 78% 94%)"    # amber-100 — warning background
  destructive: "hsl(0 62% 48%)"      # red-600 — destructive actions, dispute flags
  destructive-soft: "hsl(0 62% 94%)" # red-100 — destructive background
  info: "hsl(212 56% 48%)"           # sky-600 — informational surfaces
  info-soft: "hsl(212 56% 94%)"      # sky-100 — informational background
```

**Color discipline:**

- **Forest green is reserved** for primary actions, trust signals (Tier-A badge, Verified Reviews), and the booking-state "captured" indicator. It is NOT used decoratively. This keeps it meaningful.
- **Coral is reserved** for care-status / acute-event indicators. It is the visual signal that "this is about a Pet's wellbeing right now" — visible at a glance in the Provider Calendar (Date-Level Capacity) and on the Acute Event surface.
- **Warm neutrals do the heavy lifting.** Page surfaces, cards, dividers, secondary text — all in the cream / stone range. This is what gives the system its calm, premium feel.
- **Status colors are semantic, not decorative.** Red is destructive (dispute flag), amber is warning (low Tier Utilization, decline signal), forest is success / primary, sky is informational. Never used as palette decoration.
- **Contrast floor:** all text-to-background pairings meet WCAG 2.1 AA (≥4.5:1 for body text, ≥3:1 for large text and UI components). Validated against the foreground / background pairings above.

## Typography

Two-family system: **Inter** for UI (high legibility on small screens, supports Bangla script fallback), **Source Serif 4** for editorial moments (large headers, quote-style emphasis on Reviews and care stories).

```yaml
typography:
  ui:
    family: "Inter, 'Noto Sans Bengali', system-ui, sans-serif"
    # Noto Sans Bengali is the Bangla fallback — same metrics as Inter, supports the script.
    weights: [400, 500, 600, 700]
  editorial:
    family: "'Source Serif 4', 'Noto Serif Bengali', Georgia, serif"
    weights: [400, 600]
    # Used for: Hero h1, section headers in marketing, the "Verified Review" quote style.

  scale:
    xs: "0.75rem"      # 12px — captions, badges, dense table cells
    sm: "0.875rem"     # 14px — secondary UI text, helper text
    base: "1rem"       # 16px — body text (mobile-first; 16px is the readability floor)
    lg: "1.125rem"     # 18px — emphasized body, list items
    xl: "1.25rem"      # 20px — small section headers, card titles
    2xl: "1.5rem"      # 24px — card titles, modal headers
    3xl: "1.875rem"    # 30px — page section headers
    4xl: "2.25rem"     # 36px — large feature headers
    5xl: "3rem"        # 48px — Hero h1 (desktop)
    6xl: "3.75rem"     # 60px — Hero h1 (desktop, generous)

  lineHeight:
    tight: "1.2"       # display, headlines
    snug: "1.35"       # section headers
    normal: "1.5"      # body
    relaxed: "1.65"    # long-form (Verified Review display, hero copy)

  letterSpacing:
    tight: "-0.015em"  # display
    normal: "0"        # body
    wide: "0.04em"     # small caps labels, badge text
```

**Type discipline:**

- **Body is always 16px+ on mobile.** Smaller sizes are reserved for captions and badges only. This matters for the PRD's owner-side: Bibi filling in Tito's insulin schedule needs readable form labels.
- **Editorial serif is reserved for hero / marketing headers and Review quotes.** Using it inside the product UI would compete with data density. Inter handles the UI surface.
- **Bangla fallback chain is explicit.** `Noto Sans Bengali` / `Noto Serif Bengali` carry the script without breaking the system. No Bangla-specific design tokens are needed in v1; the font stack handles it.
- **Number tables (rates, counts, prices) use tabular-nums Inter.** Verified Reviews display the 4.7 rating with aligned digits — visual precision is a trust signal.

## Layout & Spacing

8-point grid with a 4-point half-step. Spacing scale aligns to Tailwind defaults for shadcn compatibility.

```yaml
spacing:
  0: "0"
  px: "1px"
  0.5: "0.125rem"   # 2px — hairline gaps
  1: "0.25rem"      # 4px — tightest interior gap (icon-to-text)
  1.5: "0.375rem"   # 6px — badge interior
  2: "0.5rem"       # 8px — base unit (most intra-component gaps)
  3: "0.75rem"      # 12px — small component interior
  4: "1rem"         # 16px — standard component padding, list gap
  5: "1.25rem"      # 20px — large component interior
  6: "1.5rem"       # 24px — section gap, card padding (large)
  8: "2rem"         # 32px — major section separation
  10: "2.5rem"      # 40px — page section padding (mobile)
  12: "3rem"        # 48px — page section padding (tablet+)
  16: "4rem"        # 64px — hero top/bottom padding
  20: "5rem"        # 80px — large hero separation
  24: "6rem"        # 96px — maximal section separation

layout:
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
  # Mobile-first container; 16px gutter on mobile, 24px on tablet, 32px on desktop.
  breakpoints:
    sm: "640px"
    md: "768px"
    lg: "1024px"
    xl: "1280px"
    2xl: "1536px"
  radius:
    sm: "0.25rem"     # 4px — chips, small badges
    md: "0.5rem"       # 8px — buttons, inputs, small cards
    lg: "0.75rem"      # 12px — primary cards, surfaces
    xl: "1rem"         # 16px — feature cards, modals
    2xl: "1.5rem"      # 24px — Hero cards, marketing surfaces
    full: "9999px"     # pills, avatar rings
```

**Layout discipline:**

- **Generous whitespace on the Owner intake path.** Care Configuration (PRD FR-15) has more vertical space than typical booking flows — fields are stacked, label-input spacing is `space-y-4` minimum, section dividers get `my-8`.
- **Cards are the primary surface.** Almost everything sits on a card with `radius-lg` (12px) and `bg-card` (pure white). This creates the calm, premium rhythm.
- **Mobile is the design source, not an afterthought.** Owner and Provider mockups are designed at 390px first; desktop is responsive expansion, not the other way around.
- **Admin Console density is intentional.** At 1280px, the Queue Dashboard uses a denser grid (smaller row padding, tighter column gaps) — Admin works at speed and the layout reflects that per FR-32.
- **Section separators are sparse.** Major sections use `space-y-8` or `space-y-12` rather than divider lines. The cream background + generous spacing does the separation work.

## Elevation & Depth

Restrained elevation. The system uses shadows sparingly — most depth comes from color contrast (cream surface vs. white card), not drop shadows. Shadows are reserved for overlays and modals.

```yaml
elevation:
  none: "none"
  sm: "0 1px 2px 0 rgba(30, 22, 12, 0.04)"
  # Subtle — for inline cards sitting on muted background. Almost imperceptible.
  md: "0 2px 4px -1px rgba(30, 22, 12, 0.06), 0 1px 2px 0 rgba(30, 22, 12, 0.04)"
  # Card default — slightly lifted off the page background.
  lg: "0 8px 16px -4px rgba(30, 22, 12, 0.08), 0 4px 8px -2px rgba(30, 22, 12, 0.04)"
  # Popover, dropdown menu, autocomplete.
  xl: "0 16px 32px -8px rgba(30, 22, 12, 0.12), 0 8px 16px -4px rgba(30, 22, 12, 0.06)"
  # Modal, drawer, sheet.
  ring: "0 0 0 3px hsl(150 32% 32% / 0.18)"
  # Focus ring — never replaced by shadow.
```

**Elevation discipline:**

- **Color contrast does the heavy lifting.** A white card on a cream background (`bg-card` on `bg-muted`) is more visible than a shadow without color difference. Most "elevation" in this system is actually color contrast.
- **Shadows are tinted warm, not neutral.** `rgba(30, 22, 12, ...)` is a warm brown-black, not pure black — keeps the system tonally coherent.
- **Focus rings always, shadows never for focus.** Accessibility-first: keyboard users get the ring; mouse users get both ring (on `:focus-visible`) and any elevation. Never replace focus indicator with shadow alone.

## Shapes

```yaml
shapes:
  radius:
    sm: "0.25rem"
    md: "0.5rem"
    lg: "0.75rem"
    xl: "1rem"
    2xl: "1.5rem"
    full: "9999px"
  borderWidth:
    default: "1px"
    strong: "2px"   # Tier-A badge ring, special-care flag emphasis
```

**Shape discipline:**

- **Cards: `radius-lg` (12px).** Soft, modern, premium. Not square (cold), not pill (informal).
- **Buttons: `radius-md` (8px).** Slightly tighter than cards — visual hierarchy.
- **Inputs: `radius-md` (8px).** Matches buttons.
- **Avatars: `radius-full`.** Standard.
- **Tier-A badge ring: `border-2` + `radius-full`.** Distinct from standard badges; the doubled border weight + full radius signals "this is a curated anchor" without a separate icon.
- **Verified Review photos: `radius-md` (8px).** Photos are rectangular content; the tighter radius keeps them feeling like documentary evidence rather than marketing imagery.
- **No pill-shaped cards.** Pills are for badges, tags, and CTAs only — never for surfaces.

## Components

shadcn-derived. Components map to PRD features with consistent visual grammar.

### Button

Three variants × three sizes. Forest green is the primary; secondary actions use `outline`; tertiary use `ghost`.

```yaml
button:
  variants:
    primary: "bg-primary text-primary-foreground hover:bg-primary/90"
    secondary: "bg-muted text-foreground hover:bg-muted/80 border border-border"
    outline: "border border-border bg-transparent text-foreground hover:bg-muted"
    ghost: "bg-transparent text-foreground hover:bg-muted"
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    link: "text-primary underline-offset-4 hover:underline"
  sizes:
    sm: "h-8 px-3 text-sm"
    md: "h-10 px-4 text-base"
    lg: "h-12 px-6 text-lg"
  radius: "md"
```

### Card

The primary surface. Used for Provider Profiles, Booking tiles, Review cards, Admin Queue rows.

```yaml
card:
  base: "bg-card text-card-foreground border border-border"
  radius: "lg"
  padding: "p-6"          # mobile; p-8 on desktop
  shadow: "md"
  # Variants:
  flat: "border border-border"             # default — relies on shadow md
  elevated: "border border-border shadow-lg"  # for featured surfaces (Hero card, top of queue)
  muted: "bg-muted border-transparent"     # for secondary grouped content
```

### Input

Form fields for Care Configuration. Clear label, generous padding, focus ring.

```yaml
input:
  base: "bg-input text-foreground border border-border placeholder:text-muted-foreground"
  radius: "md"
  padding: "h-12 px-4 text-base"      # tall inputs — care fields deserve room
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  variants:
    text: ""
    number: ""
    date: ""
    select: ""
    textarea: "min-h-24 p-4 text-base leading-relaxed"
```

### Badge

Trust signals, status indicators, tier markers.

```yaml
badge:
  base: "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide"
  variants:
    tier-a: "bg-primary-soft text-primary-soft-foreground border border-primary/20"
    # Tier-A Provider badge: forest-green soft background + border, full radius.
    verified: "bg-primary text-primary-foreground"
    # Verified Review indicator: solid forest-green pill.
    acute: "bg-accent text-accent-foreground"
    # Acute Event badge: warm coral — visible at a glance.
    warning: "bg-warning-soft text-foreground/80 border border-warning/30"
    info: "bg-info-soft text-info border border-info/30"
    neutral: "bg-muted text-muted-foreground border border-border"
    decline: "bg-warning-soft text-foreground/80 border border-warning/30"
    # Structured Decline reason indicator.
```

### Filter Chip + Summary Chip

Sticky filter bar pattern (used on Search Results and recurring in admin/date-filter/notification contexts). Filter Chip is toggleable; Summary Chip is a single-edit affordance that opens the full filter modal.

```yaml
filter-chip:
  base: "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border"
  selected: "bg-primary-soft text-primary-soft-foreground border-primary/20"
  # Selected state shows a leading check glyph ("✓").
  unselected: "bg-muted text-foreground/80 border-border"
  hover: "subtle inner shift — never scale, to avoid jitter in horizontal-scroll strips"
  # Horizontal scroll affordance: parent uses overflow-x-auto with -mx-N px-N to break out of card padding.
summary-chip:
  base: "w-full flex items-center justify-between gap-3 h-11 px-4 rounded-full bg-muted text-sm"
  text: "tabular text-foreground font-medium truncate"
  affordance: "trailing caret (▾) — full-width tap target opens the filter modal"
  copy: "{location} · {species} · {date-range} · {N} nights"
  # Concatenated, dot-separated summary. Always shows the full active query.
```

### Tier-A Provider Badge

Distinctive component — appears on Provider Profiles and in Search results. Doubled border, full radius, forest-green soft background.

```yaml
tier-a-badge:
  visual: "rounded-full border-2 border-primary bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-soft-foreground tracking-wide"
  content: "Tier-A · Admin-vetted"
  # "Admin-vetted" reinforces the curated-supply model without restating "Tier-A" verbatim.
```

### Tier-B Provider Marker

Deliberately de-emphasized — Tier-B providers are real, vetted providers, just less proven. Visual treatment is intentionally muted so the eye lands on Tier-A first without making Tier-B feel hidden or punished.

```yaml
tier-b-badge:
  visual: "rounded-full bg-muted text-muted-foreground border border-border px-2 py-0.5 text-[10px] font-medium tracking-wide"
  content: "TIER-B"
  # Caps + muted palette. Avoids the "Tier-A minus color" trap — Tier-B has its own visual grammar.
tier-b-card-treatments:
  photo: "replaced with icon placeholder (emoji or category glyph) — not a low-quality photo"
  opacity: "opacity-90"
  surface: "bg-card with the same border as Tier-A — same surface, less prominence via opacity"
  # Net effect: "still here, still real, just less proven." Never hidden.
```

### Provider Card

The Day-0 trust surface — what Bibi sees before tapping through to a profile. Three variants carry the same skeleton (identity · availability · price+CTA) but signal hierarchy through visual weight.

```yaml
provider-card:
  base: "bg-card rounded-xl border border-border overflow-hidden"
  shadow: "shadow-md-soft"
  variants:
    featured:
      hero: "aspect-[4/3] object-cover w-full"
      tier-badge: "tier-a-badge (top-right overlay)"
      demonstrated-fit: "horizontal scroll of FitCards"
      use-when: "Top-ranked Tier-A with rich demonstrated-Fit history (Rashid-style)"
    standard:
      hero: "aspect-[4/3] object-cover w-full"
      tier-badge: "tier-a-badge (top-right overlay)"
      demonstrated-fit: "single inline paragraph with bold numerals"
      use-when: "Other Tier-A cards (Farzana-style)"
    tier-b:
      hero: "none — replaced with icon placeholder"
      tier-badge: "tier-b-badge (inline, near identity block)"
      demonstrated-fit: "single soft sentence, no numbers"
      opacity: "opacity-90"
      use-when: "Tier-B providers — same data surface, de-emphasized visual"
  # All variants share the same Price+CTA block at the bottom (see Sticky Action Bar for the page-level pattern).
  full-tap: "entire card wraps an <a>; the in-card Book button stops propagation to avoid double-event"
  # See 13-curated-shortlist.component.md for the full props interface and rendering rules.
```

### Demonstrated Fit Card

THE differentiator (PRD FR-21 / SM-11). A proven-care claim with a number and a label — visual proof that a Provider has handled the specific care Bibi's pet needs. Two layouts: card (scrollable strip on featured cards) and inline (condensed paragraph on standard cards).

```yaml
demonstrated-fit-card:
  card:
    layout: "flex-shrink-0 w-[140px] p-3 rounded-lg bg-muted border border-border"
    value: "tabular text-xl font-editorial font-semibold text-primary leading-none"
    label: "text-[11px] text-foreground/80 leading-snug mt-1"
    use-when: "Featured Provider Card · Provider Profile · scrollable horizontal strip"
  inline:
    layout: "inline paragraph with bold primary numerals separated by middots"
    pattern: "{value-as-bold-primary} {label}{middot} …"
    use-when: "Standard Provider Card · compact summaries"
content-rules:
  - "Every FitCard number must be a *proven* claim backed by admin-verified booking history. Never self-declared."
  - "Labels are care-specific (diabetic small dogs handled, senior pets, repeat owners, peak-window honored)."
  - "Editorial serif on the numeral adds gravitas — the number is the proof, the serif says 'this is real'."
  - "Horizontal scroll affordance uses -mx-4 px-4 to break out of the card padding and signal scrollability."
```

### Verified Review Card

The Day-1 trust differentiator (PRD FR-21 / SM-11). Photo-forward, editorial serif for the review text, tabular-nums for the rating.

```yaml
review-card:
  layout: "flex flex-col gap-4"
  photo: "rounded-md aspect-[4/3] object-cover w-full"
  rating: "tabular-nums text-base font-semibold text-primary"
  text: "font-editorial text-lg leading-relaxed text-foreground"
  attribution: "text-sm text-muted-foreground"
  # Photos are sized prominently (4:3 aspect, full width) so the trust claim is visible.
```

### Booking State Indicator

Visual marker for Booking State (PRD FR-14). Forest-green = confirmed; amber = pending; coral = acute-event; red = disputed.

```yaml
booking-state:
  requested: "bg-info-soft text-info border border-info/30"
  authorized: "bg-info-soft text-info border border-info/30"
  captured: "bg-primary-soft text-primary-soft-foreground border border-primary/20"
  in-stay: "bg-primary text-primary-foreground"
  completed: "bg-success-soft text-success border border-success/30"
  declined: "bg-warning-soft text-warning border border-warning/30"
  disputed: "bg-destructive-soft text-destructive border border-destructive/30"
  refunded: "bg-muted text-muted-foreground border border-border"
```

### Payout State Indicator

Sister component to `booking-state` — used on the Provider Payouts surface (3.10 / 5.6). Mirrors the booking-state vocabulary but with payout-domain labels and four states unique to the financial surface.

```yaml
payout-state:
  released: "bg-success-soft text-success border border-success/30"
  # Payout released to provider's MFS (bKash/Nagad/Rocket). Default "happening" state.
  pending: "bg-info-soft text-info border border-info/30"
  # Period closed, awaiting MFS settlement reconciliation.
  frozen: "bg-destructive-soft text-destructive border border-destructive/30"
  # Payout frozen due to active dispute (4.6 chains here). Provider sees paused state, no email.
  hold: "bg-warning-soft text-warning border border-warning/30"
  # Period-level hold (cycle mismatch awaiting reconciliation in 4.8). Resolves to pending or frozen.
  tabular-nums: "always — amounts must align vertically in the payout table"
```

### Availability Pill

Day-0 post-search, pre-booking signal — *can this Provider take the requested dates?* Distinct from `booking-state` (which is about a specific booking's lifecycle). Always paired with a leading colored dot in the same color tier.

```yaml
availability-pill:
  base: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
  dot: "w-1.5 h-1.5 rounded-full"   # colored per status — visual consistency with booking-state pattern
  variants:
    available: "bg-primary-soft text-primary-soft-foreground border border-primary/20"
    partial:   "bg-info-soft text-info border border-info/30"
    full:      "bg-muted text-muted-foreground/50 border border-border line-through"
  copy-rules:
    available: "Available all {N} nights"   # the duration is in the copy, not inferred
    partial:   "Available {N} of {M} nights"
    full:      "Fully booked {date-range}"
    # Always include the date span so Bibi can confirm the pill is reflecting *her* dates.
  where-used:
    - "Curated Shortlist · every Provider Card"
    - "Provider Profile · sticky bottom bar prefill"
    - "Provider Calendar · per-date cell state"
```

### Date-Level Capacity Cell

Used on the Provider Calendar (PRD FR-12). Empty / partial / full cells per date.

```yaml
capacity-cell:
  empty: "bg-muted/50 border-border text-muted-foreground"
  partial: "bg-info-soft text-info border border-info/30"
  full: "bg-muted text-muted-foreground/50 border-border line-through"
  peak: "bg-primary-soft text-primary-soft-foreground border border-primary/30"
  # Peak-window cells (Eid, December, summer) get the primary-soft treatment to surface strategic supply.
```

### Vet-Clinic Directory Entry

Compact list row, used inside the Booking flow and surfaced at Acute Event trigger (PRD FR-26 / FR-45).

```yaml
vet-clinic-entry:
  layout: "flex flex-col gap-1 p-3 border border-border rounded-md bg-card"
  name: "font-semibold text-base text-foreground"
  meta: "text-sm text-muted-foreground"   # address, hours
  action: "text-sm font-medium text-primary"
```

### Chat Bubble

Booking-scoped chat (PRD FR-44). Standard messaging pattern; Owner messages right-aligned, Provider messages left-aligned, Admin messages centered with a distinct accent.

```yaml
chat-bubble:
  owner: "bg-primary text-primary-foreground ml-auto rounded-lg rounded-br-sm max-w-[80%]"
  provider: "bg-muted text-foreground rounded-lg rounded-bl-sm max-w-[80%]"
  admin: "bg-accent-soft text-accent-soft-foreground border border-accent/20 rounded-md mx-auto max-w-[85%] text-sm"
  timestamp: "text-xs text-muted-foreground mt-1"
```

### Sticky Action Bar

The page-bottom CTA + price-summary pattern. Recurs across Booking Configuration, Booking Submission, Provider Profile, Pet Profile Editor — wherever the user has reached a "commit point" and needs the next-step action to stay visible while they scroll. **Used 6× across the corpus** (1.2, 1.5, 1.6, 1.7, 2.1, 2.2).

```yaml
sticky-action-bar:
  layout: "sticky bottom-0 z-10 bg-background/95 backdrop-blur border-t border-border px-5 py-4"
  # The backdrop-blur + opacity-95 keeps content visible underneath without distracting from the CTA.
  blocks:
    price: "tabular text-sm font-medium + text-[11px] text-muted-foreground subtotal"
    primary-cta: "button.primary, size.md or lg"
    secondary: "button.variant.link, color.destructive for cancel actions"
  variants:
    booking-config: "{price + nights} | primary 'Continue' | (no secondary)"
    booking-submit: "{authorize-hold line} | primary 'Authorize & Send Request' | link 'Back'"
    provider-profile: "{From price/night} | primary 'Book' | (no secondary)"
    pet-profile-edit: "(no price) | primary 'Save changes' | link 'Discard'"
    care-history-book-again: "(no price) | primary 'Book again' | links 'Book different provider' + 'View profile'"
    book-again-submit: "{authorize-hold line + SM-15 elapsed indicator} | primary 'Submit booking request' | link 'Save as draft'"
  # The behavioral delta — what changes between contexts — is in EXPERIENCE.md.
```

### Toggle (Primary-Soft)

The "Use saved" pattern from 1.6 / 2.2 (Booking Configuration pre-fill): a switch that lets the Owner flip between "use the value from Care History" and "edit this for this booking." Uses the primary-soft palette when on (forest tint, not solid forest — softer than the primary button).

```yaml
toggle:
  base: "inline-flex items-center gap-2 cursor-pointer"
  variants:
    primary-soft:
      on: "bg-primary-soft border border-primary/30 rounded-full w-9 h-5 relative"
      on-knob: "bg-primary translate-x-4"
      off: "bg-muted border border-border rounded-full w-9 h-5 relative"
      off-knob: "bg-muted-foreground/50 translate-x-0"
      # Knob is a 16px circle that slides within the 36×20 track. Smooth 150ms transition.
    a11y:
      role: "switch"
      aria-checked: "reflects state"
      label: "always paired with descriptive text — never standalone"
      focus: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  where-used:
    - "Booking Configuration (1.6) — 'Use saved' on each pre-filled axis"
    - "Book Again Path (2.2) — pre-fill toggles per care axis (5 axes: insulin / diet / anxiety / instructions / vet)"
    - "Notifications (5.10) — notification channel + type toggles"
```

### Queue Dashboard Row

Used in the Admin Console (PRD FR-32). Priority-ordered, dense, with inline flags.

```yaml
queue-row:
  layout: "grid grid-cols-[2rem_1fr_8rem_6rem_6rem] gap-4 items-center px-4 py-3 border-b border-border hover:bg-muted/50"
  priority: "tabular-nums text-sm font-semibold"
  # Priority 1 = Acute (coral badge), 2 = Dispute (red badge), 3 = Awaiting (amber), 4 = In-Stay (forest)
  summary: "text-sm font-medium text-foreground"
  provider: "text-sm text-muted-foreground"
  neighborhood: "text-xs text-muted-foreground tabular-nums"
  age: "text-xs text-muted-foreground tabular-nums"
```

### Pattern Detection Card

The Post-Mortem Practice Log (4.9) surfaces correlated post-mortems with a CTA "Apply to runbook v[N+1]". Pattern cards show the trigger shape (category + frequency) and the proposed next-version runbook step, letting the Admin choose whether to fold the lesson back into the canonical runbook.

```yaml
pattern-detection-card:
  layout: "card.muted with elevated inner CTA"
  header: "text-xs uppercase tracking-wide text-muted-foreground + category glyph"
  # e.g., "Hypoglycemia overnight · 3 occurrences in 90 days"
  body: "text-sm text-foreground — short narrative of the pattern (1-2 sentences)"
  metric: "tabular-nums text-base font-semibold text-primary"
  # e.g., "3× · median 11pm · all Tier-A providers"
  cta: "button.variant.link 'Apply to runbook v[N+1]' — opens Apply form, not inline"
  where-used:
    - "4.9 Post-Mortem Practice Log · pattern detection row"
    - "4.10 Defection Dashboard · trending pattern banner (cross-link)"
    - "4.2 Acute Event Runbook · post-event pattern suggestion (Step 7 → 4.9)"
```

### SM-C3 Protection Banner

The Review Moderation Queue (4.7) declares **explicitly** that star-rating optimization is NOT a moderation goal. This banner is the structural answer to SM-C3 (the counter-metric against optimizing for averages). Surfaced prominently so the Admin and any future stakeholder see the policy before the queue.

```yaml
sm-c3-banner:
  layout: "border-l-4 border-warning bg-warning-soft px-4 py-3"
  content:
    headline: "text-sm font-semibold text-foreground"
    # "Star-rating optimization is NOT a moderation goal."
    body: "text-sm text-muted-foreground"
    # "Reviews are moderated for cause — not averaged. Critical reviews stay visible if factually accurate."
  placement: "top of Review Moderation Queue (4.7), persistent until dismissed"
  voice: "policy-rigor tone, no pressure language"
  where-used:
    - "4.7 Review Moderation Queue · primary placement"
    - "5.4 Review Moderation Result (Owner view) · summary banner"
```

### Counter-Metric Header Card

The Defection Detection Dashboard (5.8) — and by extension 4.10 — surfaces three counter-metrics at the top of the dashboard as a 3-card elevated header. The metrics are SM-C1 / SM-C2 / SM-C5 from the PRD, and their visibility is the structural answer to "are we protecting the moat?"

```yaml
counter-metric-header:
  layout: "grid grid-cols-3 gap-4"
  card: "card.elevated px-4 py-3"
  metric-id: "text-xs uppercase tracking-wide text-muted-foreground"
  # e.g., "SM-C1 · Platform-Booking Share"
  value: "tabular-nums text-2xl font-editorial font-semibold text-foreground"
  # e.g., "73%"
  state:
    healthy: "success-soft left-border + status pill '✓ Healthy'"
    warning: "warning-soft left-border + status pill '⚠ Watch'"
    breached: "destructive-soft left-border + status pill '🔴 Breached'"
  where-used:
    - "5.8 Defection Detection Dashboard · D2 header (primary placement)"
    - "4.10 Off-Platform Defection Detection Dashboard · top banner (mirror)"
```

### Defection Signal Dot

The Defection Dashboard (4.10 / 5.8) surfaces signal categories (Owner · Provider · Cross) with a privacy-respecting dot pattern. Aggregate only — no individual-owner or individual-provider signals ever surface here.

```yaml
defection-signal-dot:
  base: "w-2 h-2 rounded-full"
  variants:
    owner: "bg-warning"
    # Owner-initiated defection signal (e.g., profile-view without booking)
    provider: "bg-accent"
    # Provider-initiated defection signal (e.g., capacity-locked but profile-updated)
    cross: "bg-destructive"
    # Cross-group signal (e.g., review left off-platform, pattern in WhatsApp mention)
  placement: "inline with category label in signal row"
  privacy: "always aggregate — no individual user identifier ever renders at this scale"
  where-used:
    - "4.10 / 5.8 defection signal rows"
    - "5.8 trending banner (composition: warning + accent + destructive dots)"
```

### Acute-Event Trigger Banner

The structural answer to acute-event responsibility (PRD FR-26 → FR-30, R-10 launch-blocking). Surfaces on Provider in-stay management (3.5/3.6) and provider trigger surface (5.7). The banner is destructive-soft because the action underneath is consequential — but the copy is calm, never panic-CTA.

```yaml
acute-event-trigger:
  layout: "border-l-4 border-destructive bg-destructive-soft px-4 py-3 flex items-center justify-between"
  copy:
    headline: "text-sm font-semibold text-foreground"
    # "If something is wrong, tap here."
    subhead: "text-xs text-muted-foreground"
    # "We'll notify the owner and start the runbook. Vet directory is on the next step."
  cta: "button.variant.destructive, size.sm"
  where-used:
    - "3.5 In-Stay Management · D7 persistent banner"
    - "3.6 Daily Update Composer · concerning-helper inline link"
    - "5.7 Acute-Event Trigger Surface · full trigger form"
  helper:
    layout: "inline link, warning-soft background, leading glyph '⚠'"
    copy: "Concerning? See acute-event runbook."
    # The helper is a *link*, not a CTA banner — the daily update posts regardless.
```

### Care Configuration Field Group

Used in the Booking Configuration flow (PRD FR-15). Section header + grouped fields with helper text.

```yaml
care-config-section:
  header: "text-lg font-semibold text-foreground mb-1"
  helper: "text-sm text-muted-foreground mb-4"
  fields: "space-y-4"
  # Sections in the Booking Configuration:
  # - Dates (date picker)
  # - Pet profile (read-only summary + edit)
  # - Food & dietary notes (text + select)
  # - Medication (text + select)
  # - Care flags (multi-select chips: anxiety, senior, allergies)
  # - Free-text instructions (textarea)
```

### Error State Illustrations

Six reusable error-state templates per Scenario 05 / 5.11. Each carries an illustration (CSS-rendered geometric, not cartoon), a short title, a factual body, and one or two CTAs. Brief §5 risk #14 (load-shedding) and Brief §3 (perf envelope) shape the constraint.

```yaml
error-state:
  illustration: "CSS-only geometric — never cartoon, never paw-prints, never gradient"
  title: "text-lg font-editorial font-semibold text-foreground"
  body: "text-sm text-muted-foreground"
  # Body names cause and next step — never "Oops!" or "Something went wrong."
  primary-cta: "button.primary, size.md"
  secondary-cta: "button.variant.secondary, size.md"
  templates:
    capacity-exhausted:
      title: "No providers available for these dates."
      body: "Try a wider date range or a different neighborhood."
      cta-primary: "Adjust dates"
      cta-secondary: "Notify me when available"
    timeout:
      title: "This is taking longer than usual."
      body: "Check your connection — we'll save your progress when you're back."
      cta-primary: "Try again"
      cta-secondary: "Save progress"
    payment-fail:
      title: "We couldn't authorize payment."
      body: "Try bKash again, or use a card."
      cta-primary: "Retry bKash"
      cta-secondary: "Use a card"
    dispute-window-expired:
      title: "The 7-day report window has closed."
      body: "Reviews and disputes are independent records. You can still leave a review."
      cta-primary: "Leave a review"
      cta-secondary: "Back to booking"
    network-error:
      title: "We can't reach PetCare right now."
      body: "Your selection is saved locally. We'll send the booking when you're back online."
      cta-primary: "Try again"
      cta-secondary: "View saved booking"
    load-shedding:
      title: "Slow connection detected."
      body: "We've turned off photos to keep things fast. Turn them back on when you're ready."
      cta-primary: "Turn on photos"
      cta-secondary: "Continue without"
  voice-discipline: "factual, no blame, no 'sorry', no exclamation marks — the brand voice stays calm under failure"
```

## Do's and Don'ts

### Do

- **Use the cream/ivory base (`bg-background`) for all page surfaces.** White is reserved for cards.
- **Use forest green for trust signals and primary actions only.** If something is green, it must be a meaningful state (Tier-A, Verified Review, captured booking, focus ring).
- **Give photographs room to breathe.** Verified Review photos and Provider Profile photos get generous aspect ratios (4:3, 16:9) and minimal decoration.
- **Use the editorial serif (Source Serif 4) for hero headers and Verified Review quotes.** This is where the warmth comes from.
- **Use tabular-nums on all numbers displayed in lists and tables.** Ratings, prices, counts, ages — all align.
- **Stack Care Configuration fields vertically with generous spacing.** Care input is not a check-out flow; treat it with seriousness.
- **Surface the Tier-A badge and Verified Review indicators prominently.** These are the trust signals — they should never be below the fold.
- **Show the booking state with the Booking State Indicator pattern.** Owners and Providers should always know where their booking is.
- **Use the coral accent only for acute-event and care-status.** It is reserved, meaningful, and visible at a glance.
- **Respect the 8-point grid.** All spacing uses the documented tokens; do not introduce ad-hoc values.
- **Use the Sticky Action Bar at every commit point.** Booking Configuration, Submission, Book-Again Path, Provider Profile, Pet Profile Editor — all use the same sticky bottom CTA + price-summary pattern.
- **Use toggle.primary-soft for "Use saved" pre-fill switches.** The primary-soft palette distinguishes "use saved" from "primary action"; forest-green solid is reserved for primary CTAs only.
- **Surface counter-metrics prominently on the Defection Dashboard.** SM-C1/C2/C5 are the structural answer to "is the moat holding?" — they belong at the top, not in a footer.
- **Keep the SM-C3 banner persistent.** Star-rating optimization is NOT a moderation goal; the policy banner is the structural enforcement of that principle.
- **Aggregate-only at the Defection Dashboard.** Individual user signals never render at this scale — privacy boundary is structural, not procedural.

### Don't

- **Don't use decorative green.** Forest green is semantic — primary actions, trust signals, captured bookings. Never used for headings, dividers, or "lifestyle" decoration.
- **Don't use coral for non-care/non-acute contexts.** It loses meaning if scattered through the system.
- **Don't use pure black.** Foreground is `hsl(30 12% 14%)` — a warm charcoal. Pure black reads as cold against the cream palette.
- **Don't use pure white for page background.** The cream background gives the system warmth; white is reserved for cards so they stand out.
- **Don't use shadows as a substitute for color contrast.** Cards lift off the page through the white-on-cream contrast; shadows are layered on top, never used alone.
- **Don't use cartoon illustrations or paw-print motifs.** The system is calm and premium, not playful. Error-state illustrations are CSS geometric only.
- **Don't use gradient backgrounds.** Solid colors only. Gradients read as marketing-deck polish, not trustworthy product.
- **Don't break the 8-point grid for "tightness".** Density comes from smaller component padding, not ad-hoc margins.
- **Don't introduce a fourth state color.** Status is forest (success/primary), amber (warning), red (destructive), sky (info). No pink, no purple, no teal — the system stays restrained.
- **Don't replace the focus ring with a shadow.** Keyboard users get the ring; mouse users get both. Never silently drop the ring for visual cleanliness.
- **Don't render dense data without tabular-nums.** Numbers must align — ratings, prices, counts, ages, elapsed-time indicators, counter-metrics.
- **Don't use uppercase for body text.** Uppercase is reserved for badges, labels, and small caps — never for body copy.
- **Don't introduce animation beyond functional feedback.** Subtle transitions on hover and focus are fine; decorative animation breaks the calm.
- **Don't panic-CTA the Acute Event trigger.** The banner is destructive-soft for visual weight, but the copy is calm. Never "URGENT" or exclamation marks.
- **Don't optimize review moderation for star ratings.** SM-C3 is the counter-metric — averaging critical reviews away is the failure mode the banner prevents.
- **Don't surface individual defection signals at the dashboard scale.** Aggregate-only is a structural privacy boundary, not a permissions setting.

## Notes

- **Bangla readiness (PRD FR-47):** the font stack includes `Noto Sans Bengali` / `Noto Serif Bengali` fallbacks. No Bangla-specific tokens are needed in v1; the system handles script coverage through typography. When Bangla UI ships, the only changes are copy translation + a language-switch surface; no design-system rework.
- **Dark mode:** not in v1. The system is designed for theme-extensibility (every color is a CSS variable), so a future dark mode could extend the tokens without reworking components. Out of scope for the demo.
- **Print styles:** not in v1. Out of scope.
- **Motion:** functional only — hover, focus, and state transitions. No decorative motion. PRD NFR-1 (500KB initial payload, 3s TTI) and NFR-15 (low-end Android, intermittent connectivity) constrain what motion is feasible anyway.
