---
stage: implement
bolt: 016-accounts-notifications
created: 2026-10-31T23:00:00Z
---

## Implementation Walkthrough: settings (bolt 016)

### Summary

Owners and providers change their name and language on a settings page; the verified phone is shown read-only. The saved language becomes the current language everywhere. The admin can change their own name through the API.

### Completed Work

- [x] `apps/api/src/auth/settings-routes.ts` - `GET/PUT /me/settings`, `PUT /admin/me` (audit-logged)
- [x] Web: `components/SettingsForm.astro`, `lib/settings.ts`, owner `/settings` and provider `/provider/settings` with save endpoints
- [x] 9 new strings (491 keys, parity passes)

### Key Decisions

- Notification choices are not built because the notification system is deferred; when it is, the choices and the rule that acute-event messages cannot be turned off are added to this page.
