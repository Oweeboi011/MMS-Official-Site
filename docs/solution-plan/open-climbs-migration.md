# Open Climbs migration

Goal: every feature of [mms-open-climbs](https://github.com/Oweeboi011/mms-open-climbs) (`mms-open-climbs.web.app`) runs at `www.metropolitanms.org/open-climbs/*`, on a **new Firebase project with 2 owners** (Owee + MMS Gmail). Same users: nobody re-registers. No shared resources: the old site keeps its own project until the owner retires it (planned 2027).

## Decision ([ADR 0005](../adr/0005-open-climbs-firebase.md), accepted)

| Layer | Old: `mms-open-climbs` | New: `mms-site-…` (owners: Owee + MMS Gmail) |
|---|---|---|
| Frontend | React 19 JSX SPA, Firebase Hosting | **This repo** (TypeScript), Cloudflare Pages |
| Accounts | Firebase Auth (email + Google) | New Firebase Auth; users **copied with password hashes** (same email/password; Google sign-in keeps working) |
| Data | Firestore `openclimbs` | New Firestore, same shapes; **one-way sync old → new** |
| Files | Firebase Storage | New bucket; synced |
| Rules, indexes, Functions | old repo → old project | Copied into this repo → new project (+ `sync` function) |
| `mms-open-climbs.web.app` | live, source of truth | Read-only after the switch; retired 2027 |

Why a new project: MMS owns it from day one; the old project stays untouched as a fallback. Both on Blaze (Functions need it), ≈ ₱0 within free quota.

Announcements, officers and surveys go to the new Firestore too: one login, one admin role, one database for the official site.

## Sync (until the switch)

- Scheduled function in the **new** project, every 15 min, using a read-only service account on the old project (secret in Secret Manager, never in code).
- **Users:** Admin SDK `listUsers` (old) → `importUsers` (new) with the old project's scrypt hash config; disabled/deleted mirrored.
- **Firestore:** collections from the old [DATA](https://github.com/Oweeboi011/mms-open-climbs/blob/main/docs/guides/DATA.md) guide, upsert by doc id where `updatedAt` > last sync; deletes mirrored. Logs (`pageViews`, `failedRequests`) not synced.
- **Storage:** new/changed objects copied by path; document fields keep the same paths.
- **Direction is one-way.** While sync runs, the new site's member and admin **writes are off** (feature flag `VITE_WRITES_ENABLED=false`): browse, event pages, sign in, My Registrations work; register/pay/admin edits link to the old site. Triggers that send email are **disabled** in the new project during sync (no double emails).

## The switch (owner picks the date)

1. Old site → read-only banner; final sync; stop the sync function.
2. Enable writes on the new site and email triggers in the new project; `APP_URL` → `www.metropolitanms.org`.
3. Officers use the new admin only. Old site stays readable until 2027, then `mms-open-climbs.web.app/**` → 301 and the old repo is archived.

## Phases

| # | Phase | Scope | Done when |
|---|---|---|---|
| 0 | Decide | ✅ ADR 0005 + cost-rule exception accepted 2026-11-05. Open: laptop check for Firebase console | Laptop check passes |
| 1 | New project | Owee creates the project, adds MMS Gmail as IAM Owner, Blaze (MMS billing account if any) + billing hard stop; Auth email + Google, authorized domain `www.metropolitanms.org`; Firestore + Storage; rules + indexes + functions copied here and deployed (email triggers off) | Rules + functions tests pass here, emulator |
| 2 | Sync | Sync function; first full copy; verify counts (users, climbs, registrations, files) | Counts match; an existing user signs in on the new project |
| 3 | Public read | `firebase` SDK in `src/services/`; schedule (season, filters, stats), event page (profile, itinerary, weather, trail maps, photos, officers, announcements, participants) | Matches old site for all climbs |
| 4 | Accounts | Sign up (off until switch), log in (email + Google), forgot password, My Details, My Registrations, notifications | Existing users see their data |
| 5 | Register | Form, waitlist, fees + optional/shared fees, waiver (typed + print), GCash QR + proof upload, required docs, donation pledge, feedback | End-to-end on emulator |
| 6 | Admin | Dashboard, climbs manage + form, climb detail/day sheet, registrations, payments (record, refund, split, history, balance due), expenses, donations, users, analytics, app insights, release notes + email jobs | Parity checklist (old `USER_MANUAL.md`) signed off |
| 7 | Switch | Steps above | Officers run one real climb on the new site |

## Port rules

- Port, don't redesign: same Firestore shapes and field names (the sync copies documents as-is). Convert JSX → TSX as each file moves.
- Bring the tests with the code (Vitest, rules tests on the emulator, Jest for functions).
- Layers: `lib ← data ← services ← components ← pages ← App`; `services` is the only Firebase importer.
- Old repo's ADRs/guides: copy what still applies into `docs/`, delete the rest.

## Open checks

- Firebase console/CLI reachable from company laptops ([ADR 0001](../adr/0001-hosting.md)).
- Old project's password hash parameters (Auth → Users → ⋮ → Password hash parameters), needed for `importUsers`.
- Brevo account owned by MMS; sender domain `metropolitanms.org` (SPF/DKIM in Cloudflare DNS).
- Firestore scheduled backups on the new project before the switch.
