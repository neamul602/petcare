# UI Analysis - Scenario 01: Bibi's First Eid Booking with Tito

Scope: `docs/scenarios/01-bibis-first-eid-booking/` (scenario .md, pages 1.1 to 1.8, each `<id>.md` outline plus `<id>.spec.md`, plus `_validation-report.md`). Mockups read from `docs/ux/mockups/`. Cross-checked against `docs/prd.md` (FR/NFR/UJ/OQ IDs), `docs/ux/DESIGN.md` and `docs/ux/EXPERIENCE.md`.

Conventions in this file:
- "Spec" = the `.spec.md`; "Outline" = the page `.md`. Where they disagree, the Spec wins, and the disagreement is listed.
- "(inferred)" marks anything not stated in the sources.
- PRD IDs are the PRD's real IDs. The specs cite many FR numbers that do NOT match the PRD's numbering (see Section 0, G-1). Where the spec cites a number, it is shown as "spec cites FR-x"; the correct PRD mapping is shown as "PRD FR-y".
- All sample values (Rashid, Tito, BDT 2,200, 47 reviews, etc.) are fixture/story data from the scenario, not facts. Section D lists every one.
- Scope reminder: the Spec statuses say `validated`, but the validation report overall verdict is `needs_work` with 1 critical, 7 warnings (the critical 1.3 frontmatter fix is recorded as applied). No page has been built (`design_status: not-started` on the scenario).

---

## 0. Cross-cutting findings (read first)

### 0.1 Scenario-level facts
- Persona: Bibi (Owner role, only role in this scenario). Provider "Rashid" appears only as a displayed entity; no provider-role or admin-role screens are in scope.
- Format: mobile PWA, 390px source design width, mid-range Android (NFR-14, NFR-15, FR-46).
- Linear path (scenario Q8): 1.1 Landing, 1.2 Sign-in, 1.3 Shortlist, 1.4 Provider profile, 1.5 Pet profile, 1.6 Booking config, 1.7 Review + payment, 1.8 Waiting confirmation.
- Climax metric: submit-to-confirmed under 10 minutes (PRD UJ-1 baseline; scenario Q7/metadata). Note that the 8-page path ends at "request sent / waiting", not "confirmed"; the scenario text says "submits a confirmed booking" but the booking is only `authorized` at 1.8 (gap G-24).
- Scenario front-matter says `pages_assigned: 11` and `pages: [1, 2, 3, 4, 6, 7, 9, 10, 11, 41]` (10 numbers) while only 8 page folders exist and the metadata table says "11 (8 in the linear path, 3 supporting touch-points)". Three supporting pages are not specified in this folder (inferred: dashboard, reviews list, full catalog - see G-23).

### 0.2 Global gaps found in this scenario (numbered, referenced from the page blocks)

