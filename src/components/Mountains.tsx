import { Link } from 'react-router-dom';
import { asset } from '../lib/asset';
import { mountains } from '../data/content';

export default function Mountains() {
  return (
    <section className="section" id="mountains">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow" style={{ color: 'var(--red)' }}>Mountain explorer</div><h2>Choose your next horizon.</h2></div>
          <p>Swipe on mobile to browse a sample collection of Philippine mountain destinations.</p>
        </div>
        <div className="mountain-row">
          {mountains.map((m) => (
            <article className="mountain-card" key={m.name}>
              <div className="mountain-photo">
                <img
                  src={asset(m.image)}
                  alt={m.alt}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="elevation">{m.region}</span>
              </div>
              <div className="mountain-body">
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <Link className="text-link" to="/open-climbs">Explore route →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
