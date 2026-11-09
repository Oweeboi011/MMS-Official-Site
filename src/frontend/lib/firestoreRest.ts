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

export interface Filter {
  field: string;
  op: 'EQUAL' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN';
  value: boolean | Date;
}

export interface QueryOptions {
  where?: Filter[];
  orderBy?: { field: string; desc?: boolean };
  limit: number;
}

const encode = (v: boolean | Date) => (v instanceof Date ? { timestampValue: v.toISOString() } : { booleanValue: v });
const fieldFilter = ({ field, op, value }: Filter) => ({ fieldFilter: { field: { fieldPath: field }, op, value: encode(value) } });

export function runQueryBody(collection: string, { where = [], orderBy, limit }: QueryOptions) {
  return {
    structuredQuery: {
      from: [{ collectionId: collection }],
      ...(where.length === 1 && { where: fieldFilter(where[0]) }),
      ...(where.length > 1 && { where: { compositeFilter: { op: 'AND', filters: where.map(fieldFilter) } } }),
      ...(orderBy && { orderBy: [{ field: { fieldPath: orderBy.field }, direction: orderBy.desc ? 'DESCENDING' : 'ASCENDING' }] }),
      limit,
    },
  };
}

// runQuery answers with one row per document, plus a bare row (no `document`) when nothing matches. `id` = doc id.
export function decodeQuery(rows: { document?: { name?: string; fields?: Record<string, Value> } }[]): Doc[] {
  return rows.flatMap(({ document: d }) => (d ? [{ ...(d.name && { id: d.name.split('/').pop() }), ...decodeFields(d.fields) }] : []));
}
