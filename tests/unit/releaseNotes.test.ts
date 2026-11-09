import { markSeen, noteBlocks, releaseNotesSpec, toReleaseNote, unseen } from '../../src/frontend/data/releaseNotes';
import { validate, toForm } from '../../src/frontend/data/siteSchemas';

describe('release notes', () => {
  it('splits the body into paragraphs and lists', () => {
    expect(noteBlocks('Intro line\ncontinues.\n\n- one\n- **two**\n\nEnd.')).toEqual([
      { list: false, text: 'Intro line continues.' }, { list: true, items: ['one', '**two**'] }, { list: false, text: 'End.' },
    ]);
  });

  it('shows the banner once per new note in this browser', () => {
    const note = toReleaseNote('n', { title: 'T', body: 'B', publishedAt: { toMillis: () => 10 } });
    localStorage.clear();
    expect(unseen(note)).toBe(true);
    markSeen(note);
    expect(unseen(note)).toBe(false);
    expect(unseen({ ...note, publishedAt: 11 })).toBe(true);
    expect(unseen(undefined)).toBe(false);
  });

  it('needs title, body, status and date in the editor', () => {
    expect(validate(releaseNotesSpec, toForm(releaseNotesSpec))).toMatch(/Title is required/);
    expect(validate(releaseNotesSpec, { title: 'T', body: 'B', status: 'published', publishedAt: '2026-11-09' })).toBeNull();
  });
});
