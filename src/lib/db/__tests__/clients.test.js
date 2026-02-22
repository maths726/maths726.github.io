import { describe, it, expect, beforeEach } from 'vitest'
import { addClient, getClient, getAllClients, updateClient, deleteClient, searchClients } from '../clients.js'
import { resetDBInstance } from '../index.js'

describe('clients db', () => {
  beforeEach(() => {
    resetDBInstance()
  })

  describe('addClient', () => {
    it('should add a new client with required fields', async () => {
      const clientData = { nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' }
      const result = await addClient(clientData)

      expect(result.id).toBeDefined()
      expect(result.nom).toBe('Dupont')
      expect(result.prenom).toBe('Jean')
      expect(result.telephone).toBe('0612345678')
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    it('should trim whitespace from fields', async () => {
      const clientData = { nom: '  Dupont  ', prenom: '  Jean  ', telephone: '  0612345678  ' }
      const result = await addClient(clientData)

      expect(result.nom).toBe('Dupont')
      expect(result.prenom).toBe('Jean')
      expect(result.telephone).toBe('0612345678')
    })

    it('should require nom field', async () => {
      const clientData = { prenom: 'Jean', telephone: '0612345678' }
      await expect(addClient(clientData)).rejects.toThrow('Nom requis')
    })

    it('should require telephone field', async () => {
      const clientData = { nom: 'Dupont', prenom: 'Jean' }
      await expect(addClient(clientData)).rejects.toThrow('Téléphone requis')
    })

    it('should handle optional fields', async () => {
      const clientData = {
        nom: 'Dupont',
        prenom: 'Jean',
        telephone: '0612345678',
        email: 'jean@example.com',
        adresse: '123 rue Test',
        notes: 'Client fidèle'
      }
      const result = await addClient(clientData)

      expect(result.email).toBe('jean@example.com')
      expect(result.adresse).toBe('123 rue Test')
      expect(result.notes).toBe('Client fidèle')
    })
  })

  describe('getClient', () => {
    it('should get a client by id', async () => {
      const clientData = { nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' }
      const created = await addClient(clientData)

      const result = await getClient(created.id)
      expect(result.id).toBe(created.id)
      expect(result.nom).toBe('Dupont')
    })

    it('should return undefined for non-existent id', async () => {
      const result = await getClient('non-existent-id')
      expect(result).toBeUndefined()
    })
  })

  describe('getAllClients', () => {
    it('should return empty array when no clients', async () => {
      const result = await getAllClients()
      expect(result).toEqual([])
    })

    it('should return all clients sorted by createdAt desc', async () => {
      const client1 = await addClient({ nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10))
      const client2 = await addClient({ nom: 'Martin', prenom: 'Paul', telephone: '0687654321' })

      const result = await getAllClients()
      expect(result.length).toBe(2)
      // Most recent (Martin) should be first
      expect(result[0].id).toBe(client2.id)
      expect(result[1].id).toBe(client1.id)
    })
  })

  describe('updateClient', () => {
    it('should update client fields', async () => {
      const created = await addClient({ nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })

      const result = await updateClient(created.id, { nom: 'Durand', email: 'new@email.com' })

      expect(result.nom).toBe('Durand')
      expect(result.email).toBe('new@email.com')
      expect(result.prenom).toBe('Jean')
      expect(result.updatedAt).not.toBe(created.updatedAt)
    })

    it('should throw error for non-existent client', async () => {
      await expect(updateClient('non-existent', { nom: 'Test' })).rejects.toThrow('Client non trouvé')
    })

    it('should preserve id and createdAt', async () => {
      const created = await addClient({ nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })

      const result = await updateClient(created.id, { id: 'new-id', createdAt: 'new-date' })

      expect(result.id).toBe(created.id)
      expect(result.createdAt).toBe(created.createdAt)
    })
  })

  describe('deleteClient', () => {
    it('should delete a client', async () => {
      const created = await addClient({ nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })

      await deleteClient(created.id)

      const result = await getClient(created.id)
      expect(result).toBeUndefined()
    })
  })

  describe('searchClients', () => {
    beforeEach(async () => {
      await addClient({ nom: 'Dupont', prenom: 'Jean', telephone: '0612345678', email: 'jean@test.com' })
      await addClient({ nom: 'Martin', prenom: 'Paul', telephone: '0687654321', email: 'paul@test.com' })
      await addClient({ nom: 'Durand', prenom: 'Marie', telephone: '0611111111' })
    })

    it('should return all clients for empty query', async () => {
      const result = await searchClients('')
      expect(result.length).toBe(3)
    })

    it('should search by nom', async () => {
      const result = await searchClients('dupont')
      expect(result.length).toBe(1)
      expect(result[0].nom).toBe('Dupont')
    })

    it('should search by prenom', async () => {
      const result = await searchClients('marie')
      expect(result.length).toBe(1)
      expect(result[0].prenom).toBe('Marie')
    })

    it('should search by telephone', async () => {
      const result = await searchClients('0687')
      expect(result.length).toBe(1)
      expect(result[0].nom).toBe('Martin')
    })

    it('should search by email', async () => {
      const result = await searchClients('jean@test')
      expect(result.length).toBe(1)
      expect(result[0].nom).toBe('Dupont')
    })

    it('should be case insensitive', async () => {
      const result = await searchClients('DUPONT')
      expect(result.length).toBe(1)
    })

    it('should search partial matches', async () => {
      const result = await searchClients('du')
      expect(result.length).toBe(2)
    })
  })
})
