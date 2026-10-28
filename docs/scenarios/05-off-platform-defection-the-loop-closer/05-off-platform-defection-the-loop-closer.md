---
scenario_id: 05
scenario_name: "Off-Platform Defection — The Loop-Closer"
slug: off-platform-defection-the-loop-closer
priority: 2
persona: "🌐 All three — shared cross-group driver (Bibi / Rashid / Ayaat)"
business_goal: "⭐ Primary (moat conditionality) + 🌐 Shared Cross-Group Driver"
primary_driving_force: "❌ Fear shared — Off-platform defection"
format: "Storyboard (state-rich — defection detection → intervention → re-engagement → close)"
climax_beat: "Ayaat catches the defection pattern before it cascades — the second booking lands on-platform via the 'Book again' pre-fill (Scenario 02) instead of via WhatsApp. The moat holds."
created: 2026-08-30
status: validated
design_intent: S
design_status: complete
pages_assigned: 13
pages: [12, 13, 14, 16, 17, 26, 29, 36, 42, 43, 44, 45, 46]
---

# Scenario 05 — Off-Platform Defection — The Loop-Closer

> The shared cross-group driver surface. Mitigating this closes the loop on all three personas and is what makes the curated-trust moat structurally intact.

---

## The 8 Strategic Questions

### Q1. What transaction do we need to get really right?
Detect, surface, and intervene on the soft signals that owners + providers are moving the next booking to WhatsApp — BEFORE the second booking leaks off-platform and the moat starts dissolving.

### Q2. If this transaction succeeds, which business goal does it add value to?
⭐ **Primary Objective — Curated-trust moat compounds through repeat bookings on-platform** (the moat is conditional on staying on-platform). This scenario IS the loop-closing mechanism — without it, scenarios 01 and 02 are isolated events instead of compound events. AND 🌐 **Shared Cross-Group Driver** explicitly.

**Anchored FRs / SMs / Counter-metrics:** FR-36 (off-peak utilization), FR-48 (on-platform repeat value), FR-50 (off-platform soft-signal capture), FR-49 (provider profile deepening), FR-10 (care-history portability), A-14 (defection monitoring), SM-C1 (platform-booking share), SM-C2 (provider platform-share), SM-C5 (care-record completeness).

### Q3. Which user experiences this most, and in what real-life situation?

**Persona:** 🌐 All three — Bibi (care-history-loss angle), Rashid (utilization-collapse angle), Ayaat (invisible-signal angle).
**Situation:** 4-6 weeks post-Scenario-01. Tito's Eid stay completed with Rashid. Bibi's care history exists on PetCare. But: no second-booking yet despite the documented need. Rashid's profile shows 1 booking + 1 verified review, but his utilization has dropped. Ayaat's dashboard shows care-record completeness intact but repeat-booking rate soft.

### Q4. What do they want and what do they fear?

- **Bibi:** Hope = a re-engagement nudge reminding her that the under-4-minute pre-fill is faster than WhatsApp · Worry = the moment of friction (booking the second time) is exactly when WhatsApp becomes easier
- **Rashid:** Hope = an off-peak re-engagement offer keeps his dedicated pet room utilized · Worry = off-peak troughs are when owners find his WhatsApp number
- **Ayaat:** Hope = the dashboard surfaces the pattern before the moat starts dissolving · Worry = she doesn't realize the second booking leaked until much later

### Q5. What device are they on?
**All three:** Mobile primary (Bibi + Rashid) · Desktop secondary (Ayaat for the dashboard).

### Q6. What's the natural starting point?
- **Bibi:** Push notification — "Your pet's care history is waiting. Book Tito's next stay in under 4 minutes."
- **Rashid:** Push notification — "Off-peak week coming up · re-engagement nudge available for past owners."
- **Ayaat:** Opens admin console — defection dashboard shows 2 patterns flagged.

### Q7. What does the best possible outcome look like — for both sides?

- **User Success (Bibi):** Re-engagement nudge lands. She taps "Book again" → Scenario 02 climax → second booking on-platform. Total time: under 4 minutes.
- **User Success (Rashid):** Re-engagement offer activates past owners → his off-peak week fills → utilization recovers.
- **User Success (Ayaat):** Dashboard catches the pattern before it cascades → intervention playbook fires → moat stays intact.
- **Business Success:** SM-C1 (platform-booking share), SM-C2 (provider platform-share), SM-C5 (care-record completeness) all hold or improve. The moat is structurally intact.

### Q8. The shortest path (linear sunshine path — zero branches)

1. **Defection detection dashboard** (Ayaat) — 2 patterns flagged: Bibi-care-history-no-second-booking + Rashid-off-peak-drop
2. **Notifications inbox** (Bibi) — re-engagement nudge arrives · "Tito's care history is waiting"
3. **Notifications center** (Rashid) — re-engagement offer arrives · "Off-peak nudge available"
4. **In-stay view (owner)** — (already covered by scenario 01) — daily updates visible · pattern check
5. **Booking completion confirmation (owner reviews)** — verified review with photos deepens Rashid's Fit
6. **Issue report (owner)** — (out of scenario — but available) — safety-net for acute events
7. **Review moderation result view (owner)** — admin's moderation outcome visible
8. **Acute-event trigger surface (provider)** — Rashid's path when something goes wrong
9. **Payouts + earnings view (provider)** — Rashid sees his Fit-deepening effect on profile views
10. **Settings (per role)** — language toggle · identity verification · notification preferences
11. **Error states** — capacity-exhausted · confirmation-timeout · payment-failed · dispute-window-expired
12. **Empty states** — no bookings yet · no reviews yet · no in-stay updates yet
13. **Loading / skeleton states** — for shortlist · calendar · queue dashboard · care-history

✓ **Climax beat reached.** The loop closes — second booking through PetCare, defection pattern caught before it cascades.

---

## Page Folders

```
05-off-platform-defection-the-loop-closer/
 05-off-platform-defection-the-loop-closer.md     (this file)
 5.1-in-stay-owner-view/
 5.2-booking-completion-review/
 5.3-issue-report/
 5.4-review-moderation-result/
 5.5-notifications-inbox/
 5.6-payouts-view/
 5.7-acute-event-trigger/
 5.8-defection-detection/
 5.9-notifications-center/
 5.10-settings/
 5.11-error-states/
 5.12-empty-states/
 5.13-loading-skeletons/
```

---

## Quality Gates
- [x] All 8 questions answered
- [x] Mental state is visceral (the moment of friction is when WhatsApp wins)
- [x] Entry point is realistic (push notifications + admin dashboard)
- [x] Path is truly linear
- [x] Both successes are specific and measurable (second booking through PetCare + dashboard catches pattern)
- [x] Scenario name includes shared driver (Off-Platform Defection)
- [x] Trigger Map connection is explicit (Shared Cross-Group Driver + Primary BG + counter-metrics)