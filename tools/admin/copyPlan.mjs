// Decide what a one-way copy does with each source doc: create it, overwrite it (only with --overwrite), or leave it.
export function planCopy(source, existingIds, overwrite) {
  const plan = { create: [], overwrite: [], skip: [] };
  for (const doc of source) {
    if (!existingIds.has(doc.id)) plan.create.push(doc);
    else if (overwrite) plan.overwrite.push(doc);
    else plan.skip.push(doc);
  }
  return plan;
}

export const describe = (doc) => {
  const date = doc.data.startDate?.toDate?.().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }) ?? 'no date';
  return `${doc.id}  ${date}  ${doc.data.title ?? '(untitled)'}`;
};

// The old app stored some start/end dates as "YYYY-MM-DD" text; this site and its functions read Timestamps.
// A bare date means that day in Manila (UTC+8). Other fields (paymentDueDate stays text) are untouched.
const DATE_FIELDS = ['startDate', 'endDate'];
export function normalizeDates(data, toTimestamp) {
  const out = { ...data };
  for (const field of DATE_FIELDS) {
    const value = out[field];
    if (typeof value !== 'string') continue;
    const when = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00+08:00` : value);
    if (Number.isNaN(when.getTime())) throw new Error(`Unreadable ${field}: ${value}`);
    out[field] = toTimestamp(when);
  }
  return out;
}
