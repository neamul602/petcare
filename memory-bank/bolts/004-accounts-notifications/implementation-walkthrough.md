---
stage: implement
bolt: 004-accounts-notifications
created: 2026-10-30T12:00:00Z
---

## Implementation Walkthrough: accounts-notifications (bolt 004)

### Summary

People can now sign in. Owners and providers use a phone number and a one-time code from the Dummy OTP service; new owners add a name and a launch neighbourhood once. The admin signs in separately with email and password. Every area is protected by role in both the API and the web app, sessions live in httpOnly cookies, and every admin action has one shared way to be audit-logged. The notification port (ACC-03) is deferred by owner decision and is not part of this bolt.

### Structure Overview

- **API**: an OTP port with a Dummy adapter (a real SMS provider later is one new adapter), session store, role guards, owner/provider routes, admin routes, rate limiting, password hashing, and an audit helper. Tables for users, admin users, sessions and short-lived signup tokens.
- **Web**: the browser only talks to the web app. A same-origin proxy forwards `/api/*` to the API so session cookies stay httpOnly. Middleware protects owner, provider and admin areas and tells every page who is signed in. The sign-in screen is one calm page with three steps.
- **Seed**: the training people (Bibi, four provider accounts, Ayaat) are now loaded into the database.

### Completed Work

- [x] `apps/api/src/auth/ports.ts` - the OTP port and its "unavailable" error
- [x] `apps/api/src/auth/dummy-otp.ts` - adapter for the Dummy SMS/OTP API (any failure, timeout or 5xx becomes "unavailable")
- [x] `apps/api/src/auth/passwords.ts` - scrypt password hashing with constant-time comparison
- [x] `apps/api/src/auth/rate-limit.ts` - sliding-window limiter driven by the injectable clock
- [x] `apps/api/src/auth/sessions.ts` - session store; only a hash of the token is stored; cookie names
- [x] `apps/api/src/auth/guards.ts` - role guards (401 for nobody, 403 for the wrong kind of session)
- [x] `apps/api/src/auth/routes.ts` - send code, verify code, first-time profile, sign-out, `me` endpoints
- [x] `apps/api/src/auth/admin-routes.ts` - admin sign-in and sign-out, audited; decoy hash so wrong email and wrong password look the same
- [x] `apps/api/src/auth/audit.ts` - the one helper every admin action uses to write the append-only audit log
- [x] `apps/api/src/db/schema/auth.ts`, `drizzle/0003_auth.sql` - users, admin users, sessions, signup tokens
- [x] `apps/api/src/app.ts`, `server.ts`, `config.ts` - app takes its dependencies as parameters; new settings for the Dummy URL and the send limit
- [x] `apps/api/src/db/client.ts` - the connection pool now survives dropped connections
- [x] `apps/api/src/seed/load-people.ts`, `run.ts` - loads users and the admin; summary reports accounts
- [x] `packages/shared/src/phone.ts` - one place that normalises Bangladesh mobile numbers
- [x] `packages/shared/src/config/training-decisions.ts` - sign-in rules (session lengths, send limit, resend time)
- [x] `packages/shared/seed/providers.json`, `people.json` - provider phone numbers and the admin email
- [x] `apps/web/src/lib/api.ts` - server-side API access and cookie forwarding
- [x] `apps/web/src/pages/api/[...path].ts` - same-origin proxy to the API
- [x] `apps/web/src/middleware.ts` - protects the three areas, redirects guests to sign in and back, sends the wrong side to its own home
- [x] `apps/web/src/components/auth/SignInFlow.tsx`, `pages/sign-in.astro` - the owner/provider sign-in screen (phone, code, profile)
- [x] `apps/web/src/pages/admin/sign-in.astro`, `admin/sign-out.ts`, `sign-out.ts` - admin sign-in form and both sign-out endpoints
- [x] `apps/web/src/components/AccountCard.astro`, `pages/settings.astro`, `provider/settings.astro` - who is signed in and Sign out
- [x] `apps/web/src/layouts/OwnerShell.astro`, `AdminShell.astro` - Sign in button for guests; admin name and Sign out
- [x] `packages/shared/src/i18n/*.json` - 36 new message keys per language for sign-in, errors and neighbourhoods (86 in total)
- [x] `tests/e2e/global-setup.ts`, `sessions.ts` - seeds the end-to-end database and saves signed-in browser sessions for owner, provider and admin
- [x] `playwright.config.ts`, `.env.example`, `.gitignore` - API and Dummy servers for the browser tests, new settings

### Key Decisions

- **Same-origin proxy** so the browser never sees the API address or the session token (httpOnly cookies work and there is no cross-origin setup).
- **403 versus 401**: nobody signed in is 401; a valid session of the wrong kind (owner on an admin endpoint, admin on an owner endpoint) is 403, which tells the caller they are signed in but not allowed.
- **Admin and owner/provider sessions are separate** (two cookies, two lookups), so one can never stand in for the other.
- **Sign-in can only ever create owners.** The profile step rejects any role and any neighbourhood outside the three launch areas; provider accounts come only from the seed (later the admin).
- **Generic admin errors**: a wrong password and an unknown email get the same answer; failed attempts are audited.
- **Wrong-side visitors are redirected to their own home** rather than shown an error page.
- **The send limit is a setting** (default 5 per 10 minutes per number) so test environments can raise it.
- **Sign out lives in Settings** (account actions belong there); the header shows Sign in for guests and Settings for signed-in people, so the narrow phone header never overflows.

### Deviations from Plan

- The notification port (ACC-03) is not built (deferred by owner decision, recorded in `memory-bank/deferred-scope.md`).
- The profile step and sign-out were planned inside the sign-in screen; sign-out ended up in Settings as described above.
- Added a database pool error handler and the `OTP_SEND_LIMIT_MAX` setting, neither planned, both found necessary while running the browser tests against long-lived servers.
- The end-to-end sessions are created once in global setup and reused by the older specs (shell, language, accessibility, touch targets), because protected pages now redirect guests; performance and offline tests switched to public pages.

### Dependencies Added

- [x] `@fastify/cookie` - reads and sets the session cookies

### Developer Notes

- Sign in locally: start PostgreSQL, run `npm run seed`, start the three apps (`npm run dev`), open `/sign-in`, enter `01712000001` (Bibi). The code is shown in the Dummy service: `GET http://localhost:4100/_training/otp/inspect`.
- Training accounts: Bibi `01712000001` (owner); Rashid `01712000002`, Farzana `…03`, Kamrul `…04`, Nusrat `…05` (providers); admin `ayaat@petcare.training` with the password from `ADMIN_TRAINING_PASSWORD` (default `training-admin-pass`, training only).
- Every admin action in later bolts must call `recordAdminAction`.
- Provider accounts are not yet linked to provider status (approved, suspended); that arrives with bolt 006.
- `npm audit` reports 7 low or moderate findings in development tooling (an old esbuild used by drizzle-kit and a deepmerge copy); none is in code that runs in production, and the fixes are breaking upgrades, so they are noted rather than forced.
