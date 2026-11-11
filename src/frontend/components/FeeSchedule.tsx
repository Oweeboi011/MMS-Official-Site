import type { ClimbDetail } from '../data/climbDetail';
import { feeModel, pesoLabel } from '../data/feeModel';

function FeeList({ items }: { items: ClimbDetail['feeItems'] }) {
  return (
    <ul className="fee-lines">
      {items.map((f) => <li key={f.label + f.amount}><span>{f.label}{f.note && <small>{f.note}</small>}</span><b>{pesoLabel(f.amount)}</b></li>)}
    </ul>
  );
}

// A climb's fee schedule (old app ClimbFeeBreakdown): required fees with their total, optional extras and the guest fee apart.
export default function FeeSchedule({ items }: { items: ClimbDetail['feeItems'] }) {
  const { required, optional, guest, total, hasTba, hasAmount } = feeModel(items);
  if (!items.length) return <p className="climb-muted">No fees set for this climb.</p>;
  return (
    <>
      {required.length > 0 && <FeeList items={required} />}
      {hasAmount && <p className="fee-total"><span>Member total{hasTba && <small> (excl. TBA items)</small>}</span><strong>{pesoLabel(String(total))}</strong></p>}
      {optional.length > 0 && <><h3 className="fee-group">Optional, only if availed</h3><FeeList items={optional} /></>}
      {guest && <p className="fee-guest">+ {pesoLabel(guest.amount)} {guest.label} for non-members</p>}
    </>
  );
}
