import { writable } from 'svelte/store'
import * as vehiculesDB from '../db/vehicules.js'

function createVehiculesStore() {
  const { subscribe, set, update } = writable([])

  return {
    subscribe,

    async load() {
      const vehicules = await vehiculesDB.getAllVehicules()
      set(vehicules)
      return vehicules
    },

    async loadByClient(clientId) {
      const vehicules = await vehiculesDB.getVehiculesByClientId(clientId)
      set(vehicules)
      return vehicules
    },

    async search(query) {
      const vehicules = await vehiculesDB.searchVehicules(query)
      set(vehicules)
      return vehicules
    },

    async add(vehiculeData) {
      const vehicule = await vehiculesDB.addVehicule(vehiculeData)
      update(vehicules => [vehicule, ...vehicules])
      return vehicule
    },

    async update(id, updates) {
      const vehicule = await vehiculesDB.updateVehicule(id, updates)
      update(vehicules => vehicules.map(v => v.id === id ? vehicule : v))
      return vehicule
    },

    async delete(id) {
      await vehiculesDB.deleteVehicule(id)
      update(vehicules => vehicules.filter(v => v.id !== id))
    },

    async deleteByClient(clientId) {
      await vehiculesDB.deleteVehiculesByClientId(clientId)
      update(vehicules => vehicules.filter(v => v.clientId !== clientId))
    }
  }
}

export const vehicules = createVehiculesStore()
