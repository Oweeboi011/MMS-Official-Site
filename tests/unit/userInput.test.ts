import { authUpdateError, profileChanges, validateNewUser } from '../../src/backend/functions/src/shared/userInput.js';

const code = (fn: () => unknown) => {
  try { fn(); } catch (e) { return (e as { code: string }).code; }
  return 'none';
};

describe('validateNewUser', () => {
  it('defaults the role to member and keeps given values', () => {
    expect(validateNewUser({ email: 'a@b.c', displayName: 'Ana' })).toEqual({ email: 'a@b.c', displayName: 'Ana', role: 'member' });
    expect(validateNewUser({ email: 'a@b.c', displayName: 'Ana', role: 'admin' }).role).toBe('admin');
  });
  it('rejects missing fields and unknown roles', () => {
    expect(code(() => validateNewUser({ displayName: 'Ana' }))).toBe('invalid-argument');
    expect(code(() => validateNewUser({ email: 'a@b.c' }))).toBe('invalid-argument');
    expect(code(() => validateNewUser({ email: 'a@b.c', displayName: 'Ana', role: 'owner' }))).toBe('invalid-argument');
  });
});

describe('profileChanges', () => {
  it('returns only the given fields and needs at least one', () => {
    expect(profileChanges({ email: 'a@b.c' })).toEqual({ email: 'a@b.c' });
    expect(profileChanges({ displayName: 'Ana', email: '' })).toEqual({ displayName: 'Ana' });
    expect(code(() => profileChanges({}))).toBe('invalid-argument');
  });
});

describe('authUpdateError', () => {
  it('maps known Auth errors and passes the rest on as internal', () => {
    expect(authUpdateError({ code: 'auth/email-already-exists' }).code).toBe('already-exists');
    expect(authUpdateError({ code: 'auth/user-not-found' }).code).toBe('not-found');
    const other = authUpdateError({ code: 'auth/other', message: 'boom' });
    expect(other.code).toBe('internal');
    expect(other.message).toBe('boom');
  });
});
