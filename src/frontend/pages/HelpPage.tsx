import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import RichText from '../components/RichText';
import { helpTopics, type HelpStep } from '../data/helpGuide';
import { registrationEnabled } from '../services/firebaseEnv';

function Step({ step }: { step: string | HelpStep }) {
  if (typeof step === 'string') return <li><RichText text={step} /></li>;
  return <li><RichText text={step.text} />{step.details && <ul>{step.details.map((d) => <li key={d}><RichText text={d} /></li>)}</ul>}</li>;
}

// #164: member help. Registration topics appear only once registration is on here.
export default function HelpPage() {
  const topics = helpTopics.filter((t) => registrationEnabled || !t.registration);
  return (
    <>
      <PageHero eyebrow="Help" title="How the site works" intro="Finding climbs, your account, and joining as a guest or member." image="/images/page-open-climbs.webp" />
      <main>
        <section className="section page-section">
          <div className="shell register-shell legal-page">
            <nav aria-label="Help topics"><ul className="climb-links">{topics.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.title}</a></li>)}</ul></nav>
            {!registrationEnabled && <p className="climb-notice" role="note">Registering and paying on this site open soon. Until then, message us to join a climb.</p>}
            {topics.map((t) => (
              <section key={t.id} id={t.id}>
                <h2>{t.title}</h2>
                {t.intro && <p>{t.intro}</p>}
                <ol>{t.steps.map((s) => <Step key={typeof s === 'string' ? s : s.text} step={s} />)}</ol>
              </section>
            ))}
            <p>Still stuck? <Link to="/#join">Send us a message</Link>. New to climbing? Read the <Link to="/activities/open-climbs/guide">beginner guide</Link>. Privacy: <Link to="/privacy">privacy notice</Link>.</p>
          </div>
        </section>
      </main>
    </>
  );
}
