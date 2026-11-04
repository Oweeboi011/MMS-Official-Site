# ADR 0001 — Hosting

- **Status:** Accepted, pending open checks (see Decision 3): Cloudflare Pages (free) next, Workers + D1 for phase 2+.
- **Date:** 2026-10-29, updated 2026-11-04
- **Supersedes:** Vercel Hobby plan (dropped 2026-11-04: non-commercial terms forbid payments, so phase 3 would force a move); earlier azd → Azure SWA draft (Azure dropped by owner).

## Context

- **Hard cap: ₱54–₱100/month total** (domain ≈ ₱54 + free plans). Supersedes the earlier ₱500 budget. Only plans that **stop or fail at quota** instead of billing overage are allowed. Phase 2 needs DB + auth + functions; phase 3 needs online payments.
- Vercel Hobby is free but non-commercial ("requesting or processing payment" counts), so phase 3 would force a move anyway.
- Firebase was the cheapest full stack (≈ ₱54–₱150/month), but **Firebase is blocked on company laptops**.
- Cloudflare (Pages + Workers + D1) free plan ≈ ₱54/month (domain only), ≈ ₱344 if Workers Paid. Unverified: payments allowed on free plan; not blocked on company laptops.
- Azure: ruled out by owner (was ≈ ₱580/month, over cap).

## Decision

1. **Now (temporary):** GitHub Pages from `main` (`pages.yml`). **Next:** **Cloudflare Pages, free plan**, by Wrangler CLI (`public/_headers`). ₱0 hosting.
2. **Phase 2+:** same Cloudflare account adds **Workers + D1, free plan only**. Domain moves to Cloudflare Registrar. Outgrowing free → trim usage, not Workers Paid (₱290 breaks cap). Options compared: [hosting and billing](../solution-plan/hosting-and-billing.md#options-for-phase-2-needs-payments).
3. **Open checks** (owner): Cloudflare not blocked on company laptops (before first deploy); payments allowed on free plan (before phase 3). If either fails, revisit:
   - If only the Firebase console/CLI is blocked on laptops → **Firebase**, deployed from CI, only if spend can be held under the cap (Blaze bills overage; alerts don't stop it). Unverified.
   - **Ruled out (over cap):** Vercel Pro + Supabase (≈ ₱1,215+), Supabase Pro, any paid plan.

## Consequences

- One host from info site to payments; no mid-project migration.
- Vercel removed: `vercel.json`, `@vercel/analytics`. Analytics, if wanted: Cloudflare Web Analytics (dashboard toggle, no code).
- GitHub Pages becomes legacy; delete `pages.yml` + `BASE_PATH` handling once Cloudflare prod is live ([deploy](../guides/deploy.md#legacy-to-delete-once-cloudflare-prod-is-live)).
- App stays host-agnostic (static `dist/`), so switching is a config change.
