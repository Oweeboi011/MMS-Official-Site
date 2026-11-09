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
  const date = doc.data.startDate?.toDate?.().toISOString().slice(0, 10) ?? 'no date';
  return `${doc.id}  ${date}  ${doc.data.title ?? '(untitled)'}`;
};
