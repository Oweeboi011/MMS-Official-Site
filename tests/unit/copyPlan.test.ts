import { describe as describeClimb, normalizeDates, planCopy, rewriteLinks, toImportRecord } from '../../tools/admin/copyPlan.mjs';

const doc = (id: string, data: Record<string, unknown> = {}) => ({ id, data });

describe('old-app climb copy plan', () => {
  const source = [doc('a'), doc('b'), doc('c')];

  it('creates missing climbs and leaves existing ones alone by default', () => {
    const plan = planCopy(source, new Set(['b']), false);
    expect(plan.create.map((d: { id: string }) => d.id)).toEqual(['a', 'c']);
    expect(plan.skip.map((d: { id: string }) => d.id)).toEqual(['b']);
    expect(plan.overwrite).toEqual([]);
  });

  it('overwrites existing climbs only when asked', () => {
    const plan = planCopy(source, new Set(['b']), true);
    expect(plan.overwrite.map((d: { id: string }) => d.id)).toEqual(['b']);
    expect(plan.skip).toEqual([]);
  });

  it('describes a climb with its date and title', () => {
    const startDate = { toDate: () => new Date('2026-12-05T00:00:00Z') };
    expect(describeClimb(doc('x', { title: 'Mt. Pulag', startDate }))).toBe('x  2026-12-05  Mt. Pulag');
    expect(describeClimb(doc('y'))).toBe('y  no date  (untitled)');
  });

  it('turns text dates into Manila-midnight timestamps and leaves the rest', () => {
    const ts = (d: Date) => d.toISOString();
    const out = normalizeDates({ startDate: '2026-09-26', endDate: '2026-09-27T01:00:00Z', paymentDueDate: '2026-09-21', title: 'x' }, ts);
    expect(out).toEqual({ startDate: '2026-09-25T16:00:00.000Z', endDate: '2026-09-27T01:00:00.000Z', paymentDueDate: '2026-09-21', title: 'x' });
    const already = { startDate: { seconds: 1 } };
    expect(normalizeDates(already, ts).startDate).toBe(already.startDate);
    expect(() => normalizeDates({ startDate: 'soon' }, ts)).toThrow(/Unreadable startDate/);
  });

  it('maps an old sign-in account, keeping the Google link and dropping the password unless hash settings are given', () => {
    const user = {
      uid: 'u1', email: 'a@x.com', emailVerified: true, displayName: 'Ana', disabled: false,
      metadata: { creationTime: 'Mon, 01 Jan 2024 00:00:00 GMT', lastSignInTime: 'Tue, 02 Jan 2024 00:00:00 GMT' },
      providerData: [{ uid: 'g1', providerId: 'google.com', email: 'a@x.com' }, { uid: 'a@x.com', providerId: 'password', email: 'a@x.com' }],
      passwordHash: 'aGFzaA==', passwordSalt: 'c2FsdA==', customClaims: { admin: true },
    };
    const plain = toImportRecord(user);
    expect(plain.providerData.map((p: { providerId: string }) => p.providerId)).toEqual(['google.com']);
    expect(plain).not.toHaveProperty('passwordHash');
    expect(plain).toMatchObject({ uid: 'u1', emailVerified: true, displayName: 'Ana', customClaims: { admin: true } });
    const withPassword = toImportRecord(user, true) as unknown as { passwordHash: Buffer; passwordSalt: Buffer };
    expect(withPassword.passwordHash.toString()).toBe('hash');
    expect(withPassword.passwordSalt.toString()).toBe('salt');
  });

  it('repoints stored download links to the new bucket, deeply, leaving other values alone', () => {
    const old = 'https://firebasestorage.googleapis.com/v0/b/old.firebasestorage.app/o/a%2Fb.jpg?alt=media&token=t';
    const stamp = new Date();
    const out = rewriteLinks({ receipt: old, payments: [{ proofs: [{ url: old }] }], n: 3, at: stamp, note: 'old.firebasestorage.app' }, 'old.firebasestorage.app', 'new.firebasestorage.app');
    expect(out.receipt).toContain('/v0/b/new.firebasestorage.app/o/a%2Fb.jpg?alt=media&token=t');
    expect(out.payments[0].proofs[0].url).toContain('/v0/b/new.firebasestorage.app/');
    expect(out.n).toBe(3);
    expect(out.at).toBe(stamp);
    expect(out.note).toBe('old.firebasestorage.app');
  });
});
