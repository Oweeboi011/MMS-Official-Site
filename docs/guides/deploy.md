# Deploy

## Now: GitHub Pages (temporary)

- Push/merge to `main` → `.github/workflows/pages.yml` builds (`npm test`, `BASE_PATH=/<repo>/`) and deploys. Only `main` may deploy (environment rule).
- URL: `https://oweeboi011.github.io/MMS-Official-Site/`. Deep links via `404.html` copy.
- `public/_headers` is ignored on GitHub Pages.
- Run `npm run check` before merging; the workflow doesn't.

## Next: Cloudflare Pages (free, Wrangler CLI)

Before first deploy: open `dash.cloudflare.com` on a company laptop; blocked → stop, see [ADR 0001](../adr/0001-hosting.md). Account owner: **MMS shared Gmail** (officers know the address; owns Namecheap now, Cloudflare Registrar after transfer). 2-step verification on Gmail + Cloudflare; recovery known to ≥2 officers.

- **2 owners:** MMS account + Owee Penaranda as **Super Administrator** (Manage Account → Members, own login). Other officers: Administrator. Never share the password.
- Wrangler logged in as a member sees several accounts → set `CLOUDFLARE_ACCOUNT_ID` to the MMS account ID before deploying.

```sh
npx wrangler login        # once; wrangler is a pinned devDependency
npm run deploy:preview    # check → build → preview URL
npm run deploy:prod       # check → build → production
```

- Create the project once per account: `npx wrangler pages project create mms-official-site --production-branch main --force`. `--force` keeps it on classic Pages; without it wrangler delegates to Workers, rewrites `vite.config.ts`/`package.json`, adds `wrangler.jsonc`, and (4.151–4.157) crashes. Never pass `--force` again after. URL: `https://mms-official-site-1qd.pages.dev` (MMS account; `-1qd` suffix because the plain name was taken).
- New `*.pages.dev` hostnames take a few minutes to get TLS; handshake errors right after first deploy are normal.
- `scripts/deploy.mjs` clears `BASE_PATH` (base `/`). No top-level `404.html` → Pages serves `index.html` for deep links (SPA). `public/{assets,images}/404.html` make missing files there a real 404, not cached HTML.
- Headers/cache: `public/_headers` (security headers, `/assets` 1 yr immutable, `/images` 1 week).
- No Git integration: CLI deploys only. CI (`.github/workflows/ci.yml`) is **manual-only** until enabled.

### Custom domain `metropolitanms.org`

Owner decision: **MMS owns the domain**. Registered 2023-01-05 at Namecheap; expires **2027-01-05**, auto-renew **off**. 2026-11-05: Namecheap "Change Ownership" push from the personal account to the MMS Namecheap account; MMS must accept it, then turn auto-renew on. Registrant contacts → MMS: do it **after** the Cloudflare transfer below if that's planned (a registrant change locks transfers 60 days), otherwise any time.

DNS (done 2026-11-05): zone in the MMS Cloudflare account (Free), nameservers `magnolia` / `syeef`.ns.cloudflare.com set at Namecheap. Root + `www` = proxied CNAME → `mms-official-site-1qd.pages.dev`; both attached as Pages custom domains. No MX: no email on the domain. Old zone in the personal account (NS `bart` / `itzel`): delete once the MMS zone is Active.

Later (optional, cheaper renewal ≈ US$11.20/yr): registrar transfer Namecheap → Cloudflare (MMS). A registrant change may lock transfers 60 days. In this order:

1. MMS zone shows **Active** (required for transfer).
2. Namecheap → Domain → Sharing & Transfer → Domain Lock **off** → get the EPP/auth code (emailed to the registrant). **Don't edit registrant contacts at Namecheap first**: a registrant change starts a 60-day transfer lock.
3. Cloudflare (MMS) → Domain Registration → Transfer Domains → `metropolitanms.org` → auth code → pay transfer (≈ US$11, adds 1 year) → registrant contact = MMS.
4. Approve Namecheap's transfer email (or it completes in ~5 days).
5. Cloudflare: auto-renew **on**. Close the Namecheap listing.

## Budget

**Hard cap ₱54–₱100/month** ([ADR 0001](../adr/0001-hosting.md)). Cloudflare free has no billing, so no overage; limits fail requests instead. Any billed account, day one: budget **US$1.70/month** (≈ ₱100), alerts at 50/80/100%.

- **Google Cloud / Firebase:** Billing → Budgets & alerts.

Alerts don't stop spending. Treasurer checks the bill monthly.

## Legacy (to delete once Cloudflare prod is live)

| File | Target |
|------|--------|
| `.github/workflows/pages.yml` | GitHub Pages. **Still auto-deploys on push to main** |
| `BASE_PATH` in `vite.config.ts`, comment in `src/lib/asset.ts` | Pages sub-path; base becomes `/` |
