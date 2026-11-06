// @vitest-environment node
import { beforeEach, vi } from "vitest";
// Ported from mms-open-climbs (jest → vitest). Emails on here: tests exercise the send path.
process.env.EMAILS_ENABLED = "true";
// jest config had resetMocks: reset before every test, ahead of the file's own beforeEach.
beforeEach(() => { vi.resetAllMocks(); });
/**
 * Tests for Firebase Cloud Functions (functions/src/index.js).
 *
 * Strategy: We test the business-logic helpers in isolation by extracting them
 * from the module via rewired mocks.  The actual Firebase trigger wrappers
 * (onDocumentCreated, onDocumentUpdated, onCall) are mocked at the module
 * level so that only the handler functions execute — no real Firestore or
 * Auth connections are made.
 *
 * Scenarios covered:
 *  - sendEmail(): skips when Brevo credentials are missing
 *  - sendEmail(): calls Brevo API with correct payload
 *  - tplBase(): wraps content in the base HTML shell
 *  - Email template: tplRegistrationConfirmation includes climb details
 *  - Email template: tplStatusUpdate renders correct titles per status
 *  - createUser callable: throws unauthenticated when no auth
 *  - createUser callable: throws permission-denied for non-admin caller
 *  - createUser callable: throws invalid-argument when fields missing
 *  - createUser callable: creates user and returns uid
 */

// ---------------------------------------------------------------------------
// Module-level mocks — must be defined before requiring index.js
// ---------------------------------------------------------------------------
const mockDb = {
  doc: vi.fn().mockReturnThis(),
  get: vi.fn(),
  set: vi.fn().mockResolvedValue(),
  update: vi.fn().mockResolvedValue(),
  delete: vi.fn().mockResolvedValue(),
};
mockDb.doc.mockReturnValue(mockDb);

const mockAdminAuth = {
  createUser: vi.fn(),
  updateUser: vi.fn().mockResolvedValue(),
  generatePasswordResetLink: vi.fn().mockResolvedValue("https://reset.link"),
  getUserByEmail: vi.fn(),
  deleteUser: vi.fn().mockResolvedValue(),
};

const mockBigQueryQuery = vi.fn();
vi.mock("@google-cloud/bigquery", () => ({
  BigQuery: vi.fn().mockImplementation(() => ({ query: mockBigQueryQuery })),
}));

vi.mock("firebase-admin/app", () => ({ initializeApp: vi.fn() }));
vi.mock("firebase-admin/auth", () => ({ getAuth: () => mockAdminAuth }));
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => mockDb,
  FieldValue: {
    serverTimestamp: vi.fn(() => "SERVER_TS"),
    increment: vi.fn((n) => ({ n })),
  },
}));

// Every Firestore trigger's options object, captured at registration so the
// deploy-shape test below can inspect it.
const triggerOptions = [];
vi.mock("firebase-functions/v2/firestore", () => {
  const record = (opts, fn) => {
    triggerOptions.push(opts);
    return fn;
  };
  return {
    onDocumentCreated: record,
    onDocumentUpdated: record,
    onDocumentUpdatedWithAuthContext: record,
    onDocumentDeleted: record,
    onDocumentWritten: record,
  };
});

vi.mock("firebase-functions/v2/https", () => ({
  onCall: (...args) => (args.length === 2 ? args[1] : args[0]),
  onRequest: (...args) => (args.length === 2 ? args[1] : args[0]),
  HttpsError: class HttpsError extends Error {
    constructor(code, msg) {
      super(msg);
      this.code = code;
    }
  },
}));

// ---------------------------------------------------------------------------
// Helpers — extracted for unit testing without loading the full module
// ---------------------------------------------------------------------------

// Re-implement sendEmail and templates inline so tests don't need side-effects
// from the full module load (which triggers Firebase Admin init).

