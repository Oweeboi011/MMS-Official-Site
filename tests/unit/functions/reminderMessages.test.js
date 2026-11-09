import { isThankYouDue, nextMeetingText, officerSummary, paymentReminder, upcomingReminder } from "../../../src/backend/functions/src/scheduled/reminderMessages.js";

const NOW = Date.UTC(2026, 10, 10, 1);
const ts = (ms) => ({ toDate: () => new Date(ms) });
const DAY = 86400000;

describe("daily reminder messages", () => {
  it("nudges unpaid registrants and stays quiet once paid", () => {
    const reg = { id: "r1", userId: "u1", climbTitle: "Tarak Ridge", paymentStatus: "unpaid", payments: [] };
    expect(paymentReminder(reg, {})).toMatchObject({
      id: "payment_r1", type: "payment_reminder", title: "Payment still pending",
      message: "Don't forget to submit your GCash payment proof for Tarak Ridge.",
    });
    expect(paymentReminder({ ...reg, paymentStatus: "verified" }, {})).toBeNull();
  });

  it("reminds confirmed joiners 7/5/3/1 days out, with the next meeting and unpaid note", () => {
    const climb = { title: "Pulag", dateLabel: "Dec 5-7", startDate: ts(NOW + 3 * DAY - 1000) };
    const priv = { preClimbMeetings: [{ date: "2026-11-01" }, { date: "2026-11-12", time: "7 PM", location: "Online" }] };
    const reg = { id: "r1", userId: "u1", climbId: "c1", status: "confirmed", paymentStatus: "unpaid" };
    const n = upcomingReminder(reg, climb, priv, NOW);
    expect(n).toMatchObject({ id: "upcoming3_r1", title: "Your climb is in 3 days", link: "/event/c1" });
    expect(n.message).toContain("Pre-climb meeting: November 12 at 7 PM — Online.");
    expect(n.message).toContain("You haven't submitted payment yet");
    expect(upcomingReminder({ ...reg, status: "pending" }, climb, priv, NOW)).toBeNull();
    expect(upcomingReminder(reg, { ...climb, startDate: ts(NOW + 4 * DAY - 1000) }, priv, NOW)).toBeNull();
    expect(nextMeetingText({ preClimbMeetings: [{ date: "2026-11-01" }] }, NOW)).toBe("");
  });

  it("summarises outstanding items for officers", () => {
    const climb = { title: "Pulag", officers: ["o1"], startDate: ts(NOW + 10 * DAY), endDate: ts(NOW + 11 * DAY) };
    const regs = [{ paymentStatus: "unpaid" }, { paymentStatus: "rejected" }, { paymentStatus: "verified" }];
    expect(officerSummary(climb, regs, NOW)).toEqual({ unpaidCount: 2, missingDocsCount: 0, message: "Pulag: 2 unpaid/rejected registrants." });
    expect(officerSummary(climb, [{ paymentStatus: "verified" }], NOW)).toBeNull();
    expect(officerSummary({ ...climb, officers: [] }, regs, NOW)).toBeNull();
  });

  it("sends thank-yous once, a grace period after the climb ends", () => {
    const ended = { endDate: ts(NOW - 3 * DAY) };
    expect(isThankYouDue(ended, NOW)).toBe(true);
    expect(isThankYouDue({ ...ended, thankYouSentAt: ts(NOW) }, NOW)).toBe(false);
    expect(isThankYouDue({ endDate: ts(NOW - 1000) }, NOW)).toBe(false);
  });
});
