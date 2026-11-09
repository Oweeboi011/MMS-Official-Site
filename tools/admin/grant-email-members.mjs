// Grant or revoke "can email every member" (users/{uid}.canEmailMembers). Outside the app on purpose: rules refuse
// the field from every client. Usage: node tools/admin/grant-email-members.mjs <uid|email> [--revoke] [--project <id>]
import { FieldValue, args, connect, findAccount, main } from './firebaseAdmin.mjs';

await main(async () => {
  const { project, flags, positional: [who] } = args();
  if (!who) throw new Error('Usage: node tools/admin/grant-email-members.mjs <uid|email> [--revoke] [--project <id>]');
  const revoke = flags.includes('--revoke');
  const { db, auth } = connect(project);
  const account = await findAccount(auth, who);
  const label = `${account.displayName || account.email} (${account.uid})`;
  const ref = db.doc(`users/${account.uid}`);
  const profile = (await ref.get()).data();
  if (!revoke && profile?.role !== 'admin') throw new Error(`${label} is not an admin; make them one first.`);
  if (revoke && !profile) return console.log(`${label} has no profile; nothing to revoke.`);
  await ref.update({ canEmailMembers: revoke ? FieldValue.delete() : true });
  console.log(`${revoke ? 'Revoked' : 'Granted'} canEmailMembers for ${label}.`);
});
