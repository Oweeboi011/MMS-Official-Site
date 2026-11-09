// Firestore REST JSON ↔ plain values. Public pages read over REST so the SDK stays out of the first-load bundle.
type Value = Record<string, unknown>;
export type Doc = Record<string, unknown>;

const scalars: Record<string, (raw: unknown) => unknown> = {
  stringValue: String,
  booleanValue: Boolean,
  integerValue: Number,
  doubleValue: Number,
  timestampValue: (raw) => new Date(String(raw)),
};

function decodeValue(v: Value): unknown {
  const [kind, raw] = Object.entries(v)[0] ?? [];
  if (kind === 'mapValue') return decodeFields((raw as { fields?: Record<string, Value> }).fields);
  if (kind === 'arrayValue') return ((raw as { values?: Value[] }).values ?? []).map(decodeValue);
  return kind && scalars[kind] ? scalars[kind](raw) : null;
}

export function decodeFields(fields: Record<string, Value> = {}): Doc {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decodeValue(v)]));
}

export interface QueryOptions {
  where?: { field: string; equals: boolean };
  orderByDesc?: string;
  limit: number;
}

export function runQueryBody(collection: string, { where, orderByDesc, limit }: QueryOptions) {
  return {
    structuredQuery: {
      from: [{ collectionId: collection }],
      ...(where && { where: { fieldFilter: { field: { fieldPath: where.field }, op: 'EQUAL', value: { booleanValue: where.equals } } } }),
      ...(orderByDesc && { orderBy: [{ field: { fieldPath: orderByDesc }, direction: 'DESCENDING' }] }),
      limit,
    },
  };
}

// runQuery answers with one row per document, plus a bare row (no `document`) when nothing matches.
export function decodeQuery(rows: { document?: { fields?: Record<string, Value> } }[]): Doc[] {
  return rows.filter((r) => r.document).map((r) => decodeFields(r.document?.fields));
}
