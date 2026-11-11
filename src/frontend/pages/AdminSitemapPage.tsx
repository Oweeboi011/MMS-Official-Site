import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import AdminStats from '../components/admin/AdminStats';
import { AdminGate } from '../components/admin/RegistrationTable';
import { STATE_LABEL, siteMapPages, stateCounts, type MapPage, type PageState } from '../data/siteMapStatus';
import { loadSiteFacts } from '../services/siteFacts';

const FILTERS: (PageState | 'all')[] = ['all', 'partial', 'sample', 'off', 'live'];
const linkable = (path: string) => path.startsWith('/') && !path.includes(':') && !path.includes('#');

function Rows({ pages }: { pages: MapPage[] }) {
  return (
    <div className="admin-table">
      <table>
        <thead><tr><th scope="col">Page</th><th scope="col">Status</th><th scope="col">What is missing</th><th scope="col"><span className="sr-only">Fix</span></th></tr></thead>
        <tbody>
          {pages.map((p) => (
            <tr key={`${p.path}-${p.label}`}>
              <td>{linkable(p.path) ? <Link to={p.path}>{p.label}</Link> : p.label}<br /><small>{p.path}</small></td>
              <td><span className={`status-chip is-site-${p.state}`}>{STATE_LABEL[p.state]}</span></td>
              <td>{p.state === 'live' ? <span className="climb-muted">Nothing to do.</span> : p.note}</td>
              <td>{p.fix && <Link to={p.fix}>{p.fix.includes('#') ? 'Edit content' : 'Open admin'}</Link>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SiteMap() {
  const [pages, setPages] = useState<MapPage[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<PageState | 'all'>('all');
  useEffect(() => {
    let current = true;
    loadSiteFacts().then((f) => { if (current) setPages(siteMapPages(f)); }, (e: Error) => { if (current) setError(e.message); });
    return () => { current = false; };
  }, []);
  if (error) return <p role="alert">Couldn’t read the site content: {error}</p>;
  if (!pages) return <p role="status">Checking every page…</p>;
  const counts = stateCounts(pages);
  const shown = pages.filter((p) => filter === 'all' || p.state === filter);
  const areas = [...new Set(shown.map((p) => p.area))];
  return (
    <>
      <AdminStats items={[['Pages and features', String(pages.length)], ['Live', String(counts.live)], ['Partial', String(counts.partial), counts.partial > 0], ['Sample copy', String(counts.sample), counts.sample > 0], ['Off', String(counts.off)]]} />
      <p className="climb-muted">Live shows real data. Partial is missing some data. Sample copy is placeholder text not yet confirmed by officers. Off is a feature not switched on yet.</p>
      <nav className="admin-tabs" aria-label="Filter by status">
        {FILTERS.map((s) => <button key={s} type="button" className={`chip${s === filter ? ' is-active' : ''}`} onClick={() => setFilter(s)}>{s === 'all' ? 'All' : STATE_LABEL[s]}</button>)}
      </nav>
      {areas.map((a) => <section key={a}><h3 className="admin-subhead">{a}</h3><Rows pages={shown.filter((p) => p.area === a)} /></section>)}
    </>
  );
}

// Every page and feature, and whether it is finished: where officers still owe content or a feature is not on.
export default function AdminSitemapPage() {
  return (
    <>
      <PageHero compact crumb={{ to: '/admin', label: 'Admin' }} eyebrow="Admin" title="Site map" intro="Every page and feature of the site, and which still have sample copy, missing data or are switched off." image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell"><AdminGate>{() => <SiteMap />}</AdminGate></div></section></main>
    </>
  );
}
