// One-off, owner-run: where an account on this project shares an email with a different-id account on the old
// project, replace it with the old one (same id) so the old role and registrations belong to the person again.
// Deletes the new-site account and its users/ + memberDetails/ docs. Dry run unless --apply.
//   GOOGLE_CLOUD_QUOTA_PROJECT=<this project> node tools/admin/swap-account.mjs [--apply]
import { createRequire } from 'node:module';
import { toImportRecord } from './copyPlan.mjs';
import { args, connect, connectNamed, main } from './firebaseAdmin.mjs';

const adminRequire = createRequire(new URL('../../src/backend/functions/package.json', import.meta.url));
const { getAuth } = adminRequire('firebase-admin/auth');
const { getApp } = adminRequire('firebase-admin/app');

await main(async () => {
  const { project, flags } = args();
  const apply = flags.includes('--apply');
  const db = connect(project).db;
  connectNamed('old', 'mms-open-climbs');
  const newAuth = getAuth(getApp());
  const oldUsers = (await getAuth(getApp('old')).listUsers(1000)).users;
  let found = 0;
  for (const mine of (await newAuth.listUsers(1000)).users) {
    const old = oldUsers.find((o) => o.email && o.email.toLowerCase() === mine.email?.toLowerCase() && o.uid !== mine.uid);
    if (!old) continue;
    found += 1;
    console.log(`${mine.email}: new id ${mine.uid.slice(0, 6)}… → old id ${old.uid.slice(0, 6)}…${apply ? '' : ' (dry run)'}`);
    if (!apply) continue;
    await newAuth.deleteUser(mine.uid);
    await db.doc(`users/${mine.uid}`).delete();
    await db.doc(`memberDetails/${mine.uid}`).delete();
    const result = await newAuth.importUsers([toImportRecord(old)]);
    console.log(`  imported ${result.successCount}, failed ${result.failureCount}`, result.errors.map((e) => e.error.message));
  }
  if (!found) console.log('No accounts share an email with a different id.');
  else if (!apply) console.log('Dry run. Add --apply to swap.');
});
