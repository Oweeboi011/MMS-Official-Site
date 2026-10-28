// Performance budget: fails if the built JS/CSS grows past the limits. Run after `npm run build`.
import { readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const KB = 1024;
const budgets = { js: 120 * KB, css: 20 * KB }; // gzipped totals
const dir = 'dist/assets';

const files = await readdir(dir).catch(() => {
  console.error('dist/assets missing. Run `npm run build` first.');
  process.exit(1);
});

const totals = { js: 0, css: 0 };
for (const f of files) {
  const ext = f.split('.').pop();
  if (!(ext in totals) || !(await stat(join(dir, f))).isFile()) continue;
  totals[ext] += gzipSync(await readFile(join(dir, f))).length;
}

let failed = false;
for (const [ext, size] of Object.entries(totals)) {
  const ok = size <= budgets[ext];
  failed ||= !ok;
  console.log(`${ok ? 'ok ' : 'FAIL'} ${ext}: ${(size / KB).toFixed(1)} KB gz (budget ${budgets[ext] / KB} KB)`);
}
process.exit(failed ? 1 : 0);
