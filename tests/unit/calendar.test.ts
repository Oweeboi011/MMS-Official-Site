import { calendarFileName, climbCalendar } from '../../src/frontend/data/calendar';

const stamp = new Date('2026-11-10T01:02:03.456Z');
const climb = { id: 'abc', title: 'Mt. Pulag, Benguet; day 1', location: 'Benguet', dates: 'Nov 20-22', start: new Date('2026-11-20T00:00:00+08:00'), end: new Date('2026-11-22T00:00:00+08:00') };

describe('add to calendar', () => {
  it('writes one all-day event; the end date is the day after the last day', () => {
    const ics = climbCalendar(climb, 'https://www.metropolitanms.org', stamp) ?? '';
    expect(ics).toContain('DTSTART;VALUE=DATE:20261120');
    expect(ics).toContain('DTEND;VALUE=DATE:20261123');
    expect(ics).toContain('DTSTAMP:20261110T010203Z');
    expect(ics).toContain('UID:abc@metropolitanms.org');
    expect(ics).toContain(String.raw`SUMMARY:Mt. Pulag\, Benguet\; day 1`);
    expect(ics).toContain('URL:https://www.metropolitanms.org/climbs/abc');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('is a one-day event without an end date, and absent without a start', () => {
    expect(climbCalendar({ ...climb, end: undefined }, 'https://x.test', stamp)).toContain('DTEND;VALUE=DATE:20261121');
    expect(climbCalendar({ ...climb, start: undefined }, 'https://x.test', stamp)).toBeNull();
  });

  it('folds lines over 75 bytes and names the file after the climb', () => {
    const ics = climbCalendar({ ...climb, title: 'x'.repeat(120) }, 'https://x.test', stamp) ?? '';
    expect(ics.split('\r\n').every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true);
    expect(calendarFileName('Mt. Pulag & Co.')).toBe('mt-pulag-co.ics');
    expect(calendarFileName('???')).toBe('climb.ics');
  });
});
