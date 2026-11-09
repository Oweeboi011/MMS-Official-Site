# MMS domain

> - **Purpose:** The words we use, and what each one means.
> - **For:** Officers and leads · Admins · Developers
> - **In short:** One meaning per word (guest, account, completed climb…), so officers, docs and code never talk past each other.

Words used for the MMS site and Open Climbs, so code, docs and officers mean the same thing. Visitor tooltips (BMCM, LNT…) live in `src/frontend/data/glossary.ts`, not here.

## People

**Guest**:
Anyone who joins an open climb without MMS membership. Needs an **Account**, pays the guest fee. Code: `memberType: 'joiner'`.
_Avoid_: joiner, non-member

**Account**:
A sign-in on the site (Google or email), held by guests and members alike. Not membership.
_Avoid_: user, member account

## Climbs

**Open climb**:
An MMS climb open to guests and members, listed on `/activities/open-climbs`. Code: a `climbs` document.
_Avoid_: event

**Upcoming climb**:
An open climb not yet over and not cancelled. Postponed ones stay upcoming, tagged "Postponed".

**Completed climb**:
An open climb that is over and not cancelled. Over = marked `status: 'completed'`, or its last day (`endDate`, else `startDate`) has fully passed in Manila. Code: `isClimbOver` in `functions/src/shared/climbStatus.js`.
_Avoid_: past climb, done climb

**Cancelled climb**:
`status` or `cancellationStatus` is `cancelled`. Hidden from public lists; admins still see it.

**Difficulty**:
A climb's score on the Philippine 1–9 scale (stored as `"4/9"`). Shown as Easy (1–2), Moderate (3–4) or Advanced (5–9): the old app's climb-card badges (owner decision 2026-11-09).
_Avoid_: grade, level

**Trail class**:
A separate 1–6 score for technical terrain (1 easy walking … 6 needs climbing gear). Independent of difficulty.
_Avoid_: class (alone), YDS

**Climb year**:
Calendar year (January–December), Manila time, of the climb's start date. Groups the schedule and the past-years archive.
_Avoid_: season, club year
