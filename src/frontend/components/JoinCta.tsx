import { membershipEmail, motto } from '../data/content';

export default function JoinCta() {
  return (
    <section className="cta" id="join">
      <div className="shell">
        <div className="eyebrow">{motto}</div>
        <h2>The summit starts here.</h2>
        <p>Train with a community, explore responsibly, and contribute to the places that make every expedition possible.</p>
        <a className="btn" href={`mailto:${membershipEmail}?subject=MMS%20Membership%20Inquiry`}>Start membership inquiry</a>
      </div>
    </section>
  );
}
