// Firestore + Storage security rules (src/backend/firebase), run on the emulators (needs Java): npm run test:rules.
// Ported from mms-open-climbs; Quality Gates runs it.
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { readFileSync } from "node:fs";

const rules = (f) => readFileSync(new URL(`../../src/backend/firebase/${f}`, import.meta.url), "utf8");

const FV = firebase.firestore.FieldValue;
const TS = firebase.firestore.Timestamp;
const env = await initializeTestEnvironment({
  projectId: "demo-rules",
  // Hosts/ports come from the env vars `firebase emulators:exec` sets.
  firestore: { rules: rules("firestore.rules") },
  storage: { rules: rules("storage.rules") },
});

let pass = 0, fail = 0;
async function t(name, fn) {
  try { await fn(); pass++; console.log("  ok   " + name); }
  catch (e) { fail++; console.log("  FAIL " + name + " :: " + String(e.message || e).slice(0, 200)); }
}

const ts = TS.fromMillis(1_700_000_000_000);
async function seed() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await db.doc("users/admin").set({ role: "admin" });
    await db.doc("users/admin2").set({ role: "admin" });
    await db.doc("releaseNoteEmailJobs/j1").set({ releaseNoteId: "rn1", status: "sending" });
    await db.doc("users/m1").set({ role: "member" });
    await db.doc("users/m2").set({ role: "member" });
    await db.doc("climbs/c1").set({ status: "open", title: "Pulag" });
    await db.doc("climbInternal/c1").set({ registeredUserIds: ["m1"], officerEmails: [{ email: "o@x.com" }] });
    await db.doc("climbPrivate/c1").set({ resources: [] });
    // c2: not yet migrated — roster still only on the climb doc.
    await db.doc("climbs/c2").set({ status: "open", title: "Apo", registeredUserIds: ["m2"] });
    await db.doc("climbPrivate/c2").set({ resources: [] });
    await db.doc("registrations/r_unpaid").set({ userId: "m1", climbId: "c1", status: "pending", paymentStatus: "unpaid", amountPaid: null, payments: [], waiverSigned: false });
    await db.doc("registrations/r_hist").set({ userId: "m1", climbId: "c1", status: "confirmed", paymentStatus: "verified", amountPaid: 500,
      payments: [{ amount: 500, proofs: [], submittedAt: ts, status: "verified", reviewedBy: "A" }] });
    await db.doc("registrations/r_legacy").set({ userId: "m1", climbId: "c1", status: "confirmed", paymentStatus: "verified", amountPaid: 300, paymentProofs: [{ url: "u" }] });
  });
}

const m1 = () => env.authenticatedContext("m1", { email: "m1@x.com" }).firestore();
const m2 = () => env.authenticatedContext("m2", { email: "m2@x.com" }).firestore();
const admin = () => env.authenticatedContext("admin", { email: "a@x.com", admin: true }).firestore();
const anon = () => env.unauthenticatedContext().firestore();
const baseReg = { userId: "m1", climbId: "c1", email: "m1@x.com", name: "Juan", status: "pending", memberType: "joiner",
  waiverSigned: true, waiverSignedName: "Juan Cruz", paymentStatus: "unpaid", amountPaid: null, payments: [], paymentProofs: [] };
const newPay = (amount, extra = {}) => ({ amount, proofs: [{ url: "p" }], submittedAt: TS.now(), status: "submitted", ...extra });
const ok = (name, fn) => t(name, () => assertSucceeds(fn()));
const no = (name, fn) => t(name, () => assertFails(fn()));

