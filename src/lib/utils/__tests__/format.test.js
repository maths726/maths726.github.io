import { describe, it, expect } from 'vitest'
import { formatDate, formatDateLong, formatDateTime, formatPrice, formatTelephone, formatKilometrage, formatImmatriculation } from '../format.js'

describe('format utils', () => {
  describe('formatDate', () => {
    it('should format ISO date string', () => {
      const result = formatDate('2024-01-15')
      expect(result).toBe('15/01/2024')
    })

    it('should format ISO datetime string', () => {
      const result = formatDate('2024-01-15T10:30:00.000Z')
      expect(result).toBe('15/01/2024')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
      expect(formatDate('')).toBe('')
    })

    it('should handle invalid date gracefully', () => {
      const result = formatDate('invalid-date')
      expect(typeof result).toBe('string')
    })
  })

  describe('formatDateLong', () => {
    it('should format date in long French format', () => {
      const result = formatDateLong('2024-01-15')
      expect(result).toBe('15 janvier 2024')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatDateLong(null)).toBe('')
      expect(formatDateLong(undefined)).toBe('')
    })
  })

  describe('formatDateTime', () => {
    it('should format datetime', () => {
      const result = formatDateTime('2024-01-15T10:30:00.000Z')
      expect(result).toMatch(/15\/01\/2024/)
    })

    it('should return empty string for null/undefined', () => {
      expect(formatDateTime(null)).toBe('')
      expect(formatDateTime(undefined)).toBe('')
    })
  })

  describe('formatPrice', () => {
    it('should format price in EUR', () => {
      const result = formatPrice(150.50)
      expect(result).toContain('150')
      expect(result).toContain('€')
    })

    it('should format integer price', () => {
      const result = formatPrice(100)
      expect(result).toContain('100')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatPrice(null)).toBe('')
      expect(formatPrice(undefined)).toBe('')
    })

    it('should handle zero', () => {
      const result = formatPrice(0)
      expect(result).toContain('0')
    })
  })

  describe('formatTelephone', () => {
    it('should format 10-digit French phone number', () => {
      const result = formatTelephone('0612345678')
      expect(result).toBe('06 12 34 56 78')
    })

    it('should return original if not 10 digits', () => {
      expect(formatTelephone('123')).toBe('123')
      expect(formatTelephone('+33612345678')).toBe('+33612345678')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatTelephone(null)).toBe('')
      expect(formatTelephone(undefined)).toBe('')
      expect(formatTelephone('')).toBe('')
    })

    it('should handle phone with spaces', () => {
      const result = formatTelephone('06 12 34 56 78')
      expect(result).toBe('06 12 34 56 78')
    })
  })

  describe('formatKilometrage', () => {
    it('should format kilometrage with km suffix', () => {
      const result = formatKilometrage(50000)
      expect(result).toContain('50')
      expect(result).toContain('000')
      expect(result).toContain('km')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatKilometrage(null)).toBe('')
      expect(formatKilometrage(undefined)).toBe('')
    })

    it('should handle zero', () => {
      const result = formatKilometrage(0)
      expect(result).toBe('0 km')
    })
  })

  describe('formatImmatriculation', () => {
    it('should uppercase immatriculation', () => {
      const result = formatImmatriculation('ab-123-cd')
      expect(result).toBe('AB-123-CD')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatImmatriculation(null)).toBe('')
      expect(formatImmatriculation(undefined)).toBe('')
      expect(formatImmatriculation('')).toBe('')
    })
  })
})
