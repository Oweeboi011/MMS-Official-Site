# MMS Official Site

Official website of the **Metropolitan Mountaineering Society (MMS)**: https://www.metropolitanms.org/

React 19 + Vite single-page app on Cloudflare Pages (free plan). Code: `src/frontend` (SPA, content in `src/frontend/data/*.ts`) and `src/backend` (Firebase Cloud Functions, [ADR 0005](docs/adr/0005-OPEN-CLIMBS-FIREBASE.md)).

## Quick start

```sh
npm install          # also sets git hooks; needs gitleaks installed once
npm run dev          # http://localhost:5173
npm run check        # all blocking gates, run before pushing
```

## Deploy

```sh
npm run deploy:preview   # check → build → perf → preview URL
npm run deploy:prod      # … → https://www.metropolitanms.org/ → prod parity
```

Manual Wrangler CLI deploys from `main` (or GitHub Actions **Deploy**, manual). Accounts, domain, and setup: [deploy guide](docs/guides/DEPLOYMENT.md).

## Docs

| | |
|---|---|
| [Overview](docs/guides/OVERVIEW.md) | Layout, commands, editing content |
| [Deploy](docs/guides/DEPLOYMENT.md) | Cloudflare Pages, domain, accounts |
| [Solution plan](docs/solution-plan/SOLUTION-PLAN.md) | Features, architecture, migration, costs, harness, open items |
| [ADRs](docs/adr/) | Why it's built this way |

All docs: [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md). Contributor rules: [.claude/CLAUDE.md](.claude/CLAUDE.md).
