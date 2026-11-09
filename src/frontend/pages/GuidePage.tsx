import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import RichText from '../components/RichText';
import { firstClimbChecklist, guideSections } from '../data/beginnerGuide';
import { leaveNoTrace } from '../data/subpages';

// #170: "New to mountaineering?" — what the ratings mean and what to expect on a first open climb.
export default function GuidePage() {
  return (
    <>
      <PageHero eyebrow="New to mountaineering?" title="Your first open climb" intro="What the ratings mean, what to prepare, and what MMS expects on the trail." image="/images/page-open-climbs.webp" />
      <main>
        <section className="section page-section">
          <div className="shell register-shell legal-page">
            <h2>Before you join your first climb</h2>
            <ol>{firstClimbChecklist.map((i) => <li key={i}>{i}</li>)}</ol>
            {guideSections.map((s) => (
              <section key={s.id} id={s.id}>
                <h2>{s.title}</h2>
                {s.paragraphs?.map((p) => <p key={p}><RichText text={p} /></p>)}
                {s.bullets && <ul>{s.bullets.map((b) => <li key={b}><RichText text={b} /></li>)}</ul>}
                {s.footnote && <p className="climb-muted">{s.footnote}</p>}
              </section>
            ))}
            <section id="lnt">
              <h2>Leave No Trace</h2>
              <p>The outdoor ethics every MMS climber follows, built on seven principles:</p>
              <ul>{leaveNoTrace.map((l) => <li key={l}>{l}</li>)}</ul>
            </section>
            <p><Link className="btn btn-primary" to="/activities/open-climbs">Find a climb</Link></p>
          </div>
        </section>
      </main>
    </>
  );
}
