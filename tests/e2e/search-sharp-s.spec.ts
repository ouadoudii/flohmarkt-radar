import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-12T12:00:00+02:00') })
  await page.goto('/')
})

test('search treats ss and ß as equivalent in street names', async ({ page }) => {
  await page.getByLabel('Wo möchtest du stöbern?').fill('Grossherzog Friedrich Strasse')

  await expect(page.getByRole('heading', { name: 'Kinder-Basar Litzelstetten' })).toBeVisible()
  await expect(page.getByText('1 Markt gefunden')).toBeVisible()
})
