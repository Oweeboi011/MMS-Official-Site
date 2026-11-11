import * as logger from "firebase-functions/logger";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { logFailedRequest } from "../shared/registrationOps.js";
import { FieldValue } from "firebase-admin/firestore";
import { adminTransition, claimsFor } from "../shared/adminRole.js";
import { adminAuth, db } from "../shared/admin.js";

// ── Mirror the admin role onto an auth custom claim ──────────────────────────
//
// Storage rules cannot read this project's Firestore: the app uses a named
// database ("openclimbs") and storage's firestore.get() only reaches the
// default one. With no role lookup available, those rules fell back to "any
// signed-in user", which left every member's medical certificate, payment
// receipt, permit and signed waiver readable by anyone who made an account.
//
// A custom claim is the one piece of identity storage.rules *can* read, so
// the role is mirrored here and `request.auth.token.admin` gates those files.
// users/{uid}.role stays the source of truth; this only follows it.
export const syncAdminClaim = onDocumentWritten(
  // `database` is required: this project has no (default) Firestore
  // database, so a trigger that omits it fails the whole deploy.
  { document: "users/{uid}", database: "openclimbs" },
  async (event) => {
    const uid = event.params.uid;
    const before = event.data?.before?.exists ? event.data.before.data() : null;
    const after = event.data?.after?.exists ? event.data.after.data() : null;
    const { changed, isAdmin, clearEmailGrant } = adminTransition(before, after);
    if (!changed) return;

    try {
      const user = await adminAuth.getUser(uid);
      await adminAuth.setCustomUserClaims(uid, claimsFor(user.customClaims, isAdmin));

      // A token already in the wild keeps its old claims for up to an hour, so a revoked admin's session is cut now.
      if (!isAdmin) await adminAuth.revokeRefreshTokens(uid);

      // The email grant goes with the role, or any admin could restore it by re-promoting the account.
      if (clearEmailGrant) await db.doc(`users/${uid}`).update({ canEmailMembers: FieldValue.delete() });

      logger.info("[syncAdminClaim] claim updated", { uid, admin: isAdmin });
    } catch (err) {
      // A users/ doc can exist with no auth user behind it (an admin-created
      // placeholder, or a deleted account). That is not an error worth retrying.
      if (err.code === "auth/user-not-found") {
        logger.info("[syncAdminClaim] no auth user, nothing to sync", { uid });
        return;
      }
      logger.error("[syncAdminClaim] failed", { uid, err: err.message });
      await logFailedRequest({
        type: "firestore",
        source: "syncAdminClaim",
        message: err.message,
        userId: uid,
      });
    }
  },
);
