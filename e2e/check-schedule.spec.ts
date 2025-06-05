import { expect, test } from '@playwright/test'

test.describe('Check Schedule Should:', () => {
	test('Login to Banner and go to check Schedule', async ({ page, context }) => {
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
		await loginPage.getByRole('link', { name: 'Inscripción, horario y planificación' }).click()
		await loginPage.close()

		const schedulePage = await context.waitForEvent('page')
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
})
