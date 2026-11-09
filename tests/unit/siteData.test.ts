import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/frontend/services/firebase', () => ({ firebase: () => { throw new Error('reached Firestore'); } }));

const load = async (flag: string) => {
  vi.resetModules();
  vi.stubEnv('VITE_WRITES_ENABLED', flag);
  return import('../../src/frontend/services/siteData');
};
const spec = { id: 'announcements' } as Parameters<Awaited<ReturnType<typeof load>>['removeRow']>[0];

describe('siteData writes', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('refuses saves and deletes on a read-only build', async () => {
    const { saveRow, removeRow } = await load('false');
    await expect(saveRow(spec, null, {})).rejects.toThrow(/read-only/);
    await expect(removeRow(spec, 'x')).rejects.toThrow(/read-only/);
  });

  it('goes to Firestore when writes are on', async () => {
    const { removeRow } = await load('');
    await expect(removeRow(spec, 'x')).rejects.toThrow('reached Firestore');
  });
});
