# Deploy

## Now: azd → Azure Static Web Apps (Free), temporary

```sh
azd auth login
azd up            # first time: pick a subscription and region (eastasia); creates infra/main.bicep resources
azd deploy        # later deploys
```

- SPA deep links and cache headers: `public/staticwebapp.config.json`.
- Custom domain: Azure portal → Static Web App → Custom domains → add `metropolitanms.org` → set the DNS records at the registrar.
- CI (`.github/workflows/ci.yml`) is **manual-only** until we enable it. Run `npm run check` locally before `azd deploy`.

Why temporary: [ADR 0001](../adr/0001-hosting.md).

## Budget alerts (do this on day one)

Whatever the host, cap surprises at ₱500/month:

- **Azure:** Cost Management → Budgets → create **US$8.50/month** for the resource group, alerts at 50/80/100%.
- **Google Cloud** (if chosen later): Billing → Budgets & alerts → same amount and thresholds.

Alerts don't stop spending. Check the bill monthly (treasurer), next to the payment gateway report.

## Legacy targets (to delete once azd is live)

| File | Target |
|------|--------|
| `.github/workflows/pages.yml` | GitHub Pages. **Still auto-deploys on push to main** |
| `vercel.json`, `@vercel/analytics` in `src/App.tsx`, `.vscode/tasks.json` "vercel" task | Vercel |
