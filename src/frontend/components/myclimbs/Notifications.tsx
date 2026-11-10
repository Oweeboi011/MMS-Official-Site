import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Notice } from '../../data/notifications';
import { markRead, myNotifications } from '../../services/notifications';

const when = (ms: number) => (ms ? new Date(ms).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', timeZone: 'Asia/Manila' }) : '');

// #148: what the functions told you (payment verified, reminders, status changes…), newest first.
export default function Notifications({ uid }: { uid: string }) {
  const [items, setItems] = useState<Notice[] | null>(null);
  const load = useCallback(() => myNotifications(uid).then(setItems, () => setItems([])), [uid]);
  useEffect(() => { void load(); }, [load]);
  if (!items?.length) return null;
  const unread = items.filter((n) => !n.read);
  const readAll = () => void markRead(unread.map((n) => n.id)).then(load, () => undefined);
  return (
    <details className="register-section notifications">
      <summary><strong>Notifications{unread.length ? ` (${unread.length} new)` : ''}</strong></summary>
      <ul>
        {items.map((n) => (
          <li key={n.id} className={n.read ? undefined : 'is-unread'}>
            <Link to={n.link} onClick={() => { if (!n.read) void markRead([n.id]).catch(() => undefined); }}>{n.title}</Link>
            {n.message && <> · {n.message}</>} <small className="climb-muted">{when(n.createdAt)}</small>
          </li>
        ))}
      </ul>
      {unread.length > 0 && <button type="button" className="chip" onClick={readAll}>Mark all read</button>}
    </details>
  );
}
