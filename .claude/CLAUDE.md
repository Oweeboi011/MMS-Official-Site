# CLAUDE.md

## Style (CRITICAL)

- Extremely concise. Fragments ok, grammar optional.
- No Claude co-author / attribution anywhere (commits, PRs, code).

## Project

MMS official site. Live: https://www.metropolitanms.org/. Start: `docs/guides/OVERVIEW.md`. Plan + open items: `docs/solution-plan/SOLUTION-PLAN.md`.

| Path | What |
|---|---|
| `src/frontend` | React 19 + Vite SPA. Content `src/frontend/data/*.ts` |
| `src/backend` | Firebase config + Functions (own `package.json`) |
| `tests/{unit,component,integration,parity,e2e,performance}` | all tests |
| `.config/` | tool configs · `tools/` dev utils · `scripts/` deploy/parity · `data/` tool inputs |
| `.githooks/` · `.github/` | hooks · CI/CD |

New file → its folder above. Root only for files tools require there ([ADR 0006](../docs/adr/0006-REPO-LAYOUT.md)).

## Rules

- Frontend layers: `lib ← data ← (services) ← components ← pages ← App`. Inner never imports outer. `data` no React.
- Reuse first: `src/frontend/components` (esp. `ContentBlocks` block types) before new UI.
- SOLID + clean architecture: small single-purpose units, data apart from UI, no god files.
- Banned: `eval`, `innerHTML`, `dangerouslySetInnerHTML`, lodash/moment/axios. Secrets never in code/chat.
- Comments: ≤ 2 lines, why not what. No commented-out code. Long comment → shorten or move to docs.
- Generated, don't hand-edit: `src/frontend/data/credits.ts` (`tools/fetch-images.mjs`), `src/frontend/data/topMountains.ts`.
- Cost cap **₱54–₱100/month**. Free plans only, except Firebase Blaze with billing hard stop (US$1.70/mo) ([ADR 0001](../docs/adr/0001-HOSTING.md), [0005](../docs/adr/0005-OPEN-CLIMBS-FIREBASE.md)). No Azure, Vercel, GitHub Pages.
- New accounts: MMS Gmail = primary owner, Owee = second.
- Don't invent facts (officers, fees, dates, trail classes). Mark unknown, ask.

## Harness (minimum viable)

- `npm run check` (~15 s): gitleaks, tsc, eslint, depcruise, knip, jscpd, image budget, vitest.
- UI/routing change → `npm run test:e2e`. Bundle change → `npm run build && npm run test:perf`. Rules change → Quality Gates **Security Rules Tests** (local `npm run test:rules` needs Java).
- Hooks: pre-commit = gitleaks + eslint staged; commit-msg = sign-off, subject ≤ 72, no AI co-author. Never `--no-verify`.
- Tests at lowest level that catches the bug. Open Climbs parity todos: `tests/parity`.
- Harness too slow (> ~30 s) → move step to Quality Gates, don't add tools.
- Details: [CODE-QUALITY](../docs/guides/CODE-QUALITY.md).

## Done gate (CRITICAL, every task)

1. Re-read **Open items** in SOLUTION-PLAN; list gaps this change touches. Board item assigned to someone other than Owee → don't work on it, say so.
2. `npm run check` green (+ e2e / perf when relevant). IDE problems = 0.
3. `/code-review` on diff: correctness, SOLID, reuse, dead code, complexity, long comments, folder placement. Fix confirmed, re-run 2.
4. Update docs + Open items in same change; matching issue on the [board](https://github.com/users/Oweeboi011/projects/2) too (new row → new issue, done → close). Decision changed → ADR.
5. All green → `git commit -s -m "<short imperative subject>"`. No co-author. Not green → report gaps, don't commit.
6. Branches: `feature/*` → PR `development` (→ preview) → release PR `main` (→ production, approval). Never push straight to `main`.

## Docs

- `docs/guides` what · `docs/solution-plan` how/what (one file) · `docs/adr` why. Names ALL CAPS. Domain terms: `docs/guides/CONTEXT.md` (via `/grill-with-docs`).
- Markdown + Mermaid. Close to code. Deprecate aggressively. No boilerplate. One topic, one place.

## Deploy

- `npm run deploy:preview` / `deploy:prod` (check → build → perf → wrangler → parity). Or GitHub Actions **Deploy** (manual). Guide: `docs/guides/DEPLOYMENT.md`.
- Quality Gates: PRs/pushes on `development` + `main`. CD: `development` → preview, `main` → production ([DEPLOYMENT](../docs/guides/DEPLOYMENT.md#branches--environments)).
