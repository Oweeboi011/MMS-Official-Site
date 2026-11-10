import { useEffect, useState } from 'react';
import PageHero from '../components/PageHero';
import { AdminGate } from '../components/admin/RegistrationTable';
import { INSIGHTS, callInsight, recentErrors, topPaths } from '../services/insights';

type Load<T> = { ok: true; value: T } | { ok: false; error: string } | null;

function useLoad<T>(load: () => Promise<T>): Load<T> {
  const [state, setState] = useState<Load<T>>(null);
  useEffect(() => {
    let live = true;
    load().then((value) => { if (live) setState({ ok: true, value }); }, (e: Error) => { if (live) setState({ ok: false, error: e.message }); });
    return () => { live = false; };
  }, [load]);
  return state;
}

const show = (v: unknown) => (typeof v === 'object' ? JSON.stringify(v) : String(v));

function Card({ name, title }: { name: string; title: string }) {
  const [load] = useState(() => () => callInsight(name));
  const r = useLoad(load);
  return (
    <section className="register-section">
      <h2>{title}</h2>
      {!r && <p role="status">Loading…</p>}
      {r && !r.ok && <p className="climb-muted">Not available: {r.error}</p>}
      {r?.ok && <dl className="insight">{Object.entries(r.value).filter(([k]) => k !== 'folders').map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{show(v)}</dd></div>)}</dl>}
    </section>
  );
}

function Views() {
  const r = useLoad(topPaths);
  if (!r) return <p role="status">Loading…</p>;
  if (!r.ok) return <p className="climb-muted">Not available: {r.error}</p>;
  if (!r.value.length) return <p>No page views logged in the last 7 days.</p>;
  return <ol>{r.value.map(([path, n]) => <li key={path}>{path} · {n}</li>)}</ol>;
}

function Errors() {
  const r = useLoad(recentErrors);
  if (!r) return <p role="status">Loading…</p>;
  if (!r.ok) return <p className="climb-muted">Not available: {r.error}</p>;
  if (!r.value.length) return <p>No errors logged.</p>;
  return <ul>{r.value.map((e) => <li key={e.id}>{e.at ? new Date(e.at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : ''} · {e.type} · {e.source}: {e.message} <small>({e.path})</small></li>)}</ul>;
}

// #157 / #156: how the site and its services are doing (admins only; callables check the role too).
export default function AdminInsightsPage() {
  return (
    <>
      <PageHero compact crumb={{ to: '/admin', label: 'Admin' }} eyebrow="Admin" title="Insights" intro="Function health, storage, cost, email, page views and errors." image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell register-shell">
        <AdminGate>{() => (
          <>
            {INSIGHTS.map(([name, title]) => <Card key={name} name={name} title={title} />)}
            <section className="register-section"><h2>Most viewed pages (7 days)</h2><Views /></section>
            <section className="register-section"><h2>Recent errors</h2><Errors /></section>
          </>
        )}</AdminGate>
        
      </div></section></main>
    </>
  );
}
