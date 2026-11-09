// #148 in-app notifications written by the functions (old app links mapped to this site's routes).
type Doc = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');

export interface Notice { id: string; title: string; message: string; link: string; read: boolean; createdAt: number }

// Old app paths → ADR 0008 routes. Unknown paths fall back to My Climbs.
export function siteLink(old: string): string {
  if (/^\/event\/[\w-]+$/.test(old)) return old.replace('/event/', '/climbs/');
  if (/^\/feedback\/[\w-]+$/.test(old) || old.startsWith('/my-registrations')) return '/account/climbs';
  if (/^\/admin\/climbs\/[\w-]+$/.test(old)) return old;
  if (old.startsWith('/admin')) return '/admin/registrations';
  return '/account/climbs';
}

const millis = (v: unknown) => (v && typeof v === 'object' && 'toMillis' in v ? (v as { toMillis: () => number }).toMillis() : 0);

export function toNotice(id: string, d: Doc): Notice {
  return { id, title: str(d.title) || 'Update', message: str(d.message), link: siteLink(str(d.link)), read: d.read === true, createdAt: millis(d.createdAt) };
}
