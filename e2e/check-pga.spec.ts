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
		await loginPage.getByRole('link', { name: 'Ver calificaciones' }).click()
		await loginPage.close()

		const viewGradePage = await context.waitForEvent('page')
		await viewGradePage.waitForURL('**/alumnos.unapec.edu.do/**')

		const termResponse = viewGradePage.waitForResponse((response) =>
			response.url().includes('/StudentSelfService/studentGrades/term'))

		await viewGradePage.getByRole('button', { name: 'Press to select Term.' }).click();
		await termResponse

		const grades: {
			selectedTermGpa: number,
			gpa: number,
			gpaHours: number[],
			qualityPoints: number[],
			totalQualityPoints: number,
			totalGpaHours: number,
			term: string | null
		}[] = []

		for (const el of await viewGradePage.locator('#select2-drop').getByRole('option').all()) {
			const term = await el.textContent()
			const isTermAdded = grades.some(grade => grade.term === term)

			if (term === 'All Terms' || isTermAdded) {
				continue
			}

			el.click()

			const levelResponse = viewGradePage.waitForResponse((response) =>
				response.url().includes('/StudentSelfService/studentGrades/level'))

			await viewGradePage.locator('#level-readonly').getByText('Select a Course Level').click();
			await levelResponse

			await viewGradePage.locator('#GR').click();

			const selectedTermGpa = await viewGradePage.getByLabel('Selected Term').textContent()

			const gpaHours = await Promise.all((
				await viewGradePage.locator('td:nth-child(8)').all()).map(async el =>
					Number(await el.textContent() || 0)
				)
			)
			const qualityPoints = await Promise.all((
				await viewGradePage.locator('td:nth-child(9)').all()).map(async el =>
					Number(await el.textContent() || 0)
				)
			)

			const gpa = await viewGradePage.getByLabel('Institutional').textContent()

			grades.push({
				selectedTermGpa: Number(selectedTermGpa) || -1,
				gpa: Number(gpa) || 0,
				term: term,
				gpaHours: gpaHours,
				qualityPoints: qualityPoints,
				totalQualityPoints: qualityPoints.reduce((a, b) => a + b, 0),
				totalGpaHours: gpaHours.reduce((a, b) => a + b, 0)
			})

			console.log('GPA:', grades[ grades.length - 1 ])

			const termResponse = viewGradePage.waitForResponse((response) =>
				response.url().includes('/StudentSelfService/studentGrades/term'))

			await viewGradePage.getByRole('button', { name: 'Press to select Term.' }).click();
			await termResponse
		}

		const totalQualityPoints = grades.reduce((a, b) => a + b.totalQualityPoints || 0, 0)
		const totalGpaHours = grades.reduce((a, b) => a + b.totalGpaHours, 0)

		console.log('Total quality points:', totalQualityPoints)
		console.log('Total GPA Hours:', totalGpaHours)

		if (totalQualityPoints !== 0 && totalGpaHours !== 0) {
			console.log('Total GPA:', totalQualityPoints / totalGpaHours)
		}
	})
})
