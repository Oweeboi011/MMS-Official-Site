# ADR 0011 — Sportfest scoreboard inside the MMS site

> - **Purpose:** A recorded decision: what was chosen and why. Changing it needs a new decision record.
> - **For:** Owner · Officers and leads · Admins · Developers
> - **In short:** The Sportfest scoreboard now lives on the MMS site, for signed-in members only, with the games and scores kept in Firestore per year. The old Vercel app can be retired once the owner says so.

- **Status:** Accepted 2026-11-12 (owner: "rebuild the scoreboard inside the MMS site", "sportfest data will only be visible to logged in users", "sportfest will be every year").

## Problem

The scoreboard ran as a separate Next.js app on Vercel (`mms-sagupaan`). It is a second site, a second place to sign in, and Vercel is ruled out for hosting ([ADR 0001](0001-HOSTING.md)).

## Decision

- Page `/activities/sportfest`, visible only when signed in; signed-out visitors see a sign-in form. Firestore rules enforce it: `sportfestGames` and `sportfestScores` are readable by signed-in users and writable by admins only.
- Every game and score carries a `year`; the board opens on the newest year with a year picker. Admins manage games and results at `/admin/sportfest`.
- Scoring is computed from the placement: Class A pays 5:3:2:1 of the top points, Class B 20/15/10/5, Classes C and D 100/75/50/25 percent. Ties share a place. Classes and top points were taken from the live data, not from the Executive Order PDF (not readable here): **the scoring table needs checking against the Executive Order.**
- One-way import of the 2026 data: `tools/admin/import-sportfest.mjs` (idempotent). Tribe totals matched the old app (Mangyan 450, Badjao 410, Aeta 379, Tasaday 269).

## Consequences

- No new cost: same Firebase project, same free tier.
- The old Vercel app is retired only on the owner's word.
- The old data has duplicate "upcoming" stub games; the public board hides upcoming games, and the admin list marks them "safe to delete".
- A new year starts from the previous year's games: the admin page offers "Copy N games from <year-1>" (name, class and points; back to upcoming, no results).
