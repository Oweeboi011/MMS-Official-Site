import { legacyRedirects, sectionPath, sitemap, subpagePath } from '../../src/data/sitemap';
import { subpageContent } from '../../src/data/subpages';

describe('sitemap', () => {
  it('has unique section and subpage slugs', () => {
    const sections = sitemap.map((s) => s.slug);
    expect(new Set(sections).size).toBe(sections.length);
    for (const s of sitemap) {
      const pages = s.pages.map((p) => p.slug);
      expect(new Set(pages).size).toBe(pages.length);
    }
  });

  it('builds subpage paths as /section/page', () => {
    const [section] = sitemap;
    expect(subpagePath(section, section.pages[0])).toBe(`/${section.slug}/${section.pages[0].slug}`);
    expect(sectionPath(section)).toContain(section.slug);
  });

  it('only keys subpage content by real subpage paths', () => {
    const paths = new Set(sitemap.flatMap((s) => s.pages.map((p) => subpagePath(s, p))));
    Object.keys(subpageContent).forEach((path) => expect(paths).toContain(path));
  });

  it('only redirects to real subpage paths', () => {
    const paths = new Set(sitemap.flatMap((s) => s.pages.map((p) => subpagePath(s, p))));
    Object.values(legacyRedirects).forEach((to) => expect(paths).toContain(to));
  });
});
