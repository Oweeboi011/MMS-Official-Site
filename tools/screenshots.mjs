// Page screenshots for README + docs: node tools/screenshots.mjs [baseUrl]. Re-run after UI changes.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'https://www.metropolitanms.org';
const out = 'docs/images/screenshots';
const pages = [
  ['home', '/'],
  ['about', '/about'],
  ['open-climbs', '/activities/open-climbs'],
  ['mountains', '/explore/mountains'],
  ['glossary', '/about/glossary'],
  ['news', '/media/news'],
  ['surveys', '/surveys'],
  ['search', '/search?q=pulag'],
];
const viewports = { desktop: { width: 1280, height: 800 }, mobile: { width: 390, height: 844 } };

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
for (const [device, viewport] of Object.entries(viewports)) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  for (const [name, path] of device === 'mobile' ? pages.slice(0, 2) : pages) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${out}/${name}-${device}.jpg`, type: 'jpeg', quality: 70 });
    console.log(`ok  ${name}-${device}`);
  }
  await page.close();
}
await browser.close();
