# MMS Official Site

Official website of the **Metropolitan Mountaineering Society (MMS)**: https://www.metropolitanms.org/

React 19 + Vite single-page app on Cloudflare Pages (free plan). Content lives in `src/data/*.ts`; no backend yet.

## Quick start

```sh
npm install          # also installs the pre-commit hook
npm run dev          # http://localhost:5173
npm run check        # all blocking gates, run before pushing
```

## Deploy

```sh
npm run deploy:preview   # check → build → preview URL
npm run deploy:prod      # check → build → https://www.metropolitanms.org/
```

Manual Wrangler CLI deploys from `main`. Accounts, domain, and setup: [deploy guide](docs/guides/deploy.md).

## Docs

| | |
|---|---|
| [Overview](docs/guides/overview.md) | Layout, commands, editing content |
| [Deploy](docs/guides/deploy.md) | Cloudflare Pages, domain, accounts |
| [Plan](docs/solution-plan/plan.md) | Features and roadmap |
| [Hosting & billing](docs/solution-plan/hosting-and-billing.md) | Costs, ₱54–₱100/month hard cap |
| [ADRs](docs/adr/) | Why it's built this way |

All docs: [docs/README.md](docs/README.md). Contributor rules: [CLAUDE.md](CLAUDE.md).
