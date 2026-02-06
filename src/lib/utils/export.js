import { getAllClients } from '../db/clients.js'
import { getAllVehicules } from '../db/vehicules.js'
import { getAllInterventions } from '../db/interventions.js'

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
