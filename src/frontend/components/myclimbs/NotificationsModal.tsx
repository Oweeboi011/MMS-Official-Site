import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Notice } from '../../data/notifications';
import { markRead, myNotifications } from '../../services/notifications';
import { useAccount } from '../../services/useAccount';
import Modal from '../Modal';

const when = (ms: number) => (ms ? new Date(ms).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', timeZone: 'Asia/Manila' }) : '');

function Items({ uid, onNavigate }: { uid: string; onNavigate: () => void }) {
  const [items, setItems] = useState<Notice[] | null>(null);
  const load = useCallback(() => myNotifications(uid).then(setItems, () => setItems([])), [uid]);
  useEffect(() => { void load(); }, [load]);
  if (!items) return <p role="status">Loading…</p>;
  if (!items.length) return <p className="climb-muted">Nothing yet. Payment updates, reminders and status changes will show up here.</p>;
  const unread = items.filter((n) => !n.read);
  const readAll = () => void markRead(unread.map((n) => n.id)).then(load, () => undefined);
  const open = (n: Notice) => {
    if (!n.read) void markRead([n.id]).catch(() => undefined);
    onNavigate();
  };
  return (
    <>
      <p className="notify-summary">
        <strong>{unread.length ? `${unread.length} new` : 'All caught up'}</strong>
        {unread.length > 0 && <button type="button" className="chip" onClick={readAll}>Mark all read</button>}
      </p>
      <ul className="notify-list">
        {items.map((n) => (
          <li key={n.id} className={n.read ? undefined : 'is-unread'}>
            <Link to={n.link} onClick={() => open(n)}>{n.title}</Link>
            {n.message && <span>{n.message}</span>}
            <small className="climb-muted">{when(n.createdAt)}</small>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function NotificationsModal({ onClose }: { onClose: () => void }) {
  const state = useAccount();
  return (
    <Modal title="Notifications" onClose={onClose}>
      {state.status === 'signedIn' && <Items uid={state.account.uid} onNavigate={onClose} />}
      {state.status === 'loading' && <p role="status">Checking your sign-in…</p>}
      {(state.status === 'signedOut' || state.status === 'unconfigured' || state.status === 'error') && <p>Sign in to see your notifications. <Link to="/account/sign-in" onClick={onClose}>Sign in</Link></p>}
    </Modal>
  );
}
