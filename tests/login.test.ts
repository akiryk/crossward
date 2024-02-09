import { expect, test } from '@playwright/test';

test('Signin', async ({ page }) => {
	await page.goto('/login');
	await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
	await page.getByTestId('sign-in-button').click();
	await page.waitForURL('**/auth/signin');
	await page.getByLabel('Username').fill('tristateregion');
	await page.getByLabel('Password').fill('CxB87AT!rrrC17ee');
	await page.getByRole('button', { name: 'Sign in with name & password' }).click({ force: true });
	await page.waitForURL('**/login');

	await expect(page.getByRole('heading', { name: "You're in!" })).toBeVisible();
});
