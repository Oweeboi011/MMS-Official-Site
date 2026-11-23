// Quotes a CSV cell and defuses spreadsheet formulas (a leading = + - @ would run in Excel).
const csvCell = (v: unknown): string => {
  const text = String(v ?? '');
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

export const csvRows = (rows: unknown[][]): string => rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
