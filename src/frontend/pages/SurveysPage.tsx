import PageHero from '../components/PageHero';
import { surveys } from '../data/content';

export default function SurveysPage() {
  return (
    <>
      <PageHero
        eyebrow="Have your say"
        title="Surveys"
        intro="Feedback from members and guests shapes our climbs, courses, and programs. Each survey takes only a few minutes."
        image="/images/page-surveys.webp"
      />
      <main>
        <section className="section" id="surveys">
          <div className="shell">
            <div className="section-head">
              <div><div className="eyebrow" style={{ color: 'var(--green)' }}>Surveys</div><h2>Open surveys.</h2></div>
              <p>Responses are used only to improve MMS activities.</p>
            </div>
            <div className="survey-list">
              {surveys.map((s) => (
                <article className={`survey-card${s.status === 'Closed' ? ' is-closed' : ''}`} key={s.title}>
                  <div className="news-meta">
                    <span className="news-tag">{s.audience}</span>
                    <span>{s.status === 'Open' ? `Closes ${s.closes}` : 'Closed'}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  {s.status === 'Open' ? (
                    <a className="btn btn-dark" href={s.formUrl} target="_blank" rel="noopener noreferrer">Take survey</a>
                  ) : (
                    <span className="survey-closed">No longer accepting responses</span>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
