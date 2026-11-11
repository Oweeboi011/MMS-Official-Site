// Admin-role transitions between two versions of a users/ doc, free of Firestore so they can be tested.
const isAdminDoc = (doc) => doc?.role === "admin";

export function adminTransition(before, after) {
  const wasAdmin = isAdminDoc(before);
  const isAdmin = isAdminDoc(after);
  return {
    changed: wasAdmin !== isAdmin,
    isAdmin,
    // The owner-held email grant goes with the role.
    clearEmailGrant: !isAdmin && !!after?.canEmailMembers,
  };
}

export function claimsFor(existing, isAdmin) {
  const claims = { ...existing };
  if (isAdmin) claims.admin = true;
  else delete claims.admin;
  return claims;
}
