import React from 'react'
import { Tag } from 'antd'

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

export interface StockLevelBadgeProps {
  quantity: number
  minStockLevel?: number
  onClick?: () => void
}

export function determineStockStatus(quantity: number, minStockLevel = 10): StockStatus {
  if (quantity <= 0) return 'OUT_OF_STOCK'
  if (quantity <= minStockLevel) return 'LOW_STOCK'
  return 'IN_STOCK'
}

export const StockLevelBadge: React.FC<StockLevelBadgeProps> = ({
  quantity,
  minStockLevel = 10,
  onClick,
}) => {
  const status = determineStockStatus(quantity, minStockLevel)

  const config = {
    OUT_OF_STOCK: { color: 'error', text: 'Hết hàng (0)', icon: '🔴' },
    LOW_STOCK: { color: 'warning', text: `Sắp hết (${quantity})`, icon: '⚠️' },
    IN_STOCK: { color: 'success', text: `Còn hàng (${quantity})`, icon: '🟢' },
  }[status]

  return (
    <Tag
      data-testid="stock-badge"
      color={config.color}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', fontWeight: 500 }}
    >
      <span role="img" aria-label={status} style={{ marginRight: 4 }}>
        {config.icon}
      </span>
      {config.text}
    </Tag>
  )
}
