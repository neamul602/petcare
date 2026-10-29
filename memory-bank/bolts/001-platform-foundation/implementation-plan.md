---
stage: plan
bolt: 001-platform-foundation
created: 2026-10-29T18:00:00Z
---

## Implementation Plan: platform-foundation (bolt 001 of 25)

### Objective

Create the empty-but-working skeleton every later bolt plugs into: a single npm workspace that starts the web app, the API and the Dummy service host; the app shell with each role's navigation; DESIGN.md tokens and the shared UI kit; Bangla/English with an automated parity check; the configuration module for TD-1..TD-16; an injectable clock; and the database with an append-only log helper. No product feature is built yet.

### Stories and requirements in this bolt

1. **FND-01 Workspace and app shell** (must): FR-46, NFR-14, experience-blueprint §2-3, UC-17
2. **FND-02 Design tokens and UI kit** (must): DR-19, NFR-14, UC-21, UC-22
3. **FND-03 Bangla and English with parity** (must): FR-47, NFR-12, NFR-13, UC-13, C-1
4. **FND-05 Configuration, clock and log primitives** (must): DR-22, NFR-21..23 (primitive), training-decisions.md

### 1. What will change

The repository goes from documents only to a runnable monorepo. After this bolt:

- `npm install` then `npm run dev` starts three processes: web (port 4321), API (3000) and the Dummy service host (4100, health endpoint only; the five Dummy APIs come in bolt 002).
- Every route from experience-blueprint §3 opens a placeholder screen inside the correct shell (owner tab bar, provider tab bar or admin sidebar), in Bangla by default and English via the header toggle. The admin shell is English only.
- A development-only page `/dev/kit` shows every UI kit component, so the design can be reviewed before real screens exist.
- PostgreSQL runs in Docker Compose; the first migration creates the append-only `event_log` table.
- `npm run verify` runs lint, type checks, the i18n parity check, the static checks and all tests.

### 2. Files to create

Root:
- `package.json` (npm workspaces, scripts `dev`, `build`, `test`, `test:e2e`, `verify`, `db:up`, `db:migrate`), `package-lock.json`
- `.nvmrc`, `.gitignore`, `.editorconfig`, `tsconfig.base.json`, `eslint.config.js`, `.prettierrc`
- `docker-compose.yml` (PostgreSQL 16), `.env.example`
- `README.md` (how to install, run, test)

`packages/shared/` (used by web and API):
- `src/i18n/bn.json`, `src/i18n/en.json`, `src/i18n/index.ts` (typed `t(key, params)` with Bangla default)
- `src/locale/format.ts` (BDT amounts, digits, dates per UC-13)
- `src/config/training-decisions.ts` (TD-1..TD-16, typed, the only place these values live)
- `src/clock.ts` (`Clock` interface, `SystemClock`, `TestClock`)

`apps/web/` (Astro + Preact islands + Tailwind):
- `astro.config.mjs`, `src/styles/tokens.css` (DESIGN.md colours, type, radii, elevation as CSS variables mapped into Tailwind `@theme`)
- `src/layouts/OwnerShell.astro`, `ProviderShell.astro`, `AdminShell.astro`, `BaseLayout.astro`
- `src/components/kit/`: Button, Card, Input, Badge, Chip, Toggle, Sheet (island), StickyActionBar, StatePill, LanguageToggle (island), TabBar, Sidebar
- `src/pages/`: placeholder pages for every route in experience-blueprint §3 (owner, provider, admin) plus `404.astro` and `dev/kit.astro`
- `src/lib/locale.ts` (read and write the `pc_locale` cookie)

`apps/api/` (Fastify):
- `src/server.ts`, `src/app.ts` (`GET /health`), `src/config.ts` (loads shared config, refuses to start on missing values)
- `src/db/client.ts`, `drizzle.config.ts`, `src/db/schema/event-log.ts`, `drizzle/0001_event_log.sql` (table plus trigger that rejects UPDATE and DELETE)
- `src/log/append.ts` (append-only log helper)

`apps/dummy-services/` (Fastify):
- `src/server.ts` with `GET /health` only (filled in by bolt 002)

`scripts/`:
- `check-i18n.mjs` (fails if a key exists in one language only)
- `check-config-literals.mjs` (fails if a TD value is written anywhere outside the config module)
- `check-no-dummy-in-web.mjs` (fails if `apps/web` mentions a Dummy service URL or port, DR-22)
- `check-contrast.mjs` (WCAG 2.1 AA contrast for every text/background token pair used by the kit)

Tests:
- `packages/shared/src/**/*.test.ts`, `apps/api/src/**/*.test.ts` (Vitest)
- `tests/e2e/shell.spec.ts` (Playwright)

Memory bank: this plan, then `implementation-walkthrough.md` (stage 2) and `test-walkthrough.md` (stage 3).

### 3. Which APIs are involved

- **PetCare API:** only `GET /health`. No business endpoints yet.
- **Dummy service host:** only `GET /health`. The five Dummy APIs arrive in bolt 002.
- **External systems:** none. Placeholder screens are static; the web app makes no API calls yet.

### 4. Technical approach

