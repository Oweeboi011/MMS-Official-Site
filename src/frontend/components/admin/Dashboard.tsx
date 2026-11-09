import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { upcomingDashboard, type DashboardRow } from '../../services/dashboard';

// #151: what needs attention on upcoming climbs: slots, confirmations, payments to review.
export default function Dashboard() {
  const [rows, setRows] = useState<DashboardRow[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    upcomingDashboard().then((r) => { if (live) setRows(r); }, (e: Error) => { if (live) setError(e.message); });
    return () => { live = false; };
  }, []);
  if (error) return <p role="alert">Couldn’t load the dashboard: {error}</p>;
  if (!rows) return <p role="status">Loading upcoming climbs…</p>;
  if (!rows.length) return <p>No upcoming climbs. Add one in Climbs below.</p>;
  return (
    <div className="admin-table">
      <table>
        <caption className="sr-only">Upcoming climbs</caption>
        <thead><tr><th scope="col">Climb</th><th scope="col">Status</th><th scope="col">Slots</th><th scope="col">Confirmed</th><th scope="col">Pending</th><th scope="col">Waitlist</th><th scope="col">Payments to review</th></tr></thead>
        <tbody>
          {rows.map(({ climb, status, confirmed, pending, waitlisted, toReview }) => (
            <tr key={climb.id}>
              <td><Link to={`/admin/climbs/${climb.id}`}>{climb.title || 'Untitled'}</Link><br /><small>{[climb.dates, climb.type].filter(Boolean).join(' · ')}</small></td>
              <td>{status}</td>
              <td>{climb.slotsLeft === undefined ? '—' : `${climb.slotsLeft} left`}</td>
              <td>{confirmed}</td>
              <td>{pending}</td>
              <td>{waitlisted}</td>
              <td>{toReview ? <strong>{toReview}</strong> : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
