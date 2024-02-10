import { expect, test } from '@playwright/test';

test('It has button to create a puzzle', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('button', { name: 'Create a puzzle' })).toBeVisible();
	await page.getByRole('button', { name: 'Create a puzzle' }).click();
	await page.waitForURL('**/login');
	await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});
