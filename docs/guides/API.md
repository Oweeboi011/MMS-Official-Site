# API

> - **Purpose:** The server functions and outside services the site uses.
> - **For:** Developers · Site admins
> - **In short:** Small server programs (Cloud Functions) send emails and reminders and keep counts up to date. This lists each one, what starts it and what it does.

Backend endpoints and external APIs. Code: `src/backend/functions/src`.

## Cloud Functions (`mms-official-site-513809`, `asia-southeast1`)

| Function | Trigger | Does |
|----------|---------|------|
| `billingHardStop` | Pub/Sub `billing-budget` | `costAmount ≥ budgetAmount` → unlink project billing. Logic `budget.js`; tests `tests/unit/budget.test.ts` |

Needs Project Billing Manager on the compute service account ([open items](../solution-plan/SOLUTION-PLAN.md#open-items)). After a stop: Firebase console → Usage and billing → link billing again.

### Open Climbs (ported from mms-open-climbs, phase 1; all deployed 2026-11-08)

Firestore database `openclimbs`. Emails only when `EMAILS_ENABLED=true` (off until the switch). Tests: `tests/unit/functions`.

| Group | Functions | Code |
|-------|-----------|------|
| Registration triggers | `onRegistrationCreated`, `onRegistrationUpdated`, `onRegistrationDeleted`, `onRegistrationDetailsWritten` | `triggers/registrations.js`, `triggers/memberDetails.js` |
| Climb + admin triggers | `onClimbUpdated`, `syncAdminClaim`, `onReleaseNoteEmailJobCreated` | `triggers/` |
| Scheduled | `sendReminderNotifications` (payment, paperwork, no-show) · `refreshSiteStats` (daily 03:00 Manila → `siteStats/public`: accounts, distinct climbers, climbs, completed) | `scheduled/` |
| Callables (admin) | `ensureAdminClaim`, `createUser`, `updateUserProfile`, `deleteUserAccount`, release notes ×4, insights ×4 | `callables/` |

Release-note drafts (`generateReleaseNoteDraft`): checkpoint = `sourceCommit` of the last **published** note with `sourceRepo` = this repo (rules require a sha `sourceCommit` with a non-empty `sourceRepo`; synced old-app notes never match). `until` = `main` or a sha on `main` after the checkpoint (any case); compare is paged (≤ 1,000 commits); first note = newest 50 (`truncated` = more exist; for the admin form, not built yet). Title date in Manila time. Publish notes in commit order: the newest published note is the checkpoint. Errors: bad/unknown `until` → `invalid-argument`; sha not on `main`, behind or diverged from the checkpoint, or too many commits → `failed-precondition`. 404 also covers a token that can't read the repo.

Secrets (Secret Manager, set before deploy): `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `GITHUB_TOKEN` (fine-grained, Contents read-only on `Oweeboi011/MMS-Official-Site`; release notes from `main` commits). Env: `APP_URL`, `BILLING_EXPORT_TABLE`, `EMAILS_ENABLED`. Not ported: `ogPrerender`, `cspReport` (Firebase Hosting rewrites; open item 18).

Planned: sync (scheduled, old → new, phase 2). No payment gateway ([ADR 0007](../adr/0007-PAYMENTS-MANUAL.md)).

## Frontend → Firestore

`src/frontend/services/siteData.ts`: list / save (merge; blanked fields deleted) / delete for the collections in `src/frontend/data/siteSchemas.ts`, which mirrors the rules. Sign-in: `services/auth.ts` (email/password, Google popup, reset). Roles come from `users/{uid}.role`; admins are set in the console.

### Public reads (no sign-in, no SDK)

`src/frontend/services/publicData.ts` reads site content over the Firestore REST API with the web API key: `:runQuery` for `announcements` (`published == true`, newest `publishedAt` first; home reads 3, `/media/news` 30), `surveys` (50, shown open first), `officers` (`current == true`, 50, for Our story; every term, current first, 300, for Leadership only), and `GET siteSettings/site`. Rules allow these signed out; an unfiltered `announcements` query is refused. While waiting: settings blank, lists empty (no sample contacts to click). No answer (HTTP error, missing doc) → `content.ts` sample; network error or 5 s timeout → sample and the next page retries. One read per collection per page load. Live officers never mix with sample names: a body with no live officers is hidden. Tests run with Firebase blanked (`vite.config.ts` `test.env`). Hooks: `services/useSiteData.ts`; mapping: `data/liveContent.ts`; REST JSON: `lib/firestoreRest.ts`. Dev with `VITE_USE_EMULATORS=true` reads the emulator.

## External APIs

| API | Used by | Auth |
|-----|---------|------|
| Wikimedia Commons | `tools/fetch-images.mjs` (dev) | none |
| Cloudflare Pages | `wrangler` via `scripts/deploy.mjs` | `wrangler login` / `CLOUDFLARE_API_TOKEN` |
| Cloud Billing | `billingHardStop` | function service account |
| Brevo | Open Climbs emails (`email/sendEmail.js`) | `BREVO_API_KEY` (Secret Manager) |
