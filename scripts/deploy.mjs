// Cloudflare Pages deploy with build guards: check → build → perf budget → deploy → prod parity.
// Usage: node scripts/deploy.mjs preview|main
import { execSync } from 'node:child_process';

const branch = process.argv[2];
if (branch !== 'preview' && branch !== 'main') {
  console.error('usage: node scripts/deploy.mjs preview|main');
  process.exit(1);
}

// Preview shares prod Firebase: build it read-only, but show the registration screens so officers can review them.
const preview = branch === 'preview';
const env = { ...process.env, VITE_WRITES_ENABLED: preview ? 'false' : 'true', ...(preview && { VITE_REGISTRATION_ENABLED: 'true' }) };
const run = (cmd) => execSync(cmd, { stdio: 'inherit', env });

run('npm run check');
run('npm run build');
run('node scripts/snapshot.mjs'); // R5c: last good public content for when Firestore can't be read
run('npm run test:perf');
run(`npx wrangler pages deploy dist --project-name mms-official-site --branch ${branch}`);
if (branch === 'main') run('npm run test:parity');
