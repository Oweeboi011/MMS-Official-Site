// Splits text into plain strings and known terms (whole words only), for <abbr> rendering.
export type Segment = string | { term: string };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Build once per term list; longest first so BMCM wins over BMC.
export const termPattern = (terms: string[]) =>
  new RegExp(`\\b(${[...terms].sort((a, b) => b.length - a.length).map(escape).join('|')})\\b`, 'g');

export function splitTerms(text: string, pattern: RegExp): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push({ term: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : [text];
}
