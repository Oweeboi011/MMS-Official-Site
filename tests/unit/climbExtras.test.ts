import { allTrailsEmbed, googleMapEmbed, komootEmbed, mapsCoords, normalizeEmbedInput } from '../../src/frontend/lib/trailEmbeds';
import { planForecast, weatherLabel } from '../../src/frontend/lib/weather';

describe('trail embeds', () => {
  it('only embeds https links on the expected host', () => {
    expect(komootEmbed('https://evil.example/tour/1')).toBeNull();
    // eslint-disable-next-line sonarjs/no-clear-text-protocols -- proves http is rejected
    expect(komootEmbed('http://www.komoot.com/tour/1')).toBeNull();
    expect(allTrailsEmbed('https://alltrails.com.evil.io/trail/x')).toBeNull();
    expect(googleMapEmbed('javascript:alert(1)', null)).toBeNull();
  });

  it('pulls the src out of a pasted iframe', () => {
    expect(normalizeEmbedInput('<iframe src="https://www.komoot.com/tour/9/embed?a=1&amp;b=2"></iframe>')).toBe('https://www.komoot.com/tour/9/embed?a=1&b=2');
    expect(komootEmbed('<iframe src="https://www.komoot.com/tour/9/embed"></iframe>')?.pageUrl).toBe('https://www.komoot.com/tour/9');
  });

  it('reads coordinates and places from Google Maps links', () => {
    expect(mapsCoords('https://www.google.com/maps/@16.58,120.89,13z')).toEqual({ lat: 16.58, lng: 120.89 });
    expect(mapsCoords('https://maps.google.com/?q=-1.5,2')).toEqual({ lat: -1.5, lng: 2 });
    expect(googleMapEmbed('https://www.google.com/maps/place/Mt+Pulag/@16.5,120.8,12z', null)?.embedSrc).toContain('q=Mt%20Pulag');
  });
});

describe('forecast window', () => {
  const now = new Date('2026-11-09T04:00:00Z');
  const day = (d: string) => new Date(`${d}T00:00:00+08:00`);

  it('waits until 16 days out, stops after the climb, caps at the forecast range', () => {
    expect(planForecast(undefined, undefined, now)).toHaveProperty('message');
    expect(planForecast(day('2026-12-01'), undefined, now)).toEqual({ message: 'The forecast appears here 16 days before the climb.' });
    expect(planForecast(day('2026-11-01'), day('2026-11-02'), now)).toEqual({ message: 'No forecast for past climb dates.' });
    expect(planForecast(day('2026-11-20'), day('2026-11-22'), now)).toEqual({ from: '2026-11-20', to: '2026-11-22', truncated: false });
    expect(planForecast(day('2026-11-23'), day('2026-11-26'), now)).toEqual({ from: '2026-11-23', to: '2026-11-24', truncated: true });
    expect(planForecast(day('2026-11-08'), day('2026-11-10'), now)).toEqual({ from: '2026-11-09', to: '2026-11-10', truncated: false });
  });

  it('labels weather codes', () => {
    expect(weatherLabel(95)).toBe('Thunderstorms');
    expect(weatherLabel(1234)).toBe('Weather update');
  });
});
