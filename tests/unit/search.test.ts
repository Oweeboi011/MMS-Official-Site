import { prepare, searchDocs, type SearchDoc } from '../../src/frontend/lib/search';
import { searchIndex } from '../../src/frontend/data/searchIndex';
import { sectionPath, sitemap, subpagePath } from '../../src/frontend/data/sitemap';

const docs: SearchDoc[] = [
  { path: '/a', title: 'Basic course', section: 'Training', text: 'Learn rope work and navigation.' },
  { path: '/b', title: 'Rescue team', section: 'Community', text: 'Rope rescue drills. Rope, rope, rope. SART party.' },
  { path: '/c', title: 'Rope basics', section: 'Training', text: 'Knots.' },
];
const index = prepare(docs);
const paths = (q: string) => searchDocs(index, q).hits.map((h) => h.doc.path);

describe('searchDocs', () => {
  it('needs every word, ignoring case and punctuation', () => {
    expect(paths('ROPE navigation!')).toEqual(['/a']);
    expect(paths('rope zzz')).toEqual([]);
    expect(paths('  ')).toEqual([]);
  });

  it('matches word starts only, and ignores 1-letter words', () => {
    expect(paths('art')).toEqual([]);
    expect(paths('nav')).toEqual(['/a']);
    expect(paths('a')).toEqual([]);
  });

  it('ranks title hits above body hits', () => {
    expect(paths('rope')[0]).toBe('/c');
  });

  it('snips around the first term found in the text and reports the full total', () => {
    expect(searchDocs(index, 'basic navigation').hits[0].snippet).toContain('navigation');
    const r = searchDocs(index, 'rope', 2);
    expect(r.hits).toHaveLength(2);
    expect(r.total).toBe(3);
  });
});

describe('searchIndex', () => {
  const all = prepare(searchIndex);
  const found = (q: string) => searchDocs(all, q, 100).hits.map((h) => h.doc.path);

  it('covers every subpage, every section page, and surveys', () => {
    const indexed = new Set(searchIndex.map((d) => d.path));
    sitemap.forEach((s) => {
      expect(indexed).toContain(sectionPath(s));
      s.pages.forEach((p) => expect(indexed).toContain(subpagePath(s, p)));
    });
    expect(indexed).toContain('/surveys');
  });

  it('finds glossary terms, FAQ answers, and surveys', () => {
    expect(found('leave no trace')).toContain('/about/glossary');
    expect(found('survey')).toContain('/surveys');
    expect(found('SART').length).toBeGreaterThan(0);
  });
});
