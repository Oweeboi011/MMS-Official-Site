# Architecture

What runs where. Why: [ADR 0001](../adr/0001-HOSTING.md), [ADR 0005](../adr/0005-OPEN-CLIMBS-FIREBASE.md). Folder layout: [ADR 0006](../adr/0006-REPO-LAYOUT.md).

## System

Solid = live. Dashed = not wired yet ([Open Climbs migration](../solution-plan/SOLUTION-PLAN.md#open-climbs-migration)). Backend services are live but idle: the site doesn't call Firebase until phase 3.

```mermaid
flowchart LR
  B[Browser<br/>src/frontend] -->|static files| CF[Cloudflare Pages<br/>www.metropolitanms.org]
  B -.->|sign-in| A[Firebase Auth<br/>email + Google]
  B -.->|reads, own writes| D[(Firestore openclimbs)]
  B -.->|receipts, med certs| S[(Storage, private)]
  D -->|triggers| F[Open Climbs functions<br/>src/backend]
  F --> D
  F -.->|emails, EMAILS_ENABLED| E[Brevo]
  F -->|commits for release notes| GH[GitHub API]
  OLD[(mms-open-climbs)] -.->|sync, phase 2| D
  BU[Budget US$1.70] -->|Pub/Sub billing-budget| H[billingHardStop]
  P[PayMongo] -.->|webhook| F
```

| Part | Tech | Where |
|------|------|-------|
| Frontend | React 19, Vite 7, React Router 7, TypeScript strict | `src/frontend` → Cloudflare Pages (free) |
| Functions | Cloud Functions v2, Node 22, ESM, `asia-southeast1` | `src/backend/functions` → Firebase `mms-official-site-513809` (Blaze + hard stop) |
| Database | Firestore named DB `openclimbs`, `asia-southeast1` | rules + indexes `src/backend/firebase` |
| Files | Cloud Storage default bucket `mms-official-site-513809.firebasestorage.app`, `us-east1` (no-cost location) | rules `src/backend/firebase/storage.rules` |
| Accounts | Firebase Auth: email/password + Google; authorized domain `www.metropolitanms.org` | console |
| DNS, CDN, TLS | Cloudflare (MMS account) | root → `www` 301 |

## Frontend layers

Enforced by dependency-cruiser; inner never imports outer.

```mermaid
flowchart RL
  App --> pages --> components --> services --> data --> lib
  pages --> data
  components --> lib
```

| Layer | Holds | Rule |
|-------|-------|------|
| `lib` | pure helpers (`asset`) | no React, no data |
| `data` | content + types ([DATA](DATA.md)) | no React |
| `services` | Firebase calls (phase 3+) | only Firebase importer |
| `components` | reusable UI; `ContentBlocks` renders all block types | no pages |
| `pages` | screens | — |
| `App.tsx` | routes, legacy redirects | — |

SPA routing: Pages serves `index.html` for unknown paths; `public/{assets,images}/404.html` keep missing files a real 404.

## Roles (planned)

| Role | Can |
|------|-----|
| Guest | read public data, create own registration |
| Member | + own profile, registrations |
| Climb officer | + participants/payments **of their climbs** |
| Admin | everything, assign roles |

Enforced in Firestore/Storage rules, never only UI. More: [SECURITY](SECURITY.md).
