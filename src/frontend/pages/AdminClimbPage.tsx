import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { REG_STATUSES, summary, toCsv, type AdminReg } from '../data/adminRegistrations';
import type { Account } from '../services/auth';
import { climbRegistrations, reviewRegistrationPayment, setRegistrationStatus } from '../services/adminRegistrations';
import { useAccount } from '../services/useAccount';
import { useClimb } from '../services/useClimb';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

function download(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/[^\w-]+/g, '_') || 'registrants'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface RowProps { reg: AdminReg; admin: Account; run: (action: () => Promise<void>) => void; busy: boolean }

function Payments({ reg, admin, run, busy }: RowProps) {
  if (!reg.payments.length) return <span className="climb-muted">No payment yet</span>;
  const reviewer = { name: admin.email, uid: admin.uid };
  return (
    <ul className="admin-payments">
      {reg.payments.map((p, i) => (
        <li key={i /* payment history has no ids; position is its identity */}>
          {peso(p.amount)} · {p.status}{p.note && ` · ${p.note}`}
          {p.proofs.map((r, j) => <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"> receipt {j + 1}</a>)}
          {p.status === 'submitted' && (
            <>
              {' '}<button type="button" className="chip" disabled={busy} onClick={() => run(() => reviewRegistrationPayment(reg, i, 'verified', reviewer))}>Verify</button>
              {' '}<button type="button" className="chip" disabled={busy} onClick={() => run(() => reviewRegistrationPayment(reg, i, 'rejected', reviewer))}>Reject</button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function Row(props: RowProps) {
  const { reg, run, busy } = props;
  return (
    <tr>
      <td><strong>{reg.name}</strong><br /><small>{reg.memberType} · {reg.email} · {reg.mobile}</small></td>
      <td>
        <label className="sr-only" htmlFor={`st-${reg.id}`}>Status for {reg.name}</label>
        <select id={`st-${reg.id}`} value={reg.status} disabled={busy} onChange={(e) => run(() => setRegistrationStatus(reg.id, e.target.value))}>
          {REG_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </td>
      <td>{peso(reg.paid)} of {peso(reg.total)}{reg.tba ? ' + TBA' : ''}<Payments {...props} /></td>
      <td>{reg.uploaded.length ? `${reg.uploaded.length} doc(s)` : '—'}{reg.waiver && <><br /><small>Waiver: {reg.waiver.name}</small></>}</td>
    </tr>
  );
}

function Registrations({ climbId, title, admin }: { climbId: string; title: string; admin: Account }) {
  const [regs, setRegs] = useState<AdminReg[] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => climbRegistrations(climbId).then(setRegs, (e: Error) => setMessage(`Couldn’t load registrations: ${e.message}`)), [climbId]);
  useEffect(() => { void load(); }, [load]);
  const run = (action: () => Promise<void>) => {
    setBusy(true);
    action().then(() => { setMessage('Saved.'); return load(); }, (e: Error) => setMessage(`Not saved: ${e.message}`)).finally(() => setBusy(false));
  };
  if (!regs) return <p role="status">{message || 'Loading registrations…'}</p>;
  const s = summary(regs);
  return (
    <>
      <p>{s.confirmed} confirmed · {s.pending} pending · {s.waitlisted} waitlisted · {s.cancelled} cancelled · <strong>{s.toReview} payment(s) to review</strong> · {peso(s.collected)} recorded</p>
      <p><button type="button" className="btn" disabled={!regs.length} onClick={() => download(title, toCsv(regs))}>Download CSV (LGU / jump-off)</button></p>
      {message && <p role="status">{message}</p>}
      {regs.length ? (
        <div className="admin-table">
          <table>
            <thead><tr><th scope="col">Registrant</th><th scope="col">Status</th><th scope="col">Payments</th><th scope="col">Documents</th></tr></thead>
            <tbody>{regs.map((r) => <Row key={r.id} reg={r} admin={admin} run={run} busy={busy} />)}</tbody>
          </table>
        </div>
      ) : <p>No registrations yet.</p>}
    </>
  );
}

// /admin/climbs/:id — UI guard only; the rules let admins (and nobody else) read every registration.
export default function AdminClimbPage() {
  const { id = '' } = useParams();
  const climb = useClimb(id);
  const state = useAccount();
  let body;
  if (state.status === 'signedIn' && state.account.role === 'admin') body = <Registrations climbId={id} title={climb?.title ?? id} admin={state.account} />;
  else if (state.status === 'loading') body = <p role="status">Checking your sign-in…</p>;
  else body = <p>Admins only. <Link to="/admin">Sign in on the admin page</Link>.</p>;
  return (
    <>
      <PageHero eyebrow="Admin · Registrations" title={climb?.title ?? 'Climb'} intro={climb ? [climb.dates, climb.location].filter(Boolean).join(' · ') : ''} image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell">{body}<p><Link to="/admin">Back to admin</Link></p></div></section></main>
    </>
  );
}
