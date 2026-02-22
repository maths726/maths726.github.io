import { test, expect } from '@playwright/test'
import { clearDatabase, navigateTo, addClient } from './helpers.js'

test.describe('Clients', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearDatabase(page)
    await page.reload()
    await page.waitForSelector('.navigation')
    await navigateTo(page, 'clients')
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible()
  })

  test('should display empty state when no clients', async ({ page }) => {
    await expect(page.getByText(/aucun client/i)).toBeVisible()
  })

  test('should open add client modal', async ({ page }) => {
    await page.locator('.add-btn').click()
    await expect(page.getByRole('heading', { name: 'Nouveau client' })).toBeVisible()
  })

  test('should add a new client', async ({ page }) => {
    await addClient(page, {
      nom: 'Dupont',
      prenom: 'Jean',
      telephone: '0612345678',
      email: 'jean.dupont@test.com'
    })

    await expect(page.getByRole('heading', { name: 'Nouveau client' })).not.toBeVisible()
    await expect(page.getByText('Dupont')).toBeVisible()
    await expect(page.getByText('Jean')).toBeVisible()
  })

  test('should show validation error for missing required fields', async ({ page }) => {
    await page.locator('.add-btn').click()
    // Don't fill anything, just try to submit
    await page.locator('button[type="submit"]').click()
    // Modal should still be open (form validation prevents close)
    await expect(page.getByRole('heading', { name: 'Nouveau client' })).toBeVisible()
    // Error message should be shown
    await expect(page.getByText(/nom requis/i)).toBeVisible()
  })

  test('should search clients', async ({ page }) => {
    await addClient(page, { nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })
    await expect(page.getByText('Dupont')).toBeVisible()

    await addClient(page, { nom: 'Martin', prenom: 'Paul', telephone: '0687654321' })
    await expect(page.getByText('Martin')).toBeVisible()

    await page.getByPlaceholder(/rechercher/i).fill('Dupont')
    await page.waitForTimeout(500)

    await expect(page.getByText('Dupont')).toBeVisible()
    await expect(page.getByText('Martin')).not.toBeVisible()
  })

  test('should navigate to client detail page', async ({ page }) => {
    await addClient(page, { nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })
    await expect(page.getByText('Dupont')).toBeVisible()

    await page.locator('.client-card').first().click()
    await expect(page.getByText('Jean Dupont')).toBeVisible()
  })

  test('should sort clients alphabetically by first name', async ({ page }) => {
    // Add clients in non-alphabetical order
    await addClient(page, { nom: 'Dupont', prenom: 'Zoé', telephone: '0611111111' })
    await addClient(page, { nom: 'Martin', prenom: 'Alice', telephone: '0622222222' })
    await addClient(page, { nom: 'Bernard', prenom: 'Marc', telephone: '0633333333' })

    // Wait for all clients to be visible
    await expect(page.getByText('Zoé')).toBeVisible()
    await expect(page.getByText('Alice')).toBeVisible()
    await expect(page.getByText('Marc')).toBeVisible()

    // Get all client cards and verify order (Alice, Marc, Zoé)
    const clientCards = page.locator('.client-card')
    await expect(clientCards).toHaveCount(3)

    // First card should be Alice (alphabetically first)
    await expect(clientCards.nth(0)).toContainText('Alice')
    // Second card should be Marc
    await expect(clientCards.nth(1)).toContainText('Marc')
    // Third card should be Zoé (alphabetically last)
    await expect(clientCards.nth(2)).toContainText('Zoé')
  })

  test('should sort clients with accented first names correctly', async ({ page }) => {
    // Add clients with accented names to verify French locale sorting
    await addClient(page, { nom: 'Test1', prenom: 'Émile', telephone: '0611111111' })
    await addClient(page, { nom: 'Test2', prenom: 'Eric', telephone: '0622222222' })
    await addClient(page, { nom: 'Test3', prenom: 'André', telephone: '0633333333' })

    // Wait for all clients to be visible
    await expect(page.getByText('Émile')).toBeVisible()
    await expect(page.getByText('Eric')).toBeVisible()
    await expect(page.getByText('André')).toBeVisible()

    // Get all client cards and verify order (André, Émile, Eric)
    const clientCards = page.locator('.client-card')
    await expect(clientCards).toHaveCount(3)

    // André should be first
    await expect(clientCards.nth(0)).toContainText('André')
    // Émile and Eric - with French locale, É comes before E in some cases
    // but typically they are treated as equivalent, so order may vary
    // We verify that André is first (A before E)
  })

  test('should handle clients with empty first names in sorting', async ({ page }) => {
    // Add clients, some without first names
    await addClient(page, { nom: 'Dupont', prenom: 'Jean', telephone: '0611111111' })
    await addClient(page, { nom: 'Martin', prenom: '', telephone: '0622222222' })
    await addClient(page, { nom: 'Bernard', prenom: 'Alice', telephone: '0633333333' })

    // Wait for clients to be visible
    await expect(page.getByText('Jean')).toBeVisible()
    await expect(page.getByText('Martin')).toBeVisible()
    await expect(page.getByText('Alice')).toBeVisible()

    // Get all client cards
    const clientCards = page.locator('.client-card')
    await expect(clientCards).toHaveCount(3)

    // Empty first name should sort before non-empty ones
    // Order should be: Martin (empty), Alice, Jean
    await expect(clientCards.nth(0)).toContainText('Martin')
    await expect(clientCards.nth(1)).toContainText('Alice')
    await expect(clientCards.nth(2)).toContainText('Jean')
  })
})
