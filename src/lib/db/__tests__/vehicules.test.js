import { describe, it, expect, beforeEach } from 'vitest'
import { addVehicule, getVehicule, getAllVehicules, getVehiculesByClientId, updateVehicule, deleteVehicule, deleteVehiculesByClientId, searchVehicules } from '../vehicules.js'
import { addClient } from '../clients.js'
import { resetDBInstance } from '../index.js'

describe('vehicules db', () => {
  let clientId

  beforeEach(async () => {
    resetDBInstance()
    const client = await addClient({ nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })
    clientId = client.id
  })

  describe('addVehicule', () => {
    it('should add a new vehicule with required fields', async () => {
      const vehiculeData = {
        clientId,
        marque: 'Renault',
        modele: 'Clio',
        immatriculation: 'AB-123-CD'
      }
      const result = await addVehicule(vehiculeData)

      expect(result.id).toBeDefined()
      expect(result.clientId).toBe(clientId)
      expect(result.marque).toBe('Renault')
      expect(result.modele).toBe('Clio')
      expect(result.immatriculation).toBe('AB-123-CD')
      expect(result.createdAt).toBeDefined()
    })

    it('should uppercase immatriculation', async () => {
      const vehiculeData = {
        clientId,
        marque: 'Renault',
        immatriculation: 'ab-123-cd'
      }
      const result = await addVehicule(vehiculeData)

      expect(result.immatriculation).toBe('AB-123-CD')
    })

    it('should require clientId', async () => {
      const vehiculeData = { marque: 'Renault', immatriculation: 'AB-123-CD' }
      await expect(addVehicule(vehiculeData)).rejects.toThrow('Client requis')
    })

    it('should require marque', async () => {
      const vehiculeData = { clientId, immatriculation: 'AB-123-CD' }
      await expect(addVehicule(vehiculeData)).rejects.toThrow('Marque requise')
    })

    it('should require immatriculation', async () => {
      const vehiculeData = { clientId, marque: 'Renault' }
      await expect(addVehicule(vehiculeData)).rejects.toThrow('Immatriculation requise')
    })

    it('should handle optional fields', async () => {
      const vehiculeData = {
        clientId,
        marque: 'Renault',
        modele: 'Clio',
        immatriculation: 'AB-123-CD',
        annee: 2020,
        vin: 'VF1234567890',
        kilometrage: 50000,
        notes: 'Bon état'
      }
      const result = await addVehicule(vehiculeData)

      expect(result.annee).toBe(2020)
      expect(result.vin).toBe('VF1234567890')
      expect(result.kilometrage).toBe(50000)
      expect(result.notes).toBe('Bon état')
    })
  })

  describe('getVehicule', () => {
    it('should get a vehicule by id', async () => {
      const created = await addVehicule({
        clientId,
        marque: 'Renault',
        immatriculation: 'AB-123-CD'
      })

      const result = await getVehicule(created.id)
      expect(result.id).toBe(created.id)
      expect(result.marque).toBe('Renault')
    })

    it('should return undefined for non-existent id', async () => {
      const result = await getVehicule('non-existent-id')
      expect(result).toBeUndefined()
    })
  })

  describe('getAllVehicules', () => {
    it('should return empty array when no vehicules', async () => {
      const result = await getAllVehicules()
      expect(result).toEqual([])
    })

    it('should return all vehicules', async () => {
      await addVehicule({ clientId, marque: 'Renault', immatriculation: 'AB-123-CD' })
      await addVehicule({ clientId, marque: 'Peugeot', immatriculation: 'EF-456-GH' })

      const result = await getAllVehicules()
      expect(result.length).toBe(2)
    })
  })

  describe('getVehiculesByClientId', () => {
    it('should return vehicules for a specific client', async () => {
      const client2 = await addClient({ nom: 'Martin', prenom: 'Paul', telephone: '0687654321' })

      await addVehicule({ clientId, marque: 'Renault', immatriculation: 'AB-123-CD' })
      await addVehicule({ clientId, marque: 'Peugeot', immatriculation: 'EF-456-GH' })
      await addVehicule({ clientId: client2.id, marque: 'Citroen', immatriculation: 'IJ-789-KL' })

      const result = await getVehiculesByClientId(clientId)
      expect(result.length).toBe(2)
      expect(result.every(v => v.clientId === clientId)).toBe(true)
    })

    it('should return empty array for client with no vehicules', async () => {
      const result = await getVehiculesByClientId('no-vehicules-client')
      expect(result).toEqual([])
    })
  })

  describe('updateVehicule', () => {
    it('should update vehicule fields', async () => {
      const created = await addVehicule({
        clientId,
        marque: 'Renault',
        immatriculation: 'AB-123-CD'
      })

      const result = await updateVehicule(created.id, { kilometrage: 60000 })

      expect(result.kilometrage).toBe(60000)
      expect(result.marque).toBe('Renault')
    })

    it('should throw error for non-existent vehicule', async () => {
      await expect(updateVehicule('non-existent', { kilometrage: 100 })).rejects.toThrow('Véhicule non trouvé')
    })

    it('should preserve clientId', async () => {
      const created = await addVehicule({
        clientId,
        marque: 'Renault',
        immatriculation: 'AB-123-CD'
      })

      const result = await updateVehicule(created.id, { clientId: 'other-client' })
      expect(result.clientId).toBe(clientId)
    })
  })

  describe('deleteVehicule', () => {
    it('should delete a vehicule', async () => {
      const created = await addVehicule({
        clientId,
        marque: 'Renault',
        immatriculation: 'AB-123-CD'
      })

      await deleteVehicule(created.id)

      const result = await getVehicule(created.id)
      expect(result).toBeUndefined()
    })
  })

  describe('deleteVehiculesByClientId', () => {
    it('should delete all vehicules for a client', async () => {
      await addVehicule({ clientId, marque: 'Renault', immatriculation: 'AB-123-CD' })
      await addVehicule({ clientId, marque: 'Peugeot', immatriculation: 'EF-456-GH' })

      await deleteVehiculesByClientId(clientId)

      const result = await getVehiculesByClientId(clientId)
      expect(result).toEqual([])
    })
  })

  describe('searchVehicules', () => {
    it('should return all vehicules when query is empty', async () => {
      await addVehicule({ clientId, marque: 'Renault', immatriculation: 'AB-123-CD' })
      await addVehicule({ clientId, marque: 'Peugeot', immatriculation: 'EF-456-GH' })

      const result = await searchVehicules('')
      expect(result.length).toBe(2)
    })

    it('should return all vehicules when query is null', async () => {
      await addVehicule({ clientId, marque: 'Renault', immatriculation: 'AB-123-CD' })

      const result = await searchVehicules(null)
      expect(result.length).toBe(1)
    })

    it('should search by marque', async () => {
      await addVehicule({ clientId, marque: 'Renault', immatriculation: 'AB-123-CD' })
      await addVehicule({ clientId, marque: 'Peugeot', immatriculation: 'EF-456-GH' })

      const result = await searchVehicules('renault')
      expect(result.length).toBe(1)
      expect(result[0].marque).toBe('Renault')
    })

    it('should search by immatriculation', async () => {
      await addVehicule({ clientId, marque: 'Renault', immatriculation: 'AB-123-CD' })
      await addVehicule({ clientId, marque: 'Peugeot', immatriculation: 'EF-456-GH' })

      const result = await searchVehicules('456')
      expect(result.length).toBe(1)
      expect(result[0].immatriculation).toBe('EF-456-GH')
    })

    it('should search by modele', async () => {
      await addVehicule({ clientId, marque: 'Renault', modele: 'Clio', immatriculation: 'AB-123-CD' })
      await addVehicule({ clientId, marque: 'Peugeot', modele: '308', immatriculation: 'EF-456-GH' })

      const result = await searchVehicules('clio')
      expect(result.length).toBe(1)
      expect(result[0].modele).toBe('Clio')
    })

    it('should search by VIN', async () => {
      await addVehicule({ clientId, marque: 'Renault', immatriculation: 'AB-123-CD', vin: 'VF1234567890' })
      await addVehicule({ clientId, marque: 'Peugeot', immatriculation: 'EF-456-GH', vin: 'WP9876543210' })

      const result = await searchVehicules('VF123')
      expect(result.length).toBe(1)
      expect(result[0].vin).toBe('VF1234567890')
    })

    it('should be case insensitive', async () => {
      await addVehicule({ clientId, marque: 'Renault', immatriculation: 'AB-123-CD' })

      const resultLower = await searchVehicules('renault')
      const resultUpper = await searchVehicules('RENAULT')
      const resultMixed = await searchVehicules('ReNaUlT')

      expect(resultLower.length).toBe(1)
      expect(resultUpper.length).toBe(1)
      expect(resultMixed.length).toBe(1)
    })

    it('should return empty array when no matches', async () => {
      await addVehicule({ clientId, marque: 'Renault', immatriculation: 'AB-123-CD' })

      const result = await searchVehicules('toyota')
      expect(result).toEqual([])
    })
  })
})
