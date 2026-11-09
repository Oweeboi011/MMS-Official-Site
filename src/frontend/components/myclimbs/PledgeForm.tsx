import { useState, type FormEvent } from 'react';
import { toPledge, type Drive, type Pledge } from '../../data/donations';
import type { MyClimb } from '../../data/myClimbs';
import { setMyPledge } from '../../services/registrations';

function describe(p: Pledge): string {
  const when = p.payWithFees ? '(with your fees)' : '(on climb day)';
  const cash = p.cashPledge ? `₱${p.cashPledge.toLocaleString('en-PH')} ${when}` : '';
  return [cash, p.inKind].filter(Boolean).join(' · ');
}

function Editor({ row, drive, onClose, onDone }: { row: MyClimb; drive: Drive; onClose: () => void; onDone: () => void }) {
  const p = row.pledge;
  const [cash, setCash] = useState(p?.cashPledge ? String(p.cashPledge) : '');
  const [inKind, setInKind] = useState(p?.inKind ?? '');
  const [withFees, setWithFees] = useState(p ? p.payWithFees : true);
  const [state, setState] = useState({ busy: false, message: '' });
  const save = async (e: FormEvent, next: Pledge | null) => {
    e.preventDefault();
    setState({ busy: true, message: '' });
    try {
      await setMyPledge(row.id, next);
      onClose();
      onDone();
    } catch (err) {
      setState({ busy: false, message: `Not saved: ${(err as Error).message}` });
    }
  };
  return (
    <form className="pay-form" onSubmit={(e) => void save(e, toPledge(cash, inKind, withFees))} noValidate>
      <h3>Donation pledge{drive.beneficiary && ` for ${drive.beneficiary}`}</h3>
      {drive.items.length > 0 && <p className="climb-muted">Needed: {drive.items.join(', ')}</p>}
      <label htmlFor={`cash-${row.id}`}>Cash (₱, optional)</label>
      <input id={`cash-${row.id}`} inputMode="decimal" value={cash} onChange={(e) => setCash(e.target.value)} />
      <label className="consent-check"><input type="checkbox" checked={withFees} onChange={(e) => setWithFees(e.target.checked)} /> Send the cash with my GCash payment (added to my balance)</label>
      <label htmlFor={`kind-${row.id}`}>Items I’ll bring (optional)</label>
      <input id={`kind-${row.id}`} maxLength={500} value={inKind} onChange={(e) => setInKind(e.target.value)} />
      {state.message && <p role="alert" className="field-error">{state.message}</p>}
      <div className="editor-actions">
        <button type="submit" className="btn btn-primary" disabled={state.busy}>Save pledge</button>
        {p && <button type="button" className="btn" disabled={state.busy} onClick={(e) => void save(e, null)}>Withdraw pledge</button>}
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

// #144: pledge cash and/or items to the climb's outreach drive; change or withdraw any time before the climb.
export default function PledgeForm({ row, drive, onDone }: { row: MyClimb; drive: Drive; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  if (open) return <Editor row={row} drive={drive} onClose={() => setOpen(false)} onDone={onDone} />;
  const lead = row.pledge ? `Your pledge: ${describe(row.pledge)}. ` : `Outreach drive for ${drive.beneficiary || 'the community'}. `;
  return <p>{lead}<button type="button" className="btn" onClick={() => setOpen(true)}>{row.pledge ? 'Change pledge' : 'Pledge a donation'}</button></p>;
}
