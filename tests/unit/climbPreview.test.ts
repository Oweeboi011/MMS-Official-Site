import { readFileSync } from 'node:fs';
import { onRequestGet } from '../../functions/climbs/[id]';
import { climbMetaBlock, escapeAttr, truncate, withMeta } from '../../src/frontend/lib/climbMeta';

const shell = readFileSync('index.html', 'utf8');
const climbDoc = { fields: { title: { stringValue: 'Mt. "Pulag" <b>' }, type: { stringValue: 'major' }, location: { stringValue: 'Benguet' }, dateLabel: { stringValue: 'Dec 5-7' }, trailImages: { arrayValue: { values: [{ stringValue: 'https://img.example/p.jpg' }] } } } };

function call(id: string, firestore: Response | Error) {
  vi.stubGlobal('fetch', vi.fn(async () => {
    if (firestore instanceof Error) throw firestore;
    return firestore;
  }));
  const next = async () => new Response(shell, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  return onRequestGet({ request: new Request(`https://mms.test/climbs/${id}`), params: { id }, next });
}

describe('climb link previews', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('escapes officer-typed text and cuts long descriptions at a word', () => {
    expect(escapeAttr(`a"b<c>&'`)).toBe('a&quot;b&lt;c&gt;&amp;&#39;');
    expect(truncate('word '.repeat(60))).toMatch(/word…$/);
    expect(truncate('short')).toBe('short');
  });

  it('builds title, description and image from the climb', () => {
    const block = climbMetaBlock({ title: 'Tarak Ridge', type: 'minor', location: 'Bataan', elevation: 1130 }, 'https://mms.test/climbs/x', 'https://mms.test');
    expect(block).toContain('<title>Tarak Ridge | MMS Open Climbs</title>');
    expect(block).toContain('content="Minor climb · Bataan · 1130 MASL"');
    expect(block).toContain('content="https://mms.test/images/hero-pulag-sunrise.webp"');
  });

  it('leaves an unmarked shell alone', () => {
    expect(withMeta('<head></head>', 'x')).toBe('<head></head>');
  });

  it('serves the shell with the climb tags swapped in', async () => {
    const html = await (await call('abc123', new Response(JSON.stringify(climbDoc)))).text();
    expect(html).toContain('<title>Mt. &quot;Pulag&quot; &lt;b&gt; · Dec 5-7 | MMS Open Climbs</title>');
    expect(html).toContain('<meta property="og:image" content="https://img.example/p.jpg" />');
    expect(html).not.toContain('Guests welcome.');
    expect(html).toContain('<div id="root">');
  });

  it('falls back to the plain shell on a bad id, missing climb or network error', async () => {
    for (const res of [await call('../users', new Response('{}')), await call('nope', new Response('', { status: 404 })), await call('abc', new Error('down'))]) {
      expect(await res.text()).toBe(shell);
    }
  });
});
