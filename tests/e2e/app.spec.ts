import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('understands the product and searches a region', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Lieblingsfund/i })).toBeVisible()
  await expect(page.getByText(/Demo-Modus/)).toBeVisible()
  await page.getByLabel('Wo möchtest du stöbern?').fill('Stuttgart')
  await expect(page.getByRole('heading', { name: 'Altstadt-Flohmarkt' })).toBeVisible()
  await expect(page.getByText('1 Markt gefunden')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Neckar-Schatzmarkt' })).toHaveCount(0)
})

test('favorite survives filter interaction even when localStorage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() { throw new Error('blocked') },
    })
  })
  await page.reload()
  await page.getByRole('button', { name: /Altstadt-Flohmarkt als Favorit speichern/ }).click()
  await expect(page.locator('.favorites-filter .count-bubble')).toHaveText('1')
  await page.getByRole('button', { name: /^Favoriten 1$/ }).click()
  await expect(page.getByRole('heading', { name: 'Altstadt-Flohmarkt' })).toBeVisible()
  await expect(page.locator('.market-card')).toHaveCount(1)
})

test('opens details and exposes a route action', async ({ page }) => {
  await page.getByRole('button', { name: /Details ansehen/ }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText(/Produktdemonstration/i)).toBeVisible()
  const route = dialog.getByRole('link', { name: 'Route öffnen' })
  await expect(route).toHaveAttribute('href', /google\.com\/maps\/dir/)
  await dialog.getByRole('button', { name: 'Details schließen' }).click()
  await expect(dialog).toHaveCount(0)
})

test('shows a useful empty state and can recover', async ({ page }) => {
  await page.getByLabel('Wo möchtest du stöbern?').fill('Nirgendwohausen')
  await expect(page.getByRole('heading', { name: 'Hier ist gerade nichts dabei.' })).toBeVisible()
  await page.getByRole('button', { name: 'Filter zurücksetzen' }).click()
  await expect(page.locator('.market-card')).toHaveCount(5)
})
