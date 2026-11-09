import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import SignInForm from '../components/SignInForm';
import { canCancel, draftCancellationPolicy, type MyClimb } from '../data/myClimbs';
import { registrationEnabled } from '../services/firebaseEnv';
import { cancelRegistration, myRegistrations } from '../services/registrations';
import { useAccount } from '../services/useAccount';
import { useClimb } from '../services/useClimb';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

function Cancel({ row, onDone }: { row: MyClimb; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [state, setState] = useState<{ busy: boolean; error: string }>({ busy: false, error: '' });
  if (!open) return <button type="button" className="btn" onClick={() => setOpen(true)}>Cancel registration</button>;
  const confirm = async () => {
    setState({ busy: true, error: '' });
    try {
      await cancelRegistration(row.id, reason);
      onDone();
    } catch (e) {
      setState({ busy: false, error: `Not cancelled: ${(e as Error).message}` });
    }
  };
  return (
    <div className="cancel-box">
      <p><strong>Refund policy (draft, pending officer approval):</strong></p>
      <ul>{draftCancellationPolicy.map((l) => <li key={l}>{l}</li>)}</ul>
      <label htmlFor={`reason-${row.id}`}>Reason (optional)</label>
      <textarea id={`reason-${row.id}`} rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
      {state.error && <p role="alert" className="field-error">{state.error}</p>}
      <div className="editor-actions">
        <button type="button" className="btn btn-dark" disabled={state.busy} onClick={() => void confirm()}>Yes, cancel</button>
        <button type="button" className="btn" disabled={state.busy} onClick={() => setOpen(false)}>Keep my slot</button>
      </div>
    </div>
  );
}

function Card({ row, onChange }: { row: MyClimb; onChange: () => void }) {
  const climb = useClimb(row.climbId);
  const balance = Math.max(row.total - row.paid, 0);
  return (
    <li className="my-climb">
      <h2><Link to={`/climbs/${row.climbId}`}>{row.title}</Link></h2>
      <p className="climb-muted">{[row.date, row.statusLabel, row.paymentLabel].filter(Boolean).join(' · ')}</p>
      <p>Total {peso(row.total)}{row.tba ? ' + TBA' : ''} · Paid {peso(row.paid)} · <strong>Balance {peso(balance)}{row.tba ? ' + TBA' : ''}</strong></p>
      {climb && canCancel(row, climb.over) && <Cancel row={row} onDone={onChange} />}
    </li>
  );
}

function List({ uid }: { uid: string }) {
  const [rows, setRows] = useState<MyClimb[] | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    myRegistrations(uid).then(setRows, (e: Error) => setError(`Couldn’t load your climbs: ${e.message}`));
  }, [uid]);
  useEffect(load, [load]);
  if (error) return <p role="alert">{error}</p>;
  if (!rows) return <p role="status">Loading your climbs…</p>;
  if (!rows.length) return <><p>No registrations yet.</p><Link className="btn btn-primary" to="/activities/open-climbs">Find a climb</Link></>;
  return <ul className="my-climbs">{rows.map((r) => <Card key={r.id} row={r} onChange={load} />)}</ul>;
}

function Body() {
  const state = useAccount();
  if (!registrationEnabled) return <p>My Climbs opens here together with climb registration. Until then, use the Open Climbs app you registered with.</p>;
  if (state.status === 'loading') return <p role="status">Checking your sign-in…</p>;
  if (state.status === 'signedIn') return <List uid={state.account.uid} />;
  if (state.status === 'error') return <p role="alert">Couldn’t check your sign-in: {state.error}</p>;
  return <><p>Sign in to see your climbs.</p><SignInForm /></>;
}

export default function MyClimbsPage() {
  return (
    <>
      <PageHero eyebrow="Account" title="My Climbs" intro="Your registrations, what you owe, and cancellations." image="/images/page-open-climbs.webp" />
      <main><section className="section page-section"><div className="shell register-shell"><Body /></div></section></main>
    </>
  );
}
