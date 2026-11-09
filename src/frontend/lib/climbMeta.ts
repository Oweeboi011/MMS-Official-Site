import type { Doc } from './firestoreRest';

// Per-climb link previews (old ogPrerender): crawlers don't run JS, so functions/climbs/[id].ts swaps the
// <!--og--> block of index.html for these tags. Titles and descriptions are officer-typed text: always escaped.
const TYPE_LABEL: Record<string, string> = { minor: 'Minor climb', major: 'Major climb', special: 'Special climb' };
const MAX_DESCRIPTION = 200;
const FALLBACK_IMAGE = '/images/hero-pulag-sunrise.webp';

export const escapeAttr = (value: unknown) =>
  String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const text = (v: unknown) => (typeof v === 'string' ? v.split(/\s+/).filter(Boolean).join(' ') : '');

// Cut at a word boundary so previews don't end mid-word.
export function truncate(value: string, max = MAX_DESCRIPTION) {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const space = cut.lastIndexOf(' ');
  let end = space > max * 0.6 ? space : max;
  while (end > 0 && ',.;: '.includes(cut[end - 1])) end -= 1;
  return `${cut.slice(0, end)}…`;
}

function description(climb: Doc) {
  const lead = [TYPE_LABEL[text(climb.type)], text(climb.location), climb.elevation ? `${text(String(climb.elevation))} MASL` : '', text(climb.dateLabel)]
    .filter(Boolean).join(' · ');
  const blurb = text(climb.description);
  return truncate(blurb ? `${lead}. ${blurb}` : lead);
}

function image(climb: Doc, origin: string) {
  const first = Array.isArray(climb.trailImages) ? climb.trailImages.find((u) => typeof u === 'string' && u.startsWith('https://')) : undefined;
  return (first as string | undefined) ?? `${origin}${FALLBACK_IMAGE}`;
}

export function climbMetaBlock(climb: Doc, url: string, origin: string) {
  const name = text(climb.title);
  const date = text(climb.dateLabel);
  const label = [name, date].filter(Boolean).join(' · ');
  const title = escapeAttr(name ? `${label} | MMS Open Climbs` : 'MMS Open Climbs');
  const desc = escapeAttr(description(climb));
  const img = escapeAttr(image(climb, origin));
  return [
    `<meta name="description" content="${desc}" />`,
    `<title>${title}</title>`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
    '<meta property="og:type" content="article" />',
    '<meta property="og:site_name" content="Metropolitan Mountaineering Society" />',
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:image" content="${img}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${img}" />`,
  ].join('\n  ');
}

// Unmarked shell (older build) → unchanged.
export function withMeta(html: string, block: string) {
  const open = html.indexOf('<!--og-->');
  const close = html.indexOf('<!--/og-->');
  if (open < 0 || close < open) return html;
  return `${html.slice(0, open)}<!--og-->\n  ${block}\n  ${html.slice(close)}`;
}
