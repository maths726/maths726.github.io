import { getDB } from './index.js'
import { v4 as uuidv4 } from 'uuid'

export async function addVehicule(vehiculeData) {
  if (!vehiculeData.clientId) {
    throw new Error('Client requis')
  }
  if (!vehiculeData.marque || !vehiculeData.marque.trim()) {
    throw new Error('Marque requise')
  }
  if (!vehiculeData.immatriculation || !vehiculeData.immatriculation.trim()) {
    throw new Error('Immatriculation requise')
  }

  const db = await getDB()
  const now = new Date().toISOString()

  const vehicule = {
    id: uuidv4(),
    clientId: vehiculeData.clientId,
    marque: vehiculeData.marque.trim(),
    modele: vehiculeData.modele?.trim() || '',
    annee: vehiculeData.annee || null,
    immatriculation: vehiculeData.immatriculation.trim().toUpperCase(),
    vin: vehiculeData.vin?.trim() || '',
    kilometrage: vehiculeData.kilometrage || 0,
    notes: vehiculeData.notes?.trim() || '',
    createdAt: now,
    updatedAt: now
  }

  await db.add('vehicules', vehicule)
  return vehicule
}

export async function getVehicule(id) {
  const db = await getDB()
  return db.get('vehicules', id)
}

export async function getAllVehicules() {
  const db = await getDB()
  const vehicules = await db.getAll('vehicules')
  return vehicules.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function getVehiculesByClientId(clientId) {
  const db = await getDB()
  const vehicules = await db.getAllFromIndex('vehicules', 'clientId', clientId)
  return vehicules.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function updateVehicule(id, updates) {
  const db = await getDB()
  const vehicule = await db.get('vehicules', id)

  if (!vehicule) {
    throw new Error('Véhicule non trouvé')
  }

  const updatedVehicule = {
    ...vehicule,
    ...updates,
    id: vehicule.id,
    clientId: vehicule.clientId,
    createdAt: vehicule.createdAt,
    updatedAt: new Date().toISOString()
  }

  if (updates.marque !== undefined) {
    updatedVehicule.marque = updates.marque.trim()
  }
  if (updates.modele !== undefined) {
    updatedVehicule.modele = updates.modele.trim()
  }
  if (updates.immatriculation !== undefined) {
    updatedVehicule.immatriculation = updates.immatriculation.trim().toUpperCase()
  }
  if (updates.vin !== undefined) {
    updatedVehicule.vin = updates.vin.trim()
  }
  if (updates.notes !== undefined) {
    updatedVehicule.notes = updates.notes.trim()
  }

  await db.put('vehicules', updatedVehicule)
  return updatedVehicule
}

export async function deleteVehicule(id) {
  const db = await getDB()
  await db.delete('vehicules', id)
}

export async function deleteVehiculesByClientId(clientId) {
  const db = await getDB()
  const vehicules = await getVehiculesByClientId(clientId)
  const tx = db.transaction('vehicules', 'readwrite')
  await Promise.all([
    ...vehicules.map(v => tx.store.delete(v.id)),
    tx.done
  ])
}

export async function searchVehicules(query) {
  if (!query || !query.trim()) {
    return getAllVehicules()
  }

  const normalizedQuery = query.toLowerCase().trim()
  const vehicules = await getAllVehicules()

  return vehicules.filter(vehicule => {
    const searchFields = [
      vehicule.marque,
      vehicule.modele,
      vehicule.immatriculation,
      vehicule.vin
    ].filter(Boolean)

    return searchFields.some(field =>
      field.toLowerCase().includes(normalizedQuery)
    )
  })
}
