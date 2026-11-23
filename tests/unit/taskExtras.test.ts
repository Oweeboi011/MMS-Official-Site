import type { Task, TaskInput } from '../../src/frontend/data/tasks';
import { changeSummary, climbChoices, parseStoredView, checklistProgress, dragDays, todayMarker, formatChecklist, linkify, nextOccurrence, parseChecklist, shiftDates, summaryOf } from '../../src/frontend/data/taskExtras';

const input = (extra: Partial<TaskInput> = {}): TaskInput => ({
  title: 'Prep meeting', committee: 'execom', status: 'done', ownerUid: '', ownerName: '', startDate: '', dueDate: '', notes: '', checklist: '', repeat: '', link: '', ...extra,
});
const mk = (id: string, extra: Partial<Task> = {}): Task => ({ ...input(), id, updatedAt: 0, updatedByName: '', ...extra });

describe('checklist', () => {
  it('round-trips lines with a done mark and ignores blank lines', () => {
    const items = parseChecklist('[x] Book hall\n[ ] Print forms\n\nplain line');
    expect(items).toEqual([{ text: 'Book hall', done: true }, { text: 'Print forms', done: false }, { text: 'plain line', done: false }]);
    expect(formatChecklist(items)).toBe('[x] Book hall\n[ ] Print forms\n[ ] plain line');
  });
  it('keeps a trailing space in item text so a multi-word item can be typed', () => {
    expect(parseChecklist('[ ] Book ')).toEqual([{ text: 'Book ', done: false }]);
    expect(formatChecklist(parseChecklist('[ ] Book '))).toBe('[ ] Book ');
  });
  it('shows progress only when there are items', () => {
    expect(checklistProgress('[x] a\n[ ] b\n[x] c')).toBe('2/3');
    expect(checklistProgress('')).toBe('');
  });
});

describe('linkify', () => {
  it('turns http(s) addresses into links and leaves other text alone', () => {
    expect(linkify('See https://example.com/a?b=1, then javascript:alert(1) and ftp://x')).toEqual([
      { text: 'See ' }, { text: 'https://example.com/a?b=1', href: 'https://example.com/a?b=1' }, { text: ', then javascript:alert(1) and ftp://x' },
    ]);
  });
  it('keeps balanced parentheses in an address but not the one that closes a sentence', () => {
    expect(linkify('https://en.wikipedia.org/wiki/Foo_(bar) ok')[0].href).toBe('https://en.wikipedia.org/wiki/Foo_(bar)');
    expect(linkify('(see https://example.com/a).')).toEqual([{ text: '(see ' }, { text: 'https://example.com/a', href: 'https://example.com/a' }, { text: ').' }]);
  });
  it('returns one plain segment when there is no link', () => expect(linkify('nothing here')).toEqual([{ text: 'nothing here' }]));
});

describe('summaryOf', () => {
  it('counts tasks per committee and status, with overdue and due-soon', () => {
    const rows = [
      mk('a', { status: 'todo', dueDate: '2026-11-01' }),
      mk('b', { status: 'doing', dueDate: '2026-11-25' }),
      mk('c', { status: 'done', dueDate: '2026-11-01' }),
      mk('d', { committee: 'tcom', status: 'blocked' }),
    ];
    const [exec, tcom] = summaryOf(rows, '2026-11-22');
    expect(exec).toMatchObject({ committee: 'execom', label: 'ExeCom', total: 3, overdue: 1, dueSoon: 1, counts: { todo: 1, doing: 1, blocked: 0, done: 1 } });
    expect(tcom).toMatchObject({ committee: 'tcom', total: 1, overdue: 0, counts: { blocked: 1 } });
  });
});

describe('shiftDates', () => {
  it('moves the dates that exist and leaves empty ones empty', () => {
    expect(shiftDates({ startDate: '2026-12-30', dueDate: '' }, 3)).toEqual({ startDate: '2027-01-02', dueDate: '' });
    expect(shiftDates({ startDate: '2026-12-10', dueDate: '2026-12-12' }, -1)).toEqual({ startDate: '2026-12-09', dueDate: '2026-12-11' });
  });
});

describe('nextOccurrence', () => {
  it('is nothing unless the task is done and repeats', () => {
    expect(nextOccurrence(input({ repeat: '', status: 'done' }))).toBeNull();
    expect(nextOccurrence(input({ repeat: 'weekly', status: 'doing' }))).toBeNull();
  });
  it('makes next week’s copy: to do, dates moved, checklist unticked', () => {
    expect(nextOccurrence(input({ repeat: 'weekly', startDate: '2026-12-01', dueDate: '2026-12-03', checklist: '[x] a\n[ ] b' }))).toEqual(
      input({ repeat: 'weekly', status: 'todo', startDate: '2026-12-08', dueDate: '2026-12-10', checklist: '[ ] a\n[ ] b' }),
    );
  });
  it('moves monthly tasks to the same day next month, or the last day when it is shorter', () => {
    expect(nextOccurrence(input({ repeat: 'monthly', dueDate: '2026-01-31' }))?.dueDate).toBe('2026-02-28');
    expect(nextOccurrence(input({ repeat: 'monthly', dueDate: '2026-12-15' }))?.dueDate).toBe('2027-01-15');
  });
});

