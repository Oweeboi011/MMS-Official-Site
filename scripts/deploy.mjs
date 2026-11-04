// Cloudflare Pages deploy: check → build at base "/" → wrangler. Usage: node scripts/deploy.mjs preview|main
import { execSync } from 'node:child_process';

const branch = process.argv[2];
if (branch !== 'preview' && branch !== 'main') {
  console.error('usage: node scripts/deploy.mjs preview|main');
  process.exit(1);
}

// BASE_PATH is for GitHub Pages only; Cloudflare serves from the root.
const env = { ...process.env };
delete env.BASE_PATH;
const run = (cmd) => execSync(cmd, { stdio: 'inherit', env });

run('npm run check');
run('npm run build');
run(`npx wrangler pages deploy dist --project-name mms-official-site --branch ${branch}`);
