# Hosting & monthly billing

Checked **2026-10-29** at **₱58 = US$1**. Providers bill in USD, so peso amounts move with the rate. Re-check before signing up.

## Services

| Service | Provider | For | Cost |
|---------|----------|-----|------|
| Static hosting + CDN + SSL | **Vercel Hobby** (now) | Info site, non-commercial | ₱0 |
| Hosting, auth, database, functions, storage | Phase 2+, provider open (see options) | Working site | see below |
| PayMongo | PayMongo (PH) | Online payments | No monthly fee; per payment |
| Domain `metropolitanms.org` | Current registrar | Site address | ~US$10–11/yr ≈ **₱55/mo** |
| Officer email | Google Workspace for Nonprofits | climbs@, treasurer@ | ₱0 if MMS qualifies |
| GitHub | GitHub | Code + CI | ₱0 |

## Monthly bill

| Phase | Items | ₱/month |
|-------|-------|---------|
| Now (info site) | Vercel Hobby + domain | **≈ ₱55** |
| Phase 2+ on option A | Free quotas + domain + small overage buffer | **≈ ₱55–₱125** |
| Cap | Budget alert | **₱500** |

## Options for phase 2+ (needs payments)

| | A. Firebase (Google Cloud) | B. Vercel Pro + Supabase | C. Free static only (Vercel Hobby, now) |
|---|---|---|---|
| Payments allowed? | ✅ | ✅ | ❌ Free/Hobby plans are for personal/non-commercial use |
| Hosting | Free quota (10 GB, 360 MB/day) | US$20 ≈ ₱1,160 | ₱0 |
| DB + auth + functions | Free quotas (Firestore 50K reads/day, Auth 50K MAU, Functions 2M/mo) | Supabase Free (pauses after 1 week idle) or Pro US$25 | — |
| **Total incl. domain** | **≈ ₱55–₱125** ✅ | **≈ ₱1,215–₱2,665** ❌ | ≈ ₱55, no payments |
| Catch | **Firebase is blocked on company laptops** ([ADR 0001](../adr/0001-hosting.md)) | Over budget | Doesn't solve payment chasing |

Free quotas used in A are well above MMS's expected traffic (< 1,000 users, < 15 GB/month transfer).

### Staying inside free quotas

- WebP images (done); cache headers in `vercel.json` (`/assets` 1 yr immutable, `/images` 1 week).
- No SMS login (billed per text). No self-hosted video (embed YouTube/Facebook).

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

[Vercel pricing](https://vercel.com/pricing) · [Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines) · [Firebase pricing](https://firebase.google.com/pricing) · [Supabase pricing](https://supabase.com/pricing) · [PayMongo pricing](https://www.paymongo.com/pricing) · [Workspace for Nonprofits](https://support.google.com/nonprofits/answer/2858465) · [.org renewal (aggregator)](https://domainoffer.net/tld/org/cloudflare)