- **Workspace:** npm workspaces; `concurrently` runs the three dev servers; TypeScript strict everywhere.
- **Web:** Astro 7 with `@astrojs/preact` 6; Tailwind 4 configured CSS-first (`@theme`) from `tokens.css`, so DESIGN.md names map directly to classes such as `bg-primary`. Static shells are Astro components; only interactive parts (language toggle, sheet, admin sidebar collapse) are Preact islands, keeping the payload small.
- **Navigation:** shells are chosen by route prefix (`/`, `/provider`, `/admin`) because sign-in arrives in bolt 004; tab bars and the sidebar follow experience-blueprint §2.
- **i18n:** two JSON catalogs and a small typed `t()` helper (no heavy framework). Locale lives in a `pc_locale` cookie, default `bn`; no locale in the URL (OQ-17 lighter decision). Admin pages always use `en` and show no toggle.
- **Fonts:** self-hosted Inter, Noto Sans Bengali and Source Serif 4 via Fontsource packages, Latin and Bengali subsets only; `font-display: swap`.
- **Config:** `training-decisions.ts` exports one frozen object with TD-1..TD-16 (durations in minutes, rates as basis points, schedules as cron-like strings). The API loads and validates it with Zod at start.
- **Clock:** every time-based rule will take a `Clock`; `TestClock` can be advanced in tests. A training-only `POST /dev/clock/advance` is **not** added yet (comes with the first scheduled rule).
- **Database:** Docker Compose PostgreSQL 16; Drizzle for schema and migrations. `event_log` columns: id, kind (`audit`, `booking_transition`, `payment_event`), actor, action, reason_code, target_type, target_id, payload (JSON), created_at. A trigger rejects UPDATE and DELETE so the log is append-only even for the table owner.
- **Library versions:** latest stable at install time (today: Astro 7.4, @astrojs/preact 6.1, Tailwind 4.3, Fastify 5.12, Drizzle ORM 0.45, Zod 4.x, Vitest 5.0, Playwright 1.64, TypeScript 7.0 if supported by the tooling, otherwise 5.x), pinned by `package-lock.json`.

### 5. How it will be tested

- **Unit (Vitest):** `t()` returns Bangla by default and English on request; missing-key behaviour; `format.ts` money and dates; config validation rejects a missing value; `TestClock` advances; parity, literal and Dummy-URL check scripts on fixture files.
- **Integration (Vitest + Docker Postgres):** the log helper inserts; an UPDATE or DELETE on `event_log` fails.
- **End to end (Playwright, Chromium):** at 390 px and 1280 px, each blueprint route opens with the right shell; owner and provider tab labels in Bangla, then English after the toggle (and still English after reload); admin pages are English with no toggle; unknown route shows the friendly 404; no horizontal scroll at 320 px.
- **Static and accessibility:** `npm run verify` runs lint, type checks, `check-i18n`, `check-config-literals`, `check-no-dummy-in-web` and `check-contrast` (amber and muted pairs adjusted if they fail, UC-22).
- **Evidence:** test output saved for STEP-15/16 screenshots; the i18n check output becomes part of STEP-32 later.

### Acceptance criteria (from the stories)

- [ ] `npm install` and `npm run dev` start web, API and Dummy host; each health endpoint answers (FND-01)
- [ ] Owner shell shows Home, Bookings, Pets, Inbox; provider shell shows Today, Calendar, Bookings, Earnings, Profile; admin sidebar shows Queue, Providers, Reviews, Payouts, Insights, Audit log and collapses below 768 px (FND-01)
- [ ] Every blueprint route resolves to a placeholder in the right shell; unknown routes show a friendly 404; no horizontal scroll at 320 px (FND-01)
- [ ] Every DESIGN.md token is available by name; screens use kit components; all kit text/background pairs pass AA; coral only in acute components; targets at least 44x44 px with 8 px spacing (FND-02)
- [ ] First visit is Bangla; the header toggle switches to English and persists; admin is English with no toggle; the parity check fails the build on a missing key; amounts and dates use one locale helper (FND-03)
- [ ] TD-1..TD-16 load from one module and appear nowhere else; the clock can be advanced in tests; log entries can be inserted but never updated or deleted; no Dummy URL in web code (FND-05)

### Decisions needed before implementing

1. **Node version.** The approved stack says Node.js 22 LTS, but this machine has only Node 26.8.2, which is not an LTS release yet. **Recommended:** install the newest Node 22 LTS with nvm and pin it in `.nvmrc` (keeps the approved standard; Astro 7 needs Node 22.23.4 or newer). Alternative: amend the standard to allow Node 26 and accept the risk of tool incompatibilities.
2. **Playwright browser download.** End-to-end tests need `npx playwright install chromium` (roughly 150 MB). Recommended: yes.
3. **Number format (UC-13).** Recommended: Latin digits with "৳" and thousands separators in both languages (for example ৳20,000), Bangla month names in Bangla. Alternative: Bangla digits in Bangla mode.

### Out of scope for this bolt

PWA manifest, service worker and offline states, performance budgets and the training seed (bolt 003); Dummy APIs (bolt 002); sign-in and real role detection (bolt 004); any product screen content.

### Approval

Approved 2026-10-29 (`APPROVE PLAN`) with the three recommendations: Node 22 LTS via nvm pinned in `.nvmrc`; Playwright Chromium installed; Latin digits with ৳ in both languages, Bangla month names in Bangla.
