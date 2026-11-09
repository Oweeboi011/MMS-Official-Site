import { useState } from 'react';
import { Link } from 'react-router-dom';
import CollectionEditor from '../components/CollectionEditor';
import Dashboard from '../components/admin/Dashboard';
import PageHero from '../components/PageHero';
import { climbsSpec } from '../data/climbSchema';
import { siteCollections } from '../data/siteSchemas';

const collections = [climbsSpec, ...siteCollections];
import { readOnlyMessage, writesEnabled } from '../services/firebaseEnv';
import { useAccount } from '../services/useAccount';

function Editors() {
  const [active, setActive] = useState(collections[0]);
  const [busy, setBusy] = useState(false); // switching tabs mid-save would drop the result
  return (
    <>
      {!writesEnabled && <p className="preview-banner" role="note">{readOnlyMessage}</p>}
      <nav className="admin-tabs" aria-label="Collections">
        {collections.map((c) => (
          <button key={c.id} type="button" className={`chip${c.id === active.id ? ' is-active' : ''}`} disabled={busy} onClick={() => setActive(c)}>{c.label}</button>
        ))}
      </nav>
      <h2>{active.label}</h2>
      <CollectionEditor key={active.id} spec={active} onBusyChange={setBusy} />
    </>
  );
}

// UI guard only; the Firestore rules decide what an admin may write.
export default function AdminPage() {
  const state = useAccount();
  let body;
  if (state.status === 'signedIn' && state.account.role === 'admin') body = <><h2>Upcoming climbs</h2><Dashboard /><p><Link className="btn" to="/admin/registrations">All registrations</Link> <Link className="btn" to="/admin/audit">Audit log</Link></p><Editors /></>;
  else if (state.status === 'signedIn') body = <p>Signed in as {state.account.email}, but not an admin. An admin sets your role in the Firebase console.</p>;
  else if (state.status === 'loading') body = <p>Checking your sign-in…</p>;
  else if (state.status === 'error') body = <p role="alert">Couldn&apos;t load your account: {state.error}</p>;
  else if (state.status === 'unconfigured') body = <p>Sign-in isn&apos;t set up on this copy of the site yet.</p>;
  else body = <p><Link to="/account/sign-in">Sign in</Link> to manage site content.</p>;
  return (
    <>
      <PageHero eyebrow="Admin" title="Site content" intro="Update announcements, leadership, committees and more. Changes go live once the site reads them." image="/images/page-surveys.webp" />
      <main>
        <section className="section">
          <div className="shell">{body}</div>
        </section>
      </main>
    </>
  );
}
