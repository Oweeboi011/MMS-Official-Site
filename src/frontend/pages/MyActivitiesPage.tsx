import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountTabs from '../components/AccountTabs';
import DataTable from '../components/DataTable';
import PageHero from '../components/PageHero';
import SignInForm from '../components/SignInForm';
import { sitemap, subpagePath } from '../data/sitemap';
import { myRegistrations } from '../services/registrations';
import { useAccount } from '../services/useAccount';

const section = sitemap.find((s) => s.slug === 'activities');
const OPEN_CLIMBS = 'open-climbs';

function Activities({ uid }: { uid: string }) {
  const [joined, setJoined] = useState<number | null>(null);
  useEffect(() => {
    myRegistrations(uid).then((rows) => setJoined(rows.filter((r) => r.status !== 'cancelled').length), () => setJoined(null));
  }, [uid]);
  if (!section) return null;
  return (
    <DataTable caption="MMS activities" head={['Activity', 'What it is', 'You']}>
      {section.pages.map((p) => (
        <tr key={p.slug}>
          <th scope="row"><Link to={subpagePath(section, p)}>{p.label}</Link></th>
          <td>{p.summary}</td>
          <td>
            {p.slug === OPEN_CLIMBS && joined !== null && <>{joined === 0 ? 'Not joined yet' : `Joined ${joined}`} · <Link to="/account/climbs">My Open Climbs</Link></>}
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

// MMS activity types, with what the member has joined marked.
export default function MyActivitiesPage() {
  const state = useAccount();
  let body = <p role="status">Checking your sign-in…</p>;
  if (state.status === 'signedIn') body = <Activities uid={state.account.uid} />;
  else if (state.status !== 'loading') body = <><p>Sign in to see your activities.</p><SignInForm /></>;
  return (
    <>
      <PageHero compact eyebrow="Account" title="My activities" intro="MMS activities, and the ones you have joined." image="/images/page-open-climbs.webp" />
      <main><section className="section page-section"><div className="shell register-shell"><AccountTabs />{body}</div></section></main>
    </>
  );
}
