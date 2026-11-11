import * as logger from "firebase-functions/logger";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { sendEmail } from "../email/sendEmail.js";
import { tplClimbCancellation, tplOfficerClimbCancellation } from "../email/templates.js";
import { promoteFromWaitlist, getNotifyLists, createNotification, logFailedRequest, regDocsComplete } from "../shared/registrationOps.js";
import { CANCELLATION_LABELS, detectClimbChanges, seatsOpened } from "../shared/climbChanges.js";
import { db } from "../shared/admin.js";

// A requirement was switched off: clear its outstanding nag notifications instead of leaving them unread forever.
async function clearNagNotifications(activeRegs, turnedOffDocTypes) {
  await Promise.all(
    activeRegs.map(async (r) => {
      for (const docType of turnedOffDocTypes) {
        await db
          .collection("notifications")
          .doc(`${docType.notificationPrefix}_${r.id}`)
          .set({ read: true }, { merge: true })
          .catch(() => {});
      }
    }),
  );
}

async function recountDocsComplete(climbId, climb, activeRegs) {
  const docsCompleteCount = activeRegs.filter((r) => regDocsComplete(climb, r)).length;
  await db.doc(`climbs/${climbId}`).update({ docsCompleteCount });
}

// One registrant: email (if they have an address; admin-added joiners may have no account) and in-app notice (account only).
async function tellRegistrant(r, climb, climbId, statusLabel, reason) {
  if (r.email) {
    await sendEmail({
      to: r.email,
      toName: r.name || "",
      subject: `Climb ${statusLabel} — ${climb.title || "MMS Open Climbs"}`,
      html: tplClimbCancellation({
        name: r.name || "there",
        climbTitle: climb.title || "",
        climbDate: climb.dateLabel || "",
        climbLocation: climb.location || "",
        statusLabel,
        reason,
      }),
    }).catch((err) => logger.error("[onClimbUpdated] cancellation email failed", { err: err.message, regId: r.id }));
  }
  if (r.userId) {
    await createNotification({
      userId: r.userId,
      type: "climb_status_change",
      title: `Climb ${statusLabel} — ${climb.title || "your climb"}`,
      message: reason || `This climb has been ${statusLabel.toLowerCase()}.`,
      link: `/event/${climbId}`,
      id: `climbstatus_${climbId}_${climb.cancellationStatus}_${r.id}`,
    });
  }
}

// Officers (cc admins), or the admins directly when there are no officers, learn registrants were already told.
async function tellOfficers(climb, statusLabel, template, { officerEmails, adminEmails }) {
  const subject = `[Climb ${statusLabel}] ${climb.title || "MMS Open Climbs"}`;
  const html = tplOfficerClimbCancellation(template);
  if (officerEmails.length > 0) {
    for (const officer of officerEmails) {
      await sendEmail({ to: officer.email, toName: officer.name, subject, html, cc: adminEmails }).catch((err) =>
        logger.error("[onClimbUpdated] officer cancellation email failed", { err: err.message }),
      );
    }
  } else if (adminEmails.length > 0) {
    const [first, ...rest] = adminEmails;
    await sendEmail({ to: first.email, toName: first.name, subject, html, cc: rest }).catch((err) =>
      logger.error("[onClimbUpdated] admin cancellation email failed", { err: err.message }),
    );
  }
}

async function notifyCancellation(climbId, climb, activeRegs) {
  const statusLabel = CANCELLATION_LABELS[climb.cancellationStatus];
  const reason = climb.cancellationReason || "";
  const lists = await getNotifyLists(climb, climbId);
  await Promise.all(activeRegs.map((r) => tellRegistrant(r, climb, climbId, statusLabel, reason)));
  const template = {
    climbTitle: climb.title || "",
    statusLabel,
    reason,
    registrantCount: activeRegs.length,
    appUrl: process.env.APP_URL || "https://mms-open-climbs.web.app",
  };
  await tellOfficers(climb, statusLabel, template, lists);
}

async function notifyAnnouncements(climbId, climb, activeRegs, newAnnouncements) {
  const recipientIds = [...new Set(activeRegs.map((r) => r.userId).filter(Boolean))];
  for (const note of newAnnouncements) {
    const kind = note.pinned ? "New reminder" : "New announcement";
    await Promise.all(
      recipientIds.map((userId) =>
        createNotification({
          userId,
          type: "climb_announcement",
          title: `${kind} — ${climb.title || "your climb"}`,
          message: note.message,
          link: `/event/${climbId}`,
          id: `announcement_${climbId}_${note.createdAt}_${userId}`,
        }),
      ),
    );
  }
}

// ── Trigger: climb edited → fill the waitlist, clear/recount doc requirements, announce cancellations and notes ──
export const onClimbUpdated = onDocumentUpdated(
  {
    document: "climbs/{climbId}",
    database: "openclimbs",
    secrets: ["BREVO_API_KEY", "BREVO_FROM_EMAIL"],
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const climbId = event.params.climbId;
    const changes = detectClimbChanges(before, after);

    if (seatsOpened(before, after)) await promoteFromWaitlist(climbId);
    if (changes.newAnnouncements.length === 0 && !changes.requirementsChanged && !changes.cancellationChanged) return;

    try {
      const regsSnap = await db.collection("registrations").where("climbId", "==", climbId).get();
      // Everyone who hasn't withdrawn, including joiners an admin added by hand (no userId): they paid, so they are told
      // when the climb is cancelled. Anything that needs an account guards on userId at its own call site.
      const activeRegs = regsSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((r) => r.status !== "cancelled");

      if (changes.turnedOffDocTypes.length > 0) await clearNagNotifications(activeRegs, changes.turnedOffDocTypes);
      if (changes.requirementsChanged) await recountDocsComplete(climbId, after, activeRegs);
      if (changes.cancellationChanged) await notifyCancellation(climbId, after, activeRegs);
      if (changes.newAnnouncements.length > 0) await notifyAnnouncements(climbId, after, activeRegs, changes.newAnnouncements);
    } catch (err) {
      logger.error("[onClimbUpdated] Failed", { err: err.message });
      await logFailedRequest({ type: "firestore", source: "onClimbUpdated", message: err.message, climbId });
    }
  },
);
