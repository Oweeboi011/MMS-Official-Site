import type { ClimbDetail } from '../data/climbs';
import { mapsCoords } from '../lib/trailEmbeds';
import { useForecast } from '../services/weather';

// #159: daily forecast (Open-Meteo) within 16 days of the climb, plus PAGASA / Windy for the full picture.
export default function ClimbWeather({ climb }: { climb: ClimbDetail }) {
  const known = climb.coords ?? climb.trailMaps.map((t) => mapsCoords(t.googleMapsUrl)).find(Boolean) ?? null;
  const { days, message, coords } = useForecast(climb.start, climb.end, known, climb.location);
  const windy = coords ? `https://www.windy.com/?${coords.lat},${coords.lng},10` : 'https://www.windy.com/';
  return (
    <section className="climb-block" aria-labelledby="climb-weather">
      <h2 id="climb-weather">Weather</h2>
      {days.length > 0 && (
        <ul className="forecast">
          {days.map((d) => (
            <li key={d.date}><strong>{d.label}</strong><span>{d.max}° / {d.min}°C · {d.rainChance}% rain</span></li>
          ))}
        </ul>
      )}
      {message && <p className="climb-muted">{message}</p>}
      <p className="climb-links">
        <a href="https://www.pagasa.dost.gov.ph/weather" target="_blank" rel="noopener noreferrer">PAGASA forecast</a>
        <a href={windy} target="_blank" rel="noopener noreferrer">Windy</a>
      </p>
    </section>
  );
}
