import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, 'dd/MM/yyyy', { locale: fr })
  } catch {
    return dateString
  }
}

export function formatDateLong(dateString) {
  if (!dateString) return ''
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, 'dd MMMM yyyy', { locale: fr })
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return ''
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, 'dd/MM/yyyy HH:mm', { locale: fr })
  } catch {
    return dateString
  }
}

export function formatPrice(amount) {
  if (amount === null || amount === undefined) return ''
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export function formatTelephone(phone) {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  return phone
}

export function formatKilometrage(km) {
  if (km === null || km === undefined) return ''
  return new Intl.NumberFormat('fr-FR').format(km) + ' km'
}

export function formatImmatriculation(immat) {
  if (!immat) return ''
  return immat.toUpperCase()
}
