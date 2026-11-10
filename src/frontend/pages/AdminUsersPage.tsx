import { useState } from 'react';
import PageHero from '../components/PageHero';
import { AdminGate } from '../components/admin/RegistrationTable';
import AdminStats from '../components/admin/AdminStats';
import { AddAccount, DeleteAccount } from '../components/admin/AccountForms';
import UserDetail from '../components/admin/UserDetail';
import { useAdminList } from '../components/admin/useAdminList';
import { addedByLabel, initials, joinedLabel, type UserRow } from '../data/users';
import type { Account } from '../services/auth';
import { listUsers, setRole } from '../services/users';

function Users({ admin }: { admin: Account }) {
  const { rows, message, busy, run } = useAdminList(listUsers);
  const [q, setQ] = useState('');
  const [role, setRoleFilter] = useState('');
  const [openUid, setOpenUid] = useState('');
  if (!rows) return <p role="status">{message || 'Loading accounts…'}</p>;
  const shown = rows.filter((u) => `${u.email} ${u.name}`.toLowerCase().includes(q.trim().toLowerCase()) && (!role || u.role === role));
  const open: UserRow | undefined = rows.find((u) => u.uid === openUid);
  return (
    <>
      <AdminStats items={[['Accounts', String(rows.length)], ['Admins', String(rows.filter((u) => u.role === 'admin').length)], ['Members', String(rows.filter((u) => u.role !== 'admin').length)]]} />
      <div className="admin-filterbar">
        <div className="editor-field filter-wide"><label htmlFor="user-search">Search email or name</label><input id="user-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="editor-field"><label htmlFor="user-role">Role</label>
          <select id="user-role" value={role} onChange={(e) => setRoleFilter(e.target.value)}><option value="">All roles</option><option value="admin">Admins</option><option value="member">Members</option></select>
        </div>
      </div>
      <AddAccount run={run} busy={busy} />
      {message && <p role="status">{message}</p>}
      <div className="admin-table">
        <table>
          <thead><tr><th scope="col">Account</th><th scope="col">Role</th><th scope="col">Added by</th><th scope="col">Joined</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.uid}>
                <td><span className="avatar" aria-hidden="true">{initials(u)}</span><span className="user-cell"><strong>{u.name || u.email || u.uid}</strong>{u.uid === admin.uid && <span className="you-tag">You</span>}<small>{u.email}</small></span></td>
                <td>
                  <label className="sr-only" htmlFor={`role-${u.uid}`}>Role for {u.email}</label>
                  {/* Your own role is locked here so an admin can't lock themselves out. */}
                  <select id={`role-${u.uid}`} value={u.role} disabled={busy || u.uid === admin.uid}
                    onChange={(e) => void run(() => setRole(u.uid, e.target.value as 'member' | 'admin', u.email))}>
                    <option value="member">member (any account)</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>{addedByLabel(u, rows)}</td>
                <td>{joinedLabel(u.createdAt)}</td>
                <td><button type="button" className="chip" onClick={() => setOpenUid(u.uid)}>Details</button>{u.uid !== admin.uid && <> <DeleteAccount user={u} run={run} busy={busy} /></>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="climb-muted">Admins can edit content, climbs and every registration, including health details. Give it only to officers who need it. You can&apos;t change your own role or delete your own account.</p>
      {open && <UserDetail user={open} self={open.uid === admin.uid} addedBy={addedByLabel(open, rows)} run={run} busy={busy} onClose={() => setOpenUid('')} />}
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
