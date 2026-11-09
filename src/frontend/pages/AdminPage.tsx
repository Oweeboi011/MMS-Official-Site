import { useState } from 'react';
import { Link } from 'react-router-dom';
import CollectionEditor from '../components/CollectionEditor';
import AdminTiles from '../components/admin/AdminTiles';
import Dashboard from '../components/admin/Dashboard';
import PageHero from '../components/PageHero';
import { climbsSpec } from '../data/climbSchema';
import { climbTiles, healthTiles, recordTiles } from '../data/adminHome';
import { releaseNotesSpec } from '../data/releaseNotes';
import { siteCollections } from '../data/siteSchemas';
import { readOnlyMessage, writesEnabled } from '../services/firebaseEnv';
import { useAccount } from '../services/useAccount';

type Spec = (typeof siteCollections)[number];

// Tabs for one family of collections; switching mid-save would drop the result, so they lock while busy.
function Editors({ specs, label }: { specs: Spec[]; label: string }) {
  const [active, setActive] = useState(specs[0]);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <nav className="admin-tabs" aria-label={label}>
        {specs.map((c) => (
          <button key={c.id} type="button" className={`chip${c.id === active.id ? ' is-active' : ''}`} disabled={busy} onClick={() => setActive(c)}>{c.label}</button>
        ))}
      </nav>
      <h3>{active.label}</h3>
      <CollectionEditor key={active.id} spec={active} onBusyChange={setBusy} />
    </>
  );
}

function Home() {
  return (
    <>
      {!writesEnabled && <p className="preview-banner" role="note">{readOnlyMessage}</p>}
      <p className="admin-jump"><a href="#open-climbs">Open Climbs</a> · <a href="#site-content">Site content</a> · <a href="#people">People and records</a> · <a href="#health">Health and help</a></p>
      <section id="open-climbs">
        <h2>Open Climbs</h2>
        <p className="climb-muted">Upcoming climbs with slots and payments waiting for review. Open a climb for its registrants, payments, walk-ins and climb-day sheet.</p>
        <Dashboard />
        <AdminTiles tiles={climbTiles} />
        <Editors specs={[climbsSpec, releaseNotesSpec]} label="Open Climbs collections" />
      </section>
      <section id="site-content">
        <h2>Site content</h2>
        <p className="climb-muted">What visitors read on the website: announcements, leadership, committees, surveys, FAQs and more.</p>
        <Editors specs={siteCollections} label="Site content collections" />
      </section>
      <section id="people">
        <h2>People and records</h2>
        <AdminTiles tiles={recordTiles} />
      </section>
      <section id="health">
        <h2>Health and help</h2>
        <AdminTiles tiles={healthTiles} />
      </section>
    </>
  );
}

// UI guard only; the Firestore rules decide what an admin may write.
export default function AdminPage() {
  const state = useAccount();
  let body;
  if (state.status === 'signedIn' && state.account.role === 'admin') body = <Home />;
  else if (state.status === 'signedIn') body = <p>Signed in as {state.account.email}, but not an admin. Ask an admin to give you the role under Accounts and roles.</p>;
  else if (state.status === 'loading') body = <p>Checking your sign-in…</p>;
  else if (state.status === 'error') body = <p role="alert">Couldn&apos;t load your account: {state.error}</p>;
  else if (state.status === 'unconfigured') body = <p>Sign-in isn&apos;t set up on this copy of the site yet.</p>;
  else body = <p><Link to="/account/sign-in">Sign in</Link> to manage site content.</p>;
  return (
    <>
      <PageHero eyebrow="Admin" title="Admin" intro="Run Open Climbs and keep the website’s content up to date." image="/images/page-surveys.webp" />
      <main>
        <section className="section">
          <div className="shell">{body}</div>
        </section>
      </main>
    </>
  );
}
