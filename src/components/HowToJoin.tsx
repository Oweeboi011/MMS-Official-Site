import { joinSteps } from '../data/content';

export default function HowToJoin() {
  return (
    <section className="section" id="membership">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow" style={{ color: 'var(--red)' }}>How to join</div><h2>Four steps to MMS.</h2></div>
          <p>Every member starts as a guest. Here is the path from your first open climb to induction.</p>
        </div>
        <ol className="steps">
          {joinSteps.map((step) => (
            <li className="step" key={step.tag}>
              <span className="step-num">{step.tag}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
        <p className="fine-print">Membership and BMC fees, schedules, and requirements will be announced each season.</p>
      </div>
    </section>
  );
}
