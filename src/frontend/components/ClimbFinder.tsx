import { useState } from 'react';
import { Link } from 'react-router-dom';
import { climbFinder, type ExperienceOption } from '../data/content';
import { recommendClimbs } from '../lib/recommend';
import { useClimbSchedule } from '../services/useSiteData';

// L7: suggests open climbs for a joiner's experience level (rules + copy in data/content.ts).
export default function ClimbFinder() {
  const [picked, setPicked] = useState<ExperienceOption | null>(null);
  const { upcoming } = useClimbSchedule(null);
  const climbs = picked ? recommendClimbs(upcoming, picked.difficulties) : [];

  return (
    <section className="section climb-finder" id="find-a-climb">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow" style={{ color: 'var(--green)' }}>Find your climb</div><h2>Which climb fits you?</h2></div>
          <p>Answer one question and we will suggest open climbs that match your experience.</p>
        </div>
        <fieldset className="finder-options">
          <legend>{climbFinder.question}</legend>
          {climbFinder.options.map((o) => (
            <label key={o.label} className={picked === o ? 'is-selected' : undefined}>
              <input type="radio" name="experience" checked={picked === o} onChange={() => setPicked(o)} />
              {o.label}
            </label>
          ))}
        </fieldset>
        {/* Always mounted so screen readers announce the first result too. */}
        <div className="finder-result" aria-live="polite">
          {picked && (
            <>
              <p>{picked.tip}</p>
              {climbs.length ? (
                <ul>{climbs.map((c) => <li key={c.title}><strong>{c.title}</strong> · {c.dates} · {c.difficulty}</li>)}</ul>
              ) : (
                <p>{climbFinder.none}</p>
              )}
              <Link className="btn btn-primary" to="/#join">Ask to join a climb <span aria-hidden="true">→</span></Link>
              <p className="finder-more">After your climb, <Link to="/surveys">tell us how it went</Link>.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
