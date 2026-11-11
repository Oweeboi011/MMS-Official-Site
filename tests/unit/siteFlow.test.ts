import { buildFlow } from '../../src/frontend/data/siteFlow';
import { siteMapPages, type PageFacts } from '../../src/frontend/data/siteMapStatus';

const empty: PageFacts = { counts: {}, settings: {}, openClimbs: 0, registrationOpen: false };

describe('buildFlow', () => {
  it('links every source to the pages it feeds, colouring what is not flowing', () => {
    const { nodes, edges } = buildFlow(siteMapPages(empty), empty);
    const state = (id: string) => nodes.find((n) => n.id === id)?.state;
    expect(state('officers')).toBe('partial');
    expect(state('p:/about/leadership')).toBe('sample');
    expect(edges.find((e) => e.id === 'officers>p:/about/leadership')?.state).toBe('sample');
    expect(state('f:Register for a climb')).toBe('off');
    expect(nodes.some((n) => n.id === 's:About MMS')).toBe(true);
  });

  it('turns green when the data exists', () => {
    const facts: PageFacts = { counts: { officers: 3 }, settings: {}, openClimbs: 2, registrationOpen: true };
    const { nodes } = buildFlow(siteMapPages(facts), facts);
    expect(nodes.find((n) => n.id === 'officers')?.state).toBe('live');
    expect(nodes.find((n) => n.id === 'p:/about/leadership')?.state).toBe('live');
    expect(nodes.find((n) => n.id === 'climbs')?.sub).toBe('2 open');
  });

  it('gives every node a unique id and every edge real endpoints', () => {
    const { nodes, edges } = buildFlow(siteMapPages(empty), empty);
    const ids = new Set(nodes.map((n) => n.id));
    expect(ids.size).toBe(nodes.length);
    for (const e of edges) expect([ids.has(e.from), ids.has(e.to)]).toEqual([true, true]);
  });
});
