import { useState } from 'react';
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

function Table({ columns, rows, pageSize }: { columns: string[]; rows: string[][]; pageSize?: number }) {
  // Page is tied to the rows it was picked for, so a new table (e.g. after navigating) starts at page 1.
  const [state, setState] = useState({ rows, page: 0 });
  const page = state.rows === rows ? state.page : 0;
  const setPage = (p: number) => setState({ rows, page: p });
  const size = pageSize && pageSize > 0 ? pageSize : Math.max(rows.length, 1);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const shown = rows.slice(page * size, (page + 1) * size);
  return (
    <>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr>{columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.join('|')}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav className="pager" aria-label="Table pages">
          <span aria-live="polite">{page * size + 1}–{Math.min((page + 1) * size, rows.length)} of {rows.length}</span>
          <div>
            <button type="button" onClick={() => setPage(page - 1)} disabled={page === 0} aria-label="Previous page">‹</button>
            {Array.from({ length: pages }, (_, i) => (
              <button type="button" key={i} onClick={() => setPage(i)} aria-current={i === page ? 'true' : undefined}>{i + 1}</button>
            ))}
            <button type="button" onClick={() => setPage(page + 1)} disabled={page === pages - 1} aria-label="Next page">›</button>
          </div>
        </nav>
      )}
    </>
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
              {item.href && (
                <a className="card-link" href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.linkLabel ?? 'Open'}: ${item.title} (opens in new tab)`}>
                  {item.linkLabel ?? 'Open'} <span aria-hidden="true">↗</span>
                </a>
              )}
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
      return <Table columns={block.columns} rows={block.rows} pageSize={block.pageSize} />;
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
