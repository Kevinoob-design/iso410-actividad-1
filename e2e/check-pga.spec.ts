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
			selectedTerm: (number | null),
			gpa: (number | null),
			term: string | null
		}[] = []

		let totalGradePoints = 0;
		let totalCreditHours = 0;

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

			const selectedTerm = await viewGradePage.getByLabel('Selected Term').textContent()
			const gpa = await viewGradePage.getByLabel('Institutional').textContent()

			totalGradePoints += Number(selectedTerm) || 0;
			// totalGradePoints += selectedTerm * term.creditHours;
			// totalCreditHours += term.creditHours;

			grades.push({
				selectedTerm: Number(selectedTerm) || null,
				gpa: Number(gpa) || null,
				term: term
			})

			console.log('GPA:', grades[ grades.length - 1 ])

			const termResponse = viewGradePage.waitForResponse((response) =>
				response.url().includes('/StudentSelfService/studentGrades/term'))

			await viewGradePage.getByRole('button', { name: 'Press to select Term.' }).click();
			await termResponse
		}

		// if (totalCreditHours !== 0) {
		// 	console.log(totalGradePoints / totalCreditHours)
		// }

		console.log(totalGradePoints / grades.length)
		console.log('Grades:', grades)
	})
})
