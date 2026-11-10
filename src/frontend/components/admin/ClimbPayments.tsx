import type { ClimbDetail } from '../../data/climbDetail';
import type { AdminReg } from '../../data/adminRegistrations';
import { pesoLabel } from '../../data/feeModel';
import FeeSchedule from '../FeeSchedule';
import GcashButton from '../GcashModal';
import AdminStats from './AdminStats';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

// Who still owes money on this climb: active registrations with a balance, biggest first (old app BalanceDueTable).
function balancesDue(regs: AdminReg[]) {
  return regs
    .filter((r) => r.status !== 'cancelled')
    .map((r) => ({ reg: r, balance: Math.max(r.total - r.paid, 0) }))
    .filter((b) => b.balance > 0 || b.reg.tba)
    .sort((a, b) => b.balance - a.balance);
}

// The payments side of one climb: what it costs, where to pay, what has come in and who still owes (old app climb card).
export default function ClimbPayments({ climb, regs }: { climb: ClimbDetail | null | undefined; regs: AdminReg[] }) {
  const live = regs.filter((r) => r.status !== 'cancelled');
  const expected = live.reduce((t, r) => t + r.total, 0);
  const collected = live.reduce((t, r) => t + r.paid, 0);
  const due = balancesDue(regs);
  return (
    <details className="register-section climb-payments" open>
      <summary><strong>Payments and fees</strong> · {peso(collected)} of {peso(expected)} collected</summary>
      <AdminStats items={[['Expected', peso(expected)], ['Collected', peso(collected)], ['Still owed', peso(Math.max(expected - collected, 0)), expected > collected], ['Registrants owing', String(due.length)]]} />
      <div className="panel-grid">
        <section className="panel">
          <h3>Fee schedule</h3>
          {climb ? <FeeSchedule items={climb.feeItems} /> : <p className="climb-muted">Loading…</p>}
        </section>
        <section className="panel">
          <h3>GCash details</h3>
          {climb?.payTo ? (
            <>
              <p>{[climb.payTo.name, climb.payTo.number].filter(Boolean).join(' · ') || 'QR code only'}</p>
              <GcashButton payTo={climb.payTo} />
            </>
          ) : <p className="climb-muted">No GCash details set for this climb.</p>}
        </section>
      </div>
      <section className="panel">
        <h3>Balances due</h3>
        {due.length === 0 ? <p className="climb-muted">Everyone is settled.</p> : (
          <div className="admin-table"><table>
            <thead><tr><th scope="col">Registrant</th><th scope="col">Status</th><th scope="col">Paid</th><th scope="col">Total</th><th scope="col">Balance</th></tr></thead>
            <tbody>{due.map(({ reg, balance }) => (
              <tr key={reg.id}><td>{reg.name}</td><td><span className={`status-chip is-${reg.status}`}>{reg.status}</span></td><td>{peso(reg.paid)}</td><td>{peso(reg.total)}{reg.tba ? ' + TBA' : ''}</td><td><strong>{pesoLabel(String(balance))}</strong></td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </details>
  );
}
