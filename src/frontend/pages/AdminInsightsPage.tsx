import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import AdminStats from '../components/admin/AdminStats';
import { trafficSummary } from '../data/insightStats';
import { Attention, Bars, Compliance, Failures, Money, Overview, Panel } from '../components/admin/InsightPanels';
import { AdminGate } from '../components/admin/RegistrationTable';
import { loadInsightData } from '../services/insightData';
import { recentAudit } from '../services/auditLog';
import { INSIGHTS, callInsight, recentErrors, recentViews } from '../services/insights';

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
const when = (ms: number) => (ms ? new Date(ms).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }) : '');

function Loaded<T>({ load, children, what }: { load: () => Promise<T>; children: (value: T) => ReactNode; what: string }) {
  const [fn] = useState(() => load);
  const r = useLoad(fn);
  if (!r) return <p role="status">Loading {what}…</p>;
  if (!r.ok) return <p className="climb-muted">Not available: {r.error}</p>;
  return <>{children(r.value)}</>;
}

function ServiceCard({ name, title }: { name: string; title: string }) {
  return (
    <Panel title={title}>
      <Loaded load={() => callInsight(name)} what="">
        {(value) => <dl className="insight">{Object.entries(value).filter(([k]) => k !== 'folders').map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{show(v)}</dd></div>)}</dl>}
      </Loaded>
    </Panel>
  );
}

function Traffic() {
  return (
    <Loaded load={() => recentViews().then((v) => trafficSummary(v, Date.now()))} what="views">
      {(t) => {
        if (!t.views) return <p className="climb-muted">No page views logged in the last 30 days.</p>;
        return (
          <>
            <AdminStats items={[['Views (30 days)', String(t.views)], ['Visits', String(t.sessions)], ['Views per day', String(Math.round(t.views / 30))]]} />
            <Panel title="Views per day, last 30 days"><Bars rows={t.perDay.map(([d, n]) => [d.slice(5), n])} /></Panel>
            <Panel title="Most viewed pages"><ol className="plain-list">{t.top.map(([path, n]) => <li key={path}>{path} <small>{n} views</small></li>)}</ol></Panel>
          </>
        );
      }}
    </Loaded>
  );
}

function RecentErrors() {
  return (
    <Panel title="Recent errors">
      <Loaded load={recentErrors} what="errors">
        {(rows) => (rows.length
          ? <ul className="plain-list">{rows.map((e) => <li key={e.id}>{when(e.at)} · {e.type} · {e.source}: {e.message} <small>({e.path})</small></li>)}</ul>
          : <p className="climb-muted">No errors logged.</p>)}
      </Loaded>
    </Panel>
  );
}

function Activity() {
  return (
    <Panel title="Recent admin activity">
      <Loaded load={() => recentAudit(10)} what="activity">
        {(rows) => (rows.length ? (
          <div className="admin-table"><table>
            <thead><tr><th scope="col">When</th><th scope="col">Admin</th><th scope="col">Action</th><th scope="col">Target</th></tr></thead>
            <tbody>{rows.map((e) => <tr key={e.id}><td>{when(e.createdAt)}</td><td>{e.actorName}</td><td>{e.action}</td><td>{e.targetLabel || e.targetId}</td></tr>)}</tbody>
          </table></div>
        ) : <p className="climb-muted">No admin actions logged yet.</p>)}
      </Loaded>
      <p><Link to="/admin/audit">Open the full audit log</Link></p>
    </Panel>
  );
}

function Figures() {
  const [now] = useState(() => Date.now());
  return (
    <Loaded load={loadInsightData} what="figures">
      {(data) => (
        <>
          <Overview data={data} />
          <h2 className="insight-head">Registrations and payments</h2>
          <Money data={data} now={now} />
          <Compliance data={data} />
          <h2 className="insight-head">Needs attention</h2>
          <Attention data={data} now={now} />
          <h2 className="insight-head">Errors and notifications</h2>
          <Failures data={data} now={now} />
        </>
      )}
    </Loaded>
  );
}

// #157 / #156: how the site and its services are doing (admins only; callables check the role too).
export default function AdminInsightsPage() {
  return (
    <>
      <PageHero compact crumb={{ to: '/admin', label: 'Admin' }} eyebrow="Admin" title="Insights" intro="Registrations, payments, compliance, errors, traffic and the health and cost of the services." image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell insights-shell">
        <AdminGate>{() => (
          <>
            <Figures />
            <h2 className="insight-head">Traffic</h2>
            <Traffic />
            <h2 className="insight-head">Services</h2>
            <div className="panel-grid">{INSIGHTS.map(([name, title]) => <ServiceCard key={name} name={name} title={title} />)}</div>
            <RecentErrors />
            <Activity />
          </>
        )}</AdminGate>
      </div></section></main>
    </>
  );
}