console.log("Firestore: registration create");
await seed();
await ok("member creates unpaid registration", () => m1().collection("registrations").add(baseReg));
await ok("member creates with one submitted payment", () => m1().collection("registrations").add({ ...baseReg, paymentStatus: "submitted", amountPaid: 800, payments: [newPay(800)] }));
// Full doc the new site's form writes (src/frontend/data/registration.ts buildRegistrationDoc).
await ok("site form registration", () => m1().collection("registrations").add({
  ...baseReg, climbTitle: "Mt. X", climbDate: "Nov 20", climbLocation: "Benguet", mobile: "0917", dateOfBirth: "", address: "",
  emergencyContact: { name: "B", mobile: "0918", relationship: "Sister" }, medicalConditions: "", experienceLevel: "beginner",
  privacyConsentAt: FV.serverTimestamp(), privacyNoticeVersion: "2026-10-18", waiverSignedAt: FV.serverTimestamp(), paymentSubmittedAt: null,
  feeBreakdown: [{ label: "Guide", amount: "1500", optional: false, selected: true }], createdAt: FV.serverTimestamp(),
}));
await no("reject status confirmed", () => m1().collection("registrations").add({ ...baseReg, status: "confirmed" }));
await no("reject paymentStatus verified", () => m1().collection("registrations").add({ ...baseReg, paymentStatus: "verified" }));
await no("reject someone else's email", () => m1().collection("registrations").add({ ...baseReg, email: "victim@x.com" }));
await no("reject pre-verified payment entry", () => m1().collection("registrations").add({ ...baseReg, paymentStatus: "submitted", amountPaid: 800, payments: [newPay(800, { status: "verified" })] }));
await no("reject amountPaid above payment", () => m1().collection("registrations").add({ ...baseReg, paymentStatus: "submitted", amountPaid: 9000, payments: [newPay(800)] }));
await no("reject bad memberType", () => m1().collection("registrations").add({ ...baseReg, memberType: "vip" }));
await no("reject registering as another user", () => m2().collection("registrations").add({ ...baseReg }));
await ok("admin creates walk-in", () => admin().collection("registrations").add({ ...baseReg, email: "walkin@x.com", status: "confirmed" }));

