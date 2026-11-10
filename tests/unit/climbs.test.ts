import { toClimbDetail } from '../../src/frontend/data/climbDetail';
import { splitSchedule, toClimb } from '../../src/frontend/data/climbs';
import { fromManilaDay, manilaDay, manilaYear, manilaYearStart } from '../../src/frontend/lib/manila';

const now = new Date('2026-11-09T04:00:00Z'); // Nov 9 noon, Manila

describe('Manila dates', () => {
  it('uses the Manila calendar day and year', () => {
    expect(manilaDay(new Date('2026-12-31T17:00:00Z'))).toBe('2027-01-01');
    expect(manilaYear(new Date('2026-12-31T15:59:59Z'))).toBe(2026);
    expect(manilaYearStart(2026).toISOString()).toBe('2025-12-31T16:00:00.000Z');
    expect(fromManilaDay('2026-11-09').toISOString()).toBe('2026-11-08T16:00:00.000Z');
  });
});

describe('toClimb', () => {
  it('reads a bare elevation as metres, with or without a thousands comma, and keeps typed units', () => {
    const elevation = (v: unknown) => toClimb({ title: 'T', elevation: v }, now)?.elevation;
    expect(elevation('2087')).toBe('2,087m');
    expect(elevation('2,926')).toBe('2,926m');
    expect(elevation('633m')).toBe('633m');
    expect(elevation('')).toBeUndefined();
  });

  it('maps the old Open Climbs shape', () => {
    const c = toClimb({ id: 'x', title: 'Mt. Pulag', location: 'Benguet', type: 'major', status: 'closed', difficulty: '7/9', elevation: 2926,
      startDate: new Date('2026-11-19T16:00:00Z'), endDate: new Date('2026-11-21T16:00:00Z') }, now);
    expect(c).toMatchObject({ id: 'x', type: 'Major', status: 'Closed', difficulty: 'Advanced', rating: '7/9', elevation: '2,926m',
      day: '20', month: 'Nov', dates: 'Nov 20–22', over: false });
  });

  it('carries the round-trip distance for the schedule', () => {
    expect(toClimb({ roundTripDistance: '12 km' }, now)?.distance).toBe('12 km');
  });

  it('accepts YYYY-MM-DD dates and spans months', () => {
    expect(toClimb({ title: 'K', startDate: '2026-11-29', endDate: '2026-12-02' }, now)).toMatchObject({ dates: 'Nov 29 – Dec 2', difficulty: 'Not yet rated', type: 'Minor' });
  });

  it('is over once marked completed or the last Manila day has passed', () => {
    expect(toClimb({ status: 'completed', startDate: '2026-12-01' }, now)?.over).toBe(true);
    expect(toClimb({ startDate: '2026-11-08' }, now)?.over).toBe(true);
    expect(toClimb({ startDate: '2026-11-08', endDate: '2026-11-09' }, now)?.over).toBe(false); // last day is today
  });

  it('drops drafts and cancelled climbs, keeps postponed', () => {
    expect(toClimb({ status: 'draft' }, now)).toBeNull();
    expect(toClimb({ status: 'cancelled' }, now)).toBeNull();
    expect(toClimb({ cancellationStatus: 'cancelled' }, now)).toBeNull();
    expect(toClimb({ cancellationStatus: 'postponed', startDate: '2026-12-01' }, now)).toMatchObject({ postponed: true, over: false });
  });
});

describe('splitSchedule', () => {
  it('orders upcoming soonest first and keeps only this year\'s completed, newest first', () => {
    const climbs = ['2026-12-05', '2026-11-20', '2026-03-01', '2026-06-01', '2025-12-01'].map((d) => toClimb({ title: d, startDate: d }, now)!);
    const { upcoming, completed } = splitSchedule(climbs, 2026);
    expect(upcoming.map((c) => c.title)).toEqual(['2026-11-20', '2026-12-05']);
    expect(completed.map((c) => c.title)).toEqual(['2026-06-01', '2026-03-01']);
  });
});

describe('toClimbDetail', () => {
  it('collects stats, hides drafts, keeps cancelled with a flag', () => {
    const d = toClimbDetail({ title: 'T', elevation: '633m', difficulty: '3/9', trailClass: 2, roundTripDistance: '8 km', thingsToBring: ['Water', '', 4] }, now)!;
    expect(d.stats).toEqual([{ value: '633m', label: 'Elevation' }, { value: '3/9 · Beginner-friendly', label: 'Difficulty' }, { value: 'Class 2 · Simple hiking', label: 'Trail class' }, { value: '8 km', label: 'Round trip' }]);
    expect(d.thingsToBring).toEqual(['Water']);
    expect(toClimbDetail({ status: 'draft' }, now)).toBeNull();
    expect(toClimbDetail({ status: 'cancelled' }, now)?.cancelled).toBe(true);
  });
});
