# Data Stack Standard

Status: APPROVED (`APPROVE TECH STACK`, 2026-10-28)

## Database

- PostgreSQL. Relational data fits bookings, per-night capacity, payments, audit logs.
- Transactions and row locks prevent double-booking a night; idempotency-key uniqueness prevents double capture/payout.

## Access

- Drizzle ORM plus SQL migrations (typed, thin, real SQL when needed).

## Rules

- Money stored as integer minor units with currency code (BDT); never floats.
- Audit logs (admin actions NFR-21, booking transitions NFR-22, payment events NFR-23) are append-only tables; the application role has no UPDATE/DELETE grants on them.
- Provider verification artifacts (NID, address proof, references) live in tables separate from public provider profile data (NFR-7).
- All timestamps stored in UTC (ISO 8601).
- Business-rule values (training decisions TD-*) live in one configuration place in code, not scattered.
- Seed data lives only in seed files and is labelled as training data; no fabricated reviews, ratings or testimonials.
