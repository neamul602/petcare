# Testing Standards

Status: APPROVED with the tech stack (`APPROVE TECH STACK`, 2026-10-28)

| Level | Tool | Scope |
|---|---|---|
| Unit | Vitest | Domain rules, state machines, capacity, commission math |
| API | Vitest + Fastify `inject` | Endpoint contracts, validation, auth, idempotency |
| Integration | Vitest against real PostgreSQL and running Dummy services | Booking -> payment -> payout flows, failure modes |
| End-to-end | Playwright (mobile viewports, throttled 4G) | UJ-1..UJ-4, full workbook scenario (Step 34) |

Extra automated checks (run before the Playwright suite):

- i18n key parity: no missing `bn`/`en` key.
- Bundle-size budget: initial payload under 500 KB.
- Lighthouse/performance: TTI under 3 s on throttled 4G.
- Accessibility: WCAG 2.1 AA contrast.

Order of approved test command: lint -> unit/API/integration -> budget and i18n checks -> Playwright.
