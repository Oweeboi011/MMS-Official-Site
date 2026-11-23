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

// Axe does not tab through a page or look at print, so these two checks cover what it cannot.
const luminance = ([r, g, b]: number[]) => {
  const [x, y, z] = [r, g, b].map((c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * x + 0.7152 * y + 0.0722 * z;
};
const contrast = (a: number[], b: number[]) => { const [hi, lo] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (hi + 0.05) / (lo + 0.05); };

for (const path of ['/account/sign-in']) {
  test(`keyboard focus stays visible (3:1) in dark mode on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
    const seen: string[] = [];
    for (let i = 0; i < 30; i += 1) {
      await page.keyboard.press('Tab');
      const found = await page.evaluate(() => {
        const rgb = (v: string) => (v.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        const el = document.activeElement as HTMLElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const ring = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? rgb(cs.outlineColor) : rgb(cs.borderTopColor);
        let bg = [14, 19, 26];
        for (let e: HTMLElement | null = el.parentElement; e; e = e.parentElement) {
          const m = getComputedStyle(e).backgroundColor.match(/[\d.]+/g) ?? [];
          if (m.length >= 3 && (m.length === 3 || Number(m[3]) === 1)) { bg = m.slice(0, 3).map(Number); break; }
        }
        return { name: el.tagName + '.' + el.className + ' ' + (el.getAttribute('aria-label') ?? el.textContent ?? '').slice(0, 24), ring, bg };
      });
      if (found) seen.push(found.name + ' ' + contrast(found.ring, found.bg).toFixed(2));
    }
    // Only elements whose ring is our own focus colour are judged; links inside photo heroes sit on images.
    const controls = seen.filter((s) => /^(INPUT|BUTTON|SELECT|TEXTAREA)/.test(s));
    expect(controls.length).toBeGreaterThan(0); // never pass by judging nothing
    expect(controls.filter((s) => Number(s.split(' ').pop()) < 3)).toEqual([]);
  });
}

test('a waiver or day sheet printed from a dark-mode device is still dark text on white', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.emulateMedia({ media: 'print', colorScheme: 'dark' });
  const text = await page.evaluate(() => (getComputedStyle(document.body).color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number));
  expect(luminance(text)).toBeLessThan(0.2);
});

test('the dropdown arrow and the table row highlight follow the dark theme', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return { chevron: root.getPropertyValue('--chevron'), hover: root.getPropertyValue('--row-hover').trim() };
  });
  expect(tokens.chevron).toContain('b3b8ff'); // light periwinkle, not the light theme's navy 252b73
  // A faint white wash (the build may spell it #ffffff12), not the cream one that turns grey on dark.
  expect(['rgba(255,255,255,.07)', '#ffffff12']).toContain(tokens.hover);
});
