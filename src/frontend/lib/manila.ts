// Manila calendar (UTC+8, no DST): climb days, years and "is it over" are judged on Manila dates.
const OFFSET_MS = 8 * 3600_000;

export const manilaDay = (d: Date): string => new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);
export const manilaYear = (d: Date): number => Number(manilaDay(d).slice(0, 4));
export const manilaYearStart = (year: number): Date => new Date(Date.UTC(year, 0, 1) - OFFSET_MS);
// 'YYYY-MM-DD' (old admin date picker) = that Manila day.
export const fromManilaDay = (day: string): Date => new Date(`${day}T00:00:00+08:00`);