describe('todayMarker', () => {
  it('places today as a percentage of the range, counting both end days', () => {
    expect(todayMarker('2026-12-01', '2026-12-10', '2026-12-01')).toBe(0);
    expect(todayMarker('2026-12-01', '2026-12-10', '2026-12-06')).toBe(50);
  });
  it('is nothing outside the range or with no range', () => {
    expect(todayMarker('2026-12-01', '2026-12-10', '2026-11-30')).toBeNull();
    expect(todayMarker('2026-12-01', '2026-12-10', '2026-12-11')).toBeNull();
    expect(todayMarker('', '', '2026-12-06')).toBeNull();
  });
});

describe('dragDays', () => {
  it('turns a horizontal drag into whole days on the timeline scale', () => {
    expect(dragDays(100, 1000, '2026-12-01', '2026-12-10')).toBe(1);
    expect(dragDays(-260, 1000, '2026-12-01', '2026-12-10')).toBe(-3);
    expect(dragDays(20, 1000, '2026-12-01', '2026-12-10')).toBe(0);
  });
  it('does nothing when the track has no width', () => expect(dragDays(100, 0, '2026-12-01', '2026-12-10')).toBe(0));
});

describe('parseStoredView', () => {
  const fallback = { mode: 'table', view: { committee: '', status: '', ownerUid: '', sort: 'due' } };
  it('reads back what was saved', () => {
    const saved = { mode: 'timeline', view: { committee: 'tcom', status: 'doing', ownerUid: 'u1', sort: 'title' } };
    expect(parseStoredView(JSON.stringify(saved))).toEqual(saved);
  });
  it('falls back on nothing, junk, or values it does not know', () => {
    expect(parseStoredView(null)).toEqual(fallback);
    expect(parseStoredView('not json')).toEqual(fallback);
    expect(parseStoredView(JSON.stringify({ mode: 'grid', view: { committee: 5, sort: 'chaos' } }))).toEqual(fallback);
  });
});

describe('climbChoices', () => {
  const now = new Date('2026-11-23T00:00:00Z');
  it('lists public climbs by name and dates with the site path a task can link to, newest first', () => {
    const docs = [
      { id: 'a', title: 'Mt. Pulag', startDate: '2026-12-05', endDate: '2026-12-06', status: 'open' },
      { id: 'b', title: 'Mt. Ulap', startDate: '2026-12-20', status: 'open' },
      { id: 'c', title: 'Secret draft', startDate: '2026-12-25', status: 'draft' },
      { id: 'e', title: 'Called off', startDate: '2026-12-27', status: 'open', cancellationStatus: 'cancelled' },
      { title: 'No id', startDate: '2026-12-26', status: 'open' },
    ];
    expect(climbChoices(docs, now)).toEqual([
      { path: '/climbs/b', label: 'Mt. Ulap (Dec 20)' },
      { path: '/climbs/a', label: 'Mt. Pulag (Dec 5–6)' },
    ]);
  });
});

describe('changeSummary', () => {
  const before = input({ status: 'todo', ownerName: 'Ana', ownerUid: 'u1', dueDate: '2026-12-01' });
  it('says a task was created when there is nothing before it', () => expect(changeSummary(null, input())).toBe('Created'));
  it('names each change in plain words, joined', () => {
    expect(changeSummary(before, { ...before, status: 'done', dueDate: '2026-12-05' })).toBe('Status To do → Done; Due 2026-12-01 → 2026-12-05');
    expect(changeSummary(before, { ...before, ownerName: 'Ben', ownerUid: 'u2' })).toBe('Owner Ana → Ben');
  });
  it('shows (none) for an empty side', () => {
    expect(changeSummary(before, { ...before, ownerName: '', ownerUid: '', dueDate: '' })).toBe('Owner Ana → (none); Due 2026-12-01 → (none)');
  });
  it('notes edits to long text without copying it', () => {
    expect(changeSummary(before, { ...before, notes: 'new', checklist: '[ ] a', link: '/x', repeat: 'weekly', title: 'Renamed' })).toBe('Title changed; Notes edited; Checklist edited; Repeat Does not repeat → Every week; Link changed');
  });
  it('says so when nothing changed', () => expect(changeSummary(before, before)).toBe('Saved with no changes'));
});
