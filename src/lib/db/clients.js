import { getDB } from './index.js'
import { v4 as uuidv4 } from 'uuid'

export async function addClient(clientData) {
  if (!clientData.nom || !clientData.nom.trim()) {
    throw new Error('Nom requis')
  }
  if (!clientData.telephone || !clientData.telephone.trim()) {
    throw new Error('Téléphone requis')
  }

  const db = await getDB()
  const now = new Date().toISOString()

  const client = {
    id: uuidv4(),
    nom: clientData.nom.trim(),
    prenom: clientData.prenom?.trim() || '',
    telephone: clientData.telephone.trim(),
    email: clientData.email?.trim() || '',
    adresse: clientData.adresse?.trim() || '',
    notes: clientData.notes?.trim() || '',
    createdAt: now,
    updatedAt: now
  }

  await db.add('clients', client)
  return client
}

export async function getClient(id) {
  const db = await getDB()
  return db.get('clients', id)
}

export async function getAllClients() {
  const db = await getDB()
  const clients = await db.getAll('clients')
  return clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function updateClient(id, updates) {
  const db = await getDB()
  const client = await db.get('clients', id)

  if (!client) {
    throw new Error('Client non trouvé')
  }

  const updatedClient = {
    ...client,
    ...updates,
    id: client.id,
    createdAt: client.createdAt,
    updatedAt: new Date().toISOString()
  }

  if (updates.nom !== undefined) {
    updatedClient.nom = updates.nom.trim()
  }
  if (updates.prenom !== undefined) {
    updatedClient.prenom = updates.prenom.trim()
  }
  if (updates.telephone !== undefined) {
    updatedClient.telephone = updates.telephone.trim()
  }
  if (updates.email !== undefined) {
    updatedClient.email = updates.email.trim()
  }
  if (updates.adresse !== undefined) {
    updatedClient.adresse = updates.adresse.trim()
  }
  if (updates.notes !== undefined) {
    updatedClient.notes = updates.notes.trim()
  }

  await db.put('clients', updatedClient)
  return updatedClient
}

export async function deleteClient(id) {
  const db = await getDB()
  await db.delete('clients', id)
}

export async function searchClients(query) {
  if (!query || !query.trim()) {
    return getAllClients()
  }

  const normalizedQuery = query.toLowerCase().trim()
  const clients = await getAllClients()

  return clients.filter(client => {
    const searchFields = [
      client.nom,
      client.prenom,
      client.telephone,
      client.email
    ].filter(Boolean)

    return searchFields.some(field =>
      field.toLowerCase().includes(normalizedQuery)
    )
  })
}
