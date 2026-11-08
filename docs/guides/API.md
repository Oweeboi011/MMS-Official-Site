# API

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

## External APIs

| API | Used by | Auth |
|-----|---------|------|
| Wikimedia Commons | `tools/fetch-images.mjs` (dev) | none |
| Cloudflare Pages | `wrangler` via `scripts/deploy.mjs` | `wrangler login` / `CLOUDFLARE_API_TOKEN` |
| Cloud Billing | `billingHardStop` | function service account |
| Brevo | Open Climbs emails (`email/sendEmail.js`) | `BREVO_API_KEY` (Secret Manager) |
