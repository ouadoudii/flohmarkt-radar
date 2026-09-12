import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-11T12:00:00+02:00') })
  await page.goto('/')
})

test('detail dialog is immediately keyboard accessible and closes with Escape', async ({ page }) => {
  await page.getByLabel('Wo möchtest du stöbern?').fill('Stuttgart')
  await page.getByRole('button', { name: /Details ansehen/ }).click()

  const dialog = page.getByRole('dialog')
  const closeButton = dialog.getByRole('button', { name: 'Details schließen' })

  await expect(dialog).toBeVisible()
  await expect(closeButton).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
})
