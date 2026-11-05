import { gallery, photoAlbumsUrl } from '../data/content';
import { asset } from '../lib/asset';

export default function Gallery() {
  return (
    <section className="section" id="gallery">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow" style={{ color: 'var(--green)' }}>Gallery</div><h2>Moments on the trail.</h2></div>
          <p>Snapshots from our climbs, trainings, and outreach.</p>
        </div>
        <div className="gallery">
          {gallery.map((photo) => (
            <img
              key={photo.src}
              src={asset(photo.src)}
              alt={photo.alt}
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ))}
        </div>
        {photoAlbumsUrl && (
          <p><a className="btn" href={photoAlbumsUrl} target="_blank" rel="noopener noreferrer" aria-label="View all albums (opens in new tab)">View all albums <span aria-hidden="true">↗</span></a></p>
        )}
      </div>
    </section>
  );
}
