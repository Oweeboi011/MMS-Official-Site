# ADR 0001 — Hosting

- **Status:** Accepted for now (Vercel Hobby). Phase 2+ host **open**.
- **Date:** 2026-10-29
- **Supersedes:** earlier draft (azd → Azure SWA Free). Azure dropped by decision of the project owner.

## Context

- **Hard cap: ₱54–₱100/month total** (domain ≈ ₱54 + free plans). Supersedes the earlier ₱500 budget. Only plans that **stop or fail at quota** instead of billing overage are allowed. Phase 2 needs DB + auth + functions; phase 3 needs online payments.
- Vercel Hobby is free but non-commercial; Vercel's terms count "requesting or processing payment" as commercial.
- Firebase was the cheapest full stack (≈ ₱54–₱150/month), but **Firebase is blocked on company laptops**.
- Cloudflare (Pages + Workers + D1) free plan ≈ ₱54/month (domain only), ≈ ₱344 if Workers Paid. Unverified: payments allowed on free plan; not blocked on company laptops.
- Azure: ruled out by owner (was ≈ ₱580/month, over cap).

## Decision

1. **Now (temporary):** GitHub Pages from `main` (`pages.yml`). **Next:** **Vercel Hobby** by CLI (`vercel.json`). ₱0 hosting either way.
2. **Before phase 2 (backend)**, pick the full-stack host; must allow payments for phase 3 ([options](../solution-plan/hosting-and-billing.md#options-for-phase-2-needs-payments)):
   - Preferred, if both Cloudflare checks pass → **Cloudflare Pages + Workers + D1, free plan only**. Domain moves to Cloudflare Registrar. Outgrowing free → trim usage, not Workers Paid (₱290 breaks cap).
   - Else, if only the Firebase console/CLI is blocked on laptops → **Firebase**, deployed from CI, only if spend can be held under the cap (Blaze bills overage; alerts don't stop it). Unverified.
   - **Ruled out (over cap):** Vercel Pro + Supabase (≈ ₱1,215+), Supabase Pro, any paid plan.

## Consequences

- **Non-commercial rule (Hobby):** no payments, sponsors, or paid ads on the site while on Hobby. Single source; other docs link here.

- GitHub Pages becomes legacy; delete `pages.yml` + `BASE_PATH` handling once Vercel prod is live ([deploy](../guides/deploy.md#legacy-to-delete-once-vercel-prod-is-live)).
- App stays host-agnostic (static `dist/`), so switching is a config change.
