// In-browser site search: every query word (2+ chars) must start a word in the page; title hits rank higher.
export interface SearchDoc {
  path: string;
  title: string;
  section: string;
  text: string;
}

interface Prepared {
  doc: SearchDoc;
  titleWords: string[];
  textWords: string[];
}

export interface SearchResult {
  hits: { doc: SearchDoc; snippet: string }[];
  total: number;
}

const words = (s: string) => s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

// Lowercase + tokenize once, not per keystroke.
export const prepare = (docs: SearchDoc[]): Prepared[] =>
  docs.map((doc) => ({ doc, titleWords: words(doc.title), textWords: words(doc.text) }));

const hitsIn = (list: string[], term: string) => list.filter((w) => w.startsWith(term)).length;

// Snippet from the original text around the first term found there (regex on the original keeps indexes right).
function snippet(text: string, terms: string[], width = 140): string {
  for (const t of terms) {
    const m = new RegExp(`(?<![\\p{L}\\p{N}])${t}`, 'iu').exec(text);
    if (!m) continue;
    const start = Math.max(0, m.index - 40);
    return (start ? '…' : '') + text.slice(start, start + width).trim() + (start + width < text.length ? '…' : '');
  }
  return text.slice(0, width) + (text.length > width ? '…' : '');
}

export function searchDocs(index: Prepared[], query: string, limit = 20): SearchResult {
  const terms = words(query).filter((t) => t.length > 1);
  if (!terms.length) return { hits: [], total: 0 };
  const scored = index
    .map((p) => {
      const perTerm = terms.map((t) => hitsIn(p.titleWords, t) * 5 + hitsIn(p.textWords, t));
      return perTerm.every((n) => n > 0) ? { doc: p.doc, score: perTerm.reduce((a, b) => a + b, 0) } : null;
    })
    .filter((h) => h !== null)
    .sort((a, b) => b.score - a.score);
  return {
    total: scored.length,
    hits: scored.slice(0, limit).map(({ doc }) => ({ doc, snippet: snippet(doc.text, terms) })),
  };
}
