# User guide

For MMS officers and members: what the site does and how to get changes made. Developers: [DEVELOPER-GUIDE](DEVELOPER-GUIDE.md).

## What's on the site

| Section | Has |
|---------|-----|
| Home | short summary: hero, each section's top 3 pages + "See all", upcoming climbs, news, how to join |
| Section pages (`/about`, `/explore`, …) | every page in that section |
| About · Explore · Activities · Training · Community · Media | subpages (history, mountains Top 100, BMC, Outreach, SART, albums, videos, surveys, glossary…) |
| Banner | "Preview site": content is sample until officers confirm it |

### Screenshots

Live site, 2026-11-09. Refresh: `node tools/screenshots.mjs` ([DEVELOPER-GUIDE](DEVELOPER-GUIDE.md#editing-content)).

| Page | Desktop |
|---|---|
| Home (`/`) | ![Home](../images/screenshots/home-desktop.jpg) |
| Section, e.g. About (`/about`) | ![About section](../images/screenshots/about-desktop.jpg) |
| Open Climbs + climb finder (`/activities/open-climbs`) | ![Open Climbs](../images/screenshots/open-climbs-desktop.jpg) |
| Mountains, Top 100 (`/explore/mountains`) | ![Mountains](../images/screenshots/mountains-desktop.jpg) |
| Glossary (`/about/glossary`) | ![Glossary](../images/screenshots/glossary-desktop.jpg) |
| News (`/media/news`) | ![News](../images/screenshots/news-desktop.jpg) |
| Surveys (`/surveys`) | ![Surveys](../images/screenshots/surveys-desktop.jpg) |
| Search (`/search?q=pulag`) | ![Search results](../images/screenshots/search-desktop.jpg) |

| Phone: home | Phone: About |
|---|---|
| ![Home on phone](../images/screenshots/home-mobile.jpg) | ![About on phone](../images/screenshots/about-mobile.jpg) |

Old Google Sites links redirect to the matching new page. **Search** (top right) finds any page, climb, news item, or MMS term.

## Getting content changed

1. Send the change to the site maintainer (Owee) with the **source** (officer list, fee memo, approved announcement).
2. Maintainer edits, checks, deploys. Live in minutes.
3. Never send passwords or IDs by chat/email.

Waiting on officers: [content needed](../solution-plan/SOLUTION-PLAN.md#content-needed-from-mms). When everything is confirmed, the preview banner comes off.

## Photo albums

Upload to the MMS Google Drive `Albums/YYYY-MM climb` folder, remove photos of anyone who opted out, share as "anyone with link, Viewer", send the folder link. Details: [SOLUTION-PLAN media](../solution-plan/SOLUTION-PLAN.md#media).

## Open Climbs (coming)

Registration, payments, and My Climbs move here from `mms-open-climbs.web.app` (same login). Until the switch, register on the old site. Plan: [Open Climbs migration](../solution-plan/SOLUTION-PLAN.md#open-climbs-migration).

## Accounts officers hold

MMS Gmail (primary owner of Cloudflare, Firebase, Namecheap, Drive). 2-step verification on; recovery known to ≥ 2 officers; hand over at turnover ([SECURITY](SECURITY.md#accounts)).
