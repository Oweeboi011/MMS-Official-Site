import { passportStats } from '../data/content';

export default function Passport() {
  return (
    <section className="section">
      <div className="shell">
        <div className="passport">
          <div className="eyebrow" style={{ color: '#f2d65d' }}>Members only</div>
          <h2>Your member profile.</h2>
          <p>Once you're a member, you get your own profile: every climb, summit, certificate, and volunteer hour logged in one place.</p>
          <div className="passport-grid">
            {passportStats.map((stat) => (
              <div className="passport-stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
