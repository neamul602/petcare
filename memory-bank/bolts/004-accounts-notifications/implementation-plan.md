---
stage: plan
bolt: 004-accounts-notifications
created: 2026-10-30T07:00:00Z
---

## Implementation Plan: accounts-notifications, first bolt (bolt 004 of 25)

Approved under the owner's standing instruction (use the recommendation, do not ask between steps). The notification port (ACC-03) is **deferred** by owner decision and is not in this bolt.

### Objective

People can sign in. Owners and providers sign in with a phone number and a one-time code from the Dummy OTP service; the admin signs in separately with training credentials; every area of the product is protected by role; every admin action can be audited. After this bolt, bolts 005 onward can rely on "who is this and what may they do".

### Stories and requirements

1. **ACC-01 Sign in with phone OTP** (must): DR-1, DR-2, DR-21, NFR-6; page spec 1.2; blueprint O2
2. **ACC-02 Admin sign-in and role guards** (must): FR-31, DR-3, NFR-13, NFR-21; blueprint admin sign-in

### What will change

**API (`apps/api`)**
- Tables: `users` (owners and providers: phone, name, neighbourhood, language), `admin_users` (email and password hash), `sessions`, `signup_tokens`; migration `0003`.
- An OTP **port** with a Dummy adapter (calls the Dummy SMS/OTP API): swapping in a real provider later means one new adapter.
- Endpoints: `POST /auth/otp/send`, `POST /auth/otp/verify`, `POST /auth/profile` (first-time owners), `POST /auth/sign-out`, `GET /auth/me`; `POST /admin/auth/sign-in`, `POST /admin/auth/sign-out`, `GET /admin/auth/me`; guarded example endpoints `GET /owner/me`, `/provider/me`, `/admin/me`.
- Sessions: random token in an httpOnly, SameSite=Lax cookie (`pc_session` for owners and providers, `pc_admin_session` for the admin); only a hash of the token is stored; owner and provider sessions last 14 days, admin sessions 12 hours.
- Role guards: no session gives 401; the wrong role gives 403; admin and owner/provider sessions are never interchangeable.
- Audit: every admin sign-in and sign-out is written to the append-only log, and a shared `recordAdminAction` helper is provided so every later admin action uses the same path (FR-37, NFR-21).
- Safety: a send limit per phone (5 per 10 minutes, config), generic errors that never reveal whether an account exists, passwords hashed with scrypt, a failure of the OTP service returns a safe 503 and sign-in can be retried.
- Provider accounts cannot be created by sign-in. A phone that is not a seeded or admin-created provider only ever becomes an owner. (Linking to provider status arrives with bolt 006.)

**Web (`apps/web`)**
- Sign-in screen (`/sign-in`, O2): one calm page with three steps (phone, code, then name and neighbourhood for new owners), a 60-second resend timer, clear Bangla and English messages for every failure, and return to the page the person came from.
- Admin sign-in (`/admin/sign-in`): email and password, English only.
- A same-origin proxy (`/api/*`) so the browser only talks to the web app and cookies stay httpOnly.
- Middleware that protects owner pages (`/bookings`, `/pets`, `/inbox`, `/settings`, `/book`), provider pages (`/provider/*`) and admin pages (`/admin/*`): guests are sent to sign in; signed-in people on the wrong side are sent to their own home.
- Header: "Sign in" for guests, the person's name and "Sign out" when signed in.

**Seed:** phones for the four training providers; loaders for users (Bibi, the four providers) and the admin (Ayaat with a training-only password from `.env`), added to `npm run seed`.

### Files (main)

`apps/api/src/auth/*` (ports, dummy OTP adapter, sessions, passwords, rate limit, guards, routes, admin routes, audit), `apps/api/src/db/schema/auth.ts`, `drizzle/0003_*.sql`, `apps/api/src/seed/load-people.ts`, `packages/shared/src/phone.ts`, `apps/web/src/middleware.ts`, `apps/web/src/pages/api/[...path].ts`, `pages/sign-in.astro` and `components/auth/SignInFlow.tsx`, `pages/admin/sign-in.astro`, sign-out endpoints, shell header updates, new message keys, `.env.example`, `playwright.config.ts` (API and Dummy servers), tests.

### APIs involved

The Dummy SMS/OTP API (`/api/otp/send`, `/api/otp/verify`) through the OTP port. The web app reaches only the PetCare API, never the Dummy service.

### Technical approach

- Fastify with `@fastify/cookie`; the app takes its dependencies (database, OTP port, clock) as parameters so tests can supply a controllable clock and the real Dummy service.
- Phone numbers are normalised once (`01712345678` and `+8801712345678` both become `+8801712345678`) by a shared helper.
- The Dummy service already provides the OTP rules (six digits, five minutes, five wrong attempts, single use); this bolt maps its answers to clear messages.
- Cross-origin problems are avoided by serving everything through the web origin.

### How it will be tested

- **API (Vitest, real PostgreSQL, real Dummy service in process):** sign-in as Bibi (existing owner) and as a new number (name and neighbourhood step); wrong, expired and reused codes; OTP service down (safe 503, retry works); send limit; provider phone gives a provider session; no public provider creation; cookie flags; session expiry with the clock; sign-out; the full 401/403 matrix for owner, provider, admin and guests; admin sign-in (right and wrong credentials, no account enumeration, hashed password, audit entries, sessions not interchangeable); audit helper.
- **Seed:** users and admin load, running twice is identical.
- **End to end (Playwright with API and Dummy running):** guest redirected to sign-in and back; Bibi signs in with a code read from the Dummy inspection and lands where she was going; header shows her name; sign-out; new number asks for name and neighbourhood; wrong code message in Bangla; OTP service down shows a retryable message; provider and admin routing; wrong-side redirects.

### Acceptance criteria

- [ ] ACC-01: code sent through the OTP port with a 60 s resend timer; right code signs in and starts a session; new owners give name and a launch neighbourhood; provider phones reach `/provider` only if an account exists; wrong, expired or reused codes are refused clearly; OTP service down fails safely and can be retried
- [ ] ACC-02: separate admin sign-in; owner or provider sessions are refused on admin and other-role APIs; a second admin record needs no schema change; every admin action can be audit-logged through one helper

### Out of scope

Notification port, delivery and inbox (deferred); settings page (bolt 016); linking provider accounts to provider status (bolt 006); password reset; email sign-in; real SMS.
