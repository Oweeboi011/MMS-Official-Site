import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { sendEmail } from "../email/sendEmail.js";
import { tplWelcome } from "../email/templates.js";
import { logFailedRequest } from "../shared/registrationOps.js";
import { db, adminAuth } from "../shared/admin.js";
import { authUpdateError, profileChanges, validateNewUser } from "../shared/userInput.js";

// ── Callable: issue the caller's admin claim from their users/ role ─────────
// syncAdminClaim only fires on users/ writes, so an admin promoted before it
// existed has no claim and storage.rules would deny them members' files.
// AuthContext calls this when the profile says admin but the token doesn't.
// The role is read server-side; the caller can't grant themselves anything.
export const ensureAdminClaim = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "You must be signed in.");
  const snap = await db.doc(`users/${uid}`).get();
  const isAdmin = snap.exists && snap.data().role === "admin";
  if (!isAdmin) return { admin: false };
  if (request.auth.token?.admin === true) return { admin: true };
  try {
    const user = await adminAuth.getUser(uid);
    await adminAuth.setCustomUserClaims(uid, { ...(user.customClaims || {}), admin: true });
    logger.info("[ensureAdminClaim] claim issued", { uid });
    return { admin: true };
  } catch (err) {
    throw new HttpsError("internal", err.message);
  }
});

// ── Callable: admin creates a user account and sends welcome email ─────────────
// An Auth account can be an orphan from an earlier invite that failed before its profile was written: reuse it.
async function claimAuthAccount(email, displayName) {
  try {
    return { userRecord: await adminAuth.createUser({ email, displayName }), isFreshAccount: true };
  } catch (err) {
    if (err.code !== "auth/email-already-exists") throw new HttpsError("internal", err.message);
  }
  let existing;
  try {
    existing = await adminAuth.getUserByEmail(email);
  } catch (lookupErr) {
    throw new HttpsError("internal", lookupErr.message);
  }
  if ((await db.doc(`users/${existing.uid}`).get()).exists) {
    throw new HttpsError("already-exists", "An account with this email already exists.");
  }
  return { userRecord: existing, isFreshAccount: false };
}

// Profile doc plus a password-setup link; a freshly created Auth user is rolled back if either fails.
async function provisionProfile({ userRecord, isFreshAccount }, { email, displayName, role }, callerUid) {
  try {
    await db.doc(`users/${userRecord.uid}`).set({
      displayName,
      email,
      role,
      createdAt: FieldValue.serverTimestamp(),
      addedBy: callerUid,
    });
    const appUrl = process.env.APP_URL || "https://mms-open-climbs.web.app";
    return await adminAuth.generatePasswordResetLink(email, { url: `${appUrl}/login` });
  } catch (err) {
    if (isFreshAccount) {
      await adminAuth.deleteUser(userRecord.uid).catch((deleteErr) =>
        logger.error("[createUser] Failed to roll back orphaned Auth user", { uid: userRecord.uid, err: deleteErr.message }),
      );
    }
    throw err instanceof HttpsError ? err : new HttpsError("internal", err.message);
  }
}

async function sendWelcome({ email, displayName }, setupLink, uid) {
  try {
    await sendEmail({
      to: email,
      toName: displayName,
      subject: "Welcome to MMS Open Climbs — Set Up Your Account",
      html: tplWelcome({ displayName, setupLink }),
    });
    return true;
  } catch (emailErr) {
    logger.error("[createUser] Welcome email failed", { email, err: emailErr.message });
    await logFailedRequest({ type: "email", source: "createUser", message: emailErr.message, userId: uid });
    return false;
  }
}

// onCall discards the message of a non-HttpsError, so unexpected failures get a reference id the admin can quote.
function unexpectedError(err) {
  // eslint-disable-next-line sonarjs/pseudo-random -- log correlation id, not a secret
  const refId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  logger.error("[createUser] Unexpected error", { refId, err: err.message });
  return new HttpsError("internal", `Unexpected error (ref ${refId}): ${err.message || String(err)}`);
}

export const createUser = onCall({ secrets: ["BREVO_API_KEY", "BREVO_FROM_EMAIL"] }, async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) throw new HttpsError("unauthenticated", "You must be signed in.");

  try {
    const callerSnap = await db.doc(`users/${callerUid}`).get();
    if (!callerSnap.exists || callerSnap.data().role !== "admin") {
      throw new HttpsError("permission-denied", "Only admins can create users.");
    }
    const input = validateNewUser(request.data);
    const account = await claimAuthAccount(input.email, input.displayName);
    const setupLink = await provisionProfile(account, input, callerUid);
    const emailSent = await sendWelcome(input, setupLink, account.userRecord.uid);

    logger.info("[createUser] Created user", { email: input.email, role: input.role, emailSent });
    return { uid: account.userRecord.uid, emailSent };
  } catch (err) {
    throw err instanceof HttpsError ? err : unexpectedError(err);
  }
});

