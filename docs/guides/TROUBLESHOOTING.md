# Troubleshooting

Problems already hit on this project.

| Symptom | Fix |
|---------|-----|
| `gitleaks not found` on commit / check | `winget install --id Gitleaks.Gitleaks -e`, reopen terminal |
| Hooks don't run | `npm install` (sets `core.hooksPath .githooks`); verify `git config core.hooksPath` |
| `commit-msg: missing sign-off` | `git commit -s` |
| `wrangler pages project create` rewrites `vite.config.ts`/`package.json`, adds `wrangler.jsonc`, crashes | revert those files; create with `--force`, once ([DEPLOYMENT](DEPLOYMENT.md)) |
| New `*.pages.dev` URL: TLS handshake errors | wait a few minutes after first deploy |
| `wrangler login`: port 8976 busy | kill the stuck process (`taskkill //PID <pid> //F` in Git Bash) |
| Wrangler deploys to the wrong account | set `CLOUDFLARE_ACCOUNT_ID` to the MMS account |
| `.wrangler/` files locked (Windows) | stop wrangler/dev processes; folder is gitignored |
| Firebase: `… is outside of project directory` | `firebase.json` must sit above the functions source; keep it in `src/backend` |
| First functions deploy: IAM binding error | retry once |
| `parity FAIL` right after deploy | edge cache lag; re-run `npm run test:parity`; still failing → redeploy |
| LF/CRLF warnings | `.editorconfig` = LF; hooks forced LF by `.gitattributes` |
| `npm audit` moderate (minimatch via eslint) | known, below the high gate ([open items](../solution-plan/SOLUTION-PLAN.md#open-items)) |
