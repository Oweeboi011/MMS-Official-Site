import { Link } from 'react-router-dom';
import { heroMeta } from '../data/content';
import Nav from './Nav';

export default function Hero() {
  return (
    <header className="hero" id="home">
      <Nav />

      <div className="shell hero-content">
        <div className="eyebrow">Metropolitan Mountaineering Society</div>
        <h1>Go beyond<br />the trail.</h1>
        <p className="hero-copy">
          A mobile-first concept for a Philippine mountaineering community built around training, responsible
          exploration, leadership, and conservation.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/open-climbs">Join an open climb <span aria-hidden="true">→</span></Link>
          <a className="btn btn-ghost" href="#join">Become a member</a>
        </div>
        <div className="hero-meta" aria-label="Highlights">
          {heroMeta.map((item) => (
            <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
          ))}
        </div>
      </div>
    </header>
  );
}
