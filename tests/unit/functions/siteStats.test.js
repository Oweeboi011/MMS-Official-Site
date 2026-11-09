// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("firebase-functions/v2/scheduler", () => ({ onSchedule: (_opts, fn) => fn }));
vi.mock("../../../src/backend/functions/src/shared/admin.js", () => ({ db: {} }));
const { computeSiteStats } = await import("../../../src/backend/functions/src/scheduled/siteStats.js");

const day = 86400000;
const now = Date.UTC(2026, 10, 9);
const at = (ms) => ({ toDate: () => new Date(ms) });
const docs = (rows) => rows.map(([id, data]) => ({ id, data: () => data }));

function fakeDb({ climbs = [], regs = [], users = 0 }) {
  const where = vi.fn((field, op, value) => ({
    get: () => Promise.resolve({ docs: docs(regs.filter((r) => op === "==" && r[1][field] === value)) }),
  }));
  const db = {
    where,
    collection: (name) => {
      if (name === "users") return { count: () => ({ get: () => Promise.resolve({ data: () => ({ count: users }) }) }) };
      if (name === "registrations") return { where };
      return { get: () => Promise.resolve({ docs: docs(climbs) }) };
    },
  };
  return db;
}

describe("computeSiteStats", () => {
  const climbs = [
    ["done", { status: "completed" }],
    ["past", { status: "open", startDate: at(now - 3 * day) }],
    ["future", { status: "open", startDate: at(now + 5 * day) }],
    ["cancelled", { status: "cancelled", startDate: at(now - 9 * day) }],
  ];
  const regs = [
    ["r1", { userId: "ana", climbId: "done", status: "confirmed" }],
    ["r2", { userId: "ana", climbId: "past", status: "confirmed" }],
    ["r3", { userId: "ben", climbId: "past", status: "confirmed", noShow: true }],
    ["r4", { userId: "cy", climbId: "future", status: "confirmed" }],
    ["r5", { userId: "dee", climbId: "cancelled", status: "confirmed" }],
    ["r6", { userId: "eve", climbId: "done", status: "pending" }],
  ];

  it("counts distinct climbers on finished, non-cancelled climbs only", async () => {
    const db = fakeDb({ climbs, regs, users: 42 });
    expect(await computeSiteStats(db, now)).toEqual({ accounts: 42, climbers: 1, climbs: 3, climbsCompleted: 2 });
    expect(db.where).toHaveBeenCalledWith("status", "==", "confirmed");
  });

  it("handles an empty database", async () => {
    expect(await computeSiteStats(fakeDb({}), now)).toEqual({ accounts: 0, climbers: 0, climbs: 0, climbsCompleted: 0 });
  });
});
