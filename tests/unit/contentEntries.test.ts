import { cleanData, entryActions, entrySummary, toEntry, validateEntry } from '../../src/frontend/data/contentEntries';

describe('validateEntry', () => {
  it('needs a title and the page’s required fields', () => {
    expect(validateEntry('calendar', '', { date: '2026-12-05' })).toBe('Add a title.');
    expect(validateEntry('calendar', 'Pulag', {})).toBe('Date is required.');
    expect(validateEntry('calendar', 'Pulag', { date: '2026-12-05' })).toBe('');
    expect(validateEntry('membership', 'Fees', { section: 'fees' })).toBe('Text is required.');
  });

  it('only accepts https links and limits length', () => {
    expect(validateEntry('media', 'Album', { kind: 'album', url: 'x.com/album' })).toMatch(/https/);
    expect(validateEntry('media', 'Album', { kind: 'album', url: 'https://x.com' })).toBe('');
    expect(validateEntry('trails', 'T', { mountain: 'x'.repeat(201) })).toMatch(/too long/);
    expect(validateEntry('calendar', 'x'.repeat(201), { date: '2026-12-05' })).toMatch(/title is too long/);
  });
});

describe('entryActions', () => {
  const none = { mine: false, canReview: false, canPublish: false };
  it('lets reviewers act on anything', () => {
    expect(entryActions('pending', { ...none, canReview: true })).toEqual({ edit: true, publish: true, reject: true, unpublish: false, remove: true });
    expect(entryActions('published', { ...none, canReview: true })).toMatchObject({ edit: false, unpublish: true, remove: true });
  });
  it('lets a submitter manage their own entry, publishing only with the right', () => {
    expect(entryActions('draft', { mine: true, canReview: false, canPublish: false })).toEqual({ edit: true, publish: false, reject: false, unpublish: false, remove: true });
    expect(entryActions('draft', { mine: true, canReview: false, canPublish: true }).publish).toBe(true);
    expect(entryActions('published', { mine: true, canReview: false, canPublish: false }).remove).toBe(false);
  });
  it('gives others nothing', () => {
    expect(entryActions('pending', none)).toEqual({ edit: false, publish: false, reject: false, unpublish: false, remove: false });
  });
});

describe('cleanData', () => {
  it('keeps only the page’s fields, trimmed, without blanks', () => {
    expect(cleanData('calendar', { date: ' 2026-12-05 ', place: '  ', junk: 'x' })).toEqual({ date: '2026-12-05' });
  });
});

describe('toEntry', () => {
  it('reads a stored doc and falls back to a draft for an unknown status', () => {
    const e = toEntry('e1', { page: 'media', title: 'T', status: 'weird', data: { url: 'https://x.com', n: 5 }, submittedBy: 'u1', updatedAt: { toMillis: () => 9 } });
    expect(e).toMatchObject({ id: 'e1', page: 'media', status: 'draft', data: { url: 'https://x.com', n: '' }, submittedBy: 'u1', updatedAt: 9 });
    expect(entrySummary(e)).toBe('https://x.com');
  });
});
