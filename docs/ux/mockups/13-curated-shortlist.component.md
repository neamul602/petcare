# 1.3 · Component Spec — Curated 3–5 Shortlist

> Companion file to `13-curated-shortlist.html` (mobile demo) and `1.3-curated-shortlist.spec.md` (page spec).
> This document is the developer-handoff reference for translating the demo into a production component.

---

## 1. Stack assumptions

- **Framework:** shadcn/ui + Tailwind CSS (per DESIGN.md · shadcn-derived tokens)
- **Font loading:** Inter + Source Serif 4 via `next/font` or `@fontsource` · Noto Sans Bengali as Bangla fallback
- **Backend contract:** `GET /api/search?location=&species=&start=&end=&special=` returning `SearchResult[]`
- **A11y primitives:** all chips / pills / toggles built on shadcn `<Toggle>`, `<Badge>`, or custom with ARIA

---

## 2. Top-level component

```tsx
// src/app/search/page.tsx
import { CuratedShortlist } from '@/components/shortlist';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { location?: string; species?: string; start?: string; end?: string; special?: string };
}) {
  const initialResults = await fetchSearchResults(searchParams);
  return <CuratedShortlist initialResults={initialResults} initialQuery={searchParams} />;
}
```

---

## 3. Component tree

```
<CuratedShortlist>
 ├ <ShortlistTopBar />           // D1 — back / title / save-search
 ├ <StickyFilterBar />           // D2 — summary chip + filter chips
 ├ <ResultCountSortRow />        //   — count + sort selector
 └ <Shortlist>
     ├ <ProviderCard featured /> // D3 — Rashid-style fully-expanded
     ├ <ProviderCard />          //   — Farzana-style condensed
     ├ <ProviderCard tierB />    //   — Kamrul-style de-emphasized
     └ <FullCatalogCTA />
```

---

## 4. ProviderCard variants — props interface

```tsx
type ProviderCardProps = {
  provider: Provider;
  variant?: 'featured' | 'standard' | 'tier-b';
  onBook: (providerId: string) => void;
};

type Provider = {
  id: string;
  slug: string;
  name: string;
  tier: 'A' | 'B';
  neighborhood: string;
  distanceKm: number;
  photo: { src: string; alt: string };
  rating: number;
  reviewCount: number;
  availability: { status: 'available' | 'partial' | 'full'; nightsMatched: number; nightsTotal: number };
  stats: { yearsHosting: number; repeatOwners: number };
  demonstratedFit: Array<{ value: number | string; label: string }>;
  pricePerNight: number;        // BDT
  totalNights: number;
  isAdminVetted: boolean;
};
```

| Variant | When | Visual delta |
|---------|------|--------------|
| `featured` | Top-ranked Tier-A with rich demonstrated-Fit history | Aspect 4:3 hero, full fit-card row (horizontal scroll), shadow-md-soft, prominent tier-A badge top-right |
| `standard` | Other Tier-A cards | Same hero proportions, fit condensed to single inline line |
| `tier-b` | Lower tier | No photo (replaced with icon placeholder), `opacity-90`, `bg-muted` Tier-B badge — visual de-emphasis signals Tier |

---

## 5. Demonstrated-Fit rendering

The `demonstratedFit` array drives two layouts:

- **Featured cards:** horizontal scroll of `<FitCard>` (140px wide · radius-lg · `bg-muted` · `tabular` numerals)
- **Standard cards:** single inline paragraph with `<strong>` numerals

```tsx
// Featured layout
<div className="mt-3 flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
  {provider.demonstratedFit.map((fit, i) => (
    <FitCard key={i} value={fit.value} label={fit.label} />
  ))}
</div>

// Standard layout
<p className="text-xs text-foreground/80 mt-2 leading-relaxed">
  {provider.demonstratedFit.map((fit, i) => (
    <span key={i}>
      <span className="tabular font-medium text-primary">{fit.value}</span> {fit.label}
      {i < provider.demonstratedFit.length - 1 ? ' · ' : ''}
    </span>
  ))}
</p>
```

---

## 6. Sticky filter bar (D2)

