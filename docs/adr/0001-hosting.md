# ADR 0001 — Hosting

- **Status:** Accepted for now (Vercel Hobby). Phase 2+ host **open**.
- **Date:** 2026-10-29
- **Supersedes:** earlier draft (azd → Azure SWA Free). Azure dropped by decision of the project owner.

## Context

- Budget ₱500/month. Phase 2 needs DB + auth + functions; phase 3 needs online payments.
- Vercel Hobby is free but non-commercial; Vercel's terms count "requesting or processing payment" as commercial.
- Firebase was the cheapest full stack (≈ ₱55–₱125/month), but **Firebase is blocked on company laptops**.
- Azure: ruled out by owner (was ≈ ₱580/month, just over budget).

## Decision

1. **Now:** info site on **Vercel Hobby**, deployed by CLI (`vercel.json`). ₱0 hosting.
2. **Before phase 2 (backend)**, pick the full-stack host; must allow payments for phase 3 ([options](../solution-plan/hosting-and-billing.md#options-for-phase-2-needs-payments)):
   - If only the Firebase console/CLI is blocked on laptops → **Firebase**, deployed from CI. Fits budget.
   - Otherwise → **Vercel Pro + Supabase** (≈ ₱1,215+, over budget). No in-budget fallback yet; revisit before phase 2.

## Consequences

- **Non-commercial rule (Hobby):** no payments, sponsors, or paid ads on the site while on Hobby. Single source; other docs link here.

- GitHub Pages becomes legacy; delete `pages.yml` + `BASE_PATH` handling once Vercel prod is live ([deploy](../guides/deploy.md#legacy-to-delete-once-vercel-prod-is-live)).
- App stays host-agnostic (static `dist/`), so switching is a config change.
