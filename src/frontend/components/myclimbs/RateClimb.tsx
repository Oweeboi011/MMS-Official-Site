import { useEffect, useState, type FormEvent } from 'react';
import type { MyClimb } from '../../data/myClimbs';
import { myRating, rateClimb } from '../../services/feedback';

// #146: after a climb you were confirmed on, rate it once (1–5) with optional comments; officers may quote it.
export default function RateClimb({ row, uid }: { row: MyClimb; uid: string }) {
  const [done, setDone] = useState<number | null | undefined>(undefined);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [state, setState] = useState({ busy: false, message: '' });
  useEffect(() => {
    let live = true;
    myRating(row.climbId, uid).then((r) => { if (live) setDone(r); }, () => { if (live) setDone(null); });
    return () => { live = false; };
  }, [row.climbId, uid]);
  if (done === undefined) return null;
  if (done) return <p className="climb-muted">You rated this climb {done} / 5. Thank you!</p>;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!rating) return setState({ busy: false, message: 'Pick 1 to 5 stars.' });
    setState({ busy: true, message: '' });
    try {
      await rateClimb({ climbId: row.climbId, climbTitle: row.title, uid, name: row.name, rating, comments });
      setDone(rating);
    } catch (err) {
      setState({ busy: false, message: `Not sent: ${(err as Error).message}` });
    }
  };
  return (
    <form className="pay-form" onSubmit={(e) => void submit(e)} noValidate>
      <h3>How was the climb?</h3>
      <div className="finder-options" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={rating === n ? 'is-selected' : undefined}>
            <input type="radio" name={`rate-${row.id}`} checked={rating === n} onChange={() => setRating(n)} /> {n} ★
          </label>
        ))}
      </div>
      <label htmlFor={`fb-${row.id}`}>Comments (optional)</label>
      <textarea id={`fb-${row.id}`} rows={3} maxLength={2000} value={comments} onChange={(e) => setComments(e.target.value)} />
      {state.message && <p role="alert" className="field-error">{state.message}</p>}
      <button type="submit" className="btn btn-primary" disabled={state.busy}>Send rating</button>
    </form>
  );
}
