# ADR 0004 — Media: site photos in repo, albums on Drive (link only), videos on YouTube/Facebook

- **Status:** Accepted
- **Date:** 2026-10-29

## Context

MMS has hundreds of climb photos and some videos. Budget ₱500/month; Vercel Hobby has a bandwidth cap. Drive "share publicly" is free and familiar to officers, but Drive isn't built for hotlinking: direct image links have been unreliable since 2024, there's no resizing or caching, and videos only play in Drive's own player.

## Decision

- Few curated photos in `public/images` (budget in `npm run check`).
- Full albums in an **MMS-owned** Drive folder, shown on the site as **links**, never embeds.
- Videos embedded from YouTube / Facebook.

## Consequences

- ₱0. Site speed not tied to Drive.
- Album links can rot; needs an MMS-owned account + yearly link check ([media](../solution-plan/media.md#long-run-risks)).
- Changing album host later = editing hrefs.
