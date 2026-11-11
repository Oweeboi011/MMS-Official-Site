import { Link } from 'react-router-dom';
import {
  docCompliance, failuresByDay, noticeVolume, oldestPending, overdueUnpaid, paymentBreakdown, paymentTurnaround, repeatedFailures, staleDrafts, waiverRate, weeklyRegistrations,
} from '../../data/insightStats';
import type { InsightData } from '../../services/insightData';
import AdminStats from './AdminStats';

const when = (ms: number) => (ms ? new Date(ms).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' }) : '—');

export function Bars({ rows, tone }: { rows: [string, number][]; tone?: 'good' | 'warn' | 'bad' }) {
  const max = Math.max(...rows.map(([, n]) => n), 1);
  return (
    <ul className="bar-rows">
      {rows.map(([label, n]) => (
        <li key={label}>
          <span className="bar-label">{label}</span>
          <span className="bar-track"><span className={tone ? 'bar-fill is-' + tone : 'bar-fill'} style={{ width: `${(n / max) * 100}%` }} /></span>
          <b>{n}</b>
        </li>
      ))}
    </ul>
  );
}

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="panel"><h3>{title}</h3>{children}</section>;
}

const none = (text: string) => <p className="climb-muted">{text}</p>;

export function Overview({ data }: { data: InsightData }) {
  const live = data.regs.filter((r) => r.status !== 'cancelled');
  const turnaround = paymentTurnaround(data.regs);
  return (
    <AdminStats items={[
      ['Climbs', String(data.climbs.length)], ['Active registrations', String(live.length)], ['Accounts', String(data.users)],
      ['Waiver completion', `${waiverRate(data.regs)}%`], ['Avg payment turnaround', turnaround ? `${turnaround.avgDays.toFixed(1)} days` : '—'],
    ]} />
  );
}

export function Money({ data, now }: { data: InsightData; now: number }) {
  const p = paymentBreakdown(data.regs);
  return (
    <div className="panel-grid">
      <Panel title="Registrations, last 8 weeks"><Bars rows={weeklyRegistrations(data.regs, now)} /></Panel>
      <Panel title="Payment status">
        <Bars tone="good" rows={[['Verified', p.verified]]} />
        <Bars tone="warn" rows={[['Submitted, awaiting review', p.submitted]]} />
        <Bars tone="bad" rows={[['Unpaid', p.unpaid], ['Rejected', p.rejected]]} />
      </Panel>
    </div>
  );
}

export function Compliance({ data }: { data: InsightData }) {
  const docs = docCompliance(data.regs, data.climbs).filter((d) => d.required > 0);
  return (
    <Panel title="Required document compliance">
      {docs.length === 0 ? none('No climb requires documents.') : (
        <ul className="bar-rows">
          {docs.map((d) => (
            <li key={d.label}>
              <span className="bar-label">{d.label} uploaded</span>
              <span className="bar-track"><span className="bar-fill is-good" style={{ width: `${(d.done / d.required) * 100}%` }} /></span>
              <b>{d.done}/{d.required}</b>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function Attention({ data, now }: { data: InsightData; now: number }) {
  const overdue = overdueUnpaid(data.regs, now);
  const drafts = staleDrafts(data.climbs, now);
  const oldest = oldestPending(data.regs);
  return (
    <div className="panel-grid">
      <Panel title="Oldest unpaid or rejected">
        {overdue.length === 0 ? none('Nothing overdue.') : (
          <ul className="plain-list">
            {overdue.map(({ reg, ageDays }) => <li key={reg.id}><Link to={`/admin/climbs/${reg.climbId}`}>{reg.name}</Link> · {reg.title} <small>{ageDays} days</small></li>)}
          </ul>
        )}
      </Panel>
      <Panel title="Stale draft climbs (30+ days)">
        {drafts.length === 0 ? none('No stale drafts.') : <ul className="plain-list">{drafts.map(({ climb, ageDays }) => <li key={climb.id}>{climb.title || 'Untitled'} <small>{ageDays} days</small></li>)}</ul>}
      </Panel>
      <Panel title="Oldest pending registration">
        {oldest ? <p><strong>{oldest.name}</strong> for <strong>{oldest.title}</strong>, waiting since {when(oldest.createdAt)}.</p> : none('No pending registrations awaiting action.')}
      </Panel>
    </div>
  );
}

export function Failures({ data, now }: { data: InsightData; now: number }) {
  const repeated = repeatedFailures(data.failures);
  return (
    <div className="panel-grid">
      <Panel title="Failed requests, last 14 days"><Bars tone="bad" rows={failuresByDay(data.failures, now).map(([d, n]) => [d.slice(5), n])} /></Panel>
      <Panel title="Notifications by type (latest 500)">{data.noticeTypes.length ? <Bars rows={noticeVolume(data.noticeTypes)} /> : none('No notifications.')}</Panel>
      <Panel title="Repeated failures (3+)">
        {repeated.length === 0 ? none('Nothing repeating.') : (
          <ul className="plain-list">{repeated.map((f) => <li key={f.source + f.message}><strong>{f.count}×</strong> {f.source}: {f.message.slice(0, 120)}</li>)}</ul>
        )}
      </Panel>
    </div>
  );
}
