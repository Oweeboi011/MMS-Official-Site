import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { AdminGate } from '../components/admin/RegistrationTable';
import { useAdminList } from '../components/admin/useAdminList';
import { recentAudit } from '../services/auditLog';

const when = (ms: number) => (ms ? new Date(ms).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }) : '');

function Log() {
  const { rows, message } = useAdminList(recentAudit);
  if (!rows) return <p role="status">{message || 'Loading…'}</p>;
  if (!rows.length) return <p>Nothing logged yet.</p>;
  return (
    <div className="admin-table">
      <table>
        <caption className="sr-only">Admin actions, newest first</caption>
        <thead><tr><th scope="col">When</th><th scope="col">Who</th><th scope="col">Action</th><th scope="col">On</th></tr></thead>
        <tbody>
          {rows.map((e) => {
            const target = e.targetType === 'climb' ? <Link to={`/admin/climbs/${e.targetId}`}>{e.targetLabel || 'climb'}</Link> : (e.targetLabel || e.targetId);
            return <tr key={e.id}><td>{when(e.createdAt)}</td><td>{e.actorName}</td><td>{e.action}{e.details && ` · ${e.details}`}</td><td>{target}</td></tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

// #163: who changed statuses, verified payments, added walk-ins, edited notes or meetings (append-only by rules).
export default function AdminAuditPage() {
  return (
    <>
      <PageHero eyebrow="Admin" title="Audit log" intro="Sensitive admin actions, newest first. Entries can’t be edited or deleted." image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell">
        <AdminGate>{() => <Log />}</AdminGate>
        <p><Link to="/admin">Back to admin</Link></p>
      </div></section></main>
    </>
  );
}