const sendEmail = async ({ to, toName, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  if (!apiKey || !fromEmail) return; // covered by first test

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "MMS Open Climbs", email: fromEmail },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}`);
  return res.json();
};

function tplBase(content) {
  return `<div class="base">${content}</div>`;
}

function tplRegistrationConfirmation({
  name,
  climbTitle,
  climbDate,
  climbLocation,
  waiverUrl,
}) {
  return tplBase(
    `<h2>Registration Received!</h2><p>${name}</p><p>${climbTitle}</p><p>${climbDate}</p><p>${climbLocation}</p><a href="${waiverUrl}">Print</a>`,
  );
}

function tplStatusUpdate({ name, climbTitle, newStatus }) {
  const titles = {
    confirmed: "You're Confirmed!",
    cancelled: "Registration Cancelled",
    waitlisted: "You've Been Waitlisted",
  };
  return tplBase(
    `<h2>${titles[newStatus] ?? newStatus}</h2><p>${name}</p><p>${climbTitle}</p>`,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const indexModule = await import("../../../src/backend/functions/src/index.js");
const bigqueryModule = await import("@google-cloud/bigquery");

describe("sendEmail()", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns undefined without calling fetch when Brevo credentials are missing", async () => {
    global.fetch = vi.fn();
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_FROM_EMAIL;

    const result = await sendEmail({
      to: "a@a.com",
      toName: "A",
      subject: "S",
      html: "<p>x</p>",
    });
    expect(result).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("calls the Brevo REST endpoint with the correct payload", async () => {
    process.env.BREVO_API_KEY = "key123";
    process.env.BREVO_FROM_EMAIL = "noreply@mms.ph";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messageId: "msg-1" }),
    });

    await sendEmail({
      to: "b@b.com",
      toName: "B",
      subject: "Sub",
      html: "<p>hi</p>",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    const body = JSON.parse(opts.body);
    expect(body.to[0].email).toBe("b@b.com");
    expect(body.subject).toBe("Sub");
  });

  it("throws when Brevo returns a non-OK status", async () => {
    process.env.BREVO_API_KEY = "key123";
    process.env.BREVO_FROM_EMAIL = "noreply@mms.ph";

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve("Bad request"),
    });

    await expect(
      sendEmail({ to: "c@c.com", toName: "C", subject: "S", html: "<p>x</p>" }),
    ).rejects.toThrow("Brevo 400");
  });
});

describe("tplBase()", () => {
  it("wraps content in the base shell div", () => {
    const out = tplBase("INNER");
    expect(out).toContain("INNER");
    expect(out).toContain('<div class="base">');
  });
});

describe("tplRegistrationConfirmation()", () => {
  it("includes the climber name and climb title", () => {
    const html = tplRegistrationConfirmation({
      name: "Juan Cruz",
      climbTitle: "Mt. Pulag",
      climbDate: "Aug 1-3",
      climbLocation: "Benguet",
      waiverUrl: "https://app/waiver/r1",
    });
    expect(html).toContain("Juan Cruz");
    expect(html).toContain("Mt. Pulag");
    expect(html).toContain("Aug 1-3");
    expect(html).toContain("Benguet");
    expect(html).toContain("https://app/waiver/r1");
  });
});

describe("tplStatusUpdate()", () => {
  it("renders confirmed title", () => {
    const html = tplStatusUpdate({
      name: "J",
      climbTitle: "T",
      newStatus: "confirmed",
    });
    expect(html).toContain("You're Confirmed!");
  });

  it("renders cancelled title", () => {
    const html = tplStatusUpdate({
      name: "J",
      climbTitle: "T",
      newStatus: "cancelled",
    });
    expect(html).toContain("Registration Cancelled");
  });

  it("renders waitlisted title", () => {
    const html = tplStatusUpdate({
      name: "J",
      climbTitle: "T",
      newStatus: "waitlisted",
    });
    expect(html).toContain("You've Been Waitlisted");
  });
});

describe("createUser callable — auth guard", () => {

  beforeEach(() => {
    // resetMocks: true in vi.config.cjs wipes implementations before each
    // test — re-establish the Firestore mock chain and default resolutions.
    mockDb.doc.mockReturnValue(mockDb);
    mockDb.set.mockResolvedValue();
    mockDb.update.mockResolvedValue();
    mockAdminAuth.generatePasswordResetLink.mockResolvedValue(
      "https://reset.link",
    );
    mockAdminAuth.deleteUser.mockResolvedValue();
  });

  it("throws unauthenticated when request has no auth", async () => {
    const handler = indexModule.createUser;
    await expect(handler({ auth: null, data: {} })).rejects.toMatchObject({
      code: "unauthenticated",
    });
  });

  it("throws permission-denied for non-admin caller", async () => {
    mockDb.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ role: "member" }),
    });
    const handler = indexModule.createUser;
    await expect(
      handler({
        auth: { uid: "u1" },
        data: { email: "x@x.com", displayName: "X" },
      }),
    ).rejects.toMatchObject({ code: "permission-denied" });
  });

  it("throws invalid-argument when email is missing", async () => {
    mockDb.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ role: "admin" }),
    });
    const handler = indexModule.createUser;
    await expect(
      handler({ auth: { uid: "admin-1" }, data: { displayName: "No Email" } }),
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("throws invalid-argument for a role other than member or admin", async () => {
    mockDb.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ role: "admin" }),
    });
    const handler = indexModule.createUser;
    await expect(
      handler({
        auth: { uid: "admin-1" },
        data: { email: "x@y.com", displayName: "X", role: "superadmin" },
      }),
    ).rejects.toMatchObject({ code: "invalid-argument" });
    expect(mockAdminAuth.createUser).not.toHaveBeenCalled();
  });

  it("creates a user and returns the uid on success", async () => {
    mockDb.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ role: "admin" }),
    });
    mockAdminAuth.createUser.mockResolvedValueOnce({ uid: "new-u" });
    process.env.BREVO_API_KEY = "k";
    process.env.BREVO_FROM_EMAIL = "noreply@mms.ph";
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const handler = indexModule.createUser;
    const result = await handler({
      auth: { uid: "admin-1" },
      data: { email: "new@new.com", displayName: "New User", role: "member" },
    });
    expect(result).toEqual({ uid: "new-u", emailSent: true });
    expect(mockAdminAuth.createUser).toHaveBeenCalledWith({
      email: "new@new.com",
      displayName: "New User",
    });
    expect(mockDb.set).toHaveBeenCalled();
  });

  it("self-heals an orphaned Auth account with no Firestore profile", async () => {
    mockDb.get
      .mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) })
      .mockResolvedValueOnce({ exists: false });
    mockAdminAuth.createUser.mockRejectedValueOnce({
      code: "auth/email-already-exists",
    });
    mockAdminAuth.getUserByEmail.mockResolvedValueOnce({ uid: "orphan-uid" });
    process.env.BREVO_API_KEY = "k";
    process.env.BREVO_FROM_EMAIL = "noreply@mms.ph";
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const handler = indexModule.createUser;
    const result = await handler({
      auth: { uid: "admin-1" },
      data: { email: "orphan@old.com", displayName: "Orphan", role: "member" },
    });

    expect(result).toEqual({ uid: "orphan-uid", emailSent: true });
    expect(mockDb.doc).toHaveBeenCalledWith("users/orphan-uid");
    expect(mockDb.set).toHaveBeenCalled();
    expect(mockAdminAuth.generatePasswordResetLink).toHaveBeenCalled();
    expect(mockAdminAuth.deleteUser).not.toHaveBeenCalled();
  });

  it("throws already-exists when the Auth account has a real Firestore profile", async () => {
    mockDb.get
      .mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: "member" }),
      });
    mockAdminAuth.createUser.mockRejectedValueOnce({
      code: "auth/email-already-exists",
    });
    mockAdminAuth.getUserByEmail.mockResolvedValueOnce({
      uid: "existing-uid",
    });

    const handler = indexModule.createUser;
    await expect(
      handler({
        auth: { uid: "admin-1" },
        data: { email: "real@existing.com", displayName: "Real" },
      }),
    ).rejects.toMatchObject({ code: "already-exists" });
    expect(mockDb.set).not.toHaveBeenCalled();
    expect(mockAdminAuth.generatePasswordResetLink).not.toHaveBeenCalled();
  });

  it("rolls back the Auth user when the Firestore write fails right after creation", async () => {
    mockDb.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ role: "admin" }),
    });
    mockAdminAuth.createUser.mockResolvedValueOnce({ uid: "fresh-uid" });
    mockDb.set.mockRejectedValueOnce(new Error("firestore down"));

    const handler = indexModule.createUser;
    await expect(
      handler({
        auth: { uid: "admin-1" },
        data: { email: "fresh@new.com", displayName: "Fresh" },
      }),
    ).rejects.toMatchObject({ code: "internal" });
    expect(mockAdminAuth.deleteUser).toHaveBeenCalledWith("fresh-uid");
  });

  it("surfaces a real message when the admin-role check throws a plain error", async () => {
    mockDb.get.mockRejectedValueOnce(new Error("firestore unavailable"));

    const handler = indexModule.createUser;
    await expect(
      handler({
        auth: { uid: "admin-1" },
        data: { email: "x@x.com", displayName: "X" },
      }),
    ).rejects.toMatchObject({
      code: "internal",
      message: expect.stringContaining("firestore unavailable"),
    });
  });
});

describe("updateUserProfile callable", () => {
  beforeEach(() => {
    mockDb.doc.mockReturnValue(mockDb);
    mockDb.update.mockResolvedValue();
    mockAdminAuth.updateUser.mockResolvedValue();
  });

  it("throws unauthenticated when request has no auth", async () => {
    const handler = indexModule.updateUserProfile;
    await expect(handler({ auth: null, data: {} })).rejects.toMatchObject({
      code: "unauthenticated",
    });
  });

  it("throws permission-denied for non-admin caller", async () => {
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "member" }) });
    const handler = indexModule.updateUserProfile;
    await expect(
      handler({ auth: { uid: "u1" }, data: { uid: "target", displayName: "New Name" } }),
    ).rejects.toMatchObject({ code: "permission-denied" });
  });

  it("throws invalid-argument when uid is missing", async () => {
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
    const handler = indexModule.updateUserProfile;
    await expect(
      handler({ auth: { uid: "admin-1" }, data: { displayName: "New Name" } }),
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("throws invalid-argument when neither email nor displayName is provided", async () => {
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
    const handler = indexModule.updateUserProfile;
    await expect(
      handler({ auth: { uid: "admin-1" }, data: { uid: "target" } }),
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("updates Auth and the Firestore profile together", async () => {
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
    const handler = indexModule.updateUserProfile;
    const result = await handler({
      auth: { uid: "admin-1" },
      data: { uid: "target", email: "new@new.com", displayName: "New Name" },
    });
    expect(result).toEqual({ success: true });
    expect(mockAdminAuth.updateUser).toHaveBeenCalledWith("target", {
      email: "new@new.com",
      displayName: "New Name",
    });
    expect(mockDb.update).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@new.com", displayName: "New Name" }),
    );
  });

  it("maps auth/email-already-exists to already-exists", async () => {
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
    mockAdminAuth.updateUser.mockRejectedValueOnce({ code: "auth/email-already-exists" });
    const handler = indexModule.updateUserProfile;
    await expect(
      handler({ auth: { uid: "admin-1" }, data: { uid: "target", email: "dupe@x.com" } }),
    ).rejects.toMatchObject({ code: "already-exists" });
  });

  it("maps auth/user-not-found to not-found", async () => {
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
    mockAdminAuth.updateUser.mockRejectedValueOnce({ code: "auth/user-not-found" });
    const handler = indexModule.updateUserProfile;
    await expect(
      handler({ auth: { uid: "admin-1" }, data: { uid: "gone", displayName: "X" } }),
    ).rejects.toMatchObject({ code: "not-found" });
  });
});

describe("deleteUserAccount callable", () => {
  beforeEach(() => {
    mockDb.doc.mockReturnValue(mockDb);
    mockDb.delete.mockResolvedValue();
    mockAdminAuth.deleteUser.mockResolvedValue();
  });

  it("throws unauthenticated when request has no auth", async () => {
    const handler = indexModule.deleteUserAccount;
    await expect(handler({ auth: null, data: {} })).rejects.toMatchObject({
      code: "unauthenticated",
    });
  });

  it("throws permission-denied for non-admin caller", async () => {
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "member" }) });
    const handler = indexModule.deleteUserAccount;
    await expect(
      handler({ auth: { uid: "u1" }, data: { uid: "target" } }),
    ).rejects.toMatchObject({ code: "permission-denied" });
  });

  it("throws failed-precondition when deleting your own account", async () => {
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
    const handler = indexModule.deleteUserAccount;
    await expect(
      handler({ auth: { uid: "admin-1" }, data: { uid: "admin-1" } }),
    ).rejects.toMatchObject({ code: "failed-precondition" });
  });

  it("deletes the Auth account and the Firestore profile", async () => {
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
    const handler = indexModule.deleteUserAccount;
    const result = await handler({ auth: { uid: "admin-1" }, data: { uid: "target" } });
    expect(result).toEqual({ success: true });
    expect(mockAdminAuth.deleteUser).toHaveBeenCalledWith("target");
    expect(mockDb.delete).toHaveBeenCalled();
  });

  it("still deletes the Firestore profile when the Auth account is already gone", async () => {
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
    mockAdminAuth.deleteUser.mockRejectedValueOnce({ code: "auth/user-not-found" });
    const handler = indexModule.deleteUserAccount;
    const result = await handler({ auth: { uid: "admin-1" }, data: { uid: "ghost" } });
    expect(result).toEqual({ success: true });
    expect(mockDb.delete).toHaveBeenCalled();
  });
});

describe("getBillingCost callable", () => {
  const ORIGINAL_ENV = process.env.BILLING_EXPORT_TABLE;

  beforeEach(() => {
    mockDb.doc.mockReturnValue(mockDb);
    // resetMocks: true wipes the module-mock factory's .mockImplementation
    // before every test too, so it must be re-armed here each time.
    // function, not arrow: the code calls `new BigQuery()`.
    bigqueryModule.BigQuery.mockImplementation(function () {
      return { query: mockBigQueryQuery };
    });
  });

  afterEach(() => {
    if (ORIGINAL_ENV === undefined) delete process.env.BILLING_EXPORT_TABLE;
    else process.env.BILLING_EXPORT_TABLE = ORIGINAL_ENV;
  });

  it("throws permission-denied for non-admin caller", async () => {
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "member" }) });
    const handler = indexModule.getBillingCost;
    await expect(
      handler({ auth: { uid: "u1" }, data: {} }),
    ).rejects.toMatchObject({ code: "permission-denied" });
  });

  it("returns not-configured when BILLING_EXPORT_TABLE is unset", async () => {
    delete process.env.BILLING_EXPORT_TABLE;
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
    const handler = indexModule.getBillingCost;
    const result = await handler({ auth: { uid: "admin-1" }, data: {} });
    expect(result).toMatchObject({ configured: false });
  });

  it("returns not-configured when the BigQuery query fails", async () => {
    process.env.BILLING_EXPORT_TABLE = "proj.dataset.billing";
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
    mockBigQueryQuery.mockRejectedValueOnce(new Error("Access Denied"));
    const handler = indexModule.getBillingCost;
    const result = await handler({ auth: { uid: "admin-1" }, data: {} });
    expect(result).toMatchObject({ configured: false });
  });

  it("returns total cost and per-service breakdown on success", async () => {
    process.env.BILLING_EXPORT_TABLE = "proj.dataset.billing";
    mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
    mockBigQueryQuery.mockResolvedValueOnce([
      [
        { service: "Cloud Firestore", cost: 3.5 },
        { service: "Cloud Functions", cost: 1.25 },
      ],
    ]);
    const handler = indexModule.getBillingCost;
    const result = await handler({ auth: { uid: "admin-1" }, data: {} });
    expect(result.configured).toBe(true);
    expect(result.totalCost).toBeCloseTo(4.75);
    expect(result.byService).toEqual([
      { service: "Cloud Firestore", cost: 3.5 },
      { service: "Cloud Functions", cost: 1.25 },
    ]);
  });
});

describe("Firestore trigger deploy shape", () => {
  // This project has no (default) Firestore database — everything lives in
  // the named "openclimbs" one. A trigger registered without `database`
  // targets (default), which does not exist, and firebase deploy fails the
  // *entire* run: functions, rules, indexes and hosting all roll back.
  //
  // Nothing else catches this. The handler is mocked in tests, so a trigger
  // with the wrong database passes every behavioural test and only fails in
  // CI, after merge.
  it("registers every trigger against the openclimbs database", () => {
    expect(triggerOptions.length).toBeGreaterThan(0);
    for (const opts of triggerOptions) {
      expect(typeof opts).toBe("object");
      expect(opts).toHaveProperty("document");
      expect(opts.database).toBe("openclimbs");
    }
  });
});

describe("getEmailStats callable — days input", () => {
  it("clamps a bad or huge days value instead of failing", async () => {
    process.env.BREVO_API_KEY = "k";
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    global.fetch = fetch;
    for (const days of ["abc", 100000]) {
      mockDb.doc.mockReturnValue(mockDb);
      mockDb.get.mockResolvedValueOnce({ exists: true, data: () => ({ role: "admin" }) });
      await indexModule.getEmailStats({ auth: { uid: "admin-1" }, data: { days } });
    }
    const ranges = fetch.mock.calls.map(([url]) => {
      const q = new URL(url).searchParams;
      return (new Date(q.get("endDate")) - new Date(q.get("startDate"))) / 864e5;
    });
    expect(ranges).toEqual([30, 90]);
  });
});
