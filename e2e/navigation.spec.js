import { test, expect } from '@playwright/test'
import { navigateTo } from './helpers.js'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.navigation')
  })

  test('should display the dashboard on home page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()
  })

  test('should navigate to clients page', async ({ page }) => {
    await navigateTo(page, 'clients')
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible()
  })

  test('should navigate to vehicules page', async ({ page }) => {
    await navigateTo(page, 'vehicules')
    // Title without accent as per actual app
    await expect(page.getByRole('heading', { name: 'Vehicules' })).toBeVisible()
  })

  test('should navigate to parametres page', async ({ page }) => {
    await navigateTo(page, 'parametres')
    await expect(page.getByRole('heading', { name: 'Paramètres' })).toBeVisible()
  })

  test('should show empty state on dashboard when no interventions', async ({ page }) => {
    await expect(page.getByText('Aucune intervention en cours')).toBeVisible()
  })
})
