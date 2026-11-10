import { groupByStatus, type DashboardRow } from '../../src/frontend/data/dashboardModel';

const row = (id: string, status: string) => ({ climb: { id } as DashboardRow['climb'], status, confirmed: 0, pending: 0, waitlisted: 0, unpaid: 0, toReview: 0, fee: 'TBA' });

describe('dashboard grouping', () => {
  it('lists non-empty groups in the old order, with unknown statuses last', () => {
    const groups = groupByStatus([row('a', 'completed'), row('b', 'open'), row('c', 'draft'), row('d', 'open'), row('e', 'weird')]);
    expect(groups.map((g) => [g.status, g.rows.length])).toEqual([['open', 2], ['draft', 1], ['completed', 1], ['weird', 1]]);
    expect(groups[1].label).toBe('Drafts');
    expect(groupByStatus([])).toEqual([]);
  });
});
