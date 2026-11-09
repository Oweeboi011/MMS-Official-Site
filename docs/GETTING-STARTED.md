# Getting started

> - **Purpose:** Set up a computer to work on the site.
> - **For:** Developers
> - **In short:** Install the tools, get the code and run the site locally.

MMS official site: https://www.metropolitanms.org/. Big picture + diagrams: [README](../README.md). New here: [OVERVIEW](guides/OVERVIEW.md) → [DEVELOPER-GUIDE](guides/DEVELOPER-GUIDE.md). Officers: [USER-GUIDE](guides/USER-GUIDE.md).

```sh
winget install --id Gitleaks.Gitleaks -e   # once (macOS: brew install gitleaks)
npm install                                # deps + git hooks
npm run dev                                # http://localhost:5173
npm run check                              # all gates, ~15 s
```

| Folder | Answers | Docs |
|--------|---------|------|
| [guides/](guides/) | **What is it?** | [OVERVIEW](guides/OVERVIEW.md) · [USER-GUIDE](guides/USER-GUIDE.md) · [ARCHITECTURE](guides/ARCHITECTURE.md) · [DATA](guides/DATA.md) · [API](guides/API.md) · [DEVELOPER-GUIDE](guides/DEVELOPER-GUIDE.md) · [CODE-QUALITY](guides/CODE-QUALITY.md) · [SECURITY](guides/SECURITY.md) · [DEPLOYMENT](guides/DEPLOYMENT.md) · [BILLING](guides/BILLING.md) · [TROUBLESHOOTING](guides/TROUBLESHOOTING.md) |
| [solution-plan/](solution-plan/) | **How do we deliver it, what should it do?** | [SOLUTION-PLAN](solution-plan/SOLUTION-PLAN.md): goal, **open items**, features, migration, payments, media, content needed |
| [adr/](adr/) | **Why this design?** | [0001 hosting](adr/0001-HOSTING.md) · [0002 payments](adr/0002-PAYMENTS.md) · [0003 quality harness](adr/0003-QUALITY-HARNESS.md) · [0004 media](adr/0004-MEDIA.md) · [0005 Open Climbs on Firebase](adr/0005-OPEN-CLIMBS-FIREBASE.md) · [0006 repo layout](adr/0006-REPO-LAYOUT.md) · [0007 payments, no gateway](adr/0007-PAYMENTS-MANUAL.md) |
| [reference/](reference/) | Original prototype (read-only) | |

## Doc rules

- Names ALL CAPS. Markdown + Mermaid only.
- Close to code: a code comment beats a doc. One topic, one place; link, don't repeat.
- Deprecate aggressively: delete stale docs. No boilerplate, no empty sections.
- Decision changed → update/supersede the ADR in the same change.
