// Open-Meteo: free, keyless, CORS-enabled; the browser calls it directly (CSP connect-src allows it).
import { useEffect, useState } from 'react';
import type { Coords } from '../lib/trailEmbeds';
import { planForecast, weatherLabel } from '../lib/weather';

export interface ForecastDay { date: string; label: string; max: number; min: number; rainChance: number }
export interface Forecast { status: 'loading' | 'ready' | 'note'; days: ForecastDay[]; message: string; coords: Coords | null }

const TIMEOUT_MS = 8000;

async function getJson(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

interface Place { latitude: number; longitude: number; country_code?: string; admin1?: string; admin2?: string }

// "Kibungan, Benguet": try each part, prefer results in the later parts' region, then the Philippines.
async function geocode(location: string): Promise<Coords | null> {
  const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
  for (const [i, part] of parts.entries()) {
    const { results = [] } = (await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(part)}&count=10&language=en&format=json`)) as { results?: Place[] };
    const score = (p: Place) => parts.slice(i + 1).filter((c) => `${p.admin1} ${p.admin2}`.toLowerCase().includes(c.toLowerCase())).length * 2 + (p.country_code === 'PH' ? 1 : 0);
    const best = results.reduce<Place | null>((a, b) => (!a || score(b) > score(a) ? b : a), null);
    if (best) return { lat: best.latitude, lng: best.longitude };
  }
  return null;
}

const dayLabel = new Intl.DateTimeFormat('en-PH', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

async function forecast(coords: Coords, from: string, to: string): Promise<ForecastDay[]> {
  const { daily } = (await getJson(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FManila&start_date=${from}&end_date=${to}`)) as { daily?: Record<string, number[]> & { time?: string[] } };
  return (daily?.time ?? []).map((date, i) => ({
    date,
    label: [dayLabel.format(new Date(date + 'T00:00:00Z')), weatherLabel(daily?.weather_code?.[i])].join(' · '),
    max: Math.round(daily?.temperature_2m_max?.[i] ?? 0),
    min: Math.round(daily?.temperature_2m_min?.[i] ?? 0),
    rainChance: daily?.precipitation_probability_max?.[i] ?? 0,
  }));
}

export function useForecast(start: Date | undefined, end: Date | undefined, coords: Coords | null, location: string): Forecast {
  const plan = planForecast(start, end, new Date());
  const key = 'message' in plan ? plan.message : `${plan.from}|${plan.to}|${coords?.lat},${coords?.lng}|${location}`;
  const [state, setState] = useState<Forecast & { key: string }>({ key: '', status: 'loading', days: [], message: '', coords });
  useEffect(() => {
    if ('message' in plan) return undefined;
    let live = true;
    void (async () => {
      try {
        const where = coords ?? (location ? await geocode(location) : null);
        if (!where) throw new Error('no place');
        const days = await forecast(where, plan.from, plan.to);
        if (live) setState({ key, status: 'ready', days, coords: where, message: plan.truncated ? 'Later climb days appear as they come into range.' : '' });
      } catch {
        if (live) setState({ key, status: 'note', days: [], coords, message: 'The forecast couldn’t load right now.' });
      }
    })();
    return () => { live = false; };
    // key captures plan, coords and location
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  if ('message' in plan) return { status: 'note', days: [], message: plan.message, coords };
  return state.key === key ? state : { status: 'loading', days: [], message: 'Loading the forecast…', coords };
}
