import type { ContentBlock } from '../data/subpages';

interface Props {
  blocks: ContentBlock[];
}

function Head({ eyebrow, title, intro }: { eyebrow?: string; title?: string; intro?: string }) {
  if (!eyebrow && !title) return null;
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="eyebrow" style={{ color: 'var(--red)' }}>{eyebrow}</div>}
        {title && <h2>{title}</h2>}
      </div>
      {intro && <p>{intro}</p>}
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text':
      return (
        <div className="prose">
          {block.paragraphs.map((p) => <p key={p}>{p}</p>)}
        </div>
      );
    case 'stats':
      return (
        <div className="stats">
          {block.items.map((s) => <div className="stat" key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>)}
        </div>
      );
    case 'cards':
      return (
        <div className="section-grid">
          {block.items.map((item) => (
            <article className="program-card" key={item.title}>
              {item.tag && <span className="program-tag">{item.tag}</span>}
              <h3>{item.title}</h3>
              {item.meta && <span className="card-meta">{item.meta}</span>}
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      );
    case 'steps':
      return (
        <ol className="steps">
          {block.items.map((item, i) => (
            <li className="step" key={item.title}>
              <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>{block.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join('|')}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'timeline':
      return (
        <ol className="timeline">
          {block.items.map((item) => (
            <li key={item.year + item.title}>
              <span className="timeline-year">{item.year}</span>
              <div><h3>{item.title}</h3><p>{item.description}</p></div>
            </li>
          ))}
        </ol>
      );
    case 'people':
      return (
        <div className="officers people">
          {block.items.map((p) => (
            <div className="officer" key={p.role + p.name}>
              <span>{p.role}</span>
              <strong>{p.name}</strong>
              {p.note && <small>{p.note}</small>}
            </div>
          ))}
        </div>
      );
    case 'quotes':
      return (
        <div className="section-grid">
          {block.items.map((q) => (
            <figure className="quote" key={q.name}>
              <blockquote>“{q.quote}”</blockquote>
              <figcaption><strong>{q.name}</strong><span>{q.meta}</span></figcaption>
            </figure>
          ))}
        </div>
      );
    case 'checklist':
      return (
        <div className="checklist">
          <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      );
  }
}

// Renders a subpage's sample content (see src/data/subpages.ts).
export default function ContentBlocks({ blocks }: Props) {
  return (
    <>
      {blocks.map((block, i) => (
        <section className="section page-section" key={i}>
          <div className="shell">
            <Head eyebrow={block.eyebrow} title={block.title} intro={block.intro} />
            <Block block={block} />
          </div>
        </section>
      ))}
    </>
  );
}
