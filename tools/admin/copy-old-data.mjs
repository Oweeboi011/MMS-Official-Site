// One-way copy of everything in the old Open Climbs project's Firestore + sign-in accounts into this project, same ids.
// Dry run unless --apply; docs already here are kept unless --overwrite. Passwords cannot move (hash settings, #34):
// accounts arrive with their Google link and emailVerified; email/password people use "Forgot password" once, unless
// --hash-params <file> is given (JSON with the console's base64_signer_key, base64_salt_separator, rounds, mem_cost):
// then their passwords move too. Keep that file out of the repo.
// Needs your Google login on both projects: gcloud auth application-default login
//   node tools/admin/copy-old-data.mjs [--from mms-open-climbs] [--project <id>] [--apply] [--overwrite] [--only a,b] [--hash-params file]
import { planCopy, toImportRecord } from './copyPlan.mjs';
import { args, connect, connectNamed, main } from './firebaseAdmin.mjs';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const adminRequire = createRequire(new URL('../../src/backend/functions/package.json', import.meta.url));
const { getAuth } = adminRequire('firebase-admin/auth');
const { getApp } = adminRequire('firebase-admin/app');

// People first (registrations point at them), then the records that hang off climbs, then history.
const ORDER = ['users', 'memberDetails', 'climbPrivate', 'climbInternal', 'climbExpenses', 'registrations', 'releaseNotes', 'auditLog', 'notifications', 'failedRequests', 'pageViews'];
const BATCH = 400;

const flagValue = (name) => {
  const at = process.argv.indexOf(name);
  return at >= 0 ? process.argv[at + 1] : undefined;
};

function scryptOptions(file) {
  if (!file) return null;
  const p = JSON.parse(readFileSync(file, 'utf8'));
  const missing = ['base64_signer_key', 'base64_salt_separator', 'rounds', 'mem_cost'].filter((k) => p[k] === undefined);
  if (missing.length) throw new Error(`--hash-params file is missing: ${missing.join(', ')}`);
  return { hash: { algorithm: 'SCRYPT', key: Buffer.from(p.base64_signer_key, 'base64'), saltSeparator: Buffer.from(p.base64_salt_separator, 'base64'), rounds: p.rounds, memoryCost: p.mem_cost } };
}

async function allUsers(auth) {
  const users = [];
  let page = await auth.listUsers(1000);
  for (;;) {
    users.push(...page.users);
    if (!page.pageToken) return users;
    page = await auth.listUsers(1000, page.pageToken);
  }
}

// Skip an account already here (same uid, unless --overwrite upserts it) or whose email another uid already holds.
function shouldSkip(user, have, overwrite) {
  if (have.uids.has(user.uid)) return !overwrite;
  return Boolean(user.email) && have.emails.has(user.email.toLowerCase());
}

async function copyAccounts(oldApp, newApp, { apply, overwrite, hashFile }) {
  const scrypt = scryptOptions(hashFile);
  const newAuth = getAuth(newApp);
  const here = await allUsers(newAuth);
  const have = { uids: new Set(here.map((u) => u.uid)), emails: new Set(here.flatMap((u) => (u.email ? [u.email.toLowerCase()] : []))) };
  const all = await allUsers(getAuth(oldApp));
  const records = all.filter((u) => !shouldSkip(u, have, overwrite)).map((u) => toImportRecord(u, Boolean(scrypt)));
  const google = records.filter((r) => r.providerData.some((p) => p.providerId === 'google.com')).length;
  console.log(`sign-in accounts: create ${records.length} (${google} with Google) · left ${all.length - records.length}`);
  if (!apply) return;
  for (let i = 0; i < records.length; i += 1000) {
    const result = await newAuth.importUsers(records.slice(i, i + 1000), scrypt ?? undefined);
    console.log(`  imported ${result.successCount}, failed ${result.failureCount}`);
    for (const e of result.errors) console.log(`  failed #${e.index}: ${e.error.message}`);
  }
}

async function copyCollection(name, old, target, { apply, overwrite }) {
  const source = (await old.collection(name).get()).docs.map((d) => ({ id: d.id, data: d.data() }));
  const existing = new Set((await target.collection(name).select().get()).docs.map((d) => d.id));
  const plan = planCopy(source, existing, overwrite);
  console.log(`${name.padEnd(16)} ${String(source.length).padStart(5)} · create ${plan.create.length} · overwrite ${plan.overwrite.length} · leave ${plan.skip.length}`);
  if (!apply) return;
  const writes = [...plan.create, ...plan.overwrite];
  for (let i = 0; i < writes.length; i += BATCH) {
    const batch = target.batch();
    for (const d of writes.slice(i, i + BATCH)) batch.set(target.doc(`${name}/${d.id}`), d.data);
    await batch.commit();
  }
}

await main(async () => {
  const { project, flags } = args();
  const from = flagValue('--from') ?? 'mms-open-climbs';
  if (from === project) throw new Error('--from must be the old project, not the one being written.');
  const only = flagValue('--only')?.split(',');
  const opts = { apply: flags.includes('--apply'), overwrite: flags.includes('--overwrite'), hashFile: flagValue('--hash-params') };
  const target = connect(project).db;
  const old = connectNamed('old', from);
  console.log(`${from} → ${project}${opts.apply ? '' : ' (dry run)'}`);
  if (!only || only.includes('accounts')) await copyAccounts(getApp('old'), getApp(), opts);
  for (const name of ORDER.filter((n) => !only || only.includes(n))) await copyCollection(name, old, target, opts);
  if (!opts.apply) console.log('Dry run. Add --apply to write.');
});
