import { test, expect } from '@playwright/test'
import { clearDatabase, navigateTo, addClient, addVehicule, addIntervention, setInterventionStatus } from './helpers.js'

test.describe('Interventions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearDatabase(page)
    await page.reload()
    await page.waitForSelector('.navigation')

    // Setup: create a client and vehicule
    await navigateTo(page, 'clients')
    await addClient(page, { nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })
    await expect(page.getByText('Dupont')).toBeVisible()

    await page.locator('.client-card').first().click()
    await addVehicule(page, { marque: 'Renault', modele: 'Clio', immatriculation: 'AB-123-CD' })
    await expect(page.getByText('AB-123-CD')).toBeVisible()
  })

  test('should add an intervention from vehicule detail', async ({ page }) => {
    await page.locator('.vehicule-card').first().click()
    await addIntervention(page, {
      type: 'entretien',
      description: 'Vidange huile moteur',
      prixPieces: '50',
      mainDoeuvre: '30'
    })

    await expect(page.getByText('Vidange huile moteur')).toBeVisible()
    await expect(page.getByText(/entretien/i)).toBeVisible()
  })

  test('should display intervention on dashboard when status is en_cours', async ({ page }) => {
    await page.locator('.vehicule-card').first().click()
    await addIntervention(page, {
      type: 'reparation',
      description: 'Changement plaquettes de frein'
    })
    await expect(page.getByText('Changement plaquettes de frein')).toBeVisible()

    await navigateTo(page, 'accueil')
    await expect(page.getByText('Changement plaquettes de frein')).toBeVisible()
  })

  test('should update intervention status to termine', async ({ page }) => {
    await page.locator('.vehicule-card').first().click()
    await addIntervention(page, {
      type: 'entretien',
      description: 'Révision générale'
    })
    await expect(page.getByText('Révision générale')).toBeVisible()

    await page.locator('.intervention-card').first().click()
    await setInterventionStatus(page, 'termine')
    await page.locator('button[type="submit"]').click()

    await navigateTo(page, 'accueil')
    await expect(page.getByText('Aucune intervention en cours')).toBeVisible()
  })

  test('should display price correctly with marge and main doeuvre', async ({ page }) => {
    await page.locator('.vehicule-card').first().click()
    await addIntervention(page, {
      type: 'reparation',
      description: 'Remplacement embrayage',
      prixPieces: '400',
      mainDoeuvre: '150',
      marge: '50'
    })

    // Total: 400 + 150 + 50 = 600€
    await expect(page.getByText(/600.*€/)).toBeVisible()
  })

  test('should edit an existing intervention', async ({ page }) => {
    await page.locator('.vehicule-card').first().click()
    await addIntervention(page, {
      type: 'entretien',
      description: 'Vidange'
    })
    await expect(page.getByText('Vidange')).toBeVisible()

    await page.locator('.intervention-card').first().click()
    await page.locator('#description').fill('Vidange + filtre à huile')
    await page.locator('button[type="submit"]').click()

    await expect(page.getByText('Vidange + filtre à huile')).toBeVisible()
  })
})
