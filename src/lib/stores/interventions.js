import { writable } from 'svelte/store'
import * as interventionsDB from '../db/interventions.js'

function createInterventionsStore() {
  const { subscribe, set, update } = writable([])

  return {
    subscribe,

    async load() {
      const interventions = await interventionsDB.getAllInterventions()
      set(interventions)
      return interventions
    },

    async loadByVehicule(vehiculeId) {
      const interventions = await interventionsDB.getInterventionsByVehiculeId(vehiculeId)
      set(interventions)
      return interventions
    },

    async add(interventionData) {
      const intervention = await interventionsDB.addIntervention(interventionData)
      update(interventions => [intervention, ...interventions])
      return intervention
    },

    async update(id, updates) {
      const intervention = await interventionsDB.updateIntervention(id, updates)
      update(interventions => interventions.map(i => i.id === id ? intervention : i))
      return intervention
    },

    async delete(id) {
      await interventionsDB.deleteIntervention(id)
      update(interventions => interventions.filter(i => i.id !== id))
    },

    async deleteByVehicule(vehiculeId) {
      await interventionsDB.deleteInterventionsByVehiculeId(vehiculeId)
      update(interventions => interventions.filter(i => i.vehiculeId !== vehiculeId))
    }
  }
}

export const interventions = createInterventionsStore()
