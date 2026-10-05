import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import type { ProgramPageData } from '../data/pages';

interface Props {
  page: ProgramPageData;
  children?: ReactNode;
}

export default function ProgramPage({ page, children }: Props) {
  const { cta } = page;
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} image={page.image} />

      <main style={{ '--accent': page.accent } as CSSProperties}>
        <section className="section page-facts">
          <div className="shell stats">
            {page.facts.map((f) => (
              <div className="stat" key={f.label}><strong>{f.value}</strong><span>{f.label}</span></div>
            ))}
          </div>
        </section>

        {children}

        {page.sections.map((section) => (
          <section className="section page-section" key={section.title}>
            <div className="shell">
              <div className="section-head">
                <div><div className="eyebrow" style={{ color: 'var(--red)' }}>{section.eyebrow}</div><h2>{section.title}</h2></div>
                {section.intro && <p>{section.intro}</p>}
              </div>
              {section.variant === 'steps' ? (
                <ol className="steps">
                  {section.items.map((item, i) => (
                    <li className="step" key={item.title}>
                      <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="programs-grid">
                  {section.items.map((item) => (
                    <article className="program-card" key={item.title}>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}

        {page.checklist && (
          <section className="section page-section">
            <div className="shell">
              <div className="checklist">
                <h2>{page.checklist.title}</h2>
                <ul>
                  {page.checklist.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </section>
        )}

        <section className="cta">
          <div className="shell">
            <div className="eyebrow">{page.title}</div>
            <h2>{cta.title}</h2>
            <p>{cta.text}</p>
            {cta.external ? (
              <a className="btn" href={cta.href} target="_blank" rel="noopener noreferrer">{cta.label}</a>
            ) : (
              <Link className="btn" to={cta.href}>{cta.label}</Link>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
