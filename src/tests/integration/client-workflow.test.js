import { describe, it, expect, beforeEach } from 'vitest'
import { addClient, getClient, getAllClients, updateClient, deleteClient } from '../../lib/db/clients.js'
import { addVehicule, getVehiculesByClientId, deleteVehiculesByClientId } from '../../lib/db/vehicules.js'
import { addIntervention, getInterventionsByVehiculeId, deleteInterventionsByVehiculeId } from '../../lib/db/interventions.js'
import { resetDBInstance } from '../../lib/db/index.js'

describe('Client workflow integration', () => {
  beforeEach(() => {
    resetDBInstance()
  })

  describe('Complete client lifecycle', () => {
    it('should create client, add vehicule, add intervention, and delete cascade', async () => {
      // 1. Create client
      const client = await addClient({
        nom: 'Dupont',
        prenom: 'Jean',
        telephone: '0612345678',
        email: 'jean@test.com'
      })
      expect(client.id).toBeDefined()

      // 2. Add vehicule to client
      const vehicule = await addVehicule({
        clientId: client.id,
        marque: 'Renault',
        modele: 'Clio',
        immatriculation: 'AB-123-CD',
        annee: 2020,
        kilometrage: 50000
      })
      expect(vehicule.clientId).toBe(client.id)

      // 3. Add intervention to vehicule
      const intervention = await addIntervention({
        vehiculeId: vehicule.id,
        type: 'entretien',
        description: 'Vidange huile moteur',
        date: '2024-01-15',
        kilometrage: 52000,
        coutEstime: 80
      })
      expect(intervention.vehiculeId).toBe(vehicule.id)

      // 4. Verify data is linked
      const clientVehicules = await getVehiculesByClientId(client.id)
      expect(clientVehicules.length).toBe(1)
      expect(clientVehicules[0].id).toBe(vehicule.id)

      const vehiculeInterventions = await getInterventionsByVehiculeId(vehicule.id)
      expect(vehiculeInterventions.length).toBe(1)
      expect(vehiculeInterventions[0].id).toBe(intervention.id)

      // 5. Delete cascade: interventions -> vehicules -> client
      await deleteInterventionsByVehiculeId(vehicule.id)
      await deleteVehiculesByClientId(client.id)
      await deleteClient(client.id)

      // 6. Verify deletion
      const deletedClient = await getClient(client.id)
      expect(deletedClient).toBeUndefined()

      const deletedVehicules = await getVehiculesByClientId(client.id)
      expect(deletedVehicules).toEqual([])

      const deletedInterventions = await getInterventionsByVehiculeId(vehicule.id)
      expect(deletedInterventions).toEqual([])
    })

    it('should handle client with multiple vehicules', async () => {
      const client = await addClient({
        nom: 'Martin',
        prenom: 'Paul',
        telephone: '0687654321'
      })

      const vehicule1 = await addVehicule({
        clientId: client.id,
        marque: 'Peugeot',
        modele: '308',
        immatriculation: 'EF-456-GH'
      })

      const vehicule2 = await addVehicule({
        clientId: client.id,
        marque: 'Citroen',
        modele: 'C3',
        immatriculation: 'IJ-789-KL'
      })

      const vehicules = await getVehiculesByClientId(client.id)
      expect(vehicules.length).toBe(2)
      expect(vehicules.map(v => v.id)).toContain(vehicule1.id)
      expect(vehicules.map(v => v.id)).toContain(vehicule2.id)
    })

    it('should track intervention history for vehicule', async () => {
      const client = await addClient({
        nom: 'Durand',
        prenom: 'Marie',
        telephone: '0611111111'
      })

      const vehicule = await addVehicule({
        clientId: client.id,
        marque: 'Toyota',
        modele: 'Yaris',
        immatriculation: 'MN-012-OP',
        kilometrage: 30000
      })

      // Add multiple interventions
      await addIntervention({
        vehiculeId: vehicule.id,
        type: 'entretien',
        description: 'Vidange 30000km',
        date: '2024-01-01',
        kilometrage: 30000
      })

      await addIntervention({
        vehiculeId: vehicule.id,
        type: 'reparation',
        description: 'Remplacement plaquettes',
        date: '2024-02-15',
        kilometrage: 35000,
        coutFinal: 180
      })

      await addIntervention({
        vehiculeId: vehicule.id,
        type: 'controle',
        description: 'Contrôle technique',
        date: '2024-03-01',
        kilometrage: 36000,
        statut: 'termine'
      })

      const interventions = await getInterventionsByVehiculeId(vehicule.id)
      expect(interventions.length).toBe(3)

      // Should be sorted by date desc
      expect(interventions[0].description).toBe('Contrôle technique')
      expect(interventions[2].description).toBe('Vidange 30000km')
    })
  })

  describe('Update operations', () => {
    it('should update client and preserve vehicules', async () => {
      const client = await addClient({
        nom: 'Test',
        prenom: 'User',
        telephone: '0600000000'
      })

      await addVehicule({
        clientId: client.id,
        marque: 'Renault',
        immatriculation: 'AA-111-AA'
      })

      const updatedClient = await updateClient(client.id, {
        telephone: '0699999999',
        email: 'new@email.com'
      })

      expect(updatedClient.telephone).toBe('0699999999')
      expect(updatedClient.email).toBe('new@email.com')

      // Vehicules should still be linked
      const vehicules = await getVehiculesByClientId(client.id)
      expect(vehicules.length).toBe(1)
    })
  })
})
