import { writable } from 'svelte/store'
import * as clientsDB from '../db/clients.js'

function createClientsStore() {
  const { subscribe, set, update } = writable([])

  return {
    subscribe,

    async load() {
      const clients = await clientsDB.getAllClients()
      set(clients)
      return clients
    },

    async add(clientData) {
      const client = await clientsDB.addClient(clientData)
      update(clients => [client, ...clients])
      return client
    },

    async update(id, updates) {
      const client = await clientsDB.updateClient(id, updates)
      update(clients => clients.map(c => c.id === id ? client : c))
      return client
    },

    async delete(id) {
      await clientsDB.deleteClient(id)
      update(clients => clients.filter(c => c.id !== id))
    },

    async search(query) {
      const clients = await clientsDB.searchClients(query)
      set(clients)
      return clients
    }
  }
}

export const clients = createClientsStore()
