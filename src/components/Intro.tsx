import { stats } from '../data/content';

export default function Intro() {
  return (
    <section className="section">
      <div className="shell">
        <div className="intro-grid">
          <div className="statement">Built for the climb.<br /><span className="accent">Grounded in community.</span></div>
          <p className="intro-copy">
            The experience moves from discovery to training, expeditions, and stewardship. Strong typography, immersive
            landscapes, and trail-inspired details give MMS a distinctive outdoor identity.
          </p>
        </div>
        <div className="stats">
          {stats.map((stat) => (
            <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}
