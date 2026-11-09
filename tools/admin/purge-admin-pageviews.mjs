// One-off: delete page views logged on /admin and /account pages before the client stopped logging them.
// Usage: node tools/admin/purge-admin-pageviews.mjs [--project <id>]
import { args, connect, main } from './firebaseAdmin.mjs';

const RANGES = [['/account', '/accounu'], ['/admin', '/admio']]; // [prefix, next string after every prefix match)

await main(async () => {
  const { db } = connect(args().project);
  let deleted = 0;
  for (const [from, to] of RANGES) {
    for (;;) {
      const snap = await db.collection('pageViews').where('path', '>=', from).where('path', '<', to).limit(400).get();
      if (snap.empty) break;
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      deleted += snap.size;
    }
  }
  console.log(`Deleted ${deleted} admin/account page views.`);
});
