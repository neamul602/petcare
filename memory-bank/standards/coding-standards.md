# Coding Standards

Status: APPROVED with the tech stack (`APPROVE TECH STACK`, 2026-10-28)

- TypeScript strict mode; no `any` without a justifying comment.
- Shared API contracts and types live in `packages/shared`; UI, API and Dummy services import them.
- Requirements traceability: code, tests and commits reference PRD identifiers (FR-x, NFR-x, UJ-x, OQ-x, TD-x).
- Layering in the API: routes -> application services -> domain -> ports; adapters implement ports (including Dummy API adapters).
- No hard-coded data in UI; data comes from the API. No copying of mockup/prototype JavaScript.
- All user-facing strings come from i18n catalogs; every key exists in both `bn` and `en` (admin: `en` only).
- Visual values come from DESIGN.md tokens; coral only for the acute state.
- Linting and formatting: ESLint + Prettier, run in CI before tests.
- Do not edit the signed-off documents in `docs/`.
- Never fabricate trust signals (bookings, reviews, testimonials).
