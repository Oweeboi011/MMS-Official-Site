# CLAUDE.md

## Style (CRITICAL)

- Extremely concise. Fragments ok, grammar optional.
- No Claude co-author / attribution in commits or PRs.

## Project

MMS official site. React 19 + Vite SPA, content in `src/data/*.ts`. Start here: `docs/guides/overview.md`.

## Rules

- Layers: `lib ← data ← components ← pages ← App`. Inner never imports outer. `data` has no React.
- Reuse before adding: check `src/components` (esp. `ContentBlocks` block types) before writing new UI.
- SOLID + clean architecture: small single-purpose components, data separate from UI, no god files.
- Banned: `eval`, `innerHTML`, `dangerouslySetInnerHTML`, lodash/moment/axios. Secrets never in code.
- Don't hand-edit generated files: `src/data/credits.ts` (scripts/fetch-images.mjs), `src/data/topMountains.ts`.
- Don't invent facts (officers, fees, dates, trail classes). Mark unknowns, ask.

## Harness (minimum viable)

- Before done: `npm run check` (~15 s, must pass). UI/routing change → also `npm run test:e2e`. Bundle-heavy change → `npm run build && npm run test:perf`.
- Pre-commit hook = secretlint + eslint on staged files. Never `--no-verify`.
- Tests: lowest level that catches the bug. `tests/{unit,component,integration,e2e,performance}`.
- Details: `docs/solution-plan/quality-harness.md`.

## Code review (CRITICAL)

- Every change: run `/code-review` before commit. Fix confirmed findings, re-run checks.
- Review focus: correctness, SOLID, reuse of existing components, dead code, complexity.

## Docs

- `docs/guides` = what is it · `docs/solution-plan` = how/what to deliver · `docs/adr` = why.
- Markdown + Mermaid. Close to code. Deprecate aggressively (delete stale). No boilerplate. One topic, one place.
- Decision changed → update/supersede the ADR in the same change.

## Deploy

- Now: `azd up` / `azd deploy` (Azure SWA Free). CI `.github/workflows/ci.yml` manual-only, not enabled.
- Legacy (pending removal): `pages.yml` (still auto-deploys!), `vercel.json`, `@vercel/analytics`.