console.log("Firestore: payment history updates");
await seed();
await ok("first payment on unpaid (amountPaid null)", () => m1().doc("registrations/r_unpaid").update({ payments: FV.arrayUnion(newPay(200)), amountPaid: 200, paymentStatus: "submitted", paymentSubmittedAt: FV.serverTimestamp(), verifiedAt: null, verifiedBy: null }));
await seed();
await ok("append on history", () => m1().doc("registrations/r_hist").update({ payments: FV.arrayUnion(newPay(200)), amountPaid: 700, paymentStatus: "submitted", verifiedAt: null, verifiedBy: null }));
await seed();
await no("reject forged verified entry", () => m1().doc("registrations/r_hist").update({ payments: FV.arrayUnion(newPay(200, { status: "verified" })), amountPaid: 700 }));
await no("reject rewriting accepted amount", () => m1().doc("registrations/r_hist").update({ payments: [{ amount: 5000, proofs: [], submittedAt: ts, status: "verified", reviewedBy: "A" }], amountPaid: 5000 }));
await no("reject inflated amountPaid", () => m1().doc("registrations/r_hist").update({ payments: FV.arrayUnion(newPay(200)), amountPaid: 5000 }));
await no("reject amountPaid alone", () => m1().doc("registrations/r_hist").update({ amountPaid: 5000 }));
await no("reject two entries at once", () => m1().doc("registrations/r_hist").update({ payments: FV.arrayUnion(newPay(1), newPay(2)), amountPaid: 503 }));
await no("reject self-verify status", () => m1().doc("registrations/r_unpaid").update({ paymentStatus: "verified" }));
await ok("legacy registration migrates on first new payment", () => m1().doc("registrations/r_legacy").update({ payments: [{ amount: 300, proofs: [{ url: "u" }], submittedAt: null, status: "verified" }, newPay(100)], amountPaid: 400, paymentStatus: "submitted" }));
await seed();
await no("reject legacy migration that inflates", () => m1().doc("registrations/r_legacy").update({ payments: [{ amount: 900, proofs: [], submittedAt: null, status: "verified" }, newPay(100)], amountPaid: 1000 }));
await ok("member uploads document", () => m1().doc("registrations/r_hist").update({ medicalCertUpload: { url: "x", fileName: "a.pdf" } }));
await no("member cannot mark their own document received offline", () => m1().doc("registrations/r_hist").update({ permitUpload: { receivedOffline: true, note: "trust me" } }));
await no("member cannot mark their own waiver received offline", () => m1().doc("registrations/r_hist").update({ waiverReceivedOffline: { note: "trust me" } }));
await ok("admin marks a document received offline", () => admin().doc("registrations/r_hist").update({ permitUpload: { receivedOffline: true, note: "Shown at the jump-off", markedBy: "Ada" } }));
await ok("admin marks a waiver received offline", () => admin().doc("registrations/r_hist").update({ waiverReceivedOffline: { note: "Paper waiver", markedBy: "Ada" } }));
await ok("member signs own waiver", () => m1().doc("registrations/r_unpaid").update({ waiverSigned: true, waiverSignedName: "Juan Cruz", waiverSignedAt: FV.serverTimestamp() }));
await ok("member updates own details", () => m1().doc("registrations/r_hist").update({ mobile: "0917" }));
await ok("member pledges a donation", () => m1().doc("registrations/r_hist").update({ donation: { cashPledge: 500, inKind: "10 notebooks" }, updatedAt: FV.serverTimestamp() }));
await ok("member pledges cash with their GCash payment", () => m1().doc("registrations/r_hist").update({ donation: { cashPledge: 300, inKind: "", payWithFees: true } }));
await ok("member pledges item quantities", () => m1().doc("registrations/r_hist").update({ donation: { cashPledge: null, inKind: "", payWithFees: false, itemPledges: [{ name: "Notebooks", qty: 10 }] } }));
await ok("member withdraws a pledge", () => m1().doc("registrations/r_hist").update({ donation: null }));
await no("member cannot record their own donation as received", () => m1().doc("registrations/r_hist").update({ donationReceived: { cash: 500, items: "", receivedBy: "me" } }));
await no("member cannot clear a no-show mark", () => m1().doc("registrations/r_hist").update({ noShow: false }));
await no("pledge with extra fields denied", () => m1().doc("registrations/r_hist").update({ donation: { cashPledge: 500, received: true } }));
await no("negative cash pledge denied", () => m1().doc("registrations/r_hist").update({ donation: { cashPledge: -5, inKind: "" } }));
await ok("member registers with a pledge", () => m1().collection("registrations").add({ ...baseReg, donation: { cashPledge: 300, inKind: "" } }));
await no("member cannot register as already-received donor", () => m1().collection("registrations").add({ ...baseReg, donationReceived: { cash: 300 } }));
await ok("admin records a received donation", () => admin().doc("registrations/r_hist").update({ donationReceived: { cash: 500, items: "", receivedBy: "Lead" } }));
const cancelPatch = { status: "cancelled", cancelledByMember: true, cancellationReason: "You cancelled", cancelledAt: FV.serverTimestamp(), updatedAt: FV.serverTimestamp() };
await ok("member cancels their own registration", () => m1().doc("registrations/r_unpaid").update(cancelPatch));
await seed();
await no("member cannot cancel someone else's", () => m2().doc("registrations/r_unpaid").update(cancelPatch));
await no("member cannot reinstate themselves", async () => {
  await env.withSecurityRulesDisabled((c) => c.firestore().doc("registrations/r_unpaid").update({ status: "cancelled" }));
  return m1().doc("registrations/r_unpaid").update({ status: "pending" });
});
await seed();
await no("member cannot self-confirm while 'cancelling'", () => m1().doc("registrations/r_unpaid").update({ ...cancelPatch, status: "confirmed" }));
await no("cancel cannot smuggle other fields", () => m1().doc("registrations/r_unpaid").update({ ...cancelPatch, paymentStatus: "verified" }));
await ok("admin edits payment", () => admin().doc("registrations/r_hist").update({ paymentStatus: "verified", amountPaid: 1 }));

