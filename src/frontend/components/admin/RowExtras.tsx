import { useState } from 'react';
import { refundedTotal } from '../../data/adminRegistrations';
import { recordRefund, setNoShow } from '../../services/adminRegistrations';
import { linkWalkIn } from '../../services/users';
import type { RowProps } from './rowProps';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

function Refund({ reg, admin, run, busy }: RowProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  if (!open) return <button type="button" className="chip" disabled={busy} onClick={() => setOpen(true)}>Record refund</button>;
  const n = Number(amount.replace(/[^0-9.]/g, ''));
  return (
    <span className="admin-refund">
      <label className="sr-only" htmlFor={`ref-${reg.id}`}>Refund amount for {reg.name}</label>
      <input id={`ref-${reg.id}`} inputMode="decimal" placeholder="₱" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <label className="sr-only" htmlFor={`refn-${reg.id}`}>Refund note for {reg.name}</label>
      <input id={`refn-${reg.id}`} placeholder="Note (GCash ref…)" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      <button type="button" className="chip" disabled={busy || !Number.isFinite(n) || n <= 0} onClick={() => { run(() => recordRefund(reg, n, note, admin.email)); setOpen(false); }}>Save refund</button>
    </span>
  );
}

function LinkWalkIn({ reg, run, busy }: RowProps) {
  const [email, setEmail] = useState('');
  return (
    <span className="admin-refund">
      <label className="sr-only" htmlFor={`link-${reg.id}`}>Account email to link {reg.name}</label>
      <input id={`link-${reg.id}`} type="email" placeholder="Their account email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="button" className="chip" disabled={busy || !email.includes('@')} onClick={() => run(() => linkWalkIn(reg.id, email, `${reg.name} · ${reg.title}`))}>Link to account</button>
    </span>
  );
}

// #153: refunds (kept apart from member payments) and no-shows (a flag; status stays confirmed).
export default function RowExtras(props: RowProps) {
  const { reg, admin, run, busy } = props;
  const refunded = refundedTotal(reg);
  return (
    <div className="admin-extras">
      {refunded > 0 && <small>Refunded {peso(refunded)} · </small>}
      <Refund {...props} />
      {reg.raw.addedByAdmin === true && !reg.raw.userId && <LinkWalkIn {...props} />}
      {reg.status === 'confirmed' && (
        <label className="consent-check">
          <input type="checkbox" checked={reg.raw.noShow === true} disabled={busy} onChange={(e) => run(() => setNoShow(reg, e.target.checked, admin.email))} /> No-show
        </label>
      )}
    </div>
  );
}
