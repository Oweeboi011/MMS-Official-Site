// Local emulator seed: an admin and a member sign-in plus two sample climbs. Emulator hosts are always set, so it
// never reaches the real project. Start the emulators first (DEVELOPER-GUIDE, Sign-in + admin).
import { args, connect, main } from './firebaseAdmin.mjs';

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
const PASSWORD = process.env.SEED_PASSWORD ?? ''; // you pick it; never printed or committed

const day = (offset) => new Date(Date.now() + offset * 86400_000);
const climb = (title, offset, extra) => ({
  title: `Sample: ${title}`, location: 'Sample location', startDate: day(offset), endDate: day(offset + 1),
  status: 'open', type: 'minor', maxParticipants: 20, registrationCount: 0, ...extra,
});

await main(async () => {
  if (PASSWORD.length < 6) throw new Error('Set SEED_PASSWORD (6+ characters) for the sample sign-ins.');
  const { project } = args();
  const { db, auth } = connect(project);
  for (const [uid, role] of [['admin1', 'admin'], ['member1', 'member']]) {
    const email = `${role}@example.test`;
    const user = { email, password: PASSWORD, displayName: `Sample ${role}` };
    await auth.createUser({ uid, ...user }).catch(() => auth.updateUser(uid, user)); // already seeded
    await db.doc(`users/${uid}`).set({ displayName: `Sample ${role}`, email, role, createdAt: new Date() });
  }
  await db.doc('climbs/sample-minor').set(climb('Minor day hike', 14, {}));
  await db.doc('climbs/sample-major').set(climb('Major overnight', 30, { type: 'major', maxParticipants: 15 }));
  console.log(`Seeded emulator (${project}): admin@example.test and member@example.test (password from SEED_PASSWORD), 2 sample climbs.`);
});
