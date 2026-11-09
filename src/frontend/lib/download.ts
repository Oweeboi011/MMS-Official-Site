// Saves text as a file in the browser (CSV exports). BOM so Excel reads UTF-8 names (ñ, accents).
export function downloadCsv(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/[^\w-]+/g, '_') || 'registrations'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
