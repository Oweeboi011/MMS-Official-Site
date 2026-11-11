import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { AdminGate } from '../components/admin/RegistrationTable';
import { useAdminList } from '../components/admin/useAdminList';
import { treasury } from '../data/treasury';
import { recentRegistrations } from '../services/adminRegistrations';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

function Summary() {
  const { rows, message } = useAdminList(recentRegistrations);
  if (!rows) return <p role="status">{message || 'Loading…'}</p>;
  const climbs = treasury(rows);
  if (!climbs.length) return <p>No registrations yet.</p>;
  return (
    <div className="admin-table">
      <table>
        <caption className="sr-only">Money per climb</caption>
        <thead><tr><th scope="col">Climb</th><th scope="col">People</th><th scope="col">Expected</th><th scope="col">Verified</th><th scope="col">In review</th><th scope="col">Outstanding</th><th scope="col">Optional services</th></tr></thead>
        <tbody>
          {climbs.map((c) => (
            <tr key={c.climbId}>
              <td><Link to={`/admin/climbs/${c.climbId}`}>{c.title}</Link><br /><small>{c.date}</small></td>
              <td>{c.people}</td>
              <td>{peso(c.expected)}{c.tba ? ' + TBA' : ''}</td>
              <td>{peso(c.verified)}</td>
              <td>{peso(c.inReview)}</td>
              <td><strong>{peso(c.outstanding)}</strong></td>
              <td>{c.services.map(([label, n]) => `${label}: ${n}`).join(' · ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// #155 / #82: for the treasurer. Newest 300 registrations, grouped by climb.
export default function AdminTreasurerPage() {
  return (
    <>
      <PageHero compact crumb={{ to: '/admin', label: 'Admin' }} eyebrow="Admin" title="Treasurer summary" intro="Expected, verified and outstanding money per climb, and who chose each optional service." image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell">
        <AdminGate>{() => <Summary />}</AdminGate>
        <p className="climb-muted">Donation pledges sent with fees are included in Expected; they belong to the drive’s beneficiary, not the club.</p>
        
      </div></section></main>
    </>
  );
}
