# ADR 0004 — Media: site photos in repo, albums on Drive (link only), videos on YouTube/Facebook

> - **Purpose:** A recorded decision: what was chosen and why. Changing it needs a new decision record.
> - **For:** Officers and leads · Owner (accounts, billing) · Developers
> - **In short:** Site photos are stored with the code; full albums stay on Google Drive (linked) and videos on YouTube or Facebook, keeping costs at zero.

- **Status:** Accepted
- **Date:** 2026-10-29

## Context

MMS has hundreds of climb photos and some videos. Cap ₱54–₱100/month ([ADR 0001](0001-HOSTING.md)). Drive "share publicly" is free and familiar to officers, but Drive isn't built for hotlinking: direct image links have been unreliable since 2024, there's no resizing or caching, and videos only play in Drive's own player.

## Decision

- Few curated photos in `public/images` (budget in `npm run check`).
- Full albums in an **MMS-owned** Drive folder, shown on the site as **links**, never embeds.
- Videos embedded from YouTube / Facebook.

## Consequences

- ₱0. Site speed not tied to Drive.
- Album links can rot; needs an MMS-owned account + yearly link check ([media](../solution-plan/SOLUTION-PLAN.md#media)).
- Changing album host later = editing hrefs.
