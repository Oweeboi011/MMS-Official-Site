// Secret scan (gitleaks). `--staged` = pre-commit; default = working tree.
import { spawnSync } from 'node:child_process';

const mode = process.argv.includes('--staged') ? ['git', '--staged'] : ['dir', '.'];
// eslint-disable-next-line sonarjs/no-os-command-from-path -- gitleaks is a user-installed dev binary
const r = spawnSync('gitleaks', [...mode, '--config', '.config/gitleaks.toml', '--redact', '--no-banner'], { stdio: 'inherit' });
if (r.error) {
  console.error('gitleaks not found. Install once: winget install --id Gitleaks.Gitleaks -e (macOS: brew install gitleaks)');
  process.exit(1);
}
process.exit(r.status ?? 1);
