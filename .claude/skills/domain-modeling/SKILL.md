---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design: challenge terms, invent edge-case scenarios, and write the glossary and decisions down the moment they crystallise. (Merely *reading* the glossary for vocabulary is not this skill; this skill is for changing the model.)

## Files in this repo

- Glossary: `docs/guides/CONTEXT.md` (single context: the MMS site + Open Climbs). Create it lazily when the first term is resolved. Format: [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).
- Decisions: `docs/adr/NNNN-SLUG.md` (ALL CAPS slug, next free number). Format: [ADR-FORMAT.md](./ADR-FORMAT.md).
- Not the glossary: `src/frontend/data/glossary.ts` is site copy (BMCM, LNT… tooltips for visitors), not the domain model.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with `docs/guides/CONTEXT.md`, call it out immediately. "Your glossary defines 'member' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'member' — do you mean an MMS member or anyone with a site account? Those are different things."

### Discuss concrete scenarios

Stress-test relationships with specific scenarios that probe edge cases and force precise boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code (rules, functions, `src/frontend/data`) agrees. Surface contradictions: "The rules store role `member` for every account, but you just said only inducted members have it — which is right?"

### Update the glossary inline

When a term is resolved, update `docs/guides/CONTEXT.md` right there; don't batch. It is a glossary and nothing else: no implementation details, no spec, no scratch notes.

### Offer ADRs sparingly

Only offer an ADR when all three are true:

1. **Hard to reverse** — changing your mind later costs something real
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any is missing, skip the ADR.
