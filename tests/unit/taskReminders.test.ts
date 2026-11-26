import { digestSubject, manilaToday, taskDigests } from '../../src/backend/functions/src/scheduled/taskReminderMessages.js';
import { tplTaskDigest } from '../../src/backend/functions/src/email/templates.js';

const task = (over: Record<string, string>) => ({ title: 'T', ownerUid: 'u1', dueDate: '2026-11-27', status: 'todo', ...over });

describe('manilaToday', () => {
  it('rolls to the next Manila day after 16:00 UTC', () => {
    expect(manilaToday(Date.parse('2026-11-26T15:59:00Z'))).toBe('2026-11-26');
    expect(manilaToday(Date.parse('2026-11-26T16:00:00Z'))).toBe('2026-11-27');
  });
});

describe('taskDigests', () => {
  const today = '2026-11-27';

  it('groups overdue and due-within-7-days by owner, oldest first', () => {
    const d = taskDigests([
      task({ title: 'late', dueDate: '2026-11-20' }),
      task({ title: 'today', dueDate: today }),
      task({ title: 'edge', dueDate: '2026-12-04' }),
      task({ title: 'later', dueDate: '2026-12-05' }),
      task({ title: 'other', ownerUid: 'u2', dueDate: '2026-11-01' }),
    ], today);
    expect(d.get('u1')).toEqual({ overdue: [{ title: 'late', dueDate: '2026-11-20' }], soon: [{ title: 'today', dueDate: today }, { title: 'edge', dueDate: '2026-12-04' }] });
    expect(d.get('u2')?.overdue).toHaveLength(1);
  });

  it('skips done, unowned and undated tasks', () => {
    const d = taskDigests([task({ status: 'done', dueDate: '2026-11-01' }), task({ ownerUid: '' }), task({ dueDate: '' })], today);
    expect(d.size).toBe(0);
  });
});

describe('digest email', () => {
  it('has a subject with counts', () => {
    expect(digestSubject({ overdue: [{}], soon: [{}, {}] } as never)).toBe('Your committee 3 tasks: 1 overdue, 2 due this week');
    expect(digestSubject({ overdue: [], soon: [{}] } as never)).toBe('Your committee 1 task: 1 due this week');
  });

  it('escapes task titles and names', () => {
    const html = tplTaskDigest({ name: '<b>Ana</b>', overdue: [{ title: '<script>x</script>', dueDate: '2026-11-01' }], soon: [], appUrl: 'https://x.test' });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>Ana');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('https://x.test/account/tasks');
  });
});
