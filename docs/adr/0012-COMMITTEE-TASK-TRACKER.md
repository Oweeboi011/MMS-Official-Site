# ADR 0012 — ExeCom and TCom task tracker

> - **Purpose:** A recorded decision: what was chosen and why. Changing it needs a new decision record.
> - **For:** Owner · Officers and leads · Admins · Developers
> - **In short:** Officers in ExeCom, TCom and BOT keep the committees' tasks on the site, as a table or a timeline. Only they and admins can see it. Task owners are picked from people who hold a group.

- **Status:** Proposed
- **Date:** 2026-11-22
- **Deciders:** Owee (owner answers 2026-11-22: both committees see all tasks; owners picked from group members; statuses To do, Doing, Blocked, Done)

## Context

ExeCom and TCom have no shared place for tasks and deadlines. Groups and their rights already exist ([ADR 0010](0010-CONTENT-SUBMISSIONS.md)). User records are private to admins and the user, so officers cannot list who holds a group.

## Decision

- **Collection `tasks`.** Fields: `title`, `committee` (`execom` or `tcom`), `status` (`todo`, `doing`, `blocked`, `done`), `ownerUid`, `ownerName`, `startDate`, `dueDate` (optional ISO dates), `notes`, timestamps. Statuses and field limits live in one table in code, mirrored in the rules.
- **Access.** Read and write: admins and members of BOT, ExeCom or TCom, for every task. Nobody else.
- **Owner picker.** Collection `groupMembers/{uid}` (`name`, `groups`), readable by the same people, written by admins and BOT. `setGroups` writes it with the user record, so private user records stay private. Renaming a user (`updateUserProfile`) updates it; deleting an account removes it and clears the owner on that person's tasks. Existing group holders are filled in once by `tools/admin/backfill-group-members.mjs`.
- **Page.** `/account/tasks`, tab shown to those with access. One data set, two views: a sortable, filterable table (overdue marked) and a timeline (bars from start to due, grouped by committee; undated tasks listed apart).
- Every create, edit and delete writes to the audit log.

## Consequences

- No new cost: same Firebase project and free tier.
- `groupMembers` can go stale if groups are edited outside `setGroups`; the admin tools only use `setGroups`. Rules do not cross-check it against the user record: writers are admins and BOT, who are trusted with groups already.
- Reminders by email wait on Brevo (open item 8); out of scope here.
- Rules tests cover each group and a plain member; they run in Quality Gates.

## Alternatives

- **Free-text owner:** no extra collection, but names drift and link to no person. Rejected by the owner.
- **Let group members read `users`:** exposes every member's private profile (RA 10173). Rejected.
- **Per-committee visibility:** more rules, no stated need. Rejected by the owner.
- **Third-party tracker (Trello, GitHub Projects):** another account and sign-in, off the site. Not chosen.

## Related

[ADR 0010](0010-CONTENT-SUBMISSIONS.md) groups and rights · Solution plan open items.
