import { toClimbDetail } from '../../src/frontend/data/climbDetail';

describe('per-climb announcements', () => {
  it('shows pinned first, then newest, and drops empty ones', () => {
    const d = toClimbDetail({ title: 'T', announcements: [
      { message: 'Old', createdAt: 1 }, { message: 'Bring headlamps', pinned: true, createdAt: 0 }, { message: '' }, { message: 'New', createdAt: 5 },
    ] }, new Date())!;
    expect(d.notices.map((n) => n.message)).toEqual(['Bring headlamps', 'New', 'Old']);
    expect(d.notices[0].pinned).toBe(true);
  });
});