| # | Gap / conflict | Where | Severity |
|---|---|---|---|
| G-1 | Spec FR citations do not match PRD numbering. Examples: spec cites FR-11 as "curated shortlist" (correct: PRD FR-11), FR-13 as "Launch Neighborhood filter" (correct), but FR-19 as "Tier-A admin-introduced badge" (PRD FR-19 is Booking Completion and Capture-to-Payout; badge is PRD FR-5/FR-1), FR-21 as "verified reviews with photos" (PRD FR-21 is review content; OK-ish), FR-43 / FR-44 as "per-species / per-care-need handling history" (PRD FR-43 is Daily Updates, FR-44 is Booking-scoped Chat), FR-49 as "demonstrated-care-fit entries" (PRD FR-49 is Provider-side repeat tooling), FR-17 as "payment authorization" (PRD FR-17 is Structured Decline; authorization is FR-15), FR-18 as "capture-on-confirmation" (PRD FR-18 is Stay/SLA; capture timing is FR-39), FR-24 as "structured decline" (PRD FR-24 is Report an Issue; decline is FR-17), FR-16 as "included for medical cases" (PRD FR-16 is Provider Confirmation), FR-20/FR-26 as provider confirmation / chat (PRD FR-20 is review gating, FR-26 is acute trigger), FR-15 as "daily update reminders" (PRD FR-15 is request submission + authorization), FR-1/FR-2 as "booking lifecycle / structured intake" (PRD FR-1 is Tiered supply, FR-2 is Admin vetting). | all specs, "Connection to Trigger Map" and inline | High (traceability). Requirements must be traced to PRD IDs below, not the spec's. |
| G-2 | PRD NFR-26 / FR-11: v1 ranking is Tier + Launch Neighborhood density + Date-Level Capacity only; Demonstrated Care Fit is "captured but not consumed for v1 ranking". The scenario/1.3 story ("ranked by demonstrated-Fit", sort "Demonstrated-Fit first") contradicts this. Display of demonstrated-Fit as proof text is not forbidden, but fit-based ordering is. | 1.3 outline purpose, 1.3 sort options, scenario Q2/Q8 | High |
| G-3 | PRD FR-13: Launch Neighborhoods are Gulshan, Banani, Baridhara only; "distance-based search" and city-wide search are out of scope. 1.2 neighborhood picker offers 7 options (adds Dhanmondi, Uttara, Mirpur DOHS, Other Dhaka). 1.3 shows "2.4 km" distances and sort "Closest". PRD FR-13 consequence: owner-facing search returns providers only in Launch Neighborhoods. | 1.2 D4, 1.3 D3/sort | High |
| G-4 | Payment mechanics: specs say "authorization hold" via bKash/Nagad/Stripe card. PRD FR-39 + glossary state SSLCommerz/bKash/Nagad do NOT natively support card-style pre-auth-hold-then-capture and flag "Payment Authorization extension" as OQ-5; PRD A-8 treats this as an assumption to validate pre-launch. PRD FR-40: Bangladesh-compatible gateway (SSLCommerz or equivalent); spec 1.7 names "Stripe Elements" for cards, which contradicts FR-40/NFR-9 (BD-compatible gateway, PCI tokenization by gateway). The user instruction here is: do not invent real gateway contracts, so all payment operations below are generic. | 1.7 routing/D11 | High |
| G-5 | Confirmation window value is inconsistent: 1.8 says "6 hours" (8-12 h in Eid peak); 1.4/1.8 say provider "typically responds in 2 hours" / "1h 45m median"; mockup 17 says hold released "if he declines or doesn't respond in 24 hours". PRD OQ-1 leaves the base duration and peak policy open. | 1.4, 1.7 mockup, 1.8 | High |
| G-6 | Language default: PRD NFR-12/FR-47 and specs: Bangla default with full parity. EXPERIENCE.md line 36/38/462: "English-first ... copy translation is out of scope for v1". Specs' content-block tables give Bangla for most strings but 1.5 Bangla is "abbreviated - full Bangla strings at build time". | 1.1-1.8 vs EXPERIENCE.md | High |
| G-7 | Owner identity: spec 1.2 = phone OTP + name only (no address); PRD NFR-6 = phone OTP "with name and address per architecture stage". PRD constraint line ~1255 same. Also 1.2 offers "Use email instead" (routes to "Coming soon" modal), while "phone-OTP is the only auth method in v1". | 1.2 | Medium |
| G-8 | Push notifications: 1.8 promises push ("she'll get a push notification") and subscription to a booking channel; EXPERIENCE.md line 518 states "No native push (PWA constraint)" for owner notification. PRD FR-43 says owner receives updates "through the in-app channel". Web push on PWA is not specified in PRD. | 1.8 | Medium |
| G-9 | Cancellation policy: 1.7/1.8 reference a cancellation policy and a "release hold" cancel path but give no content. Mockup 17 contains copy: "Free cancellation up to 48 hours before the booking start. Within 48 hours, a 50% cancellation fee applies if the provider has already confirmed." PRD FR-14 says cancellation and no-show policies are PRD-level requirements with architecture-stage mechanics. | 1.7, 1.8 | Medium |
| G-10 | Platform fee: specs show "Platform fee: included" (no number), total hold = base only. Mockup 05 (a different, post-confirmation state) shows a separate "Service fee 280" on top of the stay price (total 5,880 captured). PRD FR-41 / NFR-25: Commission is deducted from the provider payout, static, no surge. Whether the owner pays an additional fee is undecided. | 1.6, 1.7, mockup 05 | Medium |
| G-11 | Review/stat consistency: 1.3 shows "47 reviews with photos"; 1.4 stats show "47 reviews with photos" and "12 repeat owners" while the Fit card shows "4 repeat owners (3 senior-pet)". These are two different counts for repeat owners (12 vs 4) without definition. | 1.3, 1.4 | Medium |
| G-12 | Trust-signal semantics: "demonstrated" counts (12 diabetic small dogs handled successfully) require admin-verified booking history (DESIGN.md demonstrated-fit rule: "never self-declared") but no entity/definition for "successfully" or for "verified by admin" exists. A brand-new platform at launch has no such data (see Section D). | 1.3, 1.4 | High |
| G-13 | Pet photo requirement conflict inside 1.5: Header text says photo "required for this profile" (min 1, max 5, 5 MB). PRD FR-6 does not list photo as a pet attribute. Storage/format/compression not specified. | 1.5 | Low |
| G-14 | Sample data conflicts with PRD UJ-1 (weight 6 kg vs 7 kg; 8-day Cox's Bazar trip vs 9-day Sylhet trip; BDT 2,500 vs 2,200; 14 reviews avg 4.7 vs 47 reviews 4.9). Not a requirement conflict, but proves all numbers are fixtures. | scenario, 1.3-1.7 | Info |
| G-15 | Eid date handling: UI uses symbolic dates "Eid-1 -> Eid+9" (and Bangla "ঈদ-১ -> ঈদ+৯") in chips and labels; no concrete calendar dates, no definition of how an "Eid-relative" date is resolved or displayed. Mockups use "Mar 28 - Apr 05". "9 nights" for Eid-1 -> Eid+9 (11 calendar days) is arithmetically inconsistent (Eid-1 to Eid+9 = 10 nights if both are calendar dates; 9 nights would imply Eid-1 to Eid+8). | 1.3-1.8 | Medium |
| G-16 | Special-care medication administration is described as "BDT 0 - included for medical cases" (1.6) and pre-checked. PRD scope guardrail: platform supports "basic medication administration where provider explicitly agrees" (1.1 footer) and rejects clinical-care bookings at intake. There is no rule on how a pet with a Moderate/Severe condition is screened vs. rejected as "clinical". Insulin injection is called "basic" in 1.4 provider capability; PRD capability flag taxonomy (FR-3) is "medication". | 1.1, 1.4, 1.6 | Medium |

---

## 1. Page 1.1 - Landing / Marketing Home

### 1.1.1 Identity
- **Page ID / name:** 1.1 Landing / Marketing Home.
- **Role:** anonymous visitor (target persona: Owner). Returning-owner variant (cookie) exists.
- **Route:** `/` (spec URL & Routing: "served as PWA manifest entry, canonical landing for SEO"). Outline says `petcare.bd/landing` (conflict: `/` vs `/landing`).
- **Mockup:** `01-home.html` is mapped by the spec (`related_mockup`) but it is NOT a marketing landing. It is a logged-in home ("Welcome back, Bibi / Find care for your pet", species selector Dogs/Cats/Both, stay dates "Mar 28 -> Apr 05, 8 nights", neighborhood "Gulshan, Dhaka", "Search Providers", a "Book Rashid for Tito again?" card, stats "52 Vetted Providers across Dhaka", "1.4k Verified stays with photos"). It matches the "returning user / search entry" idea, not the landing hero/sections in the spec. Treat mockup as non-authoritative for 1.1; the marketing layout is effectively spec-only.
- **Spec status:** `validated - 2026-08-31 - WDS Phase 4 [V]`; outline `status: outlined`. Sketch folder empty.

### 1.1.2 Purpose
Convince a cold mobile visitor of the curated/special-care promise in the first scroll and send them to sign-in via "Find care near me".

### 1.1.3 UI components
Spec D1-D7: NavBar (sticky, 56px; wordmark "PetCare" in Source Serif 4 600; language pill toggle EN | বাংলা, 32px; "Sign in" button-ghost size-sm); HeroSection (h1-editorial 5xl mobile / 6xl tablet+; body-relaxed subhead; `button.primary size.lg` "Find care near me"; `link` "How PetCare works"; trust strip of 3 forest-pill ghost chips with check icon, `aria-label="Trust signals"`); SpecialCareSection (3-up insulin / allergies / anxiety icon cards, muted bg); VerifiedReviewsStrip (3 horizontally scrolling `verified-review-card` pattern cards, 4:3 photo, rating chip, editorial quote; "See all reviews" link); HowItWorksSection (3 numbered forest circles 40px: Search, Confirm, Stay + Review); ProviderCTASection (banner link "For Providers: apply to join PetCare ->"); Footer (muted-100, 4 columns); HowItWorksModal (XL dialog, elevation.xl, max-w-md, centered); lightbox for review photos.

### 1.1.4 User actions
| Action | Result |
|---|---|
| Tap "Find care near me" | Triggers the browser's native geolocation permission prompt (not a custom modal), then routes to 1.2 with `?location=geo` (granted) or `?location=manual` (denied). |
| Tap "How PetCare works" | Opens HowItWorksModal (3 steps: curated supply, verified reviews, care history). Closes on backdrop tap, Esc, or "Close". |
| Language toggle (EN / বাংলা) | Cycles language, persists in cookie `pc_locale`, page reloads, no layout shift. |
| Sign in (nav) | Routes to 1.2 with no auto-sign-in attempt. |
| Tap review card photo | Opens lightbox. Cards scroll horizontally. |
| "See all reviews" | Routes to a reviews page not in this scenario. |
| "For Providers: apply to join PetCare" | Opens `/apply` in a new tab (out of scenario). |
| Footer legal links | Open same tab; pages out of scope. |
| Footer "Pre-launch supply assessment", "About", "Customer support" | Targets not specified. |

### 1.1.5 States
- Default (Bangla, location permission prompted on CTA).
- Returning user (cookie): CTA label changes to "Continue to your shortlist" (outline only; the Spec's auth section says "returning user variant detected via cookie after silent OTP hydration").
- Expat locale (EN + USD detected): English headline plus sub-line "Bilingual providers in Gulshan-Baridhara" (outline only; "USD pricing seen in browser" is unexplained - inferred to be a locale heuristic; prices elsewhere are BDT only).
- Pre-launch state (waiting on supply assessment): hero becomes "We're launching in Gulshan, Banani, Baridhara - join the waitlist" with a structured-intake form (outline only; the form fields and data are unspecified; PRD FR-51 is "Pre-launch demand validation").
- Permission-prompt state (State 2) and modal state (State 3).
- Not specified: loading/error/offline for the landing page; empty reviews strip (if no verified reviews exist at launch); behaviour if cookie language is missing (spec: `<html lang="bn">` default).

### 1.1.6 Data displayed
| Field | Source |
|---|---|
| Hero h1/sub, trust strip, special-care cards, how-it-works, footer trust line | Static content (CMS or i18n files, inferred) |
| 3 review cards: photo, rating (e.g., 4.9, 5.0, 4.8), quote | Review entity (verified review) - **real verified reviews only**; see Section D |
| Locale | cookie `pc_locale` |
| Session | cookie `pc_session` |

### 1.1.7 Data required / captured
- None on the page except language preference (cookie) and, in pre-launch state, a waitlist form (fields unspecified). Geolocation permission result is passed as a query flag, not coordinates (spec passes only `location=geo|manual`).

### 1.1.8 State transitions and navigation
- Next: 1.2 (`/sign-in`). No booking, pet, or payment state changes.
- Out-of-scenario exits: `/apply`, reviews page, legal pages.
- Auth: anonymous allowed. If a valid session exists, CTA relabels to shortlist (target not stated; 1.3 `/search` inferred).

### 1.1.9 Validation
- None (read-only page). Rules: no clinical/medical-care claims; no provider names in hero/trust strip.

### 1.1.10 Integration points
- Browser Geolocation API (permission prompt; result converted to query flag).
- No SMS, payment, MFS, photo-storage writes. Review photos are read from photo storage (CDN) (inferred).
- Analytics: "No Facebook-pixel retargeting hooks" (must NOT).

### 1.1.11 Business rules embedded
- Above-the-fold hero must render in under 1.5 s on low-end Android (spec cites NFR-15; PRD NFR-2 is TTI < 3 s, NFR-1 is payload < 500 KB; the 1.5 s figure is a spec-level number).
- Tap targets >= 44 px (button-lg = 48 px). Contrast of charcoal-900 on cream-50 = 16.2:1.
- No paid placement/provider names on landing; no medical/clinical claims; no retargeting pixels.
- Footer trust line is mandatory copy: "PetCare is not a veterinary boarding service. We support normal pet care and basic medication administration where the provider explicitly agrees."
- Legal line: "Animal Welfare Act 2017 compliance - Data Protection (draft 2023) - Trade license" (PRD NFR-16, NFR-17, NFR-19 context).
- Review alt text pattern: `Verified review photo from Gulshan stay` (no PII).

### 1.1.12 Bangla / English
- Bangla default (FR-47, NFR-12). Content table provides EN+BN for: h1, hero sub, primary CTA, secondary CTA only. Trust strip, section headings, how-it-works labels, provider CTA and footer have no BN strings in the spec (gap).
- Toggle labels "EN | বাংলা" literally as shown; persists via cookie.
- Fonts: Source Serif 4 (headline/quote), Inter (body), Bangla fallback Noto Serif Bengali / Noto Sans Bengali (DESIGN.md). Brand name "PetCare" stays Latin inside Bangla copy ("PetCare কীভাবে কাজ করে").
- Numbers: review ratings are tabular-nums.

### 1.1.13 Assumptions
- A visitor can be classified into "returning" via a cookie without calling the server (spec) yet also via "silent OTP hydration" (unclear mechanism).
- Real verified reviews with photos exist at launch to fill the "From real Dhaka stays" strip.
- The user is on mobile with geolocation available.
- Locale detection can infer an "expat" user; "USD pricing seen in browser" is not a detectable signal (inferred: unimplementable as written).

### 1.1.14 Gaps / contradictions
- G-5 does not apply; relevant: G-6 (language default vs EXPERIENCE.md), G-1 (FR numbers), mockup mismatch above, route `/` vs `/landing`.
- Outline says hero trust strip addresses "Daily updates"; spec trust-strip text is "Tier-A admin-vetted - Verified reviews with photos - Daily updates during stay" while the spec's Trigger-Map table says the "D7 footer trust strip" carries it (it is the hero, D2). Internal inconsistency.
- Outline's Bangla-first headline is in English in the outline; Spec supplies Bangla.
- "How PetCare works" is a modal in the outline and 1.1 section 3 is also an inline "How it works" 3-step visual - the modal content duplicates the section.
- Out-of-scope but needed: what the "Customer support" link opens (WhatsApp is the competitor; support channel not defined).
- The location-permission prompt on the landing page is a privacy-sensitive ask before value is shown; spec does not say what is done with coordinates (stored? only to preselect neighborhood?).

---

## 2. Page 1.2 - Owner Sign-In (Phone OTP)

### 1.2.1 Identity
- **Page ID / name:** 1.2 Owner Sign-In (Phone OTP). **Role:** Owner (new or returning).
- **Route:** `/sign-in`, accepts `?location=geo|manual|<neighborhood>`. Cookies `pc_locale` and `pc_session`. Related route `/sign-in-email` (out of v1: "Coming soon" modal).
- **Mockup:** spec-only (spec: "no specific mockup maps here - closest is the home mockup").
- **Spec status:** `validated - 2026-08-31`; outline `outlined`.

### 1.2.2 Purpose
Verify phone via SMS OTP, capture default neighborhood and display name, then route to the shortlist in under 60 seconds.

### 1.2.3 UI components
Top bar with back arrow (24px, `aria-label="Back to landing"`); title block (h2 editorial 24px with a Bangla sub line, Noto Serif Bengali 14px muted); phone block (static `+880` prefix rail 32px wide + numeric input h-12, formatted `017XX-XXXXXX`); native `select` neighborhood (7 options); `button.primary size.lg` (56px, full width; disabled at 40% opacity until 10 digits); six OTP digit boxes (56px, auto-advance, numeric, auto-paste); resend link (`button.variant.link`, 60 s countdown, tabular-nums); "Use email instead" link; name input; consent line (12px muted, 1px top border); success chip (forest-green check + masked phone); inline error text (`role="alert"`).

### 1.2.4 User actions
| Action | Result |
|---|---|
| Type phone digits | Auto-formats; "Send code" enables at 10 digits. |
| Tap "Send code" | Dispatches OTP SMS; layout morphs in place: phone becomes read-only chip, OTP boxes appear, 60 s countdown starts, CTA label becomes "See providers for my dates". |
| Type/paste 6 digits | Auto-advance; on 6th digit verification runs (trigger point inferred - spec says "submit invalid OTP"; whether auto-submit on 6th digit or via CTA is not stated). |
| Android SMS retriever (`OTPCredential`) | Auto-fills code if supported; manual entry always available. |
| Tap "Resend code" | Enabled after 60 s; resets countdown. |
| Tap "Use email instead" | Shows "Coming soon" modal (email auth is out of v1). |
| Change neighborhood select | Updates default neighborhood. |
| Enter name | Free text; label "What should providers call you?" |
| Tap back arrow | Returns to 1.1. |
| Tap "See providers for my dates" | Routes to 1.3 with `location=<selected>` and `dates=eid-default`. |
| After SMS gateway timeout: "Type the code I received" | CTA relabels and resumes manual entry. |

### 1.2.5 States
| State | Behaviour |
|---|---|
| Phone-entry default | Empty phone; CTA disabled; neighborhood = query param, else Banani (outline: Banani if location denied; spec: "first option" if none; conflict - first option is Gulshan). |
| OTP-sent | Phone read-only; OTP visible; auto-read on Android; 60 s resend countdown. |
| OTP-error | Red border on all 6 boxes, inline "Code didn't match. Try again.", no cooldown penalty, entered values preserved then cleared after 1 error (as written: "preserve entered values, clear them after 1 error"), `aria-invalid`, `role=alert`. |
| OTP-resend available | After 60 s. |
| OTP-success | Green check chip "(verified)"; CTA enabled. |
| Connectivity-fail | SMS gateway timeout (60 s): inline "SMS may take 30-60s in low-signal areas" + CTA "Type the code I received"; no toast spam. |
| Slow response / load-shedding | Detected via slow response: banner "Connection is slow - your code may take a moment", non-blocking. |
| Returning user (cookie `pc_session`) | Silent refresh; on success skip OTP, go straight to 1.3 (name and neighborhood pre-filled, "auto-confirm"); on failure fall to OTP flow. Outline also says CTA "See providers for my dates" is shown. |
| OTP not arriving after 2 minutes | Inline error + "Tap to resend"; no forced back-nav. |
| Location permission denied | Manual picker open (outline: "defaults to Banani"). |
| Expat locale | Prefix still +880; language defaults to English. |
| Bangla digits | OTP field accepts Bangla-script or Latin digits and auto-detects. |
| Not specified | Rate limiting / lockout after N wrong codes, OTP expiry time, resend limit, account-exists vs new-account branching, blocked/invalid number, non-BD numbers. |

### 1.2.6 Data displayed
Masked phone (`+880 17XX-XXXXXX`), OTP countdown, neighborhood label, name (prefilled "Bibi" in mock layout; "defaults to first name from OTP profile if available" - there is no "OTP profile" in the PRD; inferred as nonexistent unless returning user).

### 1.2.7 Data required / captured
| Field | Type | Req? | Notes |
|---|---|---|---|
| Phone number | string, 10 digits after +880 (format `017XX-XXXXXX`) | Required | Spec limits to 10 digits max. BD mobile numbers are usually 11 digits with leading 0 (`01XXXXXXXXX`); spec's "10 digits" after `+880` means without the leading 0 yet the display format `017XX-XXXXXX` includes the 0 (inconsistent - see 1.2.14). |
| OTP code | 6 numeric digits | Required | |
| Default neighborhood | enum (Gulshan, Banani, Baridhara, Dhanmondi, Uttara, Mirpur DOHS, Other Dhaka) | Required (select always has a value) | See G-3. |
| Display name ("What should providers call you?") | text | Spec table says "optional"; outline and PRD NFR-6 imply required ("phone OTP + name") | Conflict. |
| Language | cookie `pc_locale` | - | |

### 1.2.8 State transitions and navigation
- Creates (or finds) Owner account (inferred) and a session (`pc_session`).
- Owner record gets: phone (verified), display name, default neighborhood, locale (inferred).
- Next: 1.3 `/search?location=<hood>&dates=eid-default` (outline) - note 1.3 spec route uses `start=Eid-1&end=Eid+9`, so `dates=eid-default` is a different parameter shape (mismatch).
- Back: 1.1.

### 1.2.9 Validation
- Phone: numeric only; CTA disabled until exactly 10 digits; masked/formatted on input. No error copy given for invalid prefix/length beyond disabled CTA.
- OTP: wrong code message "Code didn't match. Try again." (BN not provided for this string). No attempt limit stated.
- Timing: resend after 60 s; SMS-gateway timeout 60 s; low-signal hint at 30-60 s; "OTP doesn't arrive after 2 minutes" error.
- A11y errors: `role="alert"`, `aria-invalid`.

### 1.2.10 Integration points
- **SMS/OTP provider:** send OTP (phone), verify OTP (phone + code), timeouts and delivery failure surfaced. Android SMS Retriever / WebOTP in browser.
- Session cookie issuance (`pc_session`).
- No payment, MFS, photo storage, notification involvement.

### 1.2.11 Business rules
- Minimum viable identity: phone OTP + name only. No NID, address, document upload, password, newsletter or app-download pop-up, no profile-completion prompts beyond name + neighborhood.
- Resend cooldown 60 s; no cooldown penalty on wrong code.
- Consent line mandatory: "By continuing you agree to PetCare's terms and Animal Welfare Act compliance posture. Your phone is verified; we never share it with providers until a booking is confirmed."
- Phone is shared with providers only after booking confirmation (data-sharing rule; applies to 1.6 backup contact display too, see 1.6).
- Brand voice: no urgency bait.
- Tap targets >= 48 px.

### 1.2.12 Bangla / English
- BN+EN given for: title, helper above CTA, neighborhood label and helper, Send CTA, Resend CTA, OTP step title, email fallback, name label, continue CTA, consent line (BN consent adds a mismatch: Bangla says "we will not share with providers until booking is confirmed" fine, but omits "phone is verified" nuance; Bangla text translates "Animal Welfare Act compliance posture" as "প্রাণী কল্যাণ আইন মেনে চলতে সম্মত" - a different legal meaning: user agrees to comply with the act vs. PetCare's compliance posture; flag for legal review).
- No BN given for: "Code didn't match. Try again.", "SMS may take 30-60s in low-signal areas", "Connection is slow", "Type the code I received", "Coming soon", "(verified)", neighborhood option names.
- Phone digits: format with Latin digits; OTP accepts Bangla digits and normalizes.
- Phone prefix `+880` locked; Bangla UI sub-title in Noto Serif Bengali.

### 1.2.13 Assumptions
- Returning users are identified by a cookie and silent refresh (session persistence length not specified).
- A mid-range Android device supports Android SMS Retriever.
- 10-digit input after +880 (no leading 0) is the intended entry format (inferred).
- The owner's default neighborhood can be changed later (not specified where).

### 1.2.14 Gaps / contradictions
- G-3 (7 neighborhoods vs 3 Launch Neighborhoods), G-7 (address missing; email fallback), G-1.
- Phone format inconsistent: "10-digit input" + `+880` prefix vs display `017XX-XXXXXX` (11 characters incl. leading 0 and a dash).
- Name field optional (spec) vs implied required.
- Outline lists the CTA text for pre-OTP state as "Send code" and the layout sketch shows the first CTA enabling at 10 digits while the neighborhood select sits above it; but the *name* field is only shown post-OTP - what happens if the user returns to a partially completed state is not defined.
- OTP verification when user is new vs existing: not defined (account creation is implicit; PRD says no public sign-up exemption applies only to providers).
- Auto-detect "Bangla-input mode" for OTP is stated but no rule for Bangla digits in phone field.
- `dates=eid-default` is a hard-coded seasonal default (see G-15); what are the default dates outside Eid?
- "Save as draft" does not exist here; "Use email instead" present in the layout while PRD NFR-6 is silent on email.

---

## 3. Page 1.3 - Search Results - Curated 3-5 Shortlist

### 1.3.1 Identity
- **Page ID / name:** 1.3 Search Results - Curated 3-5 Shortlist. **Role:** Owner (signed in).
- **Route:** `/search` with query `?location=banani&species=dog&start=Eid-1&end=Eid+9&special=medication`; full catalog `/search/all` with filters preserved.
- **Mockups:** `13-curated-shortlist.html` (+ `13-curated-shortlist.component.md`) is the reconciled build for 1.3; `02-search-results.html` is retained as `upstream_mockup_replaced` (older content: Mar 28 - Apr 05, Gulshan, 12 providers, capacity strip).
- **Spec status:** `validated`. Validation report critical issue (frontmatter pointing to 02) is shown as fixed in the file.

### 1.3.2 Purpose
Show the curated 3-5 shortlist with proof-based "Demonstrated experience" visible before the tap (the primary surface for Bibi Want #1; PRD FR-11).

### 1.3.3 UI components
Top bar (back arrow + title "Search"), plus "Save" (mockup 13: top-right "Save" = save this search); sticky filter bar: summary chip (`badge.neutral` pill, 44px tall, tap -> filter modal), horizontal filter chips (pill toggles, selected = primary-soft + check, `aria-pressed`), result count, sort selector (ghost button-size-sm / native select); `card.elevated` provider card variants featured / standard / tier-b (component spec); hero photo 4:3; name `text-xl`; `tier-a-badge` (doubled border, full radius, "Tier-A · Admin-vetted") or Tier-B silver `badge.neutral`; neighborhood + distance with map-pin icon; availability pill `booking-state.captured` with dot (variants available / partial / full); rating row; Demonstrated-Fit section with `fit-card` (muted-100, radius-md/lg, p-3, 140 px wide, tabular numerals, `role=button`); price line; `button.primary size.md` "Book this provider ->" (mockup label: "Book"); full-catalog link; skeleton cards (`role=status aria-label="Loading providers"`); filter modal (slide-up, elevation.xl, sticky header/footer "Apply"); banners (cached results, capacity change).

### 1.3.4 User actions
| Action | Result |
|---|---|
| Tap anywhere on provider card | Routes to 1.4 `/providers/[slug]`. Entire card is an `<a>`. |
| Tap "Book this provider" in card | Same route as card tap (stops propagation, no double navigation). Does NOT start a booking directly. |
| Tap Fit card | Opens 1.4 scrolled to the matching section (D-table); the Content/Accessibility says "see verified reviews". |
| Tap summary chip | Opens filter modal (location, species, dates, special care). |
| Toggle filter chip (Medication, Daily routine, Tier, plus mockup also "Senior pets", "Special diet") | Re-query (debounced 300 ms per component spec). State kept in URL query. |
| Change sort | Re-query immediately. Options: "Tier-A first" (default), "Demonstrated-Fit first", "Closest", "Price low-high" (spec); outline listed only Default (Tier-A first) and Demonstrated-Fit first. |
| Tap "Save" / "Save this search" | Saves search criteria to dashboard; toast; stays on page (outline). Spec has no object for it except the mockup's top-bar "Save"; behaviour/entity not defined in spec. |
| Tap "View all 14 approved providers" | Routes to `/search/all` with filters preserved (full catalog with sort UI, Tier-A pinned top, pagination - outline). |
| Back arrow | Back to 1.2 state (spec). |
| Apply (filter modal) | Writes filters to URL query; modal closes; list refreshes. |
| Retry (cached banner) | Re-fetch. |

### 1.3.5 States
- Default: 4 providers, `data-result-count="4"`, "4 providers match your search".
- Loading: 4 skeleton cards, same height as real cards, shimmer, no spinner-only state. Filter change: dim existing cards + small "Updating..." badge.
- Filter-modified; sort-changed.
- Empty (zero results): copy "No providers in Banani have full availability for your dates. Try widening dates, or [see full approved catalog]." (outline); DESIGN.md has a `capacity-exhausted` string "Try a wider date range or a different neighborhood."
- Network-fail/slow: banner "Connection slow - showing cached results from 2 min ago - [Retry]" (cache-age number is hard-coded in the copy; real value should be dynamic - inferred). Component spec also lists generic error state: inline banner + retry.
- Capacity-changed-mid-search: poll every 30 s; inline refresh, banner "Rashid updated availability - still available for your dates" or "1 provider no longer matches". Also window-focus re-validation (component spec).
- Tier-B variant card: no photo (icon placeholder), `opacity-90`, "TIER-B" muted badge, soft sentence with no numbers (DESIGN.md).
- Card variants data-dependent: when no demonstrated-Fit data exists, the card shows "Accepts: dogs - senior pets - medication - special diet" (self-declared fallback, outline only; spec D3 doesn't mention it).
- "Fewer than 3 results" is not defined even though FR-11 says 3-5.
- Search-saved state, anonymous/unsigned state: not specified (page is reached post-sign-in; PRD allows search before sign-in? not stated).
- Offline: only the "cached results" banner; true offline not defined.

### 1.3.6 Data displayed (per card; source Provider / Capacity / Review / Care-history entities)
| Field | Source entity | Notes |
|---|---|---|
| Hero photo (real, not stock) | Provider photos | "real, taken at their facility or home" |
| Name ("Rashid") | Provider | mockup shows "Rashid M." |
| Tier badge (A gold / B silver) | Provider.tier | DESIGN.md: Tier-A badge is not gold - it is forest-green soft with doubled border; Spec/outline says "gold". Conflict (see 1.3.14). |
| Neighborhood + distance ("Gulshan · 2.4 km") | Provider location; distance from owner's chosen neighborhood | Distance to what origin? Spec says "from Banani". |
| Availability pill ("Available all 9 nights" / partial / full) | Date-Level Capacity (FR-12) | |
| Rating avg + review count with photos ("4.9 ★ · 47 reviews with photos") | Review aggregates | PRD SM-C3 counter-metric on average-star ranking; displayed but not used to rank. |
| Quick stats ("6 yrs hosting · 12 repeat owners") | Provider | mockup 13 shows on featured card only; not in spec 1.3 layout. |
| Demonstrated experience fit cards (4 on featured card): "12 diabetic small dogs handled", "6 cat boardings (5 with medication)", "4 repeat owners (3 senior-pet)", "Eid-week honored 4 of last 4 peaks" | Derived from completed bookings / care history (admin-verified per DESIGN.md) | Standard card: single inline paragraph with bold numerals. |
| Price line ("BDT 2,200/night · 9n = BDT 19,800") | Provider.pricePerNight x nights | |
| Result count, sort selection, search summary | Query |
| "View all 14 approved providers in Banani & nearby" | Count of approved providers in scope | "14" is a count, hard-coded in copy. |

### 1.3.7 Data required / captured
- No free-text input. Inputs: species (Dog default; filter chip), location (neighborhood enum), dates (start/end, symbolic Eid-1 / Eid+9), special-care flags (Medication, Daily routine, plus "Senior pets", "Special diet" in mockup), tier filter, sort mode (enum: tier-a-first, fit-first, closest, price-asc).
- State held in URL query; restored on back-nav.
- Saved search: persisted criteria (entity SavedSearch inferred; name/fields not specified).

### 1.3.8 State transitions and navigation
- No booking/pet/payment state changes. Next: 1.4 on card/CTA tap (booking intent only). Secondary: `/search/all`; filter modal -> back to list.
- Expected downstream (from 1.8 declined/expired): returns here with "filters preserved".
- Results are "pre-validated" for capacity: exhausted-capacity providers are removed at search time, and a hard block exists at submission (FR-12). Note the outline says "removed at submission-time, not at confirmation (FR-12)" - wording suggests both stages; reconcile as: filtered from search, re-checked on submission (inferred).

### 1.3.9 Validation
- No form validation. Business validation: results filtered by Date-Level Capacity for the whole requested window (FR-12), species, neighborhood, special-care flags. Max 5 results in default shortlist, 3-5 expected (FR-11).
- Timing: poll 30 s, debounce 300 ms (component spec) vs spec state machine says capacity polling; filter debounce 300 ms is only in the component spec.

### 1.3.10 Integration points
- Search/availability API (`GET /api/search?location=&species=&start=&end=&special=` returning `SearchResult[]` per component spec).
- Photo storage/CDN read (WebP, 4:3, 320x240 mobile / 480x360 tablet).
- Analytics events (component spec): `shortlist_viewed`, `provider_card_tapped`, `fit_card_tapped`, `book_button_tapped`, `full_catalog_clicked`, `filter_chip_toggled`, `sort_changed`.
- No SMS/payment/MFS/notification.

### 1.3.11 Business rules
- 3-5 providers in default shortlist; never > 5 (FR-11).
- Ranking (PRD): Tier-A above Tier-B when other signals equal, Launch Neighborhood density, Date-Level Capacity; never paid placement (NFR-24); no "Sponsored"/"Boosted" label, not even soft; no star-rating-only ranking (SM-C3); no urgency copy ("Only 2 spots left"). See G-2 about fit-based sort.
- Top card shown first is "top-ranked Tier-A"; sample ordering: Card 1 Tier-A, Card 2 Tier-A, Card 3 Tier-B, Card 4 "Tier-A, lower fit" (layout text) - this order puts a Tier-B above a Tier-A, contradicting "Tier-A rank above Tier-B" (FR-1/FR-11) and the label "Tier-A first".
- Capacity-exhausted providers filtered; poll interval 30 s; cached banner age text.
- Provider photo must be real; Tier-B card in component spec has no photo (conflict with "No stock photos / real photo on every card").
- Currency: `BDT 2,200 / night`; nights x price shown on each card.
- Fit claims must be proven, admin-verified booking history, never self-declared (DESIGN.md).
- Result count in DOM `data-result-count`.

### 1.3.12 Bangla / English
- EN+BN given for: title ("Search providers" / "প্রোভাইডার খুঁজুন" - differs from layout title "Search"), summary chip, result count, fit header, 4 fit cards, CTA, below-fold link, helper.
- Not given: sort labels, filter chip labels, empty state, banners, availability pill text, "Save", Tier-B badge, "Accepts: ...".
- Bangla numerals in Bangla UI: ৪টি, ৯ রাত, ১৪ জন, ১২টি. Currency/price numbers in Bangla content blocks are not shown (price line absent from the content table). `1.7` shows "BDT ১৯,৮০০" mixing Latin "BDT" with Bangla digits and Bangla comma grouping - formatting convention is implied: Latin "BDT" prefix + Bangla numerals when UI = BN (lakh grouping not exercised at this size). Mockups use "BDT 2,200" in 13/17 and "৳ 5,600" in 03/05 (symbol inconsistency).
- Bangla fit copy contains awkward terms ("পুনরায়কারী" for repeat owners; "প্রমাণিত অভিজ্ঞতা" for demonstrated experience).
- Provider names appear transliterated in 1.4 BN ("রশিদ") so provider names need BN variants (PRD glossary: bilingual content for names).

### 1.3.13 Assumptions
- Eid-1 -> Eid+9 and "9 nights" resolve to concrete dates server-side.
- 4 qualified providers exist with real demonstrated-Fit data for a "diabetic small dog" query; the count of 14 approved providers "in Banani & nearby" implies the supply that PRD UJ-3 describes as 18 active providers at Eid.
- Distances are computed from the owner's chosen neighborhood centroid (inferred).
- A shortlist can have a Tier-A provider located in a different neighborhood (Gulshan) than the filter (Banani), implying "Banani & nearby" = the 3 Launch Neighborhoods.
- Search is allowed only after sign-in (flow), but the PRD UJ-1 entry state also assumes sign-in via an earlier browse session.

### 1.3.14 Gaps / contradictions
- G-2 (fit sort vs NFR-26), G-3 (distance, 'Closest' sort, `Other Dhaka`), G-11 (47 reviews / repeat counts), G-12, G-15 (9 nights), G-1.
- Badge colour: outline says Tier-A badge is gold, Tier-B silver; DESIGN.md and component spec: forest-green soft with 2px border (Tier-A), muted (Tier-B).
- Card count: spec says "4 providers", layout shows "Card 1..4" including Card 3 Tier-B above Card 4 Tier-A; mockup 13 renders only 3 cards (Rashid, Farzana, Kamrul Tier-B) while count text says "4 providers match".
- Mockup 13 Tier-B card (Kamrul H., Bashundhara 5.4 km) shows Bashundhara which is not a Launch Neighborhood (FR-13) and shows "6 stays"/"2 verified reviews" with a 4.4 rating. Mockup 13 Rashid is "Gulshan" and "Rashid M."; spec uses "Rashid".
- Mockup 13 filter chips (Senior pets, Special diet, Tier) differ from the spec's chips (Medication, Daily routine, Tier) and from the outline's chips (Species, Date, Special care, Sort).
- Mockup CTA label "Book" vs spec "Book this provider ->".
- "Book this provider" on a search card does not book; it routes to 1.4 (naming mismatch; same label on 1.4 goes to 1.5).
- "Save this search": only the mockup and outline carry it; what the saved search does later (alerts? dashboard card?) is undefined; PRD has no saved-search FR.
- Capacity-changed banner text "Rashid updated availability" breaks the "no urgency, no provider-specific alert" voice? (not stated; flag for brand review). Component spec polling vs. PRD NFR-3 (<1 s p95 search) not reconciled with 30 s poll cost.
- No spec for the full-catalog view (`/search/all`), filter modal contents, or saved searches (supporting pages missing).
- Distance origin unspecified; distance calculation for an Owner who chose "Banani" but whose address is not collected.
- `special=medication` query param supports only one value; chips allow multi-select.

---

## 4. Page 1.4 - Provider Profile (Public)

### 1.4.1 Identity
- **Page ID / name:** 1.4 Provider Profile - Public. **Role:** Owner viewing (anonymous view allowed; "Save for later" needs sign-in).
- **Route:** `/providers/[slug]`, e.g. `rashid-gulshan-tier-a` (outline: `petcare.bd/providers/rashid-gulshan-tier-a`). SSR-able, Open Graph with provider photo + Tier-A badge title.
- **Mockup:** `03-provider-profile.html` (older content; differs - see 1.4.14).
- **Spec status:** `validated`.

### 1.4.2 Purpose
Turn the shortlist tap into booking intent by showing proof (demonstrated experience, verified reviews with photos, live capacity, price) and a sticky "Book this provider" CTA (PRD FR-5, FR-12, FR-21).

### 1.4.3 UI components
Back nav; gallery (16:9 hero, radius-md, pagination dots, `aria-roledescription="carousel"`, tap to lightbox - full-screen, swipe, focus trap, Esc closes); identity block: name, `tier-a-badge`, "Save" heart (`button.variant.ghost`), neighborhood + distance + map snippet button, quick-stats row (tabular-nums), availability pill (`booking-state.captured`); Demonstrated-Fit section: h3 + subtitle + horizontally scrolling `fit-card`s (`card.muted`, radius-lg, p-4, min-w 160 px, editorial serif numeral 28 px); Verified reviews: filter chips (All, With photos, Diabetic, Senior, Repeat), 3 expanded `review-card` (rating chip, reviewer first name + neighborhood + stay length, 4:3 photo grid, editorial quote), "See all 47 reviews" link; Care setup details (structured bullet lists, no free text); Pricing (price line + "Show price breakdown" link opening a modal); response-time reassurance (12px muted); sticky bottom bar (`card.elevated` style, shadow-lg, p-4: "BDT 19,800 total · 9 nights" + `button.primary size.lg` "Book ->" 56px); modals (lightbox, review expanded, price breakdown, map full-screen with route, "Sign in to save providers"); "Message provider" (disabled state); full-reviews list page; reviews filtered by fit.

### 1.4.4 User actions
| Action | Result |
|---|---|
| Tap "Book this provider" (sticky) | Routes to 1.5 `/pets/new` (first booking) after capacity validation (FR-12). If capacity no longer available, the CTA is disabled and reads "Please choose another date or provider". |
| Tap gallery / dot | Lightbox / jump. |
| Tap Fit card | Reviews list filtered to that claim. |
| Tap review filter chip | Local filter, count update. |
| Tap review card | Expanded modal with all photos/comments. |
| "See all 47 reviews with photos" | Reviews list page (not in scenario). |
| "Show price breakdown" | Modal: base x nights + fees: "BDT 2,200/night x 9 nights = BDT 19,800, platform fee included, total". |
| Tap map snippet | Full-screen map with route from user location. |
| Tap Save heart | Signed in: toggle fills accent, stays. Anonymous: modal "Sign in to save providers". Outline: "Save for later" bookmarks to dashboard. |
| Tap "Message provider" | Disabled; "Available after you submit a booking request" (outline). Spec has no object for it (PRD FR-44: chat scoped from Confirmation, outline says available "after you submit"; 1.8 says "Chat opens once your booking is confirmed" - conflict). |
| Back | Returns to 1.3. |

### 1.4.5 States
- Default (SSR first paint, photos lazy-loaded below fold on slow connection).
- Capacity-just-changed: WebSocket or 30 s polling; pill color changes forest -> amber -> red with text; sticky CTA disabled when unavailable.
- No reviews yet: D5 replaced with "No verified reviews yet - see Rashid's demonstrated-Fit evidence above"; filter chips hidden. (Note: for a brand-new provider with no fit either, the fallback is undefined.)
- Profile incomplete: line "Profile completeness: 70% - See what's missing"; booking not blocked.
- User has saved provider: "Saved" indicator.
- User has booked before: "You've booked Rashid before" above tier badge + "Book again" path (Scenario 02 hook; outline: replaces the standard CTA).
- Save anonymous / signed in.
- Anonymous viewer (no `start/end` context): price/total and availability "for your dates" cannot be shown (not specified).
- Loading/error/offline: not specified beyond lazy-loading.
- Provider not approved/not found: not specified (PRD FR-5: profile publicly visible only when `approved`).

### 1.4.6 Data displayed
| Field | Source entity |
|---|---|
| Hero/gallery photos | Provider photos |
| Name, Tier-A badge ("Personally vetted by PetCare" per outline; spec: "Tier-A · Admin-vetted") | Provider (tier, admin-introduced marker, FR-5) |
| Neighborhood, distance "2.4 km from Banani", map | Provider location |
| Quick stats: "6 yrs hosting", "4.9 ★", "47 reviews", "12 repeat owners" | Provider + Review aggregates |
| Availability for chosen dates | Date-Level Capacity |
| Fit cards (12 diabetic small dogs, 6 cat boardings - 5 with meds, 4 repeat owners - 3 senior/special, Eid-week honored 4 of 4) | Derived from Care History / Booking outcomes |
| Reviews: star rating, reviewer first name, neighborhood, stay length/dates, photos, text; filter counts | Review (verified, one per booking; FR-20/21) |
| Facility list: "Dedicated pet room - Catio (outdoor enclosed cat space) - Quiet separate room for special-care pets" | Provider profile |
| Species accepted: "Dogs (up to 12 kg) - Cats - Senior pets - Diabetic pets" | Capability flags (FR-3/FR-5) |
| Self-declared capability: "Basic insulin administration - Oral medication - Eye drops - Special diet" | Capability flags |
| Vet on call: "Dr. [Name], Gulshan Veterinary (1.2 km)" | Vet-clinic directory entry (FR-45) |
| Price per night, total, breakdown | Provider pricing |
| Response time ("typically responds in 1h 45m", "Replies to requests in 1h 45m median") | Provider response metric (SM-8) |
| Profile completeness % (below fold) | Provider |
| Cancellation policy summary (link) | Policy content |
| Vet-clinic directory (names only) | FR-45 |

### 1.4.7 Data required / captured
- None (read-only). Captured actions: saved-provider toggle (Owner-Provider favorite relation, entity inferred). Booking intent carries provider slug + dates to 1.5/1.6.

### 1.4.8 State transitions and navigation
- Next: 1.5 `/pets/new` (first booking, no pet). If owner already has a pet profile, the target is not defined (likely 1.6; inferred). Back to 1.3. Repeat customer: "Book again" (Scenario 02).
- No booking record yet; "Save" creates a favorite.
- Capacity is re-validated on CTA tap (FR-12).

### 1.4.9 Validation
- Capacity check before leaving to 1.5. Anonymous save -> sign-in prompt. No form.
- Price shown must match what is charged later ("No price changes after confirmation", 1.6).

### 1.4.10 Integration points
- Provider/profile API, review API, availability API (polling/WebSocket), photo storage read (lightbox, review photos), map provider (map snippet; provider unspecified), analytics (not specified). No SMS/payment.

### 1.4.11 Business rules
- Never average-star-only signal (SM-C3); no self-declared capability masquerading as demonstrated-Fit (self-declared list shown separately); no stock photos; no Sponsored/Boosted; no booking without capacity validation (FR-12); verification artifacts not public (PRD FR-5, NFR-7).
- Tap targets >= 48 px; sticky CTA 56 px.
- Reassurance copy mandatory: "No charge until provider confirms · Provider typically responds in 1h 45m".
- Fit card tap must lead to evidence (filtered reviews).
- Provider "Personally vetted by PetCare" admin-introduced marker (outline) vs "Admin-vetted" badge (spec).

### 1.4.12 Bangla / English
- EN+BN given: Save, Tier badge, Stats row, Availability, Fit header/sub, Reviews header and see-all, Care details header, Pricing header, Sticky CTA, Reassurance.
- No BN: review filter chips, facility/species/capability lists, "Message provider" message, error/empty copy, price breakdown labels, map labels.
- Provider name in BN ("রশিদ") - provider name needs BN transliteration; reviewer names and review text are user-authored (PRD glossary Bilingual Content: reviews likely stay in the language written; policy not specified).
- Number formats: "৬ বছর", "৪.৯ ★", "ছবিসহ ৪৭টি রিভিউ" - Bangla numerals in BN mode; rating "4.9" with tabular-nums. Star glyph shared.
- Editorial serif quote, Noto Serif Bengali fallback; Bangla review text needs the same fallback.
- `aria-label` for the sticky CTA is English ("Book Rashid Gulshan Tier-A for BDT 19,800 total") - BN accessibility labels not provided.

### 1.4.13 Assumptions
- Provider has per-date capacity published for the Eid window.
- Reviews with photos exist (47) and an admin-verified definition of "handled successfully".
- Dates for "your dates" come from the query context carried from 1.3.
- Provider's weight limit (12 kg) is enforced by capability flags, not by the booking form (no weight check appears on 1.5/1.6).
- A "median response time" metric is computed and displayed (SM-8).

### 1.4.14 Gaps / contradictions
- Mockup 03 (differs significantly): profile for "Rashid M.", Gulshan 2.3 km "from you", "4.9, 42 verified stays", "3 of 4 spots open for Mar 28 - Apr 05", "About Rashid" paragraph (free-text; spec says "no free-text" care setup and PRD FR-5 allows only the prior-experience statement), capability chips (Diabetic, Senior, Post-surgery, Anxiety), a full month Date-Level Capacity calendar (spec 1.3 removed the strip and says it belongs on 1.4 or the calendar scenario - but the 1.4 spec has no calendar object), reviews "42 reviews - 87% with photos", price "৳ 5,600 / stay" (per stay, not per night), CTA "Request booking" (vs "Book this provider" / "Book ->"). Mockup reviewer "Bibi, with Tito - 3 stays" shows the persona as a reviewer on her own first booking - sample data collision.
- Spec 1.4 describes reviewer "Sabrina - Gulshan - 5d stay" whose quote reads "Tito is in such good hands..." - a review about "Tito" by a different owner is a fabricated trust signal (Section D).
- Per-species capacity (PRD UJ-1: "2 dogs max, no cats this stay") isn't displayed; only boolean "Available for Eid-1 -> Eid+9".
- Outline lists Pricing under "sticky bottom"; spec splits price section and sticky bar - OK.
- "Message provider" availability: outline "after you submit a booking request"; 1.8: "once your booking is confirmed"; PRD FR-44: from Confirmation. Conflict.
- "Save" requires sign-in but the page is reached post sign-in anyway; anonymous deep link (SEO) is where it matters.
- Distance "2.4 km from Banani" vs mockup "2.3 km from you" (origin differs).
- Reviews "Verified" definition and review language: not specified.
- A11y label hard-codes the provider name and total; must be dynamic.
- No indication of how "Book again" detection (booked before) is derived (owner-provider booking relation, inferred).
- Spec cites mockup 03 as `related_mockup` but includes no reconcile note of its large content differences (spec validation claims reconcile notes exist for 1.3, 1.4, 1.6, 1.7; they are absent from 1.4/1.6/1.7 specs in this folder - only 1.3 has one).

---

## 5. Page 1.5 - Pet Profile Management (Tito's First Profile)

### 1.5.1 Identity
- **Page ID / name:** 1.5 Pet Profile Management. **Role:** Owner (sign-in required; redirect to 1.2 if not signed in).
- **Route:** `/pets/new` (create), `/pets/[petId]/edit` (edit). Persistence key `pc_pet_profiles` (collection per owner), "denormalized into booking record on save".
- **Mockup:** `15-pet-profile-management.html` (title "1.5 Pet Profile Management (Owner · Moat Seed)", annotations "FR-6/7/8/10/48"). Spec says "no specific mockup" (stale; the mockup exists).
- **Spec status:** `validated`; content blocks "abbreviated - full Bangla strings at build time".

### 1.5.2 Purpose
Capture Tito's structured care profile once, attach it to the booking, and persist it to Care History for pre-fill (PRD FR-6, FR-7, FR-8, FR-10, FR-48; moat seed).

### 1.5.3 UI components
Header with back ("Book Rashid" in mockup; spec "Book Rashid") and "Discard" (mockup); helper text block; collapsible section headers (`button aria-expanded`, chevron, state in localStorage); photo upload zone (`card.muted`, 80x80 thumb [validation report flags the pixel intent], radius-md, camera/gallery via `<input type=file accept="image/*" capture="environment">`); read-only locked Species field with lock icon; breed autocomplete; number inputs (age, weight); select (Sex); radio groups in `<fieldset>`/`<legend>`; multi-toggle chips (`role=checkbox`); free-text trigger chips with "+ Add trigger" / remove ×; condition rows (`card.flat` articles) with severity radio, vet contact fields, daily notes textarea, "Remove condition"; coral "SPECIAL CARE" section tag on Medical conditions; medication rows; brand autocomplete (native `<datalist>`); treats textarea (200 char counter `aria-live`); allergy multi-toggle; three textareas; sticky primary CTA `button.primary size.lg`; "Save as draft" `button.variant.outline`; "Add another pet" / pet selector (multi-pet).

### 1.5.4 User actions
| Action | Result |
|---|---|
| Collapse/expand a section | Toggles; remembered in localStorage. |
| Add / change / remove photo | Opens camera or gallery; 1-5 photos, each <= 5 MB; thumbnail tap enlarges/replaces. |
| Fill fields (see 1.5.7) | Local form state; Save enabled when required fields complete. |
| "Add another condition +" | Appends a condition row, scrolls into view. |
| "Add medication +" | Appends a medication row. |
| "+ Add trigger" | Appends a free-text trigger chip. |
| Choose Severity = Moderate/Severe | Reveals/requires vet contact fields. |
| Tap "Save Tito's profile & continue" | Validates; on valid: saves profile, shows loading (button disabled + spinner, 1-2 s typical), then routes to 1.6 with the pet attached. |
| Tap "Save as draft" | Saves partial profile, returns to dashboard. |
| Tap Back | Returns to 1.4; discarding changes prompts confirm. |
| "Discard" (mockup) | Not described in spec (inferred: discards edits). |
| "Add another pet" (multi-pet) | Spec lists as CTA below identity block; target not defined. |

### 1.5.5 States
- Default empty (all sections open, Save disabled, inline "Required" hints).
- Required-field warning on Save tap: inline errors, scroll to first error, `aria-invalid`, `role=alert`. (Outline says Save is *disabled* until required fields filled AND shows errors on tap - contradictory: a disabled button cannot be tapped.)
- Autocomplete-breed suggestions.
- Photo-required: Save disabled + hint "Add at least 1 photo".
- Severity Moderate/Severe: vet contact required (outline state label says "Condition-severity-Medium" - naming error).
- Save -> loading; success -> 1.6; network-fail -> "Saved as draft - try again when connected".
- Returning user + existing pet: pre-fill, "Edit" toggles view-only, "Book again" path (Scenario 02).
- Multi-pet household: pet selector at top + "Add another pet".
- Photo upload progress indicator (outline).
- Species = cat variant: cat selector is visible but greyed (outline); PRD FR-6 says species-specific fields conditional on species (cat: litter box, indoor/outdoor, single/multi-cat tolerance) - no cat fields specified here (dog: walking/exercise, outdoor access) beyond "Exercise needs".
- Offline / draft recovery: only the network-fail draft text.

### 1.5.6 Data displayed
Pet summary header ("Dog · Shih Tzu · 4y · 7kg", name "Tito", photo thumbnail), pre-filled values after first save (edit mode), helper copy. In first-booking flow the form shows Tito's values as pre-populated example (spec layout), though 1.5 outline says "all fields empty" for first booking - the layout is populated with Tito's data; see 1.5.14.

### 1.5.7 Data required / captured (Entity PetProfile and children)
| Field | Type / options | Required | Notes |
|---|---|---|---|
| Pet name | text | Required (inferred; default "Tito" editable) | |
| Photos | image files, 1-5, <=5 MB each, accept image/* | Required min 1 | G-13 |
| Species | locked from shortlist filter: Dog (Cat visible greyed) | Required, locked | |
| Breed | autocomplete (list source unspecified) | Required (inferred) | |
| Age | number, years | Required (inferred) | unit years only; puppies/months not supported (inferred gap) |
| Weight | number, kg | Required (inferred) | provider max 12 kg capability not cross-checked |
| Sex | select: Male/Female x Neutered/Intact (shown "Male · Neutered") | Required (inferred) | full options not listed |
| Vaccinations | radio: Up to date / Not known / Not up to date / N/A | Required (inferred) | |
| Microchip ID | text | Optional | |
| Energy level | radio: Calm / Moderate / High | Required? (not stated) | Outline says Calm selected for Tito; layout shows Moderate selected (conflict) |
| Good with | multi-toggle: Other dogs (size filter) / Other small dogs, Cats, Children, Strangers | Optional | |
| Behaviour triggers | free-text chips (e.g., "Wary of larger dogs", "Stressed by loud fireworks") | Optional | |
| Conditions[] | repeater: name (e.g., Diabetes), diagnosis date (approximate OK; layout shows "8 months"), severity (Mild/Moderate/Severe), vet contact (name + clinic + phone), daily care notes (free text, 500 char) | Condition list optional; vet contact required if Moderate/Severe | Outline says vet contact required for Moderate or Severe. Nothing blocks a "Severe" pet; see G-16. |
| Medications[] | repeater: name + dose (e.g., "Insulin - 2 units"), frequency (e.g., "Twice daily at 8am and 8pm"), route (oral / injection / topical / drops), notes | Optional per row; fields required within a row not stated | "Toggle medication switches opens dosage + timing sub-form" (outline) vs repeater cards (spec) - different UI |
| Diet.foodType | radio: Low-carb kibble (default shown) / Wet food / Raw / Home-cooked / Mixed | Required (inferred) | Mockup lacks "Mixed" and shows brand chips |
| Diet.brand | autocomplete from "common BD brands" (mockup: Hill's w/d, Royal Canin Diabetic, Acana, Orijen; spec layout: "Acme Diabetic") | Optional | |
| Diet.schedule | text (e.g., "2/day - 8am + 8pm") | Required? (not stated) | free text; not structured times |
| Diet.treats | textarea, 200 char with counter | Optional | |
| Diet.allergies | radio/multi-toggle: None known / Chicken / Beef / Grain / Dairy / Other | Required (a choice) | layout uses radio circles for allergies though outline says multi-toggle (conflict). "Other" has no text field |
| Anxiety triggers | textarea | Optional | |
| Comfort items | textarea | Optional | |
| Exercise needs | textarea | Optional | |

### 1.5.8 State transitions and navigation
- Creates PetProfile (active) for the owner; saves to Care History base (FR-6/7/10); the first booking will "denormalize" a snapshot into the booking (FR-15: Booking Request contains Pet Profile snapshot).
- A Pet Profile is required before a Booking Request (FR-6 consequence).
- Save & continue -> 1.6 `/book/[providerSlug]/configure?petId=...`.
- Save as draft -> dashboard (owner dashboard not specified).
- Back -> 1.4. Edit entry from 1.6/1.7: `/pets/[petId]/edit` "preserves booking draft".
- Pet profile archived/removed: not covered.

### 1.5.9 Validation
- Required-field gating: Save disabled until required fields complete (spec D10/default state); on tap with missing fields: inline errors + scroll to first. Required set is not enumerated; confirmed required: photo (>=1), vet contact if severity Moderate/Severe. Other required fields are inferred.
- Limits: photos 1-5, <= 5 MB each; treats 200 chars; condition notes 500 chars; brand/treats counters; no global profile-completion pressure.
- Timing: validate on save (spec); inline per-field behaviour (blur vs submit) not specified. Error copy strings are not provided except photo hint "Add at least 1 photo" and network-fail "Saved as draft - try again when connected".
- Vet contact phone format validation (+880) not specified.

### 1.5.10 Integration points
- **Photo storage:** upload 1-5 images (camera/gallery) with progress indicator; storage/resizing/virus checks unspecified.
- Pet profile API (create/update/draft). Breed list and BD pet-food brand list (static datasets; sources unspecified).
- No SMS, payment, MFS, notification.

### 1.5.11 Business rules
- Structured fields only; no free-text-only "tell us about your pet"; no vet-records upload; no owner identity docs; no "complete your profile to 100%" pressure.
- Photo: min 1 (required), max 5, 5 MB each.
- Vet contact required for Moderate/Severe conditions; condition notes <= 500 chars; treats <= 200 chars.
- Species locked to Dog by the search filter (cat greyed).
- Section collapse state stored in localStorage (per-viewer convenience).
- Profile data persists for life of owner account (FR-6, platform-owned and portable across providers - FR-10/FR-7).
- PRD: dogs carry walking/exercise + outdoor-access preference; cats carry litter box, indoor/outdoor, single vs multi-cat (conditionals) - only the dog exercise field is represented.
- Copy rule: helper must state profile saved to platform and future bookings pre-fill.

### 1.5.12 Bangla / English
- EN+BN given: page title, helper, 7 section headers, Save CTA, Save-as-draft. All field labels, options, validation text, radio options, allergy options, severity, route and photo copy lack BN.
- Free-text values (triggers, notes, comfort items) may be entered in Bangla or English (PRD glossary Bilingual Content); display to provider in the language written, no translation (inferred).
- Units: years, kg; Latin or Bangla numerals depending on UI language (not stated for inputs).
- Medication/time strings "8am + 8pm" are free text; Bangla time format ("সকাল ৮টা") not covered.
- Voice input is not on this page.
- Pet name "Tito" in Bangla copy: "তিতো" (spec content block). Names (pet name) are user data; the BN helper text interpolates the pet name.

### 1.5.13 Assumptions
- The owner has the vet's name, clinic and phone available (outline worry: "doesn't require info she doesn't have"; yet vet contact is required for Moderate/Severe).
- Insulin dose/timing are known and comparable across providers (free-text dose).
- A condition severity (Mild/Moderate/Severe) is owner-assessed, not vet-verified.
- Brand lists for BD exist and "provider's brand" vs profile brand can differ (1.6 says "provider's brand").
- Diagnosis date approximate; "8 months" shown as a duration (data stored as date or duration not decided).

### 1.5.14 Gaps / contradictions
- G-13, G-16, G-1.
- Spec states "no specific mockup" while `15-pet-profile-management.html` exists (stale reference; mockup was built from the spec).
- Outline "Default empty form: all fields empty" vs spec layout showing Tito's values; first-time create form must be empty; Tito values are example data only.
- Required-field enumeration missing; disabled-vs-error behaviour of Save conflicts (see states).
- Energy level: Calm (outline) vs Moderate (spec layout) vs UI default.
- Allergies: radio group vs multi-toggle; "None known" mutually exclusive rules undefined.
- Medication UI: outline = toggle switch -> dosage sub-form; spec = repeating cards. Mockup shows repeater with "Frequency" and "Route".
- Mockup 15 vet-contact is marked required ("*") even in a state where severity is not selected - consistent with default Moderate shown.
- Dog exercise/outdoor fields vs "Exercise needs" textarea: the PRD wants structured dog walking/outdoor-access fields; spec only gives free text.
- No "age in months" or date-of-birth; no neutered for female wording; no insulin-storage check against provider capability.
- Weight 6 kg (UJ-1) vs 7 kg (scenario). Profile snapshot vs live link semantic (denormalization vs "Edit Tito's profile" from 1.6) - is the booking snapshot re-synced if the profile is edited after submission? Not defined (PRD FR-15 says snapshot).
- Draft storage: "Save as draft" persisted server-side or locally? Spec: 1.5 draft saved to dashboard; 1.7 draft is serialized to localStorage - inconsistent storage; cross-device drafts not possible for 1.7.
- PRD FR-6 says "archive Pet Profiles" - no archive action on this page.

---

## 6. Page 1.6 - Booking Configuration

### 1.6.1 Identity
- **Page ID / name:** 1.6 Booking Configuration. **Role:** Owner.
- **Route:** `/book/[providerSlug]/configure`, query `petId` (default last-saved pet), `start`, `end`. State: URL query (durable) + in-memory form state (lost on refresh - "preserve prompt").
- **Mockup:** `04-booking-configuration.html` (older content; see 1.6.14).
- **Spec status:** `validated`.

### 1.6.2 Purpose
Capture stay-specific care (dates, food/medication overrides, add-on services, free-text instructions) so the provider can confirm with full information and no WhatsApp follow-up (PRD FR-6/FR-8/FR-12/FR-15).

### 1.6.3 UI components
Back nav ("Book Rashid"); stay-dates card (`card.muted`, radius-lg, date range text + edit link + availability pill `booking-state.captured`); date picker modal; pet card (`card.flat`, photo thumb, summary line, "Edit Tito's profile" link); toggles `role=switch` "Use Tito's saved food" / "Use Tito's saved medication" (default ON, read-only card when ON, editable fields on OFF with 200 ms expand); additional services checkbox list (price per row, live total `aria-live`); special-instructions textarea (1000 chars) with counter (muted <=800, amber 801-1000, red >1000) and voice-input mic icon (Web Speech API); emergency contact block (read-only vet line with `tel:` link + backup contact); sticky price summary (itemised table, total hold, helper) with `button.primary size.lg` and `button.variant.outline` "Save as draft"; capacity-conflict banner (`role=alert`, focus moves to it, replaces D1); "choose another provider" link.

### 1.6.4 User actions
| Action | Result |
|---|---|
| Tap date range / edit | Opens date picker modal (full Eid window defaults +/-). On change: debounced 500 ms capacity re-check. |
| Tap "Edit Tito's profile" | Routes to 1.5 in edit mode, preserving booking draft. |
| Toggle "Use Tito's saved food" OFF | Expands editable Food fields: food type, brand, schedule, treats, allergies; validate-on-blur. |
| Toggle "Use Tito's saved medication" OFF | Expands editable Medication fields: medication, dose, frequency, administration, notes. |
| Check/uncheck add-on services | Updates "Selected services total" and price summary live. |
| Type instructions | Live counter; mic icon inserts recognized text (Bangla + English). |
| Tap vet phone | Opens dialer (`tel:`). |
| Tap "Review & submit booking request ->" | Runs inline validation then routes to 1.7 `/book/[slug]/review`. |
| Tap "Save as draft" | Saves full state, returns to dashboard. |
| Tap "choose another provider" (conflict banner) | Routes to `/search` with filters preserved. |

### 1.6.5 States
- Default pre-filled (first booking): food/medication toggles ON, medication-admin service pre-checked and "included", other services unchecked.
- Capacity-conflict: banner replaces dates card: "Rashid's availability has changed since you opened this booking - please adjust dates or [choose another provider]"; CTA disabled.
- Date-edited: availability pill shows "Available for new dates" or conflict.
- Toggle OFF (override mode).
- Free-text > 800 chars: counter amber; > 1000: red; Save/CTA disabled.
- Voice input listening state: not specified (permission denied, unsupported browser, language selection).
- Refresh: form-state lost, "preserve prompt" (undefined UI).
- Returning-user/Scenario 02: separate "Book again" route bypasses this page's pre-fill; this page is "still the stay-specific step".
- Pet with no profile / provider not accepting species: not specified.
- Offline/save error: not specified.

### 1.6.6 Data displayed
| Field | Source |
|---|---|
| Stay dates, nights count, availability | Query + Date-Level Capacity |
| Pet summary (name, breed, age, weight, "Diabetic - Insulin BID", photo) | PetProfile |
| Saved food: "Low-carb kibble - Acme Diabetic", "2 meals/day - 8am + 8pm", treats, allergies | PetProfile.diet (outline says "Low-carb kibble (provider's brand)") |
| Saved medication: "Insulin - 2 units - BID 8am + 8pm; Refrigerated - cooler pack" | PetProfile.medications |
| Services + prices: Extra walk BDT 300/walk, Extra attention/play BDT 400/day, Basic medication administration BDT 0 (included for medical cases) | Provider.services (published service list) |
| Vet contact (read-only, from profile): "Dr. [Name] - Gulshan Veterinary - +880-XXX-XXXX" | PetProfile.conditions.vetContact |
| Backup contact: Owner phone from sign-in ("+880-XXX-XXXX") | Owner.phone |
| Price summary: Base BDT 2,200 x 9 nights = BDT 19,800; Additional services BDT 0; Platform fee: included; Total authorization hold BDT 19,800 | Pricing calc |
| Char counter ("142 / 1000" in sample) | Local |

### 1.6.7 Data required / captured
| Field | Type | Req? | Notes |
|---|---|---|---|
| Stay start / end | date range (symbolic Eid-1/Eid+9 default) | Required | |
| useSavedFood | boolean | default true | |
| Food override: food type, brand, schedule, treats, allergies | same types as 1.5 | when toggle OFF | |
| useSavedMedication | boolean | default true | |
| Medication override: medication, dose, frequency, administration, notes | same as 1.5 | when OFF | |
| Additional services | multi-select from provider list; "Extra walk" per walk (quantity not captured), "Extra attention/play" per day (days not captured), "Basic medication admin" boolean | Optional | quantities unspecified (e.g., how many walks? price is "per walk") |
| Special instructions | text <= 1000 chars (voice or typed) | Optional (pre-filled helper text) | pre-filled sample: "Insulin log on the white board in the dedicated pet room; please text me if glucose looks off." (a hard-coded personal example; should not be a default) |
| Emergency contact | read-only vet + backup phone | derived | no editing here |
| petId | reference | Required | |

### 1.6.8 State transitions and navigation
- Creates/updates a **draft booking** (state not named in PRD; PRD FR-14 states start at `requested`). "Save as draft" persists the entire form (spec: returns to dashboard).
- Next: 1.7 (`/book/[providerSlug]/review`, query mirrors form state). Edit pet -> 1.5 edit; "choose another provider" -> `/search`.
- No payment state change here.
- 1.7 "Edit" returns here with a focus hash per section.

### 1.6.9 Validation
- Capacity re-checked on every date change (FR-12): debounced 500 ms; invalid -> conflict banner + CTA disabled.
- Instructions limit 1000 chars; counter colors at 800/1000; CTA disabled >1000 ("save disabled" wording used for both Save and CTA).
- Override fields: validate-on-blur; specific rules not given.
- CTA tap runs inline validation (what is validated is not listed beyond the above).
- Minimum stay / maximum stay / past dates / provider blackout dates: not specified.
- Pet weight vs provider max (12 kg) not validated here (inferred gap).

### 1.6.10 Integration points
- Availability/capacity API (re-query on date change).
- Pricing API/calculation (provider rates, services).
- Browser Web Speech API (voice dictation, Bangla + English) - browser service; no other integration; no payment call yet.
- Draft persistence API or local storage (unspecified).

### 1.6.11 Business rules
- Base price = nightly rate x nights (BDT 2,200 x 9 = BDT 19,800); platform fee shown as "included" (no number); total authorization hold = base + selected services.
- Service prices: Extra walk BDT 300/walk; Extra attention/play BDT 400/day; Basic medication administration BDT 0, pre-checked and "included for medical cases".
- Services must come from the provider's published list - no upsell beyond what the provider offers; no price change after confirmation ("what Bibi sees is what she pays").
- No re-asking what the profile captured; no "contact provider for custom requests" workaround.
- Free-text limit 1000 chars (amber at 801, red above 1000).
- Capacity re-check on every date change; debounce 500 ms; expand animation 200 ms.
- Helper "No charge until provider confirms" (mandatory copy).
- Labels visible above fields (no floating labels).
- Emergency vet contact is surfaced to provider; "runbook owner-notification cadence can fire from this data" (PRD FR-27 context).

### 1.6.12 Bangla / English
- EN+BN given: page title ("Configure your booking with Rashid"), all 8 section headings, availability line, edit-profile link, both toggle labels, helper, primary CTA, secondary CTA.
- No BN: service names, price rows, counters, error/banner text, placeholder text, voice states, emergency contact labels.
- Prices: "BDT 19,800" Latin prefix; BN digits in BN mode implied (see 1.7 callout).
- Voice input accepts Bangla and English; no language switch control specified (inferred: uses UI language or auto-detect).
- Provider name in title is interpolated (রশিদের - possessive suffix attached to name; BN grammar for arbitrary provider names needs a rule, e.g., "রশিদের"); same for the pet name "তিতোর".
- Free text may be Bangla; counter counts characters (Bangla conjuncts: grapheme vs code point counting is unspecified).

### 1.6.13 Assumptions
- Provider's service list and prices exist in the Provider record at published rates and don't change between 1.4 and 1.6.
- Overnight dates "9 nights" equals the unit of billing; no check-in/out times.
- Owner's phone (from sign-in) can be shown/used as backup contact even though 1.2 states phone is not shared with providers until confirmation. This is shown on a screen ("Backup: Bibi - +880-XXX-XXXX") but its visibility to the provider before confirmation is not stated; the data-sharing rule is ambiguous.
- Pre-checked "Basic medication administration" is appropriate for every medical profile.
- The browser supports Web Speech API for Bangla (Android Chrome support for bn-BD is assumed).

### 1.6.14 Gaps / contradictions
- G-10, G-15, G-16, G-1.
- Mockup 04 differs: 4-step wizard (Dates, Pet, Care, Review) with "Care for Tito" and Save in header, dates with check-in/out times "Mar 28, 9:00 AM -> Apr 05, 6:00 PM" and "8 nights - 9 days", Tito "6 yrs", food "Royal Canin - Diabetic formula", meals 7 AM / 7 PM (vs 8am/8pm in spec), insulin Caninsulin 7 AM / 7 PM, care-flags multi-select (Diabetic, Anxious, Senior, Allergies, Post-surgery, Heat-sensitive), vet "Gulshan Pet Clinic, Dr. Khan, 0.8 km away" with "Change" action (spec: vet read-only), CTA "Review & confirm stay ->" (spec: "Review & submit booking request"), footer note "Payment is authorized on confirmation, captured only when Rashid accepts" (conflicts with 1.7: authorization placed at submission; capture on confirmation), no additional-services section, no price summary, no toggles. The spec wins; flag the mockup wizard/pickup-dropoff concepts (pickup/drop-off is PRD out of scope for v1) as conflicts.
- Check-in/check-out time not specified in spec; the mockup assumes time slots.
- Quantities for per-walk/per-day services are missing; total formula incomplete.
- Pre-filled instruction text is Bibi-specific demo copy, yet described as "pre-filled helper" - runtime behaviour: placeholder vs default value unclear.
- "Save as draft" vs 1.7's localStorage-only draft; draft server model undefined.
- Spec says the page re-runs capacity per FR-12, but PRD FR-12's block is "at submission" - spec adds a block here and at 1.7; consistent.
- "Provider has full capacity for these dates" (outline) vs spec "Rashid is available all 9 nights" (no mention of species-specific capacity, e.g., cats vs dogs).
- Care flags (anxiety, etc.) from the profile are not shown on this page except "Diabetic - Insulin BID"; where "anxiety note (loud fireworks stress; needs the quiet room)" from scenario Q8 step 6 is captured: not in this spec (it lives in 1.5 "Special-attention" only, while the scenario lists it as a 1.6 input). Gap: provider-facing request needs the anxiety info; ensure it flows from 1.5.
- "Quiet room needed" is a provider facility requirement; no field to request it.

---

## 7. Page 1.7 - Booking Submission + Payment Authorization

### 1.7.1 Identity
- **Page ID / name:** 1.7 Booking Submission + Payment Authorization ("Review your booking"). **Role:** Owner.
- **Route:** `/book/[providerSlug]/review`; query mirrors 1.6 form-state. Submission: POST `/bookings` with `authorization_hold_id` from the gateway (spec). Payment SDKs "loaded inline on first need".
- **Mockup:** `17-booking-submission-payment.html` (annotated "THE COMMIT MOMENT", FR-1/FR-17/FR-18). Spec frontmatter instead cites `05-booking-confirmation.html` as `related_mockup`, and that mockup is the confirmed/captured state - it belongs to a later state than 1.8's waiting state. Mapping conflict.
- **Spec status:** `validated`.

### 1.7.2 Purpose
Final read-only review and payment-authorization hold at submission; capture happens only when the provider confirms (PRD FR-15, FR-39, FR-40).

### 1.7.3 UI components
Back nav "Configure your booking"; provider summary card (photo, "Rashid · Gulshan", "Tier-A · 4.9 ★ · 47 reviews", map snippet); review cards per care dimension (Pet, Dates, Food, Medication, Additional services, Special instructions, Emergency contact), each with an "Edit" link (`button.variant.link`) -> 1.6 section; itemised price table (tabular-nums); payment-method radio group `<fieldset><legend>` (bKash default, Nagad, Card); dynamic sub-forms: bKash phone input + "Continue to bKash OTP" (OTP step in a gateway SDK modal), Nagad (analogous), Card (card number / expiry / CVV / "Billing ZIP (BD postcode)" via a hosted-fields card form named "Stripe Elements" in spec); authorization callout (`info-soft`, `<aside role=note>`); cancellation policy `<details>` collapsible with "See full policy" link; sticky `button.primary size.lg` "Submit booking request ->" (`aria-busy`/`aria-disabled` during submit); "Save as draft" outline button; loading progress bar/spinner with 30 s timeout.

### 1.7.4 User actions
| Action | Result |
|---|---|
| Tap "Edit" on a section | Returns to 1.6 with that section focused (hash). |
| Select payment method (radio) | Swaps sub-form; bKash is default. |
| Enter bKash phone + "Continue to bKash OTP" | Opens gateway OTP step (SDK modal); on success, authorization hold id returned (details inside gateway; PetCare doesn't see the OTP). |
| Enter card fields | Tokenized by gateway form. |
| Expand cancellation policy | Shows copy (not in spec; mockup text exists). |
| Tap "Submit booking request" | Validates, triggers gateway authorization, POST `/bookings`. States: submitting (CTA disabled, spinner/progress bar, 30 s timer); success -> 1.8; fail -> inline error + "Try another payment method"; timeout -> message + retry. |
| Tap "Save as draft" | Serializes form state to localStorage; returns to dashboard; dashboard shows draft. |
| Back | 1.6 with form preserved. |

### 1.7.5 States
- Default review (bKash pre-selected, sub-form visible, CTA enabled).
- Submitting (State 2): CTA disabled, spinner replaced by progress bar, 30 s timeout timer, 5-15 s typical.
- Authorization-success: route to 1.8 with auth id held; server mirrors hold.
- Authorization-fail (State 3): inline error under sub-form; CTA re-enabled; "Try another payment method" link; `role=alert`.
- Gateway-timeout (State 4): "Connection slow - try again or save as draft"; CTA re-enabled; draft preserves state.
- Save-as-draft.
- Payment-method modal (outline mentions a modal selector; spec uses inline radio group - conflict).
- Not specified: capacity conflict discovered at submission (FR-12 says blocked at submission - UI/message not defined on 1.7); duplicate-submit/idempotency; session expiry; double-tap; offline; payment method on file/saved card (explicitly excluded "saved-card-default"); bKash wallet insufficient funds; user abandons gateway modal; hold amount changed.

### 1.7.6 Data displayed
Provider (name, neighborhood, tier, rating, review count, map), pet summary, dates/nights, food, medication, add-on services, special instructions, emergency contact (vet + owner backup phone), price breakdown (Base BDT 2,200 x 9 = BDT 19,800; Additional services BDT 0; Platform fee included; Total authorization hold BDT 19,800), selected payment method, authorization language with the live amount, cancellation policy.

### 1.7.7 Data required / captured
| Field | Type | Req? | Notes |
|---|---|---|---|
| Payment method | enum bKash / Nagad / Card (single per booking - FR-15) | Required (bKash default) | |
| bKash/Nagad registered phone | phone | Required for MFS | Spec: "bKash-registered phone"; prefilled from sign-in? (not stated) |
| bKash/Nagad OTP | gateway-handled | Required | |
| Card: number, expiry, CVV, billing ZIP (BD postcode) | via gateway fields | Required for Card | PRD NFR-9: gateway tokenizes; PetCare shouldn't see card data. "Billing ZIP" implies AVS (inferred) |
| Authorization acknowledgement | implicit by tapping Submit (no checkbox) | - | Legal consent via button + callout copy |
| Booking payload to API | Pet snapshot, Care Configuration, dates, services, instructions, provider, payment authorization reference | - | per FR-15 |

### 1.7.8 State transitions and navigation
- Submission creates a Booking: `requested` -> `authorized` (FR-14/FR-15) once the gateway confirms the hold. Spec doesn't say whether the Booking record is created before or after authorization (inferred: after success, POST `/bookings` with `authorization_hold_id`); the two states `requested` and `authorized` are collapsed in the UI.
- Also: Pet profile snapshot attached to booking; Care History entry begins ("commit moment - first care-history seed lands here"). PRD FR-7 says care history accumulates Care Configurations submitted, Confirmed Stays, Reviews, Declines - so submission contributes a Care Configuration (inferred).
- Hold amount BDT 19,800; no capture.
- Next: success -> 1.8 `/bookings/[bookingId]`; fail -> stays; draft -> dashboard.
- Draft: booking in `draft` state (not in PRD FR-14 list) (inferred).

### 1.7.9 Validation
- Payment method must be chosen; sub-form fields validated by gateway SDK (rules not specified).
- Timing: 30 s gateway timeout; 5-15 s expected.
- Errors: inline below sub-form; "Try another payment method". Strings not specified except timeout copy: "Connection slow - try again or save as draft".
- Capacity block at submission: FR-12 requires blocking; no UI text here (gap).
- Confirm that the Total hold equals the sum from 1.6 (no change).

### 1.7.10 Integration points
- **Payment gateway (generic):** (a) initiate authorization hold for amount BDT 19,800 with method bKash/Nagad/Card and a booking/draft reference; (b) MFS OTP step in gateway UI; (c) return `authorization_hold_id`/status success/fail/timeout; (d) later release (on decline/timeout/cancel) and capture (on confirmation) from 1.8's lifecycle. Do not assume these map to real SSLCommerz/bKash/Nagad semantics (G-4; PRD A-8).
- Booking API: POST `/bookings`.
- Notifications: server notifies provider of new request (implied by 1.8 "PetCare notified Rashid").
- Local storage for drafts. No SMS from this page; photo storage not involved.

### 1.7.11 Business rules
- Authorization, not capture; capture on provider confirmation only; hold released automatically on decline or timeout (PRD FR-15, FR-17, FR-39).
- Authorization language (mandatory, exact): "By tapping Submit, you authorize PetCare to place a hold on your account for BDT 19,800. Your account is charged only when the provider confirms. If the provider declines or doesn't respond in the confirmation window, the hold is released automatically."
- No hidden fees; "Platform fee: included"; no "Book now!" or urgency copy; no subscription/auto-renew/saved-card-default; single-booking authorization.
- Payment default bKash (MFS-first, FR-40); card secondary and not default.
- Gateway timeout 30 s; typical 5-15 s.
- Cancellation policy must be visible (collapsible); actual rules undefined in spec (mockup: free up to 48 h before start; within 48 h a 50% fee if provider already confirmed).
- Total line `aria-label="Total authorization hold: BDT 19,800"`.
- Brand rule: Rashid's typical confirmation time is informational, not coercive.

### 1.7.12 Bangla / English
- EN+BN given: page title, section labels (one row), authorization callout (BN is a shortened paraphrase: it omits "PetCare" subject and "on your account" detail: "সাবমিট চেপে আপনি BDT ১৯,৮০০ ধরে রাখার অনুমতি দিচ্ছেন" - legal text needs reviewed BN), cancellation policy label, Submit CTA, Save-as-draft.
- No BN: payment-method labels, sub-form labels, errors, timeouts, "included", edit links.
- Currency: "BDT ১৯,৮০০" - Latin "BDT" + Bangla digits in BN mode. Mockup 17 uses "BDT". PRD notes no locale-specific formatting beyond Bangla/English.
- bKash and Nagad are brand names, kept in Latin script in BN UI (inferred).
- Card form is gateway-localized (language not specified).
- Provider "Rashid" appears as "রশিদ" in BN pages.

### 1.7.13 Assumptions
- A gateway exists in which bKash/Nagad can hold funds without capture and release automatically on timeout (contradicted by PRD glossary/A-8) and Stripe-like card auth capture.
- The hold persists for the full confirmation window (6-12 h per 1.8; 24 h per mockup 17).
- The booking total is fixed at submission (no later extras).
- The Owner's bKash phone may differ from the sign-in phone.
- Owner phone is sharable as backup contact before confirmation (see 1.6).
- Draft is acceptable as local-only state.

### 1.7.14 Gaps / contradictions
- G-4, G-5, G-9, G-10, G-1.
- Mockup 17 conflicts and extras: bKash sub-form says "bKash-registered phone +880" then "Continue to bKash OTP"; callout says hold released "if he declines or doesn't respond in 24 hours" and "on your bKash" (spec: generic "your account", "confirmation window"); "Cancellation policy - See full policy" followed by explicit policy text; insulated Hill's w/d brand and "Dr. Rahman" vet (spec: Acme Diabetic and Dr. [Name]); provider card "4.9 · 47 reviews · 12 diabetic dogs" (spec "4.9 ★ · 47 reviews"); "TIER-A" label upper-case; medication row with warning icon and "special handling" (spec lacks the callout).
- Spec says Total = authorization hold with no "service fee"; mockup 05 shows a service fee on top of the stay price (G-10).
- Spec's mockup reference (`05-booking-confirmation.html`) mismatches the mockup that was actually built for this page (`17-...`).
- No time-out semantic for abandoned bKash OTP step; no idempotency or "submitted but response lost" recovery (booking could be created while UI shows timeout).
- Whether authorization happens before the Booking record exists (hold id needed in POST body) vs booking created in `requested` first (FR-14 has `requested` then `authorized`): ordering undefined.
- Outline says "Tap payment-method selector - modal opens (bKash / Nagad / Card)" vs spec inline radio.
- "Cancel this request" exists on 1.8, yet the policy text for cancel fees is on 1.7 only as a link.
- Submit CTA is "sticky" per D14 but placed in layout after the policy; keyboard/focus order not an issue, but mobile viewport for large forms: sticky CTA overlaps card form fields (inferred UI risk, not specified).
- Idempotency, PCI scope, and BD-postcode label ("Billing ZIP (BD postcode)") - Bangladesh uses postal codes, not ZIP; mixing terms.
- Outline says the screen is a "commit moment where the first-care-history seed lands" while authorization may fail afterward; care-history write timing vs failure unspecified.

---

## 8. Page 1.8 - Booking Confirmation State (Waiting on Provider)

### 1.8.1 Identity
- **Page ID / name:** 1.8 Booking Confirmation State (Waiting on Provider). **Role:** Owner.
- **Route:** `/bookings/[bookingId]` - SSR, deep-linkable, link-shareable (sharing a booking page raises privacy concerns, see gaps).
- **Mockup:** spec-only for the waiting state. `05-booking-confirmation.html` is the *confirmed/captured* variant ("Tito's stay is confirmed", "Captured · Confirmed", Booking ID PC-2847, payment 5,600 + service fee 280 = 5,880 "Paid via bKash"), which corresponds to the provider-confirmed state, not the waiting state; spec 1.8 itself says "No specific mockup maps here cleanly".
- **Spec status:** `validated`.

### 1.8.2 Purpose
Confirm that the request was sent and the hold placed, show a status timeline and confirmation window, and let the owner step away (PRD FR-14, FR-15, FR-16, FR-17).

### 1.8.3 UI components
Back nav "Dashboard"; success hero (`success-soft`, 64 px check icon, `role=status`, auto-focus on mount); h1 + sub; booking summary card (`card.muted`, tabular-nums, Booking ID 12 px muted); vertical status timeline `<ol>` with `aria-current="step"`, dots (forest filled for current/passed, muted pending), connector lines, `<time>` elements; confirmation-window callout (`info-soft`, p-4); helper text; `button.primary size.lg` "Done"; destructive link "Cancel this request"; cancel `<dialog>` (native, elevation.xl); decline reason chip; "View booking" CTA (after confirm); "Find another provider" CTA; "Message provider" disabled control (outline); reassurance line (`role=note`).

### 1.8.4 User actions
| Action | Result |
|---|---|
| Tap "Done" | Replaces history entry and routes to the owner dashboard (booking visible as a card). Back-button from dashboard doesn't return here. |
| Tap "Cancel this request" | Opens cancellation modal; on confirm: hold released, booking canceled, route to dashboard. |
| Tap back "Dashboard" | Dashboard. |
| Tap "Message provider" (outline) | Disabled: "Chat opens once your booking is confirmed". Not in spec layout. |
| Tap "View booking" (post-confirm) | Routes to in-stay prep (next scenario). |
| Tap "Find another provider" (declined/expired) | Routes to 1.3 with filters preserved. |
| Receive provider confirm/decline push or poll update | UI state changes (see states). |

### 1.8.5 States
| State | Behaviour |
|---|---|
| State 1: just submitted (default) | Hero, summary, timeline step 1 active "just now", polling every 30 s starts, push subscription active. |
| State 2: provider confirmed | WebSocket `booking.confirmed` event; polling stops; timeline steps 1-3 active; CTA becomes "View booking"; toast "Rashid confirmed" (confetti-free); payment captured (server side, PRD FR-39); chat opens. |
| State 3: provider declined | `booking.declined`; decline reason chip (FR-17 taxonomy; spec cites FR-24); CTA "Find another provider" -> 1.3; booking state `declined`; hold released. |
| State 4: window expired | Timeline collapses; friendly empty state; hold released automatically; CTA -> 1.3. |
| State 5: cancellation modal | `<dialog>`; confirm releases the hold and routes to dashboard. |
| State 6: declined with care context | If reason is "capacity" or "pet-safety concern": extra copy "(Provider chose to decline because...)" informational, not blamey. Note taxonomy mismatch below. |
| Confirmation-window-expiring | 1 hour before timeout: banner "Rashid has 1 hour to respond - we'll release the hold if he doesn't" (outline only; note this exposes the timeout and could act as urgency, though phrased as informational). |
| Capacity-just-changed | Rare: polling diff; "re-confirmation request to Bibi" (outline) vs "No forced re-confirmation" (must-not list) - contradiction. |
| Not specified | Page opened by someone else (non-owner), offline/poll failure, booking not found, payment-capture failure after provider confirms, partial states (`captured` -> `in-stay`), provider confirms while owner cancels (race), hold-release failure, expired-window provider timeout flagged to Admin (FR-16). |

### 1.8.6 Data displayed
| Field | Source |
|---|---|
| Provider: "Rashid · Gulshan · Tier-A" | Provider |
| Pet: "Tito · Diabetic" | PetProfile snapshot |
| Dates: "Eid-1 -> Eid+9 · 9 nights" | Booking |
| Total hold: BDT 19,800 | Booking.payment |
| Booking ID `PC-2026-0001` (sample; also mockup `PC-2847`) | Booking |
| Timeline steps 1-6 + timestamps ("just now") | Booking state log (NFR-22) |
| "typical: 2 hours" provider review time | Provider response stat |
| Confirmation window text (6 h; Eid 8-12 h) | Policy config (OQ-1) |
| Decline reason chip + explanatory copy | Booking.declineReason (FR-17) |

### 1.8.7 Data required / captured
- None from the user (no form). Cancellation modal may capture a reason (not specified). Notification subscription (push) created on mount.

### 1.8.8 State transitions and navigation
- Entry state: Booking = `authorized` (after `requested`); hold placed.
- Provider confirm: -> `captured` -> `in-stay` at stay start (FR-14/FR-16/FR-18); payment captured.
- Provider declines: -> `declined` (reason recorded; contributes to Care History per FR-17); hold released.
- Window expires: hold released; booking state unspecified (FR-16: admin-visible timeout signal; there is no `expired`/`timed-out` state in PRD FR-14) (gap).
- Owner cancels: -> `canceled` (FR-14 mentions `canceled` via policy); hold released (FR-15).
- Timeline mapping: Step 1 submitted (requested/authorized), Step 2 provider reviews, Step 3 confirmed (captured), Step 4 Stay begins (in-stay), Step 5 stay ends + completion (completed), Step 6 verified review (FR-20/21). Report-an-issue window not shown as a step although the outline says the timeline "includes post-stay verified review + report-issue windows".
- Next: dashboard; 1.3 (declined/expired); next-scenario in-stay prep.

### 1.8.9 Validation
- Cancel requires confirmation in modal. No form validation. Polling only.
- Timing: poll 30 s; expiry banner 1 h before; confirmation window 6 h (peak 8-12 h per spec; mockup 17: 24 h).

### 1.8.10 Integration points
- Booking API (GET status), real-time channel (WebSocket with polling fallback; events `booking.confirmed`, `booking.declined`), **notifications** (push subscription on mount, unsubscribe on unmount; owner notified on confirm/decline/expiry), **payment gateway** (release hold on cancel / expiry / decline; capture on confirm - triggered server-side), Admin timeout signal (PRD FR-16). No SMS (not stated; SMS fallback for confirmations is not specified). No photo storage.

### 1.8.11 Business rules
- Confirmation window: 6 hours; during Eid peak 8-12 hours (copy rule). Provider typical review 2 hours.
- Hold released automatically if provider doesn't respond.
- No capture until confirmation. No urgency bait; no WhatsApp follow-up suggestion; no "see other providers while you wait" upsell; no forced re-confirmation.
- Reassurance copy mandatory: "Your request is the first thing Rashid sees when he opens PetCare. You don't need to follow up." and "We'll notify you the moment Rashid confirms."
- Timeline always visible with 6 steps; current step highlighted; polling silent (no aria-live), announce only on state changes.
- "Done" replaces history entry.
- Booking ID readable for support (format `PC-2026-0001` implies PC-<year>-<sequence> (inferred)).
- Decline messaging informational, not blamey.

### 1.8.12 Bangla / English
- EN+BN given: hero h1/sub, summary header, timeline header + 6 steps, confirmation callout, reassurance (both), Done, Cancel.
- No BN: toast/banners, decline reason chip text, cancellation modal copy, "View booking", "Find another provider", empty state, Booking ID label.
- "Eid-1" shows as "ঈদ-১" in BN; "Step 4: Stay begins (Eid-1)" -> "থাকা শুরু (ঈদ-১)".
- Time formats for timestamps (`<time>`): unspecified; "just now", "typical: 2 hours" need BN phrases and BN numerals.
- BN confirmation text: "ঘণ্টা", "৬ ঘণ্টা"; peak "৮–১২ ঘণ্টা".

### 1.8.13 Assumptions
- Push notifications can reach a PWA user (see G-8); the user may have opted in (permission prompt not specified anywhere).
- Provider typically responds within 2 hours and a 6 h window is sufficient; Eid 8-12 h flexible window needs system config.
- WebSocket support on low-end Android over intermittent 4G; polling fallback every 30 s.
- Booking pages are SEO/deep-link shareable (SSR) despite containing private data (inferred: must be auth-gated, but spec says "SSR for SEO and link-shareability").

### 1.8.14 Gaps / contradictions
- G-5, G-8, G-9, G-1, G-24 (below).
- Decline reasons: spec's State 6 mentions "capacity" or "pet-safety concern" as decline reasons; PRD FR-17 taxonomy: cannot administer medication, cannot accommodate high-anxiety pets, cannot support senior/limited-mobility pets, care requirements exceed capacity, facility/environment not suitable, generic decline. "pet-safety concern" isn't in the taxonomy.
- Expiry has no PRD Booking state; "hold-released" state is a UI state without a model.
- "Message provider" disabled control appears in outline only; chat opens after confirmation (PRD FR-44) - 1.4 outline says "after you submit".
- Timeline step 6 "Verified review" occurs weeks later; this page is the booking detail route used for the entire lifecycle (`/bookings/[bookingId]` is a general booking page), but only the waiting state is specified here; later states belong to other scenarios.
- Back nav says "Dashboard" and "Done" returns to dashboard: no spec for the owner dashboard in this scenario (home-with-bookings; mockup 01-home shows a different "home").
- Confirm toast says "routes to in-stay prep (next scenario hook)" and 'CTA changes to "View booking"' while the state machine (outline) says "tap Done -> dashboard"; 2 different CTAs for the confirmed state.
- The outline has a confirmed-state "Confetti-free success toast"; outline says capacity change may cause "re-confirmation request to Bibi" vs the must-not list "No forced re-confirmation".
- Booking ID sample "PC-2026-0001" implies it is the first booking ever; real IDs must be generated.
- Step 5 and 6 wording (completion, review) vs PRD FR-19 (provider marks complete; owner prompted to confirm completion and review).
- 1.8 outline: "Fear #1 timeline includes report-issue windows" - not visible in the 6 steps.

---

## Section A. One-table summary of all pages

| ID | Name | Route | Mockup? | Key entities |
|---|---|---|---|---|
| 1.1 | Landing / Marketing Home | `/` (outline: `/landing`) | `01-home.html` mapped but is a logged-in home, not the landing (effectively spec-only for the marketing layout) | Review (display only), Locale, Session |
| 1.2 | Owner Sign-In (Phone OTP) | `/sign-in` (+ `/sign-in-email` stub) | spec-only | Owner, OTP challenge, Session, Neighborhood |
| 1.3 | Curated 3-5 Shortlist | `/search`, `/search/all` | `13-curated-shortlist.html` (+ `.component.md`); `02-search-results.html` replaced | Provider, Tier, DateCapacity, Review aggregate, DemonstratedFit, SavedSearch |
| 1.4 | Provider Profile - Public | `/providers/[slug]` | `03-provider-profile.html` (content differs) | Provider, Review, DateCapacity, FitStat, VetClinic, SavedProvider, Service/Price |
| 1.5 | Pet Profile Management | `/pets/new`, `/pets/[petId]/edit` | `15-pet-profile-management.html` (spec says none) | PetProfile, Condition, Medication, Diet, Photo, VetContact |
| 1.6 | Booking Configuration | `/book/[providerSlug]/configure` | `04-booking-configuration.html` (content differs) | Booking (draft), CareConfiguration, ServiceSelection, Pricing |
| 1.7 | Booking Submission + Payment Authorization | `/book/[providerSlug]/review` | `17-booking-submission-payment.html` (spec cites `05-...` in frontmatter) | Booking, PaymentAuthorization, PaymentMethod, CancellationPolicy |
| 1.8 | Booking Confirmation (Waiting on Provider) | `/bookings/[bookingId]` | spec-only for waiting state (`05-booking-confirmation.html` is the confirmed state) | Booking, BookingStateLog, Notification, DeclineReason |

---

## Section B. Data entities and fields implied by these pages

(Fields are as shown or captured in these pages; inferred fields are marked.)

**Owner**: id (inferred); phone (verified, +880); displayName; defaultNeighborhood (enum 7 values - see G-3); locale (`pc_locale` cookie; also persisted server-side inferred); sessionToken (`pc_session`); createdAt (inferred).

**OtpChallenge** (inferred): phone, code (6 digits), sentAt, expiresAt, attempts, resendAvailableAt (60 s).

**Provider**: id, slug (e.g., `rashid-gulshan-tier-a`), name (+ BN name), tier (A/B), isAdminIntroduced (Tier-A badge, FR-5), status approved (FR-5), neighborhood, geoLocation/distance origin, photos[], yearsHosting, ratingAvg, reviewCount, reviewWithPhotosCount, repeatOwnerCount, responseTimeMedian, profileCompletenessPct, facility[] (dedicated pet room, catio, quiet room), speciesAccepted + size limit (dogs up to 12 kg, cats, senior, diabetic), capabilityFlags (insulin, oral meds, eye drops, special diet; FR-3), vetOnCall (VetClinic ref + distance), pricePerNight, services[] (name, unit price, unit: per walk / per day / included), cancellationPolicySummary, typicalConfirmWindow/response metric.

**DateCapacity**: providerId, date, species, slotsTotal, slotsFree (FR-12).

**DemonstratedFitStat** (derived; DESIGN.md says admin-verified, never self-declared): providerId, label (e.g., diabetic small dogs handled successfully, cat boardings with medication, repeat owners with senior/special-care pets, Eid-week capacity honored), count, source booking ids (for the filtered-reviews link).

**Review** (verified, one per booking, FR-20/21): id, bookingId, providerId, rating (star), text, photos[], reviewerFirstName, reviewerNeighborhood, stayLength/dates, tags (diabetic, senior, repeat), language (inferred).

**SavedSearch** (inferred): ownerId, criteria (location, species, start, end, special flags), createdAt.
**SavedProvider** (inferred): ownerId, providerId.

**PetProfile**: id, ownerId, name, photos[] (1-5, <=5 MB), species (dog/cat), breed, ageYears, weightKg, sex, neutered, vaccinationStatus (up to date / not known / not up to date / N/A), microchipId, energyLevel (calm/moderate/high), goodWith[] (dogs, cats, children, strangers), triggers[] (free text), archivedAt (FR-6, inferred), status draft/complete (inferred).
**Condition** (child of PetProfile): name, diagnosisDateOrDuration, severity (mild/moderate/severe), vetContact {vetName, clinic, phone}, dailyCareNotes (<=500).
**Medication**: name+dose, frequency, route (oral/injection/topical/drops), notes.
**Diet**: foodType (low-carb kibble / wet / raw / home-cooked / mixed), brand, schedule, treats (<=200), allergies[] (chicken, beef, grain, dairy, other, none).
**SpecialAttention**: anxietyTriggers, comfortItems, exerciseNeeds.

**VetClinic** (directory, FR-45): name, address (inferred), phone, distance, neighborhood.

**Booking**: id (format `PC-<year>-<seq>` inferred), ownerId, providerId, petId + petProfileSnapshot, startDate, endDate, nights, careConfiguration {foodSource: saved|override, foodOverride, medicationSource, medicationOverride, specialInstructions (<=1000), emergencyContact {vet, backupPhone}}, selectedServices[] {serviceId, qty (gap), unitPrice, total}, pricing {basePerNight, nights, baseTotal, servicesTotal, platformFee ('included'), totalAuthorizationHold}, state (draft?, requested, authorized, captured, declined, in-stay, completed, disputed, resolved, refunded, canceled, no-show per FR-14; plus window-expired - gap), declineReason (taxonomy), confirmationDeadline, createdAt, stateLog[] (NFR-22).

**PaymentAuthorization**: bookingId, method (bKash/Nagad/Card), amount (BDT 19,800), gatewayAuthRef (`authorization_hold_id`), status (pending/authorized/failed/timeout/released/captured), createdAt, releasedAt, capturedAt (NFR-23).

**NotificationSubscription** (inferred): ownerId, bookingChannel, pushToken.

**DraftBooking** (inferred): serialized form state, local (1.7) vs server (1.5/1.6).

**CancellationPolicy**: content (not defined in spec; mockup 17 sample text).

**Locale/Content**: BN + EN strings for names, descriptions, instructions (FR-47).

---

## Section C. API operations implied (verb + purpose; no real-gateway contracts)

| Operation | Purpose | Pages |
|---|---|---|
| GET landing content / reviews strip | Fetch real verified review cards with photos for the home strip | 1.1 |
| POST OTP request (phone) | Send 6-digit SMS OTP | 1.2 |
| POST OTP resend | Resend after cooldown | 1.2 |
| POST OTP verify (phone, code) | Verify and create/restore session; returns owner profile (name, neighborhood if existing) | 1.2 |
| POST session refresh (silent) | Cookie-based returning-user restoration | 1.1, 1.2 |
| PATCH owner profile (name, default neighborhood, locale) | Persist display name and default neighborhood | 1.2 |
| GET neighborhoods / launch areas | Options for the picker (should respect FR-13) | 1.2, 1.3 |
| GET search (location, species, start, end, special, sort) | Curated shortlist (3-5) with availability, fit stats, price | 1.3 |
| GET search/all (same filters, pagination) | Full approved catalog | 1.3 |
| POST/GET saved search | Save criteria; list on dashboard | 1.3 |
| GET provider by slug | Public profile data | 1.4 |
| GET provider availability (providerId, start, end) | Date-level capacity validation; poll or push | 1.3, 1.4, 1.6, 1.7 |
| GET provider reviews (filters: with photos, diabetic, senior, repeat; fit link) | Reviews list with filters, pagination | 1.4 |
| GET provider price quote (providerId, dates, services) | Price breakdown modal and totals | 1.4, 1.6 |
| POST/DELETE saved provider | Favorite toggle (requires auth) | 1.4 |
| GET provider vet-clinic directory entry | Vet on call display | 1.4 |
| POST pet profile (with photos) | Create PetProfile | 1.5 |
| PUT/PATCH pet profile | Edit/draft save | 1.5, 1.6 |
| POST pet photo upload | Upload 1-5 images, <=5 MB, with progress | 1.5 |
| GET breeds / BD food brands | Autocomplete datasets | 1.5 |
| GET pet profile(s) for owner | Prefill 1.6/1.7, multi-pet selector | 1.5, 1.6 |
| POST/PUT booking draft | Save as draft (full form state) | 1.6, 1.7 |
| GET booking draft | Resume draft from dashboard | 1.6, 1.7 |
| POST availability check (providerId, dates) | Re-check on every date change; block at submission | 1.6, 1.7 |
| POST payment authorization (method, amount, bookingRef) | Place hold (generic; result: success/fail/timeout + authorization reference) | 1.7 |
| POST booking (petSnapshot, careConfiguration, dates, services, authorizationRef) | Create Booking in `requested` -> `authorized`; notify provider | 1.7 |
| GET booking by id | Status for page and polling (30 s) | 1.8 |
| Subscribe booking events (real-time/push) | `booking.confirmed`, `booking.declined`, expiry | 1.8 |
| POST booking cancel | Owner cancels pre-confirmation; release hold | 1.8 |
| POST release payment authorization | Server-side on cancel/decline/timeout | 1.8 |
| (server) capture payment on provider confirmation | Triggered by provider confirm, not by these pages | 1.8 (consumer) |
| GET cancellation policy | Content for collapsible | 1.7, 1.8 |
| POST analytics events | `shortlist_viewed`, `provider_card_tapped`, `fit_card_tapped`, etc. (component spec) | 1.3 |
| POST waitlist signup (pre-launch state) | Capture structured intake (fields undefined) | 1.1 |

---

## Section D. Hard-coded sample values that would be fabricated trust signals if shown as real data

These appear in the specs/mockups as sample content. None may ship as real data. Where a value is a UI statistic, it must be computed from real records or omitted (empty/zero states must be designed instead).

**People / identities**
- Provider "Rashid" (also "Rashid M.", slug `rashid-gulshan-tier-a`), "Farzana A." (Banani, 3.1 km), "Kamrul H." (Bashundhara, 5.4 km, Tier-B), vet "Dr. [Name]" / "Dr. Rahman" / "Dr. Khan, Gulshan Pet Clinic", "Gulshan Veterinary (1.2 km)".
- Owner "Bibi"; pet "Tito" (Shih Tzu, 4 y, 7 kg; mockups also "6 yrs", "6 kg" in UJ-1); reviewers "Sabrina" (Gulshan, 5d stay), "Bibi, with Tito - 3 stays - 2026-02-14", "Shahin, with Luna - 2 stays - 2026-01-08". A review quoting "Tito is in such good hands" from another owner is explicitly fabricated.

**Counts / ratings / stats**
- 4.9 star (Rashid), 4.8 (Farzana), 4.4 (Kamrul); landing review cards 4.9, 5.0, 4.8; "47 reviews with photos"; "28 reviews"; "2 verified reviews"; "42 verified stays", "87% with photos" (mockup 03); "6 yrs hosting"; "12 repeat owners"; "12 diabetic small dogs handled successfully"; "6 cat boardings (5 with medication)"; "4 repeat owners (3 senior-pet)"; "Eid-week honored 4 of last 4 peaks"; Farzana's "9 anxious small-breed dogs, 5 diabetic pets, 3 repeat owners"; "4 providers match"; "14 approved providers"; "52 Vetted Providers", "1.4k Verified stays with photos" (mockup 01); "Replies to requests in 1h 45m median", "typically responds within 2 hours"; "Profile completeness 100% / 70%"; "Verified-badge: Personally vetted by PetCare"; "12 kg" size limit; distances "2.4 km", "3.1 km", "5.4 km", "2.3 km".
- Availability copy: "Available all 9 nights", "3 of 4 spots open" (mockup 03), capacity strip "3/4, 2/4, Full".

**Prices / money**
- BDT 2,200/night; BDT 19,800 (9 nights); BDT 1,950/night, BDT 17,550 (Farzana); BDT 5,600/stay, service fee 280, total 5,880 (mockups 03/05); Extra walk BDT 300/walk; Extra attention BDT 400/day; medication admin BDT 0; "Platform fee: included"; hold BDT 19,800 hard-coded inside the authorization callout string and the aria-label.

**Dates / IDs / contacts**
- "Eid-1 -> Eid+9", "9 nights"; "Mar 28 - Apr 05, 8 nights" (mockups 01-05); Booking IDs `PC-2026-0001`, `PC-2847`; phone placeholders `+880 17XX-XXXXXX`, `+880-XXX-XXXX`; "Dr. [Name]" bracket placeholder.

**Copy statements that assert facts**
- "Tier-A admin-vetted providers", "Verified reviews with photos from the stay", "Daily updates while your pet is there" (trust strip), "From real Dhaka stays" (the reviews strip title implies real data), "Bilingual providers in Gulshan-Baridhara" (expat variant), "Rashid typically responds within 2 hours", "Your request is the first thing Rashid sees when he opens PetCare" (a product-behavior claim that must be true; depends on provider-side queue ordering), "Provider has full capacity for these dates", "Handled N ... successfully" (requires a definition of success), "Free cancellation up to 48 hours..." (mockup 17), "Eid-week windows may be 8-12 hours" (policy value).
- Product-level claims such as "Personally vetted by PetCare" and "Tier-A - Admin-vetted" are truthful only if admin vetting has occurred (FR-2/FR-5).
- Landing footer: "Animal Welfare Act 2017 compliance - Data Protection (draft 2023) - Trade license" - asserts compliance posture; must match actual NFR-16/17/19 status before launch.

**Not fabricated but pre-filled personal examples that must not be defaults**
- Special-instruction text "Insulin log on the white board in the dedicated pet room; please text me if glucose looks off." shown as pre-filled helper in 1.6/1.7 (a Bibi-specific example).
- Brand names (Acme Diabetic, Hill's w/d, Royal Canin Diabetic, Acana, Orijen, Caninsulin) and care values (Insulin 2 units, 8am/8pm) in 1.5/1.6/1.7 mockups.

---

## Summary note for downstream agents
- Authoritative for behaviour: the `.spec.md` files, with PRD overriding on FR-11/13/39/40/NFR-24-26, then DESIGN.md for component grammar. Mockups are illustrative only and conflict in content (see per-page 14 sections).
- Highest-priority decisions needed before build: G-2 (rank vs fit), G-3 (neighborhood set), G-4/G-5 (payment hold feasibility and window length), G-6 (default language), G-12 (how demonstrated-Fit is computed and shown at launch with zero history), G-24 (below).

**G-24** (referenced from 1.8): The scenario promises "a confirmed booking in under 10 minutes", but the scenario ends at 1.8 with the booking `authorized` and awaiting the provider (confirmation window up to 6-12 h). The metric is therefore "time to submitted request"; PRD SM-15/UJ-4 measures the 4-minute second booking from "Book again" tap to submission. Define the metric precisely before instrumenting.

**G-23**: Supporting pages implied but absent from this folder: owner dashboard (drafts, saved searches, active bookings), reviews list/lightbox page, full approved catalog view (`/search/all`), filter modal, price-breakdown modal content, cancellation policy page, HowItWorks modal content, `/apply` and legal pages, email sign-in. The scenario metadata counts 11 pages while 8 are specified.
