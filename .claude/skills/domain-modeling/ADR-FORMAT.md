# ADR Format

ADRs live in `docs/adr/`, numbered sequentially with an ALL CAPS slug: `0008-MEMBER-ROSTER.md`. Scan the folder for the highest number and add one.

## Template (match the existing ADRs)

```md
# ADR NNNN — {Short title of the decision}

- **Status:** Accepted (owner, YYYY-MM-DD).
- **Date:** YYYY-MM-DD

{1–3 sentences: context, what we decided, why.}
```

An ADR can be a single paragraph: the value is recording *that* a decision was made and *why*. Add `## Context`, `## Options`, `## Consequences` only when they add real value. A superseded ADR keeps its file; its Status says `Superseded by [ADR NNNN](NNNN-SLUG.md)`, and the new one says what it supersedes.

## When to offer one

All three must be true: hard to reverse, surprising without context, the result of a real trade-off.

Qualifies: architectural shape; integration patterns; technology choices with lock-in (hosting, database, auth, payments); boundary and scope decisions (the explicit no-s too); deliberate deviations from the obvious path; constraints not visible in code (cost cap, privacy law); rejected alternatives when the rejection is non-obvious (e.g. no payment gateway, ADR 0007).

Changed decision → new ADR (CLAUDE.md done gate), and SOLUTION-PLAN updated in the same change.
