import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

// #138: trail photos; tap for a full-screen view (← → to browse, Esc to close).
export default function ClimbPhotos({ photos, title }: { photos: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open !== null) close.current?.focus(); }, [open]);
  if (!photos.length) return null;
  const step = (by: number) => setOpen((i) => (i === null ? i : (i + by + photos.length) % photos.length));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(null);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  };
  return (
    <section className="climb-block" aria-labelledby="climb-photos">
      <h2 id="climb-photos">Photos</h2>
      <div className="photo-grid">
        {photos.map((src, i) => (
          <button key={src} type="button" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`}>
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} photo ${open + 1} of ${photos.length}`} onKeyDown={onKey}>
          <img src={photos[open]} alt={`${title} photo ${open + 1}`} />
          <div className="lightbox-bar">
            {photos.length > 1 && <button type="button" className="btn" onClick={() => step(-1)} aria-label="Previous photo">‹</button>}
            <button ref={close} type="button" className="btn btn-primary" onClick={() => setOpen(null)}>Close</button>
            {photos.length > 1 && <button type="button" className="btn" onClick={() => step(1)} aria-label="Next photo">›</button>}
          </div>
        </div>
      )}
    </section>
  );
}
