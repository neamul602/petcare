---
stage: plan
bolt: 021-provider-supply-vetting
created: 2026-11-01T17:00:00Z
---

## Implementation Plan: vetting and the provider profile editor (bolt 021)

Stories: SUP-02 application review and vetting, SUP-03 appeal and bias-audit data, SUP-05 provider profile editor. Simplest workable version.

- **Vetting record** (admin only, stored apart from anything public): identity, address and capability marked complete or not, a references note, document references, and for Tier-A a recorded personal outreach note. Requesting more information sets "awaiting info" on the record.
- **Approval gate**: moving a provider from vetting to approved needs identity, address and capability complete, and a Tier-A outreach note; otherwise it is refused with what is missing. Every decision keeps its reason in the history and the audit log. Reinstating a suspended provider is not a new vetting.
- **Appeals**: for a declined (removed) provider the admin records the appeal and later its outcome (upheld or overturned) on the provider record. The vetting decisions list shows every approval and decline with reasons for bias review.
- **Provider profile**: the provider edits the experience text (both languages), price per night, species, capability flags and usual room; tier and status cannot be edited; a completeness list shows what is missing. Capacity per size is not built. Changes show on the public page straight away.
- Verification artifacts never appear in any owner or public response (tested).
