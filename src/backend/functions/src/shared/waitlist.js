// Waitlist rules, kept free of Firestore so they can be tested: who may be promoted, and when.
import { isClimbCancelled, isClimbPostponed } from "./climbStatus.js";

// Registrations that hold a seat; waitlisted and cancelled ones do not.
export const SEAT_HOLDING_STATUSES = ["pending", "confirmed"];

// Freed seats may be filled from the waitlist only on a climb with a seat limit that officers
// haven't turned off (waitlistAutoPromote: false), and that is not cancelled, postponed, completed or over.
export function waitlistOpen(climb, now = Date.now()) {
  const max = Number(climb.maxParticipants);
  if (!max || max <= 0 || climb.waitlistAutoPromote === false) return false;
  if (isClimbCancelled(climb) || isClimbPostponed(climb) || climb.status === "completed") return false;
  const end = climb.endDate?.toDate ? climb.endDate.toDate() : null;
  return !(end && end.getTime() < now);
}

export function createdMillis(reg) {
  const t = reg.createdAt;
  if (t?.toMillis) return t.toMillis();
  return t?.toDate ? t.toDate().getTime() : 0;
}

// The longest-waiting registrations that fit in the freed seats: oldest first, ties by id.
export function pickPromotions(regs, max) {
  const free = max - regs.filter((r) => SEAT_HOLDING_STATUSES.includes(r.status)).length;
  if (free <= 0) return [];
  return regs
    .filter((r) => r.status === "waitlisted")
    .sort((a, b) => createdMillis(a) - createdMillis(b) || a.id.localeCompare(b.id))
    .slice(0, free);
}
