// Forecast window for a climb (ported from mms-open-climbs utils/weather). Days are Manila calendar days.
import { manilaDay } from './manila';

const LABELS: Record<number, string> = {
  0: 'Clear skies', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Rime fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  80: 'Rain showers', 81: 'Heavy rain showers', 82: 'Violent rain showers', 95: 'Thunderstorms', 96: 'Thunderstorms with hail', 99: 'Severe thunderstorms',
};
export const weatherLabel = (code: number | undefined) => (code !== undefined && LABELS[code]) || 'Weather update';

const DAYS_AHEAD = 15; // Open-Meteo forecasts today + 15
const dayNumber = (day: string) => Date.parse(`${day}T00:00:00Z`) / 86400_000;
const addDays = (day: string, n: number) => new Date((dayNumber(day) + n) * 86400_000).toISOString().slice(0, 10);

export type ForecastPlan = { from: string; to: string; truncated: boolean } | { message: string };

export function planForecast(start: Date | undefined, end: Date | undefined, now: Date): ForecastPlan {
  if (!start) return { message: 'The forecast appears once the climb dates are set.' };
  const today = manilaDay(now);
  const from = manilaDay(start);
  const last = manilaDay(end ?? start);
  if (last < today) return { message: 'No forecast for past climb dates.' };
  if (dayNumber(from) - dayNumber(today) > DAYS_AHEAD) return { message: 'The forecast appears here 16 days before the climb.' };
  const cutoff = addDays(today, DAYS_AHEAD);
  return { from: from < today ? today : from, to: last > cutoff ? cutoff : last, truncated: last > cutoff };
}
