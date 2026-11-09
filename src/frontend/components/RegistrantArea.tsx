import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ClimbDetail } from '../data/climbDetail';
import type { ClimbPrivate } from '../data/climbPrivate';
import { loadClimbPrivate } from '../services/climbPrivate';
import { useAccount } from '../services/useAccount';

const meetingDay = (d: string) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T00:00:00+08:00`).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Manila' }) : d);

function Details({ info, climb }: { info: ClimbPrivate; climb: ClimbDetail }) {
  return (
    <>
      {info.meetings.length > 0 && (
        <>
          <h3>Pre-climb meeting{info.meetings.length > 1 ? 's' : ''}</h3>
          <ul>
            {info.meetings.map((m) => (
              <li key={`${m.date}-${m.time}`}>
                <strong>{meetingDay(m.date)}</strong>{m.time && ` · ${m.time}`}{m.location && ` · ${m.location}`}
                {m.notes && <><br />{m.notes}</>}
                {m.link && <> · <a href={m.link} target="_blank" rel="noopener noreferrer">Join online</a></>}
                {m.recordingLink && <> · <a href={m.recordingLink} target="_blank" rel="noopener noreferrer">Recording</a></>}
              </li>
            ))}
          </ul>
        </>
      )}
      {info.resources.length > 0 && <><h3>Resources</h3><ul>{info.resources.map((r) => <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.label || r.url}</a></li>)}</ul></>}
      <h3>Who’s joining</h3>
      {climb.officers.length > 0 && <p><strong>Climb officers:</strong> {climb.officers.map((o) => `${o.name} (${o.role})`).join(', ')}</p>}
      <p><strong>MMS members ({info.members.length}):</strong> {info.members.join(', ') || '—'}</p>
      <p><strong>Guests ({info.guests.length}):</strong> {info.guests.join(', ') || '—'}</p>
    </>
  );
}

function Load({ climb }: { climb: ClimbDetail }) {
  const [info, setInfo] = useState<ClimbPrivate | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    loadClimbPrivate(climb.id ?? '').then((v) => { if (live) setInfo(v); }, () => { if (live) setInfo(null); });
    return () => { live = false; };
  }, [climb.id]);
  if (info === undefined) return <p role="status">Loading…</p>;
  if (!info) return <p className="climb-muted">Meeting details, resources and the participant list show here once you’re registered for this climb.</p>;
  return <Details info={info} climb={climb} />;
}

// #162: registrants-only section (climbPrivate). Lazy: brings the Firebase SDK only to climb pages that need it.
export default function RegistrantArea({ climb }: { climb: ClimbDetail }) {
  const state = useAccount();
  let body = <p role="status">Checking your sign-in…</p>;
  if (state.status === 'signedIn') body = <Load climb={climb} />;
  else if (state.status !== 'loading') body = <p className="climb-muted">Registered for this climb? <Link to="/account/climbs">Sign in</Link> to see meeting details, resources and who’s joining.</p>;
  return <section className="climb-block" aria-labelledby="climb-registrants"><h2 id="climb-registrants">For registrants</h2>{body}</section>;
}
