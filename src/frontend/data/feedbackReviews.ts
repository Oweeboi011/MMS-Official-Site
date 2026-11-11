// Member ratings (feedback) an admin can turn into public reviews (reviews/{feedbackId}). Plain data: no Firebase here.
export interface FeedbackRow { id: string; name: string; rating: number; comments: string; published: boolean }

const str = (v: unknown) => (typeof v === 'string' ? v : '');

// published = a review for this feedback already exists and is live.
export function toFeedbackRow(id: string, d: Record<string, unknown>, published: boolean): FeedbackRow {
  return { id, name: str(d.name), rating: Number(d.rating) || 0, comments: str(d.comments).trim(), published };
}

// Reviews need words (rules: quote 1–1000 characters), so a bare star rating can't be published.
export const canPublish = (f: FeedbackRow) => f.comments.length > 0 && f.name.trim().length > 0;

export const averageRating = (rows: FeedbackRow[]) => (rows.length ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / rows.length) * 10) / 10 : 0);

// The review doc for one feedback; the id is the feedback id, so publishing twice cannot duplicate it.
export function reviewFields(f: FeedbackRow, climbId: string, climbTitle: string) {
  return { climbId, feedbackId: f.id, climbTitle: climbTitle.slice(0, 200), name: f.name.slice(0, 120), rating: f.rating, quote: f.comments.slice(0, 1000) };
}
