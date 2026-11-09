// One-way copy of the old Open Climbs app's public `climbs` into this project, same ids so old links and
// registrations still line up. Dry run unless --apply; existing climbs are left alone unless --overwrite.
// Needs your Google login to have read access on the old project and write on this one:
//   gcloud auth application-default login
//   node tools/admin/copy-old-climbs.mjs [--from mms-open-climbs] [--project <id>] [--apply] [--overwrite]
import { describe, normalizeDates, planCopy } from './copyPlan.mjs';
import { Timestamp, args, connect, connectNamed, main } from './firebaseAdmin.mjs';

const BATCH = 400;

await main(async () => {
  const { project, flags } = args();
  const fromAt = process.argv.indexOf('--from');
  const from = fromAt >= 0 ? process.argv[fromAt + 1] : 'mms-open-climbs';
  if (!from || from === project) throw new Error('--from must be the old project, not the one being written.');
  const apply = flags.includes('--apply');
  const overwrite = flags.includes('--overwrite');

  const target = connect(project).db;
  const old = connectNamed('old', from);
  const source = (await old.collection('climbs').get()).docs.map((d) => ({ id: d.id, data: normalizeDates(d.data(), (date) => Timestamp.fromDate(date)) }));
  const existing = new Set((await target.collection('climbs').select().get()).docs.map((d) => d.id));
  const plan = planCopy(source, existing, overwrite);

  console.log(`${from} → ${project}: ${source.length} climbs · create ${plan.create.length} · overwrite ${plan.overwrite.length} · leave ${plan.skip.length}`);
  for (const d of [...plan.create, ...plan.overwrite]) console.log(`  ${plan.create.includes(d) ? '+' : '~'} ${describe(d)}`);
  if (!apply) return console.log('Dry run. Add --apply to write.');

  const writes = [...plan.create, ...plan.overwrite];
  for (let i = 0; i < writes.length; i += BATCH) {
    const batch = target.batch();
    for (const d of writes.slice(i, i + BATCH)) batch.set(target.doc(`climbs/${d.id}`), d.data);
    await batch.commit();
  }
  console.log(`Wrote ${writes.length} climbs.`);
});
