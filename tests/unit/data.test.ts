import { asset } from '../../src/lib/asset';
import { topMountainColumns, topMountains } from '../../src/data/topMountains';
import { subpageContent } from '../../src/data/subpages';
import { photoAlbumsUrl } from '../../src/data/content';

const elevation = (row: string[]) => Number(row[3].replace(/[^\d]/g, ''));

describe('top mountains data', () => {
  it('has 100 ranked rows matching the columns', () => {
    expect(topMountains).toHaveLength(100);
    topMountains.forEach((row, i) => {
      expect(row).toHaveLength(topMountainColumns.length);
      expect(row[0]).toBe(String(i + 1));
    });
  });

  it('is sorted by elevation, highest first', () => {
    for (let i = 1; i < topMountains.length; i++) expect(elevation(topMountains[i])).toBeLessThanOrEqual(elevation(topMountains[i - 1]));
  });

  it('only uses known climb types', () => {
    topMountains.forEach((row) => expect(['Major', 'Minor', 'Restricted', '—']).toContain(row[4]));
  });
});

describe('asset', () => {
  it('prefixes public paths with the deploy base', () => {
    expect(asset('/images/a.webp')).toBe(`${import.meta.env.BASE_URL}images/a.webp`);
    expect(asset('images/a.webp')).toBe(`${import.meta.env.BASE_URL}images/a.webp`);
  });
});

describe('external links', () => {
  const cardHrefs = (path: string) => (subpageContent[path] ?? [])
    .flatMap((b) => (b.type === 'cards' ? b.items.map((i) => i.href) : []))
    .filter(Boolean);

  it('card links are https', () => {
    Object.keys(subpageContent).flatMap(cardHrefs).forEach((h) => expect(h).toMatch(/^https:\/\//));
  });

  it('album links point to Drive folders, not files or hotlinked images', () => {
    [...cardHrefs('/media/photos'), photoAlbumsUrl].filter(Boolean)
      .forEach((h) => expect(h).toMatch(/^https:\/\/drive\.google\.com\/drive\/folders\/[\w-]+/));
  });
});