```tsx
<div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b border-border">
  <SummaryChip query={query} onEdit={openFilterModal} />
  <HorizontalChipsScroll>
    {filters.map(f => (
      <FilterChip
        key={f.id}
        label={f.label}
        selected={f.selected}
        onToggle={() => updateFilter(f.id)}
      />
    ))}
  </HorizontalChipsScroll>
</div>
```

- `SummaryChip` is a full-width pill (`bg-muted`) · 44px tall
- Filter chips:
  - **Selected:** `bg-primary-soft text-primary-soft-foreground border-primary/20` + check icon
  - **Unselected:** `bg-muted text-foreground/80 border-border`
  - Hover: subtle inner shift (no scale to avoid jitter)
- Horizontal scroll: `overflow-x-auto` with negative margin for edge-to-edge scroll affordance

---

## 7. Availability pill (booking-state pattern)

```tsx
type AvailabilityStatus = 'available' | 'partial' | 'full';

const pillStyles: Record<AvailabilityStatus, string> = {
  available: 'bg-primary-soft text-primary-soft-foreground border-primary/20',
  partial:   'bg-info-soft text-info border-info/30',
  full:      'bg-muted text-muted-foreground/50 border-border line-through',
};

const dotStyles: Record<AvailabilityStatus, string> = {
  available: 'bg-primary',
  partial:   'bg-info',
  full:      'bg-muted-foreground/40',
};
```

The pill is always paired with a leading dot in the same color tier — visual consistency with `booking-state-indicator` in DESIGN.md.

---

## 8. Tier-A badge

Hard-coded since Tier-A is admin-vetted and rarely changes:

```tsx
<span className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-soft-foreground tracking-wide">
  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
  Tier-A · Admin-vetted
</span>
```

The doubled-border + full-radius + forest-green-soft combination is the trust signal reserved for Tier-A only. Tier-B uses a different pattern (`bg-muted text-muted-foreground`).

---

## 9. Price + CTA block

```tsx
<div className="mt-4 pt-4 border-t border-border flex items-end justify-between gap-3">
  <div>
    <p className="tabular text-sm font-medium">
      BDT {pricePerNight.toLocaleString('en-BD')}
      <span className="text-muted-foreground text-xs font-normal"> / night</span>
    </p>
    <p className="tabular text-[11px] text-muted-foreground mt-0.5">
      {nights} nights = BDT {total.toLocaleString('en-BD')}
    </p>
  </div>
  <Button variant="primary" size="md" onClick={() => onBook(provider.id)}>
    Book
    <span aria-hidden>→</span>
  </Button>
</div>
```

`tabular-nums` on every number · `text-sm font-medium` line + `text-[11px]` subtotal · CTA matches DESIGN.md button.primary/medium.

---

## 10. Full-card tap target

Entire `<ProviderCard>` is wrapped in a single `<a href={`/providers/${provider.slug}`}>` — server-side route hit on tap. The "Book" button inside also routes to the same URL but stops propagation to avoid double-event.

```tsx
<a href={`/providers/${slug}`} className="block">
  <Card>...</Card>
</a>

// Inside card:
<button onClick={(e) => { e.preventDefault(); router.push(`/providers/${slug}`); }}>Book →</button>
```

---

## 11. State management

```tsx
// Zustand slice or React useReducer — depends on app architecture
type ShortlistState = {
  query: SearchQuery;                        // holds location, species, dates, special
  filters: Filter[];                         // chip toggles
  sort: SortMode;                            // 'tier-a-first' | 'fit-first' | 'closest' | 'price-asc'
  results: Provider[];
  loadingState: 'idle' | 'loading' | 'skeleton' | 'cached' | 'error';
  capacityInvalidatedAt?: number;            // timestamp of last capacity diff
};
```

Re-query triggers:
- Filter chip toggle (debounced 300ms)
- Sort change (immediate)
- Capacity polling (30s)
- Window focus (re-validate)

---

## 12. Loading / skeleton / error states

