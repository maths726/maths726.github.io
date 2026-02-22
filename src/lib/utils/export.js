import { getAllClients } from '../db/clients.js'
import { getAllVehicules } from '../db/vehicules.js'
import { getAllInterventions } from '../db/interventions.js'
import { getDB } from '../db/index.js'

export async function exportAllData() {
  const [clients, vehicules, interventions] = await Promise.all([
    getAllClients(),
    getAllVehicules(),
    getAllInterventions()
  ])

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {
      clients,
      vehicules,
      interventions
    },
    stats: {
      totalClients: clients.length,
      totalVehicules: vehicules.length,
      totalInterventions: interventions.length
    }
  }

  return exportData
}

export function downloadJSON(data, filename = 'suivi-client-export.json') {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportAndDownload() {
  const data = await exportAllData()
  const date = new Date().toISOString().split('T')[0]
  downloadJSON(data, `suivi-client-${date}.json`)
  return data
}

/**
 * Check if incoming item is newer than existing item
 * @param {object} incoming - Item from import
 * @param {object} existing - Item from local DB
 * @returns {boolean} True if incoming is newer
 */
function isNewer(incoming, existing) {
  if (!existing) return true
  if (!incoming.updatedAt) return false
  if (!existing.updatedAt) return true
  return new Date(incoming.updatedAt) > new Date(existing.updatedAt)
}

export async function importData(jsonData) {
  // Validate structure
  if (!jsonData || !jsonData.data) {
    throw new Error('Format de fichier invalide')
  }

  const { clients = [], vehicules = [], interventions = [] } = jsonData.data

  const db = await getDB()
  const tx = db.transaction(['clients', 'vehicules', 'interventions'], 'readwrite')

  let importedClients = 0
  let importedVehicules = 0
  let importedInterventions = 0

  // Import clients (newest wins)
  for (const client of clients) {
    if (client.id) {
      const existing = await tx.objectStore('clients').get(client.id)
      if (isNewer(client, existing)) {
        await tx.objectStore('clients').put(client)
        importedClients++
      }
    }
  }

  // Import vehicules (newest wins)
  for (const vehicule of vehicules) {
    if (vehicule.id) {
      const existing = await tx.objectStore('vehicules').get(vehicule.id)
      if (isNewer(vehicule, existing)) {
        await tx.objectStore('vehicules').put(vehicule)
        importedVehicules++
      }
    }
  }

  // Import interventions (newest wins)
  for (const intervention of interventions) {
    if (intervention.id) {
      const existing = await tx.objectStore('interventions').get(intervention.id)
      if (isNewer(intervention, existing)) {
        await tx.objectStore('interventions').put(intervention)
        importedInterventions++
      }
    }
  }

  await tx.done

  return {
    clients: importedClients,
    vehicules: importedVehicules,
    interventions: importedInterventions
  }
}

export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (error) {
        reject(new Error('Fichier JSON invalide'))
      }
    }
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
    reader.readAsText(file)
  })
}
