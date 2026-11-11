import { useEffect, useState } from 'react';
import {
  SCORING_TABLE, TRIBES, TRIBE_COLORS, computeTribeTotals, pointsFromPlacement, years, type Game, type Placement, type Score, type Tribe,
} from '../data/sportfest';
import { loadGames, loadScores } from '../services/sportfest';
import { useAccount } from '../services/useAccount';
import SignInForm from './SignInForm';

const MEDAL: Record<Placement, string> = { 1: '🥇 1st', 2: '🥈 2nd', 3: '🥉 3rd', 4: '4th' };
const ORDINAL = ['1st', '2nd', '3rd', '4th'];

function Standings({ scores }: { scores: Score[] }) {
  const totals = computeTribeTotals(scores);
  if (!scores.length) return <p className="climb-muted">No scores yet. Check back soon.</p>;
  return (
    <ol className="sf-standings">
      {totals.map((t, i) => (
        <li key={t.tribe} className="sf-tribe" style={{ '--tribe': TRIBE_COLORS[t.tribe] } as React.CSSProperties}>
          <span className="sf-rank">{ORDINAL[i]}</span>
          <span className="sf-name">{t.tribe}</span>
          <span className="sf-medals" aria-label={`${t.gold} gold, ${t.silver} silver, ${t.bronze} bronze, ${t.fourth} fourth`}>🥇 {t.gold} · 🥈 {t.silver} · 🥉 {t.bronze} · 4th {t.fourth}</span>
          <span className="sf-pts"><strong>{t.totalPoints}</strong> pts</span>
        </li>
      ))}
    </ol>
  );
}

function GameCard({ game, scores }: { game: Game; scores: Score[] }) {
  const byTribe = new Map<Tribe, Score>(scores.map((s) => [s.tribe, s]));
  const ordered = [...TRIBES].sort((a, b) => (byTribe.get(b)?.points ?? -1) - (byTribe.get(a)?.points ?? -1));
  return (
    <li className="my-climb">
      <h3>{game.name}</h3>
      <p className="my-climb-meta"><span className="my-climb-chip">{game.status}</span><span className="my-climb-chip">{game.category}</span>{game.date && <span className="my-climb-date">{game.date}</span>}</p>
      <ul className="sf-rows">
        {ordered.map((tribe) => {
          const s = byTribe.get(tribe);
          return (
            <li key={tribe} style={{ '--tribe': TRIBE_COLORS[tribe] } as React.CSSProperties}>
              <span className="sf-name">{tribe}</span>
              <span>{s ? `${MEDAL[s.placement]} · ${s.points} pts` : '—'}</span>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

function ScoringSystem() {
  return (
    <>
      <h2>Scoring system</h2>
      <p className="climb-muted">Class A pays 5 : 3 : 2 : 1 of the game’s top points. Class B pays fixed points.</p>
      <div className="sf-scoring">
        {SCORING_TABLE.map((row) => (
          <div key={row.label} className="my-climb">
            <h3>{row.label}</h3>
            <ul className="sf-rows">
              {([1, 2, 3, 4] as const).map((p) => <li key={p}><span>{ORDINAL[p - 1]}</span><span>{pointsFromPlacement(p, row.maxPoints, row.gameClass)} pts</span></li>)}
            </ul>
          </div>
        ))}
      </div>
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
      {played.length > 0 && <><h2>Game results</h2><ul className="my-climbs">{played.map((g) => <GameCard key={g.id} game={g} scores={scores.filter((s) => s.gameId === g.id)} />)}</ul></>}
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
