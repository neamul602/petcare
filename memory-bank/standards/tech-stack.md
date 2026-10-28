# Tech Stack Standard

Status: APPROVED (human approval phrase: `APPROVE TECH STACK`, 2026-10-28)
Sources: docs/PRODUCT.md (Stack), docs/prd.md §8 (NFR-1..NFR-26), docs/ux/DESIGN.md

## Overview

Mobile-first, bilingual PWA on low-end Android (9+, 2 GB RAM) over intermittent 4G.
Budgets: initial payload < 500 KB (NFR-1), TTI < 3 s (NFR-2), search p95 < 1 s (NFR-3),
admin initial load < 2 s (NFR-4).

## Languages

- TypeScript everywhere (web, API, Dummy services, shared types).
- Node.js 22 LTS runtime (pinned; do not use non-LTS versions).

## Frontend (apps/web) — confirms PRODUCT.md direction

| Concern | Choice |
|---|---|
| Framework | Astro + Preact islands (islands only on interactive screens: booking configuration, chat, capacity calendar, admin queue) |
| Styling | Tailwind CSS; DESIGN.md HSL tokens as CSS variables (`bg-primary`, `text-primary-foreground`, ...); shadcn-style primitives, not the full React shadcn kit |
| PWA | Workbox service worker + web manifest; poor-connection states per EXPERIENCE.md |
| i18n | Typed JSON message catalogs: `bn` (default) and `en`; admin is `en` only (NFR-12, NFR-13) |
| Fonts | Inter, Noto Sans Bengali, Source Serif 4; self-hosted, subset, `font-display: swap` |

Risk: Bengali font weight can consume the 500 KB budget. A bundle-size budget check runs from the first Bolt.

## Backend (apps/api)

- Fastify (TypeScript), REST/JSON, request/response validation with Zod.
- Auth: phone OTP through the Dummy SMS API, then server-side session (httpOnly cookie). Admin uses a separate login (FR-31).
- Jobs: DB-backed scheduler in the API process (confirmation-window timeout, weekly payout batch, update reminders).
- External systems are reached only through port/adapter interfaces, never from the UI.
- Chat: short-polling in v1 (revisit if real-time chat at scale is needed).

## Dummy services (apps/dummy-services)

- Separate Fastify service on its own port; payment gateway, MFS payout, SMS/OTP, notification, photo storage.
- Each exposes health, reset, inspection, and failure modes (down, timeout, decline, ambiguous result).
- Training contracts only; no claims about real bKash/Nagad/SSLCommerz/SMS interfaces.

## Repository layout

npm workspaces: `apps/web`, `apps/api`, `apps/dummy-services`, `packages/shared`.

## Infrastructure & local setup

- Docker Compose for local PostgreSQL (fallback if Docker is unavailable to be agreed at the time).
- Package manager: npm.

## Alternatives rejected

- Full SPA (Next.js/React): too heavy for the payload budget.
- NoSQL database: weaker fit for transactional capacity and payment guarantees.
