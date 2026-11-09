import PageHero from '../components/PageHero';
import { PRIVACY_NOTICE_VERSION, privacyNotice } from '../data/privacyNotice';

// #164 / item 32: the notice registrants agree to, public so anyone can read it before signing up.
export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Data Privacy Act (RA 10173)" title="Privacy Notice" intro={`How MMS handles your personal information. Version ${PRIVACY_NOTICE_VERSION}.`} image="/images/page-surveys.webp" />
      <main>
        <section className="section page-section">
          <div className="shell register-shell legal-page">
            {privacyNotice.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.body && <p>{s.body}</p>}
                {s.items && <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>}
              </section>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
