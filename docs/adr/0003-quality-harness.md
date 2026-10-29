# ADR 0003 — Quality harness: few tools, one command

- **Status:** Accepted
- **Date:** 2026-10-29

## Context

High priority: secrets, bad patterns, dead code/logic/models, unused reusable components, circular deps, forbidden imports, complexity, duplication, vulnerable packages, SOLID / clean architecture. Low priority: lint style, types, format, naming. It must stay fast and not turn every change into 50 steps.

## Decision

| Need | Tool | Why this one |
|------|------|--------------|
| Bad patterns, banned APIs, complexity, naming | **eslint** + typescript-eslint + sonarjs + react-hooks | One tool for many rules. sonarjs adds dead-logic and complexity rules |
| Circular deps, layers, forbidden imports, orphans | **dependency-cruiser** | Encodes clean-architecture layers as rules |
| Dead files/exports/deps | **knip** | Finds unused exports and dependencies that eslint can't |
| Duplication | **jscpd** | Fast token-based, < 1 s here |
| Secrets | **secretlint** | npm-only. No Docker or Go binary needed |
| Vulnerable deps | **npm audit** | Built in |
| Hooks | **simple-git-hooks + lint-staged** | Zero-runtime hook, staged files only |
| Tests | **vitest** (unit/component/integration), **Playwright** (e2e), node script (bundle budget) | vitest shares the Vite config; Playwright on Chromium only |
| SOLID, reuse | **`/code-review`** in Claude Code | Judgment calls, not regexes |

Pre-commit runs only secretlint + eslint on staged files (~2 s). Everything else runs in `npm run check` (~15 s) and CI.

## Consequences

- 10 dev tools, all npm. `npm ci` installs everything; no global setup apart from Playwright's browser.
- No Prettier and no coverage gate, for now ([quality harness](../solution-plan/quality-harness.md#not-included-on-purpose)).
- CI is written but manual-only until we enable it.
