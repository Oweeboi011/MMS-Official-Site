import { averageRating, canPublish, reviewFields, toFeedbackRow } from '../../src/frontend/data/feedbackReviews';

describe('feedback → review', () => {
  const row = toFeedbackRow('c1_u1', { name: 'Ana', rating: 5, comments: '  Great climb  ' }, false);

  it('reads a rating and trims the comment', () => {
    expect(row).toEqual({ id: 'c1_u1', name: 'Ana', rating: 5, comments: 'Great climb', published: false });
  });

  it('only publishes ratings that have words and a name', () => {
    expect(canPublish(row)).toBe(true);
    expect(canPublish({ ...row, comments: '' })).toBe(false);
    expect(canPublish({ ...row, name: ' ' })).toBe(false);
  });

  it('builds a review keyed to its feedback, within the rule limits', () => {
    const f = reviewFields({ ...row, comments: 'x'.repeat(1200) }, 'c1', 'Mt. Pulag');
    expect(f).toMatchObject({ climbId: 'c1', feedbackId: 'c1_u1', climbTitle: 'Mt. Pulag', name: 'Ana', rating: 5 });
    expect(f.quote).toHaveLength(1000);
  });

  it('averages to one decimal', () => {
    expect(averageRating([row, { ...row, rating: 4 }, { ...row, rating: 4 }])).toBeCloseTo(4.3, 5);
    expect(averageRating([])).toBe(0);
  });
});
