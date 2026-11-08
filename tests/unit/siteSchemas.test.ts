import { fromForm, lockedKeys, siteCollections, toForm, validate } from '../../src/frontend/data/siteSchemas';

const spec = (id: string) => siteCollections.find((c) => c.id === id)!;
const stamp = (d: Date) => ({ at: d.toISOString() });

describe('site collection forms', () => {
  it('round-trips an announcement, dates in Manila time', () => {
    const doc = fromForm(spec('announcements'), {
      title: ' BMC open ', summary: 'Lectures in November.', category: 'Training', published: true, publishedAt: '2026-11-09',
    }, stamp);
    expect(doc).toEqual({
      title: 'BMC open', summary: 'Lectures in November.', category: 'Training', published: true,
      publishedAt: { at: '2026-11-08T16:00:00.000Z' },
    });
  });

  it('nests dotted keys and drops empty optional fields', () => {
    const values = { ...toForm(spec('siteSettings')), motto: 'Once an MMS', 'socials.facebook': 'https://facebook.com/mms' };
    expect(fromForm(spec('siteSettings'), values, stamp)).toEqual({ motto: 'Once an MMS', socials: { facebook: 'https://facebook.com/mms' } });
  });

  it('reads Firestore docs back into the form, current defaults to true for officers', () => {
    const form = toForm(spec('officers'), { body: 'execom', role: 'President', name: 'Juan', order: 1 });
    expect(form).toMatchObject({ body: 'execom', order: '1', current: true, term: '' });
    expect(fromForm(spec('officers'), form, stamp)).toEqual({ body: 'execom', role: 'President', name: 'Juan', order: 1, current: true });
  });

  it('shows a saved Manila date as the same day (no drift on re-save)', () => {
    const saved = fromForm(spec('announcements'), { title: 'T', summary: 'S', category: 'Club', published: true, publishedAt: '2026-11-09' },
      (d) => ({ toDate: () => d }));
    expect(toForm(spec('announcements'), saved).publishedAt).toBe('2026-11-09');
  });

  it('keeps keys the rules require even when blank, and clears blanked fields on edit', () => {
    const c = spec('committees');
    const form = { ...toForm(c), tag: 'Climbs', title: 'Climbs Committee', headTitle: 'Head', order: '1' };
    expect(fromForm(c, form, stamp)).toMatchObject({ headName: '', description: '' });
    const settings = { ...toForm(spec('siteSettings')), motto: 'M' };
    expect(fromForm(spec('siteSettings'), settings, stamp, 'DELETE')).toMatchObject({ motto: 'M', previewNotice: 'DELETE', socials: { facebook: 'DELETE' } });
  });

  it('locks fields stored in a shape the form cannot edit', () => {
    const doc = { title: { en: 'x' }, summary: 'S', category: 'Club', published: true };
    expect(lockedKeys(spec('announcements'), doc)).toEqual(['title']);
    expect(toForm(spec('announcements'), doc).title).toBe('');
    expect(validate(spec('announcements'), { ...toForm(spec('announcements'), doc), publishedAt: '2026-11-09' }, ['title'])).toBeNull();
    expect(lockedKeys(spec('announcements'), { publishedAt: '2026-11-09' })).toEqual(['publishedAt']);
  });

  it('checks cross-field and range rules before saving', () => {
    expect(validate(spec('officers'), { body: 'execom', role: 'P', name: 'N', order: '1', current: false, term: '' })).toMatch(/term/);
    expect(validate(spec('reviews'), { climbTitle: 'C', name: 'N', rating: '7', quote: 'Q', publishedAt: '2026-11-09' })).toMatch(/1 to 5/);
  });

  it('mirrors the rules: required, length, whole numbers, links per field', () => {
    const faq = spec('faqs');
    expect(validate(faq, { q: 'Q', a: '  ', order: '1' })).toMatch(/Answer is required/);
    expect(validate(faq, { q: 'Q', a: 'A', order: '1.5' })).toMatch(/whole number/);
    expect(validate(faq, { q: 'Q', a: 'A', order: '99999999999999999999' })).toMatch(/whole number/);
    expect(validate(spec('announcements'), { title: 'T', summary: 'S', category: 'Event', publishedAt: '2026-11-09' })).toMatch(/pick one/);
    expect(validate(faq, { q: 'x'.repeat(301), a: 'A', order: '1' })).toMatch(/at most 300/);
    const survey = { title: 'T', audience: 'Everyone', status: 'Open', formUrl: '#' };
    expect(validate(spec('surveys'), survey)).toBeNull();
    expect(validate(spec('surveys'), { ...survey, formUrl: 'javascript:alert(1)' })).toMatch(/https/);
    const media = { kind: 'photo', title: 'Summit', url: '/images/apo.webp', order: '1' };
    expect(validate(spec('media'), media)).toBeNull();
    expect(validate(spec('media'), { ...media, url: '#' })).toMatch(/https/);
    expect(validate(spec('media'), { ...media, url: '/images/../x.webp' })).toMatch(/https/);
    expect(validate(spec('media'), { ...media, url: `https://x.com/${'a'.repeat(500)}` })).toMatch(/at most 500/);
  });
});
