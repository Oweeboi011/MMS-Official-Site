import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminStats from '../components/admin/AdminStats';
import PageHero from '../components/PageHero';
import RegistrationTable, { AdminGate } from '../components/admin/RegistrationTable';
import { useAdminList } from '../components/admin/useAdminList';
import { NO_FILTER, REG_STATUSES, filterRegs, missingDocs, toCsv, type RegFilter } from '../data/adminRegistrations';
import type { ClimbFacts } from '../data/insightStats';
import { downloadCsv } from '../lib/download';
import type { Account } from '../services/auth';
import { recentRegistrations } from '../services/adminRegistrations';
import { loadClimbFlags } from '../services/climbFlags';

const PAYMENTS = [['', 'All payments'], ['balance_due', 'Has balance due'], ['unpaid', 'Unpaid'], ['submitted', 'Payment submitted'], ['verified', 'Payment verified'], ['rejected', 'Payment rejected']] as const;

// A filter value from a dashboard link, only if it is one the page offers.
const allowed = (value: string | null, options: readonly string[]) => (value && options.includes(value) ? value : '');

function useClimbFlags() {
  const [flags, setFlags] = useState<ClimbFacts[]>([]);
  useEffect(() => { loadClimbFlags().then(setFlags, () => undefined); }, []); // without them, "missing documents" simply finds nothing
  return useMemo(() => new Map(flags.map((c) => [c.id, c])), [flags]);
}

function Search({ admin }: { admin: Account }) {
  const { rows, message, busy, run } = useAdminList(recentRegistrations);
  const flags = useClimbFlags();
  const [params] = useSearchParams();
  const [f, setF] = useState<RegFilter>(() => ({
    ...NO_FILTER,
    payment: allowed(params.get('payment'), PAYMENTS.map(([v]) => v)),
    status: allowed(params.get('status'), REG_STATUSES),
    climb: params.get('climb') ?? '',
  }));
  const set = (key: keyof RegFilter) => (value: string) => setF((cur) => ({ ...cur, [key]: value }));
  const climbs = useMemo(() => [...new Map((rows ?? []).map((r) => [r.climbId, r.title])).entries()].sort((a, b) => a[1].localeCompare(b[1])), [rows]);
  if (!rows) return <p role="status">{message || 'Loading registrations…'}</p>;
  const shown = filterRegs(rows, f, flags);
  const live = rows.filter((r) => r.status !== 'cancelled');
  return (
    <>
      <AdminStats items={[
        ['Total', String(rows.length)], ['Confirmed', String(rows.filter((r) => r.status === 'confirmed').length)], ['Pending', String(rows.filter((r) => r.status === 'pending').length)],
        ['Awaiting payment review', String(live.filter((r) => r.raw.paymentStatus === 'submitted').length), live.some((r) => r.raw.paymentStatus === 'submitted')],
        ['Missing required docs', String(rows.filter((r) => missingDocs(r, flags.get(r.climbId)).length > 0).length)],
      ]} />
      <div className="admin-filterbar">
        <div className="editor-field filter-wide">
          <label htmlFor="reg-search">Search name, email, mobile or climb</label>
          <input id="reg-search" type="search" value={f.text} onChange={(e) => set('text')(e.target.value)} />
        </div>
        <div className="editor-field">
          <label htmlFor="reg-climb">Climb</label>
          <select id="reg-climb" value={f.climb} onChange={(e) => set('climb')(e.target.value)}>
            <option value="">All climbs</option>
            {climbs.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
          </select>
        </div>
        <div className="editor-field">
          <label htmlFor="reg-status">Status</label>
          <select id="reg-status" value={f.status} onChange={(e) => set('status')(e.target.value)}>
            <option value="">All statuses</option>
            {REG_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="editor-field">
          <label htmlFor="reg-payment">Payment</label>
          <select id="reg-payment" value={f.payment} onChange={(e) => set('payment')(e.target.value)}>
            {PAYMENTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="editor-field">
          <label htmlFor="reg-docs">Documents</label>
          <select id="reg-docs" value={f.docs} onChange={(e) => set('docs')(e.target.value)}>
            <option value="">All documents</option>
            <option value="missing">Missing required docs</option>
          </select>
        </div>
        <div className="filter-actions">
          <button type="button" className="chip" disabled={f === NO_FILTER || JSON.stringify(f) === JSON.stringify(NO_FILTER)} onClick={() => setF(NO_FILTER)}>Clear filters</button>
          <button type="button" className="btn" disabled={!shown.length} onClick={() => downloadCsv('registrations', toCsv(shown))}>Download CSV ({shown.length})</button>
        </div>
      </div>
      <p className="climb-muted">Showing {shown.length} of the newest {rows.length} registrations across all climbs.</p>
      {message && <p role="status">{message}</p>}
      <RegistrationTable regs={shown} admin={admin} run={run} busy={busy} showClimb flags={flags} />
    </>
  );
}

// #154: all registrations, search + filter + CSV (old app AllRegistrations).
export default function AdminRegistrationsPage() {
  return (
    <>
      <PageHero compact crumb={{ to: '/admin', label: 'Admin' }} eyebrow="Admin" title="All registrations" intro="Find anyone across every climb." image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell">
        <AdminGate>{(admin) => <Search admin={admin} />}</AdminGate>
      </div></section></main>
    </>
  );
}
