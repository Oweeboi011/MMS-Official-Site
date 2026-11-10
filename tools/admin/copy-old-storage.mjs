// Copies the old project's Storage files (receipts, medical certificates, permits, QR images…) into this project's
// bucket under the same paths, then (--rewrite) repoints the download links stored in records. Dry run unless --apply.
// Objects keep their download token, so existing links keep working after the bucket name changes.
//   GOOGLE_CLOUD_QUOTA_PROJECT=<this project> node tools/admin/copy-old-storage.mjs [--apply] [--rewrite] [--project <id>]
import { createRequire } from 'node:module';
import { rewriteLinks } from './copyPlan.mjs';
import { args, connect, connectNamed, main } from './firebaseAdmin.mjs';

const adminRequire = createRequire(new URL('../../src/backend/functions/package.json', import.meta.url));
const { getStorage } = adminRequire('firebase-admin/storage');
const { getApp } = adminRequire('firebase-admin/app');

const FROM = 'mms-open-climbs.firebasestorage.app';
const COLLECTIONS = ['climbs', 'registrations', 'climbPrivate', 'climbInternal', 'climbExpenses', 'memberDetails', 'releaseNotes', 'notifications'];
const BATCH = 400;

async function copyFiles(project, apply) {
  const target = getStorage(getApp()).bucket(`${project}.firebasestorage.app`);
  const source = getStorage(getApp('old')).bucket(FROM);
  const [from] = await source.getFiles();
  const have = new Set((await target.getFiles())[0].map((f) => f.name));
  const missing = from.filter((f) => !f.name.endsWith('/') && !have.has(f.name));
  console.log(`files: ${from.length} in ${FROM} · copy ${missing.length} · already here ${from.length - missing.length}`);
  if (!apply) return;
  for (const file of missing) await file.copy(target.file(file.name));
  console.log(`  copied ${missing.length}`);
}

async function rewriteRecords(db, project, apply) {
  const to = `${project}.firebasestorage.app`;
  for (const name of COLLECTIONS) {
    const docs = (await db.collection(name).get()).docs;
    const changed = docs.flatMap((d) => {
      const data = d.data();
      const next = rewriteLinks(data, FROM, to);
      return JSON.stringify(next) === JSON.stringify(data) ? [] : [{ ref: d.ref, next }];
    });
    console.log(`links in ${name}: ${changed.length} of ${docs.length} records`);
    if (!apply) continue;
    for (let i = 0; i < changed.length; i += BATCH) {
      const batch = db.batch();
      for (const c of changed.slice(i, i + BATCH)) batch.set(c.ref, c.next);
      await batch.commit();
    }
  }
}

await main(async () => {
  const { project, flags } = args();
  const apply = flags.includes('--apply');
  const db = connect(project).db;
  connectNamed('old', 'mms-open-climbs');
  await copyFiles(project, apply);
  if (flags.includes('--rewrite')) await rewriteRecords(db, project, apply);
  if (!apply) console.log('Dry run. Add --apply to write.');
});