| State | UI |
|-------|-----|
| Initial load | 4 skeleton cards (same height, shimmer, no real content) |
| Filter change | Same card heights, dim existing + spin small badge "Updating…" |
| Cached (slow network) | Top banner: "Connection slow — showing cached results from 2 min ago" · [Retry] |
| Empty (zero results) | Friendly empty state + "See full approved catalog" CTA |
| Error | Inline banner + retry · no full-screen modals |

---

## 13. Accessibility checklist

- [ ] All chips are `role="button"` with `aria-pressed` reflecting toggle state
- [ ] Filter chip toggle is keyboard-operable (Space + Enter)
- [ ] Provider cards: `<article>` semantic · `<a>` wrapping · focus ring `{elevation.ring}`
- [ ] Fit cards: `<button>` with `aria-label` describing the proven claim ("12 diabetic small dogs handled successfully")
- [ ] Rating: `aria-label="4.9 stars"` · digits visible to all
- [ ] Photo alt: descriptive (e.g. "Rashid's Gulshan home, dedicated pet room visible") — never empty, never PII
- [ ] Booking-state pill: `aria-label="Available all 9 nights of your requested dates"`
- [ ] Sort selector: native `<select>` · keyboard-friendly
- [ ] Skeleton loaders: `role="status" aria-label="Loading providers"`
- [ ] Tap targets: all CTAs ≥48px (featured CTA = 40px button matches FAB pattern — verify if any smaller)

---

## 14. Performance budget

- **First paint:** <1.5s on low-end Android (NFR-15) · hero cards lazy-load below 16:9 fold
- **JS payload:** <200KB for shortlist route (excluding shadcn baseline)
- **Re-render budget:** state changes should re-render only changed cards (key by `provider.id`, not index)
- **Image strategy:** WebP · 4:3 hero photo · 320×240 mobile / 480×360 tablet

---

## 15. Analytics events

- `shortlist_viewed` on page mount with `data-result-count` and active filters in payload
- `provider_card_tapped` with `provider.id`, `position` (1-4), `tier`
- `fit_card_tapped` with `provider.id`, `fit.label`
- `book_button_tapped` (same as card tap but explicit button hit) with `provider.id`, `position`
- `full_catalog_clicked`
- `filter_chip_toggled` with `filter.id`, `state` ('on' | 'off')
- `sort_changed` with `from`, `to`

---

## 16. i18n

All copy tokens live in `messages/en.json` and `messages/bn.json`:

```json
{
  "shortlist": {
    "title": "Search",
    "results_count": "{count} providers match your search",
    "sort_default": "Tier-A first",
    "fit_section_title": "Demonstrated experience",
    "fit_section_subtitle": "What {name} has actually handled well",
    "cta": "Book",
    "view_all": "View all {count} approved providers"
  }
}
```

`bn` translations per `1.3-curated-shortlist.spec.md` Content Blocks.

---

## 17. Test coverage matrix

| Test | Type |
|------|------|
| 4 providers render with correct badges | Unit |
| Sort changes re-order cards | Unit |
| Filter chip toggle re-queries | Integration |
| Empty state shows when zero providers | Integration |
| Card tap navigates to provider profile | E2E |
| Book button stops event propagation | Unit |
| Available pill renders correct style per status | Unit |
| Tier-A badge uses prescribed token classes | Visual regression (Chromatic/Percy) |
| Mobiles-only horizontal scroll for fit-cards works | E2E (Playwright mobile viewport) |
| Skeleton cards match real-card height | Visual |

---

## 18. Reconcile notes vs existing `02-search-results.html`

The prior BMM mockup (`_bmad-output/.../mockups/02-search-results.html`) maps the same page but:
- Uses different content (Mar 28 / Gulshan baseline) — **replaced with Bibi's Eid-week + Banani**
- Includes a date-level capacity mini-strip in the featured card — **removed** from this build (it belongs on the Provider Profile or Capacity Calendar, not here; the availability pill carries enough signal pre-tap)
- Tier-B card layout kept consistent (de-emphasized style preserved)
- New in this build: full demonstrated-Fit horizontal scroll on featured card, sticky filter chips with toggle state, save-search button in top bar

The two are compatible — visual hierarchy and trust-signal placement are unchanged. New build extends, doesn't replace.
