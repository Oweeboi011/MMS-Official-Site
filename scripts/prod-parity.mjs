// Prod parity: live site must serve the same JS/CSS build as local dist/. Usage: node scripts/prod-parity.mjs [url]
import { readFile } from 'node:fs/promises';

const url = process.argv[2] ?? 'https://www.metropolitanms.org/';
const assets = (html) => [...html.matchAll(/\/assets\/[\w.-]+\.(?:js|css)/g)].map((m) => m[0]).sort().join(' ');

const local = assets(await readFile('dist/index.html', 'utf8').catch(() => ''));
if (!local) {
  console.error('dist/index.html missing or has no assets. Run `npm run build` first.');
  process.exit(1);
}

let live = '';
for (let attempt = 1; attempt <= 10; attempt++) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    live = res.ok ? assets(await res.text()) : '';
  } catch {
    live = ''; // transient DNS/TLS error right after deploy: retry
  }
  if (live === local) break;
  await new Promise((r) => setTimeout(r, 6000)); // edge cache can lag up to ~1 min after deploy
}
if (live !== local) {
  console.error(`parity FAIL ${url}\n  local: ${local}\n  live:  ${live || '(none)'}`);
  process.exit(1);
}
console.log(`ok  parity: ${url} serves local build`);
