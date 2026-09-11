import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-11T12:00:00+02:00') })
  await page.goto('/')
})

test('understands the product and searches a region', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Lieblingsfund/i })).toBeVisible()
  await expect(page.getByText(/Jetzt mit echten Terminen/)).toBeVisible()
  await page.getByLabel('Wo möchtest du stöbern?').fill('Stuttgart')
  await expect(page.getByRole('heading', { name: 'Altstadt-Flohmarkt' })).toBeVisible()
  await expect(page.getByText('1 Markt gefunden')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Neckar-Schatzmarkt' })).toHaveCount(0)
})

test('shows verified markets with their official source', async ({ page }) => {
  await page.getByLabel('Wo möchtest du stöbern?').fill('Radolfzell')
  await expect(page.getByRole('heading', { name: 'Flohmarkt beim 48. Radolfzeller Altstadtfest' })).toBeVisible()
  await expect(page.locator('.verified-badge')).toHaveText('✓ Verifiziert')

  await page.getByRole('button', { name: /Details ansehen/ }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  const source = dialog.getByRole('link', { name: 'Radolfzell Tourismus & Stadtmarketing' })
  await expect(source).toHaveAttribute('href', /radolfzell-tourismus\.de/)
  await expect(dialog.getByText(/Quelle zuletzt am 11\.09\.2026 geprüft/)).toBeVisible()
})

test('sorts nearby markets by distance after location is enabled', async ({ page, context }) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: 48.4914, longitude: 9.2107 })
  await page.reload()

  await page.getByRole('button', { name: /In meiner Nähe suchen/ }).click()
  await expect(page.getByText(/Standort aktiv/)).toBeVisible()
  await expect(page.locator('.market-card h3').first()).toHaveText('Reutlinger Fundgrube')
  await expect(page.locator('.market-card h3').nth(1)).toHaveText('Franzviertel-Flohmarkt')
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

test('opens demo details and exposes a route action', async ({ page }) => {
  await page.getByLabel('Wo möchtest du stöbern?').fill('Stuttgart')
  await page.getByRole('button', { name: /Details ansehen/ }).click()
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
  expect(await page.locator('.market-card').count()).toBeGreaterThanOrEqual(5)
})
