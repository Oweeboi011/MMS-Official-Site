import { surveyState } from '../../src/frontend/lib/survey';

const now = new Date('2026-11-05T12:00:00');

describe('surveyState', () => {
  it('is open with a real form link before the close date', () => {
    expect(surveyState({ status: 'Open', closes: 'Nov 30, 2026', formUrl: 'https://forms.gle/x' }, now)).toBe('open');
    expect(surveyState({ status: 'Open', formUrl: 'https://forms.gle/x' }, now)).toBe('open');
  });

  it('is closed by flag or once the close date has passed', () => {
    expect(surveyState({ status: 'Closed', formUrl: 'https://forms.gle/x' }, now)).toBe('closed');
    expect(surveyState({ status: 'Open', closes: 'Oct 15, 2026', formUrl: 'https://forms.gle/x' }, now)).toBe('closed');
  });

  it("is 'soon' while the form link is a placeholder", () => {
    expect(surveyState({ status: 'Open', formUrl: '#' }, now)).toBe('soon');
  });
});
