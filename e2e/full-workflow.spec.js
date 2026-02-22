import { test, expect } from '@playwright/test'
import { clearDatabase, navigateTo, addClient, addVehicule, addIntervention, setInterventionStatus } from './helpers.js'

test.describe('Full Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearDatabase(page)
    await page.reload()
    await page.waitForSelector('.navigation')
  })

  test('complete customer journey: client -> vehicule -> intervention', async ({ page }) => {
    // Step 1: Start on dashboard
    await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()
    await expect(page.getByText('Aucune intervention en cours')).toBeVisible()

    // Step 2: Create a new client
    await navigateTo(page, 'clients')
    await addClient(page, {
      nom: 'Martin',
      prenom: 'Sophie',
      telephone: '0698765432',
      email: 'sophie.martin@email.fr',
      adresse: '15 rue de la Paix, 75001 Paris',
      notes: 'Cliente fidèle depuis 2020'
    })

    await expect(page.getByText('Martin')).toBeVisible()
    await expect(page.getByText('Sophie')).toBeVisible()

    // Step 3: Navigate to client detail and add vehicule
    await page.locator('.client-card').first().click()
    await expect(page.getByText('sophie.martin@email.fr')).toBeVisible()

    await addVehicule(page, {
      marque: 'Citroën',
      modele: 'C3',
      immatriculation: 'FG-789-HI',
      moisMiseEnCirculation: '6',
      anneeMiseEnCirculation: '2019'
    })

    await expect(page.getByText('Citroën')).toBeVisible()
    await expect(page.getByText('C3')).toBeVisible()
    await expect(page.getByText('FG-789-HI')).toBeVisible()

    // Step 4: Navigate to vehicule detail and add intervention
    await page.locator('.vehicule-card').first().click()

    await addIntervention(page, {
      type: 'entretien',
      description: 'Révision 90 000 km - Vidange, filtres, contrôle freins',
      prixPieces: '120',
      mainDoeuvre: '80',
      marge: '25'
    })

    await expect(page.getByText(/Révision 90 000 km/)).toBeVisible()

    // Step 5: Verify dashboard shows the intervention
    await navigateTo(page, 'accueil')

    await expect(page.getByText(/Révision 90 000 km/)).toBeVisible()
    await expect(page.getByText('Citroën C3')).toBeVisible()
    await expect(page.getByText('Sophie Martin')).toBeVisible()
    // Total: 120 + 80 + 25 = 225€
    await expect(page.getByText(/225.*€/)).toBeVisible()

    // Step 6: Complete the intervention
    await page.locator('.intervention-card').first().click()
    await setInterventionStatus(page, 'termine')
    await page.locator('button[type="submit"]').click()

    // Step 7: Dashboard should now be empty
    await expect(page.getByText('Aucune intervention en cours')).toBeVisible()
  })

  test('multiple clients with multiple vehicules', async ({ page }) => {
    // Create first client
    await navigateTo(page, 'clients')
    await addClient(page, { nom: 'Client1', prenom: 'Test', telephone: '0600000001' })
    await expect(page.getByText('Client1')).toBeVisible()

    // Create second client
    await addClient(page, { nom: 'Client2', prenom: 'Test', telephone: '0600000002' })
    await expect(page.getByText('Client2')).toBeVisible()

    // Add vehicule to first client
    await page.getByText('Client1').click()
    await addVehicule(page, { marque: 'Renault', immatriculation: 'AA-001-AA' })
    await expect(page.getByText('AA-001-AA')).toBeVisible()

    // Go back and add vehicule to second client
    await navigateTo(page, 'clients')
    await page.getByText('Client2').click()
    await addVehicule(page, { marque: 'Peugeot', immatriculation: 'BB-002-BB' })
    await expect(page.getByText('BB-002-BB')).toBeVisible()

    // Verify both vehicules appear in vehicules list
    await navigateTo(page, 'vehicules')
    await expect(page.getByText('AA-001-AA')).toBeVisible()
    await expect(page.getByText('BB-002-BB')).toBeVisible()
  })

  test('data persists after page refresh', async ({ page }) => {
    await navigateTo(page, 'clients')
    await addClient(page, { nom: 'PersistTest', prenom: 'Data', telephone: '0611111111' })
    await expect(page.getByText('PersistTest')).toBeVisible()

    // Refresh page
    await page.reload()
    await page.waitForSelector('.navigation')

    // Navigate to clients
    await navigateTo(page, 'clients')

    // Data should still be there
    await expect(page.getByText('PersistTest')).toBeVisible()
  })
})
