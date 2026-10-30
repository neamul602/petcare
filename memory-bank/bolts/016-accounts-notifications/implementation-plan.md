---
stage: plan
bolt: 016-accounts-notifications
created: 2026-10-31T22:30:00Z
---

## Implementation Plan: settings (bolt 016)

Story ACC-05. Simplest workable version: owners and providers see their verified phone (read-only) and change their name and language; the language is saved on the account and the language cookie follows. Admin name change is an API call (the console is English only). Notification choices are not built because the notification system is deferred (see `deferred-scope.md`); when it is built, the choices plus the rule that acute-event messages cannot be turned off will be added here.

- API: `GET /me/settings`, `PUT /me/settings` (name 1-60 characters, language bn or en); `PUT /admin/me` (name).
- Web: a settings form on `/settings` and `/provider/settings`; saving sets the language cookie and returns to the page.
- On sign-in the saved language is applied.
