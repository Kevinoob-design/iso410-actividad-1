import { expect, test } from '@playwright/test'

test.describe('Banner Activities 1', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/banner')
	})

	test('Should:', async ({ page, context }) => {
		await test.step('Go to banner as a student', async () => {
			await page.getByRole('link', { name: 'Estudiante' }).click()
			await page.close()
		})

		const loginPage = await context.waitForEvent('page')

		await test.step('Login to Banner without email and password', async () => {
			await loginPage.waitForURL('**/login.microsoftonline.com/**')
			await loginPage.getByRole('textbox', { name: 'Email' }).fill(process.env.EMAIL!)
			await loginPage.getByRole('button', { name: 'Next' }).click()
			await loginPage.getByRole('textbox', { name: 'Password' }).fill(process.env.PASS!)
			await loginPage.getByRole('button', { name: 'Sign in' }).click()
			await loginPage.getByRole('button', { name: 'No' }).click()
		})

		await test.step('Go to Schedule  Plan', async () => {
			await loginPage.waitForURL('**/alumnos.unapec.edu.do/**')
			await loginPage.getByRole('link', { name: 'Inscripción, horario y planificación' }).click()
			await loginPage.close()
		})
		
		const schedulePage = await context.waitForEvent('page')
		
		await test.step('Go to Schedule Information', async () => {
			await schedulePage.waitForURL('**/registro.unapec.edu.do/**')
			await schedulePage.getByRole('link', { name: 'View Registration Information' }).click()
			await schedulePage.waitForURL('**/registro.unapec.edu.do/StudentRegistrationSsb/**')
			await schedulePage.getByRole('tab', { name: 'Schedule Details' }).click()
			// await schedulePage.waitForRequest('**/getMeetingInformationForRegistrations', { timeout: 60000 })
			await schedulePage.waitForSelector('.listViewMeetingInformation', { timeout: 60000 })

			const scheduleStrings: (string | null)[] = []

			for (const el of await schedulePage.locator('.listViewMeetingInformation').all()) {
				const textContent = (await el.textContent())?.replace(/[\n\r]+|[\s]{2,}/g, ' ') ?? null
				scheduleStrings.push(textContent)
				console.log('Tu horario es:', textContent)

				expect(textContent).not.toBeNull()
			}

			expect(scheduleStrings[ 0 ]).toContain('NICOLAS')
			expect(scheduleStrings[ 1 ]).toContain('Thursday')
			expect(scheduleStrings[ 0 ]).toContain('EDIF-03')
			expect(scheduleStrings[ 1 ]).toContain('08/28/2023')
			expect(scheduleStrings[ 1 ]).toContain('LAB-E0')
			expect(scheduleStrings[ 4 ]).toContain('05:01')

		})

		await test.step('Logout', async () => {
			await schedulePage.getByRole('link', { name: 'Profile. Short cut is Alt+P' }).click()
			await schedulePage.getByRole('menuitem', { name: 'Sign Out' }).click()
			await schedulePage.waitForURL('**/login.microsoftonline.com/**')

			await schedulePage.waitForSelector('text=Hang on a moment while we sign you out.', { timeout: 60000 })
			await expect(schedulePage.getByText('Hang on a moment while we sign you out.')).toBeVisible()

			await schedulePage.waitForSelector('text=You signed out of your account', { timeout: 60000 })
			await expect(schedulePage.getByText('You signed out of your account')).toBeVisible()
		})
	})
})

