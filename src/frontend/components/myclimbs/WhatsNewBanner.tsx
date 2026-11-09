import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { markSeen, unseen, type ReleaseNote } from '../../data/releaseNotes';
import { publishedNotes } from '../../services/releaseNotes';

// #147 one-time "what's new": the latest note, until this browser has seen it.
export default function WhatsNewBanner() {
  const [latest, setLatest] = useState<ReleaseNote | null>(null);
  useEffect(() => {
    publishedNotes(1).then(([n]) => { if (unseen(n)) setLatest(n); }, () => undefined);
  }, []);
  if (!latest) return null;
  return (
    <p className="climb-notice" role="note">
      New: <Link to="/account/whats-new">{latest.title}</Link>{' '}
      <button type="button" className="link-button" onClick={() => { markSeen(latest); setLatest(null); }}>Dismiss</button>
    </p>
  );
}
