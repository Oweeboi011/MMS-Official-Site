# ADR 0008 — Open Climbs URLs

> - **Purpose:** A recorded decision: what was chosen and why. Changing it needs a new decision record.
> - **For:** Officers and leads · Owner (accounts, billing) · Developers
> - **In short:** The web addresses for climbs: the schedule stays at /activities/open-climbs, each climb gets a short link /climbs/… that is easy to share.

- **Status:** Accepted (owner, 2026-11-09). Replaces the `/open-climbs/*` line in [ADR 0005](0005-OPEN-CLIMBS-FIREBASE.md).
- **Date:** 2026-11-09

`/open-climbs` already redirects to the info page `/activities/open-climbs`, so the app does not live under `/open-climbs/*`. Instead:

| Page | URL |
|---|---|
| Schedule: this year's upcoming + completed climbs | `/activities/open-climbs` (info page becomes the live list) |
| Past years | `/activities/open-climbs?year=YYYY` |
| One climb (shared link) | `/climbs/:id` |
| Register | `/climbs/:id/register` |
| My registrations | `/account/climbs` |
| Admin | `/admin/climbs` |
| Old app | `mms-open-climbs.web.app/event/:id` → `/climbs/:id` at the switch |

Why: no new top-level section or nav change; short share links (#185); registration stays tied to its climb. Shared URLs are hard to change later.
