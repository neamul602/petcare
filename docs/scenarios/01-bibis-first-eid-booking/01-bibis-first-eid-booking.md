---
scenario_id: 01
scenario_name: "Bibi's First Eid Booking with Tito"
slug: bibis-first-eid-booking
priority: 1
persona: "Bibi the Banani-Booker (Primary — Owner)"
business_goal: "⭐ Primary — Curated-trust moat compounds through repeat bookings on-platform"
primary_driving_force: "Want #1 — Tier-A fit on first search"
format: "Screen Flow with Storyboard states on configuration + submission"
climax_beat: "Bibi clicks the top-ranked provider in the curated 3–5 shortlist and sees demonstrated-Fit signals matching Tito's diabetes — submits a confirmed booking in under 10 minutes instead of a week of WhatsApp back-and-forth"
created: 2026-08-30
status: validated
design_intent: D
design_status: not-started
pages_assigned: 11
pages: [1, 2, 3, 4, 6, 7, 9, 10, 11, 41]
---

# Scenario 01 — Bibi's First Eid Booking with Tito

> The seed transaction. If this works, the curated-trust moat begins to compound.

---

## The 8 Strategic Questions

### Q1. What transaction do we need to get really right?
Book Tito's first Eid-week boarding with a Tier-A provider whose demonstrated-Fit matches his diabetes, without a week of WhatsApp back-and-forth.

### Q2. If this transaction succeeds, which business goal does it add value to?
⭐ **Primary Objective — Curated-trust moat compounds through repeat bookings on-platform.** This transaction is the seed: it produces Tito's first care-history entry on the platform, his first verified review with photos from an actual stay, and the first demonstrated-Fit signal Rashid's profile can compound over time.

**Anchored FRs / SMs:** FR-11 (curated shortlist default), FR-13 (Launch Neighborhood filter), FR-21 (verified reviews with photos), FR-43 (per-species handling history), FR-44 (per-care-need handling history), FR-49 (demonstrated-care-fit entries), FR-19 (Tier-A admin-introduced badge), SM-7 (review-with-photos rate), SM-11 (demonstrated care-fit exposure at first search).

### Q3. Which user experiences this most, and in what real-life situation?

**Persona:** 🎓 Bibi the Banani-Booker (Primary · Owner)
**Profile:** Late-30s, Banani apartment, dual-income (BDT 80k+), 4-year owner of Tito (diabetic Shih Tzu, 8-months-post-diagnosis). Has had Tito for 4 years. Husband travels monthly; she's the primary caretaker.
**Situation:** 3 weeks before Eid. Family is going to Sylhet for 9 days. The WhatsApp-vendor loop has failed her twice already — Tito came back stressed and with an off insulin curve both times. A friend mentions PetCare over dinner.

### Q4. What do they want and what do they fear?

- **Hope:** Find a provider who has demonstrably handled diabetic small dogs, get daily photo updates showing Tito's behaviour and insulin log, submit the booking in under 10 minutes instead of the usual week of WhatsApp back-and-forth.
- **Worry:** A provider who says "yes we can handle diabetic dogs" but has never actually done it; handing Tito over and hearing nothing for 9 days; the insulin curve collapsing because the provider guessed at timing or dose.

### Q5. What device are they on?
**Mobile** — PWA-grade web app on Android, mid-range handset. Bibi is on the sofa in the evening, one hand on Tito, husband packing in the background.

### Q6. What's the natural starting point?
Bibi Googles "pet boarding Banani Dhaka diabetic dog" on her phone after a friend mentions PetCare at dinner. Top organic result is the PetCare landing page. She taps "Find care near me" → phone OTP sign-in → lands on the curated 3–5 shortlist pre-filtered to her Banani location.

### Q7. What does the best possible outcome look like — for both sides?

