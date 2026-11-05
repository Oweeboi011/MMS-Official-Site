import { videos } from '../data/content';
import { asset } from '../lib/asset';

export default function Videos() {
  return (
    <section className="section" id="videos">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow" style={{ color: 'var(--green)' }}>Videos</div><h2>See the mountains.</h2></div>
          <p>Climb highlights and event recordings from MMS will be posted here.</p>
        </div>
        <div className="video-list">
          {videos.map((v) => (
            <figure className="video-card" key={v.src}>
              <video controls preload="none" poster={asset(v.poster)} src={v.src} aria-label={v.title} />
              <figcaption>
                <strong>{v.title}</strong>
                <span>
                  {v.place} · <a href={v.credit.source} target="_blank" rel="noopener noreferrer">Video</a> by {v.credit.author},{' '}
                  <a href={v.credit.licenseUrl} target="_blank" rel="noopener noreferrer">{v.credit.license}</a>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
