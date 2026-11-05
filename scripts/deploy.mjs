// Cloudflare Pages deploy with build guards: check → build → perf budget → deploy → prod parity.
// Usage: node scripts/deploy.mjs preview|main
import { execSync } from 'node:child_process';

const branch = process.argv[2];
if (branch !== 'preview' && branch !== 'main') {
  console.error('usage: node scripts/deploy.mjs preview|main');
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

run('npm run check');
run('npm run build');
run('npm run test:perf');
run(`npx wrangler pages deploy dist --project-name mms-official-site --branch ${branch}`);
if (branch === 'main') run('npm run test:parity');
