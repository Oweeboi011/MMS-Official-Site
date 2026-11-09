import { emptyRow, flatCodec, groupedCodec, rowsFromForm, rowsProblem, rowsToForm, type Column } from '../../src/frontend/data/records';

const officerCols: Column[] = [{ key: 'role', label: 'Role', kind: 'select', required: true, options: ['Team Leader'] }, { key: 'name', label: 'Name', required: true }];
const itineraryCols: Column[] = [{ key: 'day', label: 'Day', required: true }, { key: 'time', label: 'Time' }, { key: 'activity', label: 'Activity', required: true }];

describe('records fields', () => {
  it('keeps keys the form does not show when saving', () => {
    const codec = flatCodec(officerCols);
    const rows = codec.decode([{ role: 'Team Leader', name: 'Ana', userId: 'u1' }]);
    rows[0].name = 'Ana R.';
    expect(codec.encode([...rows, emptyRow(officerCols)])).toEqual([{ role: 'Team Leader', name: 'Ana R.', userId: 'u1' }]);
  });

  it('flattens the itinerary for editing and regroups consecutive days', () => {
    const codec = groupedCodec('day', 'entries', itineraryCols);
    const stored = [{ day: 'Day 1', entries: [{ time: '04:00', activity: 'Trek' }, { time: '12:00', activity: 'Lunch' }] }, { day: 'Day 2', entries: [{ time: '05:00', activity: 'Summit' }] }];
    const rows = codec.decode(stored);
    expect(rows.map((r) => r.day)).toEqual(['Day 1', 'Day 1', 'Day 2']);
    expect(codec.encode(rowsFromForm(rowsToForm(rows)))).toEqual(stored);
  });

  it('names the row and column of the first problem; skips blank rows', () => {
    expect(rowsProblem('Officers', officerCols, [emptyRow(officerCols), { role: 'Team Leader', name: '' }])).toBe('Officers, row 2, Name is required.');
    expect(rowsProblem('Officers', officerCols, [{ role: 'Boss', name: 'X' }])).toBe('Officers, row 1, Role: pick one of the options.');
    expect(rowsProblem('Maps', [{ key: 'u', label: 'Link', kind: 'link' }], [{ u: 'www.example.org/map' }])).toBe('Maps, row 1, Link must start with https://.');
    expect(rowsFromForm('not json')).toEqual([]);
  });
});
