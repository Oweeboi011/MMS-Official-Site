import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { MyClimb } from '../data/myClimbs';
import { waiverSections } from '../data/waiver';
import { myRegistration } from '../services/registrations';
import { useAccount } from '../services/useAccount';

const signedOn = new Intl.DateTimeFormat('en-PH', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Manila' });

function Waiver({ row }: { row: MyClimb }) {
  const waiver = row.waiver;
  if (!waiver) return <p>This registration has no signed waiver.</p>;
  const activity = [row.title, row.date, waiver.location].filter(Boolean).join(' · ');
  return (
    <article className="waiver-print">
      <h1>Waiver and Release of Liability</h1>
      <p className="climb-muted">Metropolitan Mountaineering Society · Open Climbs</p>
      {waiverSections(activity).map((s) => <section key={s.heading}><h4>{s.heading}</h4><p>{s.body}</p></section>)}
      <div className="waiver-signature">
        <p>Signed electronically by <strong>{waiver.name}</strong>{waiver.signedAt ? ` on ${signedOn.format(new Date(waiver.signedAt))}` : ''}.</p>
        <p className="climb-muted">Registration {row.id}</p>
      </div>
      <p className="no-print"><button type="button" className="btn btn-primary" onClick={() => window.print()}>Print or save as PDF</button> <Link className="btn" to="/account/climbs">My Climbs</Link></p>
    </article>
  );
}

function Load({ regId }: { regId: string }) {
  const [row, setRow] = useState<MyClimb | null | undefined>(undefined);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    myRegistration(regId).then((r) => { if (live) setRow(r); }, (e: Error) => { if (live) setError(e.message); });
    return () => { live = false; };
  }, [regId]);
  if (error) return <p role="alert">Couldn’t load the waiver: {error}</p>;
  if (row === undefined) return <p role="status">Loading…</p>;
  return row ? <Waiver row={row} /> : <p>Registration not found.</p>;
}

// #141: the waiver a member signed by typing their name, printable for the jump-off.
export default function WaiverPrintPage() {
  const { regId = '' } = useParams();
  const state = useAccount();
  let body = <p role="status">Checking your sign-in…</p>;
  if (state.status === 'signedIn') body = <Load regId={regId} />;
  else if (state.status !== 'loading') body = <p>Sign in on <Link to="/account/climbs">My Climbs</Link> to see your waiver.</p>;
  return <main><section className="section page-section"><div className="shell register-shell">{body}</div></section></main>;
}
