import { useCallback } from 'react';
import { averageRating, canPublish } from '../../data/feedbackReviews';
import DataTable from '../DataTable';
import { climbFeedback, setReviewPublished } from '../../services/reviewsFromFeedback';
import { useAdminList } from './useAdminList';

// Member ratings for one climb. An admin can publish a rating with comments as a review on the Stories page.
export default function FeedbackPanel({ climbId, climbTitle }: { climbId: string; climbTitle: string }) {
  const load = useCallback(() => climbFeedback(climbId), [climbId]);
  const { rows, message, busy, run } = useAdminList(load);
  if (!rows) return <p role="status">{message || 'Loading ratings…'}</p>;
  if (!rows.length) return null;
  return (
    <details className="register-section">
      <summary><strong>Ratings</strong> · {rows.length} · average {averageRating(rows)} of 5</summary>
      {message && <p role="status">{message}</p>}
      <DataTable caption="Ratings for this climb" head={['Rating', 'Name', 'Comment', 'Review']}>
        {rows.map((f) => (
          <tr key={f.id}>
            <th scope="row">{f.rating} of 5</th>
            <td>{f.name || 'Anonymous'}</td>
            <td>{f.comments || <span className="climb-muted">No comment, so it can’t be published.</span>}</td>
            <td>
              {canPublish(f) && (
                <button type="button" className="chip" disabled={busy} onClick={() => void run(() => setReviewPublished(f, climbId, climbTitle, !f.published))}>
                  {f.published ? 'Unpublish review' : 'Publish as review'}
                </button>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </details>
  );
}
