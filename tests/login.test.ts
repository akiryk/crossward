import { expect, test } from '@playwright/test';
import { CREDENTIALS_USERNAME, CREDENTIALS_PASSWORD } from '$env/static/private';

test('Signin', async ({ page }) => {
	await page.goto('/login');
	await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
	await page.getByTestId('sign-in-button').click();
	await page.waitForURL('**/auth/signin');
	await page.getByLabel('Username').fill(CREDENTIALS_USERNAME);
	await page.getByLabel('Password').fill(CREDENTIALS_PASSWORD);
	await page.getByRole('button', { name: 'Sign in with name & password' }).click({ force: true });
	await page.waitForURL('**/login');

	await expect(page.getByRole('heading', { name: "You're in!" })).toBeVisible();
});
