import { groupCommitsIntoChangelog } from '../../src/backend/functions/src/shared/changelog.js';

const c = (...subjects: string[]) => subjects.map((subject) => ({ subject }));

describe('groupCommitsIntoChangelog', () => {
  it('groups by prefix, drops noise, coverage and merge commits', () => {
    const { body, dropped } = groupCommitsIntoChangelog(c(
      'feat: add donations panel', 'fix(ui): wrong total', 'docs: tidy', 'Merge pull request #299 from x/y', 'Merge development into feature/z', 'Raise coverage', 'Plain subject',
    ));
    expect(dropped).toBe(4);
    expect(body).toBe('New Features\n- Add donations panel\n\nFixes\n- Wrong total\n\nImprovements\n- Plain subject');
  });
});
