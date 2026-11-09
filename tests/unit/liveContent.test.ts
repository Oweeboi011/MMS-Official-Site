import { decodeFields, decodeQuery, runQueryBody } from '../../src/frontend/lib/firestoreRest';
import { leadershipBlocks, leadershipPath, toAnnouncement, toSettings, toSurveys } from '../../src/frontend/data/liveContent';
import { subpageContent } from '../../src/frontend/data/subpages';

describe('Firestore REST decoding', () => {
  it('turns typed REST values into plain values', () => {
    const doc = decodeFields({
      title: { stringValue: 'Hi' },
      order: { integerValue: '3' },
      published: { booleanValue: true },
      publishedAt: { timestampValue: '2026-11-08T16:30:00Z' },
      socials: { mapValue: { fields: { facebook: { stringValue: 'https://fb.com/mms' } } } },
      tags: { arrayValue: { values: [{ stringValue: 'a' }] } },
      empty: { arrayValue: {} },
      gone: { nullValue: null },
    });
    expect(doc).toEqual({
      title: 'Hi', order: 3, published: true, publishedAt: new Date('2026-11-08T16:30:00Z'),
      socials: { facebook: 'https://fb.com/mms' }, tags: ['a'], empty: [], gone: null,
    });
  });

  it('builds a filtered, ordered query and skips the no-match row', () => {
    expect(runQueryBody('announcements', { where: { field: 'published', equals: true }, orderByDesc: 'publishedAt', limit: 5 })).toEqual({
      structuredQuery: {
        from: [{ collectionId: 'announcements' }],
        where: { fieldFilter: { field: { fieldPath: 'published' }, op: 'EQUAL', value: { booleanValue: true } } },
        orderBy: [{ field: { fieldPath: 'publishedAt' }, direction: 'DESCENDING' }],
        limit: 5,
      },
    });
    expect(runQueryBody('surveys', { limit: 2 }).structuredQuery).toEqual({ from: [{ collectionId: 'surveys' }], limit: 2 });
    expect(decodeQuery([{ document: { fields: { a: { stringValue: 'x' } } } }, {}])).toEqual([{ a: 'x' }]);
  });
});

describe('live content mapping', () => {
  it('dates announcements in Manila time', () => {
    // 16:30 UTC on Nov 8 is already Nov 9 in Manila.
    const a = toAnnouncement({ title: 'T', summary: 'S', category: 'Club', publishedAt: new Date('2026-11-08T16:30:00Z') });
    expect(a).toEqual({ date: 'Nov 9, 2026', category: 'Club', title: 'T', summary: 'S' });
  });

  it('defaults a survey without a form to "coming soon" and lists open ones first', () => {
    const now = new Date('2026-11-09T12:00:00');
    const list = toSurveys([{ title: 'A', status: 'Closed' }, { title: 'B', status: 'Open', closes: 'Oct 1, 2026' }, { title: 'Q', audience: 'Everyone', status: 'Open' }], now);
    expect(list.map((s) => s.title)).toEqual(['Q', 'A', 'B']); // B is past its close date
    expect(list[0]).toMatchObject({ formUrl: '#', closes: undefined, status: 'Open' });
  });

  it('a saved settings doc wins, blanks included', () => {
    const s = toSettings({ motto: 'M', socials: { facebook: 'https://fb.com/mms', tiktok: '' } });
    expect(s.previewNotice).toBe('');
    expect(s.contactPhone).toBe('');
    expect(s.socials).toEqual([{ label: 'Facebook', href: 'https://fb.com/mms' }]);
  });

  it('puts live officers into the leadership page, past ones newest term first', () => {
    const docs = [
      { body: 'execom', role: 'Vice President', name: 'B', current: true, order: 2 },
      { body: 'execom', role: 'President', name: 'A', current: true, order: 1 },
      { body: 'execom', role: 'President', name: 'Old', current: false, term: '2018–2020', order: 1 },
      { body: 'bot', role: 'Trustee', name: 'Older', current: false, term: '2016–2018', order: 1 },
    ];
    expect(subpageContent[leadershipPath]).toBeDefined(); // a route rename must not silently turn live officers off
    const blocks = leadershipBlocks(subpageContent[leadershipPath], docs);
    const execom = blocks.find((b) => b.eyebrow === 'Executive Committee');
    expect(execom?.type === 'people' && execom.items.map((p) => p.name)).toEqual(['A', 'B']);
    // No live TComm yet: left out, never filled with sample names.
    expect(blocks.find((b) => b.eyebrow === 'Training Committee')).toBeUndefined();
    const past = blocks.find((b) => b.eyebrow === 'Past officers');
    expect(past?.type === 'table' && past.rows).toEqual([['2018–2020', 'Execom', 'President', 'Old'], ['2016–2018', 'BOT', 'Trustee', 'Older']]);
  });
});
