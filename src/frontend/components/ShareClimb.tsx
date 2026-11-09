import { useState } from 'react';
import type { ClimbDetail } from '../data/climbs';
import { asset } from '../lib/asset';
import { storyImage } from '../lib/storyImage';

// #185: phones get the share sheet (Messenger, Instagram story, Viber…); desktop gets Facebook + Copy link (no FB App ID).
export default function ShareClimb({ climb }: { climb: ClimbDetail }) {
  const [status, setStatus] = useState('');
  const url = `${window.location.origin}/climbs/${climb.id ?? ''}`;
  const text = `${climb.title} · ${climb.dates} · MMS open climb, guests welcome`;
  const canShare = typeof navigator.share === 'function';

  const share = () => navigator.share({ title: climb.title, text, url }).catch(() => undefined);
  const copy = () => navigator.clipboard.writeText(url).then(() => setStatus('Link copied.'), () => setStatus(`Copy this link: ${url}`));
  const story = async () => {
    try {
      const blob = await storyImage({ title: climb.title, dates: climb.dates, location: climb.location, url }, asset('/mms-logo.png'));
      const file = new File([blob], 'mms-climb-story.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: climb.title });
      else setStatus('This browser can’t share images. Use Share… instead.');
    } catch {
      setStatus(''); // closed the share sheet
    }
  };

  return (
    <div className="share-climb" role="group" aria-labelledby="share-label">
      <span className="share-label" id="share-label">Share this climb</span>
      {canShare && <button type="button" className="btn btn-primary" onClick={() => void share()}>Share…</button>}
      {canShare && <button type="button" className="btn" onClick={() => void story()}>Instagram story</button>}
      <a className="btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
      <button type="button" className="btn" onClick={() => void copy()}>Copy link</button>
      <p className="share-status" role="status">{status}</p>
    </div>
  );
}
