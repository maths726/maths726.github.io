/**
 * Helper functions for E2E tests
 */

/**
 * Clear the IndexedDB database
 */
export async function clearDatabase(page) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      const req = indexedDB.deleteDatabase('suivi-client-db')
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
      req.onblocked = () => resolve()
    })
  })
}

/**
 * Navigate to a page using the navigation bar
 */
export async function navigateTo(page, pageName) {
  await page.waitForSelector('.navigation')
  await page.locator('.nav-item', { hasText: new RegExp(pageName, 'i') }).click()
}

/**
 * Add a client with the given data
 */
export async function addClient(page, { nom, prenom, telephone, email = '', adresse = '', notes = '' }) {
  await page.locator('.add-btn').click()
  await page.locator('#nom').fill(nom)
  await page.locator('#prenom').fill(prenom)
  await page.locator('#telephone').fill(telephone)
  if (email) await page.locator('#email').fill(email)
  if (adresse) await page.locator('#adresse').fill(adresse)
  if (notes) await page.locator('#notes').fill(notes)
  await page.locator('button[type="submit"]').click()
}

/**
 * Add a vehicule with the given data
 */
export async function addVehicule(page, { marque, modele = '', immatriculation, moisMiseEnCirculation = '', anneeMiseEnCirculation = '' }) {
  await page.locator('.vehicules-section .add-btn-small').click()
  await page.locator('#marque').fill(marque)
  if (modele) await page.locator('#modele').fill(modele)
  await page.locator('#immatriculation').fill(immatriculation)
  if (moisMiseEnCirculation) await page.locator('#moisMiseEnCirculation').selectOption(moisMiseEnCirculation)
  if (anneeMiseEnCirculation) await page.locator('#anneeMiseEnCirculation').fill(anneeMiseEnCirculation)
  await page.locator('button[type="submit"]').click()
}

/**
 * Add an intervention with the given data
 */
export async function addIntervention(page, { type, description, prixPieces = '', mainDoeuvre = '', marge = '' }) {
  await page.locator('.interventions-section .add-btn-small').click()
  await page.locator('#type').selectOption(type)
  await page.locator('#description').fill(description)
  if (prixPieces) await page.locator('#prixPieces').fill(prixPieces)
  if (mainDoeuvre) await page.locator('#mainDoeuvre').fill(mainDoeuvre)
  if (marge) await page.locator('#marge').fill(marge)
  await page.locator('button[type="submit"]').click()
}

/**
 * Change intervention status using status buttons
 */
export async function setInterventionStatus(page, status) {
  await page.locator(`.status-btn.status-${status}`).click()
}
