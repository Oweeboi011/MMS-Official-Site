import { createdMillis, pickPromotions, waitlistOpen } from '../../src/backend/functions/src/shared/waitlist.js';

const NOW = Date.UTC(2026, 10, 11);
const at = (ms: number) => ({ toMillis: () => ms });
const reg = (id: string, status: string, createdAt: number) => ({ id, status, createdAt: at(createdAt) });

describe('waitlistOpen', () => {
  it('needs a seat limit and auto-promote on', () => {
    expect(waitlistOpen({ maxParticipants: 10 }, NOW)).toBe(true);
    expect(waitlistOpen({}, NOW)).toBe(false);
    expect(waitlistOpen({ maxParticipants: 0 }, NOW)).toBe(false);
    expect(waitlistOpen({ maxParticipants: 10, waitlistAutoPromote: false }, NOW)).toBe(false);
  });

  it('is closed for cancelled, postponed, completed and ended climbs', () => {
    expect(waitlistOpen({ maxParticipants: 10, status: 'cancelled' }, NOW)).toBe(false);
    expect(waitlistOpen({ maxParticipants: 10, cancellationStatus: 'postponed' }, NOW)).toBe(false);
    expect(waitlistOpen({ maxParticipants: 10, status: 'completed' }, NOW)).toBe(false);
    expect(waitlistOpen({ maxParticipants: 10, endDate: { toDate: () => new Date(NOW - 1000) } }, NOW)).toBe(false);
    expect(waitlistOpen({ maxParticipants: 10, endDate: { toDate: () => new Date(NOW + 1000) } }, NOW)).toBe(true);
  });
});

describe('pickPromotions', () => {
  it('fills only the free seats, longest-waiting first', () => {
    const regs = [reg('a', 'confirmed', 1), reg('b', 'pending', 2), reg('w2', 'waitlisted', 20), reg('w1', 'waitlisted', 10), reg('w3', 'waitlisted', 30), reg('x', 'cancelled', 5)];
    expect(pickPromotions(regs, 4).map((r: { id: string }) => r.id)).toEqual(['w1', 'w2']);
    expect(pickPromotions(regs, 3).map((r: { id: string }) => r.id)).toEqual(['w1']);
  });

  it('promotes nobody when full, and breaks ties by id', () => {
    expect(pickPromotions([reg('a', 'confirmed', 1), reg('w', 'waitlisted', 2)], 1)).toEqual([]);
    expect(pickPromotions([reg('wb', 'waitlisted', 5), reg('wa', 'waitlisted', 5)], 1).map((r: { id: string }) => r.id)).toEqual(['wa']);
  });
});

describe('createdMillis', () => {
  it('reads Timestamp-like values and defaults to 0', () => {
    expect(createdMillis({ createdAt: at(7) })).toBe(7);
    expect(createdMillis({ createdAt: { toDate: () => new Date(9) } })).toBe(9);
    expect(createdMillis({})).toBe(0);
  });
});
