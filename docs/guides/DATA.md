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

Personal data: [SECURITY](SECURITY.md#privacy-ra-10173).
