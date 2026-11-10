import { useState } from 'react';
import type { MyClimb } from '../data/myClimbs';
import { pesoLabel } from '../data/feeModel';
import Modal from './Modal';

const STATUS: Record<string, string> = { submitted: 'Awaiting review', verified: 'Verified', rejected: 'Rejected', unpaid: 'Not paid yet' };
const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;
const day = (ms: number) => (ms ? new Date(ms).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }) : '—');

// The Official Receipt: what was owed, what was accepted, every instalment behind it. The same document for the member
// (My Climbs) and the officer (registrations), as in the old app.
function Receipt({ row, status }: { row: MyClimb; status: string }) {
  const accepted = row.payments.filter((p) => p.status !== 'rejected').reduce((t, p) => t + p.amount, 0);
  const balance = Math.max(row.total - Math.max(row.paid, accepted) + row.refunded, 0);
  return (
    <div className="receipt">
      <p className="receipt-meta"><span className={`status-chip is-${status}`}>{STATUS[status] ?? status}</span> <small>OR-{row.id.slice(-8).toUpperCase()}</small></p>
      <dl className="receipt-grid">
        <div><dt>Climb</dt><dd>{row.title}</dd></div>
        <div><dt>Participant</dt><dd>{row.name || '—'}</dd></div>
      </dl>
      {row.fees.length > 0 && (
        <table className="receipt-fees">
          <caption>Fee breakdown</caption>
          <tbody>{row.fees.map((f) => <tr key={f.label}><td>{f.label}</td><td>{pesoLabel(f.amount)}</td></tr>)}</tbody>
          <tfoot><tr><th scope="row">Total</th><td>{peso(row.total)}{row.tba ? ' + TBA' : ''}</td></tr></tfoot>
        </table>
      )}
      <dl className="receipt-grid">
        <div><dt>Amount paid</dt><dd>{peso(row.paid)}</dd></div>
        {row.refunded > 0 && <div><dt>Refunded</dt><dd>{peso(row.refunded)}</dd></div>}
        <div><dt>Balance</dt><dd className={balance > 0 ? 'is-owed' : 'is-settled'}>{balance > 0 ? peso(balance) : 'Fully settled'}{row.tba && balance === 0 ? ' (+ TBA)' : ''}</dd></div>
        <div><dt>Confirmed on</dt><dd>{status === 'verified' ? day(row.verifiedAt) : '—'}</dd></div>
      </dl>
      {row.payments.length > 0 && (
        <>
          <h3 className="fee-group">Payments</h3>
          <ul className="plain-list">
            {row.payments.map((p, i) => <li key={i /* instalments have no ids; order is identity */}>{peso(p.amount)} · {STATUS[p.status] ?? p.status}{p.note && ` · ${p.note}`}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

function ReceiptModal({ row, onClose }: { row: MyClimb; onClose: () => void }) {
  return <Modal title="Official Receipt" onClose={onClose}><Receipt row={row} status={row.paymentStatus} /></Modal>;
}

// A "View receipt" button that opens the modal; shown where a registration has anything to show.
export default function ReceiptButton({ row }: { row: MyClimb }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="chip" onClick={() => setOpen(true)}>View receipt</button>
      {open && <ReceiptModal row={row} onClose={() => setOpen(false)} />}
    </>
  );
}
