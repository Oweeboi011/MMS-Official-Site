import { toClimb } from '../../src/frontend/data/climbs';
import { toMyClimb } from '../../src/frontend/data/myClimbs';
import { scaledSize } from '../../src/frontend/lib/compressImage';

const now = new Date('2026-11-09T04:00:00Z');

describe('slots, photos, receipts, waiver', () => {
  it('counts slots left from maxParticipants and registrationCount', () => {
    expect(toClimb({ maxParticipants: 30, registrationCount: 27 }, now)?.slotsLeft).toBe(3);
    expect(toClimb({ maxParticipants: 30, registrationCount: 31 }, now)?.slotsLeft).toBe(0);
    expect(toClimb({ maxParticipants: 30 }, now)?.slotsLeft).toBe(30);
    expect(toClimb({}, now)?.slotsLeft).toBeUndefined();
  });

  it('scales photos to a 1600 px long edge, never up', () => {
    expect(scaledSize(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(scaledSize(1080, 1920)).toEqual({ width: 900, height: 1600 });
    expect(scaledSize(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('lists https receipts and the signed waiver', () => {
    const row = toMyClimb('r1', {
      paymentProofs: [{ url: 'https://firebasestorage.googleapis.com/x', fileName: 'gcash.jpg' }, { url: 'javascript:x' }],
      waiverSigned: true, waiverSignedName: 'Ana Cruz', waiverSignedAt: { toMillis: () => 5 }, climbLocation: 'Benguet',
    });
    expect(row.receipts).toEqual([{ url: 'https://firebasestorage.googleapis.com/x', fileName: 'gcash.jpg' }]);
    expect(row.waiver).toEqual({ name: 'Ana Cruz', signedAt: 5, location: 'Benguet' });
    expect(toMyClimb('r2', {}).waiver).toBeNull();
  });
});
