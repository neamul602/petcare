---
stage: implement
bolt: 001-platform-foundation
created: 2026-10-29T19:30:00Z
---

## Implementation Walkthrough: platform-foundation

### Summary

The repository is now a runnable npm workspace with three apps (web, API, Dummy service host) and one shared package. Every screen route from the experience blueprint opens a placeholder inside the correct role shell, in Bangla by default with a persistent English switch, while the admin console is English only. Training-decision values, the clock, i18n, locale formatting and an append-only event log are in place for later bolts.

### Structure Overview

- **packages/shared** holds what web and API must agree on: the single configuration module for TD-1..TD-16 (plus PRD platform rules), the injectable clock, the Bangla/English and admin-English catalogs with a small translator, and money/date formatting.
- **apps/web** is Astro rendered on the server so the language cookie decides the language without client JavaScript; Preact islands are used only for the sheet, toggle and the admin narrow-screen menu. Three shells (owner, provider, admin) wrap 30 placeholder pages that match blueprint §3.
- **apps/api** is Fastify with a health endpoint, a validated configuration loader, PostgreSQL through Drizzle, migrations, and an append-only event log protected by database triggers.
- **apps/dummy-services** is the host for the training APIs, with only a health endpoint for now.
- **scripts** contains the four project checks that run in `npm run checks`.

### Completed Work

- [x] `package.json`, `package-lock.json` - workspace definition and the dev, build, db, lint, typecheck, checks, test and verify scripts
- [x] `.nvmrc`, `.editorconfig`, `.prettierrc`, `.prettierignore`, `.gitignore`, `.env.example` - toolchain pin (Node 22.23.4) and editor/format settings
- [x] `tsconfig.base.json`, `eslint.config.js` - strict TypeScript and lint rules for all workspaces
- [x] `docker-compose.yml` - local PostgreSQL 16 on port 5433 with a health check
- [x] `README.md` - how to install, run and check the project
- [x] `packages/shared/src/config/training-decisions.ts` - the only home of TD-1..TD-16 and platform rules (launch neighbourhoods, species, operating ceiling, retention, shortlist size)
- [x] `packages/shared/src/clock.ts` - system clock and a forward-only test clock
- [x] `packages/shared/src/i18n/bn.json`, `en.json`, `admin-en.json`, `index.ts` - owner/provider catalogs with parity, admin English catalog, translator with Bangla default
- [x] `packages/shared/src/locale/format.ts` - money (৳, Latin digits, lakh grouping), counts, dates and times in Dhaka time
- [x] `apps/api/src/config.ts` - validates the business rules and runtime settings; refuses to start on missing values
- [x] `apps/api/src/app.ts`, `server.ts` - API with `/health`
- [x] `apps/api/src/db/client.ts`, `migrate.ts`, `schema/event-log.ts`, `drizzle.config.ts` - database connection, migration runner and event-log schema
- [x] `apps/api/drizzle/0000_event_log.sql`, `0001_event_log_append_only.sql` - event-log table and triggers rejecting UPDATE, DELETE and TRUNCATE
- [x] `apps/api/src/log/append.ts` - the only write path to the event log
- [x] `apps/dummy-services/src/app.ts`, `server.ts` - Dummy host with `/health`
- [x] `apps/web/astro.config.mjs`, `tsconfig.json` - server rendering with the Node adapter, Preact, Tailwind, `@/` import alias
- [x] `apps/web/src/styles/tokens.css` - DESIGN.md colours, fonts, radii, shadows mapped to Tailwind names, focus ring and reduced-motion rules
- [x] `apps/web/src/components/kit/` - Button, Card, Input, Badge, Chip, StatePill, StickyActionBar, Toggle (island), Sheet (island)
- [x] `apps/web/src/components/shell/` - TabBar, TopNav, LanguageToggle, AdminMenu (island)
- [x] `apps/web/src/layouts/` - BaseLayout (fonts, tokens, skip link), OwnerShell, ProviderShell, AdminShell
- [x] `apps/web/src/components/Placeholder.astro` - temporary screen body
- [x] `apps/web/src/pages/` - 30 placeholder routes (12 owner, 8 provider, 10 admin), friendly 404, `/locale` language switch endpoint, development-only `/dev/kit` gallery
- [x] `apps/web/src/lib/locale.ts`, `routes.ts` - cookie-based locale reading and the screen route registry (used by E2E tests)
- [x] `scripts/check-i18n.mjs`, `check-config-literals.mjs`, `check-no-dummy-in-web.mjs`, `check-contrast.mjs`, `lib/source-files.mjs` - the four project checks

