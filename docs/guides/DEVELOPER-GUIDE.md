# Developer guide

Setup: [GETTING-STARTED](../GETTING-STARTED.md). Claude Code rules: `.claude/CLAUDE.md` (humans follow the same).

## Commands

| Command | What |
|---------|------|
| `npm run dev` | dev server, http://localhost:5173 |
| `npm run check` | all blocking gates (~15 s); before every push |
| `npm test` | unit, component, integration, parity (vitest) |
| `npm run test:e2e` | Playwright smoke (`npx playwright install chromium` once) |
| `npm run build && npm run test:perf` | build + bundle budget |
| `npm run test:parity` | live site serves local `dist/` |
| `npm run check:audit` | high+ vulnerabilities (site + backend) |
| `npm run deploy:preview` / `deploy:prod` | [DEPLOYMENT](DEPLOYMENT.md) |

## Workflow

```mermaid
flowchart LR
  B[feature/* from development] --> C[code + test] --> K[npm run check] --> R[code review] --> M[commit -s] --> PR[PR → development] --> P[preview] --> REL[release PR → main] --> D[production]
```

1. Branch `feature/<name>` from `development` ([branches](DEPLOYMENT.md#branches--environments)). Reuse `src/frontend/components` (esp. `ContentBlocks`) before new UI.
2. Test at the lowest level that catches the bug ([CODE-QUALITY](CODE-QUALITY.md#tests)).
3. `npm run check` green; UI change → `test:e2e`.
4. `/code-review` in Claude Code; fix confirmed findings.
5. Update docs + [open items](../solution-plan/SOLUTION-PLAN.md#open-items) in the same change.
6. `git commit -s -m "Short imperative subject"` (hook: sign-off, ≤ 72 chars, no AI co-author).
7. PR → `development` (Quality Gates + template checklist). Release: PR `development` → `main`.

## Editing content

- Subpages: `src/frontend/data/subpages.ts`. Program pages: `pages.ts`. Home: `content.ts`.
- New subpage: add to `sitemap.ts`, then its blocks to `subpages.ts`.
- Photos: add to `data/images.json` → `node tools/fetch-images.mjs`. Albums: Drive links ([media](../solution-plan/SOLUTION-PLAN.md#media)).
- Real data only from MMS. All confirmed → `previewNotice = ''`.

## Code style

- Small single-purpose units (SOLID); data apart from UI; no god files.
- Comments ≤ 2 lines, why not what. No commented-out code.
- PascalCase types/components, camelCase values (eslint warns).
