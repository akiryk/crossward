import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/'); // or not
	await expect(page.getByRole('heading', { name: 'Play!' })).toBeVisible();
});
