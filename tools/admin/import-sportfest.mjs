// One-way import of the Sagupaan 2026 scoreboard (the old Next.js app's public /api/games and /api/scores) into
// sportfestGames and sportfestScores, keeping ids so a re-run updates instead of duplicating. Dry run unless --apply.
//   node tools/admin/import-sportfest.mjs [--from https://mms-sagupaan.vercel.app] [--year 2026] [--project <id>] [--apply]
import { args, connect, main } from './firebaseAdmin.mjs';

const TRIBES = ['Aeta', 'Badjao', 'Mangyan', 'Tasaday'];
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function toGameDoc(g, year) {
  const gameClass = ['A', 'B', 'C', 'D'].includes(g.gameClass) ? g.gameClass : 'B';
  const maxPoints = [5, 10, 20, 40, 60].includes(g.maxPoints) ? g.maxPoints : 20;
  const status = ['upcoming', 'ongoing', 'completed'].includes(g.status) ? g.status : 'upcoming';
  return { name: text(g.name, 120), category: text(g.category, 60), date: text(g.date, 30), status, gameClass, maxPoints, year };
}

export function toScoreDoc(s, year) {
  if (!TRIBES.includes(s.tribe) || ![1, 2, 3, 4].includes(s.placement) || typeof s.points !== 'number') return null;
  return { gameId: String(s.gameId), year, tribe: s.tribe, placement: s.placement, points: s.points };
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

await main(async () => {
  const { project, flags } = args();
  const all = process.argv.slice(2);
  const option = (name, fallback) => (all.includes(name) ? all[all.indexOf(name) + 1] : fallback);
  const from = option('--from', 'https://mms-sagupaan.vercel.app').replace(/\/$/, '');
  const year = Number(option('--year', '2026'));
  const games = (await getJson(`${from}/api/games`)).map((g) => ({ id: String(g.id), data: toGameDoc(g, year) })).filter((g) => g.data.name && g.data.category);
  const gameIds = new Set(games.map((g) => g.id));
  const scores = (await getJson(`${from}/api/scores`)).flatMap((s) => {
    const data = toScoreDoc(s, year);
    return data && gameIds.has(data.gameId) ? [{ id: String(s.id), data }] : [];
  });
  console.log(`${from} → ${project}: ${games.length} games, ${scores.length} scores (year ${year})`);
  if (!flags.includes('--apply')) return console.log('dry run; add --apply');

  const { db } = connect(project);
  for (let i = 0; i < games.length + scores.length; i += 400) {
    const batch = db.batch();
    [...games.map((g) => [db.doc(`sportfestGames/${g.id}`), g.data]), ...scores.map((s) => [db.doc(`sportfestScores/${s.id}`), s.data])]
      .slice(i, i + 400).forEach(([ref, data]) => batch.set(ref, data));
    await batch.commit();
  }
  console.log('imported');
});
