import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import RichText from '../components/RichText';
import { adminHelpTopics } from '../data/adminHelp';

// #173: the officers' manual. Public text (no data), linked from /admin.
export default function AdminHelpPage() {
  return (
    <>
      <PageHero compact eyebrow="Admin" title="Officer guide" intro="Setting up a climb, running registrations, climb day, and site content." image="/images/page-surveys.webp" />
      <main>
        <section className="section page-section">
          <div className="shell register-shell legal-page">
            {adminHelpTopics.map((t) => (
              <section key={t.id} id={t.id}>
                <h2>{t.title}</h2>
                <ol>
                  {t.steps.map((s) => (typeof s === 'string'
                    ? <li key={s}><RichText text={s} /></li>
                    : <li key={s.text}><RichText text={s.text} /><ul>{s.details?.map((d) => <li key={d}><RichText text={d} /></li>)}</ul></li>))}
                </ol>
              </section>
            ))}
            <p><Link to="/admin">Back to admin</Link> · <Link to="/help">Member help</Link></p>
          </div>
        </section>
      </main>
    </>
  );
}
