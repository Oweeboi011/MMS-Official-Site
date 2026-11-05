# API

Backend endpoints and external APIs. Code: `src/backend/functions/src`.

## Cloud Functions (`mms-official-site-513809`, `asia-southeast1`)

| Function | Trigger | Does |
|----------|---------|------|
| `billingHardStop` | Pub/Sub `billing-budget` | `costAmount ≥ budgetAmount` → unlink project billing. Logic `budget.js`; tests `tests/unit/budget.test.ts` |

Needs Project Billing Manager on the compute service account ([open items](../solution-plan/SOLUTION-PLAN.md#open-items)). After a stop: Firebase console → Usage and billing → link billing again.

Planned (migration phases 1–6): sync (scheduled, old → new), registration triggers (counts, waitlist, emails), PayMongo checkout + webhook.

## External APIs

| API | Used by | Auth |
|-----|---------|------|
| Wikimedia Commons | `tools/fetch-images.mjs` (dev) | none |
| Cloudflare Pages | `wrangler` via `scripts/deploy.mjs` | `wrangler login` / `CLOUDFLARE_API_TOKEN` |
| Cloud Billing | `billingHardStop` | function service account |
| PayMongo, Brevo | planned | keys in Secret Manager only |
