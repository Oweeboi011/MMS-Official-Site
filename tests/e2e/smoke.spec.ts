import { expect, test } from '@playwright/test';

test('home loads with hero and nav', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
});

test('deep link renders a subpage (SPA rewrite works)', async ({ page }) => {
  await page.goto('/about/history');
  await expect(page.getByRole('heading', { name: 'Three decades on the trail.' })).toBeVisible();
});

test('mountains table pages through the top 100', async ({ page }) => {
  await page.goto('/explore/mountains');
  await expect(page.getByText('1–20 of 100')).toBeVisible();
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByText('21–40 of 100')).toBeVisible();
});
