import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AdminReg } from '../../data/adminRegistrations';
import { PAST_GROUPS, groupByStatus, type DashboardData, type DashboardRow } from '../../data/dashboardModel';
import { loadDashboard } from '../../services/dashboard';
import AdminStats from './AdminStats';

function ClimbTable({ rows }: { rows: DashboardRow[] }) {
  return (
    <div className="admin-table">
      <table>
        <thead><tr><th scope="col">Climb</th><th scope="col">Date</th><th scope="col">Slots</th><th scope="col" title="Confirmed · Pending · Unpaid">Reg. (C · P · U)</th><th scope="col">To review</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>
          {rows.map(({ climb, confirmed, pending, waitlisted, unpaid, toReview, fee }) => (
            <tr key={climb.id}>
              <td><Link to={`/admin/climbs/${climb.id}`}>{climb.title || 'Untitled'}</Link><br /><small>{[climb.type, climb.location].filter(Boolean).join(' · ')} · {fee}</small></td>
              <td>{climb.dates || '—'}</td>
              <td>{climb.slotsLeft === undefined ? '—' : `${climb.slotsLeft} left`}</td>
              <td>{confirmed} · {pending} · {unpaid}{waitlisted > 0 && <small> (+{waitlisted} waitlisted)</small>}</td>
              <td>{toReview ? <strong>{toReview}</strong> : 0}</td>
              <td className="row-links"><Link to={`/admin/climbs/${climb.id}`}>Registrations</Link> <Link to={`/climbs/${climb.id}`}>View page</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Recent({ regs }: { regs: AdminReg[] }) {
  if (!regs.length) return null;
  return (
    <>
      <h3 className="admin-subhead">Recent registrations</h3>
      <div className="admin-table">
        <table>
          <thead><tr><th scope="col">Participant</th><th scope="col">Climb</th><th scope="col">Status</th><th scope="col">Payment</th><th scope="col">Registered</th></tr></thead>
          <tbody>
            {regs.map((r) => (
              <tr key={r.id}>
                <td>{r.name}<br /><small>{r.memberType}</small></td>
                <td><Link to={`/admin/climbs/${r.climbId}`}>{r.title}</Link></td>
                <td><span className={`status-chip is-${r.status}`}>{r.statusLabel}</span></td>
                <td>{r.paymentLabel}</td>
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-PH', { dateStyle: 'medium', timeZone: 'Asia/Manila' }) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p><Link to="/admin/registrations">See all registrations</Link></p>
    </>
  );
}

// #151: what needs attention: headline totals, every climb by status with its counts, and the newest registrations.
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    loadDashboard().then((r) => { if (live) setData(r); }, (e: Error) => { if (live) setError(e.message); });
    return () => { live = false; };
  }, []);
  if (error) return <p role="alert">Couldn’t load the dashboard: {error}</p>;
  if (!data) return <p role="status">Loading climbs…</p>;
  const { totals, rows, recent } = data;
  return (
    <>
      <AdminStats items={[
        ['Climbs', String(totals.climbs)],
        ['Registrations', String(totals.registrations), false, '/admin/registrations'],
        ['Awaiting payment review', String(totals.toReview), totals.toReview > 0, '/admin/registrations?payment=submitted'],
        ['Unpaid registrations', String(totals.unpaid), false, '/admin/registrations?payment=unpaid'],
        ['Pending confirmation', String(totals.pending), false, '/admin/registrations?status=pending'],
      ]} />
      {!rows.length && <p>No climbs yet. Add one in Climbs below.</p>}
      {groupByStatus(rows).map((g) => (PAST_GROUPS.includes(g.status)
        ? <details key={g.status} className="register-section"><summary><strong>{g.label}</strong> ({g.rows.length})</summary><ClimbTable rows={g.rows} /></details>
        : <section key={g.status}><h3 className="admin-subhead">{g.label} ({g.rows.length})</h3><ClimbTable rows={g.rows} /></section>))}
      <Recent regs={recent} />
    </>
  );
}
