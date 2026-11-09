import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../shared/admin.js";
import { isClimbCancelled, isClimbOver } from "../shared/climbStatus.js";

// Public counts for the home page, so visitors read one doc instead of counting collections.
// accounts = every sign-up (incl. officers); "active members" needs a definition from leads (open item 14).
export async function computeSiteStats(firestore, now = Date.now()) {
  const [accounts, regsSnap, climbsSnap] = await Promise.all([
    firestore.collection("users").count().get(),
    firestore.collection("registrations").where("status", "==", "confirmed").get(),
    firestore.collection("climbs").get(),
  ]);
  const climbs = climbsSnap.docs.filter((d) => !isClimbCancelled(d.data()));
  const done = new Set(climbs.filter((d) => isClimbOver(d.data(), now)).map((d) => d.id));
  // Distinct people who went on a finished climb (no-shows excluded).
  const climbers = new Set(
    regsSnap.docs.map((d) => d.data()).filter((r) => done.has(r.climbId) && !r.noShow && r.userId).map((r) => r.userId),
  );
  return { accounts: accounts.data().count, climbers: climbers.size, climbs: climbs.length, climbsCompleted: done.size };
}

export const refreshSiteStats = onSchedule(
  { schedule: "every day 03:00", timeZone: "Asia/Manila" },
  async () => {
    const stats = await computeSiteStats(db);
    await db.doc("siteStats/public").set({ ...stats, updatedAt: FieldValue.serverTimestamp() });
    logger.info("siteStats refreshed", stats);
  },
);
