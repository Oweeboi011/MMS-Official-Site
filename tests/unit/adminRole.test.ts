import { adminTransition, claimsFor } from '../../src/backend/functions/src/shared/adminRole.js';

describe('adminTransition', () => {
  it('flags only a change in admin status', () => {
    expect(adminTransition({ role: 'member' }, { role: 'admin' }).changed).toBe(true);
    expect(adminTransition(null, { role: 'admin' })).toMatchObject({ changed: true, isAdmin: true });
    expect(adminTransition({ role: 'admin' }, null)).toMatchObject({ changed: true, isAdmin: false });
    expect(adminTransition({ role: 'admin' }, { role: 'admin' }).changed).toBe(false);
    expect(adminTransition(null, { role: 'member' }).changed).toBe(false);
  });

  it('clears the email grant only when an admin loses the role', () => {
    expect(adminTransition({ role: 'admin' }, { role: 'member', canEmailMembers: true }).clearEmailGrant).toBe(true);
    expect(adminTransition({ role: 'admin' }, { role: 'member' }).clearEmailGrant).toBe(false);
    expect(adminTransition({ role: 'member' }, { role: 'admin', canEmailMembers: true }).clearEmailGrant).toBe(false);
  });
});

describe('claimsFor', () => {
  it('adds or removes admin and keeps other claims', () => {
    expect(claimsFor({ x: 1 }, true)).toEqual({ x: 1, admin: true });
    expect(claimsFor({ x: 1, admin: true }, false)).toEqual({ x: 1 });
    expect(claimsFor(undefined, true)).toEqual({ admin: true });
  });
});
