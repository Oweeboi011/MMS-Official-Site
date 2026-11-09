import { readFileSync } from 'node:fs';

describe('security headers', () => {
  const headers = readFileSync('public/_headers', 'utf8');
  it('enforces the CSP (not report-only) with no inline scripts', () => {
    const csp = headers.split('\n').find((l) => l.trim().startsWith('Content-Security-Policy:')) ?? '';
    const scripts = csp.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
    expect(headers).not.toContain('Report-Only');
    expect(scripts).toContain("'self'");
    expect(scripts).not.toContain("'unsafe-inline'");
    expect(csp).toContain("object-src 'none'");
  });
});
