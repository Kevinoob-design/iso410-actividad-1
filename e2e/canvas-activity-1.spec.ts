import { BrowserContext, expect, Page, test } from '@playwright/test'

let context: BrowserContext;

test.beforeAll(async ({ browser }) => {
	context = await browser.newContext();
	await context.newPage();
});

test.describe.configure({ mode: 'serial' });

test.describe('Should:', () => {
	test('Go to banner as a student', async () => {
		const page = context.pages()[ 0 ]
		await page.goto('/banner');
		await page.getByRole('link', { name: 'Estudiante' }).click()
		await page.close()
	})

	test('Login to Banner with email and password', async () => {
		const page = await context.waitForEvent('page')
		await page.waitForURL('**/login.microsoftonline.com/**')
		await page.getByRole('textbox', { name: 'Email' }).fill(process.env.EMAIL!)
		await page.getByRole('button', { name: 'Next' }).click()
		await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PASS!)
		await page.getByRole('button', { name: 'Sign in' }).click()
		await page.getByRole('button', { name: 'No' }).click()
	})
})

test.describe('Should:', () => {

	test('Go to Schedule Plan', async () => {
		const page = context.pages()[ 0 ]
		await page.waitForURL('**/alumnos.unapec.edu.do/**')
		await page.getByRole('link', { name: 'Inscripción, horario y planificación' }).click()
		await page.close()
	})

	test('Go to Schedule Information', async () => {
		const page = await context.waitForEvent('page')
		await page.waitForURL('**/registro.unapec.edu.do/**')
		await page.getByRole('link', { name: 'View Registration Information' }).click()
		await page.waitForURL('**/registro.unapec.edu.do/StudentRegistrationSsb/**')
		await page.getByRole('tab', { name: 'Schedule Details' }).click()
		// await page.waitForRequest('**/getMeetingInformationForRegistrations', { timeout: 60000 })
		await page.waitForSelector('.listViewMeetingInformation', { timeout: 60000 })

		const scheduleStrings: (string | null)[] = []

		for (const el of await page.locator('.listViewMeetingInformation').all()) {
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

test('Logout', async () => {
	const page = context.pages()[ 0 ]
	await page.getByRole('link', { name: 'Profile. Short cut is Alt+P' }).click()
	await page.getByRole('menuitem', { name: 'Sign Out' }).click()
	await page.waitForURL('**/login.microsoftonline.com/**')

	await page.waitForSelector('text=Hang on a moment while we sign you out.', { timeout: 60000 })
	await expect(page.getByText('Hang on a moment while we sign you out.')).toBeVisible()

	await page.waitForSelector('text=You signed out of your account', { timeout: 60000 })
	await expect(page.getByText('You signed out of your account')).toBeVisible()
})

test.afterAll(async () => {
	await context.close();
});
