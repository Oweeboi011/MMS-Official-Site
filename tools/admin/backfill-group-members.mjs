// Fill groupMembers (the task owner list, ADR 0012) for everyone who already holds a group. Safe to rerun.
// Usage: node tools/admin/backfill-group-members.mjs [--project <id>]
import { FieldValue, args, connect, main } from './firebaseAdmin.mjs';

await main(async () => {
  const { project } = args();
  const { db } = connect(project);
  const users = await db.collection('users').get();
  let written = 0;
  for (const d of users.docs) {
    const { groups, name, displayName } = d.data();
    if (!Array.isArray(groups) || groups.length === 0) continue;
    await db.doc(`groupMembers/${d.id}`).set({ name: String(name || displayName || 'Unnamed member'), groups, updatedAt: FieldValue.serverTimestamp() });
    written += 1;
  }
  console.log(`groupMembers written for ${written} of ${users.size} users.`);
});
