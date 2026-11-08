# Data

What data exists and where. Today all site content is static TypeScript; live data moves to Firestore with Open Climbs ([plan](../solution-plan/SOLUTION-PLAN.md#open-climbs-migration)).

## Content (`src/frontend/data`)

| File | Holds | Edit |
|------|-------|------|
| `sitemap.ts` | sections, subpages, `legacyRedirects` (old Google Sites URLs) | by hand; tests check every subpage renders |
| `subpages.ts` | `ContentBlock[]` per subpage | by hand |
| `pages.ts` | program pages (BMC, Open Climbs, Outreach, SART) | by hand |
| `content.ts` | home: officers, FAQs, climbs, announcements, surveys, videos, `previewNotice`, contact | by hand |
| `glossary.ts` | MMS abbreviations (BMCM, AMC, LNT, SART…): tooltips + `/about/glossary` | by hand; officers confirm wording |
| `credits.ts` | photo attributions | **generated** by `tools/fetch-images.mjs` |
| `topMountains.ts` | Top 100 PH peaks | **generated**; trail classes need Climbs Committee review |

`ContentBlock` types: `text · stats · cards · steps · table · timeline · people · quotes · checklist`. New UI → new block type + render in `ContentBlocks.tsx`, not a one-off component.

Sample content is flagged by `previewNotice`. Real officers, fees, dates come from MMS only, never invented ([content needed](../solution-plan/SOLUTION-PLAN.md#content-needed-from-mms)).

## Tool inputs (`data/`)

`images.json`: Wikimedia photos (`slug`, `width`, `file`, `place`). `node tools/fetch-images.mjs` → `public/images/*.webp` + `credits.ts`.

## Firestore + Storage (Open Climbs)

Database `openclimbs` (`asia-southeast1`) and the default Storage bucket (`us-east1`) exist since 2026-11-08 and are **empty** until the first sync (phase 2). Same shapes as the old app: [mms-open-climbs DATA](https://github.com/Oweeboi011/mms-open-climbs/blob/main/docs/guides/DATA.md).

| File | Holds |
|------|-------|
| `src/backend/firebase/firestore.rules` | who reads/writes each collection (tests: `tests/integration/rules.emulator.mjs`) |
| `src/backend/firebase/firestore.indexes.json` | composite indexes |
| `src/backend/firebase/storage.rules` | private files: receipts, medical certs, documents |
| `src/backend/firebase/storage-lifecycle.json`, `cors.json` | delete uploads after 730 days; allowed origins (www + localhost). **Not applied to the bucket yet** (open item 20) |

### Site content collections (open item 22)

Public read, admin write; replace the matching `content.ts` exports (kept as fallback). Required text must be non-blank; site image paths must be flat `/images/<name>.<webp|jpg|jpeg|png|svg>`.

| Collection | Fields | Replaces |
|---|---|---|
| `announcements` | `title` ≤ 200, `summary` ≤ 2000, `category` (Climbs, Training, Outreach, Club, SART), `publishedAt`, `published` (drafts admin-only), `updatedAt?` | `announcements` |
| `officers` | `body` (execom, tcomm, bot), `role`, `name` ≤ 120, `order` (int), `current` (false = past, e.g. past presidents), `term?` ≤ 40, `updatedAt?` | `officers`, Leadership page (`/about/leadership` blocks in `subpages.ts`) |
| `committees` | `tag`, `title`, `headTitle` (Head, Commander…), `headName` (blank until named), `description` ≤ 1000, `order` | Committees page (`/about/committees`) |
| `surveys` | `title`, `description`, `audience` (Members, Guests, Everyone), `status` (Open, Closed), `formUrl` (`https://…` or `#`), `closes?`, `updatedAt?` | `surveys` |
| `siteSettings/site` (only doc id `site`) | contact, `socials` map (facebook, instagram, youtube, tiktok → `https://` only; `content.ts` and `Footer` use `NavLink[]`: the services layer (item 21, not built) must convert), `previewNotice`, motto, home copy (hero meta, ticker, journey, join steps), heritage stats, `photoAlbumsUrl` | `contactName`, `contactPhone`, `membershipEmail`, `socials`, `previewNotice`, `motto`, `heroMeta`, `tickerItems`, `journey`, `joinSteps`, `stats`, `photoAlbumsUrl` |
| `inquiries` | `name`, `email`, `interest` (membership, climb, other), `message` 1–2000, `consent: true` (privacy notice), `phone?`, `createdAt` (server time); **guest create, admin-only read**; spam guard = App Check (item 21) | Google Form (L2) |
| `reviews` | `climbTitle`, `name`, `rating` 1–5, `quote` ≤ 1000, `published`, `publishedAt`, `climbId?`, `feedbackId?`; drafts admin-only | new (L6), quoted from `feedback` with consent |
| `faqs` | `q` ≤ 300, `a` ≤ 2000, `order` | `faqs` |
| `glossary` | `term` ≤ 20, `name`, `about` ≤ 1000 | `glossary.ts` |
| `media` | `kind` (video, photo, album), `title`, `url` (`https://` or `/images/`), `order`, `place?`, `poster?`, `credit?` | `videos`, `gallery`, album links |
| `siteStats/public` | `accounts` (all sign-ups), `climbers` (distinct people on finished, non-cancelled climbs, no-shows out), `climbs` (non-cancelled), `climbsCompleted`, `updatedAt`; written only by `refreshSiteStats`. "Active members" waits on leads (item 14) | live counts on home |

### Every data export → where it lives (audit 2026-11-09)

| Export | Store |
|---|---|
| `openClimbs` | `climbs` (old-app shape) |
| `announcements`, `officers`, `surveys`, `faqs`, `glossary` | same-name collections |
| `/about/leadership` (Execom, TComm, BOT, past presidents), `/about/committees` blocks | `officers`, `committees` (admins update them; page text stays in code) |
| `videos`, `gallery` | `media` |
| `socials`, `contactName`, `contactPhone`, `membershipEmail`, `previewNotice`, `motto`, `heroMeta`, `tickerItems`, `journey`, `joinSteps`, `stats`, `photoAlbumsUrl` | `siteSettings/site` |
| `passportStats` | derived per member from `registrations` (no collection) |
| live counts | `siteStats/public` |
| `mountains`, `topMountains`, `climbFinder`, `subpageContent`, program pages, `sitemap`, `legacyRedirects` | code (structured, reviewed; open item 24) |
| `photoCredits`, `searchIndex` | generated from code |

Personal data: [SECURITY](SECURITY.md#privacy-ra-10173).
