import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../shared/admin.js";
import { isClimbCancelled, isClimbOver } from "../shared/climbStatus.js";

// Public counts for the home page, so visitors read one doc instead of counting collections.
export async function computeSiteStats(firestore, now = Date.now()) {
  const [members, participants, climbsSnap] = await Promise.all([
    firestore.collection("users").count().get(),
    firestore.collection("registrations").where("status", "==", "confirmed").count().get(),
    firestore.collection("climbs").get(),
  ]);
  const climbs = climbsSnap.docs.map((d) => d.data()).filter((c) => !isClimbCancelled(c));
  return {
    members: members.data().count,
    participants: participants.data().count,
    climbs: climbs.length,
    climbsCompleted: climbs.filter((c) => isClimbOver(c, now)).length,
  };
}

export const refreshSiteStats = onSchedule(
  { schedule: "every day 03:00", timeZone: "Asia/Manila" },
  async () => {
    const stats = await computeSiteStats(db);
    await db.doc("siteStats/public").set({ ...stats, updatedAt: FieldValue.serverTimestamp() });
    logger.info("siteStats refreshed", stats);
  },
);
