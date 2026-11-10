import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminStats from '../components/admin/AdminStats';
import PageHero from '../components/PageHero';
import RegistrationTable, { AdminGate } from '../components/admin/RegistrationTable';
import ExpensesPanel from '../components/admin/ExpensesPanel';
import MeetingsEditor from '../components/admin/MeetingsEditor';
import WalkInForm from '../components/admin/WalkInForm';
import { useAdminList } from '../components/admin/useAdminList';
import { summary, toCsv } from '../data/adminRegistrations';
import type { ClimbDetail } from '../data/climbDetail';
import { downloadCsv } from '../lib/download';
import type { Account } from '../services/auth';
import { addWalkIn, climbRegistrations } from '../services/adminRegistrations';
import { useClimb } from '../services/useClimb';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

function Registrations({ climbId, climb, admin }: { climbId: string; climb: ClimbDetail | null | undefined; admin: Account }) {
  const load = useCallback(() => climbRegistrations(climbId), [climbId]);
  const { rows, message, busy, run } = useAdminList(load);
  if (!rows) return <p role="status">{message || 'Loading registrations…'}</p>;
  const s = summary(rows);
  const ref = { id: climbId, title: climb?.title ?? climbId, dateLabel: climb?.dates ?? '', location: climb?.location ?? '' };
  return (
    <>
      <AdminStats items={[['Confirmed', String(s.confirmed)], ['Pending', String(s.pending)], ['Waitlisted', String(s.waitlisted)], ['Cancelled', String(s.cancelled)], ['To review', String(s.toReview), s.toReview > 0], ['Recorded', peso(s.collected)]]} />
      <p className="editor-actions">
        <button type="button" className="btn" disabled={!rows.length} onClick={() => downloadCsv(ref.title, toCsv(rows))}>Download CSV (LGU / jump-off)</button>
        <Link className="btn" to={`/admin/climbs/${climbId}/sheet`}>Climb-day sheet (print)</Link>
      </p>
      <WalkInForm busy={busy} onAdd={(w) => run(() => addWalkIn(ref, w, admin.email))} />
      <MeetingsEditor climbId={climbId} run={run} busy={busy} />
      <ExpensesPanel climbId={climbId} regs={rows} run={run} busy={busy} />
      {message && <p role="status">{message}</p>}
      <RegistrationTable regs={rows} admin={admin} run={run} busy={busy} />
    </>
  );
}

// /admin/climbs/:id: one climb's registrations, payments, walk-ins, CSV.
export default function AdminClimbPage() {
  const { id = '' } = useParams();
  const climb = useClimb(id);
  return (
    <>
      <PageHero compact crumb={{ to: '/admin', label: 'Admin' }} eyebrow="Admin · Registrations" title={climb?.title ?? 'Climb'} intro={climb ? [climb.dates, climb.location].filter(Boolean).join(' · ') : ''} image="/images/page-surveys.webp" />
      <main><section className="section page-section"><div className="shell">
        <AdminGate>{(admin) => <Registrations climbId={id} climb={climb} admin={admin} />}</AdminGate>
        <p><Link to="/admin/registrations">All registrations</Link></p>
      </div></section></main>
    </>
  );
}
