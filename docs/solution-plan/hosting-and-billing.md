# Hosting & monthly billing

Checked **2026-10-29** at **₱58 = US$1**. Providers bill in USD, so peso amounts move with the rate. Re-check before signing up.

## Services

| Service | Provider | For | Cost |
|---------|----------|-----|------|
| Static hosting + CDN + SSL | GitHub Pages (now) → **Cloudflare Pages** free (next) | Info site | ₱0 |
| Hosting, auth, database, functions, storage | Phase 2+, provider open (see options) | Working site | see below |
| PayMongo | PayMongo (PH) | Online payments | No monthly fee; per payment |
| Album storage | MMS Google Drive folder ([media](media.md)) | Full climb albums, linked | ₱0 (15 GB free) |
| Domain `metropolitanms.org` | **Namecheap** now → Cloudflare Registrar (transfer allowed 60 days after purchase) | Site address | Namecheap renewal ≈ US$15–19/yr ≈ **₱73–92/mo**; Cloudflare ≈ US$11/yr ≈ **₱54/mo**. Exact renewal price + date: TODO (Namecheap dashboard) |
| Officer email | Google Workspace for Nonprofits | climbs@, treasurer@ | ₱0 if MMS qualifies |
| GitHub | GitHub | Code + CI | ₱0 |

## Monthly bill

| Phase | Items | ₱/month |
|-------|-------|---------|
| Now (info site) | GitHub Pages / Cloudflare Pages + domain | **≈ ₱54–92** |
| Phase 2+ on option C | Free plan + domain | **≈ ₱54** |
| **Hard cap** | [ADR 0001](../adr/0001-hosting.md) | **₱54–₱100** |

Anything that can push the bill over ₱100 is out: paid plans, overage billing. Free plans must fail at quota, not bill.

## Options for phase 2+ (needs payments)

| | A. Firebase (Google Cloud) | B. Vercel Pro + Supabase | C. Cloudflare Pages + Workers + D1 (chosen) |
|---|---|---|---|
| Payments allowed? | ✅ | ✅ | ❓ Unverified: check Cloudflare terms |
| Hosting | Free quota (10 GB, 360 MB/day) | US$20 ≈ ₱1,160 | Pages free |
| DB + auth + functions | Free quotas (Firestore 50K reads/day, Auth 50K MAU, Functions 2M/mo) | Supabase Free (pauses after 1 week idle) or Pro US$25 | Workers 100K req/day; D1 5M rows read/day, 100K written/day; auth not included (Supabase Auth free or own). Paid: US$5/mo |
| **Total incl. domain** | **≈ ₱54–₱150** ⚠️ overage can break cap | **≈ ₱1,215–₱2,700** ❌ | **≈ ₱54** ✅ (free plan only; paid ≈ ₱344 ❌) |
| Catch | **Firebase is blocked on company laptops** ([ADR 0001](../adr/0001-hosting.md)) | Over cap | Unverified: commercial use on free plan; not blocked on company laptops |

Free quotas used in A are well above MMS's expected traffic (< 1,000 users, < 15 GB/month transfer).

### Staying inside free quotas

- WebP images (done); cache headers in `public/_headers` (`/assets` 1 yr immutable, `/images` 1 week).
- No SMS login (billed per text). Media rules: [media](media.md).

## Per-payment fees (outside the monthly bill)

PayMongo rates + 12% VAT on the fee. Build into the climb fee as a convenience fee.

| Method | Rate | On a ₱3,000 fee |
|--------|------|-----------------|
| QR Ph (GCash, Maya, any bank) | 1.34% | **₱45.02** |
| Online banking (BPI, UnionBank) | 0.71% or ₱13.39 | ₱23.86 |
| Maya | 1.79% | ₱60.14 |
| GCash | 2.23% | ₱74.93 |
| Local card | 3.125% + ₱13.39 | ₱120.00 |
| Manual transfer + receipt | — | ₱0 (officer verifies) |

## Who pays

- One billing account **owned by MMS**, treasurer as billing admin, ≥2 officers with access.
- PayMongo payouts go to the **MMS bank account**.

## Sources

[Vercel pricing](https://vercel.com/pricing) · [Firebase pricing](https://firebase.google.com/pricing) · [Supabase pricing](https://supabase.com/pricing) · [Cloudflare Workers/D1 pricing](https://developers.cloudflare.com/workers/platform/pricing/) · [PayMongo pricing](https://www.paymongo.com/pricing) · [Workspace for Nonprofits](https://support.google.com/nonprofits/answer/2858465) · [Namecheap .org pricing](https://www.namecheap.com/domains/registration/gtld/org/)
