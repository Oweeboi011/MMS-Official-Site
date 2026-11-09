# ADR 0005 — Open Climbs on a new MMS Firebase project

> - **Purpose:** A recorded decision: what was chosen and why. Changing it needs a new decision record.
> - **For:** Officers and leads · Owner (accounts, billing) · Developers
> - **In short:** Open Climbs moves into this site on a new MMS-owned Firebase project, the one paid service, protected by a billing hard stop.

- **Status:** Accepted (owner, 2026-11-05), including the cost-rule exception below.
- **Date:** 2026-11-05

## Context

[mms-open-climbs](https://github.com/Oweeboi011/mms-open-climbs) (`mms-open-climbs.web.app`, ~44k lines) already runs climb registration, payments, documents and admin on Firebase (Auth, Firestore `openclimbs`, Storage, Cloud Functions, Brevo email). All MMS climbers have accounts there. Owner: every feature moves into this site; no shared resources with the old project; old site stays until 2027.

## Decision

- **New Firebase project, 2 owners** (created by Owee; MMS Gmail added as Owner in Google Cloud IAM, since that Gmail is held by another officer) is the backend for accounts and all live data (climbs, registrations, payments, announcements, officers, surveys). Blaze plan (Functions need it), ≈ ₱0 within free quota, budget alert US$1.70/month.
- **One-way sync old → new** (users with password hashes, Firestore, Storage) until the owner's switch date; the new site is read-only for member/admin writes and its email triggers are off while sync runs.
- Frontend rewritten into this repo (TypeScript), served by Cloudflare Pages (URLs: [ADR 0008](0008-CLIMB-URLS.md)). Same Firestore shapes as the old app.
- Plan: [open-climbs-migration](../solution-plan/SOLUTION-PLAN.md#open-climbs-migration).

## Consequences

- Replaces ADR 0001's phase 2 choice (Workers + D1). Cloudflare stays the host for the static site and DNS.
- **Conflicts with the cost rule** (CLAUDE.md, ADR 0001: no overage-billing services): Blaze bills overage and alerts don't stop spend. Mitigation = hard stop: budget US$1.70/month → Pub/Sub → function that **disables billing** on the project (Google's documented cap pattern); Functions then stop until re-enabled. CLAUDE.md's cost rule now allows Blaze with that hard stop. Free quotas are well above MMS traffic.
- Two Firebase projects until 2027; the old one is untouched and is the fallback until the switch.

## Rejected

- **Share the old project:** owner wants no shared resources and MMS ownership.
- **New empty project:** every climber would re-register.
- **Rebuild on Cloudflare D1/R2/Workers:** several times the work (Auth password hashes, rules, functions) and risks live registrations.
