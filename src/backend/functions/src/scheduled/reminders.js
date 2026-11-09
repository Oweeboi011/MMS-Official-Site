import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { FieldValue } from "firebase-admin/firestore";
import { sendEmail } from "../email/sendEmail.js";
import { tplThankYou, tplOfficerOutstandingSummary } from "../email/templates.js";
import { shortName, getOfficerContacts, createNotification } from "../shared/registrationOps.js";
import { db } from "../shared/admin.js";
import { isClimbCancelled, isClimbOver } from "../shared/climbStatus.js";
import { remindOutstandingPaperwork } from "../shared/paperworkReminders.js";
import { isThankYouDue, officerSummary, paymentReminder, upcomingReminder } from "./reminderMessages.js";

const appUrl = () => process.env.APP_URL || "https://mms-open-climbs.web.app";
const logFailure = (what, details) => (err) =>
  logger.error(`[sendReminderNotifications] ${what}`, { ...details, err: err.message });

async function loadClimbs(climbIds) {
  const climbs = {};
  const climbPrivates = {};
  await Promise.all(climbIds.map(async (climbId) => {
    const [snap, privSnap] = await Promise.all([db.doc(`climbs/${climbId}`).get(), db.doc(`climbPrivate/${climbId}`).get()]);
    if (snap.exists) climbs[climbId] = snap.data();
    if (privSnap.exists) climbPrivates[climbId] = privSnap.data();
  }));
  return { climbs, climbPrivates };
}

// Safety net for the registrants-only participant list: triggers keep it current, but a climb whose
// registrations haven't changed since the list was introduced would otherwise have none.
function syncParticipantLists(regs, climbIds, climbPrivates) {
  return Promise.all(climbIds.map(async (climbId) => {
    const participants = regs
      .filter((r) => r.climbId === climbId)
      .map((r) => ({ name: shortName(r.name), memberType: r.memberType || "" }));
    if (JSON.stringify(climbPrivates[climbId]?.participants || null) === JSON.stringify(participants)) return;
    await db.doc(`climbPrivate/${climbId}`).set({ participants }, { merge: true })
      .catch(logFailure("participant list", { climbId }));
  }));
}

// Payment, paperwork and upcoming-climb nudges; each re-surfaces as unread every run until resolved.
async function remindRegistrant(reg, climb, priv, now, counts) {
  if (!reg.userId || isClimbCancelled(climb)) return;
  const payment = paymentReminder(reg, climb);
  if (payment) {
    await createNotification(payment);
    counts.paymentReminders++;
  }
  if (climb && !isClimbOver(climb, now)) {
    await remindOutstandingPaperwork(reg, reg.id, climb, reg.climbTitle || climb.title || "your climb");
  }
  const upcoming = upcomingReminder(reg, climb, priv, now);
  if (upcoming) {
    await createNotification(upcoming);
    counts.upcomingReminders++;
  }
}

// Each officer of a climb with outstanding items: bell + email, once per climb per day.
async function notifyOfficers(climbId, climb, summary) {
  const climbUrl = `${appUrl()}/admin/climbs/${climbId}`;
  for (const officer of await getOfficerContacts(climbId, climb)) {
    if (officer.userId) {
      await createNotification({
        userId: officer.userId,
        type: "officer_outstanding_summary",
        title: "Outstanding registrant items",
        message: summary.message,
        link: `/admin/climbs/${climbId}`,
        id: `officer_outstanding_${climbId}_${officer.userId}`,
      });
    }
    if (!officer.email) continue;
    await sendEmail({
      to: officer.email,
      toName: officer.name || "",
      subject: `[Action Needed] ${climb.title || "Climb"} — Outstanding Registrant Items`,
      html: tplOfficerOutstandingSummary({
        officerName: officer.name || "there",
        climbTitle: climb.title || "your climb",
        unpaidCount: summary.unpaidCount,
        missingDocsCount: summary.missingDocsCount,
        climbUrl,
      }),
    }).catch(logFailure("Officer summary email failed", { climbId, email: officer.email }));
  }
}

async function sendOfficerSummaries(regs, climbIds, climbs, now) {
  let sent = 0;
  for (const climbId of climbIds) {
    const climb = climbs[climbId];
    const summary = officerSummary(climb, regs.filter((r) => r.climbId === climbId), now);
    if (!summary) continue;
    await notifyOfficers(climbId, climb, summary);
    sent++;
  }
  return sent;
}

async function thankJoiner(reg, climbId, climb, counts) {
  if (reg.email) {
    await sendEmail({
      to: reg.email,
      toName: reg.name,
      subject: `Thank You for Climbing With Us — ${climb.title} | MMS Open Climbs`,
      html: tplThankYou({
        name: reg.name,
        climbTitle: climb.title,
        appUrl: appUrl(),
        feedbackUrl: `${appUrl()}/feedback/${climbId}`,
        beneficiary: reg.donationReceived ? climb.donationDrive?.beneficiary || "the outreach" : "",
      }),
    }).then(() => { counts.thankYouEmails++; }, logFailure("Thank-you email failed", { climbId, email: reg.email }));
  }
  if (reg.userId) {
    await createNotification({
      userId: reg.userId,
      type: "feedback_request",
      title: "How was your climb?",
      message: `Share your feedback on ${climb.title} — it only takes a minute.`,
      link: `/feedback/${climbId}`,
      id: `feedback_${climbId}_${reg.userId}`,
    });
    counts.feedbackNotifications++;
  }
}

// Thank-you email + feedback request to every confirmed joiner who showed up, once per finished climb.
async function sendThankYous(regs, climbIds, climbs, now, counts) {
  for (const climbId of climbIds) {
    const climb = climbs[climbId];
    if (!isThankYouDue(climb, now)) continue;
    const joiners = regs.filter((r) => r.climbId === climbId && r.status === "confirmed" && !r.noShow);
    for (const reg of joiners) await thankJoiner(reg, climbId, climb, counts);
    await db.doc(`climbs/${climbId}`).update({ thankYouSentAt: FieldValue.serverTimestamp() });
  }
}

export const sendReminderNotifications = onSchedule(
  {
    schedule: "every day 09:00",
    timeZone: "Asia/Manila",
    secrets: ["BREVO_API_KEY", "BREVO_FROM_EMAIL"],
  },
  async () => {
    const regsSnap = await db.collection("registrations").where("status", "in", ["pending", "confirmed"]).get();
    const regs = regsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const climbIds = [...new Set(regs.map((r) => r.climbId).filter(Boolean))];
    const { climbs, climbPrivates } = await loadClimbs(climbIds);
    await syncParticipantLists(regs, climbIds, climbPrivates);

    const now = Date.now();
    const counts = { paymentReminders: 0, upcomingReminders: 0, thankYouEmails: 0, feedbackNotifications: 0 };
    for (const reg of regs) await remindRegistrant(reg, climbs[reg.climbId], climbPrivates[reg.climbId], now, counts);
    const officerSummariesSent = await sendOfficerSummaries(regs, climbIds, climbs, now);
    await sendThankYous(regs, climbIds, climbs, now, counts);

    logger.info("[sendReminderNotifications] Done", { totalRegs: regs.length, ...counts, officerSummariesSent });
  },
);
