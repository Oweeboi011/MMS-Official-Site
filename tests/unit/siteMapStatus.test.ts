import { siteMapPages, stateCounts, type PageFacts } from '../../src/frontend/data/siteMapStatus';

const empty: PageFacts = { counts: {}, settings: {}, openClimbs: 0, registrationOpen: false };
const find = (pages: ReturnType<typeof siteMapPages>, path: string) => pages.find((p) => p.path === path);

describe('siteMapPages', () => {
  it('flags pages without real data and features that are off', () => {
    const p = siteMapPages(empty);
    expect(find(p, '/about/leadership')?.state).toBe('sample');
    expect(find(p, '/media/news')?.state).toBe('partial');
    expect(find(p, '/about/our-story')?.state).toBe('sample');
    expect(p.find((x) => x.label === 'Register for a climb')?.state).toBe('off');
    expect(find(p, '/admin/insights')?.state).toBe('live');
  });

  it('goes live when the data exists', () => {
    const p = siteMapPages({ counts: { officers: 5, announcements: 2 }, settings: { membershipEmail: 'a@b.co' }, openClimbs: 3, registrationOpen: true });
    expect(find(p, '/about/leadership')?.state).toBe('live');
    expect(find(p, '/media/news')?.state).toBe('live');
    expect(find(p, '/activities/upcoming')?.state).toBe('live');
    expect(find(p, '/membership/join')?.state).toBe('live');
    expect(p.find((x) => x.label === 'Register for a climb')?.state).toBe('live');
  });

  it('counts every page once', () => {
    const p = siteMapPages(empty);
    const c = stateCounts(p);
    expect(c.live + c.partial + c.sample + c.off).toBe(p.length);
  });
});
