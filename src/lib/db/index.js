import { openDB, deleteDB } from 'idb'

const DB_NAME = 'suivi-client-db'
const DB_VERSION = 1

let dbInstance = null
let dbCounter = 0
let migrationDone = false

function getDBName() {
  // In test environment, use unique DB names to avoid conflicts
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return `${DB_NAME}-test-${dbCounter}`
  }
  return DB_NAME
}

export async function getDB() {
  if (dbInstance) return dbInstance

  const dbName = getDBName()

  dbInstance = await openDB(dbName, DB_VERSION, {
    upgrade(db) {
      // Store clients
      if (!db.objectStoreNames.contains('clients')) {
        const clientStore = db.createObjectStore('clients', { keyPath: 'id' })
        clientStore.createIndex('nom', 'nom')
        clientStore.createIndex('telephone', 'telephone')
        clientStore.createIndex('createdAt', 'createdAt')
      }

      // Store véhicules
      if (!db.objectStoreNames.contains('vehicules')) {
        const vehiculeStore = db.createObjectStore('vehicules', { keyPath: 'id' })
        vehiculeStore.createIndex('clientId', 'clientId')
        vehiculeStore.createIndex('immatriculation', 'immatriculation')
        vehiculeStore.createIndex('createdAt', 'createdAt')
      }

      // Store interventions
      if (!db.objectStoreNames.contains('interventions')) {
        const interventionStore = db.createObjectStore('interventions', { keyPath: 'id' })
        interventionStore.createIndex('vehiculeId', 'vehiculeId')
        interventionStore.createIndex('date', 'date')
        interventionStore.createIndex('statut', 'statut')
        interventionStore.createIndex('createdAt', 'createdAt')
      }
    }
  })

  return dbInstance
}

export async function runMigrations() {
  if (migrationDone) return
  migrationDone = true

  const { migrateEnAttenteToEnCours, migrateCoutToPriceFields } = await import('./interventions.js')
  const count = await migrateEnAttenteToEnCours()
  if (count > 0) {
    console.log(`Migrated ${count} intervention(s) from 'en_attente' to 'en_cours'`)
  }

  const priceCount = await migrateCoutToPriceFields()
  if (priceCount > 0) {
    console.log(`Migrated ${priceCount} intervention(s) from 'cout' to price fields`)
  }

  const { migrateAnneeToMiseEnCirculation } = await import('./vehicules.js')
  const vehiculeCount = await migrateAnneeToMiseEnCirculation()
  if (vehiculeCount > 0) {
    console.log(`Migrated ${vehiculeCount} vehicule(s) from 'annee' to 'moisMiseEnCirculation/anneeMiseEnCirculation'`)
  }
}

export async function clearDB() {
  const db = await getDB()
  const tx = db.transaction(['clients', 'vehicules', 'interventions'], 'readwrite')
  await Promise.all([
    tx.objectStore('clients').clear(),
    tx.objectStore('vehicules').clear(),
    tx.objectStore('interventions').clear(),
    tx.done
  ])
}

export function resetDBInstance() {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
  dbCounter++
  migrationDone = false
}
