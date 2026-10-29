# Deploy

## Now: Vercel Hobby (CLI)

```sh
npx vercel login
npx vercel link        # first time: link to the MMS Vercel project
npx vercel             # preview URL
npx vercel --prod      # production
```

- Config: `vercel.json` (SPA rewrite, security headers, `/assets` cache).
- Run `npm run check` before `--prod`. CI (`.github/workflows/ci.yml`) is **manual-only** until enabled.
- Push-to-deploy off: `"git": { "deploymentEnabled": false }` in `vercel.json`, so `vercel link` connecting the repo won't auto-deploy.
- Custom domain: Vercel → Project → Settings → Domains → add `metropolitanms.org` → set DNS at the registrar.
- Hobby is non-commercial — see [ADR 0001](../adr/0001-hosting.md#consequences).

## Budget

Hobby has no billing, so no overage. Phase 2+ host, day one: budget **US$8.50/month** (≈ ₱500), alerts at 50/80/100%.

- **Google Cloud / Firebase:** Billing → Budgets & alerts.
- **Vercel Pro:** Settings → Billing → Spend Management.

Alerts don't stop spending. Treasurer checks the bill monthly.

## Legacy (to delete once Vercel prod is live)

| File | Target |
|------|--------|
| `.github/workflows/pages.yml` | GitHub Pages. **Still auto-deploys on push to main** |
| `BASE_PATH` in `vite.config.ts`, comment in `src/lib/asset.ts` | Pages sub-path; base becomes `/` |
