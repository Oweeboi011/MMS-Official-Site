import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { MyClimb } from '../../data/myClimbs';
import { joinedLabel, type UserRow } from '../../data/users';
import { updateProfile, userClimbs } from '../../services/users';
import Modal from '../Modal';

type Run = (a: () => Promise<void>) => Promise<boolean>;

// Name and email shown to officers and used in emails. The callable changes the sign-in account and the profile together.
function EditProfile({ user, run, busy }: { user: UserRow; run: Run; busy: boolean }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const changed = name.trim() !== user.name || email.trim() !== user.email;
  const submit = (e: FormEvent) => { e.preventDefault(); void run(() => updateProfile(user.uid, { name: name.trim(), email: email.trim() })); };
  return (
    <form className="user-edit" onSubmit={submit}>
      <h3 className="fee-group">Edit profile</h3>
      <div className="editor-field"><label htmlFor="ud-name">Name</label><input id="ud-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="editor-field"><label htmlFor="ud-email">Email</label><input id="ud-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <button type="submit" className="btn" disabled={busy || !changed}>Save profile</button>
    </form>
  );
}

function Climbs({ uid }: { uid: string }) {
  const [rows, setRows] = useState<MyClimb[] | null>(null);
  useEffect(() => { void userClimbs(uid).then(setRows, () => setRows([])); }, [uid]);
  if (!rows) return <p role="status">Loading climbs…</p>;
  if (!rows.length) return <p className="climb-muted">No registrations yet.</p>;
  return (
    <ul className="plain-list">
      {rows.map((r) => <li key={r.id}><Link to={`/admin/climbs/${r.climbId}`}>{r.title}</Link> <small>{[r.date, r.statusLabel].filter(Boolean).join(' · ')}</small></li>)}
    </ul>
  );
}

export default function UserDetail({ user, self, addedBy, run, busy, onClose }: { user: UserRow; self: boolean; addedBy: string; run: Run; busy: boolean; onClose: () => void }) {
  return (
    <Modal title={user.name || user.email} onClose={onClose}>
      <p className="user-sub">{user.email}{self && <span className="you-tag">You</span>}</p>
      <dl className="receipt-grid">
        <div><dt>Role</dt><dd>{user.role}</dd></div>
        <div><dt>Joined</dt><dd>{joinedLabel(user.createdAt)}</dd></div>
        <div><dt>Added by</dt><dd>{addedBy}</dd></div>
        {user.role === 'admin' && <div><dt>Can email members</dt><dd>{user.canEmailMembers ? 'Yes' : 'No'}</dd></div>}
      </dl>
      {user.role === 'admin' && <p className="climb-muted">Emailing every member is granted by the owner outside the app (tools/admin/grant-email-members).</p>}
      <EditProfile key={user.uid + user.email + user.name} user={user} run={run} busy={busy} />
      <h3 className="fee-group">Climbs and activity</h3>
      <Climbs uid={user.uid} />
    </Modal>
  );
}
