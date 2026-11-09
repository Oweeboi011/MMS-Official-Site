import * as logger from "firebase-functions/logger";
import { onDocumentCreated, onDocumentUpdatedWithAuthContext, onDocumentDeleted } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { getPaymentEntries } from "../paymentMath.js";
import { REQUIRED_DOC_TYPES } from "../requiredDocTypes.js";
import { sendEmail } from "../email/sendEmail.js";
import { tplRegistrationConfirmation, tplStatusUpdate, tplOfficerNewRegistration, tplOfficerStatusUpdate } from "../email/templates.js";
import { updateRoster, syncParticipantList, SEAT_HOLDING_STATUSES, isClimbFull, promoteFromWaitlist, findOtherActiveRegistration, getNotifyLists, createNotification, logFailedRequest, regDocsComplete } from "../shared/registrationOps.js";
import { db } from "../shared/admin.js";
import { remindOutstandingPaperwork, clearPaperworkReminders } from "../shared/paperworkReminders.js";

const ACTIVE = ["pending", "confirmed"];
const MY_CLIMBS = "/my-registrations";
const appUrl = () => process.env.APP_URL || "https://mms-open-climbs.web.app";
const peso = (n) => `₱${Number(n).toLocaleString("en-PH")}`;
const list = (v) => (Array.isArray(v) ? v : []);
const titleOf = (reg) => reg.climbTitle || "your climb";
const withNote = (reg) => (reg.adminNotes ? `: ${reg.adminNotes}` : "");
const climbRef = (climbId) => db.doc(`climbs/${climbId}`);
const bump = (climbId, field, by) => climbRef(climbId).update({ [field]: FieldValue.increment(by) });
const markRead = (id) => db.collection("notifications").doc(id).set({ read: true }, { merge: true }).catch(() => {});

// Each officer gets the email with every admin CC'd; with no officers, the admins get it directly.
async function emailOfficers({ officerEmails, adminEmails }, subject, html) {
  for (const officer of officerEmails) {
    await sendEmail({ to: officer.email, toName: officer.name, subject, html, cc: adminEmails });
  }
  if (officerEmails.length === 0 && adminEmails.length > 0) {
    const [first, ...rest] = adminEmails;
    await sendEmail({ to: first.email, toName: first.name, subject, html, cc: rest });
  }
}

// ── Create ────────────────────────────────────────────────────────────────────

// A second live registration for the same climb is a duplicate: drop it before anything is emailed. The count
// was already bumped so the delete trigger's decrement balances; roster and docs count stay with the original.
async function dropIfDuplicate(reg, regId) {
  if (!reg.userId || reg.status === "cancelled") return false;
  const original = await findOtherActiveRegistration({ climbId: reg.climbId, userId: reg.userId, regId });
  if (!original) return false;
  logger.warn("[onRegistrationCreated] duplicate dropped", { regId, originalId: original.id, climbId: reg.climbId, userId: reg.userId });
  await db.doc(`registrations/${regId}`).delete();
  return true;
}

// Past maxParticipants a new pending registration goes to the waitlist; the status change sends the waitlist
// email (onRegistrationUpdated), so the "received" email is skipped. The client only warns; this enforces.
async function waitlistIfFull(reg, regId, climb) {
  if (reg.status !== "pending" || !(await isClimbFull(climb, reg.climbId, regId))) return false;
  await db.doc(`registrations/${regId}`).update({ status: "waitlisted", autoWaitlisted: true, updatedAt: FieldValue.serverTimestamp() });
  return true;
}

async function emailNewRegistration(reg, regId, climb, waitlisted) {
  const lists = await getNotifyLists(climb, reg.climbId);
  if (reg.email && !waitlisted) {
    await sendEmail({
      to: reg.email,
      toName: reg.name,
      subject: `Registration Received — ${climb.title} | MMS Open Climbs`,
      html: tplRegistrationConfirmation({
        name: reg.name,
        climbTitle: climb.title,
        climbDate: climb.dateLabel || "",
        climbLocation: climb.location || "",
        waiverUrl: `${appUrl()}/waiver/${regId}`,
      }),
    });
  }
  await emailOfficers(lists, `[New Registration] ${reg.name} — ${climb.title} | MMS Open Climbs`, tplOfficerNewRegistration({
    registrantName: reg.name,
    registrantEmail: reg.email,
    climbTitle: climb.title,
    climbDate: climb.dateLabel || "",
    climbLocation: climb.location || "",
    regId,
    appUrl: appUrl(),
  }));
  logger.info("[onRegistrationCreated] Confirmation sent", {
    email: reg.email, officerCount: lists.officerEmails.length, adminCount: lists.adminEmails.length, climbTitle: climb.title,
  });
}

