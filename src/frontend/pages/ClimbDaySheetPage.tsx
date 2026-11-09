import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminGate } from '../components/admin/RegistrationTable';
import { useAdminList } from '../components/admin/useAdminList';
import { sheetRows, sheetTotals } from '../data/climbDaySheet';
import { climbRegistrations } from '../services/adminRegistrations';
import { useClimb } from '../services/useClimb';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

function Sheet({ climbId }: { climbId: string }) {
  const load = useCallback(() => climbRegistrations(climbId), [climbId]);
  const { rows, message } = useAdminList(load);
  if (!rows) return <p role="status">{message || 'Loading…'}</p>;
  const sheet = sheetRows(rows);
  const t = sheetTotals(sheet);
  return (
    <>
      <p><strong>{t.people}</strong> participants · <strong>{t.withMedical}</strong> with health notes · <strong>{t.unsignedWaivers}</strong> waivers unsigned · <strong>{t.owing}</strong> with a balance</p>
      <table className="day-sheet">
        <thead><tr><th>#</th><th>Present</th><th>Participant</th><th>Emergency contact</th><th>Health</th><th>Waiver · docs</th><th>Balance</th><th>Donation</th></tr></thead>
        <tbody>
          {sheet.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td>
              <td><span className="tick-box" aria-label={`Present: ${r.name}`} /></td>
              <td><strong>{r.name}</strong><br /><small>{r.type} · {r.mobile}</small></td>
              <td>{r.emergency || '—'}</td>
              <td>{r.medical || '—'}</td>
              <td>{r.waiver}<br /><small>{r.docs} doc(s)</small></td>
              <td>{r.balance ? peso(r.balance) : 'paid'}{r.tba ? ' + TBA' : ''}</td>
              <td>{r.pledge || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// #96 / #153: printable roster for the jump-off (pending + confirmed). Print or save as PDF to use offline.
export default function ClimbDaySheetPage() {
  const { id = '' } = useParams();
  const climb = useClimb(id);
  return (
    <main><section className="section page-section"><div className="shell day-sheet-page">
      <h1>{climb?.title ?? 'Climb'} · climb-day sheet</h1>
      <p className="climb-muted">{climb ? [climb.dates, climb.location].filter(Boolean).join(' · ') : ''}</p>
      <p className="climb-notice" role="note">Confidential: health and emergency details. Keep it with the team leader and destroy it after the climb.</p>
      <AdminGate>{() => <Sheet climbId={id} />}</AdminGate>
      <p className="no-print"><button type="button" className="btn btn-primary" onClick={() => window.print()}>Print or save as PDF</button> <Link className="btn" to={`/admin/climbs/${id}`}>Back to registrations</Link></p>
    </div></section></main>
  );
}
