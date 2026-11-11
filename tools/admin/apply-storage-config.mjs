// Applies src/backend/firebase/cors.json (and with --lifecycle, storage-lifecycle.json) to the project's bucket.
// Dry run unless --apply. GOOGLE_CLOUD_QUOTA_PROJECT=<project> node tools/admin/apply-storage-config.mjs [--apply] [--lifecycle]
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { args, connect, main } from './firebaseAdmin.mjs';

const adminRequire = createRequire(new URL('../../src/backend/functions/package.json', import.meta.url));
const { getStorage } = adminRequire('firebase-admin/storage');
const read = (name) => JSON.parse(readFileSync(new URL(`../../src/backend/firebase/${name}`, import.meta.url), 'utf8'));

main(async () => {
  const { project, flags } = args();
  connect(project);
  const bucket = getStorage().bucket(`${project}.firebasestorage.app`);
  const cors = read('cors.json');
  console.log(`bucket ${bucket.name}: CORS origins ${cors.flatMap((c) => c.origin).join(', ')}`);
  const withLifecycle = flags.includes('--lifecycle');
  if (withLifecycle) console.log(`lifecycle: ${read('storage-lifecycle.json').rule.length} rule(s)`);
  if (!flags.includes('--apply')) return console.log('dry run; add --apply');
  await bucket.setCorsConfiguration(cors);
  if (withLifecycle) await bucket.addLifecycleRule(read('storage-lifecycle.json').rule);
  console.log('applied');
});
