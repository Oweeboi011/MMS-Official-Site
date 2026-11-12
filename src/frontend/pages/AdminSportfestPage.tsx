import { useState } from 'react';
import PageHero from '../components/PageHero';
import { AdminGate } from '../components/admin/RegistrationTable';
import { GameForm, ResultsForm } from '../components/admin/SportfestForms';
import { useAdminList } from '../components/admin/useAdminList';
import { manilaYear } from '../lib/manila';
import { years, type Game, type Score } from '../data/sportfest';
import { loadGames, loadScores, removeGame, saveGame, saveResults } from '../services/sportfest';

type Editing = { kind: 'game'; game?: Game } | { kind: 'results'; game: Game } | null;
interface Row { game: Game; scores: Score[] }

async function loadRows(): Promise<Row[]> {
  const [games, scores] = await Promise.all([loadGames(), loadScores()]);
  return games.map((game) => ({ game, scores: scores.filter((s) => s.gameId === game.id) })).sort((a, b) => b.game.year - a.game.year || a.game.name.localeCompare(b.game.name));
}

function Games() {
  const { rows, message, busy, run } = useAdminList(loadRows);
  const [editing, setEditing] = useState<Editing>(null);
  const [year, setYear] = useState(manilaYear(new Date()));
  if (!rows) return <p role="status">{message || 'Loading games…'}</p>;
  const options = [...new Set([year, ...years(rows.map((r) => r.game))])].sort((a, b) => b - a);
  const shown = rows.filter((r) => r.game.year === year);
  return (
    <>
      <div className="editor-field"><label htmlFor="sf-admin-year">Year</label>
        <select id="sf-admin-year" value={year} onChange={(e) => setYear(Number(e.target.value))}>{options.map((y) => <option key={y} value={y}>{y}</option>)}</select>
      </div>
      {editing?.kind === 'game' && <GameForm game={editing.game} year={year} busy={busy} onCancel={() => setEditing(null)} onSave={(input) => run(() => saveGame(editing.game?.id ?? null, input))} />}
      {editing?.kind === 'results' && <ResultsForm game={editing.game} scores={rows.find((r) => r.game.id === editing.game.id)?.scores ?? []} busy={busy} onCancel={() => setEditing(null)} onSave={(p) => run(() => saveResults(editing.game, p))} />}
      {!editing && <p><button type="button" className="btn btn-primary" onClick={() => setEditing({ kind: 'game' })}>Add a game</button></p>}
      {message && <p role="status">{message}</p>}
      {shown.length === 0 ? <p>No games for {year} yet.</p> : (
        <div className="admin-table"><table>
          <thead><tr><th scope="col">Game</th><th scope="col">Class</th><th scope="col">Status</th><th scope="col">Results</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {shown.map(({ game, scores }) => (
              <tr key={game.id}>
                <td><strong>{game.name}</strong><small>{game.category}{game.date && ` · ${game.date}`}</small></td>
                <td>{`${game.gameClass} · ${game.maxPoints}`}</td>
                <td>{game.status}</td>
                <td>{scores.length ? `${scores.length} of 4 placed` : 'None yet'}</td>
                <td>
                  <button type="button" className="chip" disabled={busy} onClick={() => setEditing({ kind: 'results', game })}>Results</button>{' '}
                  <button type="button" className="chip" disabled={busy} onClick={() => setEditing({ kind: 'game', game })}>Edit</button>{' '}
                  <button type="button" className="chip" disabled={busy} onClick={() => void run(() => removeGame(game))}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
      <p className="climb-muted">Members see the scoreboard on Activities → Sportfest Scoreboard once they sign in. Deleting a game also deletes its results.</p>
    </>
  );
}

export default function AdminSportfestPage() {
  return (
    <>
      <PageHero compact crumb={{ to: '/admin', label: 'Admin' }} eyebrow="Admin" title="Sportfest scoreboard" intro="Games, placements and the tribe standings for Sportfest and Beachineering." image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell"><AdminGate>{() => <Games />}</AdminGate></div></section></main>
    </>
  );
}
