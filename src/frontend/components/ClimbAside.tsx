import { Link } from 'react-router-dom';
import type { ClimbDetail } from '../data/climbDetail';
import { feeModel, pesoLabel } from '../data/feeModel';
import { registrationEnabled } from '../services/firebaseEnv';
import AddToCalendar from './AddToCalendar';
import ShareClimb from './ShareClimb';

const SCHEDULE = '/activities/open-climbs';

function slots(climb: ClimbDetail): string {
  if (climb.slotsLeft === undefined) return '';
  if (climb.slotsLeft <= 0) return 'Full · waitlist';
  return climb.slotsLeft === 1 ? '1 slot left' : `${climb.slotsLeft} slots left`;
}

function stateOf(climb: ClimbDetail): string {
  if (climb.cancelled) return 'Cancelled';
  if (climb.postponed) return 'Postponed';
  if (climb.over) return 'Completed';
  return climb.status === 'Closed' ? 'Closed' : slots(climb);
}

// Tags that say at a glance what kind of climb this is and whether it can be joined.
function Tags({ climb }: { climb: ClimbDetail }) {
  const live = !climb.over && !climb.cancelled;
  const state = stateOf(climb);
  return (
    <p className="aside-tags">
      <span className={`aside-tag type-${climb.type.toLowerCase()}`}>{climb.type}</span>
      {state && <span className={`aside-tag${live && climb.status === 'Open' ? '' : ' is-muted'}`}>{state}</span>}
    </p>
  );
}

function Actions({ climb, id }: { climb: ClimbDetail; id: string }) {
  const open = !climb.over && !climb.cancelled && climb.status === 'Open';
  return (
    <div className="aside-actions">
      {open && registrationEnabled && <Link className="btn btn-primary" to={`/climbs/${id}/register`}>Register <span aria-hidden="true">→</span></Link>}
      {open && !registrationEnabled && <Link className="btn btn-primary" to="/#join">Ask to join this climb <span aria-hidden="true">→</span></Link>}
      {!climb.over && !climb.cancelled && <AddToCalendar climb={climb} />}
      <Link className="btn" to={SCHEDULE}>All open climbs</Link>
    </div>
  );
}

function Facts({ climb }: { climb: ClimbDetail }) {
  if (!climb.stats.length) return null;
  return (
    <section className="aside-card" aria-labelledby="facts-title">
      <h2 id="facts-title">At a glance</h2>
      <dl className="fact-list">
        {climb.stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
      </dl>
      <p className="fee-help"><Link to="/activities/open-climbs/guide">What do difficulty and trail class mean?</Link></p>
    </section>
  );
}

function FeeList({ items }: { items: ClimbDetail['feeItems'] }) {
  return (
    <ul className="fee-lines">
      {items.map((f) => <li key={f.label + f.amount}><span>{f.label}{f.note && <small>{f.note}</small>}</span><b>{pesoLabel(f.amount)}</b></li>)}
    </ul>
  );
}

function Fees({ climb }: { climb: ClimbDetail }) {
  if (climb.over || climb.cancelled) return null;
  const { required, optional, guest, total, hasTba, hasAmount } = feeModel(climb.feeItems);
  return (
    <section className="aside-card" aria-labelledby="fees-title">
      <h2 id="fees-title">What it costs</h2>
      {!climb.feeItems.length && <p className="climb-muted">Fees will be posted soon.</p>}
      {required.length > 0 && <FeeList items={required} />}
      {hasAmount && (
        <p className="fee-total"><span>Member total{hasTba && <small> (excl. TBA items)</small>}</span><strong>{pesoLabel(String(total))}</strong></p>
      )}
      {optional.length > 0 && <><h3 className="fee-group">Optional, only if availed</h3><FeeList items={optional} /></>}
      {guest && <p className="fee-guest">+ {pesoLabel(guest.amount)} {guest.label} for non-members</p>}
      {climb.feeItems.length > 0 && <p className="fee-help">Not sure if you’re a member or a guest? <Link to="/activities/open-climbs/guide">Read the guide</Link>.</p>}
    </section>
  );
}

function Requirements({ climb }: { climb: ClimbDetail }) {
  if (!climb.requiredDocs.length || climb.over || climb.cancelled) return null;
  return (
    <section className="aside-card" aria-labelledby="requirements-title">
      <h2 id="requirements-title">Required before climb day</h2>
      <ul className="requirement-list">
        {climb.requiredDocs.map((d) => (
          <li key={d.key}>{d.label}{d.sampleUrl && <> · <a href={d.sampleUrl} target="_blank" rel="noopener noreferrer">Download template</a></>}</li>
        ))}
      </ul>
    </section>
  );
}

function Officers({ climb }: { climb: ClimbDetail }) {
  if (!climb.officers.length) return null;
  return (
    <section className="aside-card" aria-labelledby="officers-title">
      <h2 id="officers-title">Climb officers</h2>
      <ul className="officer-list">
        {climb.officers.map((o) => <li key={o.name + o.role}><strong>{o.name}</strong><span>{o.role}</span></li>)}
      </ul>
    </section>
  );
}

// The climb's summary card column: what to do, the numbers that matter, the cost and who to ask.
export default function ClimbAside({ climb, id }: { climb: ClimbDetail; id: string }) {
  return (
    <aside className="climb-aside" aria-label="Climb summary">
      <div className="aside-card is-primary">
        <Tags climb={climb} />
        <p className="aside-when"><strong>{climb.dates}</strong>{climb.location && <span>{climb.location}</span>}</p>
        <Actions climb={climb} id={id} />
      </div>
      <Facts climb={climb} />
      <Fees climb={climb} />
      <Requirements climb={climb} />
      <Officers climb={climb} />
      {!climb.cancelled && <div className="aside-card"><ShareClimb climb={climb} /></div>}
    </aside>
  );
}
