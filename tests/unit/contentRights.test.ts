import { cleanGroups, groupLabel, rightsFor, rightsLabel } from '../../src/frontend/data/contentRights';

const person = (role: string, ...groups: string[]) => ({ role, groups });

describe('rightsFor', () => {
  it('lets BOT, ExeCom and admins submit and publish every page', () => {
    for (const p of [person('member', 'bot'), person('member', 'execom'), person('admin')]) {
      expect(rightsFor(p, 'membership')).toEqual({ submit: true, publish: true });
      expect(rightsFor(p, 'calendar').publish).toBe(true);
    }
  });

  it('limits TCom to calendar, media, trails and destinations', () => {
    const tcom = person('member', 'tcom');
    for (const page of ['calendar', 'media', 'trails', 'destinations'] as const) expect(rightsFor(tcom, page).submit).toBe(true);
    expect(rightsFor(tcom, 'membership')).toEqual({ submit: false, publish: false });
  });

  it('gives a plain member nothing', () => {
    expect(rightsFor(person('member'), 'calendar').submit).toBe(false);
  });
});

describe('rightsLabel', () => {
  it('summarises what a person can edit', () => {
    expect(rightsLabel(person('member'))).toBe('No content rights');
    expect(rightsLabel(person('admin'))).toBe('All pages');
    expect(rightsLabel(person('member', 'tcom'))).toBe('Calendar of Activities, Media, Trails, Destinations');
  });
});

describe('groups', () => {
  it('keeps only known groups in a fixed order', () => {
    expect(cleanGroups(['tcom', 'x', 'bot', 'bot'])).toEqual(['bot', 'tcom']);
    expect(cleanGroups(undefined)).toEqual([]);
    expect(groupLabel('execom')).toBe('ExeCom');
  });
});
