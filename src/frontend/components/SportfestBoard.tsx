import { useEffect, useState } from 'react';
import {
  SCORING_TABLE, TRIBES, TRIBE_COLORS, computeTribeTotals, pointsFromPlacement, years, type Game, type Placement, type Score, type Tribe,
} from '../data/sportfest';
import { loadGames, loadScores } from '../services/sportfest';
import { useAccount } from '../services/useAccount';
import DataTable from './DataTable';
import SignInForm from './SignInForm';

const MEDAL: Record<Placement, string> = { 1: '🥇 1st', 2: '🥈 2nd', 3: '🥉 3rd', 4: '4th' };
const ORDINAL = ['1st', '2nd', '3rd', '4th'];
const tribeStyle = (tribe: Tribe) => ({ '--tribe': TRIBE_COLORS[tribe] }) as React.CSSProperties;

function Standings({ scores }: { scores: Score[] }) {
  const totals = computeTribeTotals(scores);
  if (!scores.length) return <p className="climb-muted">No scores yet. Check back soon.</p>;
  return (
    <DataTable caption="Overall standings" head={['Rank', 'Tribe', '🥇 Gold', '🥈 Silver', '🥉 Bronze', '4th', 'Points']}>
      {totals.map((t, i) => (
        <tr key={t.tribe} className="sf-tribe" style={tribeStyle(t.tribe)}>
          <th scope="row">{ORDINAL[i]}</th>
          <td className="sf-name">{t.tribe}</td>
          <td className="num">{t.gold}</td><td className="num">{t.silver}</td><td className="num">{t.bronze}</td><td className="num">{t.fourth}</td>
          <td className="num"><strong>{t.totalPoints}</strong></td>
        </tr>
      ))}
    </DataTable>
  );
}

function GameResults({ games, scores }: { games: Game[]; scores: Score[] }) {
  return (
    <DataTable caption="Game results by tribe" head={['Game', 'Category', 'Status', 'Date', ...TRIBES]}>
      {games.map((g) => {
        const byTribe = new Map<Tribe, Score>(scores.filter((s) => s.gameId === g.id).map((s) => [s.tribe, s]));
        return (
          <tr key={g.id}>
            <th scope="row">{g.name}</th><td>{g.category}</td><td>{g.status}</td><td>{g.date}</td>
            {TRIBES.map((tribe) => {
              const s = byTribe.get(tribe);
              return <td key={tribe}>{s ? `${MEDAL[s.placement]} · ${s.points} pts` : '—'}</td>;
            })}
          </tr>
        );
      })}
    </DataTable>
  );
}

function ScoringSystem() {
  return (
    <>
      <h2>Scoring system</h2>
      <p className="climb-muted">Class A pays 5 : 3 : 2 : 1 of the game’s top points, Class B pays fixed points, and Classes C and D pay 100, 75, 50 and 25 percent. Tied tribes share a place.</p>
      <DataTable caption="Points per place" head={['Class', ...ORDINAL]}>
        {SCORING_TABLE.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {([1, 2, 3, 4] as const).map((p) => <td key={p} className="num">{pointsFromPlacement(p, row.maxPoints, row.gameClass)}</td>)}
          </tr>
        ))}
      </DataTable>
    </>
  );
}

function Board() {
  const [data, setData] = useState<{ games: Game[]; scores: Score[] } | null>(null);
  const [error, setError] = useState('');
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    Promise.all([loadGames(), loadScores()]).then(([games, scores]) => setData({ games, scores }), (e: Error) => setError(`Couldn’t load the scoreboard: ${e.message}`));
  }, []);
  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p role="status">Loading the scoreboard…</p>;
  const all = years(data.games);
  const shown = year ?? all[0] ?? 0;
  const games = data.games.filter((g) => g.year === shown);
  const ids = new Set(games.map((g) => g.id));
  const scores = data.scores.filter((s) => ids.has(s.gameId));
  const played = games.filter((g) => g.status !== 'upcoming').sort((a, b) => Number(a.status === 'ongoing') - Number(b.status === 'ongoing')).reverse();
  return (
    <section className="section page-section"><div className="shell">
      {all.length > 1 && (
        <div className="editor-field"><label htmlFor="sf-year">Year</label>
          <select id="sf-year" value={shown} onChange={(e) => setYear(Number(e.target.value))}>{all.map((y) => <option key={y} value={y}>{y}</option>)}</select>
        </div>
      )}
      <h2>Overall standings</h2>
      <Standings scores={scores} />
      {played.length > 0 && <><h2>Game results</h2><GameResults games={played} scores={scores} /></>}
      <ScoringSystem />
    </div></section>
  );
}

// Members only: signed-out visitors are asked to sign in first (the data is not public).
export default function SportfestBoard() {
  const state = useAccount();
  if (state.status === 'signedIn') return <Board />;
  return (
    <section className="section page-section"><div className="shell register-shell">
      {state.status === 'loading' ? <p role="status">Checking your sign-in…</p> : <><p>The Sportfest scoreboard is for signed-in members. Sign in to see it.</p><SignInForm /></>}
    </div></section>
  );
}
