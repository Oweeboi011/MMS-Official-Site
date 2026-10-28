# ADR 0001 — Hosting

- **Status:** Accepted for now (azd → Azure SWA Free). Phase 2+ host **open**.
- **Date:** 2026-10-29

## Context

- Budget ₱500/month. Phase 3 needs online payments.
- Free tiers (Vercel Hobby, Azure SWA Free) are for personal / non-commercial use. Vercel's terms explicitly count "requesting or processing payment" as commercial.
- Firebase was the cheapest full stack (≈ ₱55–₱125/month), but **Firebase is blocked on company laptops**.
- "Vercel under Google Cloud" isn't a thing. They're separate providers.

## Decision

1. **Now:** deploy the info site with **azd to Azure Static Web Apps Free** (`azure.yaml`, `infra/`). ₱0 hosting.
2. **Before phase 2**, pick the full stack ([options](../solution-plan/hosting-and-billing.md#options-for-phase-2-needs-payments)):
   - If the block is only the console/CLI on dev laptops → **Firebase** (deploy from CI, not laptops). Fits budget.
   - If visitors on company networks are blocked too → **Azure** (SWA Standard ≈ ₱522 + free-tier DB/functions). Slightly over; needs ~₱80 more, or keep SWA Free for static pages plus Azure Functions for the API.

## Consequences

- Vercel and GitHub Pages configs become legacy; delete them once azd is live ([deploy](../guides/deploy.md#legacy-targets-to-delete-once-azd-is-live)).
- The app stays host-agnostic (static build in `dist/`), so switching later is a config change.