- **User Success:** Bibi submits a confirmed booking in under 10 minutes with a Tier-A Gulshan home-sitter whose profile shows "diabetic small dogs handled successfully" in the demonstrated-Fit band, has 4.9★ with photos from actual stays, and carries the admin-introduced badge. She leaves the screen feeling confident instead of anxious.
- **Business Success:** First completed booking that seeds Tito's care history on-platform (FR-7); first verified review with photos (FR-21, SM-11); SM-15 baseline established for the second-booking-speed climax in Scenario 02; Bibi's WhatsApp-vendor defection prevented; Rashid's profile accumulates its first special-care booking.

### Q8. The shortest path (linear sunshine path — zero branches)

1. **Landing / Marketing home** — Bibi taps PetCare from Google; sees "Special-care pets, structured care, verified reviews" pitch; taps "Find care near me"
2. **Owner sign-up / sign-in** — phone OTP; she picks Banani as her default neighborhood from the location picker
3. **Search results (curated 3–5 shortlist)** — defaults to dates Eid-1 → Eid+9, dog, Banani; 4 providers rank; top result shows the diabetic-small-dog demonstrated-Fit band
4. **Provider profile — public** — she taps the top result; sees photos, 4.9★ with photos from completed stays, "diabetic small dogs handled successfully", admin-introduced badge, capacity available for the full Eid window, price per night; taps "Book this provider"
5. **Pet profile management** — Tito's profile is new; species (dog), breed (Shih Tzu), age (4), weight (7 kg), sex (male, neutered), vaccinations (up to date), behavioural notes (calm but wary of larger dogs), conditions (diabetes, 8 months), twice-daily insulin, low-carb kibble only, no table food
6. **Booking configuration** — dates Eid-1 → Eid+9, food type (low-carb kibble — provider's brand), daily insulin timing note (8am + 8pm, exact dose on his log), anxiety note (loud fireworks stress; needs the quiet room), free-text instructions ("Insulin log on the white board in the dedicated pet room; please text me if glucose looks off")
7. **Booking submission + payment authorization** — payment method bKash, authorizes hold (no capture yet); review screen summarizes care configuration; taps "Submit booking request"
8. **Booking confirmation state (waiting on provider)** — confirms request sent, shows confirmation-window countdown, "Rashid typically responds within 2 hours"; Bibi puts the phone down

✓ **Climax beat reached.**

---

## Scenario Metadata

| Field | Value |
|---|---|
| **Scenario ID** | 01 |
| **Slug** | `01-bibis-first-eid-booking` |
| **Persona** | Bibi the Banani-Booker (Primary) |
| **Driver** | Want #1 — Tier-A fit on first search |
| **Business Goal** | ⭐ Primary — Curated-trust moat compounds through repeat bookings on-platform |
| **Pages** | 11 (8 in the linear path, 3 supporting touch-points) |
| **Format** | Mixed — Screen Flow (page-to-page) + Storyboard states on configuration + submission |
| **Climax metric** | Submit-to-confirmed in under 10 minutes (PRD UJ-1 baseline) |

---

## Page Folders (to be created)

```
01-bibis-first-eid-booking/
 01-bibis-first-eid-booking.md                  (this file)
 1.1-landing-marketing-home/                   ✓ created
 1.2-owner-sign-in/                            (next)
 1.3-curated-shortlist/                        (next)
 1.4-provider-profile/                         (next)
 1.5-pet-profile-management/                   (next)
 1.6-booking-configuration/                    (next)
 1.7-booking-submission-payment/               (next)
 1.8-booking-confirmation-waiting/             (next)
```

---

## Quality Gates

- [x] All 8 questions answered with specific, concrete responses
- [x] Mental state is visceral and specific (not generic "interested")
- [x] Entry point is realistic with device + context + discovery method
- [x] Path is truly linear (zero "if" statements, zero branches)
- [x] Both successes are specific and measurable
- [x] Scenario name includes persona name (Bibi)
- [x] Trigger Map connection is explicit (Persona + Primary BG + Want #1)

**All gates pass. Ready to outline page steps.**
