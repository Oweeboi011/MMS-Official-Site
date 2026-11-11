// Validation and mapping for the user-admin callables, free of Firebase so it can be tested.
import { HttpsError } from "firebase-functions/v2/https";

export function validateNewUser(data) {
  const { email, displayName, role = "member" } = data;
  if (!email || !displayName) throw new HttpsError("invalid-argument", "email and displayName are required.");
  if (!["member", "admin"].includes(role)) throw new HttpsError("invalid-argument", 'role must be "member" or "admin".');
  return { email, displayName, role };
}

// The fields an admin may correct, only those actually given.
export function profileChanges(data) {
  const { email, displayName } = data;
  if (!email && !displayName) throw new HttpsError("invalid-argument", "Provide an email and/or displayName to update.");
  const changes = {};
  if (email) changes.email = email;
  if (displayName) changes.displayName = displayName;
  return changes;
}

const AUTH_UPDATE_ERRORS = {
  "auth/email-already-exists": ["already-exists", "Another account already uses this email address."],
  "auth/user-not-found": ["not-found", "This user's login account no longer exists."],
};

export function authUpdateError(err) {
  const [code, message] = AUTH_UPDATE_ERRORS[err.code] ?? ["internal", err.message];
  return new HttpsError(code, message);
}