async function handleNewRegistration(reg, regId) {
  const climbSnap = await climbRef(reg.climbId).get();
  if (!climbSnap.exists) {
    logger.warn("Climb not found", { climbId: reg.climbId });
    return;
  }
  const climb = climbSnap.data();
  // Unconditional: the app always creates "pending"; update/delete keep it to non-cancelled from here.
  await bump(reg.climbId, "registrationCount", 1);
  if (await dropIfDuplicate(reg, regId)) return;
  const waitlisted = await waitlistIfFull(reg, regId, climb);
  const isActive = reg.status !== "cancelled";
  // The roster gates climbPrivate (meeting details, resource links) to actual registrants.
  if (reg.userId && isActive && !waitlisted) await updateRoster(reg.climbId, reg.userId, true);
  await syncParticipantList(reg.climbId);
  if (isActive && regDocsComplete(climb, reg)) await bump(reg.climbId, "docsCompleteCount", 1);
  if (reg.paymentStatus === "unpaid" && reg.userId) {
    await createNotification({
      userId: reg.userId,
      type: "payment_reminder",
      title: "Payment pending",
      message: `You registered for ${climb.title} without submitting payment yet. Add your GCash proof from My Climbs whenever you're ready.`,
      link: MY_CLIMBS,
      id: `payment_${regId}`,
    });
  }
  await remindOutstandingPaperwork(reg, regId, climb, climb.title);
  await emailNewRegistration(reg, regId, climb, waitlisted);
}

export const onRegistrationCreated = onDocumentCreated(
  { document: "registrations/{regId}", database: "openclimbs", secrets: ["BREVO_API_KEY", "BREVO_FROM_EMAIL"] },
  async (event) => {
    const reg = event.data.data();
    try {
      await handleNewRegistration(reg, event.params.regId);
    } catch (err) {
      logger.error("[onRegistrationCreated] Failed", { err: err.message });
      await logFailedRequest({
        type: "email", source: "onRegistrationCreated", message: err.message, userId: reg.userId, climbId: reg.climbId, registrationId: event.params.regId,
      });
    }
  },
);

// ── Update ────────────────────────────────────────────────────────────────────

// Mark every admin's "payment submitted" notification read once the payment has been reviewed.
async function clearAdminSubmittedNotifs(regId) {
  const adminSnap = await db.collection("users").where("role", "==", "admin").get();
  await Promise.all(adminSnap.docs.map((d) => markRead(`submitted_${regId}_${d.id}`)));
}

// Rules can't iterate arrays, so a crafted client write could mark a payment entry "verified". If the writer
// isn't an admin, no entry may gain a verdict it didn't have. Unknown writer = Admin SDK, never a client.
async function clampForgedPayments(event, before, after) {
  const writerUid = event.authId;
  if (!writerUid || !Array.isArray(after.payments)) return false;
  const writerSnap = await db.doc(`users/${writerUid}`).get();
  if (writerSnap.exists && writerSnap.data().role === "admin") return false;
  const prior = list(before.payments);
  let tampered = false;
  const clamped = after.payments.map((p, i) => {
    const priorStatus = prior[i]?.status;
    if (!p?.status || p.status === "submitted" || p.status === priorStatus) return p;
    tampered = true;
    return { ...p, status: priorStatus || "submitted" };
  });
  if (!tampered) return false;
  logger.warn("[onRegistrationUpdated] Clamped forged payment status", { regId: event.params.regId, writerUid });
  await event.data.after.ref.update({ payments: clamped });
  return true; // the corrective write re-runs this trigger on clean data
}

// Name the payment that just came in, not the running total (₱300 on top of ₱500 must not read as ₱800).
function submittedAmountLabel(before, after) {
  const fresh = getPaymentEntries(after).slice(list(before.payments).length).reduce((sum, p) => sum + p.amount, 0);
  if (fresh) return peso(fresh);
  return after.amountPaid ? peso(after.amountPaid) : "a payment";
}

async function notifyAdminsOfSubmission(before, after, regId) {
  const adminSnap = await db.collection("users").where("role", "==", "admin").get();
  const amount = submittedAmountLabel(before, after);
  await Promise.all(adminSnap.docs.map((d) => createNotification({
    userId: d.id,
    type: "payment_submitted",
    title: "Payment submitted for review",
    message: `${after.name || "A member"} submitted ${amount} for ${after.climbTitle || "a climb"}.`,
    link: "/admin/payments",
    id: `submitted_${regId}_${d.id}`,
  })));
}

