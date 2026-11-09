import { toClimbPrivate } from '../../src/frontend/data/climbPrivate';

describe('climbPrivate', () => {
  it('sorts meetings, keeps https links only, splits members and guests', () => {
    const p = toClimbPrivate({
      preClimbMeetings: [{ date: '2026-11-20' }, { date: '2026-11-18', link: 'javascript:x' }],
      resources: [{ label: 'A', url: 'https://x/a' }, { label: 'B', url: 'ftp-like' }],
      participants: [{ name: 'Ana C.', memberType: 'joiner' }, { name: 'Ben R.', memberType: 'member' }, { name: '' }],
    });
    expect(p.meetings.map((m) => [m.date, m.link])).toEqual([['2026-11-18', ''], ['2026-11-20', '']]);
    expect(p.resources).toEqual([{ label: 'A', url: 'https://x/a' }]);
    expect(p.members).toEqual(['Ben R.']);
    expect(p.guests).toEqual(['Ana C.']);
  });
});
