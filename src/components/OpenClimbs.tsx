import { Link } from 'react-router-dom';
import { openClimbs } from '../data/content';

interface Props {
  // Show only the next N climbs (home page preview); omit for the full list.
  limit?: number;
}

export default function OpenClimbs({ limit }: Props) {
  const climbs = limit ? openClimbs.slice(0, limit) : openClimbs;
  return (
    <section className="section open-climbs" id="open-climbs">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow" style={{ color: '#f2d65d' }}>Open climbs · Guests welcome</div><h2>{limit ? 'Climb with us.' : 'Upcoming climbs.'}</h2></div>
          <p>Open to members and non-members alike. No membership needed: join a climb, meet the community, and experience the MMS adventure firsthand.</p>
        </div>
        <div className="event-list">
          {climbs.map((climb) => (
            <div className="event" key={climb.title}>
              <div className="event-date"><strong>{climb.day}</strong><span>{climb.month}</span></div>
              <div>
                <div className="event-tags">
                  <span className={`event-tag type-${climb.type.toLowerCase()}`}>{climb.type}</span>
                  {climb.status === 'Closed' && <span className="event-tag closed">Closed</span>}
                </div>
                <h3>{climb.title}</h3>
                <p>{[climb.dates, climb.location, climb.difficulty, climb.elevation].filter(Boolean).join(' · ')}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="event-cta">
          {limit ? (
            <Link className="btn btn-primary" to="/open-climbs">See all open climbs <span aria-hidden="true">→</span></Link>
          ) : (
            <Link className="btn btn-primary" to="/#join">Ask to join a climb <span aria-hidden="true">→</span></Link>
          )}
        </div>
      </div>
    </section>
  );
}
