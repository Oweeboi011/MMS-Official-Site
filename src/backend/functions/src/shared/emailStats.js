// Brevo aggregated email stats: request window and result shape, free of the network so they can be tested.
const COUNTERS = ["requests", "delivered", "hardBounces", "softBounces", "blocked", "opens", "uniqueOpens", "clicks", "spamReports"];

// Client-supplied: a whole number of days, 1–90 (Brevo stats range), 30 when missing or not a number.
export function clampDays(value) {
  return Math.min(90, Math.max(1, Math.trunc(Number(value ?? 30)) || 30));
}

const isoDay = (d) => d.toISOString().slice(0, 10);

export function statsUrl(days, now = new Date()) {
  const start = new Date(now.getTime() - days * 86400000);
  return `https://api.brevo.com/v3/smtp/statistics/aggregatedReport?startDate=${isoDay(start)}&endDate=${isoDay(now)}`;
}

export function summarizeStats(data, days) {
  const summary = Object.fromEntries(COUNTERS.map((key) => [key, data[key] || 0]));
  return { ...summary, rangeDays: days };
}
