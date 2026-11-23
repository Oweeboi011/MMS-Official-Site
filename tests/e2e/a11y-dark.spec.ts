import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// The dark theme follows the system setting; every page must keep WCAG AA contrast with it on (see a11y.spec.ts for light).
test.use({ colorScheme: 'dark' });

const pages = ['/', '/activities/open-climbs', '/about/leadership', '/explore/mountains', '/account/sign-in', '/activities/sportfest', '/account/content', '/account/tasks', '/account/activities', '/credits',
  // One page per section and per page type, since the accent colours differ by section.
  '/about', '/about/history', '/explore', '/activities', '/training', '/community', '/media', '/membership', '/surveys', '/search?q=pulag', '/about/glossary', '/media/news'];

for (const path of pages) {
  test(`no axe violations in dark mode on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Frozen first: axe would otherwise read a colour half-way through a fade.
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const lines = violations.map((v) => v.id + ': ' + v.nodes.length + ' x ' + v.help + ' -> ' + v.nodes.slice(0, 4).map((n) => n.target.join(' ')).join(' | '));
    expect(lines).toEqual([]);
  });
}
