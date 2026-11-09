// Cloudflare Pages Function for /climbs/:id (replaces the old ogPrerender). Same HTML for everyone (no UA sniffing,
// so it caches); any failure serves the plain app shell. Reads the public climb doc over Firestore REST.
import { climbMetaBlock, withMeta } from '../../src/frontend/lib/climbMeta';
import { decodeFields } from '../../src/frontend/lib/firestoreRest';

const DOCS = 'https://firestore.googleapis.com/v1/projects/mms-official-site-513809/databases/openclimbs/documents';
const ID = /^[\w-]{1,64}$/; // Firestore auto-id shape; anything else never becomes a document path

interface Context { request: Request; params: Record<string, string | string[] | undefined>; next: () => Promise<Response> }

export async function onRequestGet({ request, params, next }: Context): Promise<Response> {
  const page = await next();
  const id = typeof params.id === 'string' ? params.id : '';
  if (!ID.test(id) || !page.ok || !page.headers.get('content-type')?.includes('text/html')) return page;
  try {
    const res = await fetch(`${DOCS}/climbs/${id}`);
    if (!res.ok) return page;
    const { fields } = (await res.json()) as { fields?: Parameters<typeof decodeFields>[0] };
    const url = new URL(request.url);
    const html = withMeta(await page.clone().text(), climbMetaBlock(decodeFields(fields), `${url.origin}${url.pathname}`, url.origin));
    const headers = new Headers(page.headers);
    headers.delete('content-length');
    headers.set('Cache-Control', 'public, max-age=300'); // edits show within 5 min; fewer Firestore reads
    return new Response(html, { status: page.status, headers });
  } catch {
    return page;
  }
}
