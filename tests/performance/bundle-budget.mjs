// Performance budget: fails if the built JS/CSS grows past the limits. Run after `npm run build`.
// "initial" = what index.html loads on every page; "lazy" = on-demand chunks (sign-in/admin with Firebase).
import { readdir, readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const KB = 1024;
const budgets = { initialJs: 120 * KB, lazyJs: 150 * KB, css: 20 * KB }; // gzipped totals
const dir = 'dist/assets';

const files = await readdir(dir).catch(() => {
  console.error('dist/assets missing. Run `npm run build` first.');
  process.exit(1);
});
const html = await readFile('dist/index.html', 'utf8');
const initial = new Set([...html.matchAll(/assets\/([^"']+\.js)/g)].map((m) => m[1]));

const totals = { initialJs: 0, lazyJs: 0, css: 0 };
for (const f of files) {
  if (!(await stat(join(dir, f))).isFile()) continue;
  let key = null;
  if (f.endsWith('.css')) key = 'css';
  else if (f.endsWith('.js')) key = initial.has(f) ? 'initialJs' : 'lazyJs';
  if (key) totals[key] += gzipSync(await readFile(join(dir, f))).length;
}

let failed = false;
for (const [key, size] of Object.entries(totals)) {
  const ok = size <= budgets[key];
  failed ||= !ok;
  console.log(`${ok ? 'ok ' : 'FAIL'} ${key}: ${(size / KB).toFixed(1)} KB gz (budget ${budgets[key] / KB} KB)`);
}
process.exit(failed ? 1 : 0);
