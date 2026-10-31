# STEP 33: UI/UX validation

Method: `tests/e2e/ui-capture.spec.ts` (run with `UI_CAPTURE=1`) opens each mockup from `docs/ux/mockups/` and the running application in the same state, and takes full-page screenshots. `<screen>-comparison.png` shows the mockup on the left and the application on the right. The application screenshots are the Bangla default at a 390 px phone width; the three admin screens are at 1280 px. The phone frame and status bar in a mockup are presentation chrome, not part of the product. Long pages are cropped to the first 2,400 px in the comparison images; the full captures are in `app/` and `mockup/`.

## What matches the supplied UI/UX

| Area | Result |
|------|--------|
| Colours | Tokens from DESIGN.md (forest green primary, warm neutrals). Coral appears only for acute events: the owner's acute banner, the provider's "reported" notice and the acute badge. The contrast check (`npm run check:contrast`) passes for 18 colour pairs at WCAG 2.1 AA. |
| Typography | Inter for Latin, Noto Sans Bengali for Bangla, Source Serif 4 (and Noto Serif Bengali) for the brand and headings (`tokens.css`, `fonts.css`). |
| Language | Bangla is the default and English is at parity: 553 messages in each language, enforced by `npm run check:i18n`. Admin screens are English only, as specified. |
| Units and currency | All money is BDT with the taka sign and Latin digits (for example ৳2,500 per night, ৳20,000 for 8 nights); amounts are whole poisha underneath. |
| Booking lifecycle | One state-driven booking page per role with the same state pill everywhere: waiting, confirmed, in stay, completed, declined, canceled, no-show, reported, resolved, refunded. |
| Care history and Book again | Care history tab on the pet page; Book again from Home, the bookings list and the booking page, pre-filled and marked "from Tito's last stay" with an elapsed timer. |
| Admin queue and runbook | Urgency-sorted queue; runbook with seven steps, timers, vet clinics, Bangla and English owner message and a post-mortem. |
| Accessibility | Every screen above has an axe scan with zero WCAG 2.1 AA violations in the browser tests. |

## Differences, with reasons

