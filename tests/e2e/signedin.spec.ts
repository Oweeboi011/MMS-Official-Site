import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Real sign-in against the Auth and Firestore emulators (npm run test:e2e:signedin). Seeding goes straight to the
// emulators' REST APIs, so the app's own rules still decide what the signed-in person can do.
const AUTH = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1';
const DOCS = 'http://127.0.0.1:8080/v1/projects/demo-mms/databases/openclimbs/documents';
const PASSWORD = 'Test-pass-123';
const stamp = Date.now();

const str = (v: string) => ({ stringValue: v });

async function seedUser(label: string, groups: string[]): Promise<string> {
  const email = `${label}-${stamp}@example.test`;
  const res = await fetch(`${AUTH}/accounts:signUp?key=demo-key`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: PASSWORD, returnSecureToken: true }) });
  const { localId } = (await res.json()) as { localId: string };
  const put = (path: string, fields: object) =>
    fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { 'content-type': 'application/json', Authorization: 'Bearer owner' }, body: JSON.stringify({ fields }) });
  const group = { arrayValue: { values: groups.map(str) } };
  await put(`users/${localId}`, { role: str('member'), email: str(email), name: str(label), ...(groups.length ? { groups: group } : {}) });
  if (groups.length) await put(`groupMembers/${localId}`, { name: str(label), groups: group });
  return email;
}

// What the emulator actually holds, so a failed write cannot hide behind text left on the page.
async function storedStatus(title: string): Promise<string> {
  const res = await fetch(`${DOCS}/tasks`, { headers: { Authorization: 'Bearer owner' } });
  const { documents = [] } = (await res.json()) as { documents?: { fields: { title: { stringValue: string }; status: { stringValue: string } } }[] };
  return documents.find((d) => d.fields.title.stringValue === title)?.fields.status.stringValue ?? '(missing)';
}

async function signIn(page: Page, email: string) {
  await page.goto('/account/tasks');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

// Violations as one readable line each, naming the elements, so a failure says what to fix.
const where = (n: { target: unknown[]; any: { message?: string }[] }) => n.target.join(' ') + ' [' + (n.any[0]?.message ?? '') + ']';

// Transitions are frozen first: axe would otherwise read a colour half-way between two states.
const violations = async (page: Page) => {
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
  const { violations: found } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return found.map((v) => v.id + ': ' + v.help + ' -> ' + v.nodes.map(where).join(' | '));
};

test('an ExeCom member adds, changes and views a task, and the signed-in page passes axe incl. contrast', async ({ page }) => {
  const email = await seedUser('execom', ['execom']);
  await signIn(page, email);
  await page.getByRole('button', { name: 'New task' }).click();
  await page.getByLabel('Title *').fill('Book the venue');
  await page.getByLabel('Owner').selectOption({ label: 'execom' });
  await page.getByLabel('Start').fill('2026-12-01');
  await page.getByLabel('Due').fill('2026-12-10');
  await page.getByRole('button', { name: 'Add item' }).click();
  await page.getByLabel('Item 1').fill('Call the hall');
  await page.getByRole('button', { name: 'Save task' }).click();

  const row = page.getByRole('row', { name: /Book the venue/ });
  await expect(row).toBeVisible();
  await expect(row.getByRole('cell', { name: 'execom', exact: true })).toBeVisible();
  expect(await violations(page)).toEqual([]);

  await page.getByLabel('Status of Book the venue').selectOption('done');
  await expect.poll(() => storedStatus('Book the venue')).toBe('done');
  await page.reload();
  await expect(page.getByLabel('Status of Book the venue')).toHaveValue('done');

  await page.getByRole('button', { name: 'Timeline' }).click();
  await expect(page.getByRole('region', { name: 'Timeline' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Move Book the venue/ })).toBeVisible();
  expect(await violations(page)).toEqual([]);

  await page.getByRole('button', { name: 'Edit Book the venue' }).click();
  await expect(page.getByRole('region', { name: 'History' })).toContainText('Created');
});

test('a signed-in member without a group is told they have no access', async ({ page }) => {
  const email = await seedUser('plain', []);
  await signIn(page, email);
  await expect(page.getByText(/doesn’t have access to the task tracker/)).toBeVisible();
});
