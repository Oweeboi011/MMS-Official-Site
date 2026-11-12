import type { ClimbDetail } from '../data/climbDetail';
import DataTable from './DataTable';
import { feeModel, pesoLabel } from '../data/feeModel';

function FeeList({ items, caption }: { items: ClimbDetail['feeItems']; caption: string }) {
  return (
    <DataTable caption={caption} head={['Fee', 'Amount']}>
      {items.map((f) => <tr key={f.label + f.amount}><th scope="row">{f.label}{f.note && <small className="cell-note">{f.note}</small>}</th><td className="num">{pesoLabel(f.amount)}</td></tr>)}
    </DataTable>
  );
}

// A climb's fee schedule (old app ClimbFeeBreakdown): required fees with their total, optional extras and the guest fee apart.
export default function FeeSchedule({ items }: { items: ClimbDetail['feeItems'] }) {
  const { required, optional, guest, total, hasTba, hasAmount } = feeModel(items);
  if (!items.length) return <p className="climb-muted">No fees set for this climb.</p>;
  return (
    <>
      {required.length > 0 && <FeeList items={required} caption="Required fees" />}
      {hasAmount && <p className="fee-total"><span>Member total{hasTba && <small> (excl. TBA items)</small>}</span><strong>{pesoLabel(String(total))}</strong></p>}
      {optional.length > 0 && <><h3 className="fee-group">Optional, only if availed</h3><FeeList items={optional} caption="Optional fees" /></>}
      {guest && <p className="fee-guest">+ {pesoLabel(guest.amount)} {guest.label} for non-members</p>}
    </>
  );
}
