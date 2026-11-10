import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Notice } from '../../data/notifications';
import { markRead, myNotifications } from '../../services/notifications';
import { useAccount } from '../../services/useAccount';

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

// A native <dialog>: focus stays inside, Escape closes, the page behind is inert.
export default function NotificationsModal({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const state = useAccount();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }, []);
  const close = () => ref.current?.close();
  return (
    <dialog ref={ref} className="modal" aria-labelledby="notify-title" onClose={onClose} onClick={(e) => { if (e.target === ref.current) close(); }}>
      <header className="modal-head">
        <h2 id="notify-title">Notifications</h2>
        <button type="button" className="chip" onClick={close}>Close</button>
      </header>
      <div className="modal-body">
        {state.status === 'signedIn' && <Items uid={state.account.uid} onNavigate={close} />}
        {state.status === 'loading' && <p role="status">Checking your sign-in…</p>}
        {(state.status === 'signedOut' || state.status === 'unconfigured' || state.status === 'error') && <p>Sign in to see your notifications. <Link to="/account/sign-in" onClick={close}>Sign in</Link></p>}
      </div>
    </dialog>
  );
}