console.log("Firestore: roster, private, feedback, analytics");
await seed();
await ok("registrant reads climbPrivate", () => m1().doc("climbPrivate/c1").get());
await no("non-registrant denied climbPrivate", () => m2().doc("climbPrivate/c1").get());
await ok("registrant of an unmigrated climb reads climbPrivate", () => m2().doc("climbPrivate/c2").get());
await no("non-registrant of an unmigrated climb denied", () => m1().doc("climbPrivate/c2").get());
await no("member denied climbInternal", () => m1().doc("climbInternal/c1").get());
await ok("admin reads climbInternal", () => admin().doc("climbInternal/c1").get());
await ok("public still reads climbs", () => anon().doc("climbs/c1").get());
const fb = { climbId: "c1", climbTitle: "Pulag", userId: "m1", name: "Juan", rating: 5, comments: "great", createdAt: FV.serverTimestamp() };
await ok("registrant leaves feedback", () => m1().doc("feedback/c1_m1").set(fb));
await no("non-registrant feedback denied", () => m2().doc("feedback/c1_m2").set({ ...fb, userId: "m2" }));
await seed();
await no("oversized feedback denied", () => m1().doc("feedback/c1_m1").set({ ...fb, comments: "x".repeat(3000) }));
const pv = { path: "/", climbId: null, userId: null, userRole: "guest", sessionId: "s", timestamp: FV.serverTimestamp() };
await ok("guest page view with expireAt", () => anon().collection("pageViews").add({ ...pv, expireAt: TS.fromMillis(Date.now() + 90 * 864e5) }));
await ok("guest page view without expireAt", () => anon().collection("pageViews").add(pv));
await no("page view expireAt 5y out denied", () => anon().collection("pageViews").add({ ...pv, expireAt: TS.fromMillis(Date.now() + 5 * 365 * 864e5) }));
await ok("failed request with expireAt", () => anon().collection("failedRequests").add({ type: "client", source: "x", message: "m", userId: null, createdAt: FV.serverTimestamp(), expireAt: TS.fromMillis(Date.now() + 90 * 864e5) }));
await no("member cannot self-promote", () => m1().doc("users/m1").update({ role: "admin" }));
await no("member cannot change their createdAt", () => m1().doc("users/m1").update({ createdAt: TS.now() }));
await no("admin cannot change a user's createdAt", () => admin().doc("users/m2").update({ createdAt: TS.now() }));
await no("new user cannot create a profile with canEmailMembers", () => env.authenticatedContext("m9").firestore().doc("users/m9").set({ role: "member", canEmailMembers: true }));
await ok("new user creates a plain profile", () => env.authenticatedContext("m8").firestore().doc("users/m8").set({ role: "member" }));
await no("member cannot grant themselves canEmailMembers", () => m1().doc("users/m1").update({ canEmailMembers: true }));
await no("admin cannot grant themselves canEmailMembers", () => admin().doc("users/admin").update({ canEmailMembers: true }));
await no("admin cannot grant canEmailMembers to another admin either", () => admin().doc("users/admin2").update({ canEmailMembers: true }));
await ok("admin still edits their own profile", () => admin().doc("users/admin").update({ displayName: "Ada" }));
const details = { mobile: "+63 917 000 0000", ecName: "Ana", ecMobile: "+63 918 000 0000", ecRelationship: "Sister", memberType: "joiner", experienceLevel: "beginner", medicalConditions: "None", updatedAt: FV.serverTimestamp() };
await ok("member saves their own details", () => m1().doc("memberDetails/m1").set(details));
await ok("member reads their own details", () => m1().doc("memberDetails/m1").get());
await no("member cannot read another's details", () => m2().doc("memberDetails/m1").get());
await no("member cannot write another's details", () => m2().doc("memberDetails/m1").set(details));
await no("guest cannot read details", () => anon().doc("memberDetails/m1").get());
await ok("admin reads a member's details", () => admin().doc("memberDetails/m1").get());
await ok("admin fills in a member's details", () => admin().doc("memberDetails/m2").set(details));
await no("details reject unknown fields", () => m1().doc("memberDetails/m1").set({ ...details, role: "admin" }));
await no("details reject a made-up participant type", () => m1().doc("memberDetails/m1").set({ ...details, memberType: "vip" }));
await no("details reject oversized medical notes", () => m1().doc("memberDetails/m1").set({ ...details, medicalConditions: "x".repeat(2001) }));
await no("member cannot delete their details record", () => m1().doc("memberDetails/m1").delete());
await ok("admin reads an email job", () => admin().doc("releaseNoteEmailJobs/j1").get());
await no("member cannot read an email job", () => m1().doc("releaseNoteEmailJobs/j1").get());
await no("admin cannot forge an email job", () => admin().collection("releaseNoteEmailJobs").add({ releaseNoteId: "rn1", status: "queued" }));
await ok("admin deletes a release note", () => admin().doc("releaseNotes/rn-x").delete());
await ok("admin saves a note with its checkpoint repo", () => admin().collection("releaseNotes").add({ status: "published", sourceCommit: "abc1234", sourceRepo: "Oweeboi011/MMS-Official-Site" }));
await no("reject a checkpoint without its repo", () => admin().collection("releaseNotes").add({ status: "published", sourceCommit: "abc1234" }));
await env.withSecurityRulesDisabled((c) => c.firestore().doc("releaseNotes/legacy").set({ status: "draft", sourceCommit: "abc1234", title: "Old" }));
await ok("admin edits a legacy note without touching its checkpoint", () => admin().doc("releaseNotes/legacy").update({ title: "Fixed", status: "published" }));
await no("reject changing a checkpoint without its repo", () => admin().doc("releaseNotes/legacy").update({ sourceCommit: "def5678" }));
await ok("admin clears a bad checkpoint", () => admin().doc("releaseNotes/legacy").update({ sourceCommit: FV.delete() }));
await no("reject a branch name as checkpoint", () => admin().collection("releaseNotes").add({ status: "published", sourceCommit: "main", sourceRepo: "Oweeboi011/MMS-Official-Site" }));
await no("reject an empty checkpoint repo", () => admin().collection("releaseNotes").add({ status: "published", sourceCommit: "abc1234", sourceRepo: "" }));

