// First-admin bootstrap (and break-glass): make a sign-in account an admin; the adminClaim trigger sets the claim.
// Never commit uids. Usage: node tools/admin/set-admin.mjs <uid|email> [--project <id>]
import { FieldValue, args, connect, findAccount, main } from './firebaseAdmin.mjs';

await main(async () => {
  const { project, positional: [who] } = args();
  if (!who) throw new Error('Usage: node tools/admin/set-admin.mjs <uid|email> [--project <id>]');
  const { db, auth } = connect(project);
  const account = await findAccount(auth, who);
  const ref = db.doc(`users/${account.uid}`);
  // Existing profile: role only (createdAt orders the all-member email). New: create, never overwrite.
  const created = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) tx.update(ref, { role: 'admin' });
    else tx.create(ref, { displayName: account.displayName ?? '', email: account.email ?? '', role: 'admin', addedBy: 'set-admin script', createdAt: FieldValue.serverTimestamp() });
    return !snap.exists;
  });
  console.log(`${created ? 'Created admin profile' : 'Set role admin'} for ${account.email ?? account.uid} on ${project}.`);
});
