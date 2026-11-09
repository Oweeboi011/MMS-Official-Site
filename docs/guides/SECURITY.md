# Security

## Secrets

- Never in code, docs, chat, or commits. Server keys → Firebase Secret Manager; Quality Gates → GitHub repo secrets.
- gitleaks blocks them: pre-commit (staged), `npm run check` (tree), Quality Gates. Config `.config/gitleaks.toml`.
- Old Firebase project's password hash parameters: private, used once for `importUsers`, never stored in repo.
- Leaked → rotate first, then purge history.

## Code

- Banned (eslint): `eval`, `new Function`, `innerHTML`, `dangerouslySetInnerHTML`. React escapes text by default.
- `npm audit` high+ blocks Quality Gates (site + backend). Moderate: [open items](../solution-plan/SOLUTION-PLAN.md#open-items).
- Headers (`public/_headers`): `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (no camera/mic/location), `Content-Security-Policy-Report-Only` (violations show in the browser console; enforce after a clean run, open item 30). Uptime: `uptime.yml` every 6 h. Dependencies: Dependabot monthly.
- Access control in Firestore/Storage rules + functions, never only UI ([roles](ARCHITECTURE.md#roles-planned)). Rules live since 2026-11-08; emulator tests (`npm run test:rules`) required in Quality Gates.
- Function secrets in Secret Manager; set from your own terminal at the prompt, never as a command argument (lands in shell history) or in chat. `GITHUB_TOKEN`: fine-grained, read-only, one repo, expiring.

## Accounts

- Every account MMS-owned: **MMS Gmail = primary owner**, Owee = second owner/admin. 2-step verification; recovery known to ≥ 2 officers; hand over at turnover.
- Least privilege: officers = Administrator, not owner. Never share passwords.

## Privacy (RA 10173)

- Consent + privacy notice at registration (what, why, who sees, how long).
- Collect minimum. Auto-delete medical certs + receipts **90 days after the climb**; keep payment records.
- Private bucket; short-lived signed URLs.
- DPO assigned; NPC registration checked; breach → notify NPC + people within 72 h.
- Albums: "anyone with link" = public → photo consent + takedown window (needs officer approval).
