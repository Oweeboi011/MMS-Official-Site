import { journey } from '../data/content';

export default function Journey() {
  return (
    <section className="section journey" id="journey">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow">The MMS journey</div><h2>From first step to expedition leader.</h2></div>
          <p>A clear pathway helps new members learn, participate, build experience, and give back to the outdoor community.</p>
        </div>
        <div className="journey-grid">
          {journey.map((step) => (
            <article className="journey-card" key={step.tag}>
              <span className="card-number">{step.tag}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
