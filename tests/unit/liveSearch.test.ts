import { liveSearchDocs } from '../../src/frontend/data/liveSearch';
import { searchDocs, prepare } from '../../src/frontend/lib/search';

describe('live search docs', () => {
  it('adds live climbs and news, skipping what the static index already has', () => {
    const climb = { id: 'c1', title: 'Mt. Pulag', dates: 'Nov 20–22', location: 'Kabayan, Benguet', type: 'Major', difficulty: 'Advanced', rating: '7/9', over: false, day: '', month: '', status: 'Open' } as const;
    const news = { title: 'Pulag permits open', summary: 'Apply early', category: 'Climbs', date: 'Nov 9, 2026' } as const;
    const docs = liveSearchDocs([news], [climb, { ...climb, id: undefined, title: 'Sample' }], [{ path: '/media/news', title: 'Pulag permits open', section: 'News', text: '' }]);
    expect(docs.map((d) => d.path)).toEqual(['/climbs/c1']);
    expect(searchDocs(prepare(docs), 'benguet').hits[0].doc.title).toBe('Mt. Pulag');
  });
});
