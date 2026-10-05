import { officers } from '../data/content';

export default function About() {
  return (
    <section className="section about" id="about">
      <div className="shell">
        <div className="about-grid">
          <div>
            <div className="eyebrow" style={{ color: 'var(--red)' }}>About MMS</div>
            <h2 className="about-title">Climbing together since 1994.</h2>
          </div>
          <div className="about-copy">
            <p>
              The Metropolitan Mountaineering Society is a Philippine mountaineering organization built on training,
              responsible exploration, leadership, and conservation.
            </p>
            <p>
              From weekend open climbs to multi-day major expeditions, our members train together, look after each other
              through our Search and Rescue Team, and give back to the communities and trails that host us.
            </p>
          </div>
        </div>
        <div className="officers">
          {officers.map((o) => (
            <div className="officer" key={o.role}><span>{o.role}</span><strong>{o.name}</strong></div>
          ))}
        </div>
      </div>
    </section>
  );
}