### Key Decisions

- **Server rendering with a language cookie**: the language is chosen on the server, so pages arrive in the right language with no client-side translation code (keeps payload low, works without JavaScript).
- **Language switch as a link, not an island**: one tap, no JavaScript, returns to the same page; only same-site return paths are accepted.
- **Shell chosen by route prefix**: sign-in arrives in bolt 004; until then `/`, `/provider` and `/admin` decide the shell.
- **Append-only by trigger, not only by grants**: the rule holds even for the table owner and for TRUNCATE.
- **Money in poisha**: formatting expects whole minor units so amounts never use floats.
- **Contrast fixes inside the tokens** (UC-22): accent 56% to 46% lightness, warning 46% to 32%, info 48% to 44%; all 18 checked pairs now pass AA. `destructive-foreground`, missing from DESIGN.md, uses cream-50 like the other foregrounds.
- **Touch targets**: medium buttons are 44 px tall (DESIGN.md says 40 px) and small buttons and chips keep their 32 px look with an invisible 44 px hit area, to meet the EXPERIENCE.md 44 px floor.

### Deviations from Plan

- The language toggle is a server link instead of a Preact island (simpler and lighter, same behaviour).
- The plan named one migration file; drizzle-kit produced two (table, then the custom append-only triggers), numbered 0000 and 0001.
- TypeScript 6.0 is used rather than 7.0, because typescript-eslint supports TypeScript only up to 6.0.
- `@astrojs/node` was added (not listed in the plan) because server rendering needs an adapter for builds.
- Docker Desktop was not running; it was started so the database could be created. One smoke-test row ("smoke") remains in the development event log because the log is append-only; the training seed in bolt 003 recreates the database.

### Dependencies Added

- [x] `astro`, `@astrojs/preact`, `preact`, `@astrojs/node` - web framework, islands, server adapter
- [x] `tailwindcss`, `@tailwindcss/vite` - styling from DESIGN.md tokens
- [x] `@fontsource-variable/inter`, `@fontsource/noto-sans-bengali`, `@fontsource/source-serif-4` - self-hosted fonts
- [x] `fastify`, `zod` - API and configuration validation
- [x] `drizzle-orm`, `pg`, `drizzle-kit`, `@types/pg` - database access and migrations
- [x] `typescript`, `eslint`, `@eslint/js`, `typescript-eslint`, `prettier` - language and code style
- [x] `tsx`, `concurrently` - running TypeScript servers and all dev servers together
- [x] `vitest`, `@playwright/test`, `@astrojs/check` - tests (written in stage 3) and Astro type checks
- [x] `@types/node` (22) - Node type definitions matching the runtime

### Developer Notes

- Run `nvm use` first: Astro 7 needs Node 22.23.4 or newer, and the machine default is Node 26.
- PostgreSQL listens on 5433 to avoid clashing with a local server on 5432.
- `npm run test` has no tests yet; unit, integration and Playwright tests are written in stage 3.
- Verified manually: all three health endpoints answer; all 30 routes return the right shell and screen; unknown paths give the 404 page; the language switch persists across pages; the admin sidebar shows at 1280 px and becomes a Menu button below 768 px; lint, type checks (54 Astro files, 0 errors) and the four project checks pass; the production build succeeds.
