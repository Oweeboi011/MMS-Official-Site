import { useState } from 'react';
import type { TrailMap } from '../data/climbs';
import { allTrailsEmbed, googleMapEmbed, komootEmbed, type Embed } from '../lib/trailEmbeds';

function Frame({ embed, title, source, height }: { embed: Embed | null; title: string; source: string; height: number }) {
  if (!embed) return null;
  return (
    <figure className="trail-frame">
      <iframe src={embed.embedSrc} title={title} height={height} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
      <figcaption><a href={embed.pageUrl} target="_blank" rel="noopener noreferrer">Open in {source}</a></figcaption>
    </figure>
  );
}

// #160: AllTrails (else Google Maps) + Komoot per trail option; tabs when a mountain has several routes.
export default function TrailMaps({ maps, title }: { maps: TrailMap[]; title: string }) {
  const [active, setActive] = useState(0);
  if (!maps.length) return null;
  const trail = maps[Math.min(active, maps.length - 1)];
  const allTrails = allTrailsEmbed(trail.allTrailsUrl);
  return (
    <section className="climb-block" aria-labelledby="climb-maps">
      <h2 id="climb-maps">Trail map</h2>
      {maps.length > 1 && (
        <div className="trail-tabs">
          {maps.map((t, i) => (
            <button key={t.label || i} type="button" className="chip" aria-pressed={i === active} onClick={() => setActive(i)}>{t.label || `Trail ${i + 1}`}</button>
          ))}
        </div>
      )}
      {allTrails
        ? <Frame embed={allTrails} title={`${title} trail map (AllTrails)`} source="AllTrails" height={400} />
        : <Frame embed={googleMapEmbed(trail.googleMapsUrl, null)} title={`${title} location map`} source="Google Maps" height={400} />}
      <Frame embed={komootEmbed(trail.komootUrl)} title={`${title} route (Komoot)`} source="Komoot" height={600} />
    </section>
  );
}
