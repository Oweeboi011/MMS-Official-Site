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
| Merged to `main` but site unchanged; CD green | CD skipped (no `CLOUDFLARE_API_TOKEN`): `npm run deploy:prod` |
| `firebase deploy --only storage`: "Storage has not been set up" | console → Storage → Get started (once) |
| Firestore deploy 403 / API not enabled | enable Cloud Firestore API in Google Cloud console, wait a minute |
| `functions:secrets:set` via Claude `!`: "Secret Payload cannot be empty" | `!` can't prompt; run it in your own terminal |
| Deploy fails: secret has no versions | `functions:secrets:get NAME` shows none → set it, then redeploy |
| `gcloud` TLS `CERTIFICATE_VERIFY_FAILED` | network intercepts TLS; use the Firebase CLI or the console |
| `npm audit` moderate (minimatch via eslint) | known, below the high gate ([open items](../solution-plan/SOLUTION-PLAN.md#open-items)) |
