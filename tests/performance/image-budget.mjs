// Site image budget (no build needed). Over budget → put photos in a Drive album (docs/solution-plan/media.md).
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const MB = 1024 * 1024;
const dir = 'public/images';
const budget = { each: 1.2 * MB, total: 15 * MB };

const paths = (await readdir(dir, { recursive: true })).map((f) => join(dir, f));
const files = (await Promise.all(paths.map(async (p) => ({ p, s: await stat(p) })))).filter((f) => f.s.isFile());

const tooBig = files.filter((f) => f.s.size > budget.each);
tooBig.forEach((f) => console.log(`FAIL ${f.p}: ${(f.s.size / MB).toFixed(2)} MB (each ≤ ${budget.each / MB} MB)`));
const total = files.reduce((n, f) => n + f.s.size, 0);
const totalOk = total <= budget.total;
console.log(`${totalOk ? 'ok ' : 'FAIL'} images: ${(total / MB).toFixed(1)} MB in ${files.length} files (budget ${budget.total / MB} MB)`);
process.exit(tooBig.length || !totalOk ? 1 : 0);