// ── Helper: verify the caller is a signed-in admin, or throw ──────────────────
async function requireAdmin(callerUid) {
  if (!callerUid) throw new HttpsError("unauthenticated", "You must be signed in.");
  const callerSnap = await db.doc(`users/${callerUid}`).get();
  if (!callerSnap.exists || callerSnap.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can do this.");
  }
  return callerSnap.data();
}

// ── Callable: admin corrects a user's name and/or email ───────────────────────
export const updateUserProfile = onCall(async (request) => {
  try {
    await requireAdmin(request.auth?.uid);
    const { uid } = request.data;
    if (!uid) throw new HttpsError("invalid-argument", "uid is required.");
    const changes = profileChanges(request.data);

    await adminAuth.updateUser(uid, changes).catch((err) => {
      throw authUpdateError(err);
    });
    await db.doc(`users/${uid}`).update({ updatedAt: FieldValue.serverTimestamp(), ...changes });

    logger.info("[updateUserProfile] Updated", { uid, email: !!changes.email, displayName: !!changes.displayName });
    return { success: true };
  } catch (err) {
    throw err instanceof HttpsError ? err : new HttpsError("internal", err.message);
  }
});

// ── Helper: remove a deleted account's personal data ────────────────────────
// Registrations stay — they are the club's payment and attendance record —
// but the health and contact details on them, the member's saved details
// (memberDetails), their notifications and every file they uploaded (medical
// certificates, IDs, receipts) go with the account. Best effort: a failure here is logged, never surfaced, since the
// account itself is already gone.
const MEMBER_UPLOAD_PREFIXES = [
  "payment-proofs",
  "registration-form-uploads",
  "medical-cert-uploads",
  "permit-uploads",
  "waiver-doc-uploads",
];

async function purgeUserPersonalData(uid) {
  try {
    const regs = await db.collection("registrations").where("userId", "==", uid).get();
    await Promise.all(
      regs.docs.map((d) =>
        d.ref.update({
          medicalConditions: FieldValue.delete(),
          emergencyContact: FieldValue.delete(),
          dateOfBirth: FieldValue.delete(),
          address: FieldValue.delete(),
          mobile: FieldValue.delete(),
          accountDeletedAt: FieldValue.serverTimestamp(),
        }),
      ),
    );

    await db.doc(`memberDetails/${uid}`).delete();

    const notifs = await db.collection("notifications").where("userId", "==", uid).get();
    await Promise.all(notifs.docs.map((d) => d.ref.delete()));

    const { getStorage } = await import("firebase-admin/storage");
    const bucket = getStorage().bucket();
    await bucket.deleteFiles({ prefix: `profile-photos/${uid}/` });
    const climbIds = [...new Set(regs.docs.map((d) => d.data().climbId).filter(Boolean))];
    await Promise.all(
      climbIds.flatMap((climbId) =>
        MEMBER_UPLOAD_PREFIXES.map((prefix) =>
          bucket.deleteFiles({ prefix: `${prefix}/${climbId}/${uid}/` }),
        ),
      ),
    );
  } catch (err) {
    logger.error("[deleteUserAccount] personal data purge incomplete", {
      uid,
      err: err.message,
    });
  }
}

// If the Auth record is already gone, the Firestore profile is still cleaned up rather than dead-ending on a stale account.
async function deleteAuthUser(uid) {
  try {
    await adminAuth.deleteUser(uid);
  } catch (err) {
    if (err.code !== "auth/user-not-found") throw new HttpsError("internal", err.message);
  }
}

// ── Callable: admin deletes a user's login account and profile ────────────────
export const deleteUserAccount = onCall(async (request) => {
  try {
    const callerUid = request.auth?.uid;
    await requireAdmin(callerUid);

    const { uid } = request.data;
    if (!uid) throw new HttpsError("invalid-argument", "uid is required.");
    if (uid === callerUid) {
      throw new HttpsError(
        "failed-precondition",
        "You cannot delete your own account.",
      );
    }

    await deleteAuthUser(uid);
    await db.doc(`users/${uid}`).delete();
    await purgeUserPersonalData(uid);

    logger.info("[deleteUserAccount] Deleted", { uid });
    return { success: true };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", err.message);
  }
});

export { requireAdmin };
