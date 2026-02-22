import { describe, it, expect, beforeEach, vi } from 'vitest'
import { exportAllData, downloadJSON, exportAndDownload, importData, readJSONFile } from '../export.js'
import { addClient, getClient } from '../../db/clients.js'
import { addVehicule, getVehicule } from '../../db/vehicules.js'
import { addIntervention, getIntervention } from '../../db/interventions.js'
import { resetDBInstance } from '../../db/index.js'

describe('export utils', () => {
  beforeEach(() => {
    resetDBInstance()
  })

  describe('exportAllData', () => {
    it('should export empty data structure', async () => {
      const result = await exportAllData()

      expect(result.version).toBe('1.0')
      expect(result.exportedAt).toBeDefined()
      expect(result.data.clients).toEqual([])
      expect(result.data.vehicules).toEqual([])
      expect(result.data.interventions).toEqual([])
      expect(result.stats.totalClients).toBe(0)
      expect(result.stats.totalVehicules).toBe(0)
      expect(result.stats.totalInterventions).toBe(0)
    })

    it('should export all data with stats', async () => {
      const client = await addClient({ nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })
      const vehicule = await addVehicule({
        clientId: client.id,
        marque: 'Renault',
        immatriculation: 'AB-123-CD'
      })
      await addIntervention({
        vehiculeId: vehicule.id,
        type: 'entretien',
        description: 'Vidange'
      })

      const result = await exportAllData()

      expect(result.data.clients.length).toBe(1)
      expect(result.data.vehicules.length).toBe(1)
      expect(result.data.interventions.length).toBe(1)
      expect(result.stats.totalClients).toBe(1)
      expect(result.stats.totalVehicules).toBe(1)
      expect(result.stats.totalInterventions).toBe(1)
    })

    it('should include all client fields', async () => {
      await addClient({
        nom: 'Dupont',
        prenom: 'Jean',
        telephone: '0612345678',
        email: 'jean@test.com',
        adresse: '123 rue Test',
        notes: 'Notes client'
      })

      const result = await exportAllData()
      const exportedClient = result.data.clients[0]

      expect(exportedClient.nom).toBe('Dupont')
      expect(exportedClient.prenom).toBe('Jean')
      expect(exportedClient.telephone).toBe('0612345678')
      expect(exportedClient.email).toBe('jean@test.com')
      expect(exportedClient.adresse).toBe('123 rue Test')
      expect(exportedClient.notes).toBe('Notes client')
      expect(exportedClient.id).toBeDefined()
      expect(exportedClient.createdAt).toBeDefined()
      expect(exportedClient.updatedAt).toBeDefined()
    })

    it('should include relationships in export', async () => {
      const client = await addClient({ nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })
      const vehicule = await addVehicule({
        clientId: client.id,
        marque: 'Renault',
        immatriculation: 'AB-123-CD'
      })
      await addIntervention({
        vehiculeId: vehicule.id,
        type: 'entretien',
        description: 'Vidange'
      })

      const result = await exportAllData()

      expect(result.data.vehicules[0].clientId).toBe(client.id)
      expect(result.data.interventions[0].vehiculeId).toBe(vehicule.id)
    })
  })

  describe('downloadJSON', () => {
    it('should create and trigger download', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

      const data = { test: 'data' }
      downloadJSON(data, 'test.json')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test.json')
      expect(mockLink.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('should use default filename', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

      downloadJSON({ test: 'data' })

      expect(mockLink.download).toBe('suivi-client-export.json')

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })

  describe('exportAndDownload', () => {
    it('should export data and trigger download', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

      await addClient({ nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })

      const result = await exportAndDownload()

      expect(result.data.clients.length).toBe(1)
      expect(mockLink.click).toHaveBeenCalled()
      expect(mockLink.download).toMatch(/suivi-client-\d{4}-\d{2}-\d{2}\.json/)

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })

  describe('importData', () => {
    it('should throw error for invalid format', async () => {
      await expect(importData(null)).rejects.toThrow('Format de fichier invalide')
      await expect(importData({})).rejects.toThrow('Format de fichier invalide')
    })

    it('should import new clients', async () => {
      const jsonData = {
        data: {
          clients: [{
            id: 'test-client-1',
            nom: 'Dupont',
            prenom: 'Jean',
            telephone: '0612345678',
            updatedAt: new Date().toISOString()
          }],
          vehicules: [],
          interventions: []
        }
      }

      const result = await importData(jsonData)

      expect(result.clients).toBe(1)
      const imported = await getClient('test-client-1')
      expect(imported.nom).toBe('Dupont')
    })

    it('should import new vehicules', async () => {
      const client = await addClient({ nom: 'Test', prenom: 'User', telephone: '0600000000' })

      const jsonData = {
        data: {
          clients: [],
          vehicules: [{
            id: 'test-vehicule-1',
            clientId: client.id,
            marque: 'Renault',
            immatriculation: 'AB-123-CD',
            updatedAt: new Date().toISOString()
          }],
          interventions: []
        }
      }

      const result = await importData(jsonData)

      expect(result.vehicules).toBe(1)
      const imported = await getVehicule('test-vehicule-1')
      expect(imported.marque).toBe('Renault')
    })

    it('should import new interventions', async () => {
      const client = await addClient({ nom: 'Test', prenom: 'User', telephone: '0600000000' })
      const vehicule = await addVehicule({ clientId: client.id, marque: 'Renault', immatriculation: 'AB-123-CD' })

      const jsonData = {
        data: {
          clients: [],
          vehicules: [],
          interventions: [{
            id: 'test-intervention-1',
            vehiculeId: vehicule.id,
            type: 'entretien',
            description: 'Vidange',
            updatedAt: new Date().toISOString()
          }]
        }
      }

      const result = await importData(jsonData)

      expect(result.interventions).toBe(1)
      const imported = await getIntervention('test-intervention-1')
      expect(imported.description).toBe('Vidange')
    })

    it('should update existing items if incoming is newer', async () => {
      const client = await addClient({ nom: 'Original', prenom: 'User', telephone: '0600000000' })

      const jsonData = {
        data: {
          clients: [{
            id: client.id,
            nom: 'Updated',
            prenom: 'User',
            telephone: '0600000000',
            updatedAt: new Date(Date.now() + 10000).toISOString()
          }],
          vehicules: [],
          interventions: []
        }
      }

      const result = await importData(jsonData)

      expect(result.clients).toBe(1)
      const updated = await getClient(client.id)
      expect(updated.nom).toBe('Updated')
    })

    it('should not update existing items if incoming is older', async () => {
      const client = await addClient({ nom: 'Original', prenom: 'User', telephone: '0600000000' })

      const jsonData = {
        data: {
          clients: [{
            id: client.id,
            nom: 'OldVersion',
            prenom: 'User',
            telephone: '0600000000',
            updatedAt: new Date(Date.now() - 100000).toISOString()
          }],
          vehicules: [],
          interventions: []
        }
      }

      const result = await importData(jsonData)

      expect(result.clients).toBe(0)
      const unchanged = await getClient(client.id)
      expect(unchanged.nom).toBe('Original')
    })

    it('should skip items without id', async () => {
      const jsonData = {
        data: {
          clients: [{ nom: 'NoId', telephone: '0600000000' }],
          vehicules: [],
          interventions: []
        }
      }

      const result = await importData(jsonData)
      expect(result.clients).toBe(0)
    })

    it('should handle empty data arrays', async () => {
      const jsonData = {
        data: {}
      }

      const result = await importData(jsonData)

      expect(result.clients).toBe(0)
      expect(result.vehicules).toBe(0)
      expect(result.interventions).toBe(0)
    })
  })

  describe('readJSONFile', () => {
    it('should parse valid JSON file', async () => {
      const jsonContent = JSON.stringify({ test: 'data' })
      const file = new File([jsonContent], 'test.json', { type: 'application/json' })

      const result = await readJSONFile(file)

      expect(result).toEqual({ test: 'data' })
    })

    it('should reject invalid JSON', async () => {
      const file = new File(['not valid json'], 'test.json', { type: 'application/json' })

      await expect(readJSONFile(file)).rejects.toThrow('Fichier JSON invalide')
    })
  })
})
