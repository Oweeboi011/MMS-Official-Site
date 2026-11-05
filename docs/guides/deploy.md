# Deploy

**Production: https://www.metropolitanms.org/** on Cloudflare Pages (free), project `mms-official-site` in the MMS Cloudflare account. Live since 2026-11-05. Why: [ADR 0001](../adr/0001-hosting.md).

## Deploy (Wrangler CLI)

```sh
npx wrangler login        # once; wrangler is a pinned devDependency
npm run deploy:preview    # check → build → https://preview.mms-official-site-1qd.pages.dev
npm run deploy:prod       # check → build → production
```

- No Git integration and no CI deploy: production changes only when someone runs `deploy:prod`. Merge to `main` first, deploy from `main`.
- Pages URL: `https://mms-official-site-1qd.pages.dev` (`-1qd` suffix: the plain name was taken).
- No top-level `404.html` → Pages serves `index.html` for deep links (SPA). `public/{assets,images}/404.html` make missing files there a real 404, not cached HTML.
- Headers/cache: `public/_headers` (security headers, `/assets` 1 yr immutable, `/images` 1 week).
- CI (`.github/workflows/ci.yml`) is **manual-only** until enabled.
- New account only: create the project once with `npx wrangler pages project create mms-official-site --production-branch main --force`. `--force` keeps it on classic Pages; without it wrangler delegates to Workers, rewrites `vite.config.ts`/`package.json`, adds `wrangler.jsonc`, and (4.151–4.157) crashes. Never pass `--force` again after. New `*.pages.dev` hostnames take a few minutes to get TLS.

## Accounts

- Cloudflare owner: **MMS shared Gmail** (officers know the address). 2-step verification on Gmail + Cloudflare; recovery known to ≥2 officers.
- **2 owners:** MMS account + Owee Penaranda as **Super Administrator** (Manage Account → Members, own login). Other officers: Administrator. Never share the password.
- Wrangler logged in as a member sees several accounts → set `CLOUDFLARE_ACCOUNT_ID` to the MMS account ID before deploying.
- Open check ([ADR 0001](../adr/0001-hosting.md)): `dash.cloudflare.com` not blocked on company laptops.

## Domain `metropolitanms.org`

- **MMS owns the domain.** Registered 2023-01-05 at Namecheap; expires **2027-01-05**, auto-renew **off**. 2026-11-05: Namecheap "Change Ownership" push from the personal account to the MMS Namecheap account; MMS must accept it, then turn auto-renew on (renewal US$18.98/yr). Registrant contacts → MMS: **after** the Cloudflare transfer below if that's planned (a registrant change locks transfers 60 days), otherwise any time.
- DNS: zone in the MMS Cloudflare account (Free), nameservers `magnolia` / `syeef`.ns.cloudflare.com. Root + `www` = proxied CNAME → `mms-official-site-1qd.pages.dev`; both attached as Pages custom domains. No MX: no email on the domain.
- Canonical host: `www`.

Later (optional, renewal US$11.20/yr): registrar transfer Namecheap → Cloudflare (MMS), in this order:

1. Namecheap → Domain → Sharing & Transfer → Domain Lock **off** → get the EPP/auth code (emailed to the registrant). **Don't edit registrant contacts first.**
2. Cloudflare (MMS) → Domains → Transfers → `metropolitanms.org` → auth code → pay (adds 1 year) → registrant contact = MMS.
3. Approve Namecheap's transfer email (or it completes in ~5 days).
4. Cloudflare: auto-renew **on**. Close the Namecheap listing.

## Budget

**Hard cap ₱54–₱100/month** ([ADR 0001](../adr/0001-hosting.md), [hosting and billing](../solution-plan/hosting-and-billing.md)). Cloudflare free has no billing, so no overage; limits fail requests instead. Any billed account, day one: budget **US$1.70/month** (≈ ₱100), alerts at 50/80/100%.

Alerts don't stop spending. Treasurer checks the bill monthly.
