import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ScheduleClimb } from '../data/climbs';
import { manilaYear } from '../lib/manila';
import { useClimbSchedule } from '../services/useSiteData';

const FIRST_YEAR = 1994; // MMS founded
const SCHEDULE_PATH = '/activities/open-climbs';

interface Props {
  // Show only the next N climbs (home page preview); omit for the full schedule.
  limit?: number;
}

function ClimbRow({ climb }: { climb: ScheduleClimb }) {
  const difficulty = climb.rating ? `${climb.difficulty} (${climb.rating})` : climb.difficulty;
  return (
    <div className="event">
      <div className="event-date"><strong>{climb.day}</strong><span>{climb.month}</span></div>
      <div>
        <div className="event-tags">
          <span className={`event-tag type-${climb.type.toLowerCase()}`}>{climb.type}</span>
          {climb.postponed && <span className="event-tag closed">Postponed</span>}
          {!climb.over && climb.status === 'Closed' && <span className="event-tag closed">Closed</span>}
        </div>
        <h3>{climb.id ? <Link to={`/climbs/${climb.id}`}>{climb.title}</Link> : climb.title}</h3>
        {/* Completed cards: date + trail class only (owner decision 2026-11-09, #191). */}
        <p>{(climb.over ? [climb.dates, difficulty] : [climb.dates, climb.location, difficulty, climb.elevation]).filter(Boolean).join(' · ')}</p>
      </div>
    </div>
  );
}

function ClimbList({ climbs, empty }: { climbs: ScheduleClimb[]; empty: string }) {
  if (!climbs.length) return <p className="event-empty">{empty}</p>;
  return <div className="event-list">{climbs.map((c) => <ClimbRow key={c.id ?? c.title + c.dates} climb={c} />)}</div>;
}

function YearPicker({ year, thisYear }: { year: number | null; thisYear: number }) {
  const navigate = useNavigate();
  const [picked, setPicked] = useState(String(year ?? thisYear - 1));
  const years = Array.from({ length: thisYear - FIRST_YEAR }, (_, i) => thisYear - 1 - i);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`${SCHEDULE_PATH}?year=${picked}#open-climbs`);
  };
  return (
    <form className="year-picker" onSubmit={submit}>
      <label>Past years <select value={picked} onChange={(e) => setPicked(e.target.value)}>{years.map((y) => <option key={y}>{y}</option>)}</select></label>
      <button className="btn" type="submit">Show</button>
    </form>
  );
}

// ?year=YYYY (a past year) → that year's archive; anything else → this year.
function useArchiveYear(thisYear: number): number | null {
  const [params] = useSearchParams();
  const year = Number(params.get('year'));
  return Number.isInteger(year) && year >= FIRST_YEAR && year < thisYear ? year : null;
}

function Schedule({ year, thisYear }: { year: number | null; thisYear: number }) {
  const { upcoming, completed, loading } = useClimbSchedule(year);
  if (loading) return <p className="event-empty" role="status">Loading climbs…</p>;
  if (year !== null) {
    return (
      <>
        <ClimbList climbs={completed} empty={`No climbs recorded for ${year} yet.`} />
        <div className="event-cta"><Link className="btn btn-primary" to={`${SCHEDULE_PATH}#open-climbs`}>This year&apos;s climbs</Link></div>
        <YearPicker key={year} year={year} thisYear={thisYear} />
      </>
    );
  }
  return (
    <>
      <ClimbList climbs={upcoming} empty="No upcoming climbs posted yet. Check back soon." />
      <div className="event-cta"><Link className="btn btn-primary" to="/#join">Ask to join a climb <span aria-hidden="true">→</span></Link></div>
      {completed.length > 0 && (
        <>
          <h3 className="event-subhead">Completed in {thisYear}</h3>
          <ClimbList climbs={completed} empty="" />
        </>
      )}
      <YearPicker year={null} thisYear={thisYear} />
    </>
  );
}

function Preview({ limit }: { limit: number }) {
  const { upcoming, loading } = useClimbSchedule(null);
  return (
    <>
      {!loading && <ClimbList climbs={upcoming.slice(0, limit)} empty="No upcoming climbs posted yet." />}
      <div className="event-cta"><Link className="btn btn-primary" to={SCHEDULE_PATH}>See all open climbs <span aria-hidden="true">→</span></Link></div>
    </>
  );
}

export default function OpenClimbs({ limit }: Props) {
  const thisYear = manilaYear(new Date());
  const year = useArchiveYear(thisYear);
  let heading = 'Upcoming climbs.';
  if (limit) heading = 'Climb with us.';
  else if (year !== null) heading = `Climbs in ${year}.`;
  return (
    <section className="section open-climbs" id="open-climbs">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow" style={{ color: '#f2d65d' }}>Open climbs · Guests welcome</div><h2>{heading}</h2></div>
          <p>Open to members and non-members alike. No membership needed: join a climb, meet the community, and experience the MMS adventure firsthand.</p>
        </div>
        {limit ? <Preview limit={limit} /> : <Schedule year={year} thisYear={thisYear} />}
      </div>
    </section>
  );
}
