import { Link } from 'react-router-dom';
import { heroMeta } from '../data/content';
import GlossaryText from './GlossaryText';

export default function Hero() {
  return (
    <header className="hero" id="home">

      <div className="shell hero-content">
        <div className="eyebrow">Metropolitan Mountaineering Society</div>
        <h1>Looking for<br />a new hobby?</h1>
        <p className="hero-copy">
          Join our hikes. MMS open climbs welcome first-timers and seasoned hikers alike: train with us, climb
          safely, and find your trail family.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/activities/open-climbs">Join an open climb <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-ghost" to="/membership/join">Become a member</Link>
        </div>
        <div className="hero-meta" aria-label="Highlights">
          {heroMeta.map((item) => (
            <div key={item.label}><strong><GlossaryText text={item.value} /></strong><span>{item.label}</span></div>
          ))}
        </div>
      </div>
    </header>
  );
}
