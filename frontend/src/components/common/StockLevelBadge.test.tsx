import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StockLevelBadge, determineStockStatus } from './StockLevelBadge'

describe('StockLevelBadge Component', () => {
  describe('determineStockStatus logic', () => {
    it('returns OUT_OF_STOCK when quantity is 0 or negative', () => {
      expect(determineStockStatus(0, 10)).toBe('OUT_OF_STOCK')
      expect(determineStockStatus(-2, 10)).toBe('OUT_OF_STOCK')
    })

    it('returns LOW_STOCK when quantity is <= minStockLevel', () => {
      expect(determineStockStatus(5, 10)).toBe('LOW_STOCK')
      expect(determineStockStatus(10, 10)).toBe('LOW_STOCK')
    })

    it('returns IN_STOCK when quantity exceeds minStockLevel', () => {
      expect(determineStockStatus(11, 10)).toBe('IN_STOCK')
      expect(determineStockStatus(50, 10)).toBe('IN_STOCK')
    })
  })

  describe('Component Rendering & Props', () => {
    it('renders out of stock badge when quantity is 0', () => {
      render(<StockLevelBadge quantity={0} />)
      const badge = screen.getByTestId('stock-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Hết hàng (0)')
    })

    it('renders low stock warning when quantity is below minStockLevel', () => {
      render(<StockLevelBadge quantity={4} minStockLevel={10} />)
      const badge = screen.getByTestId('stock-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Sắp hết (4)')
    })

    it('renders in stock badge when quantity is sufficient', () => {
      render(<StockLevelBadge quantity={50} minStockLevel={10} />)
      const badge = screen.getByTestId('stock-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Còn hàng (50)')
    })
  })

  describe('Event Handling', () => {
    it('triggers onClick handler when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(<StockLevelBadge quantity={5} onClick={handleClick} />)
      const badge = screen.getByTestId('stock-badge')

      await user.click(badge)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})