| Screen (mockup) | Difference in the application | Reason |
|-----------------|-------------------------------|--------|
| `01-home` | The signed-in home shows the promise, how it works, the search form and a Book again card; it has no "4.9 average" or provider counts. | Mockup numbers are invented (DR-15, PRODUCT.md rule 7): trust numbers only come from real completed bookings. |
| `02-search-results` | Superseded: the application uses the curated shortlist screen. | The brief and ui-analysis mark `02` as superseded by `13`. |
| `13-curated-shortlist` | No "Save" search, filter chips, sort control, photo header, rating, review count, "repeat owners", "years hosting" or distance (km). Each card shows the provider, the Tier-A badge, the reason line (tier, neighbourhood, free every night) and the price. | Saved searches are out of scope (BKG story edge case); ratings and counts are not shipped as data; distance and care-fit ranking are forbidden in v1 (FR-11, DR-6). The reason line is the "why shown" requirement. |
| `13` and `03` badge wording | The Tier-A badge reads "PetCare-এর পরিচিত" ("Introduced by PetCare") with an accessible name, not "Tier-A · Admin-vetted". | Approved wording for the Admin-introduced badge (SUP-04). |
| `03-provider-profile` | The page has about, species, capacity, "good to know" flags and an availability message for the chosen dates; it has no month capacity calendar, "demonstrated experience" statistics, rating or verified-stay count, and no photo header (a photos section says "no photos yet"). | Capacity calendar is the provider's tool (P2); statistics and ratings are not shipped as data; provider photos are not part of the v1 profile editor. Reviews appear below when real ones exist. |
| `04-booking-configuration` | Two short steps (pet and dates, then care plan) with a stepper and "use the saved care plan"; no services or add-on prices. | The seed has no service or add-on data and inventing prices is forbidden; the care plan comes from the pet profile (BKG-02). |
| `17-booking-submission-payment` | bKash and Nagad first, card second; breakdown is nights x price and a total; cancellation rule and "you are only charged when the provider confirms" shown. No service lines and no gateway fee line. | Services not offered; gateway fees are not modelled (TD-16). |
| `05-booking-confirmation` | The page is one state-driven booking page; waiting state shows "Waiting for Rashid", the deadline and the hold. | One-booking-one-page experience blueprint; the mockup shows only the confirmed state. |
| `15-pet-profile-management` | One long form with species-specific fields, a medicine repeater, vet details and photos with progress and retry. | Same content as spec 1.5; layout adapted to a single scrolling form with a sticky save bar. |
| `21-care-history-view` | A tab on the pet page listing stays with outcome and dates; first-stay empty message. | Care history is written by real bookings only; entries show dates and outcome rather than invented provider statistics. |
| `22-book-again-path` | Pre-filled Book flow with a note and a running timer; no "faster than first booking" claim. | Needs both times for the same owner (UC-16); not shown without them. |
| `07-provider-calendar` | A two-week list of nights with capacity, booked count, status and note, a set-capacity form and the peak prompt. | Simpler than the month grid; it covers every acceptance criterion (set capacity for chosen nights, full, closed, peak) and works with a keyboard and a screen reader. |
| `35-in-stay-management` | The provider's in-stay page puts the request summary and care plan first, then the update form and the posted updates; there is no "Day 4 of 9" progress, glucose tag or chat button. | Booking chat is a deferred feature; the daily care log fields are medicine, food and mood; progress and glucose chips were not in the accepted stories. |
| `36-daily-update-composer` | The composer is a card on the in-stay page (note, food, mood, medicines, up to 4 photos), not a modal. | A plain card works without scripts to open it and with the keyboard; same fields as BKG-12. |
| `57-acute-event-trigger` and `08-acute-event` | The provider's "Report a concern" is a sheet with type, severity and observation; vet clinics are on the same page. The owner sees a calm coral banner plus any admin message. No countdown or "call now" overlay. | Matches ACU-01 and ACU-02; the SMS-style notification is deferred, the in-app banner is the notice. |
| `42-acute-event-runbook` | Seven runbook steps with done, skipped and pending, timers, owner message buttons (Bangla and English), vet clinics, resolve and post-mortem form, in a sidebar layout at 1280 px. | Same steps as ACU-03; no phone-call logging or live chat because chat is deferred. |
| `06-admin-queue` | A sidebar and rows (kind, title, detail) with two count links; the mockup has KPI tiles (acute, dispute, vetting, in-stay, payouts today), "operating at 87 % of ceiling" in the header, owner, provider and neighbourhood columns, elapsed times, filter, sort and paging. The ceiling shows as a banner only from 80 % and on Insights. | Simplest workable queue that meets ADM-01 (order, counts, one-tap detail, empty state, provider flags). Tiles, columns, elapsed times, filter and paging are not required by an accepted story and are left for later. |
| `47-review-moderation-queue` | List of recent reviews with a removal reason and the "do not remove for being negative" reminder; no sort, filter or batch actions. | Matches REV-03; extra queue controls are not in the story. |

## Screens with no mockup (spec-only) that were built from the page specs

Sign-in (1.2), owner bookings list, provider Today and request view (3.1, 3.3, 3.4), booking completion (3.7), provider profile editor and care record (3.8, 3.9), earnings (3.10), admin provider list and vetting, payouts, audit log, insights. Their content follows the page-spec blocks in `memory-bank/intents/001-petcare-v1/ui-analysis.md`.

## Not built (deferred, recorded in `memory-bank/deferred-scope.md`)

Booking chat, the notification system and inbox, real email, SMS and OTP delivery, notification choices in Settings, and account closure with OTP re-verification. Where a mockup shows these, the screen omits them.

## Verdict

The application reproduces the design system, language, currency, lifecycle and the accepted behaviour of every mockup. It intentionally leaves out invented statistics, ratings, distances and the chat. The remaining visual differences are the simpler admin queue layout and the simpler calendar and profile layouts, listed above, none of which removes an accepted behaviour.
