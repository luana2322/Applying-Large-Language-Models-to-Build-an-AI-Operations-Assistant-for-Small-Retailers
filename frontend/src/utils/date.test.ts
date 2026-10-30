import { describe, it, expect } from 'vitest'
import { formatDateVN, formatDateTimeVN } from './date'

describe('date utils', () => {
  it('formats ISO date string to DD/MM/YYYY format', () => {
    const formatted = formatDateVN('2026-10-17')
    expect(formatted).toBe('17/10/2026')
  })

  it('formats ISO datetime with hours and minutes', () => {
    const formatted = formatDateTimeVN('2026-10-17T14:30:00')
    expect(formatted).toBe('17/10/2026 14:30')
  })

  it('returns "-" for null or undefined or invalid date', () => {
    expect(formatDateVN(null)).toBe('-')
    expect(formatDateVN(undefined)).toBe('-')
    expect(formatDateVN('invalid-date')).toBe('-')
  })
})
