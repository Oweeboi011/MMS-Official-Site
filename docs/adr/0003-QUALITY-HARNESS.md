# ADR 0003 — Quality harness: few tools, one command

- **Status:** Accepted
- **Date:** 2026-10-29, updated 2026-11-05 (gitleaks, `.githooks/`, commit-msg, parity, Quality Gates on)

## Context

High priority: secrets, bad patterns, dead code/logic/models, unused reusable components, circular deps, forbidden imports, complexity, duplication, vulnerable packages, parity, build guards, SOLID / clean architecture. Low: style, types, format, naming, long comments. Must stay fast: no 50-step pipeline.

## Decision

| Need | Tool | Why |
|------|------|-----|
| Bad patterns, banned APIs, complexity, naming | **eslint** + typescript-eslint + sonarjs + react-hooks | one tool, many rules; sonarjs = dead logic + cognitive complexity |
| Cycles, layers, forbidden imports, orphans | **dependency-cruiser** | clean-architecture layers as rules |
| Dead files/exports/types/deps | **knip** | finds what eslint can't |
| Duplication | **jscpd** | token-based, < 1 s |
| Secrets | **gitleaks** | industry standard, fast Go binary, scans staged + tree; replaces secretlint |
| Vulnerable deps | **npm audit** (high+) | built in |
| Hooks | **`.githooks/`** via `core.hooksPath` + lint-staged | no hook dependency |
| Commit rules / AI agent guard | `commit-msg` hook | sign-off, short subject, no AI co-author |
| Tests | **vitest** (unit/component/integration/parity), **Playwright** (e2e), node (budgets, prod parity) | vitest shares Vite config |
| SOLID, reuse, comments | **`/code-review`** | judgment, not regex |

Pre-commit: gitleaks + eslint on staged (~2 s). Rest: `npm run check` (~15 s) and Quality Gates (every PR + `main`).

## Consequences

- 9 npm dev tools + 1 binary (gitleaks, installed once; Quality Gates downloads pinned + checksum).
- No Prettier, coverage gate, or spellcheck ([harness](../guides/CODE-QUALITY.md)).
- If `check` grows past ~30 s: move slow steps to Quality Gates only before adding hardware or caching.
