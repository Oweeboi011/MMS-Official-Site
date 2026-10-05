import { Link } from 'react-router-dom';
import { announcements } from '../data/content';

interface Props {
  // Show only the latest N (home page preview); omit for the full list.
  limit?: number;
}

export default function Announcements({ limit }: Props) {
  const items = limit ? announcements.slice(0, limit) : announcements;
  return (
    <section className="section" id="announcements">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow" style={{ color: 'var(--red)' }}>Announcements</div><h2>{limit ? 'Latest from MMS.' : 'All announcements.'}</h2></div>
          <p>Climb updates, training schedules, outreach calls, and club news.</p>
        </div>
        <div className="news-grid">
          {items.map((a) => (
            <article className="news-card" key={a.title}>
              <div className="news-meta"><span className={`news-tag tag-${a.category.toLowerCase()}`}>{a.category}</span><time>{a.date}</time></div>
              <h3>{a.title}</h3>
              <p>{a.summary}</p>
            </article>
          ))}
        </div>
        {limit && (
          <div className="section-actions">
            <Link className="text-link" to="/announcements">All announcements →</Link>
            <Link className="text-link" to="/surveys">Take a survey →</Link>
          </div>
        )}
      </div>
    </section>
  );
}
