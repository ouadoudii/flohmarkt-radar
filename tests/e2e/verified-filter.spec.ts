import { expect, test } from '@playwright/test'

test('filters the discovery list to verified markets only', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-11T12:00:00+02:00') })
  await page.goto('/')

  const verifiedOnly = page.getByRole('button', { name: '✓ Nur verifiziert' })
  await verifiedOnly.click()

  await expect(verifiedOnly).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('2 Märkte gefunden')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Flohmarkt beim 48. Radolfzeller Altstadtfest' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Flohmarkt am Georg-Elser-Platz' })).toBeVisible()
  await expect(page.locator('.demo-badge')).toHaveCount(0)

  await verifiedOnly.click()
  await expect(verifiedOnly).toHaveAttribute('aria-pressed', 'false')
  expect(await page.locator('.market-card').count()).toBeGreaterThan(2)
})
