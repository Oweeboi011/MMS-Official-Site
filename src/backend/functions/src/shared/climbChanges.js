// What changed between two versions of a climb doc, free of Firestore so it can be tested.
import { REQUIRED_DOC_TYPES } from "../requiredDocTypes.js";

export const CANCELLATION_LABELS = { cancelled: "Cancelled", postponed: "Postponed" };

// Announcements are keyed by createdAt: the ones in `after` that `before` did not have.
export function newAnnouncementsOf(before, after) {
  const had = before.announcements || [];
  return (after.announcements || []).filter((a) => !had.some((b) => b.createdAt === a.createdAt));
}

// More seats, or auto-promotion switched back on: the waitlist may now be filled.
export function seatsOpened(before, after) {
  return (
    Number(after.maxParticipants) > Number(before.maxParticipants || 0) ||
    (before.waitlistAutoPromote === false && after.waitlistAutoPromote !== false)
  );
}

export function detectClimbChanges(before, after) {
  const flag = (doc, docType) => !!doc[docType.requiresField];
  return {
    newAnnouncements: newAnnouncementsOf(before, after),
    // A requirement switched off: its outstanding nag notifications get cleared.
    turnedOffDocTypes: REQUIRED_DOC_TYPES.filter((t) => flag(before, t) && !flag(after, t)),
    // Either direction changes who counts as compliant, so docsCompleteCount needs a recount.
    requirementsChanged: REQUIRED_DOC_TYPES.some((t) => flag(before, t) !== flag(after, t)),
    cancellationChanged:
      (before.cancellationStatus || "") !== (after.cancellationStatus || "") && !!CANCELLATION_LABELS[after.cancellationStatus],
  };
}
