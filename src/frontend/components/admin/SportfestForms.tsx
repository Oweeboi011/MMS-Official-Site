import { useState, type FormEvent } from 'react';
import {
  MAX_POINTS, PLACEMENTS, TRIBES, defaultMaxPoints, emptyPlacements, gameProblem, newGameFields, placementProblem, placementsOf,
  type Game, type GameClass, type GameStatus, type MaxPoints, type Placement, type Placements, type Score,
} from '../../data/sportfest';
import type { GameInput } from '../../services/sportfest';

const STATUSES: GameStatus[] = ['upcoming', 'ongoing', 'completed'];

export function GameForm({ game, year, busy, onSave, onCancel }: { game?: Game; year: number; busy: boolean; onSave: (input: GameInput) => Promise<boolean>; onCancel: () => void }) {
  const [form, setForm] = useState<GameInput>(() => newGameFields(game, year));
  const [error, setError] = useState('');
  const set = <K extends keyof GameInput>(key: K, value: GameInput[K]) => setForm({ ...form, [key]: value });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = gameProblem(form);
    setError(problem);
    if (problem) return;
    if (await onSave(form)) onCancel();
  };
  return (
    <form className="register-form" onSubmit={(e) => void submit(e)} noValidate>
      <div className="editor-field"><label htmlFor="sf-name">Game name *</label><input id="sf-name" maxLength={120} value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
      <div className="editor-field"><label htmlFor="sf-cat">Category *</label><input id="sf-cat" maxLength={60} value={form.category} onChange={(e) => set('category', e.target.value)} /></div>
      <div className="editor-field"><label htmlFor="sf-date">Date</label><input id="sf-date" maxLength={30} value={form.date} onChange={(e) => set('date', e.target.value)} /></div>
      <div className="editor-field"><label htmlFor="sf-class">Class</label>
        <select id="sf-class" value={form.gameClass} onChange={(e) => { const c = e.target.value as GameClass; setForm({ ...form, gameClass: c, maxPoints: defaultMaxPoints(c) }); }}>
          <option value="A">A (5 : 3 : 2 : 1)</option><option value="B">B (20, 15, 10, 5)</option>
        </select>
      </div>
      {form.gameClass === 'A' && (
        <div className="editor-field"><label htmlFor="sf-max">Points for 1st</label>
          <select id="sf-max" value={form.maxPoints} onChange={(e) => set('maxPoints', Number(e.target.value) as MaxPoints)}>{MAX_POINTS.filter((m) => m !== 20).map((m) => <option key={m} value={m}>{m}</option>)}</select>
        </div>
      )}
      <div className="editor-field"><label htmlFor="sf-status">Status</label>
        <select id="sf-status" value={form.status} onChange={(e) => set('status', e.target.value as GameStatus)}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
      </div>
      <div className="editor-field"><label htmlFor="sf-year">Year</label><input id="sf-year" type="number" min={2000} max={2100} value={form.year} onChange={(e) => set('year', Number(e.target.value))} /></div>
      {error && <p role="alert" className="field-error">{error}</p>}
      <div className="editor-actions"><button type="submit" className="btn btn-primary" disabled={busy}>Save game</button><button type="button" className="link-button" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

const ORDINAL: Record<Placement, string> = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };

export function ResultsForm({ game, scores, busy, onSave, onCancel }: { game: Game; scores: Score[]; busy: boolean; onSave: (p: Placements) => Promise<boolean>; onCancel: () => void }) {
  const [placements, setPlacements] = useState<Placements>(() => (scores.length ? placementsOf(scores) : emptyPlacements()));
  const problem = placementProblem(placements);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!problem && (await onSave(placements))) onCancel();
  };
  return (
    <form className="register-form" onSubmit={(e) => void submit(e)}>
      <p><strong>{game.name}</strong> · {game.gameClass === 'A' ? `Class A, ${game.maxPoints} points for 1st` : 'Class B, 20 points for 1st'}</p>
      {TRIBES.map((tribe) => (
        <div key={tribe} className="editor-field"><label htmlFor={`sf-${tribe}`}>{tribe}</label>
          <select id={`sf-${tribe}`} value={placements[tribe] ?? ''} onChange={(e) => setPlacements({ ...placements, [tribe]: e.target.value ? (Number(e.target.value) as Placement) : null })}>
            <option value="">No result</option>{PLACEMENTS.map((p) => <option key={p} value={p}>{ORDINAL[p]}</option>)}
          </select>
        </div>
      ))}
      {problem && <p role="alert" className="field-error">{problem}</p>}
      <div className="editor-actions"><button type="submit" className="btn btn-primary" disabled={busy || Boolean(problem)}>Save results</button><button type="button" className="link-button" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}