console.log("Firestore: site content (announcements, officers, surveys, settings, stats)");
await seed();
await env.withSecurityRulesDisabled(async (c) => {
  const db = c.firestore();
  await db.doc("announcements/pub").set({ title: "T", summary: "S", category: "Club", publishedAt: ts, published: true });
  await db.doc("announcements/draft").set({ title: "T", summary: "S", category: "Club", publishedAt: ts, published: false });
  await db.doc("siteStats/public").set({ accounts: 1, climbers: 0, climbs: 0, climbsCompleted: 0 });
});
const ann = { title: "BMC open", summary: "Lectures in November.", category: "Training", publishedAt: ts, published: true };
await ok("guest reads a published announcement", () => anon().doc("announcements/pub").get());
await no("guest cannot read a draft", () => anon().doc("announcements/draft").get());
await ok("guest lists published announcements", () => anon().collection("announcements").where("published", "==", true).get());
await no("guest cannot list all announcements", () => anon().collection("announcements").get());
await ok("admin reads a draft", () => admin().doc("announcements/draft").get());
await ok("admin creates an announcement", () => admin().collection("announcements").add(ann));
await no("member cannot create an announcement", () => m1().collection("announcements").add(ann));
await no("reject unknown category", () => admin().collection("announcements").add({ ...ann, category: "Party" }));
await no("reject extra field", () => admin().collection("announcements").add({ ...ann, html: "<b>x</b>" }));
await no("reject oversized summary", () => admin().collection("announcements").add({ ...ann, summary: "x".repeat(2001) }));
await no("reject missing publishedAt", () => admin().collection("announcements").add({ title: "T", summary: "S", category: "Club", published: true }));
const officer = { body: "execom", role: "President", name: "Juan Cruz", order: 1, current: true };
await ok("guest reads officers", () => anon().collection("officers").get());
await ok("admin adds an officer with term", () => admin().collection("officers").add({ ...officer, term: "2026-2027" }));
await no("member cannot add an officer", () => m1().collection("officers").add(officer));
await no("reject non-integer order", () => admin().collection("officers").add({ ...officer, order: "1" }));
await ok("admin adds a past president", () => admin().collection("officers").add({ ...officer, current: false, term: "2024-2026" }));
await no("reject unknown leadership body", () => admin().collection("officers").add({ ...officer, body: "fanclub" }));
await no("reject past officer without a term", () => admin().collection("officers").add({ ...officer, current: false }));
await no("reject officer without current flag", () => admin().collection("officers").add({ body: "bot", role: "Trustee", name: "A", order: 1 }));
const committee = { tag: "Climbs", title: "Climbs Committee", headTitle: "Head", headName: "Mikee Santos", description: "Plans the calendar.", order: 1 };
await ok("guest reads committees", () => anon().collection("committees").get());
await ok("admin adds a committee", () => admin().collection("committees").add(committee));
await ok("admin adds a committee with no head yet", () => admin().collection("committees").add({ ...committee, headName: "" }));
await no("member cannot add a committee", () => m1().collection("committees").add(committee));
await no("reject blank committee title", () => admin().collection("committees").add({ ...committee, title: " " }));
const survey = { title: "Joiner survey", description: "D", audience: "Everyone", status: "Open", formUrl: "https://forms.gle/x" };
await ok("admin adds a survey", () => admin().collection("surveys").add(survey));
await ok("admin adds a survey without a form yet", () => admin().collection("surveys").add({ ...survey, formUrl: "#" }));
await no("reject javascript: form link", () => admin().collection("surveys").add({ ...survey, formUrl: "javascript:alert(1)" }));
// eslint-disable-next-line sonarjs/no-clear-text-protocols -- asserts the rule rejects http
await no("reject plain http form link", () => admin().collection("surveys").add({ ...survey, formUrl: "http://forms.gle/x" }));
await no("member cannot add a survey", () => m1().collection("surveys").add(survey));
await ok("guest reads surveys", () => anon().collection("surveys").get());
await ok("guest reads site settings", () => anon().doc("siteSettings/site").get());
await ok("admin writes site settings", () => admin().doc("siteSettings/site").set({ previewNotice: "" }));
await ok("admin writes full site settings", () => admin().doc("siteSettings/site").set({ motto: "Once an MMS", socials: { facebook: "https://facebook.com/mms" }, tickerItems: ["Climb"], photoAlbumsUrl: "", updatedAt: FV.serverTimestamp() }));
await no("reject javascript: social link", () => admin().doc("siteSettings/site").set({ socials: { facebook: "javascript:alert(1)" } }));
await no("reject unknown social", () => admin().doc("siteSettings/site").set({ socials: { myspace: "https://x.com" } }));
await no("reject ticker as text", () => admin().doc("siteSettings/site").set({ tickerItems: "Climb" }));
await no("reject unknown settings field", () => admin().doc("siteSettings/site").set({ theme: "dark" }));
await no("reject other settings doc", () => admin().doc("siteSettings/other").set({ motto: "x" }));
await no("reject updatedAt as text", () => admin().collection("faqs").add({ q: "Q", a: "A", order: 1, updatedAt: "today" }));
await no("reject survey closes as map", () => admin().collection("surveys").add({ ...survey, closes: { d: 1 } }));
await no("member cannot write site settings", () => m1().doc("siteSettings/site").set({ previewNotice: "" }));
await ok("guest reads site stats", () => anon().doc("siteStats/public").get());
await no("admin cannot forge site stats", () => admin().doc("siteStats/public").set({ accounts: 9999 }));
await no("admin cannot update site stats", () => admin().doc("siteStats/public").update({ accounts: 9999 }));
await no("admin cannot delete site stats", () => admin().doc("siteStats/public").delete());

