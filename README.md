# PetCare v1

A curated, trust-first pet-boarding marketplace for urban Dhaka: a mobile-first, bilingual (Bangla default, English parity) web PWA for owners (`/`), providers (`/provider`) and the admin (`/admin`, English only). Built with specs.md AI-DLC; the plan and every decision live in [`memory-bank/`](memory-bank/), the signed-off sources in [`docs/`](docs/).

This is a **training build**. External systems (payment gateway, MFS payout, SMS/OTP, notifications, photo storage) are replaced by separately runnable **Dummy APIs** with training contracts only.

## Requirements

- Node.js 22 LTS (`nvm use` reads `.nvmrc`)
- Docker with Compose (for PostgreSQL)

## Getting started

```bash
nvm use
npm install
npm run db:up        # PostgreSQL 16 on port 5433
npm run db:migrate
npm run dev          # web :4321, API :3000, Dummy services :4100
```

Open http://localhost:4321. The UI kit gallery is at http://localhost:4321/dev/kit (development only).

## Workspace

| Path | What it is |
|---|---|
| `apps/web` | Astro + Preact islands + Tailwind (DESIGN.md tokens); owner, provider and admin screens |
| `apps/api` | Fastify API, PostgreSQL via Drizzle, append-only event log |
| `apps/dummy-services` | Training-only Dummy APIs (filled in by bolt 002) |
| `packages/shared` | Training-decision config (the only home of TD values), clock, i18n catalogs, locale formatting |
| `scripts` | Project checks: i18n parity, config literals, no Dummy calls from web, colour contrast |

## Checks and tests

```bash
npm run verify       # lint, type checks, project checks, unit and integration tests
npm run test:e2e     # Playwright end-to-end tests
```

## Rules worth knowing

- Business values (windows, commission, schedules) come only from `@petcare/shared/config`.
- Every owner and provider string exists in both `bn.json` and `en.json`; the admin uses `admin-en.json`.
- The web app never calls external or Dummy systems; only the API does, through its ports.
- No fabricated trust signals: ratings, reviews and counts come from real (training) bookings only.
