import { faqs } from '../data/content';

export default function Faq() {
  return (
    <section className="section" id="faq">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow" style={{ color: 'var(--red)' }}>FAQ</div><h2>Before your first climb.</h2></div>
          <p>Common questions from guests and new members.</p>
        </div>
        <div className="faq">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