console.log("Firestore: inquiries, reviews, faqs, glossary, media");
await seed();
await env.withSecurityRulesDisabled(async (c) => {
  const db = c.firestore();
  await db.doc("inquiries/i1").set({ name: "Ana", email: "ana@x.com", interest: "membership", message: "Hi", consent: true, createdAt: ts });
  await db.doc("reviews/pub").set({ climbTitle: "Pulag", name: "Ana", rating: 5, quote: "Great", published: true, publishedAt: ts });
  await db.doc("reviews/draft").set({ climbTitle: "Pulag", name: "Ben", rating: 4, quote: "Good", published: false, publishedAt: ts });
});
const inq = { name: "Ana", email: "ana@x.com", interest: "membership", message: "How do I join?", consent: true, createdAt: FV.serverTimestamp() };
await ok("guest sends an inquiry", () => anon().collection("inquiries").add(inq));
await ok("guest sends an inquiry with phone", () => anon().collection("inquiries").add({ ...inq, phone: "0917 000 0000" }));
await no("reject bad email", () => anon().collection("inquiries").add({ ...inq, email: "not-an-email" }));
await no("reject unknown interest", () => anon().collection("inquiries").add({ ...inq, interest: "sales" }));
await no("reject client-set createdAt", () => anon().collection("inquiries").add({ ...inq, createdAt: ts }));
await no("reject oversized message", () => anon().collection("inquiries").add({ ...inq, message: "x".repeat(2001) }));
await no("reject extra field", () => anon().collection("inquiries").add({ ...inq, status: "done" }));
await no("reject inquiry without consent", () => anon().collection("inquiries").add({ ...inq, consent: false }));
await no("reject empty message", () => anon().collection("inquiries").add({ ...inq, message: "" }));
await no("reject empty name", () => anon().collection("inquiries").add({ ...inq, name: "" }));
await no("reject blank message", () => anon().collection("inquiries").add({ ...inq, message: "   " }));
await no("guest cannot edit an inquiry", () => anon().doc("inquiries/i1").update({ message: "changed" }));
await no("guest cannot delete an inquiry", () => anon().doc("inquiries/i1").delete());
await no("guest cannot read inquiries", () => anon().doc("inquiries/i1").get());
await no("member cannot read inquiries", () => m1().collection("inquiries").get());
await ok("admin reads inquiries", () => admin().collection("inquiries").get());
const review = { climbTitle: "Pulag", name: "Ana", rating: 5, quote: "Best sunrise.", published: true, publishedAt: ts, feedbackId: "c1_m1" };
await ok("guest reads a published review", () => anon().doc("reviews/pub").get());
await no("guest cannot read a draft review", () => anon().doc("reviews/draft").get());
await ok("guest lists published reviews", () => anon().collection("reviews").where("published", "==", true).get());
await ok("admin publishes a review", () => admin().collection("reviews").add(review));
await no("member cannot publish a review", () => m1().collection("reviews").add(review));
await no("reject rating 6", () => admin().collection("reviews").add({ ...review, rating: 6 }));
await ok("guest reads faqs", () => anon().collection("faqs").get());
await ok("admin adds a faq", () => admin().collection("faqs").add({ q: "Do I need experience?", a: "No.", order: 1 }));
await no("member cannot add a faq", () => m1().collection("faqs").add({ q: "Q", a: "A", order: 1 }));
await no("reject faq without order", () => admin().collection("faqs").add({ q: "Q", a: "A" }));
await ok("guest reads glossary", () => anon().collection("glossary").get());
await ok("admin adds a term", () => admin().collection("glossary").add({ term: "LNT", name: "Leave No Trace", about: "Outdoor ethics." }));
await no("member cannot add a term", () => m1().collection("glossary").add({ term: "X", name: "X", about: "X" }));
const video = { kind: "video", title: "Pinatubo", url: "https://upload.wikimedia.org/v.webm", order: 1, poster: "/images/p.webp" };
await ok("guest reads media", () => anon().collection("media").get());
await ok("admin adds a video", () => admin().collection("media").add(video));
await ok("admin adds a site photo", () => admin().collection("media").add({ kind: "photo", title: "Summit", url: "/images/s.webp", order: 2 }));
await no("reject javascript: media url", () => admin().collection("media").add({ ...video, url: "javascript:alert(1)" }));
await no("reject image path with ..", () => admin().collection("media").add({ ...video, url: "/images/../admin" }));
await no("reject blank faq answer", () => admin().collection("faqs").add({ q: "Q", a: "   ", order: 1 }));
await no("reject blank announcement title", () => admin().collection("announcements").add({ ...ann, title: " " }));
await no("reject unknown media kind", () => admin().collection("media").add({ ...video, kind: "audio" }));
await no("reject javascript: poster", () => admin().collection("media").add({ ...video, poster: "javascript:alert(1)" }));
await no("member cannot add media", () => m1().collection("media").add(video));

