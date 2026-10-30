import { describe, it, expect } from 'vitest'
import { formatCurrencyVND, parseCurrencyVND } from './currency'

describe('currency utils', () => {
  describe('formatCurrencyVND', () => {
    it('formats positive integers to VND currency format', () => {
      const formatted = formatCurrencyVND(150000)
      // Expect formatted string to contain 150.000 and currency symbol
      expect(formatted).toMatch(/150\.000/)
      expect(formatted).toMatch(/₫|VND/)
    })

    it('formats 0 properly', () => {
      const formatted = formatCurrencyVND(0)
      expect(formatted).toMatch(/0/)
      expect(formatted).toMatch(/₫|VND/)
    })

    it('handles null, undefined and empty strings gracefully', () => {
      expect(formatCurrencyVND(null)).toMatch(/0/)
      expect(formatCurrencyVND(undefined)).toMatch(/0/)
      expect(formatCurrencyVND('')).toMatch(/0/)
    })

    it('handles numeric string inputs', () => {
      const formatted = formatCurrencyVND('2500000')
      expect(formatted).toMatch(/2\.500\.000/)
    })

    it('handles invalid non-numeric string', () => {
      expect(formatCurrencyVND('abc')).toMatch(/0/)
    })
  })

  describe('parseCurrencyVND', () => {
    it('parses formatted VND string back to number', () => {
      expect(parseCurrencyVND('150.000 ₫')).toBe(150000)
      expect(parseCurrencyVND('2.500.000 VND')).toBe(2500000)
    })

    it('returns 0 for empty or invalid strings', () => {
      expect(parseCurrencyVND('')).toBe(0)
      expect(parseCurrencyVND('invalid')).toBe(0)
    })
  })
})
