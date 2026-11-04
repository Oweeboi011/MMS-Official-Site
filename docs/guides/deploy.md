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

- Create the project once per account: `npx wrangler pages project create mms-official-site --production-branch main --force`. `--force` keeps it on classic Pages; without it wrangler delegates to Workers, rewrites `vite.config.ts`/`package.json`, adds `wrangler.jsonc`, and (4.151–4.157) crashes. Never pass `--force` again after. URL: `https://mms-official-site.pages.dev`.
- New `*.pages.dev` hostnames take a few minutes to get TLS; handshake errors right after first deploy are normal.
- `scripts/deploy.mjs` clears `BASE_PATH` (base `/`). No top-level `404.html` → Pages serves `index.html` for deep links (SPA). `public/{assets,images}/404.html` make missing files there a real 404, not cached HTML.
- Headers/cache: `public/_headers` (security headers, `/assets` 1 yr immutable, `/images` 1 week).
- No Git integration: CLI deploys only. CI (`.github/workflows/ci.yml`) is **manual-only** until enabled.

### Custom domain `metropolitanms.org` (registrar: Namecheap)

Domain still serves the old Google Sites site; may carry email (MX) records. Don't lose them.

1. Cloudflare → Add site → `metropolitanms.org` → Free. **Check the scanned DNS records include the Google Sites + MX records** before continuing.
2. Namecheap → Domain List → Manage → Nameservers → Custom DNS → the 2 Cloudflare nameservers. Old site keeps working.
3. Cutover: Pages project → Custom domains → add `metropolitanms.org` + `www`. New site replaces Google Sites. SSL automatic.
4. 60 days after purchase: transfer registration to Cloudflare Registrar (≈ ₱54/mo vs Namecheap ≈ ₱73–92).

- Namecheap until transfer: auto-renew on, WHOIS privacy on, account owned by MMS ([architecture](../solution-plan/architecture.md)).

## Budget

**Hard cap ₱54–₱100/month** ([ADR 0001](../adr/0001-hosting.md)). Cloudflare free has no billing, so no overage; limits fail requests instead. Any billed account, day one: budget **US$1.70/month** (≈ ₱100), alerts at 50/80/100%.

- **Google Cloud / Firebase:** Billing → Budgets & alerts.

Alerts don't stop spending. Treasurer checks the bill monthly.

## Legacy (to delete once Cloudflare prod is live)

| File | Target |
|------|--------|
| `.github/workflows/pages.yml` | GitHub Pages. **Still auto-deploys on push to main** |
| `BASE_PATH` in `vite.config.ts`, comment in `src/lib/asset.ts` | Pages sub-path; base becomes `/` |
