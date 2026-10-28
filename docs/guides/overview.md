# Overview

Official site of the Metropolitan Mountaineering Society (MMS). It's a React 19 + Vite single-page app. Content currently lives in TypeScript data files; there is no backend yet ([plan](../solution-plan/plan.md)).

## Run

```sh
npm install        # also installs the pre-commit hook
npm run dev        # http://localhost:5173
```

## Layout

```
src/
  lib/          pure helpers. No React, no data
  data/         content + types (models). No UI
  components/   UI pieces, reused across pages
  pages/        full screens built from components
  App.tsx       routes
tests/
  unit/ component/ integration/   vitest (jsdom)
  e2e/                            playwright, against the production build
  performance/                    bundle size budget
scripts/        one-off build tools (image fetch)
infra/          azd / Bicep for the temporary Azure deploy
docs/           you are here
```

Dependency direction is enforced: `lib ← data ← components ← pages ← App` ([quality harness](../solution-plan/quality-harness.md)).

## Commands

| Command | What |
|---------|------|
| `npm run check` | All blocking gates (~15 s). Run before pushing |
| `npm test` | Unit, component, and integration tests |
| `npm run test:e2e` | Browser smoke tests (needs `npx playwright install chromium` once) |
| `npm run build && npm run test:perf` | Build, then check the bundle budget |
| `npm run check:audit` | Known-vulnerable packages |

## Editing content

- Page copy: `src/data/subpages.ts` (blocks per subpage), `src/data/pages.ts` (program pages), `src/data/content.ts` (home).
- New subpage: add it to `src/data/sitemap.ts`, then its blocks to `subpages.ts`. Tests check that every subpage renders.
