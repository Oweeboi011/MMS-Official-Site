import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { programs } from '../data/content';

export default function Programs() {
  return (
    <section className="section" id="programs">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow" style={{ color: 'var(--green)' }}>Programs</div><h2>Ways to climb with us.</h2></div>
          <p>From your first course to giving back, every program builds safer, stronger, more responsible mountaineers.</p>
        </div>
        <div className="programs-grid">
          {programs.map((program) => (
            <article className="program-card" key={program.title} style={{ '--accent': program.accent } as CSSProperties}>
              <span className="program-tag">{program.tag}</span>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
              <Link className="text-link" to={program.cta.href}>{program.cta.label} →</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
