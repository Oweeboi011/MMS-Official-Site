import { useState } from 'react';
import { Link } from 'react-router-dom';
import { REG_STATUSES, type AdminReg } from '../../data/adminRegistrations';
import type { Account } from '../../services/auth';
import { reviewRegistrationPayment, setAdminNotes, setRegistrationStatus } from '../../services/adminRegistrations';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

export interface RowProps { reg: AdminReg; admin: Account; run: (action: () => Promise<void>) => void; busy: boolean; showClimb?: boolean }

function Payments({ reg, admin, run, busy }: RowProps) {
  if (!reg.payments.length) return <span className="climb-muted"> · no payment yet</span>;
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

function Notes({ reg, run, busy }: RowProps) {
  const [text, setText] = useState(reg.notes);
  return (
    <div className="admin-notes">
      <label className="sr-only" htmlFor={`notes-${reg.id}`}>Notes on {reg.name}</label>
      <textarea id={`notes-${reg.id}`} rows={2} maxLength={2000} placeholder="Officer notes" value={text} onChange={(e) => setText(e.target.value)} />
      {text !== reg.notes && <button type="button" className="chip" disabled={busy} onClick={() => run(() => setAdminNotes(reg.id, text, `${reg.name} · ${reg.title}`))}>Save notes</button>}
    </div>
  );
}

// One registrant: status, payments (verify / reject), documents, notes. Shared by a climb's list and the all-registrations search.
export default function RegistrationRow(props: RowProps) {
  const { reg, run, busy, showClimb } = props;
  return (
    <tr>
      <td>
        <strong>{reg.name}</strong>{reg.raw.addedByAdmin === true && <small> (walk-in)</small>}<br />
        <small>{[reg.memberType, reg.email, reg.mobile].filter(Boolean).join(' · ')}</small>
        {showClimb && <><br /><small><Link to={`/admin/climbs/${reg.climbId}`}>{reg.title}</Link> {reg.date}</small></>}
      </td>
      <td>
        <label className="sr-only" htmlFor={`st-${reg.id}`}>Status for {reg.name}</label>
        <select id={`st-${reg.id}`} value={reg.status} disabled={busy} onChange={(e) => run(() => setRegistrationStatus(reg.id, e.target.value, `${reg.name} · ${reg.title}`))}>
          {REG_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </td>
      <td>{peso(reg.paid)} of {peso(reg.total)}{reg.tba ? ' + TBA' : ''}<Payments {...props} /></td>
      <td>{reg.uploaded.length ? `${reg.uploaded.length} doc(s)` : '—'}{reg.waiver && <><br /><small>Waiver: {reg.waiver.name}</small></>}<Notes {...props} /></td>
    </tr>
  );
}
