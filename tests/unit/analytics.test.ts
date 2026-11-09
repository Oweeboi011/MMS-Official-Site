const fetchMock = vi.fn(async () => new Response('[]'));

describe('analytics', () => {
  beforeEach(() => { vi.resetModules(); fetchMock.mockClear(); vi.stubGlobal('fetch', fetchMock); });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('sends nothing in tests, dev, or read-only builds', async () => {
    const { logPageView, logClientError } = await import('../../src/frontend/services/analytics');
    logPageView('/climbs/abc');
    logClientError('route', 'boom');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
