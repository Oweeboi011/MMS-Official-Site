// @vitest-environment node
import { beforeEach, vi } from "vitest";
// Ported from mms-open-climbs (jest → vitest). Emails on here: tests exercise the send path.
process.env.EMAILS_ENABLED = "true";
// jest config had resetMocks: reset before every test, ahead of the file's own beforeEach.
beforeEach(() => { vi.resetAllMocks(); });
const mockCreateNotification = vi.fn();
const mockSet = vi.fn();
vi.mock("../../../src/backend/functions/src/shared/registrationOps.js", () => ({
  createNotification: (...args) => mockCreateNotification(...args),
}));
vi.mock("../../../src/backend/functions/src/shared/admin.js", () => ({
  db: { collection: () => ({ doc: (id) => ({ set: (...args) => mockSet(id, ...args) }) }) },
}));

const { remindOutstandingPaperwork, clearPaperworkReminders } = await import("../../../src/backend/functions/src/shared/paperworkReminders.js");
const { REQUIRED_DOC_TYPES } = await import("../../../src/backend/functions/src/requiredDocTypes.js");

const medCert = REQUIRED_DOC_TYPES.find((d) => d.key === "medicalCert");

beforeEach(() => {
  mockCreateNotification.mockResolvedValue();
  mockSet.mockResolvedValue();
});


describe("remindOutstandingPaperwork", () => {
  it("reminds someone an officer added to sign their waiver", async () => {
    await remindOutstandingPaperwork({ userId: "u1", waiverSigned: false }, "r1", {}, "Kibungan");
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", type: "waiver_reminder", id: "waiver_r1", link: "/my-registrations" }),
    );
  });

  it("also reminds about each missing required document", async () => {
    await remindOutstandingPaperwork(
      { userId: "u1", waiverSigned: true },
      "r1",
      { [medCert.requiresField]: true },
      "Kibungan",
    );
    expect(mockCreateNotification).toHaveBeenCalledTimes(1);
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "document_reminder", id: `${medCert.notificationPrefix}_r1` }),
    );
  });

  it("says nothing when the paperwork is done or there's no account", async () => {
    await remindOutstandingPaperwork({ userId: "u1", waiverSigned: true }, "r1", {}, "Kibungan");
    await remindOutstandingPaperwork(
      { userId: "u1", waiverSigned: false, waiverReceivedOffline: { note: "paper waiver" } },
      "r3",
      {},
      "Kibungan",
    );
    await remindOutstandingPaperwork({ userId: null, waiverSigned: false }, "r2", {}, "Kibungan");
    expect(mockCreateNotification).not.toHaveBeenCalled();
  });
});

describe("clearPaperworkReminders", () => {
  it("marks the waiver and document reminders read once done", async () => {
    await clearPaperworkReminders(
      { waiverSigned: false },
      { waiverSigned: true, [medCert.uploadField]: { url: "https://x" } },
      "r1",
    );
    expect(mockSet).toHaveBeenCalledWith(`${medCert.notificationPrefix}_r1`, { read: true }, { merge: true });
    expect(mockSet).toHaveBeenCalledWith("waiver_r1", { read: true }, { merge: true });
  });

  it("clears the waiver reminder when an admin records it received offline", async () => {
    await clearPaperworkReminders({}, { waiverReceivedOffline: { note: "paper waiver" } }, "r1");
    expect(mockSet).toHaveBeenCalledWith("waiver_r1", { read: true }, { merge: true });
  });

  it("leaves reminders alone when nothing changed", async () => {
    await clearPaperworkReminders({ waiverSigned: false }, { waiverSigned: false }, "r1");
    expect(mockSet).not.toHaveBeenCalled();
  });
});
