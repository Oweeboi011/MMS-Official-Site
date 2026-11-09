// Pure builders for the daily reminders (scheduled/reminders.js): what to say, to whom, or null for nothing.
import { getOutstanding, getCountedTotal } from "../paymentMath.js";
import { REQUIRED_DOC_TYPES } from "../requiredDocTypes.js";
import { NO_SHOW_GRACE_MS, formatDueDate, getPaymentDueDate } from "../shared/registrationOps.js";
import { isClimbCancelled, isClimbOver, isClimbPostponed } from "../shared/climbStatus.js";

const UPCOMING_REMINDER_DAYS = new Set([7, 5, 3, 1]);
const DAY_MS = 86400000;
const peso = (n) => `₱${n.toLocaleString("en-PH")}`;
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

const isUnpaid = (reg) => reg.paymentStatus === "unpaid" || reg.paymentStatus === "rejected";

// Members may pay in batches, so chase the outstanding amount, not just the status.
export function paymentReminder(reg, climb) {
  const outstanding = getOutstanding(reg, climb);
  if (!isUnpaid(reg) && outstanding <= 0) return null;
  const paidSoFar = getCountedTotal(reg);
  const due = formatDueDate(getPaymentDueDate(climb));
  const title = reg.climbTitle || "your climb";
  const partial = paidSoFar > 0 && outstanding > 0;
  let message;
  if (partial) {
    const when = due ? `Please settle it by ${due}.` : "You can send the balance anytime before the climb.";
    message = `You've paid ${peso(paidSoFar)} for ${title} — ${peso(outstanding)} still to go. ${when}`;
  } else {
    const by = due ? " — due by " + due : "";
    message = `Don't forget to submit your GCash payment proof for ${title}${by}.`;
  }
  return {
    userId: reg.userId,
    type: "payment_reminder",
    title: partial ? "Balance still outstanding" : "Payment still pending",
    message,
    link: "/my-registrations",
    id: `payment_${reg.id}`,
  };
}

// Only the next upcoming pre-climb meeting; past ones don't belong in a "coming up" nudge.
export function nextMeetingText(priv, now) {
  const next = (priv?.preClimbMeetings || [])
    .filter((m) => m.date && new Date(`${m.date}T23:59:59`).getTime() >= now)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (!next) return "";
  const date = new Date(`${next.date}T00:00:00`).toLocaleDateString("en-PH", { month: "long", day: "numeric" });
  const time = next.time ? ` at ${next.time}` : "";
  const place = next.location ? ` — ${next.location}` : "";
  return ` Pre-climb meeting: ${date}${time}${place}.`;
}

export function upcomingReminder(reg, climb, priv, now) {
  if (reg.status !== "confirmed" || isClimbPostponed(climb) || !climb?.startDate?.toDate) return null;
  const daysUntil = Math.ceil((climb.startDate.toDate().getTime() - now) / DAY_MS);
  if (!UPCOMING_REMINDER_DAYS.has(daysUntil)) return null;
  const climbTitle = reg.climbTitle || climb.title;
  let message = `${climbTitle} — ${reg.climbDate || climb.dateLabel || ""}. Check the event page for the itinerary, what to bring, and what to pay.`;
  message += nextMeetingText(priv, now);
  if (isUnpaid(reg)) message += " You haven't submitted payment yet — please do so from My Climbs.";
  return {
    userId: reg.userId,
    type: "upcoming_climb",
    title: daysUntil === 1 ? "Your climb is tomorrow!" : `Your climb is in ${daysUntil} days`,
    message,
    link: `/event/${reg.climbId}`,
    id: `upcoming${daysUntil}_${reg.id}`,
  };
}

export function officerSummary(climb, climbRegs, now) {
  if (!climb?.officers?.length || isClimbCancelled(climb) || isClimbOver(climb, now)) return null;
  const unpaidCount = climbRegs.filter(isUnpaid).length;
  const missingDocsCount = climbRegs.filter((r) =>
    REQUIRED_DOC_TYPES.some((t) => climb[t.requiresField] && !r[t.uploadField]),
  ).length;
  if (unpaidCount === 0 && missingDocsCount === 0) return null;
  const parts = [];
  if (unpaidCount > 0) parts.push(plural(unpaidCount, "unpaid/rejected registrant"));
  if (missingDocsCount > 0) parts.push(plural(missingDocsCount, "missing required document"));
  return { unpaidCount, missingDocsCount, message: `${climb.title || "Your climb"}: ${parts.join(", ")}.` };
}

// Once per climb, a day after it ends (leads mark no-shows first).
export function isThankYouDue(climb, now) {
  if (!climb || climb.thankYouSentAt || !climb.endDate?.toDate) return false;
  if (isClimbCancelled(climb) || isClimbPostponed(climb)) return false;
  return climb.endDate.toDate().getTime() + NO_SHOW_GRACE_MS <= now;
}
