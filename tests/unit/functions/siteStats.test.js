// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("firebase-functions/v2/scheduler", () => ({ onSchedule: (_opts, fn) => fn }));
vi.mock("../../../src/backend/functions/src/shared/admin.js", () => ({ db: {} }));
const { computeSiteStats } = await import("../../../src/backend/functions/src/scheduled/siteStats.js");

const day = 86400000;
const now = Date.UTC(2026, 10, 9);
const at = (ms) => ({ toDate: () => new Date(ms) });
const count = (n) => ({ get: () => Promise.resolve({ data: () => ({ count: n }) }) });

function fakeDb(climbs, users = 42, confirmed = 7) {
  return {
    collection: (name) => {
      if (name === "users") return { count: () => count(users) };
      if (name === "registrations") return { where: () => ({ count: () => count(confirmed) }) };
      return { get: () => Promise.resolve({ docs: climbs.map((c) => ({ data: () => c })) }) };
    },
  };
}

describe("computeSiteStats", () => {
  it("counts members, confirmed participants, climbs and completed climbs", async () => {
    const climbs = [
      { status: "completed" },
      { status: "open", startDate: at(now - 3 * day) },
      { status: "open", startDate: at(now + 5 * day) },
      { status: "cancelled", startDate: at(now - 9 * day) },
    ];
    expect(await computeSiteStats(fakeDb(climbs), now)).toEqual({
      members: 42,
      participants: 7,
      climbs: 3,
      climbsCompleted: 2,
    });
  });

  it("handles an empty database", async () => {
    expect(await computeSiteStats(fakeDb([], 0, 0), now)).toEqual({ members: 0, participants: 0, climbs: 0, climbsCompleted: 0 });
  });
});
