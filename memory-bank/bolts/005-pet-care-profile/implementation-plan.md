---
stage: plan
bolt: 005-pet-care-profile
created: 2026-10-30T14:00:00Z
---

## Implementation Plan: pet-care-profile, first bolt (bolt 005 of 25)

Approved under the owner's standing instruction. Nothing in this bolt is on the deferred list.

### Objective

An owner can create and keep a profile for each dog or cat, with the special-care details that make PetCare different (medication with times, allergies, anxiety, diet, senior and extra attention) stored in structured fields, never free text alone. Clinical or veterinary requests are rejected at intake. Each pet has a care history that grows with every stay, can pre-fill the next booking, and gives providers a read-only summary on a request.

### Stories and requirements

1. **PET-01 Create and edit a pet profile** (must): FR-6, DR-21; page spec 1.5; mockup 15
2. **PET-02 Structured care plan** (must): DR-4, FR-6
3. **PET-03 Reject clinical requests at intake** (must): DR-5, A-D1, UC-20
4. **PET-04 Pet page and care history** (must): FR-7, NFR-10; page spec 2.1; mockup 21
5. **PET-05 Care plan pre-fill** (must): FR-8, UJ-4
6. **PET-06 Provider care summary** (must): FR-9, FR-49, A-4

### What will change

**API**
- Tables `pets`, `pet_photos`, `care_history` (migration 0004). A pet holds basics, behaviour, species-specific details and a validated, structured care plan (conditions, medications with times, allergies, anxiety, diet, senior, extra attention, instructions, vet contact).
- Owner endpoints: create, list, read, update and archive a pet; upload and remove photos (1 to 5, up to 5 MB each, stored through a **photo port** with a Dummy adapter, served back through the API so the browser never talks to the Dummy service); read care history; read the pre-fill; screen a request for clinical purpose.
- Provider endpoint: read-only care summary of a pet. Access is decided by a small policy (a provider may see a pet only when it has a booking request with them); until bookings exist the policy refuses, and tests inject an allowing policy. The summary never includes the owner's contact details.
- Rules: dogs and cats only; dog-only fields rejected on a cat and cat-only fields on a dog; every pet belongs to its owner and other owners get "not found"; archiving hides a pet from lists but keeps every booking and history entry.
- Clinical screening: an explicit declaration ("this stay is for treatment, monitoring or a procedure") or text that matches a keyword guard is rejected with a plain explanation and logged. Insulin administration for a diabetic pet is allowed (it is care, not treatment by PetCare).
- Care history: the table and the function that records an entry (for the booking bolts to call) are built now; the read endpoint shows an honest empty state until stays exist.
- Pre-fill: returns the care plan from the pet's last completed stay when there is one, otherwise the current care plan, each field marked with where it came from.
- Seed: Tito (and his structured care plan) is loaded for Bibi.

**Web**
- Pets (`/pets`): the owner's pets with a clear "Add a pet" action and an empty state that invents nothing.
- Pet page (`/pets/:id`): two tabs, Profile and Care history, with the empty history message "this is Tito's first stay".
- Add and edit (`/pets/new`, `/pets/:id/edit`): one form in calm sections (about, behaviour, care plan, photos) with the dog or cat fields appearing for the chosen species, repeatable medication rows with times, inline errors, a sticky Save bar, typed input kept on the device, and photo upload with progress and retry.
- Everything in Bangla and English.

### Files (main)

`apps/api/src/pets/*` (schemas, routes, care history, clinical screening, provider summary, photo port and Dummy adapter), `apps/api/src/db/schema/pets.ts`, `drizzle/0004_*.sql`, `apps/api/src/seed/load-pets.ts`, `packages/shared/src/pets.ts` (shared option lists), `apps/web/src/pages/pets/*`, `apps/web/src/components/pets/PetForm.tsx`, `apps/web/src/pages/photos` proxy, i18n keys, tests.

### APIs involved

Dummy Photo Storage (`/api/photos`) through the photo port. The PetCare API serves everything to the web app.

### How it will be tested

- **API (Vitest, real PostgreSQL and Dummy service):** create Tito with insulin twice daily and a low-carb diet; species rules; required fields and limits; owner isolation (another owner and a provider cannot read, change or archive); archive keeps history; photos (1 to 5, size, type, removal, served only to the owner, upload failure leaves no half-saved photo); care history empty and populated; pre-fill from the last stay and from the profile; clinical screening (declared purpose, keyword guard, insulin allowed, logged); provider summary (content, read-only, no owner contact, policy refusal).
- **Seed:** Tito is loaded with his structured plan.
- **End to end (Playwright):** an owner adds a pet with a medication and a photo, sees the pet page and the empty care history, edits it, switches species and sees the right fields, gets inline errors, archives it; a second owner cannot open it; empty state on a new account; accessibility scans of the new screens in both languages.

### Acceptance criteria

- [ ] PET-01: dog or cat fields by species; required fields enforced inline; 1 to 5 photos up to 5 MB with progress and retry; no other species
- [ ] PET-02: Tito's diabetes, insulin twice daily and low-carb diet fit in structured fields; allergy, anxiety, special diet, senior and extra attention each have structured inputs; free text sits beside, not instead
- [ ] PET-03: clinical purpose rejected and logged; vet directory offered as lookup only (wording only here, the directory arrives with bolt 011)
- [ ] PET-04: first-stay empty state; populated history newest first; another owner's pet is refused
- [ ] PET-05: pre-fill marked "from last stay" or "from profile", editable per field
- [ ] PET-06: provider sees prior stays, flags, medication, diet and decline patterns, read-only

### Out of scope

Booking creation and recording real stays (bolts 009 to 013), the vet directory screen (bolt 011), archive retention rules and closed accounts (bolt 018), importing from vet systems.
