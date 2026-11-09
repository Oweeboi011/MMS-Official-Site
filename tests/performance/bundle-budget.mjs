// Performance budget: fails if the built JS/CSS grows past the limits. Run after `npm run build`.
// "initial" = what index.html loads on every page; "lazy" = on-demand chunks (pages, Firebase SDK).
// Lazy is budgeted per file (what one page adds), not as a total: the total grows with every feature (owner decision 2026-11-09).
import { readdir, readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const KB = 1024;
const budgets = { initialJs: 120 * KB, largestLazyJs: 80 * KB, css: 20 * KB }; // gzipped
const dir = 'dist/assets';

const files = await readdir(dir).catch(() => {
  console.error('dist/assets missing. Run `npm run build` first.');
  process.exit(1);
});
const html = await readFile('dist/index.html', 'utf8');
const initial = new Set([...html.matchAll(/assets\/([^"']+\.js)/g)].map((m) => m[1]));

const totals = { initialJs: 0, largestLazyJs: 0, css: 0 };
let largest = '';
let lazyTotal = 0;
for (const f of files) {
  if (!(await stat(join(dir, f))).isFile()) continue;
  const size = gzipSync(await readFile(join(dir, f))).length;
  if (f.endsWith('.css')) totals.css += size;
  else if (f.endsWith('.js') && initial.has(f)) totals.initialJs += size;
  else if (f.endsWith('.js')) {
    lazyTotal += size;
    if (size > totals.largestLazyJs) [totals.largestLazyJs, largest] = [size, f];
  }
}

let failed = false;
for (const [key, size] of Object.entries(totals)) {
  const ok = size <= budgets[key];
  failed ||= !ok;
  const which = key === 'largestLazyJs' ? ` (${largest})` : '';
  console.log(`${ok ? 'ok ' : 'FAIL'} ${key}: ${(size / KB).toFixed(1)} KB gz (budget ${budgets[key] / KB} KB)${which}`);
}
console.log(`info lazyJs total: ${(lazyTotal / KB).toFixed(1)} KB gz (all on-demand files; not a limit)`);
process.exit(failed ? 1 : 0);
