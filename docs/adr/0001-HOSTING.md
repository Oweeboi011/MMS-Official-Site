# ADR 0001 — Hosting

> - **Purpose:** A recorded decision: what was chosen and why. Changing it needs a new decision record.
> - **For:** Officers and leads · Owner (accounts, billing) · Developers
> - **In short:** The site runs on Cloudflare Pages' free plan: it costs nothing and stops at its limits instead of billing more. Vercel and Azure were ruled out.

- **Status:** Accepted. Cloudflare Pages (free) live at https://www.metropolitanms.org/ since 2026-11-05. Phase 2+ backend superseded by [ADR 0005](0005-OPEN-CLIMBS-FIREBASE.md) (Firebase).
- **Date:** 2026-10-29, updated 2026-11-05
- **Supersedes:** Vercel Hobby plan (dropped 2026-11-04: non-commercial terms forbid payments, so phase 3 would force a move); earlier azd → Azure SWA draft (Azure dropped by owner).

## Context

- **Hard cap: ₱54–₱100/month total** (domain ≈ ₱54 + free plans). Supersedes the earlier ₱500 budget. Only plans that **stop or fail at quota** instead of billing overage are allowed. Phase 2 needs DB + auth + functions; phase 3 needs online payments.
- Vercel Hobby is free but non-commercial ("requesting or processing payment" counts), so phase 3 would force a move anyway.
- Firebase was the cheapest full stack (≈ ₱54–₱150/month), but **Firebase is blocked on company laptops**.
- Cloudflare (Pages + Workers + D1) free plan ≈ ₱54/month (domain only), ≈ ₱344 if Workers Paid. Unverified: payments allowed on free plan; not blocked on company laptops.
- Azure: ruled out by owner (was ≈ ₱580/month, over cap).

## Decision

1. **Cloudflare Pages, free plan**, deployed by Wrangler CLI (`public/_headers`), MMS Cloudflare account. ₱0 hosting. GitHub Pages (temporary host) retired 2026-11-05.
2. **Phase 2+:** ~~Workers + D1~~ superseded by [ADR 0005](0005-OPEN-CLIMBS-FIREBASE.md): new MMS Firebase project, Blaze with a billing hard stop. Cloudflare stays host + DNS. Costs: [hosting and billing](../guides/BILLING.md).
3. **Open checks** (owner): Cloudflare not blocked on company laptops; Firebase console reachable from company laptops (ADR 0005).

## Consequences

- One host from info site to payments; no mid-project migration.
- Vercel removed: `vercel.json`, `@vercel/analytics`. Analytics, if wanted: Cloudflare Web Analytics (dashboard toggle, no code).
- App stays host-agnostic (static `dist/`), so switching is a config change.