const PAYMENT_STATUS_HANDLERS = {
  async verified(before, after, regId) {
    await markRead(`payment_${regId}`);
    await clearAdminSubmittedNotifs(regId);
    await createNotification({
      userId: after.userId, type: "payment_verified", title: "Payment verified", link: MY_CLIMBS,
      message: `Your payment for ${titleOf(after)} has been verified. You're all set!`,
    });
  },
  async rejected(before, after, regId) {
    await clearAdminSubmittedNotifs(regId);
    await createNotification({
      userId: after.userId, type: "payment_reminder", title: "Payment rejected", link: MY_CLIMBS, id: `payment_${regId}`,
      message: `Your payment proof for ${titleOf(after)} was rejected${withNote(after)}. Please resubmit from My Climbs.`,
    });
  },
  // An admin reset a submitted/verified payment back to unpaid.
  async unpaid(before, after, regId) {
    await clearAdminSubmittedNotifs(regId);
    await createNotification({
      userId: after.userId, type: "payment_reminder", title: "Payment status reset", link: MY_CLIMBS, id: `payment_${regId}`,
      message: `Your payment for ${titleOf(after)} was reset to unpaid. Please resubmit your GCash proof from My Climbs.`,
    });
  },
  async submitted(before, after, regId) {
    await markRead(`payment_${regId}`);
    await notifyAdminsOfSubmission(before, after, regId);
  },
};

async function notifyPaymentStatus(before, after, regId) {
  if (before.paymentStatus === after.paymentStatus || !after.userId) return;
  await PAYMENT_STATUS_HANDLERS[after.paymentStatus]?.(before, after, regId);
}

// One instalment rejected while the rolled-up status stays fine: tell the member their balance went back up.
async function notifyRejectedInstalments(before, after, regId) {
  if (after.paymentStatus === "rejected" || !after.userId) return;
  const prior = list(before.payments);
  const rejected = list(after.payments).filter((p, i) => p?.status === "rejected" && prior[i]?.status !== "rejected");
  if (!rejected.length) return;
  const amounts = rejected.map((p) => peso(p.amount || 0)).join(" and ");
  await createNotification({
    userId: after.userId, type: "payment_reminder", title: "A payment was rejected", link: MY_CLIMBS, id: `payment_${regId}`,
    message: `Your ${amounts} payment for ${titleOf(after)} was rejected${withNote(after)}. Your other payments still stand — please resubmit the rejected amount from My Climbs.`,
  });
}

// Only newly added refunds are named; removing one (or any unrelated edit) stays silent.
async function notifyRefund(before, after) {
  if (!after.userId) return;
  const refunded = list(after.refunds).slice(list(before.refunds).length).reduce((sum, r) => sum + (Number(r?.amount) || 0), 0);
  if (refunded <= 0) return;
  await createNotification({
    userId: after.userId, type: "payment_refunded", title: "Refund sent", link: MY_CLIMBS,
    message: `${peso(refunded)} was refunded to you for ${titleOf(after)}. See the details in My Climbs.`,
  });
}

// docsCompleteCount (climb card badge): presence comparison, since before/after uploads are never `===`.
async function syncDocsComplete(before, after, wasActive, isActive) {
  const changed = wasActive !== isActive || REQUIRED_DOC_TYPES.some((t) => !!before[t.uploadField] !== !!after[t.uploadField]);
  if (!changed || !after.userId || !after.climbId) return;
  const snap = await climbRef(after.climbId).get();
  if (!snap.exists) return;
  const wasComplete = wasActive && regDocsComplete(snap.data(), before);
  const isComplete = isActive && regDocsComplete(snap.data(), after);
  if (wasComplete !== isComplete) await bump(after.climbId, "docsCompleteCount", isComplete ? 1 : -1);
}

// Participant list, roster (the climbPrivate rule), registrationCount (non-cancelled, walk-ins too) and docs
// count. Runs before the status-change early return so reinstating re-increments, not just cancelling.
async function syncClimbDenorm(before, after) {
  if (before.status !== after.status || before.name !== after.name || before.memberType !== after.memberType) {
    await syncParticipantList(after.climbId);
  }
  const wasActive = ACTIVE.includes(before.status);
  const isActive = ACTIVE.includes(after.status);
  if (wasActive !== isActive && after.userId) await updateRoster(after.climbId, after.userId, isActive);
  const wasCounted = before.status !== "cancelled";
  const isCounted = after.status !== "cancelled";
  if (wasCounted !== isCounted && after.climbId) await bump(after.climbId, "registrationCount", isCounted ? 1 : -1);
  await syncDocsComplete(before, after, wasActive, isActive);
}

