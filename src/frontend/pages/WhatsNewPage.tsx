import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import RichText from '../components/RichText';
import SignInForm from '../components/SignInForm';
import { markSeen, noteBlocks, type ReleaseNote } from '../data/releaseNotes';
import { publishedNotes } from '../services/releaseNotes';
import { useAccount } from '../services/useAccount';

const day = (ms: number) => (ms ? new Date(ms).toLocaleDateString('en-PH', { dateStyle: 'medium', timeZone: 'Asia/Manila' }) : '');

function Notes() {
  const [notes, setNotes] = useState<ReleaseNote[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    publishedNotes().then((n) => { setNotes(n); if (n[0]) markSeen(n[0]); }, (e: Error) => setError(e.message));
  }, []);
  if (error) return <p role="alert">Couldn’t load: {error}</p>;
  if (!notes) return <p role="status">Loading…</p>;
  if (!notes.length) return <p>No updates yet.</p>;
  return notes.map((n) => (
    <article key={n.id} className="release-note">
      <h2>{n.title}</h2>
      <p className="climb-muted">{day(n.publishedAt)}</p>
      {noteBlocks(n.body).map((b, i) => (b.list
        ? <ul key={i /* note text order */}>{b.items.map((t) => <li key={t}><RichText text={t} /></li>)}</ul>
        : <p key={i /* note text order */}><RichText text={b.text} /></p>))}
    </article>
  ));
}

// #147: what changed on the site, for signed-in members (rules).
export default function WhatsNewPage() {
  const state = useAccount();
  let body = <p role="status">Checking your sign-in…</p>;
  if (state.status === 'signedIn') body = <Notes />;
  else if (state.status !== 'loading') body = <><p>Sign in to see what’s new.</p><SignInForm /></>;
  return (
    <>
      <PageHero eyebrow="Account" title="What’s new" intro="Updates to the site and Open Climbs." image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell register-shell legal-page">{body}<p><Link to="/account/climbs">My Climbs</Link></p></div></section></main>
    </>
  );
}
