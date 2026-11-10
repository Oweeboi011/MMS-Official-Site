import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import RegistrationTable, { AdminGate } from '../components/admin/RegistrationTable';
import { useAdminList } from '../components/admin/useAdminList';
import { REG_STATUSES, matches, toCsv } from '../data/adminRegistrations';
import { downloadCsv } from '../lib/download';
import type { Account } from '../services/auth';
import { recentRegistrations } from '../services/adminRegistrations';

function Search({ admin }: { admin: Account }) {
  const { rows, message, busy, run } = useAdminList(recentRegistrations);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  if (!rows) return <p role="status">{message || 'Loading registrations…'}</p>;
  const shown = rows.filter((r) => matches(r, text, status));
  return (
    <>
      <div className="admin-filters">
        <label htmlFor="reg-search">Search name, email, mobile or climb</label>
        <input id="reg-search" type="search" value={text} onChange={(e) => setText(e.target.value)} />
        <label htmlFor="reg-status">Status</label>
        <select id="reg-status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {REG_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button type="button" className="btn" disabled={!shown.length} onClick={() => downloadCsv('registrations', toCsv(shown))}>Download CSV ({shown.length})</button>
      </div>
      <p className="climb-muted">Newest {rows.length} registrations across all climbs.</p>
      {message && <p role="status">{message}</p>}
      <RegistrationTable regs={shown} admin={admin} run={run} busy={busy} showClimb />
    </>
  );
}

// #154: all registrations, search + filter + CSV (old app AllRegistrations).
export default function AdminRegistrationsPage() {
  return (
    <>
      <PageHero compact eyebrow="Admin" title="All registrations" intro="Find anyone across every climb." image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell">
        <AdminGate>{(admin) => <Search admin={admin} />}</AdminGate>
        <p><Link to="/admin">Back to admin</Link></p>
      </div></section></main>
    </>
  );
}
