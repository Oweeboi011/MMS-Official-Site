import { siteLink, toNotice } from '../../src/frontend/data/notifications';

describe('notifications', () => {
  it('maps old app links to this site', () => {
    expect(siteLink('/event/abc')).toBe('/climbs/abc');
    expect(siteLink('/my-registrations')).toBe('/account/climbs');
    expect(siteLink('/feedback/abc')).toBe('/account/climbs');
    expect(siteLink('/admin/climbs/abc')).toBe('/admin/climbs/abc');
    expect(siteLink('/admin/payments')).toBe('/admin/registrations');
    expect(siteLink('javascript:alert(1)')).toBe('/account/climbs');
  });

  it('reads the function-written shape', () => {
    expect(toNotice('n', { title: 'T', message: 'M', link: '/event/x', read: true, createdAt: { toMillis: () => 5 } }))
      .toEqual({ id: 'n', title: 'T', message: 'M', link: '/climbs/x', read: true, createdAt: 5 });
  });
});
