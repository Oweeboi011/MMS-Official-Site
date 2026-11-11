import { REQUIRED_DOC_TYPES } from '../../src/backend/functions/src/requiredDocTypes.js';
import { detectClimbChanges, newAnnouncementsOf, seatsOpened } from '../../src/backend/functions/src/shared/climbChanges.js';

const field = REQUIRED_DOC_TYPES[0].requiresField as string;

describe('newAnnouncementsOf', () => {
  it('returns only announcements the earlier version did not have', () => {
    const a = { createdAt: 1, message: 'a' };
    const b = { createdAt: 2, message: 'b' };
    expect(newAnnouncementsOf({ announcements: [a] }, { announcements: [a, b] })).toEqual([b]);
    expect(newAnnouncementsOf({}, { announcements: [a] })).toEqual([a]);
    expect(newAnnouncementsOf({ announcements: [a] }, {})).toEqual([]);
  });
});

describe('seatsOpened', () => {
  it('is true when seats grow or auto-promotion is switched back on', () => {
    expect(seatsOpened({ maxParticipants: 10 }, { maxParticipants: 12 })).toBe(true);
    expect(seatsOpened({}, { maxParticipants: 5 })).toBe(true);
    expect(seatsOpened({ waitlistAutoPromote: false }, { waitlistAutoPromote: true })).toBe(true);
    expect(seatsOpened({ waitlistAutoPromote: false }, {})).toBe(true);
  });
  it('is false when nothing opens', () => {
    expect(seatsOpened({ maxParticipants: 10 }, { maxParticipants: 10 })).toBe(false);
    expect(seatsOpened({ maxParticipants: 10 }, { maxParticipants: 8 })).toBe(false);
    expect(seatsOpened({ waitlistAutoPromote: false }, { waitlistAutoPromote: false })).toBe(false);
  });
});

describe('detectClimbChanges', () => {
  it('sees a requirement switched off or on', () => {
    const off = detectClimbChanges({ [field]: true }, { [field]: false });
    expect(off.turnedOffDocTypes).toHaveLength(1);
    expect(off.requirementsChanged).toBe(true);
    const on = detectClimbChanges({ [field]: false }, { [field]: true });
    expect(on.turnedOffDocTypes).toHaveLength(0);
    expect(on.requirementsChanged).toBe(true);
    expect(detectClimbChanges({}, {}).requirementsChanged).toBe(false);
  });

  it('reports a cancellation or postponement, not other status values or repeats', () => {
    expect(detectClimbChanges({}, { cancellationStatus: 'cancelled' }).cancellationChanged).toBe(true);
    expect(detectClimbChanges({ cancellationStatus: 'cancelled' }, { cancellationStatus: 'postponed' }).cancellationChanged).toBe(true);
    expect(detectClimbChanges({ cancellationStatus: 'cancelled' }, { cancellationStatus: 'cancelled' }).cancellationChanged).toBe(false);
    expect(detectClimbChanges({ cancellationStatus: 'cancelled' }, { cancellationStatus: '' }).cancellationChanged).toBe(false);
  });
});
