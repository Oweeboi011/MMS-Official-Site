# CONTEXT.md Format

Lives at `docs/guides/CONTEXT.md`.

```md
# MMS domain

> - **Purpose:** The words we use, and what each one means.
> - **For:** Officers and leads · Admins · Developers
> - **In short:** {one plain-language sentence}

{One or two sentences: what this context is and why it exists.}

## Language

**Guest**:
{One or two sentences: what it IS.}
_Avoid_: joiner, non-member

**Account**:
A sign-in on the site (Google or email), held by guests and members alike.
_Avoid_: user, member account
```

## Rules

- **Be opinionated.** When several words exist for one concept, pick the best and list the rest under `_Avoid_`.
- **Keep definitions tight.** One or two sentences. Define what it IS, not what it does.
- **Only project-specific terms.** General programming concepts don't belong. Ask: is this unique to MMS / Open Climbs?
- **Group under subheadings** when clusters emerge (e.g. People, Climbs, Payments); a flat list is fine otherwise.
- When code names differ from the canonical term (e.g. `memberType: 'joiner'` for a guest), note the code name in the definition so readers can map them.
