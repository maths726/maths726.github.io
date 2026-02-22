import { test, expect } from '@playwright/test'
import { clearDatabase, navigateTo, addClient, addVehicule } from './helpers.js'

test.describe('Véhicules', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearDatabase(page)
    await page.reload()
    await page.waitForSelector('.navigation')
  })

  test('should display empty state when no vehicules', async ({ page }) => {
    await navigateTo(page, 'vehicules')
    // Text without accents as per actual app
    await expect(page.getByText(/aucun vehicule/i)).toBeVisible()
  })

  test('should add a vehicule from client detail page', async ({ page }) => {
    await navigateTo(page, 'clients')
    await addClient(page, { nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })
    await expect(page.getByText('Dupont')).toBeVisible()

    await page.locator('.client-card').first().click()
    await addVehicule(page, { marque: 'Renault', modele: 'Clio', immatriculation: 'AB-123-CD' })

    await expect(page.getByText('Renault')).toBeVisible()
    await expect(page.getByText('Clio')).toBeVisible()
    await expect(page.getByText('AB-123-CD')).toBeVisible()
  })

  test('should display vehicule in vehicules list', async ({ page }) => {
    await navigateTo(page, 'clients')
    await addClient(page, { nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })
    await expect(page.getByText('Dupont')).toBeVisible()

    await page.locator('.client-card').first().click()
    await addVehicule(page, { marque: 'Peugeot', modele: '308', immatriculation: 'EF-456-GH' })
    await expect(page.getByText('Peugeot')).toBeVisible()

    await navigateTo(page, 'vehicules')
    await expect(page.getByText('Peugeot')).toBeVisible()
    await expect(page.getByText('EF-456-GH')).toBeVisible()
  })

  test('should search vehicules by immatriculation', async ({ page }) => {
    await navigateTo(page, 'clients')
    await addClient(page, { nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })
    await expect(page.getByText('Dupont')).toBeVisible()

    await page.locator('.client-card').first().click()

    // Add first vehicule
    await addVehicule(page, { marque: 'Renault', modele: 'Clio', immatriculation: 'AB-123-CD' })
    await expect(page.getByText('AB-123-CD')).toBeVisible()

    // Wait for modal to fully close
    await page.waitForTimeout(300)

    // Add second vehicule
    await addVehicule(page, { marque: 'Peugeot', modele: '308', immatriculation: 'EF-456-GH' })
    await expect(page.getByText('EF-456-GH')).toBeVisible()

    await navigateTo(page, 'vehicules')
    await page.getByPlaceholder(/rechercher/i).fill('AB-123')
    await page.waitForTimeout(500)

    await expect(page.getByText('Renault')).toBeVisible()
    await expect(page.getByText('Peugeot')).not.toBeVisible()
  })
})
