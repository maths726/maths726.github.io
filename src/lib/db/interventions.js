import { getDB } from './index.js'
import { v4 as uuidv4 } from 'uuid'
import { triggerAutoSync } from '../sync/autosync.js'

export const TYPES_INTERVENTION = [
  { value: 'entretien', label: 'Entretien' },
  { value: 'reparation', label: 'Réparation' }
]

export const STATUTS_INTERVENTION = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminé' }
]

export async function migrateEnAttenteToEnCours() {
  const db = await getDB()
  const interventions = await db.getAll('interventions')
  const enAttente = interventions.filter(i => i.statut === 'en_attente')

  if (enAttente.length > 0) {
    const tx = db.transaction('interventions', 'readwrite')
    await Promise.all([
      ...enAttente.map(i => tx.store.put({ ...i, statut: 'en_cours', updatedAt: new Date().toISOString() })),
      tx.done
    ])
    triggerAutoSync()
  }
  return enAttente.length
}

export async function migrateCoutToPriceFields() {
  const db = await getDB()
  const interventions = await db.getAll('interventions')
  const toMigrate = interventions.filter(i => i.cout !== undefined)

  if (toMigrate.length > 0) {
    const tx = db.transaction('interventions', 'readwrite')
    await Promise.all([
      ...toMigrate.map(i => {
        const { cout, ...rest } = i
        return tx.store.put({
          ...rest,
          prixPieces: cout,
          mainDoeuvre: null,
          marge: null,
          updatedAt: new Date().toISOString()
        })
      }),
      tx.done
    ])
    triggerAutoSync()
  }
  return toMigrate.length
}

export async function addIntervention(interventionData) {
  if (!interventionData.vehiculeId) {
    throw new Error('Véhicule requis')
  }
  if (!interventionData.type) {
    throw new Error('Type requis')
  }
  if (!interventionData.description || !interventionData.description.trim()) {
    throw new Error('Description requise')
  }

  const db = await getDB()
  const now = new Date().toISOString()

  const intervention = {
    id: uuidv4(),
    vehiculeId: interventionData.vehiculeId,
    type: interventionData.type,
    description: interventionData.description.trim(),
    date: interventionData.date || now.split('T')[0],
    kilometrage: interventionData.kilometrage || 0,
    prixPieces: interventionData.prixPieces || null,
    mainDoeuvre: interventionData.mainDoeuvre || null,
    marge: interventionData.marge || null,
    tempsTravail: interventionData.tempsTravail ?? null,
    pieces: interventionData.pieces || [],
    statut: interventionData.statut || 'en_cours',
    notes: interventionData.notes?.trim() || '',
    createdAt: now,
    updatedAt: now
  }

  await db.add('interventions', intervention)
  triggerAutoSync()
  return intervention
}

export async function getIntervention(id) {
  const db = await getDB()
  return db.get('interventions', id)
}

export async function getAllInterventions() {
  const db = await getDB()
  const interventions = await db.getAll('interventions')
  return interventions.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function getInterventionsByVehiculeId(vehiculeId) {
  const db = await getDB()
  const interventions = await db.getAllFromIndex('interventions', 'vehiculeId', vehiculeId)
  return interventions.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function updateIntervention(id, updates) {
  const db = await getDB()
  const intervention = await db.get('interventions', id)

  if (!intervention) {
    throw new Error('Intervention non trouvée')
  }

  const updatedIntervention = {
    ...intervention,
    ...updates,
    id: intervention.id,
    vehiculeId: intervention.vehiculeId,
    createdAt: intervention.createdAt,
    updatedAt: new Date().toISOString()
  }

  if (updates.description !== undefined) {
    updatedIntervention.description = updates.description.trim()
  }
  if (updates.notes !== undefined) {
    updatedIntervention.notes = updates.notes.trim()
  }

  await db.put('interventions', updatedIntervention)
  triggerAutoSync()
  return updatedIntervention
}

export async function deleteIntervention(id) {
  const db = await getDB()
  await db.delete('interventions', id)
  triggerAutoSync()
}

export async function deleteInterventionsByVehiculeId(vehiculeId) {
  const db = await getDB()
  const interventions = await getInterventionsByVehiculeId(vehiculeId)
  const tx = db.transaction('interventions', 'readwrite')
  await Promise.all([
    ...interventions.map(i => tx.store.delete(i.id)),
    tx.done
  ])
  triggerAutoSync()
}
