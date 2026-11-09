// R5c static fallback: after `vite build`, save the public content as dist/snapshot.json (same reads as
// src/frontend/services/publicData.ts, raw REST JSON). Pages fall back to it if Firestore can't be read.
// Skips (no file) when Firebase isn't configured. Usage: node scripts/snapshot.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

function env(name) {
  if (process.env[name]) return process.env[name];
  if (!existsSync('.env.local')) return '';
  const line = readFileSync('.env.local', 'utf8').split('\n').find((l) => l.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).split(' #')[0].trim() : ''; // drop trailing '# gitleaks:allow' comments
}

const projectId = env('VITE_FIREBASE_PROJECT_ID');
const apiKey = env('VITE_FIREBASE_API_KEY');
if (!projectId || !apiKey) {
  console.log('snapshot: Firebase not configured, skipped');
  process.exit(0);
}

const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/openclimbs/documents`;
const yearStart = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1) - 8 * 3600_000).toISOString(); // Manila Jan 1

async function call(path, body) {
  const res = await fetch(`${base}${path}?key=${apiKey}`, body ? { method: 'POST', body: JSON.stringify(body) } : {});
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}
const field = (fieldPath) => ({ field: { fieldPath } });
const q = (collectionId, extra) => call(':runQuery', { structuredQuery: { from: [{ collectionId }], ...extra } });

const snapshot = {
  generatedAt: new Date().toISOString(),
  announcements: await q('announcements', { where: { fieldFilter: { ...field('published'), op: 'EQUAL', value: { booleanValue: true } } }, orderBy: [{ ...field('publishedAt'), direction: 'DESCENDING' }], limit: 30 }),
  surveys: await q('surveys', { limit: 50 }),
  officers: await q('officers', { orderBy: [{ ...field('current'), direction: 'DESCENDING' }], limit: 300 }),
  climbs: await q('climbs', { where: { fieldFilter: { ...field('startDate'), op: 'GREATER_THAN_OR_EQUAL', value: { timestampValue: yearStart } } }, orderBy: [{ ...field('startDate') }], limit: 200 }),
  settings: await call('/siteSettings/site'),
};
writeFileSync('dist/snapshot.json', JSON.stringify(snapshot));
console.log(`snapshot: dist/snapshot.json (${(JSON.stringify(snapshot).length / 1024).toFixed(1)} KB)`);
