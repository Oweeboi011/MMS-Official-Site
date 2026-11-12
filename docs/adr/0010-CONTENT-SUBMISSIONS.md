# ADR 0010 — Content submissions and group rights

> - **Purpose:** A recorded decision: what was chosen and why. Changing it needs a new decision record.
> - **For:** Owner · Officers and leads · Admins · Developers
> - **In short:** Page data (calendar, media, membership, trails) is entered by officers, not coded. Each of the three groups (BOT, ExeCom, TCom) has its own rights, and the site's admins (caretakers) come from those groups. Entries are reviewed before they go public, and each user's groups and rights are visible on their user record.

- **Status:** **Proposed** 2026-11-12; built and live since v1.6.0 (2026-11-12) on the owner's answers below. Stays Proposed until MMS confirms the rights marked "confirm".
- **Issues:** [#322](https://github.com/Oweeboi011/MMS-Official-Site/issues/322) and its children.

## Problem

Several public pages are fixed text in code (the site map marks them Sample copy). Only admins can edit the few collections that exist, and only through the admin editor. Officers who know the content cannot submit it.

## Decision

- **Entries.** One collection, `contentEntries`: page, data, status (draft, pending, published, rejected), who submitted, who reviewed, note, timestamps. Public pages read published entries only, with the old text as fallback until real entries exist.
- **Groups.** `users/{uid}.groups` holds any of `bot`, `execom`, `tcom`. Clients never write it; admins and BOT change it.
- **Rights table** (one table in code, mirrored in the rules; shown on each user in Admin Users):

| Group | Submit and edit | Approve and publish |
|---|---|---|
| BOT | every page | every page; manages group membership |
| ExeCom | every page | every page, including TCom's entries |
| TCom | Calendar, Media, Trails and Destinations | its own entries on those pages (confirm: ExeCom or BOT can still edit or unpublish) |

- Membership facts (fees, requirements) can be submitted and approved by BOT and ExeCom only (confirm).
- Owner picked both "approve everything" and "approve one area" for BOT and ExeCom; the wider right is taken. Narrow it here if that was not meant.
- **Admin** is the caretaker of the site, a role apart from the groups (`role: admin`, as today). Admins are drawn from BOT, ExeCom and TCom, so one person can be an admin and in a group. Admins keep full access to content, users and settings; the group sets what a non-admin officer may do.
- Every submit, approve and reject writes to the audit log.

## Why

Officers hold the facts, admins hold the keys. Review keeps wrong data off the public site. Groups match how MMS is organised, so rights follow the role, not the person.

## Consequences

- Rules read `groups` from the user record; rules tests cover each group.
- Nothing is invented: each page waits for real content from the officers.
- Phased: model and rules, submit form, review queue, then one page at a time (Calendar first).
