import { expect, test } from '@playwright/test'

test.describe('Login Should:', () => {
	test('Go to banner as a student and login', async ({ page, context }) => {
		await page.goto('/banner');
		await page.getByRole('link', { name: 'Estudiante' }).click()
		await page.close()

		const loginPage = await context.waitForEvent('page')
		await loginPage.waitForURL('**/login.microsoftonline.com/**')
		await loginPage.getByRole('textbox', { name: 'Email' }).fill(process.env.EMAIL!)
		await loginPage.getByRole('button', { name: 'Next' }).click()
		await loginPage.getByRole('textbox', { name: 'Password' }).fill(process.env.PASS!)
		await loginPage.getByRole('button', { name: 'Sign in' }).click()
		await loginPage.getByRole('button', { name: 'No' }).click()
	})
})
