import { expect, test } from '@playwright/test'

test.describe('Logout Should:', () => {
	test('Go to banner as a student, login and logout', async ({ page, context }) => {
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

		await loginPage.getByRole('link', { name: 'Profile. Short cut is Alt+P' }).click()
		await loginPage.getByRole('menuitem', { name: 'Sign Out' }).click()
		await loginPage.waitForURL('**/login.microsoftonline.com/**')

		await loginPage.waitForSelector('text=Hang on a moment while we sign you out.', { timeout: 60000 })
		await expect(loginPage.getByText('Hang on a moment while we sign you out.')).toBeVisible()

		await loginPage.waitForSelector('text=You signed out of your account', { timeout: 60000 })
		await expect(loginPage.getByText('You signed out of your account')).toBeVisible()
	})
})
