import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Crossward man' })).toBeVisible();
});

test('It has navigation to puzzles page', async ({ page }) => {
	await page.goto('/');

	// Find nav and click it
	page.getByRole('link', { name: 'Puzzles' }).click();
	await expect(page.getByRole('heading', { name: 'Login page' })).toBeVisible();
});
