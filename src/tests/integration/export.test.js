import { describe, it, expect, beforeEach } from 'vitest'
import { exportAllData } from '../../lib/utils/export.js'
import { addClient } from '../../lib/db/clients.js'
import { addVehicule } from '../../lib/db/vehicules.js'
import { addIntervention } from '../../lib/db/interventions.js'
import { resetDBInstance } from '../../lib/db/index.js'

describe('Export integration', () => {
  beforeEach(() => {
    resetDBInstance()
  })

  describe('Full data export', () => {
    it('should export complete database with all relationships', async () => {
      // Create test data
      const client1 = await addClient({
        nom: 'Dupont',
        prenom: 'Jean',
        telephone: '0612345678',
        email: 'jean@test.com'
      })

      const client2 = await addClient({
        nom: 'Martin',
        prenom: 'Paul',
        telephone: '0687654321'
      })

      const vehicule1 = await addVehicule({
        clientId: client1.id,
        marque: 'Renault',
        modele: 'Clio',
        immatriculation: 'AB-123-CD',
        annee: 2020,
        kilometrage: 50000
      })

      const vehicule2 = await addVehicule({
        clientId: client1.id,
        marque: 'Peugeot',
        modele: '308',
        immatriculation: 'EF-456-GH'
      })

      const vehicule3 = await addVehicule({
        clientId: client2.id,
        marque: 'Citroen',
        modele: 'C3',
        immatriculation: 'IJ-789-KL'
      })

      await addIntervention({
        vehiculeId: vehicule1.id,
        type: 'entretien',
        description: 'Vidange',
        date: '2024-01-15',
        cout: 80
      })

      await addIntervention({
        vehiculeId: vehicule1.id,
        type: 'reparation',
        description: 'Freins',
        date: '2024-02-20',
        cout: 250
      })

      await addIntervention({
        vehiculeId: vehicule3.id,
        type: 'reparation',
        description: 'Voyant moteur',
        statut: 'en_cours'
      })

      // Export
      const exportData = await exportAllData()

      // Verify structure
      expect(exportData.version).toBe('1.0')
      expect(exportData.exportedAt).toBeDefined()
      expect(new Date(exportData.exportedAt)).toBeInstanceOf(Date)

      // Verify stats
      expect(exportData.stats.totalClients).toBe(2)
      expect(exportData.stats.totalVehicules).toBe(3)
      expect(exportData.stats.totalInterventions).toBe(3)

      // Verify clients
      expect(exportData.data.clients.length).toBe(2)
      const exportedClient1 = exportData.data.clients.find(c => c.id === client1.id)
      expect(exportedClient1).toBeDefined()
      expect(exportedClient1.nom).toBe('Dupont')
      expect(exportedClient1.email).toBe('jean@test.com')

      // Verify vehicules
      expect(exportData.data.vehicules.length).toBe(3)
      const exportedVehicule1 = exportData.data.vehicules.find(v => v.id === vehicule1.id)
      expect(exportedVehicule1).toBeDefined()
      expect(exportedVehicule1.clientId).toBe(client1.id)
      expect(exportedVehicule1.marque).toBe('Renault')
      expect(exportedVehicule1.kilometrage).toBe(50000)

      // Verify interventions
      expect(exportData.data.interventions.length).toBe(3)
      const vidangeIntervention = exportData.data.interventions.find(i => i.description === 'Vidange')
      expect(vidangeIntervention).toBeDefined()
      expect(vidangeIntervention.vehiculeId).toBe(vehicule1.id)
      expect(vidangeIntervention.cout).toBe(80)
    })

    it('should export valid JSON structure', async () => {
      await addClient({
        nom: 'Test',
        prenom: 'User',
        telephone: '0600000000'
      })

      const exportData = await exportAllData()

      // Verify can be stringified and parsed
      const jsonString = JSON.stringify(exportData)
      const parsed = JSON.parse(jsonString)

      expect(parsed.version).toBe('1.0')
      expect(parsed.data.clients.length).toBe(1)
    })

    it('should handle empty database', async () => {
      const exportData = await exportAllData()

      expect(exportData.data.clients).toEqual([])
      expect(exportData.data.vehicules).toEqual([])
      expect(exportData.data.interventions).toEqual([])
      expect(exportData.stats.totalClients).toBe(0)
      expect(exportData.stats.totalVehicules).toBe(0)
      expect(exportData.stats.totalInterventions).toBe(0)
    })

    it('should include all intervention fields', async () => {
      const client = await addClient({
        nom: 'Test',
        prenom: 'Client',
        telephone: '0600000000'
      })

      const vehicule = await addVehicule({
        clientId: client.id,
        marque: 'Test',
        immatriculation: 'XX-000-XX'
      })

      await addIntervention({
        vehiculeId: vehicule.id,
        type: 'reparation',
        description: 'Test intervention',
        date: '2024-06-15',
        kilometrage: 100000,
        cout: 550,
        pieces: ['Piece 1', 'Piece 2', 'Piece 3'],
        statut: 'termine',
        notes: 'Notes de test'
      })

      const exportData = await exportAllData()
      const intervention = exportData.data.interventions[0]

      expect(intervention.type).toBe('reparation')
      expect(intervention.description).toBe('Test intervention')
      expect(intervention.date).toBe('2024-06-15')
      expect(intervention.kilometrage).toBe(100000)
      expect(intervention.cout).toBe(550)
      expect(intervention.pieces).toEqual(['Piece 1', 'Piece 2', 'Piece 3'])
      expect(intervention.statut).toBe('termine')
      expect(intervention.notes).toBe('Notes de test')
    })
  })
})
