// Trail map links → safe iframe sources (ported from mms-open-climbs utils/trailEmbeds + eventMaps).
// Only https URLs on the expected host ever reach an iframe.
export interface Embed { embedSrc: string; pageUrl: string }
export interface Coords { lat: number; lng: number }

// Admins may paste a whole <iframe> snippet; keep only its src.
export function normalizeEmbedInput(input: string): string {
  const raw = input.trim();
  if (!/<iframe/i.test(raw)) return raw;
  const src = /src\s*=\s*["']([^"']+)["']/i.exec(raw)?.[1];
  return src ? src.replace(/&amp;/g, '&') : raw;
}

function siteUrl(input: string, host: RegExp): URL | null {
  try {
    const url = new URL(normalizeEmbedInput(input));
    return url.protocol === 'https:' && host.test(url.hostname) ? url : null;
  } catch {
    return null;
  }
}

export function komootEmbed(input: string): Embed | null {
  const url = siteUrl(input, /(^|\.)komoot\.(com|de)$/i);
  const tourId = url?.pathname.match(/\/tour\/(\d+)/)?.[1];
  if (!url || !tourId) return null;
  const page = new URLSearchParams();
  const token = url.searchParams.get('share_token');
  if (token) page.set('share_token', token);
  const embed = new URLSearchParams(page);
  embed.set('layout', 'classic');
  embed.set('profile', '1');
  const base = `https://www.komoot.com/tour/${tourId}`;
  return { embedSrc: `${base}/embed?${embed}`, pageUrl: page.toString() ? `${base}?${page}` : base };
}

export function allTrailsEmbed(input: string): Embed | null {
  const url = siteUrl(input, /(^|\.)alltrails\.com$/i);
  const path = url?.pathname.match(/\/(?:widget\/)?trail\/(.+?)\/?$/)?.[1];
  if (!url || !path) return null;
  const params = new URLSearchParams(url.search);
  if (!params.has('u')) params.set('u', 'm');
  return { embedSrc: `https://www.alltrails.com/widget/trail/${path}?${params}`, pageUrl: `https://www.alltrails.com/trail/${path}` };
}

// Coordinates from a Google Maps link (…/@lat,lng,zoomz or ?q=lat,lng).
export function mapsCoords(link: string): Coords | null {
  const m = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(link) ?? /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(link);
  return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null;
}

const mapsPlace = (link: string) => {
  const m = /\/maps\/place\/([^/@?]+)/.exec(link);
  return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
};

// Keyless Google Maps embed for a place name or coordinates.
export function googleMapEmbed(link: string, fallback: Coords | null): Embed | null {
  if (!siteUrl(link, /(^|\.)google\.[a-z.]+$|^maps\.app\.goo\.gl$|^goo\.gl$/i) && !fallback) return null;
  const place = mapsPlace(link);
  const coords = mapsCoords(link) ?? fallback;
  const q = place ?? (coords ? `${coords.lat},${coords.lng}` : null);
  if (!q) return null;
  return { embedSrc: `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=13&output=embed`, pageUrl: link || `https://www.google.com/maps?q=${q}` };
}
