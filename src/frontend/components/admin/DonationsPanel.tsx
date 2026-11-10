import type { AdminReg } from '../../data/adminRegistrations';
import { donationTotals, type Drive } from '../../data/donations';
import AdminStats from './AdminStats';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

function cashLabel(cash: number, withFees: boolean): string {
  if (!cash) return '—';
  return withFees ? `${peso(cash)} (with fees)` : peso(cash);
}

// Outreach drive for one climb: who pledged what. Cash is for the beneficiary, kept apart from climb fees (old app ClimbDonations).
export default function DonationsPanel({ drive, regs }: { drive: Drive | null | undefined; regs: AdminReg[] }) {
  const t = donationTotals(regs);
  if (!drive && !t.donors) return null;
  return (
    <details className="register-section" open={t.donors > 0}>
      <summary><strong>Donations</strong>{drive?.beneficiary ? ` for ${drive.beneficiary}` : ''} · {t.donors} pledge{t.donors === 1 ? '' : 's'}</summary>
      <AdminStats items={[['Cash pledged', peso(t.cash)], ['Sent with fees', peso(t.withFees)], ['Pledges', String(t.donors)]]} />
      {drive?.items.length ? <p className="climb-muted">Needed: {drive.items.join(', ')}.</p> : null}
      {t.rows.length ? (
        <div className="admin-table"><table>
          <thead><tr><th scope="col">Registrant</th><th scope="col">Cash</th><th scope="col">Items</th></tr></thead>
          <tbody>{t.rows.map((r, i) => <tr key={`${r.name}-${i}`}><td>{r.name}</td><td>{cashLabel(r.cash, r.withFees)}</td><td>{r.inKind || '—'}</td></tr>)}</tbody>
        </table></div>
      ) : <p className="climb-muted">No pledges yet.</p>}
    </details>
  );
}