const STATUS_TITLES = { confirmed: "You're confirmed!", cancelled: "Registration cancelled", waitlisted: "Added to waitlist" };

async function announceStatus(after) {
  const snap = await climbRef(after.climbId).get();
  const climb = snap.exists ? snap.data() : { title: after.climbTitle || after.climbId, officers: [] };
  const lists = await getNotifyLists(climb, after.climbId);
  const reason = after.cancellationReason || null;
  if (after.email) {
    await sendEmail({
      to: after.email,
      toName: after.name,
      subject: `Registration Update — ${climb.title} | MMS Open Climbs`,
      html: tplStatusUpdate({ name: after.name, climbTitle: climb.title, newStatus: after.status, reason }),
    });
  }
  if (after.userId) {
    await createNotification({
      userId: after.userId, type: "status_update", link: MY_CLIMBS,
      title: STATUS_TITLES[after.status] || "Registration updated",
      message: `${climb.title} — your registration is now ${after.status}.`,
    });
  }
  await emailOfficers(lists, `[Status Update] ${after.name} → ${after.status.toUpperCase()} — ${climb.title}`, tplOfficerStatusUpdate({
    registrantName: after.name, registrantEmail: after.email, climbTitle: climb.title, newStatus: after.status, reason, appUrl: appUrl(),
  }));
  logger.info("[onRegistrationUpdated] Status email sent", {
    status: after.status, email: after.email, officerCount: lists.officerEmails.length, adminCount: lists.adminEmails.length,
  });
}

async function handleStatusChange(before, after, regId) {
  if (before.status === after.status) return;
  // A seat just freed up: offer it to the waitlist.
  if (SEAT_HOLDING_STATUSES.includes(before.status) && !SEAT_HOLDING_STATUSES.includes(after.status)) {
    await promoteFromWaitlist(after.climbId);
  }
  if (!Object.hasOwn(STATUS_TITLES, after.status)) return;
  try {
    await announceStatus(after);
  } catch (err) {
    logger.error("[onRegistrationUpdated] Failed", { err: err.message });
    await logFailedRequest({
      type: "email", source: "onRegistrationUpdated", message: err.message, userId: after.userId, climbId: after.climbId, registrationId: regId,
    });
  }
}

// WithAuthContext, not the plain variant: only it populates `event.authId` (the forged-payment guard).
export const onRegistrationUpdated = onDocumentUpdatedWithAuthContext(
  { document: "registrations/{regId}", database: "openclimbs", secrets: ["BREVO_API_KEY", "BREVO_FROM_EMAIL"] },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const regId = event.params.regId;
    if (await clampForgedPayments(event, before, after)) return;
    await notifyPaymentStatus(before, after, regId);
    await notifyRejectedInstalments(before, after, regId);
    await notifyRefund(before, after);
    await clearPaperworkReminders(before, after, regId);
    await syncClimbDenorm(before, after);
    await handleStatusChange(before, after, regId);
  },
);

// ── Delete (admin action) ─────────────────────────────────────────────────────

// registeredUserIds / docsCompleteCount track only the active set and real accounts. A dropped duplicate
// never entered them, and the original registration still holds them.
async function releaseRoster(reg, regId) {
  if (!reg.userId || !ACTIVE.includes(reg.status)) return;
  if (await findOtherActiveRegistration({ climbId: reg.climbId, userId: reg.userId, regId })) return;
  await updateRoster(reg.climbId, reg.userId, false);
  const snap = await climbRef(reg.climbId).get();
  if (snap.exists && regDocsComplete(snap.data(), reg)) await bump(reg.climbId, "docsCompleteCount", -1);
}

export const onRegistrationDeleted = onDocumentDeleted(
  { document: "registrations/{regId}", database: "openclimbs" },
  async (event) => {
    const reg = event.data.data();
    if (!reg.climbId) return;
    await syncParticipantList(reg.climbId);
    if (SEAT_HOLDING_STATUSES.includes(reg.status)) await promoteFromWaitlist(reg.climbId);
    try {
      // A cancelled registration was already decremented when it was cancelled.
      if (reg.status !== "cancelled") await bump(reg.climbId, "registrationCount", -1);
      await releaseRoster(reg, event.params.regId);
    } catch (err) {
      logger.error("[onRegistrationDeleted] Failed to sync climb denorm fields", { err: err.message, climbId: reg.climbId });
    }
  },
);
