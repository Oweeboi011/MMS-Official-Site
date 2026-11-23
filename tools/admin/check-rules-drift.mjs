// Read-only: does the Firestore ruleset released in production match src/backend/firebase/firestore.rules?
// Usage: node tools/admin/check-rules-drift.mjs [--project <id>]. Exit 1 on drift. Run before and after a release.
import { readFileSync } from 'node:fs';
import { accessToken, args, main } from './firebaseAdmin.mjs';

const normal = (s) => s.replace(/\r\n/g, '\n').trimEnd();

await main(async () => {
  const { project } = args();
  if (!project) throw new Error('No project: set VITE_FIREBASE_PROJECT_ID in .env.local or pass --project <id>.');
  const headers = { Authorization: `Bearer ${await accessToken()}` };
  const get = async (path) => {
    const res = await fetch(`https://firebaserules.googleapis.com/v1/${path}`, { headers });
    if (!res.ok) throw new Error(`Rules API ${res.status} for ${path}`);
    return res.json();
  };
  const release = await get(`projects/${project}/releases/cloud.firestore/openclimbs`);
  const live = normal((await get(release.rulesetName)).source.files[0].content);
  const repo = normal(readFileSync('src/backend/firebase/firestore.rules', 'utf8'));
  if (live === repo) return console.log(`ok  rules: production (${release.rulesetName.split('/').pop()}) matches the repo`);
  const a = live.split('\n');
  const b = repo.split('\n');
  let at = 0;
  while (at < Math.max(a.length, b.length) && a[at] === b[at]) at += 1;
  console.error(`DRIFT: production rules differ from the repo, first at line ${at + 1}\n  live: ${a[at] ?? '(end)'}\n  repo: ${b[at] ?? '(end)'}`);
  process.exit(1);
});
