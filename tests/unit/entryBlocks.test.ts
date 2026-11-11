import { dateLabel, entryBlocks, entryPageOf } from '../../src/frontend/data/entryBlocks';

describe('dateLabel', () => {
  it('writes one day, a range in a month, and a range across months', () => {
    expect(dateLabel('2026-12-05')).toBe('Dec 5');
    expect(dateLabel('2026-12-05', '2026-12-07')).toBe('Dec 5–7');
    expect(dateLabel('2026-11-29', '2026-12-02')).toBe('Nov 29 – Dec 2');
    expect(dateLabel('2026-12-05', '2026-12-05')).toBe('Dec 5');
    expect(dateLabel('')).toBe('');
  });
});

describe('entryBlocks', () => {
  const doc = (title: string, data: Record<string, string>) => ({ title, data });

  it('sorts the calendar by date and labels the type', () => {
    const [block] = entryBlocks('/activities/calendar', [doc('B', { date: '2026-12-12', kind: 'event' }), doc('A', { date: '2026-12-05', kind: 'climb', place: 'Tanay' })]);
    expect(block).toMatchObject({ type: 'table', rows: [['Dec 5', 'A', 'Climb or hike', 'Tanay'], ['Dec 12', 'B', 'Club event', '']] });
  });

  it('puts each media kind on its own page', () => {
    const docs = [doc('Album', { kind: 'album', url: 'https://x.com/a' }), doc('Clip', { kind: 'video', url: 'https://x.com/v' })];
    expect(entryBlocks('/media/photos', docs)[0]).toMatchObject({ items: [{ title: 'Album', href: 'https://x.com/a' }] });
    expect(entryBlocks('/media/videos', docs)[0]).toMatchObject({ items: [{ title: 'Clip' }] });
    expect(entryBlocks('/media/publications', docs)).toEqual([]);
  });

  it('splits membership sections between the benefits and join pages', () => {
    const docs = [doc('Fees', { section: 'fees', body: 'One.\n\nTwo.' }), doc('Steps', { section: 'steps', body: 'Go.' })];
    expect(entryBlocks('/membership/benefits', docs)).toEqual([{ type: 'text', eyebrow: 'Fees', title: 'Fees', paragraphs: ['One.', 'Two.'] }]);
    expect(entryBlocks('/membership/join', docs)).toMatchObject([{ eyebrow: 'How to join', title: 'Steps' }]);
  });

  it('builds trail and destination cards, and ignores entries without a title or unknown pages', () => {
    expect(entryBlocks('/explore/trails', [doc('T', { mountain: 'Mt. X', region: 'Benguet', details: 'Easy' })])[0]).toMatchObject({ items: [{ tag: 'Benguet', title: 'Mt. X', description: 'Easy' }] });
    expect(entryBlocks('/explore/destinations', [doc('', { region: 'Bohol' })])).toEqual([]);
    expect(entryBlocks('/about/our-story', [doc('X', {})])).toEqual([]);
    expect(entryPageOf('/explore/trails')).toBe('trails');
    expect(entryPageOf('/about/our-story')).toBeNull();
  });
});
