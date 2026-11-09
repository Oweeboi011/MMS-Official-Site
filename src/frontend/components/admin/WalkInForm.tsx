import { useState, type FormEvent } from 'react';
import { emptyWalkIn, walkInProblem, type WalkIn } from '../../data/adminRegistrations';

interface Props { busy: boolean; onAdd: (w: WalkIn) => Promise<boolean> }

// Add someone who joined without registering online (old app: Add Participant).
export default function WalkInForm({ busy, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [w, setW] = useState<WalkIn>(emptyWalkIn);
  const [problem, setProblem] = useState('');
  if (!open) return <button type="button" className="btn" onClick={() => setOpen(true)}>Add walk-in</button>;
  const set = <K extends keyof WalkIn>(k: K, v: WalkIn[K]) => setW((x) => ({ ...x, [k]: v }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const p = walkInProblem(w);
    setProblem(p ?? '');
    if (p) return;
    if (await onAdd(w)) {
      setW(emptyWalkIn());
      setOpen(false);
    }
  };
  const text = (k: 'name' | 'mobile' | 'email' | 'cash' | 'notes', label: string) => (
    <div className="editor-field"><label htmlFor={`wi-${k}`}>{label}</label><input id={`wi-${k}`} value={w[k]} onChange={(e) => set(k, e.target.value)} /></div>
  );
  return (
    <form className="register-section" onSubmit={(e) => void submit(e)} noValidate>
      <strong>Add walk-in</strong>
      {text('name', 'Name *')}
      {text('mobile', 'Mobile')}
      {text('email', 'Email')}
      <div className="editor-field">
        <label htmlFor="wi-type">Joining as</label>
        <select id="wi-type" value={w.memberType} onChange={(e) => set('memberType', e.target.value as WalkIn['memberType'])}><option value="joiner">Guest</option><option value="member">MMS member</option></select>
      </div>
      <div className="editor-field">
        <label htmlFor="wi-status">Status</label>
        <select id="wi-status" value={w.status} onChange={(e) => set('status', e.target.value as WalkIn['status'])}><option>confirmed</option><option>pending</option><option>waitlisted</option></select>
      </div>
      {text('cash', 'Cash received (₱, optional)')}
      {text('notes', 'Notes')}
      {problem && <p role="alert" className="field-error">{problem}</p>}
      <div className="editor-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>Add</button>
        <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
