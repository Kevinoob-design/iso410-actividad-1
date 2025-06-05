import { expect, test } from '@playwright/test'

test.describe('Check PGA Should:', () => {
	test('Login to Banner and go to check PGA', async ({ page, context }) => {
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

		await loginPage.waitForURL('**/alumnos.unapec.edu.do/**')
		await loginPage.getByRole('link', { name: 'Histórico académico' }).click()
		await loginPage.close()

		const pgaPage = await context.waitForEvent('page')
		await pgaPage.waitForURL('**/sso.unapec.edu.do/**')
	})
})
