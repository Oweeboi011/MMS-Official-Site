# Deploy

## Now: GitHub Pages (temporary)

- Push/merge to `main` → `.github/workflows/pages.yml` builds (`npm test`, `BASE_PATH=/<repo>/`) and deploys. Only `main` may deploy (environment rule).
- URL: `https://oweeboi011.github.io/MMS-Official-Site/`. Deep links via `404.html` copy.
- `vercel.json` headers/cache don't apply on Pages.
- Run `npm run check` before merging; the workflow doesn't.

## Next: Vercel Hobby (CLI)

```sh
npx vercel login
npx vercel link        # first time: link to the MMS Vercel project
npx vercel             # preview URL
npx vercel --prod      # production
```

- Config: `vercel.json` (SPA rewrite, security headers, `/assets` cache).
- Run `npm run check` before `--prod`. CI (`.github/workflows/ci.yml`) is **manual-only** until enabled.
- Push-to-deploy off: `"git": { "deploymentEnabled": false }` in `vercel.json`, so `vercel link` connecting the repo won't auto-deploy.
- Custom domain `metropolitanms.org` (registrar: **Namecheap**): Vercel → Project → Settings → Domains → add apex + `www` → copy the A / CNAME records Vercel shows → Namecheap → Domain List → Manage → Advanced DNS (delete parking records first). SSL is automatic.
- Namecheap: auto-renew on, WHOIS privacy on, account owned by MMS ([architecture](../solution-plan/architecture.md)).
- Hobby is non-commercial — see [ADR 0001](../adr/0001-hosting.md#consequences).

## Budget

**Hard cap ₱54–₱100/month** ([ADR 0001](../adr/0001-hosting.md)). Hobby and Cloudflare free have no billing, so no overage. Any billed account, day one: budget **US$1.70/month** (≈ ₱100), alerts at 50/80/100%.

- **Google Cloud / Firebase:** Billing → Budgets & alerts.
- **Vercel Pro:** Settings → Billing → Spend Management.

Alerts don't stop spending. Treasurer checks the bill monthly.

## Legacy (to delete once Vercel prod is live)

| File | Target |
|------|--------|
| `.github/workflows/pages.yml` | GitHub Pages. **Still auto-deploys on push to main** |
| `BASE_PATH` in `vite.config.ts`, comment in `src/lib/asset.ts` | Pages sub-path; base becomes `/` |
