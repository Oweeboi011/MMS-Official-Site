import { useState } from 'react';
import PageHero from '../components/PageHero';
import { AdminGate } from '../components/admin/RegistrationTable';
import { AddAccount, DeleteAccount } from '../components/admin/AccountForms';
import { useAdminList } from '../components/admin/useAdminList';
import type { Account } from '../services/auth';
import { listUsers, setRole } from '../services/users';

function Users({ admin }: { admin: Account }) {
  const { rows, message, busy, run } = useAdminList(listUsers);
  const [q, setQ] = useState('');
  if (!rows) return <p role="status">{message || 'Loading accounts…'}</p>;
  const shown = rows.filter((u) => `${u.email} ${u.name}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <div className="admin-filters">
        <label htmlFor="user-search">Search email or name</label>
        <input id="user-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="climb-muted">{rows.length} accounts · {rows.filter((u) => u.role === 'admin').length} admins</span>
      </div>
      <AddAccount run={run} busy={busy} />
      {message && <p role="status">{message}</p>}
      <div className="admin-table">
        <table>
          <thead><tr><th scope="col">Account</th><th scope="col">Role</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.uid}>
                <td>{u.email || u.uid}{u.name && <><br /><small>{u.name}</small></>}</td>
                <td>
                  <label className="sr-only" htmlFor={`role-${u.uid}`}>Role for {u.email}</label>
                  {/* Your own role is locked here so an admin can't lock themselves out. */}
                  <select id={`role-${u.uid}`} value={u.role} disabled={busy || u.uid === admin.uid}
                    onChange={(e) => void run(() => setRole(u.uid, e.target.value as 'member' | 'admin', u.email))}>
                    <option value="member">member (any account)</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>{u.uid !== admin.uid && <DeleteAccount user={u} run={run} busy={busy} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="climb-muted">Admins can edit content, climbs and every registration, including health details. Give it only to officers who need it.</p>
    </>
  );
}

// #135 / #81: who has an account, and who is an admin.
export default function AdminUsersPage() {
  return (
    <>
      <PageHero compact crumb={{ to: '/admin', label: 'Admin' }} eyebrow="Admin" title="Accounts and roles" intro="Everyone with a site account, and who can manage the site." image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell">
        <AdminGate>{(admin) => <Users admin={admin} />}</AdminGate>
        
      </div></section></main>
    </>
  );
}
