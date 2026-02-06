import { describe, it, expect, beforeEach, vi } from 'vitest'
import { exportAllData, downloadJSON, exportAndDownload } from '../export.js'
import { addClient } from '../../db/clients.js'
import { addVehicule } from '../../db/vehicules.js'
import { addIntervention } from '../../db/interventions.js'
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
})
