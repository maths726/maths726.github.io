import { describe, it, expect, beforeEach } from 'vitest'
import { addIntervention, getIntervention, getAllInterventions, getInterventionsByVehiculeId, updateIntervention, deleteIntervention, deleteInterventionsByVehiculeId, TYPES_INTERVENTION, STATUTS_INTERVENTION } from '../interventions.js'
import { addVehicule } from '../vehicules.js'
import { addClient } from '../clients.js'
import { resetDBInstance } from '../index.js'

describe('interventions db', () => {
  let vehiculeId

  beforeEach(async () => {
    resetDBInstance()
    const client = await addClient({ nom: 'Dupont', prenom: 'Jean', telephone: '0612345678' })
    const vehicule = await addVehicule({
      clientId: client.id,
      marque: 'Renault',
      immatriculation: 'AB-123-CD'
    })
    vehiculeId = vehicule.id
  })

  describe('constants', () => {
    it('should export TYPES_INTERVENTION', () => {
      expect(TYPES_INTERVENTION).toBeDefined()
      expect(TYPES_INTERVENTION.length).toBe(2)
      expect(TYPES_INTERVENTION.some(t => t.value === 'entretien')).toBe(true)
      expect(TYPES_INTERVENTION.some(t => t.value === 'reparation')).toBe(true)
    })

    it('should export STATUTS_INTERVENTION', () => {
      expect(STATUTS_INTERVENTION).toBeDefined()
      expect(STATUTS_INTERVENTION.length).toBe(2)
      expect(STATUTS_INTERVENTION.some(s => s.value === 'en_cours')).toBe(true)
      expect(STATUTS_INTERVENTION.some(s => s.value === 'termine')).toBe(true)
    })
  })

  describe('addIntervention', () => {
    it('should add a new intervention with required fields', async () => {
      const interventionData = {
        vehiculeId,
        type: 'entretien',
        description: 'Vidange huile moteur'
      }
      const result = await addIntervention(interventionData)

      expect(result.id).toBeDefined()
      expect(result.vehiculeId).toBe(vehiculeId)
      expect(result.type).toBe('entretien')
      expect(result.description).toBe('Vidange huile moteur')
      expect(result.statut).toBe('en_cours')
      expect(result.createdAt).toBeDefined()
    })

    it('should require vehiculeId', async () => {
      const interventionData = { type: 'entretien', description: 'Test' }
      await expect(addIntervention(interventionData)).rejects.toThrow('Véhicule requis')
    })

    it('should require type', async () => {
      const interventionData = { vehiculeId, description: 'Test' }
      await expect(addIntervention(interventionData)).rejects.toThrow('Type requis')
    })

    it('should require description', async () => {
      const interventionData = { vehiculeId, type: 'entretien' }
      await expect(addIntervention(interventionData)).rejects.toThrow('Description requise')
    })

    it('should handle optional fields', async () => {
      const interventionData = {
        vehiculeId,
        type: 'reparation',
        description: 'Remplacement freins',
        date: '2024-01-15',
        kilometrage: 55000,
        cout: 280,
        pieces: ['Plaquettes AV', 'Disques AV'],
        statut: 'termine',
        notes: 'Travail effectué'
      }
      const result = await addIntervention(interventionData)

      expect(result.date).toBe('2024-01-15')
      expect(result.kilometrage).toBe(55000)
      expect(result.cout).toBe(280)
      expect(result.pieces).toEqual(['Plaquettes AV', 'Disques AV'])
      expect(result.statut).toBe('termine')
      expect(result.notes).toBe('Travail effectué')
    })
  })

  describe('getIntervention', () => {
    it('should get an intervention by id', async () => {
      const created = await addIntervention({
        vehiculeId,
        type: 'entretien',
        description: 'Vidange'
      })

      const result = await getIntervention(created.id)
      expect(result.id).toBe(created.id)
      expect(result.description).toBe('Vidange')
    })

    it('should return undefined for non-existent id', async () => {
      const result = await getIntervention('non-existent-id')
      expect(result).toBeUndefined()
    })
  })

  describe('getAllInterventions', () => {
    it('should return empty array when no interventions', async () => {
      const result = await getAllInterventions()
      expect(result).toEqual([])
    })

    it('should return all interventions sorted by date desc', async () => {
      await addIntervention({
        vehiculeId,
        type: 'entretien',
        description: 'Première',
        date: '2024-01-01'
      })
      await addIntervention({
        vehiculeId,
        type: 'reparation',
        description: 'Deuxième',
        date: '2024-02-01'
      })

      const result = await getAllInterventions()
      expect(result.length).toBe(2)
      expect(result[0].description).toBe('Deuxième')
      expect(result[1].description).toBe('Première')
    })
  })

  describe('getInterventionsByVehiculeId', () => {
    it('should return interventions for a specific vehicule', async () => {
      const client2 = await addClient({ nom: 'Martin', prenom: 'Paul', telephone: '0687654321' })
      const vehicule2 = await addVehicule({
        clientId: client2.id,
        marque: 'Peugeot',
        immatriculation: 'EF-456-GH'
      })

      await addIntervention({ vehiculeId, type: 'entretien', description: 'Int 1' })
      await addIntervention({ vehiculeId, type: 'reparation', description: 'Int 2' })
      await addIntervention({ vehiculeId: vehicule2.id, type: 'diagnostic', description: 'Int 3' })

      const result = await getInterventionsByVehiculeId(vehiculeId)
      expect(result.length).toBe(2)
      expect(result.every(i => i.vehiculeId === vehiculeId)).toBe(true)
    })

    it('should return empty array for vehicule with no interventions', async () => {
      const result = await getInterventionsByVehiculeId('no-interventions-vehicule')
      expect(result).toEqual([])
    })
  })

  describe('updateIntervention', () => {
    it('should update intervention fields', async () => {
      const created = await addIntervention({
        vehiculeId,
        type: 'entretien',
        description: 'Vidange'
      })

      const result = await updateIntervention(created.id, {
        statut: 'termine',
        cout: 150
      })

      expect(result.statut).toBe('termine')
      expect(result.cout).toBe(150)
      expect(result.description).toBe('Vidange')
    })

    it('should throw error for non-existent intervention', async () => {
      await expect(updateIntervention('non-existent', { statut: 'termine' })).rejects.toThrow('Intervention non trouvée')
    })

    it('should preserve vehiculeId', async () => {
      const created = await addIntervention({
        vehiculeId,
        type: 'entretien',
        description: 'Vidange'
      })

      const result = await updateIntervention(created.id, { vehiculeId: 'other-vehicule' })
      expect(result.vehiculeId).toBe(vehiculeId)
    })
  })

  describe('deleteIntervention', () => {
    it('should delete an intervention', async () => {
      const created = await addIntervention({
        vehiculeId,
        type: 'entretien',
        description: 'Vidange'
      })

      await deleteIntervention(created.id)

      const result = await getIntervention(created.id)
      expect(result).toBeUndefined()
    })
  })

  describe('deleteInterventionsByVehiculeId', () => {
    it('should delete all interventions for a vehicule', async () => {
      await addIntervention({ vehiculeId, type: 'entretien', description: 'Int 1' })
      await addIntervention({ vehiculeId, type: 'reparation', description: 'Int 2' })

      await deleteInterventionsByVehiculeId(vehiculeId)

      const result = await getInterventionsByVehiculeId(vehiculeId)
      expect(result).toEqual([])
    })
  })
})
