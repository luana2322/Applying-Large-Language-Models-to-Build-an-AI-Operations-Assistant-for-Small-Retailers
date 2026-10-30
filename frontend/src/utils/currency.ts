/**
 * Formats a number to Vietnamese Dong (VNĐ) currency string.
 * Example: 150000 -> "150.000 ₫"
 */
export function formatCurrencyVND(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '0 ₫'
  }

  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) {
    return '0 ₫'
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Parses a currency string back to standard number.
 * Example: "150.000 ₫" -> 150000
 */
export function parseCurrencyVND(str: string): number {
  if (!str) return 0
  // Remove currency symbols, spaces, and dot thousand separators
  const cleaned = str.replace(/[₫\sVND]/gi, '').replace(/\./g, '').replace(/,/g, '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