console.log("Storage");
const png = new Uint8Array([137, 80, 78, 71]);
const sm1 = () => env.authenticatedContext("m1", { email: "m1@x.com" }).storage();
const sm2 = () => env.authenticatedContext("m2", { email: "m2@x.com" }).storage();
const sad = () => env.authenticatedContext("admin", { email: "a@x.com", admin: true }).storage();
await ok("member uploads own receipt", () => sm1().ref("payment-proofs/c1/m1/1_r.png").put(png, { contentType: "image/png" }));
await ok("member reads own receipt", () => sm1().ref("payment-proofs/c1/m1/1_r.png").getMetadata());
await no("other member cannot read it", () => sm2().ref("payment-proofs/c1/m1/1_r.png").getMetadata());
await no("other member cannot list folder", () => sm2().ref("payment-proofs/c1/m1").listAll());
await ok("admin reads it", () => sad().ref("payment-proofs/c1/m1/1_r.png").getMetadata());
await no("member cannot overwrite own receipt", () => sm1().ref("payment-proofs/c1/m1/1_r.png").put(png, { contentType: "image/png" }));
await no("member cannot upload into another's folder", () => sm2().ref("payment-proofs/c1/m1/2_r.png").put(png, { contentType: "image/png" }));
await ok("admin uploads for walk-in", () => sad().ref("payment-proofs/c1/reg123/1_r.pdf").put(png, { contentType: "application/pdf" }));
await ok("docx medical cert allowed", () => sm1().ref("medical-cert-uploads/c1/m1/1_m.docx").put(png, { contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }));
await no("html upload denied", () => sm1().ref("medical-cert-uploads/c1/m1/1_m.html").put(png, { contentType: "text/html" }));
await no("member cannot replace GCash QR", () => sm1().ref("gcash-qr/c1/qr.png").put(png, { contentType: "image/png" }));
await ok("admin sets GCash QR", () => sad().ref("gcash-qr/c1/qr.png").put(png, { contentType: "image/png" }));
await ok("public reads GCash QR", () => env.unauthenticatedContext().storage().ref("gcash-qr/c1/qr.png").getMetadata());
await ok("admin uploads then deletes template", async () => { await sad().ref("permit-templates/c1/t.pdf").put(png, { contentType: "application/pdf" }); await sad().ref("permit-templates/c1/t.pdf").delete(); });

console.log(`\n${pass} passed, ${fail} failed`);
await env.cleanup();
process.exit(fail ? 1 : 0);
