import type { Meta, StoryObj } from '@storybook/react'
import { StockLevelBadge } from './StockLevelBadge'

const meta: Meta<typeof StockLevelBadge> = {
  title: 'Common/StockLevelBadge',
  component: StockLevelBadge,
  tags: ['autodocs'],
  argTypes: {
    quantity: { control: 'number' },
    minStockLevel: { control: 'number' },
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof StockLevelBadge>

export const InStock: Story = {
  args: {
    quantity: 45,
    minStockLevel: 10,
  },
}

export const LowStockWarning: Story = {
  args: {
    quantity: 4,
    minStockLevel: 10,
  },
}

export const OutOfStock: Story = {
  args: {
    quantity: 0,
    minStockLevel: 10,
  },
}
