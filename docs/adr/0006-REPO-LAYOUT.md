# ADR 0006 — Repo layout

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

Root was crowded (configs, scripts, hook tool config in `package.json`). Backend (Firebase Functions) joins the frontend in one repo (ADR 0005).

## Decision

| Folder | Holds |
|--------|-------|
| `src/frontend`, `src/backend` | app code; backend has own `package.json` + `firebase.json` |
| `.config/` | all tool configs that accept a path flag |
| `tools/` | dev utilities · `scripts/` delivery (deploy, parity) · `data/` tool inputs |
| `.githooks/` | git hooks via `core.hooksPath` (no Husky) |
| `.github/` | CI/CD (not `.azuredevops`: repo is on GitHub) |
| `.claude/` | CLAUDE.md + Claude Code settings |

Root keeps only files tools/editors require there: `package.json`/lock, `README.md`, `tsconfig.json`, `vite.config.ts` (vitest + IDE), `eslint.config.js` (IDE + base path), `index.html` (Vite entry), `.editorconfig`, `.gitignore`, `.gitattributes`.

## Consequences

- Every config-reading npm script passes `--config .config/…`.
- `firebase.json` can't move to an `infra/` folder: Firebase CLI rejects a functions source outside the config's directory.
- New tool → its config goes in `.config/` if the tool supports a path flag; else root, noted here.
