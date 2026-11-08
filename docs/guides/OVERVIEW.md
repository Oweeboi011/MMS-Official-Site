# Overview

Official site of the **Metropolitan Mountaineering Society (MMS)**, live at https://www.metropolitanms.org/. Replaces the old Google Sites page; Open Climbs (registration, payments) moves in from `mms-open-climbs.web.app` ([plan](../solution-plan/SOLUTION-PLAN.md)).

- **Frontend:** React 19 + Vite SPA on Cloudflare Pages (free). Content in TypeScript data files ([DATA](DATA.md)).
- **Backend:** Firebase project `mms-official-site-513809` (Blaze + hard stop): Auth (email + Google), Firestore `openclimbs`, Storage, 21 Open Climbs functions + `billingHardStop`. Live since 2026-11-08 but idle: no data until the sync (phase 2), emails off ([API](API.md)).
- **Status + open items:** [SOLUTION-PLAN](../solution-plan/SOLUTION-PLAN.md).
- **How it fits:** [ARCHITECTURE](ARCHITECTURE.md). **Run/change it:** [DEVELOPER-GUIDE](DEVELOPER-GUIDE.md). **Use it:** [USER-GUIDE](USER-GUIDE.md).

## Layout

Why: [ADR 0006](../adr/0006-REPO-LAYOUT.md).

```
src/frontend/     React SPA: lib/ data/ components/ pages/ App.tsx
src/backend/      firebase.json, .firebaserc, firebase/ (rules, indexes, CORS), functions/ (own package.json)
tests/            unit/ component/ integration/ parity/ (vitest) · e2e/ (playwright) · performance/
scripts/          delivery: deploy.mjs, prod-parity.mjs
tools/            dev utilities: secrets.mjs (gitleaks), fetch-images.mjs
data/             tool inputs (images.json)
public/           static files; _headers = Cloudflare headers + cache
.config/          tool configs: playwright, dependency-cruiser, knip, jscpd, gitleaks, lint-staged
.githooks/        pre-commit (secrets + eslint staged), commit-msg (sign-off, no AI co-author)
.github/          Quality Gates, Continuous Delivery, shared setup action, PR template
.claude/          CLAUDE.md + settings (Claude Code rules)
docs/             guides (what) · solution-plan (how) · adr (why)
```
